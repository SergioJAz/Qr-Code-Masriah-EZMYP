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

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.

One-time setup:

1. Create an empty **public** repo on GitHub (Pages is free only on public
   repos). No README, no `.gitignore` — this folder has both.
2. Connect and push:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
```

```bash
git push -u origin main
```

3. On GitHub: **Settings → Pages → Source: GitHub Actions**.
4. The URL appears in the **Actions** tab when the run finishes:
   `https://<your-username>.github.io/<your-repo>/`

Publishing a change afterwards:

```bash
git add -A && git commit -m "Update text" && git push
```

The repo name is read automatically at build time, so asset paths stay correct
if it is renamed.

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
