import puppeteer from 'puppeteer';
import { mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const section = process.argv[3] || 'prices';
const label = process.argv[4] || section;
const width = parseInt(process.argv[5]) || 1440;

const dir = join(__dirname, 'temporary screenshots');
mkdirSync(dir, { recursive: true });
const existing = readdirSync(dir).filter(f => f.startsWith('screenshot-')).length;
const filename = `screenshot-${existing + 1}-${label}.png`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

await page.evaluate(async () => {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y);
    await delay(80);
  }
  await delay(300);
});

const el = await page.$(`#${section}`);
if (el) {
  await el.screenshot({ path: join(dir, filename) });
} else {
  await page.screenshot({ path: join(dir, filename) });
}
await browser.close();
console.log(`Saved: ${join(dir, filename)}`);
