import fs from 'fs';
import path from 'path';
import {
  parseSecurityTxtExpiry,
  computeExpiryStatus,
} from '../src/lib/security/security-txt-expiry';

const WARN_WITHIN_DAYS = 60;

function main() {
  const filePath = path.resolve(process.cwd(), 'public/.well-known/security.txt');
  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const expires = parseSecurityTxtExpiry(content);
  const result = computeExpiryStatus(expires, new Date(), WARN_WITHIN_DAYS);

  console.log('========================================================');
  console.log('🔏 SECURITY.TXT EXPIRY CHECK (informational, not a CI gate)');
  console.log('========================================================');

  switch (result.status) {
    case 'missing':
      console.warn('⚠️  Kein gültiges `Expires`-Feld in public/.well-known/security.txt gefunden.');
      break;
    case 'expired':
      console.warn(
        `⚠️  security.txt ist seit ${Math.abs(result.daysRemaining ?? 0)} Tagen abgelaufen (RFC 9116: ungültig).`,
      );
      break;
    case 'warning':
      console.warn(
        `⚠️  security.txt läuft in ${result.daysRemaining} Tagen ab (Warnschwelle: ${WARN_WITHIN_DAYS} Tage) — neues \`Expires\`-Datum setzen.`,
      );
      break;
    case 'ok':
      console.log(`✅ security.txt läuft erst in ${result.daysRemaining} Tagen ab.`);
      break;
  }
  console.log('========================================================');

  if (result.status === 'missing' || result.status === 'expired' || result.status === 'warning') {
    process.exit(1);
  }
  process.exit(0);
}

main();
