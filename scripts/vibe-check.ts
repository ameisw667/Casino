import fs from 'fs';
import path from 'path';

/**
 * ⚡ Vibe Check Script
 * Scans the codebase for "premium" aesthetic violations.
 */

const CONFIG = {
  SEARCH_DIR: './src',
  FORBIDDEN_PATTERNS: [
    { name: 'Generic Red', regex: /color: ['"]red['"]/i },
    { name: 'Generic Blue', regex: /color: ['"]blue['"]/i },
    { name: 'Inline Shadow', regex: /boxShadow: ['"]0 0 10px rgba/i }, // Use design tokens instead
  ],
  MANDATORY_VIBES: [
    { name: 'HSL Tokens', regex: /hsla?\(var\(--/i },
    { name: 'Glassmorphism', regex: /(backdropFilter: ['"]blur|className=['"]glass(-card)?['"])/i },
    { name: 'Responsive clamp', regex: /clamp\(/i }
  ]
};

function vibeCheck(dir: string) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      vibeCheck(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      console.log(`🔍 Checking vibe for: ${file}`);

      CONFIG.FORBIDDEN_PATTERNS.forEach(pattern => {
        if (pattern.regex.test(content)) {
          console.warn(`🚨 [VIBE KILLER] ${pattern.name} found in ${file}`);
        }
      });

      CONFIG.MANDATORY_VIBES.forEach(vibe => {
        if (!vibe.regex.test(content) && file.includes('page.tsx')) {
          console.warn(`💎 [PREMIUM MISSING] ${vibe.name} not found in: ${fullPath}`);
        }
      });
    }
  });
}

console.log('🚀 Starting Holistic Vibe Check...');
vibeCheck(CONFIG.SEARCH_DIR);
console.log('✅ Vibe Check Complete.');
