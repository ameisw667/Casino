// HTTP-Reverse-Proxy mit 5 Fault-Modi, nur Node-Bordmittel (http/https), keine neue
// Dependency. Details/Begründung: worldmap/05_1.10 Resilience Chaos Testing.md Abschnitt 3.
//
// Modi:
//   pass      - Request 1:1 an den echten Upstream weiterreichen (Kontrollgruppe).
//   hang      - Verbindung annehmen, nie beantworten.
//   reset     - Socket sofort hart zerstören.
//   502/504   - Sofort selbst mit dem Fehlercode antworten, Upstream nie kontaktieren.
//   transient - Einmaliger Verbindungs-Fault (reset-Semantik), aber NUR auf den ersten
//               POST-Request; alle weiteren Requests (und alle GETs) laufen in 'pass'.
//               Das ist die deterministische Umgebung für den L6-Retry (Säule 8): die
//               Geld-RPCs laufen als POST über supabase-js, der Retry greift genau dort.

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
 * @param {{ port: number, upstreamOrigin: string, getMode: () => 'pass'|'hang'|'reset'|'502'|'504'|'transient', allowedUpstreamHosts?: string[] }} opts
 * @returns {Promise<{ server: http.Server, close: () => Promise<void> }>}
 */
export function createFaultProxy({ port, upstreamOrigin, getMode, allowedUpstreamHosts }) {
  const upstream = new URL(upstreamOrigin);
  // Security-Review-Fix (LOW, Defense-in-Depth): ein Caller kann den Proxy an einen
  // festen Host-Lock koppeln (run-fault-test.mjs nutzt das im Loopback-Override-Modus).
  // Ohne Lock bleibt das Proxying echter Remote-Upstreams legitim (Modus 'pass' ist
  // die Grundfunktion) — der Lock ist also bewusst opt-in, nicht global.
  if (allowedUpstreamHosts && !allowedUpstreamHosts.includes(upstream.hostname)) {
    throw new Error(
      `Upstream-Host "${upstream.hostname}" verletzt den allowedUpstreamHosts-Lock ` +
        `[${allowedUpstreamHosts.join(', ')}].`,
    );
  }
  const upstreamClient = upstream.protocol === 'https:' ? https : http;
  const defaultPort = upstream.protocol === 'https:' ? 443 : 80;

  // transient: der einmalige Fault ist pro Proxy-Instanz "abgefeuert" — danach pass.
  let transientArmed = true;

  const server = http.createServer((req, res) => {
    const startedAt = Date.now();
    let mode = getMode();
    if (mode === 'transient') {
      if (req.method === 'POST' && transientArmed) {
        transientArmed = false;
        mode = 'reset';
      } else {
        mode = 'pass';
      }
    }

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
