/* Veltrix website assistant.
   A rule-based helper that runs entirely in the browser: no external API and no cookies. It answers
   from /assets/data/kb.json (built from this site's own content and site.json), walks visitors
   through quote, repair and survey requests, and hands over to a person on WhatsApp.

   Safety rules followed throughout:
   - Every piece of text is rendered with textContent. Nothing typed by a visitor, read from the
     knowledge base or read back from storage is ever parsed as HTML.
   - The conversation is kept in sessionStorage as plain data (message type + text). It is checked
     when read back and anything unexpected is dropped. HTML is never stored or restored.
   - Links are limited to same-site paths and the business's own tel:, mailto: and wa.me addresses.
   - Input is capped at 300 characters. No eval, no new Function, no inline event handlers. */
(() => {
  'use strict';
  if (window.__vxAssistant) return;
  window.__vxAssistant = true;

  const VX = (window.VX = window.VX || {});
  // One sessionStorage key, listed on the cookies page. Older versions kept HTML under the same key:
  // that data fails the shape check in load() and is thrown away, never rendered.
  const KEY = 'vx-chat';
  const MAX_IN = 300;
  const MAX_MSGS = 60;
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqMobile = window.matchMedia('(max-width: 760px)');
  const reduced = () => mqReduce.matches;
  const ss = {
    get(k) { try { return window.sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { window.sessionStorage.setItem(k, v); } catch { /* storage blocked: the chat still works on this page */ } },
  };

  /* =====================================================================
     Trusted business details (from the page, validated once)
     ===================================================================== */
  const str = (v) => (typeof v === 'string' ? v : '');
  const WA = /^\d{8,15}$/.test(str(VX.wa)) ? VX.wa : '';
  const TEL = /^\+?\d{8,15}$/.test(str(VX.phone)) ? VX.phone : '';
  const PHONE = str(VX.phoneDisplay).replace(/[^\d +()-]/g, '').trim() || TEL;
  const EMAIL = /^[^\s@<>"'()\\]+@[^\s@<>"'()\\]+\.[a-z]{2,}$/i.test(str(VX.email)) ? VX.email : '';
  const BRAND = str(VX.brand) || 'Veltrix';
  const NAME = str(VX.name) || BRAND;
  const WA_BASE = WA ? `https://wa.me/${WA}` : '';
  const TEL_URL = TEL ? `tel:${TEL}` : '';
  const MAIL_URL = EMAIL ? `mailto:${EMAIL}` : '';
  const waUrl = (text) => (!WA_BASE ? '/contact/' : text ? `${WA_BASE}?text=${encodeURIComponent(text)}` : WA_BASE);
  const hi = (rest = '') => `Hi ${BRAND}, ${rest}`.trim();

  // The only links the assistant will ever render.
  function safeHref(h) {
    if (typeof h !== 'string' || !h || h.length > 2500) return '';
    if (/^\/(?!\/)[\w\-.~/?=&%#+]*$/.test(h)) return h;
    if ((TEL_URL && h === TEL_URL) || (MAIL_URL && h === MAIL_URL) || (WA_BASE && h === WA_BASE)) return h;
    if (WA_BASE && h.startsWith(`${WA_BASE}?text=`) && /^[\w\-.!~*'()%]*$/.test(h.slice(WA_BASE.length + 6))) return h;
    return '';
  }
  // strip control and bidi-override characters, cap length
  const clean = (s, n = 2000) => str(s).replace(/[\u0000-\u0009\u000B-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '').slice(0, n);
  const lc = (s) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
  const wc = (q) => (q ? q.split(' ').length : 0);

  /* =====================================================================
     Language: normalising, Roman Urdu / Hindi, spelling slips
     ===================================================================== */
  const norm = (s) => {
    let t = String(s || '').toLowerCase();
    if (t.normalize) t = t.normalize('NFKD').replace(/[̀-ͯ]/g, '');
    return t.replace(/[’‘`´']/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Phrase rewrites applied before matching. Left: normalised phrases ("|" separated). Right: plain
  // English the rules understand. An empty right side drops a filler word.
  const REWRITE = [
    // greetings and manners
    ['assalam o alaikum|assalamu alaikum|assalamualaikum|assalam alaikum|asalam o alaikum|asalamualaikum|aslam o alaikum|salam alaikum|salaam alaikum|wa alaikum assalam|walaikum assalam|wa alaikum salam|walaikum salam|walekum salam|as salam|asalam|assalam|salaam|salam|slam|aoa|namaste|namaskar|adaab|adab', 'hello'],
    ['khuda hafiz|khudahafiz|allah hafiz|allahhafiz|alvida|phir milenge', 'bye'],
    ['bohat shukriya|bahut shukriya|bohot shukriya|shukriya|shukria|shukriyah|shukrya|meherbani|mehrbani|jazakallah|jazak allah|dhanyavaad|dhanyavad|dhanyawad|thx|thnx|thanx|thnks|tnx|thank u|thanku|thankyou|thank you', 'thanks'],
    // things
    ['khidkiyan|khidkiyon|khidkiya|khidki|khirkiyan|khirki|khirkee|khidkee|khiraki|khidkia', 'window'],
    ['darwazay|darwaze|darwazon|darwaza|darwaaza|darvaza|darwaja|darwja|darwza|darwazah|darwazy', 'door'],
    ['sheeshay|sheeshe|sheesha|sheesay|sheese|shisha|shesha|sheesa|sheeshon|kaanch|kanch', 'glass'],
    ['taala|tala|taale|taley', 'lock'],
    ['chabi|chaabi|chabee|chaabhi|chabhi', 'key'],
    ['ghar', 'house'],
    ['rang|colours|colors|colour|color|colur|colr', 'colour'],
    ['naya|nayi|naye', 'new'],
    // problems
    ['toot gaya|toot gayi|toot gya|toot gye|toota hua|tooti hui|toota|tooti|toot|tut gaya|tut gya|toot chuka|phoot gaya|phat gaya|crack ho gaya|crack hogaya', 'broken'],
    ['kharab ho gaya|kharab hogaya|kharab ho gya|kharab hai|kharaab|kharab|khrab|kharb|theek nahi|thik nahi|kaam nahi kar raha|kam nahi kar raha|chal nahi raha', 'broken'],
    ['band nahi ho raha|band nahi hota|band nahi horaha|band nahi', 'wont close'],
    ['nahi khul raha|nahi khulta|khul nahi raha|nahi khulti|khulta nahi', 'wont open'],
    ['nahi lag raha|nahi lagta|lag nahi raha|lagta nahi', 'wont lock'],
    ['bahar phans gaya|bahar phansa|andar nahi ja sakta|ghar se bahar', 'locked out'],
    ['hawa aati|hawa aa rahi|hawa aa raha|thandi hawa', 'draught'],
    ['pani aata|pani aa raha|pani aa rahi|pani tapakta|leak ho raha', 'leak'],
    ['dhundla|dhundhla|bhaap', 'misted'],
    // asking
    ['kitne ka|kitne ki|kitne ke|kitne mein|kitne main|kitne paise|kitna kharcha|kitna|kitne|kitni', 'how much'],
    ['qeemat|qimat|keemat|kimat|qeemath|daam', 'price'],
    ['kharcha', 'cost'],
    ['kab khulte|kab khulta|kab khulay|kab band|timing|timings|time table', 'opening hours'],
    ['khule ho|khule hain|khula hai|khule hai|khule|khula|khuli', 'open'],
    ['abhi', 'now'],
    ['kahan|kahaan|kidhar', 'where'],
    ['ilaqa|ilaaqa|ilaaka|ilaqe|ilaqay', 'area'],
    ['jaldi|fori|foran|fauran|asap', 'urgent'],
    ['theek karna|theek karwana|thik karna|thik karwana|theek karwa|repair karna|repair karwana|marammat|murammat|mistri', 'repair'],
    ['lagwana|lagwani|lagwane|lagana|lagani|lagane|fit karna|fit karwana|install karna|install karwana', 'install'],
    ['naap|naapna|napna|size kaise', 'measure'],
    ['paise kaise|payment kaise|adaigi|adaegi', 'payment'],
    ['chahiye|chaiye|chahye|chaheye|chahta|chahti|chahte', 'want'],
    ['batao|bataen|bataein|bataye|bata do|bata dein|btao|bta do', 'tell me'],
    ['kaise|kese|kaisay', 'how'],
    ['kaun|kon', 'who'],
    ['kya aap|kya ap|kia aap|kia ap', 'do you'],
    ['insaan|insan|banda|bande', 'person'],
    ['baat karni|baat karna|baat karo|baat|bat karni', 'talk'],
    ['rabta|raabta', 'contact'],
    // fillers
    ['kya hai|kya he|kia hai|kya|kia|hai|hain|hy|ka|ki|ke|ko|mein|mai|se|aur|bhi|ye|yeh|wo|woh|mera|meri|mere|mujhe|mujhay|humein|hamara|hamari|apka|apki|apke|aapka|aapki|aapke|aap|ap|ho|ji|bhai|sir|madam|plz|pls|please|kindly', ''],
    // English shorthand, spelling slips and variants
    ['u', 'you'], ['ur', 'your'], ['r', 'are'], ['wanna', 'want to'], ['gonna', 'going to'],
    ['will not|would not|wouldnt|wount|wnt', 'wont'],
    ['can not|cannot|couldnt|could not|unable to|cnt', 'cant'],
    ['does not|dosnt|dose not|dosent|doesent', 'doesnt'],
    ['do not', 'dont'], ['is not', 'isnt'],
    ['quotation|quotations|qoute|qoutes|quoet|qote|quate|qutoe|quotes', 'quote'],
    ['guarentee|gaurantee|guarante|guarantie|garantee|garuntee|guarntee|gurantee|warrenty|waranty|warrantee|warrnty', 'guarantee'],
    ['opning|openning|oppening|opeing', 'opening'], ['hrs', 'hours'],
    ['tomorow|tommorow|tommorrow|tmrw', 'tomorrow'],
    ['wndow|windw|windoe|windos|windws|winodw|windwos|wondow|windo|windoww|widnow', 'window'],
    ['dor|dorr|doore|dooor', 'door'],
    ['glas|glss|galss', 'glass'],
    ['lok|lcok|lokc', 'lock'],
    ['prise|prize|pirce|prcie|proce|pricee', 'price'],
    ['cots|cozt|cosst', 'cost'],
    ['dubble|duble|doubel|doble', 'double'], ['tripple|tripel|trible|tripple', 'triple'],
    ['composit|composte|composide|compsite|compisite|composyte', 'composite'],
    ['alluminium|aluminum|alumium|aluminim|allumnium|alluminum', 'aluminium'],
    ['anthrasite|antracite|anthricite|anthracyte|anthracit', 'anthracite'],
    ['gray', 'grey'],
    ['bi fold|bi folding|bifolding|bi folds|bifolds|by fold|byfold|bi fould|bifould', 'bifold'],
    ['u pvc|u p v c|pvc|uvpc|upcv|upvs|u pvc', 'upvc'],
    ['e mail|emial', 'email'],
    ['whats app|whatsaap|whatsap|watsapp|watsap|whatapp|whtsapp|whatssap|wattsapp|watsup', 'whatsapp'],
    ['call out|call outs|callouts', 'callout'],
    ['tilt n turn|tilt turn|tilt n trun|tilt and trun', 'tilt and turn'],
    ['post code|postal code|zip code|zipcode', 'postcode'],
    ['near by', 'nearby'],
    ['double glazed|double glaze|dbl glazing|double glazzing|double glasing', 'double glazing'],
    ['seal unit|dg unit|glass unit|double glazing unit|sealed units', 'sealed unit'],
    ['condinsation|condensaton|condensasion|condensaion', 'condensation'],
  ];
  const RW = new Map();
  REWRITE.forEach(([from, to]) => from.split('|').forEach((f) => RW.set(f, to)));
  const RW_RX = new RegExp(`\\b(?:${[...RW.keys()].sort((a, b) => b.length - a.length).join('|')})\\b`, 'g');
  const rewrite = (t) => t.replace(RW_RX, (m) => RW.get(m) ?? m).replace(/\s+/g, ' ').trim();

  const STOP = new Set('a an the i im me my we our you your is are am be been was were do does did can could would should will to of in on at for with and or but if it its this that these those there here what which who whom how why when where any some about from by as have has had get got just hi hello hey thanks thank need want like know tell show give much many mine also very really so too then than into out up just ok okay yes no'.split(' '));
  const SYN = {
    window: ['windows'],
    door: ['doors'],
    price: ['prices', 'pricing', 'cost', 'costs', 'costing', 'rate', 'rates', 'charges', 'expensive', 'cheap', 'cheapest', 'afford', 'affordable'],
    misted: ['mist', 'misty', 'misting', 'foggy', 'fog', 'fogged', 'cloudy', 'steamy', 'steamed', 'hazy', 'milky', 'blown'],
    draught: ['draughts', 'draft', 'drafts', 'drafty', 'draughty', 'breeze'],
    lock: ['locks', 'locking', 'lockd'],
    guarantee: ['warranty', 'warranties', 'guarantees', 'guaranteed', 'guaranty'],
    repair: ['repairs', 'repaired', 'fix', 'fixing', 'fixed', 'mend', 'mending'],
    broken: ['broke', 'faulty', 'damaged', 'bust'],
    colour: ['coloured', 'colored'],
    install: ['installation', 'installing', 'installed', 'installs', 'fitting', 'fitted', 'fit', 'fitter', 'fitters'],
    quote: ['estimate', 'estimates', 'quoting'],
    leak: ['leaking', 'leaks', 'leaky', 'leaked'],
    handle: ['handles'],
    hinge: ['hinges'],
    glass: ['glazing', 'pane', 'panes', 'glazed'],
    measure: ['measuring', 'measurement', 'measurements', 'measured', 'dimensions'],
    noise: ['noisy', 'noises', 'sound', 'soundproof', 'soundproofing', 'acoustic'],
    secure: ['security', 'burglar', 'burglary', 'burglars'],
  };
  const CANON = {};
  Object.entries(SYN).forEach(([k, arr]) => { CANON[k] = k; arr.forEach((w) => (CANON[w] = k)); });
  const stem = (w) => {
    if (CANON[w]) return CANON[w];
    let s = w;
    if (s.length > 5 && s.endsWith('ing')) s = s.slice(0, -3);
    else if (s.length > 4 && s.endsWith('ed')) s = s.slice(0, -2);
    else if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
    return CANON[s] || s;
  };
  const toks = (q) => q.split(' ').filter((w) => w && !STOP.has(w)).map(stem);

  // Words the rules rely on (also protects them from "spelling correction").
  const LEX = new Set(`window door glass lock key handle hinge price cost quote quotes estimate repair repairs fix broken smashed shattered cracked crack
    misted condensation draught leak leaking stiff stuck jammed dropped sticking catching loose floppy snapped seal seals sealed unit units
    guarantee warranty insurance insured payment pay paying deposit finance cash card transfer credit monthly instalments
    opening open hours today tomorrow weekend weekends saturday sunday holiday closing close closed shut
    area areas cover coverage postcode located location based nearby travel serve local
    contact phone number email address whatsapp call ring person human someone agent staff
    measure measuring measurement survey surveyor appointment visit booking book arrange
    colour anthracite grey black white cream woodgrain oak rosewood chartwell green
    upvc composite aluminium timber wooden casement flush tilt turn sash bay bow sliding shaped feature french patio bifold stable folding
    double triple glazing energy rated noise security secure safety escape trickle vents planning regulations building fensa certass accredited
    certificate certified registered conservatory roof fascia soffit guttering garage internal secondary
    urgent emergency burglar burglary locked lockout tonight dangerous company reviews rating trading established
    hello thanks bye goodbye cheers`.split(/\s+/));
  const COMMON = new Set(`about above after again against also always another answer anyone anything around away back because been before being below best
    better between both bring build built business busy came cannot care carry case change check child children city clean clear cold come could country
    course days does doing done down during each early easy either else enough even ever every family father find fine first floor found friend from front
    full gave give given going good great half hand happen happy hard have having head hear heard help here high home hope house however idea into itself
    just keep kind knew know large last late later least leave left less life light like line little live long look looking lost made make many maybe mean
    might mind minute money month more morning most mother move much must name near need never news next nice night none normal nothing often okay once only
    other others over own part people perhaps place plan play point possible pretty probably problem put quite rather ready real really reason right room
    same saw say second seem seen send sent several shall short should show side since small some something sometimes soon sorry sort start still stop such
    sure take taken tell than thank that their them then there these they thing things think this those though thought three through time together told
    took toward true trying under until upon used using want wanted water week well went were what when where whether which while whole whose will with
    within without wonder word work world would write wrong year years young your yours sizes size kitchen bedroom bathroom lounge upstairs downstairs
    garden house flat bungalow property tenant landlord letting agent rent rented report stop keep replace remove break fall stick drop
    noisy road street traffic warm heat heating bills energy damp mould mold rotten paint inside outside coming going getting doing making
    homes properties terrace semi detached victorian edwardian georgian period modern older existing current different mate buddy pal love dear
    quick quickly soon asap price prices window windows door doors`.split(/\s+/));
  let VOCAB = new Set([...LEX, ...COMMON, ...STOP]); // words we accept as spelled correctly
  let TARGETS = [...LEX]; // words a slip may be corrected to: domain words only, so "smart" never becomes "start"

  // Optimal string alignment distance with an early exit (handles swapped letters as one slip).
  function osa(a, b, max) {
    const la = a.length;
    const lb = b.length;
    if (Math.abs(la - lb) > max) return max + 1;
    let p2 = null;
    let p1 = Array.from({ length: lb + 1 }, (_, j) => j);
    for (let i = 1; i <= la; i++) {
      const cur = [i];
      let rowMin = i;
      for (let j = 1; j <= lb; j++) {
        let v = Math.min(p1[j] + 1, cur[j - 1] + 1, p1[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
        cur[j] = v;
        if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      p2 = p1;
      p1 = cur;
    }
    return p1[lb];
  }
  const forms = (w) => {
    const v = [w];
    if (w.endsWith('ies')) v.push(`${w.slice(0, -3)}y`);
    if (w.endsWith('es')) v.push(w.slice(0, -2));
    if (w.endsWith('s')) v.push(w.slice(0, -1));
    for (const suf of ['ing', 'ed', 'er', 'ly']) {
      if (!w.endsWith(suf) || w.length < suf.length + 3) continue;
      const b = w.slice(0, -suf.length);
      v.push(b, `${b}e`);
      if (/([b-df-hj-np-tv-z])\1$/.test(b)) v.push(b.slice(0, -1));
    }
    return v;
  };
  const known = (w) => forms(w).some((x) => VOCAB.has(x));
  const fixCache = new Map();
  function fixWord(w) {
    if (w.length < 4 || /\d/.test(w) || known(w)) return w;
    if (fixCache.has(w)) return fixCache.get(w);
    const max = w.length >= 8 ? 2 : 1;
    let best = w;
    let bd = max + 1;
    for (const v of TARGETS) {
      if (v[0] !== w[0] || v.length < 4 || Math.abs(v.length - w.length) > max) continue;
      if (w.length === 4 && !LEX.has(v)) continue;
      const d = osa(w, v, max);
      if (d < bd || (d === bd && LEX.has(v) && !LEX.has(best))) { bd = d; best = v; }
    }
    const out = bd <= max ? best : w;
    fixCache.set(w, out);
    return out;
  }
  // normalise → translate → fix slips. Display always uses the visitor's own words.
  const prep = (raw) => rewrite(rewrite(norm(raw)).split(' ').map(fixWord).join(' '));

  /* =====================================================================
     Knowledge base
     ===================================================================== */
  let KB = null;
  let kbPromise = null;
  const arr = (a) => (Array.isArray(a) ? a : []);
  const loadKB = () =>
    (kbPromise ||= fetch(`/assets/data/kb.json?v=${encodeURIComponent(str(VX.v))}`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .catch(() => ({}))
      .then((j) => (KB = buildIndex(j && typeof j === 'object' ? j : {}))));

  function buildIndex(raw) {
    const kb = {
      business: raw.business && typeof raw.business === 'object' ? raw.business : {},
      faqs: arr(raw.faqs).filter((f) => f && typeof f.q === 'string' && typeof f.a === 'string'),
      repairs: arr(raw.repairs).filter((r) => r && typeof r.name === 'string' && typeof r.slug === 'string'),
      products: arr(raw.products).filter((p) => p && typeof p.name === 'string' && typeof p.slug === 'string'),
      services: arr(raw.services).filter((s) => s && typeof s.name === 'string'),
      guides: arr(raw.guides).filter((g) => g && typeof g.title === 'string'),
      colours: arr(raw.colours).filter((c) => c && typeof c.name === 'string'),
      categories: raw.categories && typeof raw.categories === 'object' ? raw.categories : {},
    };
    const docs = [];
    const vocab = new Set(VOCAB);
    const targets = new Set(LEX);
    const rw = (s) => rewrite(norm(s));
    const add = (type, i, item, title, keys, extra = '', softText = '') => {
      const tt = toks(rw(title));
      const kt = arr(keys).map((k) => toks(rw(k)));
      const words = new Set([...tt, ...kt.flat(), ...toks(rw(extra))].filter((w) => w.length > 2));
      // option lists etc.: worth a little, never enough on their own
      const soft = new Set(toks(rw(softText)).filter((w) => w.length > 2 && !words.has(w)));
      [title, extra, ...arr(keys)].forEach((s) => rw(s).split(' ').forEach((w) => w.length > 3 && !/\d/.test(w) && vocab.add(w)));
      rw(title).split(' ').forEach((w) => w.length > 3 && !/\d/.test(w) && !STOP.has(w) && targets.add(w));
      docs.push({ type, i, item, phrases: kt.filter((p) => p.length > 1), words, soft, tw: new Set(tt) });
    };
    kb.faqs.forEach((f, i) => add('faq', i, f, f.q, f.k));
    kb.repairs.forEach((r, i) => add('repair', i, r, r.name, r.k, `${str(r.short)} ${arr(r.symptoms).join(' ')}`));
    kb.products.forEach((p, i) => add('product', i, p, p.name, p.k, `${str(p.tag)} ${str(p.short)}`, `${arr(p.options).join(' ')} ${arr(p.goodFor).join(' ')}`));
    kb.services.forEach((s, i) => add('service', i, s, s.name, [s.name, ...arr(s.steps)], str(s.short)));
    kb.guides.forEach((g, i) => add('guide', i, g, g.title, [], str(g.summary)));
    const df = {};
    docs.forEach((d) => [...d.words, ...d.soft].forEach((w) => (df[w] = (df[w] || 0) + 1)));
    const N = docs.length || 1;
    VOCAB = vocab;
    TARGETS = [...targets];
    fixCache.clear();
    return { ...kb, docs, idf: (w) => Math.log(1 + N / (df[w] || 1)) };
  }

  const PROBLEM_RX = /\b(repair|fix|broken|wont|doesnt|cant|isnt|not|stuck|problem|issue|fault|leak|leaking|draught|draughty|misted|misty|foggy|fog|fogged|cloudy|steamed|hazy|milky|blown|stiff|hard|heavy|drop|dropped|dropping|loose|crack|cracked|snapped|jammed|sticking|catching|faulty|damaged|rattl\w*|squeak\w*|whistl\w*|condensation|failed|gap|slams?|falling|fell|bent)\b/;
  const isProblem = (q) => PROBLEM_RX.test(q);

  // Words that appear in most questions and say little about the topic on their own.
  const GENERIC = new Set('window door upvc new install long take time much many make need want replace replacement old home house work use way thing good best help question look keep put come year years kind sort type types right just like last lot'.split(' '));
  function search(q) {
    if (!KB) return [];
    const T = toks(q);
    if (!T.length) return [];
    const problem = isProblem(q);
    const res = [];
    for (const d of KB.docs) {
      let s = 0;
      let ph = 0;
      let sure = false; // matched something specific, not just common words
      const seen = new Set();
      const hit = [];
      for (const t of T) {
        if (t.length < 3 || seen.has(t)) continue;
        seen.add(t);
        if (d.soft.has(t)) { s += 0.5 * KB.idf(t); hit.push(`~${t}`); continue; }
        if (!d.words.has(t)) continue;
        s += KB.idf(t) * (d.tw.has(t) ? 1.3 : 1);
        hit.push(t);
        if (!GENERIC.has(t) && (d.tw.has(t) || KB.idf(t) >= 3)) sure = true;
      }
      for (const p of d.phrases) {
        if (p.length > T.length) continue;
        for (let i = 0; i + p.length <= T.length; i++) {
          let ok = true;
          for (let j = 0; j < p.length; j++) if (T[i + j] !== p[j]) { ok = false; break; }
          if (ok) {
            s += 0.8 * p.reduce((a, w) => a + KB.idf(w), 0);
            ph = Math.max(ph, p.length);
            if (p.some((w) => !GENERIC.has(w) && w.length > 2)) sure = true;
            break;
          }
        }
      }
      // every word of the question is in the title ("door locks", "sash windows"): a strong signal
      if (s > 0 && T.length <= 4 && T.every((t) => t.length < 3 || d.tw.has(t))) s *= 1.6;
      if (d.type === 'repair' && !problem) s *= 0.75;
      if ((d.type === 'product' || d.type === 'guide') && problem) s *= 0.7;
      if (d.type === 'guide' || d.type === 'service') s *= 0.85;
      if (s > 0) res.push({ d, s, ph, sure: sure || s >= 10, hit });
    }
    res.sort((a, b) => b.s - a.s);
    return res.slice(0, 5);
  }

  const faqBy = (rx) => KB?.faqs.find((f) => rx.test(f.q)) || null;
  const productBy = (slug) => KB?.products.find((p) => p.slug === slug) || null;
  const repairBy = (slug) => KB?.repairs.find((r) => r.slug === slug) || null;
  const guideBy = (slug) => KB?.guides.find((g) => g.slug === slug) || null;
  const docFor = (type, item) => KB?.docs.find((d) => d.type === type && d.item === item) || null;
  const label = (d) => d.item.q || d.item.name || d.item.title || '';
  const topRepair = (q, min = 2.5) => search(q).find((h) => h.d.type === 'repair' && h.s >= min)?.d.item || null;

  const PRODUCT_RX = [
    ['flush-casement-windows', /\bflush\b/],
    ['tilt-and-turn-windows', /\btilt and turn\b|\btilt\b/],
    ['bay-and-bow-windows', /\b(bay|bow) windows?\b|\bbays?\b/],
    ['sliding-windows', /\b(horizontal )?slid(ing|er|ers) windows?\b|\bhorizontal slid/],
    ['sash-windows', /\bsash(es)?\b/],
    ['shaped-and-feature-windows', /\b(shaped|feature|arched|arch|circular|round|apex|gable|triangular|picture) windows?\b/],
    ['casement-windows', /\bcasements?\b/],
    ['composite-doors', /\bcomposite\b/],
    ['french-doors', /\bfrench\b/],
    ['bifold-doors', /\bbifold\b|\bfolding doors?\b/],
    ['patio-doors', /\bpatio\b|\bsliding doors?\b/],
    ['stable-doors', /\b(stable|dutch) doors?\b/],
    ['upvc-doors', /\b(front|back|rear|side|entrance|kitchen|utility) doors?\b|\bupvc doors?\b/],
  ];
  const findProduct = (q) => {
    for (const [slug, rx] of PRODUCT_RX) if (rx.test(q) && productBy(slug)) return productBy(slug);
    return null;
  };

  /* =====================================================================
     Message building blocks: plain data, rendered later with textContent
     ===================================================================== */
  const H = (x) => ({ t: 'h', x });
  const P = (x) => ({ t: 'p', x });
  const EY = (x) => ({ t: 'ey', x });
  const NOTE = (x) => ({ t: 'note', x });
  const UL = (x) => ({ t: 'ul', x: x.filter(Boolean) });
  const OL = (x) => ({ t: 'ol', x: x.filter(Boolean) });
  const TAGS = (x) => ({ t: 'tags', x });
  const CARD = (title, h, d = '', e = '') => ({ t: 'card', x: { t: title, h, d, e } });
  const ACT = (...x) => ({ t: 'act', x: x.filter(Boolean) });
  const TBL = (h, r) => ({ t: 'tbl', x: { h, r } });
  const SW = (x) => ({ t: 'sw', x });
  const WAMSG = (m) => ({ t: 'wa', x: { m } });
  const B = (x) => ({ b: x });
  const A = (x, h) => ({ a: x, h });
  const bCall = (l) => (TEL_URL ? { l: l || `Call ${PHONE}`, h: TEL_URL, s: 'call' } : null);
  const bWa = (text, l = 'WhatsApp us') => (WA_BASE ? { l, h: waUrl(text), s: 'wa' } : null);
  const bMail = () => (MAIL_URL ? { l: 'Email us', h: MAIL_URL, s: 'mail' } : null);
  const bGo = (l, h) => ({ l, h, s: 'primary' });
  const bAlt = (l, h) => ({ l, h, s: 'ghost' });
  // quick replies: say text, run an action, follow a link, or open WhatsApp
  const C = (l, s) => ({ l, s: s || l });
  const CA = (l, a) => ({ l, a });
  const CL = (l, h) => ({ l, h });
  const CW = (l, text) => (WA_BASE ? { l, h: waUrl(text), w: 1 } : CL(l, '/contact/'));
  const CR = (d) => ({ l: label(d), a: `ref:${d.type}:${d.i}` });

  const MAIN = () => [
    CA('Get a quote', 'flow:quote'),
    CA('Report a repair', 'flow:repair'),
    CA('Book a survey', 'flow:survey'),
    C('Prices', 'How much do windows cost?'),
    C('Misted glass', 'My double glazing is misted'),
    C('Opening hours', 'What are your opening hours?'),
  ];
  const status = () => {
    try { const s = typeof VX.openStatus === 'function' ? VX.openStatus() : null; return s && typeof s.text === 'string' ? s : null; } catch { return null; }
  };
  const joinAnd = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);

  /* =====================================================================
     Answers
     ===================================================================== */
  function welcome() {
    const st = status();
    const b = [P(`Hello. I’m the ${BRAND} assistant. I answer from the information on this website, so I can help with windows, doors, repairs and prices, or set up a quote or survey request for you.`)];
    if (st && !st.open) b.push(NOTE(`${st.text}. You can still message the team on WhatsApp, and they’ll read it when they’re back.`));
    b.push(P('What can I help with?'));
    return { k: 'welcome', b, c: MAIN() };
  }
  const greet = (salam) => ({
    k: 'greet',
    b: salam ? [P('Wa alaikum assalam. What can I help with today?'), P('Ask about windows, doors, repairs or prices. Everyday Urdu or Hindi words are fine, such as khidki, darwaza or qeemat.')] : [P('Hello. What can I help with today?'), P('Ask about windows, doors, repairs or prices, or pick a topic below.')],
    c: MAIN(),
  });
  const thanks = () => ({ k: 'thanks', b: [P('You’re welcome. Is there anything else I can help with?')], c: [...MAIN().slice(0, 3), CW('WhatsApp a person', hi())] });
  const bye = () => ({ k: 'bye', b: [P('Thanks for stopping by. If anything else comes up, the team is on WhatsApp.')], c: [CW('WhatsApp the team', hi()), CA('Start again', 'menu')] });
  const who = () => ({
    k: 'who',
    b: [H('Who you’re talking to'), P('I’m an automated assistant, not a person. I answer from the information on this website, and I can’t see bookings, quotes or past jobs.'), P('For anything I can’t answer, message the team on WhatsApp.')],
    c: [CW('WhatsApp a person', hi()), ...MAIN().slice(0, 3)],
  });
  const lang = () => ({
    k: 'language',
    b: [P('I reply in English. I understand everyday Urdu and Hindi words, such as khidki, darwaza, sheesha and qeemat, so type the way you normally would.'), P('For a longer conversation, message the team on WhatsApp.')],
    c: [CW('WhatsApp the team', hi()), ...MAIN().slice(0, 3)],
  });

  function contact() {
    const st = status();
    const bz = KB?.business || {};
    const b = [H('Contact the team'), ACT(bWa(hi(), 'WhatsApp us'), bCall(), bMail())];
    const rows = [];
    if (PHONE) rows.push([B('Phone and WhatsApp: '), TEL_URL ? A(PHONE, TEL_URL) : PHONE]);
    if (EMAIL) rows.push([B('Email: '), A(EMAIL, MAIL_URL)]);
    if (str(bz.address)) rows.push([B('Address: '), bz.address]);
    if (rows.length) b.push(UL(rows));
    b.push(P('WhatsApp is the easiest way to reach us, because you can send photos and sizes in the same chat.'));
    if (st) b.push(NOTE(st.text));
    return { k: 'contact', b, c: [C('Opening hours', 'What are your opening hours?'), C('Areas you cover', 'Which areas do you cover?'), CA('Book a survey', 'flow:survey')] };
  }

  function hours() {
    const st = status();
    const t12 = typeof VX.fmtTime === 'function' ? VX.fmtTime : (x) => x;
    const src = arr(KB?.business?.hours).length ? KB.business.hours : arr(VX.hours);
    const rows = src.filter((h) => h && typeof h.days === 'string');
    const b = [H('Opening hours')];
    if (st) b.push(P(B(`${st.text}.`)));
    if (rows.length) b.push(UL(rows.map((h) => [B(`${h.days}: `), str(h.open) && str(h.close) ? `${t12(h.open)} to ${t12(h.close)}` : 'Closed'])));
    b.push(P('Outside these hours, send a WhatsApp message and we’ll pick it up when we open. If you need a survey or fitting on a particular day, say so when you book.'));
    return { k: 'hours', b, c: [CW('WhatsApp us', hi()), CA('Book a survey', 'flow:survey'), C('Contact details', 'How can I contact you?')] };
  }

  const POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/i;
  const OUTWARD = /^\s*([A-Z]{1,2}\d[A-Z\d]?)\s*$/i;
  const parsePostcode = (v) => {
    const m = String(v).match(POSTCODE);
    if (m) return `${m[1]} ${m[2]}`.toUpperCase();
    const o = String(v).match(OUTWARD);
    return o ? o[1].toUpperCase() : '';
  };
  // a postcode or outward code anywhere in a sentence ("do you cover LS6?")
  const findPostcode = (raw) => {
    const m = String(raw).match(POSTCODE);
    if (m) return `${m[1]} ${m[2]}`.toUpperCase();
    const o = String(raw).match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?)\b/i);
    return o && /[a-z]/i.test(o[1]) && !/^(m2|m3|a1|b1|c1)$/i.test(o[1]) ? o[1].toUpperCase() : '';
  };

  function area(raw) {
    const bz = KB?.business || {};
    const pc = findPostcode(raw);
    const prefixes = arr(bz.postcodePrefixes);
    const areas = arr(bz.serviceAreas).filter((x) => typeof x === 'string');
    const b = [H('Areas we cover')];
    if (pc && prefixes.length && typeof VX.coversPostcode === 'function') {
      b.push(P(VX.coversPostcode(pc, prefixes) ? ['Yes. ', B(pc), ' is in our usual area.'] : [B(pc), ' may be outside our usual area. Send us a message and we’ll check.']));
    } else if (areas.length) {
      b.push(P(`We cover ${joinAnd(areas)}${str(bz.areaServed) ? ` and the surrounding ${bz.areaServed} area` : ''}.`));
      b.push(P(pc ? ['Send ', B(pc), ' to the team on WhatsApp and they’ll confirm.'] : 'Not listed? Send your postcode on WhatsApp and the team will confirm.'));
    } else if (str(bz.areaServed)) {
      b.push(P(`We work across ${bz.areaServed}.`));
      b.push(P(pc ? ['Send ', B(pc), ' on WhatsApp and the team will confirm we can reach you.'] : 'Send your postcode on WhatsApp and the team will confirm we can reach you.'));
    } else {
      b.push(P(pc ? ['I can’t confirm ', B(pc), ' from here. Tap below to send it to the team, and they’ll tell you whether it’s in our area.'] : 'I can’t check coverage from here. Send your postcode on WhatsApp and the team will tell you whether we cover it.'));
    }
    return {
      k: 'area',
      b,
      c: [CW(pc ? `Ask about ${pc}` : 'Send my postcode', hi(pc ? `do you cover ${pc}?` : 'do you cover my area? My postcode is ')), CA('Book a survey', 'flow:survey'), C('Opening hours', 'What are your opening hours?')],
    };
  }

  function company(q) {
    const bz = KB?.business || {};
    const co = bz.company && typeof bz.company === 'object' ? bz.company : {};
    const b = [H(`About ${NAME}`)];
    if (str(bz.about)) b.push(P(bz.about));
    const rows = [['legalName', 'Registered name'], ['companyNumber', 'Company number'], ['vatNumber', 'VAT number'], ['registeredOffice', 'Registered office']]
      .filter(([k]) => str(co[k]))
      .map(([k, l]) => [B(`${l}: `), co[k]]);
    if (rows.length) b.push(UL(rows));
    if (/\b(reviews?|ratings?|testimonials?|trustpilot|stars?|years?|long|established|experience|staff|people|fitters|installers|employees|team|legit|legitimate|trustworthy|reputable|family|owner|owns)\b/.test(q))
      b.push(P('I don’t have reviews, trading history or team details to show you here. Ask the team on WhatsApp and they’ll answer you directly.'));
    b.push(CARD('About us', '/about/', 'How we work, from survey to handover', 'Read more'));
    return { k: 'company', b, c: [CW('Ask the team', hi('I have a question about your company: ')), C('Guarantee', 'What guarantee do I get?'), C('Accreditations', 'Are you FENSA registered?')] };
  }

  function accred(q) {
    const list = arr(KB?.business?.accreditations).filter((x) => typeof x === 'string' && x);
    const g = guideBy('building-regulations-for-replacement-windows');
    const b = [H('Accreditations and certificates')];
    if (list.length) b.push(P(`We’re registered with ${joinAnd(list)}.`));
    else b.push(P(`I can’t confirm scheme memberships${/\binsur/.test(q) ? ' or insurance details' : ''} from here, so please ask the team directly.`));
    b.push(P('Replacement windows and doors must be certified under the Building Regulations. That’s done either by an installer registered with a Competent Person Scheme, such as FENSA or Certass, or through local authority building control.'));
    b.push(P('Your quote confirms which route applies, and you get the certificate when the work is finished. Keep it, because a buyer’s solicitor will ask for it.'));
    return {
      k: 'accreditation',
      b,
      c: [CW('Ask the team', hi('which scheme certifies your installations?')), C('Building Regulations', 'Do replacement windows need Building Regulations approval?'), g && CL('Regulations guide', g.url)].filter(Boolean),
    };
  }

  function guarantee() {
    const g = KB?.business?.guarantee && typeof KB.business.guarantee === 'object' ? KB.business.guarantee : {};
    const f = faqBy(/guarantee do i get/i);
    const yrs = Number(g.installationYears) || 0;
    const mths = Number(g.repairMonths) || 0;
    const b = [H('Guarantees')];
    const items = [];
    if (yrs) items.push([B(`New windows and doors: ${yrs} years. `), `Covers defects in manufacture and workmanship from completion${g.insuranceBacked ? '. It’s insurance-backed, so it still stands if we stop trading' : ''}.`]);
    if (mths) items.push([B(`Repairs: ${mths} months. `), 'Covers the parts we supply and fit, and our workmanship on that repair.']);
    if (items.length) b.push(UL(items));
    else if (f) b.push(P(f.a));
    b.push(P('Full terms are on your quotation and guarantee certificate. Your statutory rights are not affected.'));
    b.push(CARD('Guarantees and aftercare', '/guarantee/', 'What’s covered and how to claim', 'Read the details'));
    return { k: 'guarantee', b, c: [C('Something’s gone wrong', 'What if something goes wrong after fitting?'), CW('Report a problem', hi('I need help with something you fitted. My address is ')), CA('Get a quote', 'flow:quote')] };
  }

  function payment(q) {
    const dep = faqBy(/deposit/i);
    const pay = faqBy(/how (can|do) i pay|payment/i);
    const wantsDeposit = /\bdeposits?\b/.test(q) && dep;
    const b = [H(wantsDeposit ? dep.q : 'Paying for your work')];
    if (wantsDeposit) { b.push(P(dep.a)); if (pay) b.push(P(pay.a)); }
    else { if (pay) b.push(P(pay.a)); if (dep) b.push(P(dep.a)); }
    if (!pay && !dep) b.push(P('Payment terms, including any deposit, are set out on your written quotation before you agree to anything.'));
    if (/\b(finance|financing|credit|monthly|instal?ments?|klarna|spread)\b/.test(q)) b.push(NOTE('I can’t confirm finance options from here. Ask the team before you accept your quote.'));
    return { k: 'payment', b, c: [CA('Get a quote', 'flow:quote'), C('Guarantee', 'What guarantee do I get?'), CW('Ask about payment', hi('I have a question about payment: '))] };
  }

  function measure(q) {
    if (/\b(wrong|mistake|bigger|smaller|out by|incorrect|off by|not exact|exact|accurate)\b/.test(q)) {
      const w = faqBy(/bigger or smaller|than i measured/i);
      if (w) return docAnswer(docFor('faq', w));
    }
    const f = faqBy(/how do i measure/i);
    const g = guideBy('how-to-measure-windows-for-a-quote');
    const b = [H('How to measure')];
    b.push(P(f ? f.a : 'Measure the existing frame edge to edge at the top, middle and bottom for the width, and at the left, centre and right for the height. Use the smallest figure each time, in millimetres. We measure every opening again at the survey before anything is made.'));
    if (g) b.push(CARD(g.title, g.url, g.summary, 'Guide'));
    b.push(ACT(bGo('Open the quote builder', '/quote/')));
    return {
      k: 'measure',
      b,
      c: [C('What if I measure wrong?', 'What if my windows are bigger or smaller than I measured?'), CW('Send photos instead', hi('I’d like a quote. I’ll send photos and rough sizes.')), CA('Quick quote here', 'flow:quote')],
    };
  }

  function repairPrice(rep) {
    const b = [H(rep ? `Repair prices: ${lc(rep.name)}` : 'Repair prices')];
    b.push(P('Many repairs can be priced from photos before we visit. Send a photo of the problem on WhatsApp, with a close-up of the lock, hinge or glass if you can.'));
    b.push(P('Any call-out or diagnosis charge is confirmed before we book the visit, so there are no surprises.'));
    if (rep?.tip) b.push(NOTE(`Tip: ${rep.tip}`));
    b.push(ACT(bWa(hi(`I’d like a price for a repair${rep ? ` (${rep.name})` : ''}. Photos attached.`), 'Send photos for a price')));
    return {
      k: 'price:repair',
      b,
      c: [CA('Report a repair', rep ? `flow:repair:${rep.slug}` : 'flow:repair'), rep && CL('About this repair', rep.url), C('Call-out fee?', 'Do you charge a call-out fee?')].filter(Boolean),
    };
  }

  function price(q) {
    const p = findProduct(q);
    const repairish = /\b(repair|fix|mend|callout|engineer)\b/.test(q) || (isProblem(q) && !p);
    if (repairish) return repairPrice(topRepair(q, 2));
    if (!p && /\b(sealed unit|glass|pane|panes|misted|glazing unit)\b/.test(q) && !/\b(double glazing|windows?|doors?)\b/.test(q.replace(/\bglass\b/, ''))) {
      return {
        k: 'price:glass',
        b: [H('Prices for replacement glass'), P('Replacement glass is priced on the size of each unit and the type of glass. Send a photo of the pane with a rough width and height. That’s usually enough for us to give you a price.'), ACT(bGo('Price replacement glass', '/quote/?item=sealed-unit'), bWa(hi('I’d like a price for replacement glass. Photo and rough sizes attached.'), 'Send a photo'))],
        c: [C('Misted glass', 'My double glazing is misted'), C('How do I measure?'), CA('Report a repair', 'flow:repair:misted-double-glazing')],
      };
    }
    if (p) {
      const n = lc(p.name);
      return {
        k: 'price:product',
        b: [H(`Prices for ${n}`), P('We don’t publish a price list. Size, glass, colour and hardware all change the price, so a list would mislead you.'), P(`Add your ${n} to the quote builder with rough sizes and send it to us. We reply with an estimate, then confirm a fixed price in writing after a free survey.`), ACT(bGo(`Price ${n}`, `/quote/?item=${p.slug}`))],
        c: [CA('Quick quote here', `flow:quote:${p.slug}`), C('How do I measure?'), CL(`About ${n}`, p.url)],
      };
    }
    const f = faqBy(/how much/i);
    return {
      k: 'price',
      b: [H('Prices'), P(f ? f.a : 'It depends on the size, style, glass and colour, and on how many windows you’re replacing, so we don’t publish a price list. Use the quote builder or send sizes and photos on WhatsApp for an estimate. We confirm a fixed price in writing after a free survey.'), ACT(bGo('Open the quote builder', '/quote/'))],
      c: [CA('Quick quote here', 'flow:quote'), C('How do I measure?'), C('Is the survey free?', 'Are the survey and quote really free?'), CW('Ask on WhatsApp', hi('I’d like a rough price for '))],
    };
  }

  function colours() {
    const f = faqBy(/colou?rs?/i);
    const sw = arr(KB?.colours).filter((c) => /^#[0-9a-f]{6}$/i.test(str(c.hex)));
    const b = [H('Colours')];
    b.push(P(f ? f.a : 'White, cream, woodgrain and solid colours, including anthracite grey, black and Chartwell green. Many come as dual colour, with the colour outside and white inside. Colours look different on screen, so we bring samples to the survey.'));
    if (sw.length) b.push(SW(sw.map((c) => [c.name, c.hex])));
    const flush = productBy('flush-casement-windows');
    const comp = productBy('composite-doors');
    return { k: 'colours', b, c: [flush && C('Timber-look windows', flush.name), comp && C('Composite doors', comp.name), CA('Book a survey', 'flow:survey')].filter(Boolean) };
  }

  function compare(type, q) {
    const quoteChip = (slug, l) => (productBy(slug) ? CL(l, `/quote/?item=${slug}`) : null);
    if (type === 'aluminium') {
      const f = faqBy(/aluminium/i);
      if (f) return docAnswer(docFor('faq', f));
      return notListed('Aluminium windows and doors', q);
    }
    if (type === 'upvcComposite') {
      const g = guideBy('upvc-vs-composite-doors');
      return {
        k: 'compare',
        b: [
          H('uPVC or composite door?'),
          P('Both are secure and efficient when they’re properly specified and fitted. The differences are feel, finish and price.'),
          TBL(['', 'uPVC', 'Composite'], [
            ['Build', 'Steel-reinforced uPVC with an insulated panel', 'Thick insulated core behind a GRP skin'],
            ['Feel', 'Lighter', 'Heavier, with a more solid close'],
            ['Look', 'Smooth or woodgrain foil', 'Timber-grain texture, wide colour range'],
            ['Security', 'Multipoint lock, anti-snap cylinder, PAS 24 options', 'Multipoint lock, anti-snap cylinder, PAS 24 and Secured by Design options'],
            ['Price', 'Lower', 'Higher'],
          ]),
          P('Composite usually suits a main front door where looks matter. uPVC is the better-value choice for back and side doors.'),
          g && CARD(g.title, g.url, g.summary, 'Guide'),
        ].filter(Boolean),
        c: [quoteChip('composite-doors', 'Price a composite door'), quoteChip('upvc-doors', 'Price a uPVC door'), C('Door colours', 'What colours can I choose?')].filter(Boolean),
      };
    }
    if (type === 'casementFlush') {
      return {
        k: 'compare',
        b: [
          H('Casement or flush casement?'),
          P('Both open the same way and use the same locks. The difference is how the sash sits in the frame.'),
          TBL(['', 'Casement', 'Flush casement'], [
            ['Sash', 'Laps over the frame', 'Sits level with the frame, like timber joinery'],
            ['Look', 'Chamfered or sculptured edge', 'Timber-style, often woodgrain or a heritage colour'],
            ['Frames', 'Slimmer, a little more glass', 'Bulkier, slightly wider sightlines'],
            ['Price', 'The most cost-effective', 'Higher per window'],
            ['Suits', 'Most houses and bungalows', 'Period homes and conservation areas (subject to planning)'],
          ]),
          P('Not sure? Ask for both on your quote and compare them side by side.'),
        ],
        c: [quoteChip('casement-windows', 'Price casements'), quoteChip('flush-casement-windows', 'Price flush casements'), CA('Book a survey', 'flow:survey')].filter(Boolean),
      };
    }
    if (type === 'doubleTriple') {
      const f = faqBy(/double or triple/i);
      const g = guideBy('window-energy-ratings-explained');
      return {
        k: 'compare',
        b: [
          H('Double or triple glazing?'),
          P(f ? f.a : 'Modern double glazing with Low-E glass, argon gas and warm-edge spacers meets current regulations and suits most homes. Triple glazing keeps in more heat and can cut more noise, but the units are heavier and cost more.'),
          TBL(['', 'Double', 'Triple'], [
            ['Heat', 'Meets Part L (1.4 W/m²K or better, or WER band B)', 'Keeps in more heat'],
            ['Noise', 'Fine for most homes', 'Can cut more noise'],
            ['Weight', 'Lighter', 'Heavier units'],
            ['Price', 'Lower', 'Higher'],
          ]),
          g && CARD(g.title, g.url, g.summary, 'Guide'),
        ].filter(Boolean),
        c: [C('Noise from a busy road', 'Will new windows cut down noise?'), CA('Book a survey', 'flow:survey'), CA('Get a quote', 'flow:quote')],
      };
    }
    // French, patio and bi-fold
    return {
      k: 'compare',
      b: [
        H('French, patio or bi-fold doors?'),
        TBL(['', 'French', 'Patio', 'Bi-fold'], [
          ['Opens', 'Two doors from the centre', 'Panels slide past each other', 'Panels fold and stack'],
          ['Open width', 'The full pair', 'About half', 'Almost the whole frame'],
          ['Space', 'Room to swing, usually outwards', 'None needed', 'Room for the stack'],
          ['Typical width', 'About 1.2 to 1.8 m', 'Wide openings', 'About 2 to 4 m'],
        ]),
        P('Patio doors are the simplest to use every day. Bi-folds open the whole wall in summer. French doors suit a narrower opening.'),
      ],
      c: ['french-doors', 'patio-doors', 'bifold-doors'].map((s) => productBy(s)).filter(Boolean).map((p) => C(p.name, p.name)),
    };
  }

  function category(cat) {
    const c = KB?.categories?.[cat];
    const items = arr(KB?.products).filter((p) => p.cat === cat);
    const b = [H(cat === 'doors' ? 'Our doors' : 'Our windows')];
    if (c && str(c.lead)) b.push(P(c.lead));
    if (items.length) b.push(UL(items.map((p) => [A(p.name, p.url), str(p.tag) ? ` · ${p.tag}` : ''])));
    return {
      k: 'category',
      b,
      c: [cat === 'doors' ? C('uPVC or composite?', 'uPVC or composite door?') : C('Casement or flush?', 'Casement or flush casement?'), C('Prices', `How much do ${cat} cost?`), CA('Get a quote', 'flow:quote'), CA('Book a survey', 'flow:survey')],
    };
  }

  const NOT_LISTED = [
    [/\bconservator(y|ies)\b/, 'Conservatories'],
    [/\b(roof lanterns?|lantern roofs?|skylights?|roof windows?|velux|roofs?|roofing)\b/, 'Roofs and roof windows'],
    [/\b(fascias?|soffits?|guttering|gutters?|roofline|cladding)\b/, 'Fascias, soffits and guttering'],
    [/\bgarage doors?\b/, 'Garage doors'],
    [/\b(internal|interior|inside|fire) doors?\b/, 'Internal and fire doors'],
    [/\bsecondary glazing\b/, 'Secondary glazing'],
    [/\b(shop ?fronts?|curtain wall\w*|balustrad\w*|glass partitions?)\b/, 'Shopfronts and structural glazing'],
    [/\b(steel|crittall) (windows?|doors?)\b/, 'Steel windows and doors'],
    [/\b(timber|wooden|wood) (windows?|doors?|frames?|sash\w*)\b/, 'Timber windows and doors'],
  ];
  function notListed(what, q) {
    const timber = /^Timber/.test(what);
    const b = [H(what)];
    b.push(P(`${what} aren’t part of the range on this website. We supply and fit uPVC windows and uPVC and composite doors, and we repair uPVC windows and doors.`));
    if (timber) b.push(P('If you like the look of timber, flush casement and sash windows come in woodgrain finishes, and composite doors have a timber-grain texture.'));
    b.push(P('If you’re not sure whether we can help, ask the team on WhatsApp.'));
    return {
      k: 'not-listed',
      b,
      c: [CW('Ask the team', hi(`I have a question: ${q}`)), timber && productBy('flush-casement-windows') && C('Flush casement windows'), C('Windows', 'What windows do you do?'), C('Doors', 'What doors do you do?')].filter(Boolean),
    };
  }

  function urgent(type, q) {
    const st = status();
    if (type === 'general') {
      const f = faqBy(/how quickly/i);
      const b = [H('Urgent repairs'), P('Making the property safe comes first. If glass is broken, or a door or window won’t lock, call us and say it’s urgent.'), P('For anything else, send a photo on WhatsApp and we’ll offer the earliest appointment we have.'), ACT(bCall(), bWa(hi('I have an urgent repair. Photo attached. My postcode is '), 'WhatsApp a photo'))];
      if (st && !st.open) b.push(NOTE(`${st.text}. If the property can’t be made secure before then, an emergency glazier or locksmith is the safer option.`));
      else if (st) b.push(NOTE(st.text));
      return { k: 'urgent', b, c: [C('Broken glass', 'My glass is broken'), C('Door won’t lock', 'My door won’t lock'), C('Locked out', 'I’m locked out'), f && C('How quickly can you come?', f.q)].filter(Boolean) };
    }
    const rep = repairBy(type === 'glass' ? 'glass-and-panel-replacement' : 'locks-and-mechanisms');
    const align = repairBy('door-alignment');
    const b = [];
    let wa;
    if (type === 'glass') {
      b.push(H('Broken glass: make it safe first'));
      b.push(UL([
        'Keep children and pets away, and don’t pull loose glass out with bare hands.',
        'If the pane is cracked but still in place, run strong tape across it.',
        'If the opening is exposed or the property isn’t secure, cover it from inside with board or heavy polythene.',
      ]));
      b.push(P('Then call us, or send a photo on WhatsApp with a rough width and height so we can order the right glass.'));
      wa = hi('I have broken glass that needs replacing. Photo and rough size attached. My postcode is ');
    } else if (type === 'lockout') {
      b.push(H('Locked out or door stuck shut?'));
      b.push(UL([
        'Don’t force the key or handle. Forcing it can snap the gearbox or the cylinder.',
        'If a key has snapped in the lock, leave the broken piece where it is.',
        'Check whether another door or window can be opened safely.',
      ]));
      b.push(P('Call us now, or send a photo of the lock and handle on WhatsApp.'));
      wa = hi('I can’t open my door. Photo of the lock attached. My postcode is ');
    } else {
      b.push(H('Door or window won’t lock or close?'));
      b.push(UL([
        'Don’t force the key or handle. Forcing it can snap the gearbox and leave the door stuck.',
        'Check nothing is caught in the frame, then lift the handle fully before you turn the key.',
        align ? ['If it only locks when you push or lift hard, the door has probably dropped. See ', A('dropped doors', align.url), '.'] : 'If it only locks when you push or lift hard, the door has probably dropped and needs adjusting.',
      ]));
      b.push(P('If you can’t secure the property, call us now. Otherwise send a photo of the lock edge on WhatsApp.'));
      wa = hi('My door or window won’t lock. Photo attached. My postcode is ');
    }
    b.push(ACT(bCall(), bWa(wa, 'WhatsApp a photo')));
    if (st && !st.open) b.push(NOTE(`${st.text}. If the property can’t be made secure before then, an emergency glazier or locksmith is the safer option.`));
    else if (st) b.push(NOTE(st.text));
    if (rep) b.push(CARD(rep.name, rep.url, 'How we fix it', 'Repair guide'));
    return { k: 'urgent', b, c: [CA('Report a repair', rep ? `flow:repair:${rep.slug}:u` : 'flow:repair'), C('How quickly can you come?', 'How quickly can you come out for a repair?'), CA('Something else', 'menu')] };
  }

  function docAnswer(doc, alt) {
    if (!doc) return fallback('');
    const it = doc.item;
    const altChip = alt && alt !== doc ? [CR(alt)] : [];
    switch (doc.type) {
      case 'faq': {
        const g = str(it.group);
        const extra = [];
        let chips;
        if (/quote|price|pay/i.test(g)) chips = [CA('Quick quote here', 'flow:quote'), CL('Quote builder', '/quote/'), C('How do I measure?')];
        else if (/install|survey/i.test(g)) chips = [CA('Book a survey', 'flow:survey'), C('Guarantee', 'What guarantee do I get?')];
        else if (/regulation|certific/i.test(g)) {
          const gd = guideBy('building-regulations-for-replacement-windows');
          if (gd) extra.push(CARD(gd.title, gd.url, '', 'Guide'));
          chips = [CA('Book a survey', 'flow:survey'), CA('Get a quote', 'flow:quote')];
        } else if (/repair/i.test(g)) chips = [CA('Report a repair', 'flow:repair'), CW('Send photos', hi('I need a repair. Photos attached.'))];
        else if (/guarantee|aftercare/i.test(g)) chips = [CL('Guarantee details', '/guarantee/'), CW('Report a problem', hi('I need help with something you fitted. My address is '))];
        else chips = [CA('Book a survey', 'flow:survey'), CA('Get a quote', 'flow:quote')];
        return { k: 'faq', b: [H(it.q), P(it.a), ...extra], c: [...altChip, ...chips, CL('All FAQs', '/faq/')].slice(0, 5) };
      }
      case 'repair': {
        const b = [H(it.name), P(str(it.short))];
        if (arr(it.fix).length) b.push(P(B('What we usually do')), UL(arr(it.fix)));
        if (str(it.visit)) b.push(P(it.visit));
        if (str(it.tip)) b.push(NOTE(`Tip: ${it.tip}`));
        b.push(ACT(bWa(hi(`I need a repair: ${it.name}. Photos attached.`), 'Send photos'), bAlt('Book a visit', `/book/?type=repair&repair=${it.slug}`)));
        b.push(CARD(it.name, it.url, 'Signs, causes, fixes and FAQs', 'Repair guide'));
        return { k: 'repair', b, c: [CA('Report this repair', `flow:repair:${it.slug}`), C('Repair prices', `How much to fix ${lc(it.name)}?`), ...altChip, C('How quickly can you come?', 'How quickly can you come out for a repair?')].slice(0, 4) };
      }
      case 'product': {
        const b = [];
        if (str(it.tag)) b.push(EY(it.tag));
        b.push(H(it.name), P(str(it.short)));
        if (arr(it.goodFor).length) b.push(P(B('Good for')), UL(arr(it.goodFor)));
        if (arr(it.options).length) b.push(P(B('Options include')), TAGS(arr(it.options)));
        b.push(ACT(bGo('Price this style', `/quote/?item=${it.slug}`), bAlt('See details', it.url)));
        const cmp = /composite|upvc-doors/.test(it.slug) ? C('uPVC or composite?', 'uPVC or composite door?')
          : /casement/.test(it.slug) ? C('Casement or flush?', 'Casement or flush casement?')
          : /french|patio|bifold/.test(it.slug) ? C('French, patio or bi-fold?', 'French, patio or bi-fold doors?') : null;
        return { k: 'product', b, c: [cmp, ...altChip, C('Colours', 'What colours can I choose?'), CA('Book a survey', 'flow:survey')].filter(Boolean).slice(0, 4) };
      }
      case 'service': {
        const b = [H(it.name), P(str(it.short))];
        if (arr(it.steps).length) b.push(OL(arr(it.steps)));
        b.push(CARD(it.name, it.url, 'Read how it works', 'Service'));
        return { k: 'service', b, c: [CA('Book a survey', 'flow:survey'), CA('Get a quote', 'flow:quote'), ...altChip] };
      }
      default:
        return {
          k: 'guide',
          b: [H(it.title), P(str(it.summary)), CARD('Read the guide', it.url, it.title, 'Guide')],
          c: [...altChip, CA('Get a quote', 'flow:quote'), CA('Something else', 'menu')],
        };
    }
  }

  function dym(hits, raw) {
    const seen = new Set();
    const opts = [];
    // only suggest answers that share a specific word with the question
    for (const h of hits.filter((x) => x.s >= 2 && arr(x.hit).some((t) => !GENERIC.has(t.replace('~', ''))))) {
      const l = label(h.d);
      if (!l || seen.has(l)) continue;
      seen.add(l);
      opts.push(CR(h.d));
      if (opts.length === 3) break;
    }
    if (!opts.length) return fallback(raw);
    return { k: 'dym', b: [P('I’m not sure I’ve understood. Did you mean one of these?')], c: [...opts, CW('Ask a person on WhatsApp', hi(`I have a question: ${raw}`))] };
  }
  const fallback = (raw) => ({
    k: 'fallback',
    b: [P('I don’t have an answer for that, and I’d rather not guess.'), P('The team can answer it properly on WhatsApp, or pick a topic below.')],
    c: [CW('Ask the team on WhatsApp', hi(raw ? `I have a question: ${raw}` : '')), ...MAIN().slice(0, 4)],
  });

  /* =====================================================================
     Intent rules
     ===================================================================== */
  const RX = {
    greetOnly: /^(hello|hi+|hey+|hiya|howdy|yo|good (morning|afternoon|evening|day)|morning|afternoon|evening)( (there|team|all|everyone|veltrix))*( how are you( doing)?| how is it going| hows it going)?$/,
    greetLead: /^(hello|hi+|hey+|hiya|good (morning|afternoon|evening))( there| team)?\s+/,
    thanks: /\b(thanks|cheers|ta|much appreciated|appreciate it|thats helpful|very helpful|great help|perfect|brilliant|lovely|great)\b/,
    thanksRest: /\b(thanks|cheers|ta|ok|okay|great|perfect|brilliant|lovely|excellent|good|nice|very|much|so|that|thats|was|is|helpful|appreciated|appreciate|you|for|the|your|help|info|information|lot|again|all|team|bye|mate|buddy|pal|bro|love|dear|man)\b/g,
    byeOnly: /^(ok |okay |thanks )?(bye|bye bye|goodbye|see you|see ya|cya|thats all|that is all|nothing else|no thanks|im done|all good|good night|take care)( thanks| bye)?$/,
    who: /\b(who are you|what are you|are you (a |an )?(bot|robot|human|real|person|ai|computer|machine)|is this (a |an )?(bot|robot|real person|human|ai|automated)|your name|am i (talking|speaking|chatting) to|who am i talking)\b/,
    lang: /\b(urdu|hindi|punjabi|other languages?|another language|speak (urdu|hindi|punjabi|polish))\b/,
    accred: /\b(fensa|certass|accredit\w*|registered|approved installer|competent person|trustmark|trust mark|checkatrade|which trusted|trading standards|ggf|insured|insurance|public liability|members?hip|member of|qualified|vetted|certified)\b/,
    guarantee: /\b(guarantee|guarantees|guaranteed|warranty|warranties|insurance backed|ibg)\b/,
    payment: /\b(pay|paying|payment|payments|deposit|deposits|finance|financing|credit|card|cards|cash|bank transfer|bacs|instal?ments?|monthly|spread the cost|klarna|paypal|cheque)\b/,
    hours: /\b(opening hours|open hours|business hours|office hours|hours|opening times|what time|when (are|do) you (open|close|closed|shut)|are you (open|closed)|you closed|closed (today|tomorrow|on)|you open|open (today|now|tomorrow|on|at|this|until|till|late)|now open|closing time|close today|working (hours|days)|weekends?|saturdays?|sundays?|bank holidays?|evenings?|still open)\b/,
    hoursNot: /\b(wont|cant|doesnt|isnt|not|stuck|hard|stiff|broken|how many hours|how long|takes?|fit|fitting|install|survey|lead time)\b/,
    area: /^where$|^where (are )?(you|your)\b|\b(where are you|where you based|where is your (office|base|showroom|company)|whereabouts|located|location|based|areas?|cover|covered|coverage|near me|nearby|near to|come to|travel to|travel|serve|service area|my postcode|postcode|are you (near|local|in)|(go|work|come|operate) (to|in|around)|which (towns|cities|counties))\b/,
    areaNot: /\b(winter|rain|weekends?|guarantee|warranty|safety|floor|furniture|dust|cover it|cover the)\b/,
    company: /\b(about (you|your company|the company|your business)|company number|companies house|vat (number|registered)|how long have you been|years (in business|trading|experience)|been (trading|in business)|established|reviews?|ratings?|testimonials?|trustpilot|google reviews|family (run|business)|who owns|owner|how many (staff|people|fitters|installers|employees)|team size|(real|proper|legit|legitimate) (company|business)|legit|trustworthy|reputable)\b/,
    measure: /\b(measure|measuring|measurement|measurements|measured|how big|what size|which size|dimensions|width and height)\b/,
    priceWords: /\b(how much|price|prices|pricing|priced|cost|costs|costing|rate|rates|charge|charges|expensive|cheap|cheapest|afford|affordable|budget|ballpark|ball park|per window|per door|per m2|square metre)\b/,
    priceNot: /\b(callout|diagnosis|deposit|valid|validity|free|obligation|whatsapp|photos?|pictures?|text|message|noise|energy|bills?|save|saving)\b/,
    colour: /\b(colour|anthracite|grey|black|white|cream|woodgrain|wood grain|wood effect|oak|rosewood|chartwell|ral|dual colour|two tone|foils?|foiled|paint|painted|spray(ed)?)\b/,
    contact: /\b(contact|contact details|phone|phone number|telephone|mobile number|your number|email|address|get in touch|reach you|call you|ring you|call me|ring me|call back|callback|whatsapp|office|text you|real person|a person|human|someone|somebody|agent|advisor|adviser|staff member|team member|operator|speak (to|with)|talk (to|with)|chat (to|with)|person|talk)\b/,
    contactNot: /\b(number of|how many)\b/,
    req: /\b(want|need|like|get|request|send|give|book|booking|arrange|after|interested|looking|start|can i|could i|can we|could we|can you|could you|someone|somebody|anyone|organise|organize|free)\b/,
    quote: /\b(quote|estimate)\b/,
    quoteQ: /\b(how much|cost|price|charge|valid|validity|expire|expiry|builder|how long|included|include|includes|revised|really free|is (it|the quote|a quote|your quote|quote) free|are (your |the )?quotes? free|charge for|pay for (a|the) quote|obligation|whatsapp|photos?|pictures?|accurate|change)\b/,
    survey: /\b(survey|surveyor|appointment|home visit|site visit|come (round|over|and see|and measure|to measure)|measure up|someone to measure|measure my (house|home|windows|doors))\b/,
    surveyQ: /\b(free|cost|charge|how long|how quickly|how soon|what happens|take|takes|need to be (home|in)|obligation|valid|include|included)\b/,
    repairWord: /\b(repair|repairs|fix|fixed|engineer|repairman|fault|problem|issue|broken)\b/,
    repairReq: /\b(book|booking|arrange|report|request|need|want|get|have|got|send)\b/,
  };
  const CATEGORY_RX = /^(i want |want |need )?(new |upvc |replacement |double glazing |double glazed )?(windows?|doors?)( install(ed)?| fitted| fit| want| please)?$|^install (new )?(windows?|doors?)$|\bwhat (windows?|doors?) (do you|can you)\b|\b(windows?|doors?) do you (do|offer|sell|have|fit|supply)\b|\b(types?|kinds?|range|styles?) of (windows?|doors?)\b/;

  function urgentType(q) {
    if (/\b(locked out|lock(ed)? (myself|ourselves|us|me) out|cant get (in|into|back in)|stuck outside|key (is |has |has got |got )?(snapped|broken|broke|stuck|jammed) in|snapped key|broken key in|key wont come out)\b/.test(q)) return 'lockout';
    if (/\b(break in|broken into|burglar\w*|burgled|forced (entry|open|in|the door)|kicked in|tried to break in|attempted break in)\b/.test(q)) return 'secure';
    if (/\b(broken|smashed|shattered|smash|shatter|broke|hole in)\b/.test(q) && /\b(glass|pane|panes|glazing|sealed unit)\b/.test(q) && !/\b(handle|hinge|hinges|lock|locks|mechanism|seal|seals|stay|restrictor|blind|key|price|cost|how much)\b/.test(q)) return 'glass';
    if (/\b(smashed|shattered)\b/.test(q) && /\b(window|windows|door)\b/.test(q)) return 'glass';
    if (/\bboard(ed|ing)? up\b/.test(q)) return 'glass';
    const doorish = /\b(door|doors|lock|locks|key|handle|cylinder|patio|bifold|french|window|windows)\b/;
    if (/\b(wont|cant|doesnt|isnt|not) (lock|locking|close|closing|shut|shutting|secure|latch)\b/.test(q) && doorish.test(q)) return 'secure';
    if (/\b(cant|wont|doesnt) be (locked|closed|shut|secured)\b/.test(q)) return 'secure';
    if (/\b(lock|locks|cylinder|mechanism|gearbox|multipoint)\b.*\b(broken|snapped|jammed|failed|stuck|gone)\b|\b(broken|snapped|jammed|failed|stuck)\b.*\b(lock|cylinder|gearbox|multipoint)\b/.test(q) && /\b(door|lock|cylinder|gearbox|multipoint)\b/.test(q) && !/\b(window|price|cost|how much)\b/.test(q)) return 'secure';
    if (/\bdoor\b.*\b(wont|cant|doesnt|not) open\b|\b(cant|wont) open (the |my )?(front |back )?door\b|\bstuck shut\b|\blocked shut\b/.test(q)) return 'lockout';
    if (/\b(urgent|emergency|right now|immediately|tonight|dangerous|unsafe|not safe)\b/.test(q) && /\b(lock|glass|pane|key|broken|secure)\b/.test(q)) return 'secure';
    if (/\b(emergency|emergencies|out of hours|after hours|24 ?hours?|24 7|urgent repairs?|same day)\b/.test(q) && !/\b(quote|estimate|survey|price|cost)\b/.test(q)) return 'general';
    return null;
  }

  function compareType(q) {
    if (!/\b(vs|versus|or|compare|compared|comparison|difference|differences|better|best|which|between|worth it|worth)\b/.test(q)) return null;
    if (/\bcomposite\b/.test(q) && /\b(upvc|plastic)\b/.test(q)) return 'upvcComposite';
    if (/\btriple\b/.test(q) && /\b(double|worth|better)\b/.test(q)) return 'doubleTriple';
    if (/\bflush\b/.test(q) && /\b(casement|casements|standard|normal|regular)\b/.test(q)) return 'casementFlush';
    if (/\baluminium\b/.test(q)) return 'aluminium';
    if (['french', 'patio', 'bifold'].filter((w) => new RegExp(`\\b${w}\\b`).test(q)).length >= 2) return 'gardenDoors';
    return null;
  }

  function guessQuote(q) {
    const p = findProduct(q);
    if (p) return { what: p.cat === 'doors' ? 'Doors' : 'Windows', style: p.name, slug: p.slug };
    const w = /\bwindows?\b/.test(q);
    const d = /\bdoors?\b/.test(q);
    if (w && d) return { what: 'Windows and doors' };
    if (w) return { what: 'Windows' };
    if (d) return { what: 'Doors' };
    if (/\b(glass|sealed unit|pane)\b/.test(q)) return { what: 'Replacement glass' };
    return {};
  }

  function flowRequest(q) {
    if (RX.quote.test(q) && !RX.quoteQ.test(q) && (RX.req.test(q) || wc(q) <= 4)) return { flow: 'quote', data: guessQuote(q) };
    if (RX.survey.test(q) && !RX.surveyQ.test(q.replace(/\bfree survey\b/, 'survey')) && (RX.req.test(q) || wc(q) <= 3)) return { flow: 'survey', data: {} };
    if (/^(repair|repairs|a repair|report a repair|repair request|book a repair|book repair|book a repair visit|i need a repair|need a repair|need repair)$/.test(q)) return { flow: 'repair', data: {} };
    if (RX.repairWord.test(q) && RX.repairReq.test(q)) {
      const rep = topRepair(q, 3);
      const booking = /\b(book|booking|arrange|report|request)\b/.test(q);
      if (booking || !rep) return { flow: 'repair', data: rep ? { problem: rep.name, repair: rep.slug } : {} };
    }
    return null;
  }

  // Decide what to say. Pure: no state changes, so it can also be used to test routing.
  function route(raw) {
    const q0 = prep(raw);
    if (!q0) return fallback(raw);
    const salam = /\b(salam|salaam|assalam|asalam|aoa|alaikum|slam)\b/i.test(norm(raw));
    if (RX.greetOnly.test(q0)) return greet(salam);
    if (RX.byeOnly.test(q0) || /^bye\b/.test(q0)) return bye();
    if (RX.thanks.test(q0) && !q0.replace(RX.thanksRest, ' ').trim()) return thanks();
    const q = q0.replace(RX.greetLead, '').trim() || q0;
    if (RX.who.test(q)) return who();
    if (RX.lang.test(q)) return lang();

    const u = urgentType(q);
    if (u) return urgent(u, q);
    const fr = flowRequest(q);
    if (fr) return { k: `flow:${fr.flow}`, ...fr };
    const cmp = compareType(q);
    if (cmp) return compare(cmp, raw);
    if (RX.guarantee.test(q)) return guarantee(q);
    if (RX.accred.test(q)) return accred(q);
    if (RX.payment.test(q) && !RX.priceWords.test(q.replace(/\bpay\b/, ''))) return payment(q);
    if (RX.hours.test(q) && !RX.hoursNot.test(q)) return hours();
    if ((RX.area.test(q) && !RX.areaNot.test(q)) || (parsePostcode(raw) && wc(q) <= 3)) return area(raw);
    if (RX.company.test(q)) return company(q);
    if (RX.measure.test(q)) return measure(q);
    for (const [rx, what] of NOT_LISTED) if (rx.test(q)) return notListed(what, raw);
    if (RX.priceWords.test(q) && !RX.priceNot.test(q)) return price(q);
    if (RX.payment.test(q)) return payment(q);
    if (RX.colour.test(q) && !isProblem(q)) return colours();
    if (RX.contact.test(q) && !RX.contactNot.test(q) && !RX.priceWords.test(q)) return contact();
    if (CATEGORY_RX.test(q)) return category(/door/.test(q) ? 'doors' : 'windows');

    const hits = search(q);
    if (isProblem(q) && /\b(patio|bifold|sliding doors?|folding doors?|rollers?|tracks?)\b/.test(q) && repairBy('patio-and-bifold-repairs')) {
      const d = docFor('repair', repairBy('patio-and-bifold-repairs'));
      const i = hits.findIndex((h) => h.d === d);
      if (i > 0) hits.unshift(...hits.splice(i, 1));
      else if (i < 0) hits.unshift({ d, s: 9, ph: 0 });
    }
    // a described fault is better served by the repair than by a general FAQ about it
    if (hits[0]?.d.type === 'faq' && isProblem(q)) {
      const r = hits.findIndex((h) => h.d.type === 'repair' && h.s >= hits[0].s * 0.85);
      if (r > 0) hits.unshift(...hits.splice(r, 1));
    }
    const best = hits[0];
    if (!best || best.s < 2) {
      if (/\b(broken|problem|issue|fault|faulty|not working|wont work)\b/.test(q)) return { k: 'flow:repair', flow: 'repair', data: {} };
      return hits.length ? dym(hits, raw) : fallback(raw);
    }
    if (best.s < 3.6 || !best.sure) return dym(hits, raw);
    const second = hits[1];
    const alt = second && second.s >= best.s * 0.8 ? second.d : null;
    return docAnswer(best.d, alt);
  }

  /* =====================================================================
     Guided flows (quote, repair, survey)
     ===================================================================== */
  const COUNT = ['1', '2–3', '4–6', '7–10', 'More than 10'];
  const styleOpts = (what) => {
    const cat = /door/i.test(what) ? 'doors' : 'windows';
    return [...arr(KB?.products).filter((p) => p.cat === cat).map((p) => p.name), 'Not sure'];
  };
  const noun = (d) => (/glass/i.test(d.what || '') ? 'panes' : /door/i.test(d.what || '') && !/window/i.test(d.what || '') ? 'doors' : /window/i.test(d.what || '') && !/door/i.test(d.what || '') ? 'windows' : 'windows and doors');
  const whenOpts = () => {
    const sat = arr(VX.hours).some((h) => h && arr(h.dow).includes(6) && h.open);
    return ['Weekday morning', 'Weekday afternoon', sat && 'Saturday', 'Any time'].filter(Boolean);
  };
  const POSTCODE_STEP = { key: 'postcode', type: 'postcode', ask: 'What’s the postcode of the property? It lets us check we cover your area.', opts: () => ['Skip'] };
  const NAME_STEP = { key: 'name', type: 'name', ask: 'Last one. What name should we use?', opts: () => ['Skip'] };
  const FLOWS = {
    quote: {
      title: 'quote request',
      head: 'Quick quote request',
      intro: 'A few quick questions, then I’ll put your request into a WhatsApp message for the team. Type Cancel at any time.',
      steps: [
        { key: 'what', ask: 'What would you like priced?', opts: () => ['Windows', 'Doors', 'Windows and doors', 'Replacement glass'] },
        { key: 'style', ask: (d) => `Which style of ${/door/i.test(d.what) ? 'door' : 'window'}? Pick the closest, or Not sure.`, opts: (d) => styleOpts(d.what), skip: (d) => d.what != null && !/^(windows|doors)$/i.test(d.what) },
        { key: 'count', ask: (d) => `Roughly how many ${noun(d)}?`, opts: () => COUNT },
        POSTCODE_STEP,
        NAME_STEP,
      ],
    },
    repair: {
      title: 'repair request',
      head: 'Repair request',
      intro: 'I’ll ask a few questions, then put the details into a WhatsApp message so you can add photos. Type Cancel at any time.',
      steps: [
        { key: 'problem', free: true, ask: 'What’s the problem? Pick the closest, or describe it in a few words.', opts: () => [...arr(KB?.repairs).map((r) => r.name), 'Something else'] },
        { key: 'on', ask: 'Is it on a window or a door?', opts: () => ['Window', 'Front or back door', 'Patio or bi-fold door', 'More than one'] },
        { key: 'urgency', ask: 'How urgent is it?', opts: () => ['Can’t secure the property', 'Soon, but it’s secure', 'No rush'] },
        POSTCODE_STEP,
        NAME_STEP,
      ],
    },
    survey: {
      title: 'survey request',
      head: 'Book a survey',
      intro: 'Surveys and written quotes for new windows and doors are free, with no obligation. A few questions, then I’ll put your request into a WhatsApp message. Type Cancel at any time.',
      steps: [
        { key: 'what', ask: 'What’s the survey for?', opts: () => ['New windows', 'New doors', 'Windows and doors', 'Replacement glass', 'A repair instead'] },
        { key: 'count', ask: (d) => `Roughly how many ${noun(d)}?`, opts: () => COUNT },
        { key: 'when', ask: 'When suits you best for a visit?', opts: whenOpts },
        POSTCODE_STEP,
        NAME_STEP,
      ],
    },
  };
  const DATA_KEYS = ['what', 'style', 'slug', 'count', 'postcode', 'name', 'problem', 'detail', 'repair', 'on', 'urgency', 'when'];

  /* =====================================================================
     Conversation state (sessionStorage, plain data only)
     ===================================================================== */
  const fresh = () => ({ v: 2, msgs: [], chips: [], flow: null, nudged: 0, reopen: 0 });
  let state = fresh();

  const BLOCK_TYPES = new Set(['h', 'p', 'ey', 'note', 'ul', 'ol', 'tags', 'sw', 'tbl', 'card', 'act', 'wa']);
  const ACT_STYLES = new Set(['wa', 'call', 'mail', 'primary', 'ghost']);
  const ACTION_RX = /^(cancel|menu|flow:(quote|repair|survey)(:[a-z0-9-]{1,48})?(:u)?|opt:\d{1,2}|ref:(faq|repair|product|service|guide):\d{1,3})$/;
  const cStr = (v, n = 600) => (typeof v === 'string' ? clean(v, n) : null);
  function cInline(x) {
    if (typeof x === 'string') return clean(x, 2000);
    if (x && typeof x === 'object' && !Array.isArray(x)) x = [x];
    if (!Array.isArray(x) || x.length > 24) return null;
    const out = [];
    for (const p of x) {
      if (typeof p === 'string') out.push(clean(p, 2000));
      else if (p && typeof p === 'object' && typeof p.b === 'string') out.push({ b: clean(p.b, 400) });
      else if (p && typeof p === 'object' && typeof p.a === 'string') out.push(safeHref(p.h) ? { a: clean(p.a, 200), h: p.h } : clean(p.a, 200));
      else return null;
    }
    return out;
  }
  function cBlock(bk) {
    if (!bk || typeof bk !== 'object' || !BLOCK_TYPES.has(bk.t)) return null;
    const x = bk.x;
    switch (bk.t) {
      case 'h': case 'p': case 'ey': case 'note': { const v = cInline(x); return v == null ? null : { t: bk.t, x: v }; }
      case 'ul': case 'ol': {
        if (!Array.isArray(x) || x.length > 20) return null;
        const items = x.map(cInline);
        return items.includes(null) ? null : { t: bk.t, x: items };
      }
      case 'tags': return Array.isArray(x) && x.length <= 16 && x.every((s) => typeof s === 'string') ? { t: 'tags', x: x.map((s) => clean(s, 80)) } : null;
      case 'sw': return Array.isArray(x) && x.length <= 20 && x.every((c) => Array.isArray(c) && typeof c[0] === 'string' && /^#[0-9a-f]{6}$/i.test(c[1])) ? { t: 'sw', x: x.map((c) => [clean(c[0], 60), c[1]]) } : null;
      case 'tbl': {
        if (!x || !Array.isArray(x.h) || !Array.isArray(x.r) || x.h.length > 5 || x.r.length > 12) return null;
        const row = (r) => Array.isArray(r) && r.length === x.h.length && r.every((c) => typeof c === 'string');
        return row(x.h) && x.r.every(row) ? { t: 'tbl', x: { h: x.h.map((c) => clean(c, 80)), r: x.r.map((r) => r.map((c) => clean(c, 200))) } } : null;
      }
      case 'card': return x && cStr(x.t) && safeHref(x.h) ? { t: 'card', x: { t: cStr(x.t, 200), h: x.h, d: cStr(x.d, 400) || '', e: cStr(x.e, 60) || '' } } : null;
      case 'act': {
        if (!Array.isArray(x) || x.length > 4) return null;
        const items = x.filter((a) => a && cStr(a.l) && safeHref(a.h) && ACT_STYLES.has(a.s)).map((a) => ({ l: cStr(a.l, 80), h: a.h, s: a.s }));
        return items.length ? { t: 'act', x: items } : null;
      }
      case 'wa': return x && typeof x.m === 'string' ? { t: 'wa', x: { m: clean(x.m, 1500) } } : null;
      default: return null;
    }
  }
  function cMsg(m) {
    if (!m || typeof m !== 'object') return null;
    if (m.t === 'u') { const x = cStr(m.x, MAX_IN); return x ? { t: 'u', x } : null; }
    if (m.t !== 'b' || typeof m.k !== 'string' || !/^[a-z:-]{1,40}$/.test(m.k) || !Array.isArray(m.b) || m.b.length > 30) return null;
    const b = m.b.map(cBlock).filter(Boolean);
    return b.length ? { t: 'b', k: m.k, b } : null;
  }
  function cChip(c) {
    if (!c || typeof c !== 'object' || !cStr(c.l)) return null;
    const out = { l: cStr(c.l, 120) };
    if (typeof c.a === 'string' && ACTION_RX.test(c.a)) out.a = c.a;
    else if (typeof c.h === 'string' && safeHref(c.h)) { out.h = c.h; if (c.w) out.w = 1; }
    else if (typeof c.s === 'string') out.s = clean(c.s, MAX_IN);
    else return null;
    return out;
  }
  function cFlow(f) {
    if (!f || typeof f !== 'object' || !FLOWS[f.n] || !Number.isInteger(f.i) || f.i < 0 || f.i > FLOWS[f.n].steps.length) return null;
    const d = {};
    if (f.d && typeof f.d === 'object') DATA_KEYS.forEach((k) => { if (typeof f.d[k] === 'string') d[k] = clean(f.d[k], 160); });
    return { n: f.n, i: f.i, d, o: f.o === 1 ? 1 : 0 };
  }
  function load() {
    let raw = null;
    try { raw = JSON.parse(ss.get(KEY) || 'null'); } catch { raw = null; }
    if (!raw || typeof raw !== 'object' || raw.v !== 2 || !Array.isArray(raw.msgs)) return fresh();
    return {
      v: 2,
      msgs: raw.msgs.slice(-MAX_MSGS).map(cMsg).filter(Boolean),
      chips: Array.isArray(raw.chips) ? raw.chips.slice(0, 12).map(cChip).filter(Boolean) : [],
      flow: cFlow(raw.flow),
      nudged: raw.nudged === 1 ? 1 : 0,
      reopen: raw.reopen === 1 ? 1 : 0,
    };
  }
  const save = () => {
    state.msgs = state.msgs.slice(-MAX_MSGS);
    ss.set(KEY, JSON.stringify(state));
  };
  state = load();

  /* =====================================================================
     DOM
     ===================================================================== */
  const SVG = {
    mark: '<svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="1.5" y="1.5" width="29" height="29" fill="none" stroke="currentColor" stroke-width="3"/><path d="M16 3v26M3 13h26" stroke="currentColor" stroke-width="2.5"/><rect x="18.5" y="15.5" width="9.5" height="11.5" fill="#b98a45"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    reset: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>',
    wa: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
    call: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></svg>',
    mail: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  };
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const icon = (name) => {
    const s = el('span', 'vxa__ico');
    s.innerHTML = SVG[name]; // fixed markup from the constants above, never data
    return s;
  };
  const link = (h, text, cls) => {
    const a = el('a', cls, text);
    a.href = h;
    if (/^https?:/i.test(h)) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  };

  // launcher
  const compact = /^\/(quote|book)\//.test(location.pathname);
  const launch = el('button', `vxa-launch${compact ? ' vxa-launch--compact' : ''}`);
  launch.type = 'button';
  launch.setAttribute('aria-haspopup', 'dialog');
  launch.setAttribute('aria-controls', 'vxa-panel');
  launch.setAttribute('aria-expanded', 'false');
  if (compact) launch.setAttribute('aria-label', 'Questions? Ask us');
  const launchAv = el('span', 'vxa-launch__av');
  launchAv.innerHTML = SVG.mark;
  const launchDot = el('span', 'vxa-dot');
  launchAv.append(launchDot);
  launch.append(launchAv, el('span', 'vxa-launch__txt', 'Questions? Ask us'));

  // greeting nudge
  const nudge = el('div', 'vxa-nudge');
  nudge.hidden = true;
  const nudgeBody = el('button', 'vxa-nudge__body');
  nudgeBody.type = 'button';
  const nudgeText = el('span', 'vxa-nudge__text');
  nudgeText.append(el('strong', null, 'Hello. Can I help?'), el('span', null, 'Ask about prices, repairs or booking a survey.'));
  const nudgeAv = el('span', 'vxa-nudge__av');
  nudgeAv.innerHTML = SVG.mark;
  nudgeBody.append(nudgeAv, nudgeText);
  const nudgeX = el('button', 'vxa-nudge__x');
  nudgeX.type = 'button';
  nudgeX.setAttribute('aria-label', 'Dismiss');
  nudgeX.innerHTML = SVG.close;
  nudge.append(nudgeBody, nudgeX);

  // panel
  const panel = el('section', 'vxa');
  panel.id = 'vxa-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'vxa-title');
  panel.setAttribute('aria-describedby', 'vxa-status');
  panel.setAttribute('aria-hidden', 'true');
  panel.tabIndex = -1;
  panel.inert = true;

  const head = el('div', 'vxa__head');
  const av = el('span', 'vxa__av');
  av.innerHTML = SVG.mark;
  const headDot = el('span', 'vxa-dot');
  av.append(headDot);
  const titleWrap = el('div', 'vxa__title');
  const title = el('h2', 'vxa__name', `${BRAND} assistant`);
  title.id = 'vxa-title';
  const statusLine = el('p', 'vxa__status');
  statusLine.id = 'vxa-status';
  titleWrap.append(title, statusLine);
  const resetBtn = el('button', 'vxa__btn');
  resetBtn.type = 'button';
  resetBtn.setAttribute('aria-label', 'Start a new conversation');
  resetBtn.title = 'Start again';
  resetBtn.innerHTML = SVG.reset;
  const closeBtn = el('button', 'vxa__btn');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close chat');
  closeBtn.title = 'Close';
  closeBtn.innerHTML = SVG.close;
  head.append(av, titleWrap, resetBtn, closeBtn);

  const scroller = el('div', 'vxa__scroll');
  const log = el('div', 'vxa__log');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');
  log.setAttribute('aria-label', 'Conversation');
  const typingEl = el('div', 'vxa__typing');
  typingEl.setAttribute('aria-hidden', 'true');
  typingEl.hidden = true;
  typingEl.append(el('span'), el('span'), el('span'));
  const chipsEl = el('div', 'vxa__chips');
  chipsEl.setAttribute('role', 'group');
  chipsEl.setAttribute('aria-label', 'Suggested replies');
  scroller.append(log, typingEl, chipsEl);

  const form = el('form', 'vxa__form');
  form.setAttribute('autocomplete', 'off');
  const inputLabel = el('label', 'sr', 'Type your question');
  inputLabel.htmlFor = 'vxa-input';
  const input = el('input');
  input.id = 'vxa-input';
  input.type = 'text';
  input.maxLength = MAX_IN;
  input.placeholder = 'Ask about windows, doors, repairs…';
  input.setAttribute('enterkeyhint', 'send');
  input.setAttribute('autocapitalize', 'sentences');
  const sendBtn = el('button', 'vxa__send');
  sendBtn.type = 'submit';
  sendBtn.setAttribute('aria-label', 'Send');
  sendBtn.innerHTML = SVG.send;
  form.append(inputLabel, input, sendBtn);

  const foot = el('div', 'vxa__foot');
  const human = link(waUrl(hi()), null, 'vxa__human');
  human.append(icon('wa'), el('span', null, 'WhatsApp a person'));
  const footNote = el('p', 'vxa__fine');
  footNote.append(document.createTextNode('Automated answers · '), link('/privacy/', 'Privacy'));
  foot.append(human, footNote);

  panel.append(head, scroller, form, foot);
  document.body.append(launch, nudge, panel);

  /* ---------- rendering (textContent only) ---------- */
  function inl(parent, x) {
    (Array.isArray(x) ? x : [x]).forEach((p) => {
      if (typeof p === 'string') parent.append(document.createTextNode(p));
      else if (p && typeof p.b === 'string') parent.append(el('strong', null, p.b));
      else if (p && typeof p.a === 'string') { const h = safeHref(p.h); parent.append(h ? link(h, p.a) : document.createTextNode(p.a)); }
    });
    return parent;
  }
  function renderBlock(bk) {
    const x = bk.x;
    switch (bk.t) {
      case 'h': return inl(el('p', 'vxa__h'), x);
      case 'ey': return inl(el('p', 'vxa__ey'), x);
      case 'p': return inl(el('p'), x);
      case 'note': return inl(el('p', 'vxa__note'), x);
      case 'ul': case 'ol': { const l = el(bk.t); x.forEach((i) => l.append(inl(el('li'), i))); return l; }
      case 'tags': { const l = el('ul', 'vxa__tags'); x.forEach((t) => l.append(el('li', null, t))); return l; }
      case 'sw': {
        const l = el('ul', 'vxa__sw');
        x.forEach(([n, hex]) => {
          const li = el('li');
          const dot = el('span', 'vxa__swatch');
          dot.style.backgroundColor = /^#[0-9a-f]{6}$/i.test(hex) ? hex : 'transparent';
          li.append(dot, el('span', null, n));
          l.append(li);
        });
        return l;
      }
      case 'tbl': {
        const wrap = el('div', 'vxa__tblwrap');
        const t = el('table', 'vxa__tbl');
        const thead = el('thead');
        const hr = el('tr');
        x.h.forEach((c, i) => { const th = el(i ? 'th' : 'td', null, c); if (i) th.scope = 'col'; hr.append(th); });
        thead.append(hr);
        const tb = el('tbody');
        x.r.forEach((r) => {
          const tr = el('tr');
          r.forEach((c, i) => { const cell = el(i ? 'td' : 'th', null, c); if (!i) cell.scope = 'row'; tr.append(cell); });
          tb.append(tr);
        });
        t.append(thead, tb);
        wrap.append(t);
        return wrap;
      }
      case 'card': {
        const h = safeHref(x.h);
        if (!h) return null;
        const a = link(h, null, 'vxa__card');
        const txt = el('span', 'vxa__card-txt');
        if (x.e) txt.append(el('span', 'vxa__card-ey', x.e));
        txt.append(el('span', 'vxa__card-t', x.t));
        if (x.d) txt.append(el('span', 'vxa__card-d', x.d));
        a.append(txt, icon('arrow'));
        return a;
      }
      case 'act': {
        const wrap = el('div', 'vxa__acts');
        x.forEach((b) => {
          const h = safeHref(b.h);
          if (!h) return;
          const a = link(h, null, `vxa__act vxa__act--${b.s}`);
          if (b.s === 'wa' || b.s === 'call' || b.s === 'mail') a.append(icon(b.s));
          a.append(el('span', null, b.l));
          wrap.append(a);
        });
        return wrap;
      }
      case 'wa': {
        const box = el('div', 'vxa__wa');
        box.append(el('p', 'vxa__wa-label', 'Your message'));
        const pre = el('p', 'vxa__wa-text', x.m);
        box.append(pre);
        const row = el('div', 'vxa__wa-row');
        const send = link(waUrl(x.m), null, 'vxa__act vxa__act--wa');
        send.append(icon('wa'), el('span', null, 'Send on WhatsApp'));
        const copy = el('button', 'vxa__act vxa__act--ghost', 'Copy text');
        copy.type = 'button';
        copy.addEventListener('click', () => {
          const done = (ok) => { copy.textContent = ok ? 'Copied' : 'Select and copy'; setTimeout(() => (copy.textContent = 'Copy text'), 2200); };
          if (navigator.clipboard?.writeText) navigator.clipboard.writeText(x.m).then(() => done(true), () => done(false));
          else done(false);
        });
        row.append(send, copy);
        box.append(row);
        return box;
      }
      default: return null;
    }
  }
  function renderMsg(m) {
    if (m.t === 'u') {
      const d = el('div', 'vxa__msg vxa__msg--user');
      d.append(el('span', 'sr', 'You: '), document.createTextNode(m.x));
      return d;
    }
    const d = el('div', 'vxa__msg vxa__msg--bot');
    d.dataset.kind = m.k;
    if (m.b.some((bk) => bk.t === 'tbl' || bk.t === 'wa' || bk.t === 'card' || bk.t === 'act')) d.classList.add('vxa__msg--wide');
    d.append(el('span', 'sr', 'Assistant: '));
    m.b.forEach((bk) => { const n = renderBlock(bk); if (n) d.append(n); });
    return d;
  }
  function renderChips() {
    chipsEl.replaceChildren();
    state.chips.forEach((c) => {
      let b;
      if (c.h) {
        const h = safeHref(c.h);
        if (!h) return;
        b = link(h, null, `vxa__chip${c.w ? ' vxa__chip--wa' : ''}`);
        if (c.w) b.append(icon('wa'));
        b.append(el('span', null, c.l));
      } else {
        b = el('button', `vxa__chip${c.a === 'cancel' ? ' vxa__chip--quiet' : ''}`, c.l);
        b.type = 'button';
        b.addEventListener('click', () => handle(c.s || c.l, c));
      }
      chipsEl.append(b);
    });
  }
  const atBottom = () => scroller.scrollTo({ top: scroller.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' });
  function reveal(node) {
    // long answers: show their start; short ones: show the newest content and the chips
    if (node && node.offsetHeight > scroller.clientHeight * 0.7) scroller.scrollTo({ top: Math.max(0, node.offsetTop - 12), behavior: reduced() ? 'auto' : 'smooth' });
    else atBottom();
  }
  let rendered = false;
  function renderAll() {
    log.setAttribute('aria-live', 'off'); // don't re-announce restored history
    log.replaceChildren(...state.msgs.map((m) => { const n = renderMsg(m); n.classList.add('is-restored'); return n; }));
    renderChips();
    rendered = true;
    scroller.scrollTop = scroller.scrollHeight;
    setTimeout(() => log.setAttribute('aria-live', 'polite'), 50);
  }

  /* ---------- sending ---------- */
  let speed = 1;
  let pending = 0;
  let queue = Promise.resolve();
  const busy = (d) => { pending += d; panel.toggleAttribute('data-busy', pending > 0); };
  function push(m) {
    const c = cMsg(m); // the same check stored messages go through
    if (!c) return null;
    state.msgs.push(c);
    save();
    const n = renderMsg(c);
    log.append(n);
    return n;
  }
  function emit(resp) {
    busy(1);
    queue = queue.then(() => new Promise((res) => {
      state.chips = [];
      renderChips();
      typingEl.hidden = false;
      atBottom();
      const len = JSON.stringify(resp.b).length;
      const delay = speed === 0 ? 0 : reduced() ? 120 : Math.min(900, 280 + len * 0.6);
      setTimeout(() => {
        typingEl.hidden = true;
        const n = push({ t: 'b', k: resp.k || 'answer', b: resp.b });
        state.chips = arr(resp.c).map(cChip).filter(Boolean);
        renderChips();
        save();
        reveal(n);
        busy(-1);
        res();
      }, delay);
    }));
    return queue;
  }
  const userSays = (text) => {
    const n = push({ t: 'u', x: text });
    atBottom();
    return n;
  };

  /* ---------- flows ---------- */
  const curStep = () => (state.flow ? FLOWS[state.flow.n].steps[state.flow.i] : null);
  function startFlow(name, data = {}, pre = []) {
    const d = {};
    DATA_KEYS.forEach((k) => { if (typeof data[k] === 'string') d[k] = clean(data[k], 160); });
    state.flow = { n: name, i: 0, d, o: 0 };
    save();
    const F = FLOWS[name];
    return askStep([...pre, H(F.head), P(F.intro)]);
  }
  function askStep(pre = []) {
    const F = FLOWS[state.flow.n];
    const d = state.flow.d;
    const live = F.steps.filter((s) => !(s.skip && s.skip(d)));
    while (state.flow.i < F.steps.length) {
      const s = F.steps[state.flow.i];
      if (d[s.key] != null || (s.skip && s.skip(d))) state.flow.i++;
      else break;
    }
    const s = curStep();
    if (!s) return finishFlow(pre);
    save();
    const n = live.indexOf(s) + 1;
    const ask = typeof s.ask === 'function' ? s.ask(d) : s.ask;
    const opts = s.opts(d);
    return emit({
      k: `ask:${state.flow.n}`,
      b: [...pre, NOTE(`Question ${n} of ${live.length}`), P(B(ask))],
      c: [...opts.map((o, i) => ({ l: o, a: `opt:${i}` })), CA('Cancel', 'cancel')],
    });
  }
  function flowInput(val) {
    const F = FLOWS[state.flow.n];
    const s = curStep();
    const d = state.flow.d;
    let v = clean(val, 160).replace(/\s+/g, ' ').trim();
    const opts = s.opts(d);
    const hit = opts.find((o) => norm(o) === norm(v));
    if (hit) v = hit;
    const skip = /^(skip|no|none|n a|na|rather not|prefer not|no thanks|not now)$/.test(norm(v));
    const q = prep(v);

    if (state.flow.o === 1) { // free description after "Something else"
      const rep = topRepair(q, 3);
      d.problem = rep ? rep.name : 'Something else';
      if (rep) d.repair = rep.slug;
      d.detail = v.slice(0, 160);
      state.flow.o = 0;
      state.flow.i++;
      return askStep();
    }
    switch (s.key) {
      case 'postcode': {
        if (skip) { d.postcode = ''; break; }
        const pc = parsePostcode(v);
        if (!pc) {
          return emit({ k: `ask:${state.flow.n}`, b: [P('That doesn’t look like a UK postcode. Try something like SW1A 1AA, or just the first half, such as SW1A.')], c: [{ l: 'Skip', a: 'opt:0' }, CA('Cancel', 'cancel')] });
        }
        d.postcode = pc;
        break;
      }
      case 'name': {
        d.name = skip ? '' : v.replace(/<[^>]*>/g, ' ').replace(/[^\p{L}\p{M}' .-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 50);
        break;
      }
      case 'what': {
        if (state.flow.n === 'survey' && /repair/i.test(v)) {
          state.flow = null;
          return startFlow('repair', {}, [P('No problem, let’s set up a repair request instead.')]);
        }
        if (hit) { d.what = hit; break; }
        const p = findProduct(q);
        if (p) { d.what = p.cat === 'doors' ? 'Doors' : 'Windows'; d.style = p.name; d.slug = p.slug; break; }
        const g = guessQuote(q);
        d.what = g.what ? (state.flow.n === 'survey' && /^(windows|doors)$/i.test(g.what) ? `New ${g.what.toLowerCase()}` : g.what) : v.slice(0, 80);
        break;
      }
      case 'style': {
        const p = productBy(arr(KB?.products).find((x) => x.name === hit)?.slug) || findProduct(q);
        if (p) { d.style = p.name; d.slug = p.slug; } else d.style = hit || v.slice(0, 80);
        break;
      }
      case 'problem': {
        if (hit === 'Something else') {
          state.flow.o = 1;
          save();
          return emit({ k: `ask:${state.flow.n}`, b: [P(B('Tell me in a few words what’s wrong.')), NOTE('For example: back door handle is floppy, or water coming in under the patio door.')], c: [CA('Cancel', 'cancel')] });
        }
        const rep = hit ? arr(KB?.repairs).find((r) => r.name === hit) : topRepair(q, 3);
        d.problem = rep ? rep.name : 'Something else';
        if (rep) d.repair = rep.slug;
        if (!hit) d.detail = v.slice(0, 160);
        const u = urgentType(q);
        if (u) d.urgency = 'Can’t secure the property';
        break;
      }
      default:
        d[s.key] = hit || v.slice(0, 80);
    }
    state.flow.i++;
    return askStep(s.key === 'postcode' && d.postcode && !coversOk(d.postcode) ? [P([B(d.postcode), ' may be just outside our usual area. The team will confirm when you message them.'])] : []);
  }
  const coversOk = (pc) => {
    const pre = arr(KB?.business?.postcodePrefixes);
    return !pre.length || typeof VX.coversPostcode !== 'function' || VX.coversPostcode(pc, pre) !== false;
  };
  function finishFlow(pre = []) {
    const { n, d } = state.flow;
    state.flow = null;
    save();
    const first = (d.name || '').split(' ')[0];
    const line = (k, v) => (v ? `• ${k}: ${v}` : null);
    let lines;
    let b;
    let c;
    if (n === 'quote') {
      lines = [hi('I’d like a quote.'), '', '*Quote request*', line('For', d.style && d.style !== 'Not sure' ? d.style : d.what), line('Style', d.style === 'Not sure' ? 'Not sure yet' : ''), line('How many', d.count), line('Postcode', d.postcode), line('Name', d.name), '', 'I can send rough sizes and a photo of each one from outside.'];
      b = [H(`Thanks${first ? `, ${first}` : ''}. Your request is ready`), P('Tap Send on WhatsApp and the message opens ready to go. Add a photo of each window or door from outside, and we’ll reply with an estimate.'), WAMSG(lines.filter((x) => x != null).join('\n'))];
      c = [CL('Use the visual quote builder', d.slug ? `/quote/?item=${d.slug}` : '/quote/'), C('How do I measure?'), CA('Something else', 'menu')];
    } else if (n === 'repair') {
      const urgentNow = /secure the property/i.test(d.urgency || '');
      lines = [hi('I need a repair.'), '', '*Repair request*', line('Problem', d.problem), line('Details', d.detail), line('Where', d.on), line('Urgency', d.urgency), line('Postcode', d.postcode), line('Name', d.name), '', 'I’ll attach photos of the problem in this chat.'];
      b = [H(`Thanks${first ? `, ${first}` : ''}. Your repair request is ready`), P('Tap Send on WhatsApp, then attach a photo of the problem in the same chat. A close-up of the lock edge or hinge helps us bring the right part.'), WAMSG(lines.filter((x) => x != null).join('\n'))];
      if (urgentNow) {
        const st = status();
        b.push(P(B('If you can’t secure the property, call us now rather than waiting for a reply.')), ACT(bCall()));
        if (st && !st.open) b.push(NOTE(`${st.text}. If it can’t be made secure before then, an emergency glazier or locksmith is the safer option.`));
      }
      const rep = d.repair ? repairBy(d.repair) : null;
      c = [rep && CL('About this repair', rep.url), CL('Book a visit online', `/book/?type=repair${rep ? `&repair=${rep.slug}` : ''}`), CA('Something else', 'menu')].filter(Boolean);
    } else {
      lines = [hi('I’d like to book a survey.'), '', '*Survey request*', line('For', d.what), line('How many', d.count), line('Best time', d.when), line('Postcode', d.postcode), line('Name', d.name), '', 'Please let me know which dates you have.'];
      b = [H(`Thanks${first ? `, ${first}` : ''}. Your survey request is ready`), P('Tap Send on WhatsApp and the team will reply with dates. Allow about 30 to 60 minutes for the survey of a typical house.'), WAMSG(lines.filter((x) => x != null).join('\n'))];
      c = [CL('Book on the online form', '/book/?type=survey'), C('Is the survey free?', 'Are the survey and quote really free?'), CA('Something else', 'menu')];
    }
    return emit({ k: `done:${n}`, b: [...pre, ...b], c });
  }

  /* ---------- handling input ---------- */
  const CANCEL = /^(cancel|stop|exit|quit|start again|restart|never ?mind|forget it|abort|nahi|no thanks cancel)$/;
  const MENU = /^(menu|main menu|help|options|start|topics)$/;
  const looksLikeQuestion = (raw, q) => wc(q) >= 3 && (/\?\s*$/.test(raw) || /^(how|what|whats|when|where|why|who|which|do|does|did|can|could|is|are|will|would|should|have)\b/.test(q));

  async function handle(raw, chip) {
    const text = clean(raw, MAX_IN).replace(/\s+/g, ' ').trim();
    if (!text && !chip) return;
    await loadKB();
    if (!rendered) renderAll();
    userSays(chip ? chip.l : text);
    if (!chip) human.href = waUrl(hi(`I have a question: ${text}`));
    if (chip?.a) return action(chip.a);
    const n = norm(text);
    if (CANCEL.test(n)) return cancel();
    if (MENU.test(n)) return menu();

    if (state.flow) {
      const s = curStep();
      const q = prep(text);
      const isOpt = s.opts(state.flow.d).some((o) => norm(o) === n);
      if (!isOpt && state.flow.o !== 1 && !s.free) {
        const u = urgentType(q);
        if (u) { state.flow = null; save(); return emit(urgent(u, q)); }
        if (looksLikeQuestion(text, q)) {
          const r = route(text);
          if (!r.flow && !/^(fallback|dym|greet|thanks|bye)$/.test(r.k)) {
            emit({ ...r, c: [] });
            return askStep([NOTE(`Back to your ${FLOWS[state.flow.n].title}.`)]);
          }
        }
      }
      return flowInput(text);
    }
    return say(route(text));
  }
  function say(r) {
    if (r.flow) return startFlow(r.flow, r.data || {});
    return emit(r);
  }
  function cancel() {
    const had = !!state.flow;
    state.flow = null;
    save();
    return emit({ k: 'cancel', b: [P(had ? 'No problem, I’ve cancelled that. What else can I help with?' : 'No problem. What else can I help with?')], c: MAIN() });
  }
  const menu = () => {
    state.flow = null;
    save();
    return emit({ k: 'menu', b: [P('What else can I help with? Pick a topic or type a question.')], c: MAIN() });
  };
  function action(a) {
    if (!ACTION_RX.test(a)) return menu();
    if (a === 'cancel') return cancel();
    if (a === 'menu') return menu();
    if (a.startsWith('opt:')) {
      const s = curStep();
      if (!s) return menu();
      const opts = state.flow.o === 1 ? [] : s.opts(state.flow.d);
      const v = s.type && a === 'opt:0' && !opts.length ? 'Skip' : opts[Number(a.slice(4))];
      return v ? flowInput(v) : askStep();
    }
    if (a.startsWith('flow:')) {
      const [, name, slug, u] = a.split(':');
      const data = {};
      if (name === 'quote' && slug) Object.assign(data, guessQuote(prep((productBy(slug) || {}).name || '')));
      if (name === 'repair' && slug && repairBy(slug)) { data.problem = repairBy(slug).name; data.repair = slug; }
      if (name === 'repair' && (u === 'u' || slug === 'u')) data.urgency = 'Can’t secure the property';
      return startFlow(name, data);
    }
    if (a.startsWith('ref:')) {
      const [, type, i] = a.split(':');
      const d = KB?.docs.find((x) => x.type === type && x.i === Number(i));
      return emit(d ? docAnswer(d) : fallback(''));
    }
    return menu();
  }

  /* =====================================================================
     Open, close, focus, nudge
     ===================================================================== */
  let isOpen = false;
  let opener = null;
  function refreshStatus() {
    const st = status();
    const open = !!st?.open;
    [launchDot, headDot].forEach((d) => d.classList.toggle('is-open', open));
    statusLine.textContent = st ? st.text : 'Automated answers, any time';
    launch.title = st ? `Team: ${st.text}` : '';
  }
  const vv = window.visualViewport;
  function fitViewport() {
    if (!isOpen || !mqMobile.matches || !vv) { panel.style.removeProperty('--vxa-vh'); panel.style.removeProperty('--vxa-top'); return; }
    panel.style.setProperty('--vxa-vh', `${Math.round(vv.height)}px`);
    panel.style.setProperty('--vxa-top', `${Math.round(vv.offsetTop)}px`);
  }
  function setModal() {
    const modal = isOpen && mqMobile.matches;
    panel.setAttribute('aria-modal', String(modal));
    document.documentElement.classList.toggle('vxa-locked', modal);
    fitViewport();
  }
  let statusTimer;
  function open({ focus = true } = {}) {
    if (isOpen) { if (focus) input.focus({ preventScroll: true }); return; }
    hideNudge(true);
    const ae = document.activeElement;
    opener = ae && ae !== document.body ? ae : null;
    isOpen = true;
    panel.inert = false;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    launch.setAttribute('aria-expanded', 'true');
    launch.hidden = true;
    refreshStatus();
    clearInterval(statusTimer);
    statusTimer = setInterval(refreshStatus, 60000);
    setModal();
    loadKB();
    if (!rendered) renderAll();
    if (!state.msgs.length) emit(welcome());
    if (focus) setTimeout(() => (mqMobile.matches ? panel : input).focus({ preventScroll: true }), 60);
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    clearInterval(statusTimer);
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    launch.hidden = false;
    launch.setAttribute('aria-expanded', 'false');
    setModal();
    const visible = (n) => n && document.contains(n) && n.getClientRects().length > 0;
    const back = visible(opener) ? opener : visible(launch) ? launch : document.querySelector('[data-chat-open]');
    if (back && visible(back)) back.focus({ preventScroll: true });
    opener = null;
  }
  function reset() {
    state = { ...fresh(), nudged: 1 };
    save();
    log.replaceChildren();
    renderChips();
    human.href = waUrl(hi());
    emit(welcome());
    input.focus({ preventScroll: true });
  }
  const focusables = () => [...panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((n) => n.getClientRects().length > 0);

  launch.addEventListener('click', () => open());
  launch.addEventListener('pointerenter', () => loadKB(), { once: true });
  document.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target.closest('[data-chat-open]') : null;
    if (t) { e.preventDefault(); open(); }
  });
  closeBtn.addEventListener('click', close);
  resetBtn.addEventListener('click', reset);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab' || !mqMobile.matches) return;
    const f = focusables();
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  // full-screen on phones is modal: keep focus inside it
  document.addEventListener('focusin', (e) => {
    if (isOpen && mqMobile.matches && !panel.contains(e.target)) (focusables()[0] || panel).focus({ preventScroll: true });
  });
  panel.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href^="/"]') : null;
    // following a site link on a wide screen: reopen the chat on the next page so the thread continues
    if (a && !mqMobile.matches && state.msgs.length) { state.reopen = 1; save(); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    handle(v);
  });
  mqMobile.addEventListener?.('change', setModal);
  vv?.addEventListener('resize', fitViewport);
  vv?.addEventListener('scroll', fitViewport);

  // one-time greeting bubble: desktop only, once per session, not on the quote or booking pages
  let nudgeTimer;
  function hideNudge(now) {
    clearTimeout(nudgeTimer);
    if (nudge.hidden) return;
    if (now || reduced()) { nudge.hidden = true; nudge.classList.remove('is-in'); return; }
    nudge.classList.remove('is-in');
    setTimeout(() => (nudge.hidden = true), 220);
  }
  function maybeNudge() {
    if (compact || state.nudged || state.msgs.length) return;
    nudgeTimer = setTimeout(() => {
      const ae = document.activeElement;
      if (isOpen || mqMobile.matches || document.hidden || state.nudged || state.msgs.length || document.body.classList.contains('nav-open')) return;
      if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
      state.nudged = 1;
      save();
      refreshStatus();
      nudge.hidden = false;
      requestAnimationFrame(() => nudge.classList.add('is-in'));
      nudgeTimer = setTimeout(() => hideNudge(), 30000);
    }, 8000);
  }
  nudgeBody.addEventListener('click', () => open());
  nudgeX.addEventListener('click', () => { hideNudge(); launch.focus({ preventScroll: true }); });

  refreshStatus();
  if (state.reopen) {
    state.reopen = 0;
    save();
    if (!mqMobile.matches && state.msgs.length) open({ focus: false });
  }
  maybeNudge();

  // small API for the site and for testing
  VX.assistant = {
    open: () => open(),
    close,
    reset,
    handle: (t) => handle(t),
    ask: (t) => loadKB().then(() => {
      const r = route(clean(t, MAX_IN));
      const h = arr(r.b).find((bk) => bk.t === 'h');
      return { kind: r.k || '', title: h ? (typeof h.x === 'string' ? h.x : '') : '' };
    }),
    search: (t) => loadKB().then(() => search(prep(t)).map((h) => ({ type: h.d.type, label: label(h.d), score: Math.round(h.s * 100) / 100, sure: h.sure, hit: h.hit.join(',') }))),
    prep: (t) => prep(t),
    setSpeed: (n) => { speed = n ? 1 : 0; },
  };
})();
