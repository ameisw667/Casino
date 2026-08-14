// Kills leftover `next dev`/`next build` processes from this project before starting a new dev server.
// Prevents "port already in use" and Turbopack cache corruption from orphaned background processes.
import { execSync } from 'child_process';

const projectMarker = 'Casino';
const currentPid = process.pid;

if (process.platform === 'win32') {
  const ps = `
    Get-CimInstance Win32_Process -Filter "name='node.exe'" |
      Where-Object { $_.CommandLine -like '*${projectMarker}*next*' -and $_.ProcessId -ne ${currentPid} -and $_.ProcessId -ne ${process.ppid} } |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  `.trim();
  try {
    execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"')}"`, { stdio: 'ignore' });
  } catch {
    // No stale processes found, or PowerShell unavailable - safe to ignore.
  }
} else {
  try {
    execSync(`pkill -f "${projectMarker}.*next dev" 2>/dev/null || true`, { stdio: 'ignore' });
  } catch {
    // No stale processes found - safe to ignore.
  }
}
