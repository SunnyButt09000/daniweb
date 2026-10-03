// Architectural-style elevation drawings, generated as inline SVG.
// Convention (as on UK window schedules): dashed lines meet at the hinge side
// of an opening sash; arrows show sliding directions. Drawn as seen from outside.

import { lucide, brands } from './icons.mjs';

const r = (n) => Math.round(n * 10) / 10;

export function icon(name, { size = 20, cls = '', label = '' } = {}) {
  const inner = lucide[name];
  if (!inner) throw new Error(`Unknown icon: ${name}`);
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="ico ${cls}" ${a11y} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

export function brandIcon(name, { size = 20, cls = '', label = '' } = {}) {
  const d = brands[name];
  if (!d) throw new Error(`Unknown brand icon: ${name}`);
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="ico ${cls}" ${a11y} width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="${d}"/></svg>`;
}

export function logoMark(size = 30) {
  return `<svg class="logo-mark" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="1.5" y="1.5" width="29" height="29" fill="none" stroke="currentColor" stroke-width="3"/><path d="M16 3v26M3 13h26" stroke="currentColor" stroke-width="2.5"/><rect x="18.5" y="15.5" width="9.5" height="11.5" fill="var(--brass)"/></svg>`;
}

/* ---------- primitives ---------- */
const frame = (x, y, w, h, t = 7) =>
  `<rect class="d-frame" x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}"/>` +
  `<rect class="d-line" x="${r(x + t)}" y="${r(y + t)}" width="${r(w - 2 * t)}" height="${r(h - 2 * t)}"/>`;

const sash = (x, y, w, h, t = 6) =>
  `<rect class="d-sash" x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}"/>` +
  `<rect class="d-glass" x="${r(x + t)}" y="${r(y + t)}" width="${r(w - 2 * t)}" height="${r(h - 2 * t)}"/>` +
  glint(x + t, y + t, w - 2 * t, h - 2 * t);

const pane = (x, y, w, h) =>
  `<rect class="d-glass" x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}"/>` + glint(x, y, w, h);

function glint(x, y, w, h) {
  const s = Math.min(w, h) * 0.32;
  return `<path class="d-glint" d="M${r(x + w * 0.16)} ${r(y + h * 0.16 + s)} L${r(x + w * 0.16 + s)} ${r(y + h * 0.16)} M${r(x + w * 0.16)} ${r(y + h * 0.16 + s * 1.5)} L${r(x + w * 0.16 + s * 1.5)} ${r(y + h * 0.16)}"/>`;
}

// side: 'left' | 'right' | 'top' | 'bottom' — the hinge side
function hinge(x, y, w, h, side, cls = 'd-open') {
  const pts = {
    left: [[x + w, y], [x, y + h / 2], [x + w, y + h]],
    right: [[x, y], [x + w, y + h / 2], [x, y + h]],
    top: [[x, y + h], [x + w / 2, y], [x + w, y + h]],
    bottom: [[x, y], [x + w / 2, y + h], [x + w, y]],
  }[side];
  return `<polyline class="${cls}" points="${pts.map((p) => p.map(r).join(',')).join(' ')}"/>`;
}

function arrow(x1, y1, x2, y2) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const L = 6;
  const p1 = [x2 - L * Math.cos(a - 0.5), y2 - L * Math.sin(a - 0.5)];
  const p2 = [x2 - L * Math.cos(a + 0.5), y2 - L * Math.sin(a + 0.5)];
  return `<path class="d-arrow" d="M${r(x1)} ${r(y1)} L${r(x2)} ${r(y2)} M${r(p1[0])} ${r(p1[1])} L${r(x2)} ${r(y2)} L${r(p2[0])} ${r(p2[1])}"/>`;
}

const handleV = (x, y) => `<rect class="d-handle" x="${r(x - 1.6)}" y="${r(y - 9)}" width="3.2" height="18" rx="1.6"/>`;
const handleH = (x, y) => `<rect class="d-handle" x="${r(x - 9)}" y="${r(y - 1.6)}" width="18" height="3.2" rx="1.6"/>`;

function dimH(x1, x2, y, label) {
  return `<g class="d-dim"><path d="M${r(x1)} ${r(y)} H${r(x2)} M${r(x1)} ${r(y - 4)} V${r(y + 4)} M${r(x2)} ${r(y - 4)} V${r(y + 4)}"/><text x="${r((x1 + x2) / 2)}" y="${r(y - 5)}" text-anchor="middle">${label}</text></g>`;
}
function dimV(x, y1, y2, label) {
  const cy = (y1 + y2) / 2;
  return `<g class="d-dim"><path d="M${r(x)} ${r(y1)} V${r(y2)} M${r(x - 4)} ${r(y1)} H${r(x + 4)} M${r(x - 4)} ${r(y2)} H${r(x + 4)}"/><text x="${r(x - 6)}" y="${r(cy)}" text-anchor="middle" transform="rotate(-90 ${r(x - 6)} ${r(cy)})">${label}</text></g>`;
}

const wrap = (vb, body, label) =>
  `<svg class="diagram" viewBox="${vb}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;

/* ---------- product elevations ---------- */
const drawings = {
  'casement-windows'() {
    const X = 20, Y = 30, W = 200, H = 210, t = 8;
    let b = frame(X, Y, W, H, t);
    const ix = X + t, iy = Y + t, iw = W - 2 * t, ih = H - 2 * t;
    const mx = ix + iw / 2;
    b += `<rect class="d-frame" x="${mx - 3}" y="${iy}" width="6" height="${ih}"/>`;
    const ty = iy + 52;
    b += `<rect class="d-frame" x="${mx + 3}" y="${ty - 3}" width="${ix + iw - mx - 3}" height="6"/>`;
    b += sash(ix + 2, iy + 2, iw / 2 - 7, ih - 4);
    b += hinge(ix + 2, iy + 2, iw / 2 - 7, ih - 4, 'left');
    b += handleV(mx - 9, iy + ih / 2);
    b += sash(mx + 5, iy + 2, ix + iw - mx - 7, ty - iy - 7);
    b += hinge(mx + 5, iy + 2, ix + iw - mx - 7, ty - iy - 7, 'top');
    b += pane(mx + 5, ty + 5, ix + iw - mx - 7, iy + ih - ty - 7);
    b += dimH(X, X + W, 16, '1200') + dimV(X + W + 18, Y, Y + H, '1250');
    return wrap('0 0 250 260', b, 'Elevation: casement window with side-hung and top-hung openers');
  },
  'flush-casement-windows'() {
    const X = 20, Y = 30, W = 200, H = 210, t = 11;
    let b = frame(X, Y, W, H, t);
    const ix = X + t, iy = Y + t, iw = W - 2 * t, ih = H - 2 * t, mx = ix + iw / 2;
    b += `<rect class="d-frame" x="${mx - 5}" y="${iy}" width="10" height="${ih}"/>`;
    b += pane(ix + 6, iy + 6, iw / 2 - 16, ih - 12) + `<rect class="d-outline" x="${ix}" y="${iy}" width="${iw / 2 - 5}" height="${ih}"/>`;
    b += hinge(ix, iy, iw / 2 - 5, ih, 'left');
    b += pane(mx + 10, iy + 6, iw / 2 - 16, ih - 12) + `<rect class="d-outline" x="${mx + 5}" y="${iy}" width="${iw / 2 - 5}" height="${ih}"/>`;
    b += hinge(mx + 5, iy, iw / 2 - 5, ih, 'right');
    b += handleV(mx - 12, iy + ih / 2) + handleV(mx + 12, iy + ih / 2);
    b += `<text class="d-note" x="${X + W / 2}" y="${Y + H + 16}" text-anchor="middle">SASH FLUSH WITH FRAME</text>`;
    b += dimH(X, X + W, 16, '1200');
    return wrap('0 0 250 260', b, 'Elevation: flush casement window, both sashes side-hung');
  },
  'tilt-and-turn-windows'() {
    const X = 45, Y = 30, W = 150, H = 210, t = 8;
    let b = frame(X, Y, W, H, t);
    const ix = X + t + 2, iy = Y + t + 2, iw = W - 2 * t - 4, ih = H - 2 * t - 4;
    b += sash(ix, iy, iw, ih);
    b += hinge(ix, iy, iw, ih, 'left');
    b += hinge(ix, iy, iw, ih, 'bottom', 'd-open d-open--alt');
    b += handleV(ix + iw - 8, iy + ih / 2);
    b += `<text class="d-note" x="${X + W / 2}" y="${Y + H + 16}" text-anchor="middle">TURN ─ ─   TILT ─ · ─</text>`;
    b += dimH(X, X + W, 16, '900');
    return wrap('0 0 240 260', b, 'Elevation: tilt and turn window, side-hung turn and bottom-hung tilt');
  },
  'sash-windows'() {
    const X = 55, Y = 22, W = 130, H = 222, t = 8;
    let b = frame(X, Y, W, H, t);
    const ix = X + t, iy = Y + t, iw = W - 2 * t, ih = H - 2 * t, mid = iy + ih / 2;
    b += sash(ix + 2, iy + 2, iw - 4, ih / 2 + 2);
    b += sash(ix + 5, mid - 2, iw - 10, ih / 2);
    // horns and glazing bars
    b += `<path class="d-line" d="M${ix + 2} ${mid + 4} l-3 8 M${ix + iw - 2} ${mid + 4} l3 8"/>`;
    b += `<path class="d-bar" d="M${ix + iw / 2} ${iy + 8} V${mid - 4} M${ix + 8} ${iy + ih / 4 + 2} H${ix + iw - 8} M${ix + iw / 2} ${mid + 4} V${iy + ih - 6} M${ix + 11} ${mid + ih / 4} H${ix + iw - 11}"/>`;
    b += arrow(X + W + 16, mid + 30, X + W + 16, mid - 10) + arrow(X - 16, mid - 30, X - 16, mid + 10);
    b += `<rect class="d-handle" x="${ix + iw / 2 - 7}" y="${mid - 4}" width="14" height="4" rx="2"/>`;
    return wrap('0 0 240 260', b, 'Elevation: vertical sliding sash window with Georgian bars');
  },
  'bay-and-bow-windows'() {
    let b = '';
    // plan view
    b += `<path class="d-outline" d="M20 236 L60 206 L190 206 L230 236"/><path class="d-line" d="M28 236 L64 212 L186 212 L222 236" />`;
    b += `<text class="d-note" x="125" y="252" text-anchor="middle">PLAN · 45° BAY</text>`;
    // elevation: three facets, sides foreshortened
    b += `<path class="d-frame" d="M20 40 L60 30 L60 180 L20 190 Z"/><path class="d-glass" d="M27 47 L53 41 L53 172 L27 178 Z"/>`;
    b += `<path class="d-frame" d="M230 40 L190 30 L190 180 L230 190 Z"/><path class="d-glass" d="M223 47 L197 41 L197 172 L223 178 Z"/>`;
    b += `<polyline class="d-open" points="53,41 27,112 53,172"/><polyline class="d-open" points="197,41 223,112 197,172"/>`;
    b += frame(60, 30, 130, 150, 7) + pane(67, 37, 116, 136);
    b += `<path class="d-outline" d="M14 40 L60 22 L190 22 L236 40"/>`;
    return wrap('0 0 250 260', b, 'Elevation and plan: three-facet bay window');
  },
  'sliding-windows'() {
    const X = 15, Y = 50, W = 220, H = 150, t = 8;
    let b = frame(X, Y, W, H, t);
    const ix = X + t, iy = Y + t, iw = W - 2 * t, ih = H - 2 * t;
    b += sash(ix + 2, iy + 2, iw / 2 + 4, ih - 4);
    b += sash(ix + iw / 2 - 6, iy + 6, iw / 2 + 4, ih - 12);
    b += arrow(ix + iw / 2 + 50, Y + H + 20, ix + iw / 2 - 10, Y + H + 20);
    b += handleV(ix + iw / 2 + 2, iy + ih / 2);
    b += dimH(X, X + W, 36, '1500');
    return wrap('0 0 250 240', b, 'Elevation: horizontal sliding window');
  },
  'shaped-and-feature-windows'() {
    let b = `<path class="d-frame" d="M40 240 V110 A85 85 0 0 1 210 110 V240 Z"/>`;
    b += `<path class="d-line" d="M48 232 V110 A77 77 0 0 1 202 110 V232 Z"/>`;
    b += `<path class="d-glass" d="M54 226 V110 A71 71 0 0 1 196 110 V226 Z"/>`;
    b += `<path class="d-bar" d="M125 39 V226 M54 110 H196 M125 110 L75 60 M125 110 L175 60"/>`;
    b += glint(70, 120, 110, 100);
    return wrap('0 0 250 260', b, 'Elevation: arched feature window with radial glazing bars');
  },

  /* doors */
  'upvc-doors'() {
    const X = 60, Y = 20, W = 130, H = 230;
    let b = frame(X, Y, W, H, 8);
    const ix = X + 10, iy = Y + 10, iw = W - 20, ih = H - 18;
    b += `<rect class="d-sash" x="${ix}" y="${iy}" width="${iw}" height="${ih}"/>`;
    b += pane(ix + 14, iy + 14, iw - 28, 92);
    b += `<rect class="d-line" x="${ix + 14}" y="${iy + 120}" width="${iw - 28}" height="${ih - 134}"/>`;
    b += `<rect class="d-handle" x="${ix + iw / 2 - 20}" y="${iy + 128}" width="40" height="9" rx="1"/>`;
    b += hinge(ix, iy, iw, ih, 'left');
    b += `<rect class="d-handle" x="${ix + iw - 14}" y="${iy + ih / 2 - 4}" width="4" height="26" rx="2"/>`;
    b += dimV(X - 18, Y, Y + H, '2090');
    return wrap('0 0 250 260', b, 'Elevation: uPVC front door with glazed top panel and letterplate');
  },
  'composite-doors'() {
    const X = 60, Y = 20, W = 130, H = 230;
    let b = frame(X, Y, W, H, 8);
    const ix = X + 10, iy = Y + 10, iw = W - 20, ih = H - 18;
    b += `<rect class="d-sash d-sash--solid" x="${ix}" y="${iy}" width="${iw}" height="${ih}"/>`;
    b += pane(ix + iw / 2 - 9, iy + 18, 18, ih - 80);
    b += `<path class="d-bar d-bar--light" d="M${ix + 18} ${iy + 18} V${iy + ih - 18} M${ix + iw - 18} ${iy + 18} V${iy + ih - 18}"/>`;
    b += `<rect class="d-handle d-handle--brass" x="${ix + iw / 2 - 18}" y="${iy + ih - 50}" width="36" height="8" rx="1"/>`;
    b += `<rect class="d-handle d-handle--brass" x="${ix + iw - 15}" y="${iy + ih / 2 - 14}" width="5" height="40" rx="2.5"/>`;
    b += hinge(ix, iy, iw, ih, 'left', 'd-open d-open--light');
    b += `<text class="d-note" x="125" y="${Y + H + 0}" text-anchor="middle"> </text>`;
    return wrap('0 0 250 260', b, 'Elevation: composite door with vertical glazing strip');
  },
  'french-doors'() {
    const X = 30, Y = 20, W = 190, H = 230;
    let b = frame(X, Y, W, H, 8);
    const ix = X + 9, iy = Y + 9, iw = W - 18, ih = H - 16, half = iw / 2;
    for (const [sx, side] of [[ix, 'left'], [ix + half + 1, 'right']]) {
      b += `<rect class="d-sash" x="${sx}" y="${iy}" width="${half - 1}" height="${ih}"/>`;
      b += pane(sx + 9, iy + 9, half - 19, ih - 46);
      b += `<rect class="d-line" x="${sx + 9}" y="${iy + ih - 30}" width="${half - 19}" height="21"/>`;
      b += hinge(sx, iy, half - 1, ih, side);
    }
    b += handleV(ix + half - 7, iy + ih / 2) + handleV(ix + half + 8, iy + ih / 2);
    b += dimH(X, X + W, 10, '1500');
    return wrap('0 0 250 260', b, 'Elevation: pair of French doors opening outward');
  },
  'patio-doors'() {
    const X = 10, Y = 30, W = 230, H = 200;
    let b = frame(X, Y, W, H, 8);
    const ix = X + 8, iy = Y + 8, iw = W - 16, ih = H - 16;
    b += sash(ix + 2, iy + 2, iw / 2 + 3, ih - 4, 9);
    b += sash(ix + iw / 2 - 5, iy + 5, iw / 2 + 3, ih - 10, 9);
    b += handleV(ix + iw / 2 + 2, iy + ih / 2);
    b += arrow(ix + iw / 2 + 60, Y + H + 18, ix + iw / 2 - 4, Y + H + 18);
    b += dimH(X, X + W, 16, '2400');
    return wrap('0 0 250 260', b, 'Elevation: in-line sliding patio door');
  },
  'bifold-doors'() {
    const X = 10, Y = 22, W = 230, H = 180;
    let b = frame(X, Y, W, H, 7);
    const ix = X + 7, iy = Y + 7, iw = W - 14, ih = H - 14, pw = iw / 3;
    for (let i = 0; i < 3; i++) {
      b += sash(ix + i * pw + 1, iy + 1, pw - 2, ih - 2, 8);
    }
    b += hinge(ix + 1, iy + 1, pw - 2, ih - 2, 'left');
    b += handleV(ix + 3 * pw - 10, iy + ih / 2);
    // plan of folding leaves
    b += `<path class="d-outline" d="M${X} 240 H${X + W}" /><polyline class="d-open d-open--solid" points="${X + 8},236 ${X + 40},214 ${X + 72},236 ${X + 104},214"/>`;
    b += arrow(X + 130, 226, X + 108, 226);
    b += `<text class="d-note" x="${X + 180}" y="232" text-anchor="middle">PLAN · 3-PANE</text>`;
    return wrap('0 0 250 260', b, 'Elevation and plan: three-pane bi-fold door');
  },
  'stable-doors'() {
    const X = 60, Y = 20, W = 130, H = 230;
    let b = frame(X, Y, W, H, 8);
    const ix = X + 10, iy = Y + 10, iw = W - 20, ih = H - 18, split = iy + ih * 0.48;
    b += `<rect class="d-sash" x="${ix}" y="${iy}" width="${iw}" height="${split - iy - 2}"/>`;
    b += pane(ix + 12, iy + 12, iw - 24, split - iy - 26);
    b += `<rect class="d-sash" x="${ix}" y="${split + 2}" width="${iw}" height="${iy + ih - split - 2}"/>`;
    b += `<rect class="d-line" x="${ix + 12}" y="${split + 14}" width="${iw - 24}" height="${iy + ih - split - 28}"/>`;
    b += hinge(ix, iy, iw, split - iy - 2, 'left') + hinge(ix, split + 2, iw, iy + ih - split - 2, 'left');
    b += handleV(ix + iw - 10, split - 18) + handleV(ix + iw - 10, split + 22);
    return wrap('0 0 250 260', b, 'Elevation: stable door with independently opening top and bottom leaves');
  },
};

export function productDrawing(slug) {
  const fn = drawings[slug];
  if (!fn) throw new Error(`No drawing for ${slug}`);
  return fn();
}

// Compact, decorative version of a product elevation for menus and lists.
// Dimension strings, notes and glints are dropped (they turn to noise at 40–60px),
// the viewBox is trimmed to the drawing, and the SVG is hidden from assistive tech
// because the product name always sits next to it.
export function productThumb(slug, { cls = '' } = {}) {
  if (!drawings[slug]) return '';
  return productDrawing(slug)
    .replace(/<g class="d-dim">.*?<\/g>/g, '')
    .replace(/<text class="d-note"[^>]*>.*?<\/text>/g, '')
    .replace(/<path class="d-glint"[^>]*\/>/g, '')
    .replace(
      /^<svg class="diagram" viewBox="[^"]*" role="img" aria-label="[^"]*"/,
      `<svg class="diagram diagram--thumb${cls ? ` ${cls}` : ''}" viewBox="4 14 242 240" aria-hidden="true" focusable="false"`
    );
}

/* ---------- hero facade ---------- */
/* ---------- hero house: a shallow relief that stands out from the page ---------- */
// Front face is drawn flat; a short extrusion (D) and a soft cast shadow make it read
// as a raised panel fixed to the wall behind it. Light comes from the top left.
export function heroHouse() {
  const D = [14, 11];
  const n1 = (v) => Math.round(v * 10) / 10;
  // outline of the whole house, clockwise on screen
  const sil = [
    [66, 201, 'fascia'], [66, 192, 'roof'], [220, 82, 'roof'], [384, 82, 'chim'], [384, 54, 'chim'], [379, 54, 'chim'], [379, 46, 'chim'],
    [419, 46, 'chim'], [419, 54, 'chim'], [414, 54, 'chim'], [414, 82, 'roof'], [440, 82, 'roof'], [594, 192, 'fascia'], [594, 201, 'fascia'],
    [570, 201, 'wall'], [570, 476, 'wall'], [90, 476, 'wall'], [90, 201, 'fascia'],
  ];
  const silD = 'M' + sil.map(([x, y]) => `${x} ${y}`).join(' L') + ' Z';
  // side faces of the extrusion: only edges that face the direction of depth
  const tone = { wall: ['#d8d3c8', '#c3bcae'], fascia: ['#d3d6d4', '#b9bebc'], roof: ['#3a4044', '#30363a'], chim: ['#8a6450', '#75533f'] };
  let ext = '';
  sil.forEach(([x1, y1, mat], i) => {
    const [x2, y2] = sil[(i + 1) % sil.length];
    const nx = y2 - y1, ny = -(x2 - x1);
    if (nx * D[0] + ny * D[1] <= 0) return;
    const fill = tone[mat][Math.abs(ny) > Math.abs(nx) ? 1 : 0];
    ext += `<path fill="${fill}" d="M${x1} ${y1} L${x2} ${y2} L${n1(x2 + D[0])} ${n1(y2 + D[1])} L${n1(x1 + D[0])} ${n1(y1 + D[1])} Z"/>`;
  });

  // windows: anthracite frames, glass with a sky reflection, recess shadow, cill
  const glass = (x, y, w, h) => {
    const k = Math.min(w, h);
    return `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" fill="url(#hh-glass)"/>` +
      `<path fill="#fff" opacity=".28" d="M${n1(x)} ${n1(y + h * 0.62)} L${n1(x + k * 0.62)} ${n1(y)} H${n1(x + k * 0.86)} L${n1(x)} ${n1(y + h * 0.9)} Z"/>`;
  };
  const win = (x, y, w, h, cols, { obscure = false, cill = true } = {}) => {
    const t = 5;
    let s = `<rect x="${x - 2}" y="${y - 2}" width="${w + 4}" height="${h + 4}" fill="#1b2024" opacity=".14"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="#383e42"/>`;
    const iw = w - t * 2 - (cols.length - 1) * 4;
    let cx = x + t;
    cols.forEach((c, i) => {
      const cw = iw * c.w;
      const gx = cx + (c.open ? 4 : 0), gy = y + t + (c.open ? 4 : 0), gw = cw - (c.open ? 8 : 0), gh = h - t * 2 - (c.open ? 8 : 0);
      if (c.open) s += `<rect x="${n1(cx + 1)}" y="${y + t + 1}" width="${n1(cw - 2)}" height="${h - t * 2 - 2}" fill="none" stroke="#545b60" stroke-width="1"/>`;
      s += obscure ? `<rect x="${n1(gx)}" y="${n1(gy)}" width="${n1(gw)}" height="${n1(gh)}" fill="#d4dde0"/><path d="M${n1(gx)} ${n1(gy + 6)} H${n1(gx + gw)} M${n1(gx)} ${n1(gy + 14)} H${n1(gx + gw)} M${n1(gx)} ${n1(gy + 22)} H${n1(gx + gw)} M${n1(gx)} ${n1(gy + 30)} H${n1(gx + gw)} M${n1(gx)} ${n1(gy + 38)} H${n1(gx + gw)} M${n1(gx)} ${n1(gy + 46)} H${n1(gx + gw)}" stroke="#fff" stroke-width="2.4" opacity=".55"/>` : glass(gx, gy, gw, gh);
      if (c.open) s += `<rect x="${n1(c.open === 'l' ? cx + cw - 9 : cx + 5)}" y="${n1(y + h / 2 - 7)}" width="3" height="14" rx="1.5" fill="#c9cdcf"/>`;
      cx += cw;
      if (i < cols.length - 1) { s += `<rect x="${n1(cx)}" y="${y + t}" width="4" height="${h - t * 2}" fill="#383e42"/>`; cx += 4; }
    });
    // recess shadow inside the opening (top and left edges)
    s += `<path fill="#000" opacity=".22" d="M${x + t} ${y + t} H${x + w - t} V${y + t + 3} H${x + t + 3} V${y + h - t} H${x + t} Z"/>`;
    if (cill) s += `<rect x="${x - 7}" y="${y + h + 2}" width="${w + 14}" height="5" fill="#1b2024" opacity=".16"/><rect x="${x - 7}" y="${y + h}" width="${w + 14}" height="6" rx="1" fill="#f1f2f0"/><rect x="${x - 7}" y="${y + h + 4}" width="${w + 14}" height="2" fill="#c9cdcb"/>`;
    return s;
  };

  let f = '';
  // walls: render above, brick below the string course
  f += `<rect x="90" y="201" width="480" height="275" fill="url(#hh-render)"/>`;
  f += `<rect x="90" y="334" width="480" height="142" fill="#b0806a"/><rect x="90" y="334" width="480" height="142" fill="url(#hh-brick)"/>`;
  f += `<rect x="90" y="326" width="480" height="9" fill="#e9e6df"/><rect x="90" y="335" width="480" height="3" fill="#1b2024" opacity=".14"/>`;
  // roof
  f += `<path d="M66 192 L220 82 H440 L594 192 Z" fill="#4a5155"/><path d="M66 192 L220 82 H440 L594 192 Z" fill="url(#hh-slate)"/>`;
  f += `<path d="M66 192 L220 82 H440 L594 192 Z" fill="url(#hh-roofl)"/>`;
  f += `<path d="M220 82 H440" stroke="#2b3034" stroke-width="5" stroke-linecap="round"/><path d="M68 191 L221 81" stroke="#6b7377" stroke-width="2"/>`;
  // chimney
  f += `<rect x="384" y="54" width="30" height="30" fill="#a87963"/><rect x="384" y="54" width="30" height="30" fill="url(#hh-brick)"/><rect x="379" y="46" width="40" height="8" fill="#d9d6cf"/><rect x="384" y="54" width="30" height="3" fill="#1b2024" opacity=".18"/>`;
  // fascia, gutter, soffit shadow and downpipe
  f += `<rect x="66" y="192" width="528" height="9" fill="#f4f5f3"/><rect x="90" y="201" width="480" height="9" fill="#1b2024" opacity=".12"/>`;
  f += `<rect x="62" y="197" width="536" height="6" rx="3" fill="#2f3438"/>`;
  f += `<rect x="552" y="203" width="6" height="273" fill="#2f3438"/><rect x="555" y="203" width="3" height="273" fill="#1b2024" opacity=".25"/>`;
  // first floor
  f += win(128, 228, 132, 90, [{ w: 0.5, open: 'l' }, { w: 0.5, open: 'r' }]);
  f += win(306, 238, 68, 70, [{ w: 1, open: 'r' }], { obscure: true });
  f += win(420, 228, 112, 90, [{ w: 0.6 }, { w: 0.4, open: 'r' }]);
  // ground floor
  f += win(118, 360, 154, 94, [{ w: 0.3, open: 'l' }, { w: 0.4 }, { w: 0.3, open: 'r' }]);
  f += win(428, 360, 112, 94, [{ w: 0.5, open: 'l' }, { w: 0.5, open: 'r' }]);
  // composite door with side light and canopy
  f += `<rect x="298" y="352" width="114" height="124" fill="#1b2024" opacity=".16"/>`;
  f += `<rect x="300" y="354" width="84" height="122" fill="#383e42"/><rect x="306" y="360" width="72" height="116" fill="#2a3034"/>`;
  f += `<rect x="311" y="366" width="62" height="104" fill="none" stroke="#3a4146" stroke-width="2"/>`;
  f += glass(338, 374, 8, 72);
  f += `<rect x="388" y="354" width="24" height="122" fill="#383e42"/>` + glass(393, 359, 14, 112);
  f += `<rect x="365" y="410" width="4" height="24" rx="2" fill="#c49a58"/><rect x="326" y="452" width="32" height="6" rx="1" fill="#c49a58"/>`;
  f += `<path d="M286 344 H426 L418 330 H294 Z" fill="#383e42"/><path d="M286 344 H426 V348 H286 Z" fill="#2a3034"/><rect x="290" y="348" width="132" height="6" fill="#1b2024" opacity=".18"/>`;
  // wall light
  f += `<rect x="283" y="376" width="8" height="14" rx="2" fill="#2a3034"/><rect x="285" y="379" width="4" height="7" rx="1" fill="#f3d9a4"/>`;
  // soft light across the face
  f += `<path d="${silD}" fill="url(#hh-light)"/>`;

  const defs = `<defs>
<linearGradient id="hh-glass" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#d8e6ea"/><stop offset=".55" stop-color="#a9bfc6"/><stop offset="1" stop-color="#8ea6ae"/></linearGradient>
<linearGradient id="hh-render" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbfaf7"/><stop offset="1" stop-color="#ebe8e1"/></linearGradient>
<linearGradient id="hh-roofl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>
<linearGradient id="hh-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1b2024" stop-opacity=".07"/></linearGradient>
<pattern id="hh-brick" width="22" height="9" patternUnits="userSpaceOnUse"><path d="M0 8.5H22M11 0V4.5M0 4H22M0 4.5V9M22 4.5V9" fill="none" stroke="#e7d8cc" stroke-opacity=".55" stroke-width=".9"/></pattern>
<pattern id="hh-slate" width="16" height="8" patternUnits="userSpaceOnUse"><path d="M0 7.5H16M8 0V4M0 4H16M0 4V8M16 4V8" fill="none" stroke="#fff" stroke-opacity=".09" stroke-width="1"/></pattern>
<filter id="hh-soft" x="-20%" y="-20%" width="150%" height="150%"><feGaussianBlur stdDeviation="11"/></filter>
<filter id="hh-crisp" x="-10%" y="-10%" width="130%" height="130%"><feGaussianBlur stdDeviation="2.2"/></filter>
</defs>`;
  const shade = `<g class="hh-shade"><path d="${silD}" transform="translate(30 28)" fill="#1b2024" opacity=".2" filter="url(#hh-soft)"/><path d="${silD}" transform="translate(${D[0] + 2} ${D[1] + 2})" fill="#1b2024" opacity=".3" filter="url(#hh-crisp)"/></g>`;
  return `<svg class="house" viewBox="40 30 620 490" role="img" aria-label="A two-storey house fitted with anthracite uPVC casement windows and a composite front door">${defs}${shade}<g class="hh-ext">${ext}</g><g class="hh-face">${f}</g></svg>`;
}

/* ---------- vertical section through head and cill (performance) ---------- */
export function sectionDrawing() {
  let b = '';
  // frame head with chambers + steel
  b += `<rect class="d-profile" x="104" y="24" width="132" height="34"/>`;
  b += `<rect class="d-chamber" x="110" y="30" width="34" height="22"/><rect class="d-chamber" x="148" y="30" width="44" height="22"/><rect class="d-chamber" x="196" y="30" width="34" height="22"/>`;
  b += `<rect class="d-steel" x="152" y="33" width="36" height="16"/>`;
  // frame cill with sloped external cill
  b += `<path class="d-profile" d="M104 282 H236 V318 H104 Z"/><path class="d-profile" d="M104 296 L50 308 V318 H104 Z"/>`;
  b += `<rect class="d-chamber" x="110" y="288" width="34" height="24"/><rect class="d-chamber" x="148" y="288" width="44" height="24"/><rect class="d-chamber" x="196" y="288" width="34" height="24"/>`;
  b += `<rect class="d-steel" x="152" y="292" width="36" height="16"/>`;
  // sealed unit
  b += `<rect class="d-gap" x="158" y="80" width="24" height="182"/>`;
  b += `<rect class="d-glass-sec" x="150" y="80" width="8" height="182"/><rect class="d-glass-sec" x="182" y="80" width="8" height="182"/>`;
  b += `<path class="d-lowe" d="M181.5 92 V250"/>`;
  b += `<rect class="d-spacer" x="160" y="82" width="20" height="8"/><rect class="d-spacer" x="160" y="252" width="20" height="8"/>`;
  // sash top and bottom rails (U-channel around the glass edge) + bead
  const rail = (y, h, top) => {
    const bridge = top ? `M118 ${y} H222 V${y + 12} H118 Z` : `M118 ${y + h - 12} H222 V${y + h} H118 Z`;
    return `<path class="d-profile" d="${bridge}"/><rect class="d-profile" x="118" y="${y}" width="28" height="${h}"/><rect class="d-profile" x="194" y="${y}" width="28" height="${h}"/><rect class="d-chamber" x="123" y="${top ? y + 16 : y + 6}" width="18" height="${h - 24}"/><rect class="d-chamber" x="199" y="${top ? y + 16 : y + 6}" width="18" height="${h - 24}"/>`;
  };
  b += rail(62, 38, true) + rail(242, 36, false);
  // gaskets: glass-to-sash and sash-to-frame
  for (const [x, y] of [[146, 88], [190, 88], [146, 248], [190, 248], [126, 58], [214, 58], [126, 278], [214, 278]]) b += `<rect class="d-gasket" x="${x}" y="${y}" width="4" height="6"/>`;
  b += `<text class="d-note" x="58" y="174" text-anchor="middle">OUTSIDE</text><text class="d-note" x="260" y="174" text-anchor="middle">INSIDE</text>`;
  // labels
  const labels = [
    [126, 41, 'Multi-chamber uPVC frame'],
    [170, 41, 'Galvanised steel reinforcement'],
    [216, 61, 'Weather gaskets, frame & glass'],
    [170, 86, 'Warm-edge spacer bar'],
    [170, 170, 'Argon-filled cavity'],
    [182, 205, 'Low-E coated inner pane'],
    [208, 262, 'Sash rail with internal chambers'],
    [80, 306, 'Sloped, drained external cill'],
  ];
  labels.forEach(([x, y, t], i) => {
    const ly = 34 + i * 38;
    b += `<g class="d-call"><circle cx="${x}" cy="${y}" r="2.6"/><path d="M${x} ${y} L300 ${ly} H312"/><text x="318" y="${ly + 4}">${t}</text></g>`;
  });
  b += `<text class="d-note" x="50" y="336">VERTICAL SECTION · HEAD &amp; CILL · ILLUSTRATIVE, NOT TO SCALE</text>`;
  return `<svg class="diagram diagram--section" viewBox="40 10 520 334" role="img" aria-label="Illustrative vertical section through the head and cill of a uPVC casement window, showing the multi-chamber frame, steel reinforcement, gaskets and a double-glazed sealed unit">${b}</svg>`;
}
