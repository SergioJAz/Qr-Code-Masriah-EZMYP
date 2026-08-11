# مسيرة السيدة — QR Code Site

Mobile-first Arabic page + matching PDF, meant to be opened by scanning a QR
code. Content: the rosary booklet **على خطى مريم نسير معاً** (الجمعة 14 آب 2026).

---

## Edit the text

Everything on the page comes from one file:

```txt
src/content/pageContent.js
```

Its shape:

```js
sections: [
  {
    heading: 'أسرار الفرح',       // section heading
    body: [ 'paragraph', ... ],   // its paragraphs
    items: [                      // optional sub-parts — the mysteries
      { heading: 'السر الأول...', body: [ 'paragraph', ... ] },
    ],
  },
]
```

Copy a `{ heading, body }` block to add a mystery, or an outer block to add a
section. Set any field to `''` or `false` to hide it.

Arabic right-to-left comes from `lang: 'ar'` + `dir: 'rtl'` at the top of the
same file (`'en'` + `'ltr'` for English).

After any change, regenerate the PDF:

```bash
npm run pdf
```

---

## Run it

```bash
npm install
```

```bash
npm run dev
```

Opens on http://localhost:5173. To check it on a phone, use the `Network:`
address it prints, from a phone on the same Wi-Fi.

---

## Publish

Hosted on Vercel. First time:

```bash
npx vercel login
```

```bash
npx vercel --prod
```

Accept the detected settings (Vite / `npm run build` / `dist`). When it asks
for a project name, give it `masirat-el-saydeh` — that becomes the URL.

Publishing a change afterwards is the same command:

```bash
npx vercel --prod
```

The URL stays the same every time, so the QR code keeps working.

### Custom domain

Add it under the Vercel project's **Settings → Domains** and follow the DNS
instructions. Nothing in the project needs changing — the build already
assumes it is served from the root.

---

## QR code

Only once the final public URL exists:

```bash
npm run qr -- https://your-final-url.example
```

Writes `qr/qr-code.png` (1024px, for print) and `qr/qr-code.svg` (vector).

Before distributing: scan it from an iPhone and an Android. If printing, test
a copy at real size, keep the white margin, and don't go below ~2cm.

---

## PDF

```bash
npm run pdf
```

Builds the site, renders it, writes `public/document.pdf` (A4, 17 pages). The
download button at the top of the page links to it.

Phone-shaped pages instead (95 × 165 mm, no zooming needed):

```bash
npm run pdf -- --mobile
```

Both write to the same file. It drives the Edge or Chrome already installed on
the machine — no extra packages. If it can't find one:

```bash
PDF_BROWSER="C:/Program Files/Google/Chrome/Application/chrome.exe" npm run pdf
```

Print styling is the `@media print` block at the end of `src/styles/globals.css`.

---

## Project structure

```txt
index.html                 page shell, <title> and meta description
src/
  pages/Home.jsx           assembles the page
  components/              Layout, Header, TableOfContents, ContentSection, Footer
  content/pageContent.js   >>> EDIT THIS <<<
  assets/logo.png          logo above the title
  styles/globals.css       all styling, mobile-first
public/document.pdf        generated PDF
scripts/generate-qr.mjs    QR generator
scripts/generate-pdf.mjs   PDF generator
```

---

## Before launch

- [x] Final text in `src/content/pageContent.js`
- [x] Arabic right-to-left mode on
- [x] PDF generated from the final text
- [ ] Hymn names for the twelve mysteries still showing `(ترتيلة:....)`
- [ ] Footer decided (currently empty)
- [ ] Checked on a real phone
- [ ] Deployed; URL opens with no login in a private window
- [ ] QR generated from that exact URL and scanned on iPhone + Android
