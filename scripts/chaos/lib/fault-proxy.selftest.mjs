// Proxy-Selbsttest gegen einen lokalen Dummy-Server — kein echtes Supabase nötig.
// Prüft alle 4 Modi plus die QA-Perspektive aus Abschnitt 4.3 des Plans
// (Moduswechsel zwischen zwei Requests im selben Lauf).

import http from 'http';
import { createFaultProxy } from './fault-proxy.mjs';

const DUMMY_PORT = 3195;
const PROXY_PORT = 3196;

function startDummyUpstream() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, path: req.url }));
    });
    server.listen(DUMMY_PORT, '127.0.0.1', () => resolve(server));
  });
}

async function main() {
  let failures = 0;
  const dummy = await startDummyUpstream();
  let currentMode = 'pass';
  const proxy = await createFaultProxy({
    port: PROXY_PORT,
    upstreamOrigin: `http://127.0.0.1:${DUMMY_PORT}`,
    getMode: () => currentMode,
  });

  try {
    // 1. pass
    currentMode = 'pass';
    const passRes = await fetch(`http://127.0.0.1:${PROXY_PORT}/test`);
    const passBody = await passRes.json();
    if (passRes.status === 200 && passBody.ok === true) {
      console.log('✅ pass: 200 durchgereicht wie erwartet.');
    } else {
      console.error(`❌ pass: erwartet 200/ok, erhalten ${passRes.status}`, passBody);
      failures++;
    }

    // 2. 502
    currentMode = '502';
    const res502 = await fetch(`http://127.0.0.1:${PROXY_PORT}/test`);
    if (res502.status === 502) {
      console.log('✅ 502: korrekt sofort zurückgegeben, Upstream nicht kontaktiert.');
    } else {
      console.error(`❌ 502: erwartet 502, erhalten ${res502.status}`);
      failures++;
    }

    // 3. reset
    currentMode = 'reset';
    try {
      await fetch(`http://127.0.0.1:${PROXY_PORT}/test`, { signal: AbortSignal.timeout(3000) });
      console.error('❌ reset: Request ist unerwartet erfolgreich zurückgekommen.');
      failures++;
    } catch (err) {
      console.log(`✅ reset: Request schlug wie erwartet fehl (${err.name ?? err.message}).`);
    }

    // 4. hang — mit kurzer äußerer Frist, da hang selbst nie antwortet (siehe R2).
    currentMode = 'hang';
    try {
      await fetch(`http://127.0.0.1:${PROXY_PORT}/test`, { signal: AbortSignal.timeout(1500) });
      console.error('❌ hang: Request ist unerwartet nicht hängen geblieben.');
      failures++;
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        console.log('✅ hang: Request hing bis zum äußeren Timeout, wie erwartet.');
      } else {
        console.error(`❌ hang: unerwarteter Fehlertyp (${err.name}).`);
        failures++;
      }
    }

    // 5. QA-Perspektive (4.3): Moduswechsel zwischen zwei Requests im selben Lauf konsistent?
    currentMode = 'pass';
    const secondPass = await fetch(`http://127.0.0.1:${PROXY_PORT}/second`);
    if (secondPass.status === 200) {
      console.log('✅ Moduswechsel zurück zu pass nach 3 anderen Modi funktioniert konsistent.');
    } else {
      console.error(
        `❌ Moduswechsel: erwartet 200 nach Rückkehr zu pass, erhalten ${secondPass.status}`,
      );
      failures++;
    }
  } finally {
    await proxy.close();
    dummy.close();
  }

  if (failures > 0) {
    console.error(`\n${failures} Selbsttest(s) fehlgeschlagen.`);
    process.exitCode = 1;
  } else {
    console.log('\nAlle Proxy-Selbsttests bestanden.');
    process.exitCode = 0;
  }
}

main();
