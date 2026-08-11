# مسيرة السيدة — QR Code Site

A mobile-first React page meant to be opened by scanning a QR code, plus a
matching PDF. All of the visible text lives in one file.

Content: the rosary booklet **على خطى مريم نسير معاً** (الجمعة 14 آب 2026) —
opening prayer, the rosary prayers, the twenty mysteries (الفرح، النور،
الحزن، المجد), and the closing prayers. Arabic, right-to-left.

Status: **content loaded, site and PDF built, ready to deploy.**

---

## 1. The one file you edit

```txt
src/content/pageContent.js
```

That file holds the language direction, title, subtitle, every section of the
document, the contents list, the footer and the PDF link. Edit the strings,
save, and the page updates. Nothing else needs to change.

Its shape:

```js
sections: [
  {
    heading: 'أسرار الفرح',      // large section heading
    body: [ 'paragraph', ... ],   // its own paragraphs
    items: [                      // optional sub-parts — the mysteries
      { heading: 'السر الأول...', body: [ 'paragraph', ... ] },
    ],
  },
]
```

To add a mystery, copy one `{ heading, body }` block inside `items`. To add a
whole section, copy one of the outer blocks. To hide something (subtitle,
footer, contents list, updated date), set it to `''` or `false`.

After any change, regenerate the PDF so the download matches:

```bash
npm run pdf
```

### Arabic text

The page is in Arabic right-to-left mode, set by two lines at the top of
`src/content/pageContent.js`:

```js
lang: 'ar',
dir: 'rtl',
```

(For an English document these become `'en'` and `'ltr'`.) In Arabic mode the
page:

- flips the entire layout right-to-left,
- selects the Arabic system fonts already installed on the reader's phone
  (Segoe UI Arabic on Windows, Geeza Pro on iOS, Noto Naskh on Android) — no
  font downloads, so the page stays fast,
- increases the text size and line height, because Arabic script reads smaller
  than Latin at the same nominal size and needs more room for diacritics,
- removes the tight letter-spacing, which would otherwise pull joined Arabic
  letterforms into each other.

Mixed Arabic and English inside one paragraph works in either mode — the
browser handles the bidirectional runs. `index.html` carries `lang="ar"
dir="rtl"` as well, so the direction is right from the first frame.

---

## 2. Run it locally

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

To check it on your actual phone, make sure the phone is on the same Wi-Fi and
open the "Network" address that `npm run dev` prints (something like
`http://192.168.x.x:5173`).

Production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 3. Project structure

```txt
index.html                 page shell, <title> and meta description
src/
  main.jsx                 React entry point
  App.jsx
  pages/
    Home.jsx               assembles the page from the content file
  components/
    Layout.jsx             centered reading column
    Header.jsx             logo / title / subtitle
    TableOfContents.jsx    jump links to each section
    ContentSection.jsx     a section, its paragraphs, and its sub-parts
    Footer.jsx             small print (hides itself when empty)
  content/
    pageContent.js         >>> EDIT THIS <<<
  assets/
    logo.png               logo shown above the title
  styles/
    globals.css            all styling, mobile-first
public/
  document.pdf             generated PDF, served at /document.pdf
scripts/
  generate-qr.mjs          QR code generator (PNG + SVG)
  generate-pdf.mjs         PDF generator (uses your installed Edge/Chrome)
```

---

## 4. Responsive behaviour

Sizing is **fluid**, not stepped — type, spacing and page padding scale
continuously with the viewport using `clamp()`, so there is no jump at a
breakpoint and every in-between width works (small phones, large phones,
folded devices, split-screen, tablets, laptops, 4K).

Measured on the real page, in Arabic mode (Latin mode is ~2px smaller
throughout — see the Arabic section above for why):

| Width   | Text | Title | Reading column           |
| ------- | ---- | ----- | ------------------------ |
| 320px   | 19px | 30px  | full width, 18px gutters |
| 390px   | 19px | 30px  | full width               |
| 768px   | 20px | 37px  | 672px, centered          |
| 1024px  | 20px | 40px  | 672px, centered          |
| 1280px+ | 21px | 42px  | 672px, centered          |

No horizontal scrolling at any width. The column stops growing at 42rem
(672px) on purpose: a line of text longer than roughly 70 characters is
tiring to read, so on a wide monitor the extra space becomes margin rather
than longer lines.

Also handled: landscape phones (vertical padding shrinks so content is
visible without scrolling), iPhone notch insets, dark mode, hover states only
on devices with a mouse, and `prefers-reduced-motion`.

To test on a real phone, run `npm run dev` and open the `Network:` address it
prints from a phone on the same Wi-Fi.

---

## 5. Publish it

### GitHub Pages (set up and ready)

`.github/workflows/deploy.yml` builds and publishes the site on every push to
`main`, so publishing an update is just: edit the text, commit, push.

One-time setup:

1. Create an empty repository on GitHub — **public**, since GitHub Pages on a
   free account only serves public repositories. Do not add a README or a
   `.gitignore`; this folder already has both.
2. Connect and push:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
```

```bash
git push -u origin main
```

3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub
   Actions**. That is the only click needed; the workflow does the rest.
4. Watch the **Actions** tab. When it finishes, the URL appears there and
   under Settings → Pages. It looks like
   `https://<your-username>.github.io/<your-repo>/` — **that is the URL for
   the QR code.**

The build reads the repository name automatically (`BASE_PATH` in the
workflow), so the asset paths and the PDF link stay correct even if the repo
is renamed later.

To publish a change afterwards:

```bash
git add -A && git commit -m "Update text" && git push
```

### Alternative — Vercel

No repository needed and it gives a shorter URL:

```bash
npx vercel login
```

```bash
npx vercel --prod
```

Accept the defaults (framework: Vite, output: `dist`). Nothing in the project
needs changing — the base path only applies when `BASE_PATH` is set, which
only the Pages workflow does.

### Alternative — Netlify or Cloudflare Pages

Build command `npm run build`, publish directory `dist`. Either import the
GitHub repository at app.netlify.com / dash.cloudflare.com, or upload
directly with `npx netlify deploy --prod --dir=dist` after a build.

### Two rules that matter for the QR code

1. **Use the production URL, not a preview URL.** Vercel and Netlify also
   print per-deploy preview URLs (with a hash in them) — those change every
   time you deploy and will break the QR code. The GitHub Pages URL has no
   such problem: it is stable as long as the repository keeps its name.
2. **A custom domain is the safest target.** If you point the QR code at your
   own domain, you can move hosts or rebuild the site later without ever
   reprinting the code. Add it under the host's Domains settings before
   generating the QR.

---

## 6. Generate the QR code

Only after the final public URL exists:

```bash
npm run qr -- https://your-final-url.example
```

This writes:

- `qr/qr-code.png` — 1024px, for print and general use
- `qr/qr-code.svg` — vector, scales to any size without blurring

Before distributing:

- Scan it with an iPhone camera app.
- Scan it with an Android camera app.
- If printing, print a test copy at the real size and scan that. Keep the
  white margin around the code — scanners need that quiet zone.
- Do not print smaller than about 2 cm x 2 cm, and keep it larger if it will
  be scanned from a distance (posters).

The `qr/` folder is gitignored, so regenerate as needed.

---

## 7. PDF version

The PDF is generated from the same content file as the website, so the two can
never drift apart:

```bash
npm run pdf
```

That builds the site, renders it, and writes **`public/document.pdf`**
(A4, for printing and desktop reading).

For a phone-shaped PDF — 95 x 165 mm pages, so it reads at full size on a
handset with no zooming or panning:

```bash
npm run pdf -- --mobile
```

Both write to the same file, so the last one you run is the one that ships.

### How it works

It drives the copy of Edge or Chrome already installed on your machine in
headless mode — no extra npm packages, nothing to download. If it cannot find
a browser, point it at one:

```bash
PDF_BROWSER="C:/Program Files/Google/Chrome/Application/chrome.exe" npm run pdf
```

The print styling lives in the `@media print` block at the bottom of
`src/styles/globals.css`: black on white, 12pt body text, proper page margins,
no browser header/footer, and sections kept whole rather than split across a
page break. Arabic gets a slightly larger size and looser leading there too.

You can always fall back to opening the site and pressing Ctrl+P >
"Save as PDF" — the same print styles apply.

### The download button

`src/content/pageContent.js` already has `pdfUrl: '/document.pdf'`, so a
download button appears at the bottom of the website and the file is served
from `https://your-site/document.pdf`. Set `pdfUrl: ''` to hide it.

**The PDF is a snapshot.** After editing the text, re-run `npm run pdf`,
otherwise the download still contains the old wording.

### Should the QR code point at the PDF instead?

Not recommended. A PDF URL means every content change needs the file
regenerated and re-uploaded, and PDFs are clumsier to read on a phone. The
website URL can stay fixed forever, with the PDF offered as a download from
it — which is how this project is set up.

---

## 8. Checklist for launch day

- [x] Final text in `src/content/pageContent.js`
- [x] Arabic right-to-left mode on, in both the content file and `index.html`
- [x] Title and meta description in `index.html` match the document
- [x] PDF generated from the final text
- [ ] Hymn names filled in for the twelve mysteries that still show `(ترتيلة:....)`
- [ ] Footer decided (currently empty — e.g. the parish or group name)
- [ ] Checked on a real phone
- [ ] `npm run pdf` re-run if anything above changed
- [ ] Deployed, production URL confirmed public (open it in a private window —
      it must load with no login)
- [ ] QR code generated from that exact URL
- [ ] QR code scanned from an iPhone and an Android phone
