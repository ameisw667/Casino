// HTTP-Reverse-Proxy mit 4 Fault-Modi, nur Node-Bordmittel (http/https), keine neue
// Dependency. Details/Begründung: worldmap/05_1.10 Resilience Chaos Testing.md Abschnitt 3.
//
// Modi:
//   pass   - Request 1:1 an den echten Upstream weiterreichen (Kontrollgruppe).
//   hang   - Verbindung annehmen, nie beantworten.
//   reset  - Socket sofort hart zerstören.
//   502/504- Sofort selbst mit dem Fehlercode antworten, Upstream nie kontaktieren.

import http from 'http';
import https from 'https';
import { URL } from 'url';

// N3: Allowlist-Logging — technisch ist nur dieses Shape erreichbar, nie Header/Body/Cookies.
function logRequest({ method, path, status, durationMs }) {
  console.log(`[fault-proxy] ${method} ${path} -> ${status} (${durationMs}ms)`);
}

/**
 * Startet den Proxy und löst erst auf, sobald er tatsächlich lauscht — dient
 * gleichzeitig als Bereitschaftsprüfung (Plan Abschnitt 3.3: Proxy muss vor dem
 * isolierten next-Prozess bereitstehen).
 * @param {{ port: number, upstreamOrigin: string, getMode: () => 'pass'|'hang'|'reset'|'502'|'504' }} opts
 * @returns {Promise<{ server: http.Server, close: () => Promise<void> }>}
 */
export function createFaultProxy({ port, upstreamOrigin, getMode }) {
  const upstream = new URL(upstreamOrigin);
  const upstreamClient = upstream.protocol === 'https:' ? https : http;
  const defaultPort = upstream.protocol === 'https:' ? 443 : 80;

  const server = http.createServer((req, res) => {
    const startedAt = Date.now();
    const mode = getMode();

    if (mode === 'reset') {
      req.socket.destroy();
      logRequest({
        method: req.method,
        path: req.url,
        status: 'RESET',
        durationMs: Date.now() - startedAt,
      });
      return;
    }

    if (mode === 'hang') {
      // Verbindung bewusst offen lassen, nie antworten. Kein Timeout hier gesetzt —
      // genau das ist der zu testende Fall (siehe Plan Abschnitt 2/4.2).
      logRequest({
        method: req.method,
        path: req.url,
        status: 'HANG',
        durationMs: Date.now() - startedAt,
      });
      return;
    }

    if (mode === '502' || mode === '504') {
      const status = mode === '502' ? 502 : 504;
      res.writeHead(status, { 'Content-Type': 'text/plain' });
      res.end('Chaos-Proxy: simulierter Upstream-Fehler');
      logRequest({ method: req.method, path: req.url, status, durationMs: Date.now() - startedAt });
      return;
    }

    // pass: 1:1 an den echten Upstream weiterreichen. host-Header wird auf den
    // Ziel-Origin überschrieben (TLS-SNI/virtuelles Hosting), kein manuelles
    // Content-Length — reines Pipe erledigt das korrekt (siehe Plan Abschnitt 3.1).
    const forwardHeaders = { ...req.headers, host: upstream.host };

    const proxyReq = upstreamClient.request(
      {
        hostname: upstream.hostname,
        port: upstream.port || defaultPort,
        path: req.url,
        method: req.method,
        headers: forwardHeaders,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
        proxyRes.pipe(res);
        proxyRes.on('end', () => {
          logRequest({
            method: req.method,
            path: req.url,
            status: proxyRes.statusCode,
            durationMs: Date.now() - startedAt,
          });
        });
      },
    );

    proxyReq.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Chaos-Proxy: Upstream nicht erreichbar');
      }
      logRequest({
        method: req.method,
        path: req.url,
        status: 'PROXY_ERROR',
        durationMs: Date.now() - startedAt,
      });
    });

    req.pipe(proxyReq);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    // N2: ausschließlich 127.0.0.1, nie 0.0.0.0.
    server.listen(port, '127.0.0.1', () => {
      resolve({
        server,
        close: () =>
          new Promise((res) => {
            server.closeAllConnections?.();
            server.close(() => res());
          }),
      });
    });
  });
}
