# Veltrix Windows & Doors — website

Marketing website for **Veltrix Windows & Doors** (veltrixwindowsdoor.co.uk): uPVC windows and doors supply, installation and repairs in the UK.

- **48 static pages**: home, 7 window and 6 door product pages, 8 repair categories, 4 services, quote builder, booking, contact, FAQ, 6 guides, guarantee, about, privacy, cookies, terms, accessibility and 404.
- **Website assistant (chatbot)**: a small window character in the corner says “Hello, I’m here to help” and opens the chat. It answers from the site’s own content, guides visitors through quote and repair requests, and hands over to WhatsApp. It runs fully in the browser, so there is no API key and no cost.
- **Visual quote configurator**: the visitor picks a window or door and types the width and height on the dimension lines of a live drawing. The drawing follows the size, colour, glass and hinge side. They add each item to a numbered schedule (W1, D1…), which they can edit, duplicate or remove, then press **Send for quote**, add their details and send. The schedule goes to WhatsApp as a short message with a reference number, plus a **PDF quote request with one page per item** (drawing, sizes and options) and the customer’s details. With the optional Google Drive upload (`scripts/google-drive/Code.gs`, DEPLOY.md step 8) the PDF goes to the business’s Drive, with an email copy, and the WhatsApp message carries a link to it, so the customer only presses Send. PDFs are removed from Drive automatically after 30 days.
- **WhatsApp booking and contact**: the booking and contact forms also compose a tidy message and open WhatsApp. Email is offered as an alternative.
- **SEO, set up for Google’s 2026 search and AI answers**: see [SEO](#seo) below.
- **Fast and private**: no frameworks, self-hosted fonts, no tracking cookies, security headers via `_headers`.
- **Checked**: valid HTML (html-validate), no broken internal links, axe-core accessibility checks (WCAG 2.2 AA rules), and no horizontal scroll at 390px wide.

👉 **Live at https://veltrixwindowsdoor.co.uk.** Hosting is free on Cloudflare (Workers static assets, `wrangler.jsonc`): every push to `claude/upvc-windows-doors-site-jj8slj` rebuilds and deploys the site in 1–2 minutes. Setup steps are in [DEPLOY.md](DEPLOY.md) (Roman Urdu).

## Project structure

```
src/data/site.json        ← business details: phone, WhatsApp, email, hours, areas, guarantees, company info
src/data/lastmod.json     ← last-modified date per page, updated by the build (commit it)
scripts/google-drive/     ← Google Apps Script that receives quote PDFs (paste into script.google.com)
src/content/products.mjs  ← windows & doors (each entry becomes a page)
src/content/repairs.mjs   ← repair categories and services
src/content/faqs.mjs      ← FAQs (also the chatbot’s knowledge)
src/content/guides.mjs    ← articles
src/content/models.mjs    ← standard models and layouts for each product (drawings, codes, sizes)
src/assets/               ← CSS, JS (main, forms, faq, assistant), fonts, images
src/static/               ← files copied to the site root (favicon)
lib/                      ← page templates, layout, SVG drawings, icons
build.mjs                 ← static build → dist/
scripts/                  ← link checker, icon/OG image generator
```

## Commands

Node 18+ is required. There are no npm dependencies.

```bash
node build.mjs            # build to dist/
npm run dev               # build and serve at http://localhost:4321
npm run check             # build and check every internal link
npm run images            # regenerate favicons and the social share image (needs Playwright)
```

## Before going live — checklist

All of these live in `src/data/site.json`:

- [ ] **WhatsApp and phone number.** This is currently +44 7411 496356, taken from the domain registration. Change it if the business number is different.
- [ ] **Email.** Set up `info@veltrixwindowsdoor.co.uk` with Cloudflare Email Routing (DEPLOY.md, step 6).
- [ ] **Area served.** Fill in `areaServed`, `serviceAreas`, `postcodePrefixes` and, if you want it shown, `address`.
- [ ] **Opening hours.**
- [ ] **Guarantee terms.** Defaults are 10 years on installations, insurance-backed, and 12 months on repairs. Change them to what you actually offer.
- [ ] **Company details.** Add legal name, company number, VAT number and ICO registration if applicable. Most UK businesses that handle customer data must pay the ICO data protection fee.
- [ ] **Accreditations.** Add FENSA, Certass and similar only if you are registered.
- [ ] **Testimonials and stats.** Only real ones. The section stays hidden while the list is empty.
- [ ] Social links and the Google reviews URL.
- [ ] Ask a solicitor to review the privacy policy and terms against your actual trading terms.

### Adding testimonials

```json
"testimonials": [
  { "name": "Sarah K.", "location": "Solihull", "job": "6 flush casement windows", "rating": 5, "text": "Fitted in a day, spotless clean-up…" }
]
```

### Adding headline stats (optional)

```json
"stats": [ { "value": "12 yrs", "label": "Fitting windows" }, { "value": "1,400+", "label": "Installations" } ]
```

## Models and layouts

Every product page has a **Models & layouts** section: the standard UK layouts or door designs for that product (169 in total), each with a drawing, a code such as `CW-05`, a short description, what it suits, a typical size and a **Quote this layout** button. The button opens the quote builder with that product and model already chosen. In the quote builder the customer can also pick a model from a list, choose "as drawn" or "opposite hand", and the model code and name go into the schedule, the WhatsApp message and the PDF.

All of it comes from one file, `src/content/models.mjs`:

- **Add a model:** copy an entry in the right product list, give it a new unique code (two letters, a dash, two digits) and edit the name, description, `bestFor`, `size` and `layout`.
- **Remove or reorder:** delete or move entries. The order in the file is the order on the website.
- **Popular tag:** `popular: true`. Keep it to one or two per product.
- **Groups:** a line like `{ group: 'Modern and contemporary designs' }` starts a group with that heading on the product page.
- **Glass designs:** Georgian bars, diamond lead and square lead are a separate choice in the quote builder, so they work with every model.
- **Drawing:** `layout` describes the drawing in a short code. The legend is at the top of the file. Examples: `L|T*1/F*2` is a side-hung opener beside a top-hung vent over a fixed light; `6/6` is a six-over-six sash; `3-1` is a four-panel bi-fold with three panels folding one way.

The build checks every model (unique codes, sensible sizes, a valid layout code) and stops with a clear message if something is wrong, so a typo never reaches the live site. The drawings on product pages are made at build time by the same engine the quote builder uses (`src/assets/js/draw.js`, run in Node by `lib/draw-node.mjs`), so they always match.

Names are generic UK trade descriptions. Only use a manufacturer's own model name if you sell that exact product.

## SEO

What Google said in 2026 shaped this setup. There were core updates in March and May 2026. AI Overviews and AI Mode now answer many searches directly. Google’s guidance is that these use the same signals as normal search, so no special file or trick is needed: the page must be indexable, answer the question clearly, and keep its structured data in line with what the page shows. FAQ rich results stopped showing in May 2026, but Google still reads FAQ markup to understand a page, so it stays.

### Built into the site

| What | Where |
|---|---|
| Titles of about 60 characters, a unique meta description and a canonical URL on every page | `lib/layout.mjs` (`pageTitle`), each page in `lib/pages.mjs` |
| `robots` meta: `index, follow, max-image-preview:large, max-snippet:-1` (404 is `noindex`) | `lib/layout.mjs` |
| **One connected JSON-LD `@graph` per page**: the business (`HomeAndConstructionBusiness` with hours, contact and an offer catalogue of every window, door and repair), `WebSite`, the typed web page (`WebPage`, `CollectionPage`, `AboutPage`, `ContactPage`), `BreadcrumbList`, and the page’s own `Service`, `FAQPage` or `Article`, all linked by `@id` | `schemaGraph()` in `lib/layout.mjs`, helpers at the top of `lib/pages.mjs` |
| FAQ markup built from the Q&As that are visible on the page (home, products, repairs, FAQ page) | `faqSchema()` in `lib/pages.mjs` |
| Answer-first content: product pages open with a plain definition, guides with a summary and an “In short” box | `src/content/*.mjs` |
| Guides show the publish or updated date and the author (“By the Veltrix Windows & Doors team”), with matching `article:*` meta | `guide()` in `lib/pages.mjs` |
| `sitemap.xml` with a real `lastmod` per page. A page keeps its date until its content changes. | `build.mjs`, `src/data/lastmod.json` |
| `robots.txt` allows all crawlers, AI search crawlers included | `build.mjs` |
| `llms.txt`: a plain summary of the business, pages and FAQs for AI assistants such as ChatGPT, Claude and Perplexity. Google does not use it. | `build.mjs` |
| Open Graph image and tags for link previews on WhatsApp and social media | `lib/layout.mjs`, `scripts/make-images.mjs` |
| Speed: static HTML, no frameworks, self-hosted fonts, long cache on assets | `build.mjs` (`_headers`) |

To give a guide a new date after editing it, add `updated: 'YYYY-MM-DD'` to it in `src/content/guides.mjs`.

### Off-site steps (these matter most for ranking)

- [ ] **Google Business Profile**: the right category, service area, hours and photos, and ask every customer for a real review. Local results and AI Overviews draw on it heavily.
- [ ] **Area and address in `site.json`** (`areaServed`, `serviceAreas`, `postcodePrefixes`, `address` or `company.registeredOffice`). While these are empty, nothing on the site tells Google where you work.
- [ ] **Google Search Console**: verify the domain and submit `sitemap.xml`.
- [ ] **Bing Webmaster Tools**: import from Search Console. ChatGPT search and Copilot use Bing’s index.
- [ ] **Cloudflare → Security → Bots**: if AI crawlers are blocked, allow them so AI assistants can read the site. This does not affect Googlebot. Turn on **Crawler Hints** under Caching.
- [ ] Put the Google reviews link in `social.googleReviews`. Never publish reviews that aren’t real: fake reviews are illegal in the UK.

## How the assistant works

`build.mjs` writes `dist/assets/data/kb.json` from the FAQs, repairs, products, services, guides and business details. `src/assets/js/assistant.js` matches a visitor’s question against it with keyword and phrase matching weighted by IDF. The matcher understands synonyms, small typos and a few Roman Urdu words (qeemat, khidki, darwaza).

It also handles service hours and WhatsApp/chat reply hours (in UK time), postcode coverage and contact details. Guided flows collect quote and repair details and open WhatsApp with the message already written. If it isn’t confident, it says so and offers WhatsApp instead of guessing.

To teach it something new, add a FAQ with good keywords (`k`) in `src/content/faqs.mjs`.
