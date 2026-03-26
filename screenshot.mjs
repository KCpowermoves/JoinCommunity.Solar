import { createRequire } from 'module';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/kevin/Claudecode/node_modules/puppeteer');

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const dir = './temporary screenshots';
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

// Find next available index
const existing = existsSync(dir)
  ? readdirSync(dir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'))
  : [];
const indices = existing
  .map(f => parseInt(f.replace('screenshot-', '').replace(/(-[^.]+)?\.png$/, ''), 10))
  .filter(n => !isNaN(n));
const next = indices.length > 0 ? Math.max(...indices) + 1 : 1;

const filename = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;
const outPath = join(dir, filename);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0' });
// Scroll through the page to trigger IntersectionObserver animations naturally
const pageHeight = await page.evaluate(() => document.body.scrollHeight);
const step = 300;
for (let y = 0; y <= pageHeight; y += step) {
  await page.evaluate(pos => window.scrollTo(0, pos), y);
  await new Promise(r => setTimeout(r, 200));
}
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outPath}`);
