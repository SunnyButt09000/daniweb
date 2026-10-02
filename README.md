# Veltrix Windows & Doors — website

Marketing website for **Veltrix Windows & Doors** (veltrixwindowsdoor.co.uk): uPVC windows and doors supply, installation and repairs in the UK.

- **48 static pages**: home, 7 window and 6 door product pages, 8 repair categories, 4 services, quote builder, booking, contact, FAQ, 6 guides, guarantee, about, privacy, cookies, terms, accessibility and 404.
- **Website assistant (chatbot)**: answers from the site’s own content, guides visitors through quote and repair requests, and hands over to WhatsApp. It runs fully in the browser, so there is no API key and no cost.
- **Visual quote configurator**: the visitor picks a window or door and types the width and height on the dimension lines of a live drawing. The drawing follows the size, colour, glass and hinge side. They add each item to a numbered schedule (W1, D1…), which they can edit, duplicate or remove, then send it to WhatsApp as a professional message with a reference number. A PNG quote sheet with every drawing can be saved and attached.
- **WhatsApp booking and contact**: the booking and contact forms also compose a tidy message and open WhatsApp. Email is offered as an alternative.
- **SEO**: unique titles and descriptions, canonical URLs, Open Graph image, JSON-LD (LocalBusiness, Service, FAQPage, Article, BreadcrumbList), `sitemap.xml` and `robots.txt`.
- **Fast and private**: no frameworks, self-hosted fonts, no tracking cookies, security headers via `_headers`.
- **Checked**: valid HTML (html-validate), no broken internal links, axe-core accessibility checks (WCAG 2.2 AA rules), and no horizontal scroll at 390px wide.

👉 **To put the site live, follow [DEPLOY.md](DEPLOY.md)** (Hostinger domain + free Cloudflare Pages hosting, in Roman Urdu).

## Project structure

```
src/data/site.json        ← business details: phone, WhatsApp, email, hours, areas, guarantees, company info
src/content/products.mjs  ← windows & doors (each entry becomes a page)
src/content/repairs.mjs   ← repair categories and services
src/content/faqs.mjs      ← FAQs (also the chatbot’s knowledge)
src/content/guides.mjs    ← articles
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

## How the assistant works

`build.mjs` writes `dist/assets/data/kb.json` from the FAQs, repairs, products, services, guides and business details. `src/assets/js/assistant.js` matches a visitor’s question against it with keyword and phrase matching weighted by IDF. The matcher understands synonyms, small typos and a few Roman Urdu words (qeemat, khidki, darwaza).

It also handles opening hours (in UK time), postcode coverage and contact details. Guided flows collect quote and repair details and open WhatsApp with the message already written. If it isn’t confident, it says so and offers WhatsApp instead of guessing.

To teach it something new, add a FAQ with good keywords (`k`) in `src/content/faqs.mjs`.
