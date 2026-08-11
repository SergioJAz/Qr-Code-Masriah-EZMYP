/**
 * Turns the built site into a PDF.
 *
 *   npm run pdf              A4 — for printing and desktop reading
 *   npm run pdf -- --mobile  phone-shaped pages — no zooming needed
 *
 * Writes to public/document.pdf (and copies it into dist/ if a build exists),
 * so setting `pdfUrl: '/document.pdf'` in src/content/pageContent.js puts a
 * download button on the website.
 *
 * No extra npm packages: this drives the copy of Edge or Chrome already
 * installed on the machine, in headless mode. Set the PDF_BROWSER environment
 * variable to point at a specific browser executable if auto-detection fails.
 *
 * Re-run it whenever the text in pageContent.js changes.
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, copyFile, mkdir, stat, rm } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const mobile = process.argv.includes('--mobile');
const distDir = path.resolve('dist');
const outFile = path.resolve('public', 'document.pdf');

if (!existsSync(distDir)) {
  console.error('No dist/ folder found. Run `npm run build` first.');
  process.exit(1);
}

// --- 1. Find a browser ------------------------------------------------------

const localAppData = process.env.LOCALAPPDATA || '';

const candidates = [
  process.env.PDF_BROWSER,
  // Windows
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  localAppData && path.join(localAppData, 'Google/Chrome/Application/chrome.exe'),
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
].filter(Boolean);

/**
 * Recent Edge builds install to ...\EdgeCore\<version>\msedge.exe instead of
 * the classic Application folder, so those roots need a version lookup.
 */
function newestVersionedExe(root, exe) {
  if (!existsSync(root)) return null;

  const versions = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+\./.test(entry.name))
    .map((entry) => entry.name)
    // Numeric comparison per segment: "151.0.4129.9" must sort below ".59".
    .sort((a, b) => {
      const as = a.split('.').map(Number);
      const bs = b.split('.').map(Number);
      for (let i = 0; i < Math.max(as.length, bs.length); i += 1) {
        if ((bs[i] || 0) !== (as[i] || 0)) return (bs[i] || 0) - (as[i] || 0);
      }
      return 0;
    });

  for (const version of versions) {
    const full = path.join(root, version, exe);
    if (existsSync(full)) return full;
  }
  return null;
}

const versionedRoots = [
  ['C:/Program Files (x86)/Microsoft/EdgeCore', 'msedge.exe'],
  ['C:/Program Files/Microsoft/EdgeCore', 'msedge.exe'],
  localAppData && [path.join(localAppData, 'Microsoft/EdgeCore'), 'msedge.exe'],
].filter(Boolean);

const browser =
  candidates.find((candidate) => existsSync(candidate)) ||
  versionedRoots.map(([root, exe]) => newestVersionedExe(root, exe)).find(Boolean);

if (!browser) {
  console.error('Could not find Edge or Chrome.');
  console.error('Set PDF_BROWSER to the browser executable, for example:');
  console.error('  PDF_BROWSER="C:/Program Files/Google/Chrome/Application/chrome.exe" npm run pdf');
  console.error('\nOr just open the site in a browser and use Ctrl+P > "Save as PDF".');
  process.exit(1);
}

// --- 2. Serve dist/ ---------------------------------------------------------

// A phone-shaped page: 95mm wide is about the readable width of a handset,
// so the reader never has to zoom or pan. Injected only for --mobile.
const mobilePageCss = `
<style>
  @media print {
    @page { size: 95mm 165mm; margin: 9mm 8mm; }
    :root {
      --font-size-body: 11pt;
      --font-size-title: 17pt;
      --font-size-heading: 12.5pt;
      --font-size-small: 9pt;
    }
    [dir='rtl'] {
      --font-size-body: 12pt;
      --font-size-title: 18pt;
      --font-size-heading: 13.5pt;
      --font-size-small: 10pt;
    }
    .header { margin-bottom: 6mm; padding-bottom: 4mm; }
    .section + .section { margin-top: 5mm; }
    /* Short pages: allowing a break inside a section beats leaving half a
       page blank whenever a section is taller than the page itself. */
    .section { break-inside: auto; }
  }
</style>`;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const isIndex = urlPath === '/' || urlPath === '/index.html';
    const filePath = isIndex ? path.join(distDir, 'index.html') : path.join(distDir, urlPath);

    // Never serve outside dist/.
    if (!filePath.startsWith(distDir)) {
      res.writeHead(403).end();
      return;
    }

    let body = await readFile(filePath);

    if (isIndex && mobile) {
      body = Buffer.from(body.toString('utf8').replace('</head>', `${mobilePageCss}</head>`));
    }

    res.writeHead(200, { 'content-type': types[path.extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();

// --- 3. Print ---------------------------------------------------------------

await mkdir(path.dirname(outFile), { recursive: true });
const profileDir = path.join(tmpdir(), `qr-pdf-profile-${process.pid}`);

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${profileDir}`,
  '--run-all-compositor-stages-before-draw',
  '--virtual-time-budget=8000', // let React render before the snapshot
  '--no-pdf-header-footer', // drop the browser's date/URL furniture
  `--print-to-pdf=${outFile}`,
  `http://127.0.0.1:${port}/`,
];

const exitCode = await new Promise((resolve) => {
  const child = spawn(browser, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', (chunk) => (stderr += chunk));
  child.on('close', (code) => {
    if (code !== 0) console.error(stderr.trim());
    resolve(code);
  });
});

server.close();
await rm(profileDir, { recursive: true, force: true });

if (exitCode !== 0 || !existsSync(outFile)) {
  console.error(`\nPDF generation failed (browser exit code ${exitCode}).`);
  console.error('Fallback: open the site and use Ctrl+P > "Save as PDF".');
  process.exit(1);
}

// --- 4. Report --------------------------------------------------------------

const { size } = await stat(outFile);

// Keep the served copy in sync so the download link works without a rebuild.
if (existsSync(distDir)) {
  await copyFile(outFile, path.join(distDir, 'document.pdf'));
}

console.log(`Browser: ${browser}`);
console.log(`Format:  ${mobile ? 'mobile (95 x 165 mm)' : 'A4'}`);
console.log(`Written: ${outFile} (${Math.round(size / 1024)} kB)`);
console.log('\nTo offer it as a download on the site, set this in src/content/pageContent.js:');
console.log("  pdfUrl: '/document.pdf'");
