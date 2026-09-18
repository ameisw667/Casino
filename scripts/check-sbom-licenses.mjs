#!/usr/bin/env node
// docs/security-hardening/07_dependency_supply_chain_audit.md L3 (Runde 2) — the first real *use*
// of the CycloneDX SBOM beyond archiving it as a build artifact (L2, round 1). Scans the SBOM's
// per-component license declarations for copyleft/network-copyleft licenses (GPL/AGPL/LGPL/SSPL
// family) that would be a compliance risk to ship inside this closed-source commercial casino
// product. Informational only, same philosophy as every other visibility step in this workflow —
// a real disallowed-license hit needs Jan's legal/licensing call, not a silent CI block.

import { readFileSync, appendFileSync } from 'node:fs';

const sbomPath = process.argv[2] ?? 'sbom.json';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

const DISALLOWED_LICENSE_PATTERNS = [/^GPL-/i, /^AGPL-/i, /^LGPL-/i, /^SSPL-/i, /^CC-BY-SA-/i];

function isDisallowedLicense(licenseId) {
  return DISALLOWED_LICENSE_PATTERNS.some((pattern) => pattern.test(licenseId));
}

function findFlaggedComponents(sbom) {
  const flagged = [];
  for (const component of sbom.components ?? []) {
    for (const entry of component.licenses ?? []) {
      const licenseId = entry.license?.id ?? entry.license?.name;
      if (licenseId && isDisallowedLicense(licenseId)) {
        flagged.push({ name: component.name, version: component.version ?? '?', licenseId });
      }
    }
  }
  return flagged;
}

function buildSummaryLines(flagged) {
  const rows = flagged.map((c) => `| ${c.name}@${c.version} | ${c.licenseId} |`);
  return [
    '',
    '## SBOM license scan (informational — copyleft/compliance risk)',
    '',
    '| Component | License |',
    '| --- | --- |',
    ...(rows.length ? rows : ['| — | none flagged |']),
  ];
}

let sbom;
try {
  sbom = JSON.parse(readFileSync(sbomPath, 'utf8'));
} catch (error) {
  console.error(`check-sbom-licenses: could not read ${sbomPath}: ${error.message}`);
  process.exit(0);
}

const flagged = findFlaggedComponents(sbom);
const lines = buildSummaryLines(flagged);

if (summaryPath) {
  appendFileSync(summaryPath, lines.join('\n') + '\n');
} else {
  console.log(lines.join('\n'));
}
