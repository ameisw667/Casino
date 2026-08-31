import { readFileSync } from 'node:fs';

const log = readFileSync(process.argv[2] || 'to07_tmp_utf8.log', 'utf8');
const text = log.slice(log.indexOf('=== TO07 RESULT ==='));
const start = text.indexOf('{');
const end = text.lastIndexOf('}') + 1;
const data = JSON.parse(text.slice(start, end));

const worstOf = (details) => parseFloat((details.match(/worst ([0-9.]+)px/) || [0, 0])[1]);

const hs = data.findings.filter((f) => f.type === 'horizontal-overflow');
const byVp = {};
const byRoute = {};
for (const f of hs) {
  byVp[f.viewport] = (byVp[f.viewport] || 0) + 1;
  byRoute[f.route] = (byRoute[f.route] || 0) + 1;
}
console.log('== horizontal-overflow by viewport ==');
for (const [k, v] of Object.entries(byVp)) console.log(`  ${k}: ${v}`);
console.log('== horizontal-overflow by route (count of affected viewports) ==');
for (const [k, v] of Object.entries(byRoute).sort((a, b) => b[1] - a[1]))
  console.log(`  ${k}: ${v}/6`);

const high = hs.filter((f) => f.severity === 'Hoch');
console.log(`\n== Hoch findings: ${high.length} ==`);
const topByOver = hs.slice().sort((a, b) => worstOf(b.details) - worstOf(a.details));
for (const f of topByOver.slice(0, 10)) {
  console.log(`--- ${f.viewport} ${f.route} [${f.severity}] worst=${worstOf(f.details)}px`);
  console.log(`    ${f.details.replace(/\n/g, ' ').slice(0, 320)}`);
}

const ov = data.findings.filter((f) => f.type === 'interactive-overlap');
console.log(`\n== interactive-overlap: ${ov.length} ==`);
for (const f of ov) {
  console.log(`--- ${f.viewport} ${f.route}`);
  console.log(`    ${f.details.replace(/\n/g, ' ').slice(0, 300)}`);
}

const tx = data.findings.filter((f) => f.type === 'text-overflow');
console.log(`\n== text-overflow: ${tx.length} ==`);
for (const f of tx) {
  console.log(`--- ${f.viewport} ${f.route} [${f.severity}]`);
  console.log(`    ${f.details.replace(/\n/g, ' ').slice(0, 300)}`);
}
