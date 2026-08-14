import fs from 'fs';

const report = JSON.parse(fs.readFileSync('eslint_report.json', 'utf16le').replace(/^\uFEFF/, ''));
let totalErrors = 0;
let totalWarnings = 0;

report.forEach((file) => {
  if (file.errorCount > 0 || file.warningCount > 0) {
    console.log(`\n${file.filePath}`);
    file.messages.forEach((msg) => {
      console.log(
        `  Line ${msg.line}: ${msg.severity === 2 ? 'ERROR' : 'WARNING'} - ${msg.message} (${msg.ruleId})`,
      );
    });
    totalErrors += file.errorCount;
    totalWarnings += file.warningCount;
  }
});
console.log(`\nTotal Errors: ${totalErrors}`);
console.log(`Total Warnings: ${totalWarnings}`);
