# Website live karne ka tareeqa — veltrixwindowsdoor.co.uk

Ye guide Roman Urdu mein hai. Har step screenshot ke bagair bhi follow ho sakta hai.
Kul waqt: takreeban **30–45 minute** (+ DNS propagate hone mein kuch ghante lag sakte hain).

**Hosting: Cloudflare Pages (bilkul free).**
Kyun Cloudflare?
- Free plan par **unlimited bandwidth**, free **SSL (https)**, aur duniya bhar mein fast CDN.
- Business/commercial website ke liye allowed hai. (GitHub Pages ki terms business sites ke liye munasib nahi, aur Vercel ka free plan non-commercial hai.)
- Private GitHub repo ke saath bhi kaam karta hai.
- Saath mein **free business email forwarding** (info@veltrixwindowsdoor.co.uk → aapka Gmail).

---

## Step 0 — Pehle ye cheezein check kar lein

`src/data/site.json` file kholein (GitHub par file kholen → pencil ✏️ icon → edit → "Commit changes"). Ye values sahi honi chahiye:

| Field | Abhi kya hai | Kya karna hai |
|---|---|---|
| `phoneDisplay` / `phoneInternational` / `whatsapp` | 07411 496356 (+44) | Agar business ka WhatsApp number koi aur hai to teeno jagah badal dein. `whatsapp` mein sirf digits likhein, `+` ke baghair (jaise `447411496356`) |
| `email` | info@veltrixwindowsdoor.co.uk | Step 5 mein ise free activate karenge |
| `address`, `areaServed`, `serviceAreas`, `postcodePrefixes` | Khali | Apna shehar/area likhein (jaise `"areaServed": "Birmingham & the West Midlands"`, `"postcodePrefixes": ["B", "WS", "WV"]`). Is se Google par local ranking behtar hogi |
| `hours` | Mon–Fri 8–6, Sat 9–4 | Apne asal timings likhein |
| `guarantee` | 10 saal installation, 12 mahine repair, insurance-backed | **Sirf wahi likhein jo aap waqai dete hain** |
| `company` | Khali | Agar Ltd company hai to naam, company number, VAT number, ICO number likhein |
| `accreditations` | Khali | Sirf tab likhein jab aap waqai registered hon, jaise `[{"name": "FENSA Approved Installer", "url": "https://www.fensa.org.uk"}]` |
| `testimonials` | Khali | Sirf asli customers ke reviews likhein (format README mein hai) |

> ⚠️ UK qanoon ke mutabiq website par trader ka **naam aur asal (geographic) address** dena zaroori hai. `site.json` mein `company.legalName` aur `contact.address` (ya `company.registeredOffice`) zaroor bharein.

> ⚠️ Website par jhooti claims (fake reviews, FENSA bina registration ke, ghalat guarantee) UK mein **Consumer Protection** ke qanoon ke khilaf hain. Isliye ye fields khali chhori gayi hain.

---

## Step 1 — Code ko `main` branch par laana

Abhi code `claude/upvc-windows-doors-site-jj8slj` branch par hai. Do raaste hain:
- **Asaan:** Step 3 mein Cloudflare par *Production branch* yahi branch select kar lein.
- **Behtar:** GitHub par Pull Request bana kar `main` mein merge kar dein, phir production branch `main` rakhein. (Mujhe bolein to main ye kar deta hoon.)

---

## Step 2 — Cloudflare account aur domain add karna

1. https://dash.cloudflare.com/sign-up par free account banayein.
2. Dashboard mein **"Add a domain"** (ya "Add site") par click karein → `veltrixwindowsdoor.co.uk` likhein → **Free plan** select karein → Continue.
3. Cloudflare aapko **2 nameservers** dega, jaise:
   ```
   xxxx.ns.cloudflare.com
   yyyy.ns.cloudflare.com
   ```
   Inhein copy kar lein (har account ke liye alag hote hain).

## Step 3 — Hostinger mein nameservers badalna

Aapke screenshot ke mutabiq abhi nameservers `atlas.dns-parking.com` aur `hyperion.dns-parking.com` hain (ye Hostinger ke parking servers hain).

1. https://hpanel.hostinger.com → **Domains** → `veltrixwindowsdoor.co.uk` → **Manage**.
2. Left side par **DNS / Nameservers** → **Change Nameservers**.
3. **"Change nameservers"** option chunein → purane dono hata kar Cloudflare wale 2 nameservers paste karein → **Save**.
4. Cloudflare dashboard mein wapas aa kar **"Check nameservers"** dabayein.
   `.co.uk` domains par ye aksar 1–2 ghante mein active ho jata hai, lekin 24 ghante tak lag sakte hain. Cloudflare email bhej dega jab domain **Active** ho jaye.

> Domain lock ON rehne dein. Nameserver change ke liye lock off karne ki zaroorat nahi.

## Step 4 — Website ko Cloudflare Pages par deploy karna

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**.
2. GitHub connect karein (authorize) → repository **`daniweb`** select karein.
3. Settings:
   | Setting | Value |
   |---|---|
   | Project name | `veltrix` (is se `veltrix.pages.dev` address milega) |
   | Production branch | `main` (ya `claude/upvc-windows-doors-site-jj8slj`, Step 1 dekhein) |
   | Framework preset | **None** |
   | Build command | `node build.mjs` |
   | Build output directory | `dist` |
4. **Save and Deploy**. 1–2 minute mein website `https://veltrix.pages.dev` par live ho jayegi. Ise khol kar check karein.

### Step 4 (doosra raasta) — GitHub ke baghair, zip upload kar ke

Agar GitHub connect nahi ho raha to website ka tayyar zip (`veltrix-website.zip`) seedha upload kar sakte hain:
1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Upload assets** (Direct Upload).
2. Project name `veltrix` → **Create project** → zip file drag & drop karein → **Deploy site**.
3. Phir Step 5 se aage barhein.

Note: Is tareeqe mein har update ke baad naya zip upload karna parta hai. Git wala tareeqa automatic hai, isliye baad mein GitHub connect kar ke naya Pages project Git ke saath bana lena behtar hai (Direct Upload project baad mein Git par switch nahi hota).
Zip khud banane ke liye: `node build.mjs` chala kar `dist` folder ka andar ka saara content zip karein.

## Step 5 — Domain ko website se jorna

1. Pages project → **Custom domains** → **Set up a custom domain** → `veltrixwindowsdoor.co.uk` → Continue → **Activate domain**.
2. Dobara same karein `www.veltrixwindowsdoor.co.uk` ke liye.
3. **www ko main domain par redirect karna:** Cloudflare → domain → **Rules** → **Redirect Rules** → "Create rule" → template **"Redirect from WWW to root"** → Deploy.
4. SSL khud ban jata hai (5–15 minute). Phir `https://veltrixwindowsdoor.co.uk` khul jayega. 🎉

## Step 6 — Free business email (info@veltrixwindowsdoor.co.uk)

1. Cloudflare → domain → **Email** → **Email Routing** → **Get started**.
2. Custom address: `info` → Destination: apna Gmail → **Create**.
3. Gmail mein Cloudflare ki verification email aayegi → link par click karein.
4. "Add records and enable" dabayein (MX records khud lag jate hain).

Ab website par customer jo email bhejenge woh seedha aapke Gmail mein aayegi.

**Email ki security (zaroori):**
- Cloudflare → DNS → **Add record** → Type `TXT`, Name `_dmarc`, Content: `v=DMARC1; p=none; rua=mailto:info@veltrixwindowsdoor.co.uk`. Do hafte baad, jab sab theek chal raha ho, `p=none` ko `p=quarantine` kar dein. Is se koi aur aapke domain ke naam se jaali email nahi bhej sakega.
- Agar Gmail se **info@ ke naam se reply** karna ho (Gmail → Settings → Accounts → *Send mail as*): SMTP server `smtp.gmail.com`, port 587, Google **App Password** use karein (asal password nahi). Phir Cloudflare DNS mein jo SPF `TXT` record hai (`v=spf1 ...`) us mein `include:_spf.google.com` add karein, warna aapki emails spam mein ja sakti hain.
- Agar koi DNS record ab kisi service ke liye use nahi ho raha (purani hosting, purana CNAME), usse delete kar dein. Latakte hue records se domain takeover ka khatra hota hai.

## Step 7 — Google par aana (bohot zaroori)

1. **Google Search Console:** https://search.google.com/search-console → Add property → Domain → `veltrixwindowsdoor.co.uk` → TXT record Cloudflare DNS mein add karein → Verify → **Sitemaps** mein `sitemap.xml` submit karein.
2. **Google Business Profile:** https://business.google.com → business add karein (category: *Window installation service* / *Door supplier*), website link dein, photos daalein, reviews mangwayein. Local customers zyada tar yahin se aate hain.
3. Google reviews ka link `site.json` → `social.googleReviews` mein daal dein.

### Step 7b — SEO: Google aur AI search (2026)

Website ke andar ka SEO ho chuka hai: har page ka title aur description, `robots` meta tag, ek connected schema (business, website, page, service, FAQ, article), har page ki asli "last updated" date sitemap mein, aur `llms.txt` (ChatGPT, Claude, Perplexity jaise AI assistants ke liye site ka khulasa). Google ki 2026 guidance ke mutabiq AI Overviews aur AI Mode ke liye koi alag file ya trick nahi chahiye: wahi cheezein kaam karti hain jo normal search mein, yani page index ho, saaf jawab ho, aur schema wahi kahe jo page par likha hai.

Ye kaam sirf aap apne accounts se kar sakte hain, aur ranking par sab se zyada asar inhi ka hai:
1. **Google Business Profile** (sab se zaroori, local search aur AI Overviews yahin se jawab uthate hain). Category, service area, hours, photos, aur har kaam ke baad customer se review mangwayein.
2. **`site.json` mein asal maloomat:** `areaServed`, `serviceAreas` (shehar), `postcodePrefixes`, `address` ya `company.registeredOffice`, `company.legalName`. Area na likha ho to Google ko pata nahi chalta ke aap kahan kaam karte hain.
3. **Bing Webmaster Tools:** https://www.bing.com/webmasters → "Import from Google Search Console". ChatGPT search aur Copilot Bing ka index use karte hain.
4. **Cloudflare → domain → Security → Bots:** agar **"Block AI bots"** / "AI Crawl Control" mein AI crawlers block hain to unhein allow kar dein, warna ChatGPT/Perplexity aapki site nahi parh sakenge. (Googlebot is se affect nahi hota.) Saath mein **Caching → Configuration → Crawler Hints** ON kar dein, is se Bing ko naye pages jaldi pata chalte hain.
5. **Asli reviews:** Google reviews ka link `site.json` → `social.googleReviews` mein daalein. Jhoote reviews kabhi na likhein.

> `src/data/lastmod.json` build khud update karta hai: jis page ka content badle us ki date aaj ki ho jati hai. Is file ko commit karte rahein.

---

## Website update kaise karein

- Koi bhi file GitHub par edit kar ke **commit** karein → Cloudflare 1–2 minute mein khud website update kar dega.
- Business details: `src/data/site.json`
- Products ka text: `src/content/products.mjs`
- Repairs aur services: `src/content/repairs.mjs`
- FAQs (chatbot bhi inhi se jawab deta hai): `src/content/faqs.mjs`
- Guides/blog: `src/content/guides.mjs`

Agar Cloudflare par build fail ho jaye to **Deployments** mein log dekhein. Aksar `site.json` mein comma ya quote ki ghalti hoti hai.

## Quotes kaise milenge?

- Customer quote builder, booking ya contact form bharta hai → **WhatsApp khulta hai aur poora message tayyar hota hai** → customer send dabata hai → message aapke WhatsApp par.
- Chatbot bhi quote/repair ki details le kar WhatsApp par bhejta hai.
- **Optional:** Har form ki copy email par bhi chahiye to https://formspree.io (ya https://usebasin.com) par free account banayein. Form endpoint URL `site.json` → `forms.endpoint` mein, aur provider ka naam (jaise `Formspree`) `forms.provider` mein daalein. Ye naam privacy policy mein khud aa jayega. Phir ek test enquiry bhej kar check karein ke email aa rahi hai.
- **Tip:** WhatsApp Business app use karein, aur us mein "Away message" aur "Quick replies" set kar lein.
