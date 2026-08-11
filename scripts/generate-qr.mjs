/**
 * Generates a QR code as PNG (print-quality) and SVG (infinitely scalable).
 *
 *   npm run qr -- https://your-final-url.example
 *
 * Output goes to ./qr/qr-code.png and ./qr/qr-code.svg
 *
 * Only run this once you know the FINAL public URL — the QR code is tied to
 * whatever URL you pass in here.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';

const url = process.argv[2];

if (!url) {
  console.error('Usage: npm run qr -- https://your-final-url.example');
  process.exit(1);
}

try {
  // Fails fast on typos like "myurl.com" with no protocol.
  const parsed = new URL(url);
  if (!/^https?:$/.test(parsed.protocol)) {
    throw new Error('URL must start with http:// or https://');
  }
} catch (error) {
  console.error(`Invalid URL: ${url}`);
  console.error(error.message);
  process.exit(1);
}

const outDir = path.resolve('qr');
await mkdir(outDir, { recursive: true });

const options = {
  // 'M' recovers from ~15% damage — a good balance of robustness and density.
  errorCorrectionLevel: 'M',
  margin: 2, // Quiet zone. Scanners need it; do not crop this off.
  color: { dark: '#000000', light: '#ffffff' },
};

const pngPath = path.join(outDir, 'qr-code.png');
const svgPath = path.join(outDir, 'qr-code.svg');

// 1024px is large enough to print sharply at roughly 8-9 cm.
await QRCode.toFile(pngPath, url, { ...options, type: 'png', width: 1024 });

const svg = await QRCode.toString(url, { ...options, type: 'svg' });
await writeFile(svgPath, svg, 'utf8');

console.log(`Encoded: ${url}`);
console.log(`PNG: ${pngPath}`);
console.log(`SVG: ${svgPath}`);
console.log('\nScan both from an iPhone and an Android phone before distributing.');
