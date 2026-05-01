/**
 * EFF-07: Bundle Size Budget Enforcement.
 * Checks the size of the production build and fails if budgets are exceeded.
 */
import fs from 'fs';
import path from 'path';

const BUDGET_KB = 150;
const BUILD_DIR = path.join(process.cwd(), '.next/static/chunks');

function checkSize() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.warn('⚠️ Build directory not found. Run "npm run build" first.');
    return;
  }

  const files = fs.readdirSync(BUILD_DIR);
  const mainBundle = files.find(f => f.startsWith('main-') && f.endsWith('.js'));

  if (mainBundle) {
    const stats = fs.statSync(path.join(BUILD_DIR, mainBundle));
    const sizeKB = stats.size / 1024;

    if (sizeKB > BUDGET_KB) {
      console.error(`❌ Bundle Size Violation: main bundle is ${sizeKB.toFixed(2)}KB (Limit: ${BUDGET_KB}KB)`);
      process.exit(1);
    }

    console.log(`✅ Bundle Size Pass: main bundle is ${sizeKB.toFixed(2)}KB`);
  }
}

checkSize();
