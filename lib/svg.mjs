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

/* ---------- hero facade ---------- */
export function facadeDrawing() {
  let b = `<defs><pattern id="brick" width="24" height="10" patternUnits="userSpaceOnUse"><path class="d-brick" d="M0 9.5H24M12 0V5M0 4.5H24M0 5V10M24 5V10"/></pattern>
  <pattern id="tile" width="14" height="7" patternUnits="userSpaceOnUse"><path class="d-brick" d="M0 6.5H14M7 0V7"/></pattern></defs>`;
  // ground + walls
  b += `<path class="d-ground" d="M0 470 H640"/>`;
  b += `<rect x="70" y="160" width="500" height="310" fill="url(#brick)" class="d-wall"/>`;
  b += `<rect class="d-outline" x="70" y="160" width="500" height="310"/>`;
  b += `<path class="d-roof" d="M46 164 L320 46 L594 164 Z"/><path d="M46 164 L320 46 L594 164 Z" fill="url(#tile)" class="d-wall"/>`;
  b += `<path class="d-frame" d="M500 92 V60 H530 V105" fill="none"/>`; // chimney
  // first floor windows
  const win = (x, y, w, h, kind) => {
    let s = frame(x, y, w, h, 6);
    const ix = x + 6, iy = y + 6, iw = w - 12, ih = h - 12;
    if (kind === 'double') {
      const half = iw / 2;
      s += sash(ix + 1, iy + 1, half - 2, ih - 2, 5) + hinge(ix + 1, iy + 1, half - 2, ih - 2, 'left');
      s += sash(ix + half + 1, iy + 1, half - 2, ih - 2, 5) + hinge(ix + half + 1, iy + 1, half - 2, ih - 2, 'right');
    } else if (kind === 'obscure') {
      s += `<rect class="d-sash" x="${ix + 1}" y="${iy + 1}" width="${iw - 2}" height="${ih - 2}"/><rect class="d-obscure" x="${ix + 6}" y="${iy + 6}" width="${iw - 12}" height="${ih - 12}"/>` + hinge(ix + 1, iy + 1, iw - 2, ih - 2, 'top');
    } else {
      const t1 = iw * 0.62;
      s += pane(ix + 1, iy + 1, t1 - 2, ih - 2);
      s += `<rect class="d-frame" x="${ix + t1 - 1}" y="${iy}" width="4" height="${ih}"/>`;
      s += sash(ix + t1 + 3, iy + 1, iw - t1 - 4, ih - 2, 5) + hinge(ix + t1 + 3, iy + 1, iw - t1 - 4, ih - 2, 'right');
    }
    s += `<rect class="d-cill" x="${x - 6}" y="${y + h}" width="${w + 12}" height="5"/>`;
    return s;
  };
  b += win(110, 196, 130, 104, 'double');
  b += win(282, 206, 70, 84, 'obscure');
  b += win(400, 196, 130, 104, 'fixed');
  // ground floor: bay (flat), door, window
  b += `<path class="d-frame d-canopy" d="M96 330 H254 L246 316 H104 Z"/>`;
  b += win(104, 336, 150, 110, 'fixed');
  // composite door + side light
  b += `<path class="d-frame d-canopy" d="M290 320 H380 L372 308 H298 Z"/>`;
  b += frame(298, 330, 74, 140, 6);
  b += `<rect class="d-sash d-sash--solid" x="305" y="337" width="60" height="133"/>`;
  b += pane(330, 350, 10, 80);
  b += `<rect class="d-handle d-handle--brass" x="355" y="395" width="4" height="26" rx="2"/>`;
  b += `<rect class="d-handle d-handle--brass" x="321" y="440" width="28" height="6" rx="1"/>`;
  b += frame(378, 330, 26, 140, 5) + pane(384, 336, 14, 128);
  b += win(430, 336, 110, 110, 'double');
  b += `<path class="d-ground" d="M290 470 H404" stroke-width="3"/>`;
  // dimensions
  b += dimH(110, 240, 186, '1200');
  b += dimV(590, 330, 470, '2090');
  // callouts
  const call = (x1, y1, x2, y2, t1, t2, anchor = 'start') =>
    `<g class="d-call"><circle cx="${x1}" cy="${y1}" r="2.6"/><path d="M${x1} ${y1} L${x2} ${y2} H${anchor === 'start' ? x2 + 6 : x2 - 6}"/><text x="${anchor === 'start' ? x2 + 10 : x2 - 10}" y="${y2 - 3}" text-anchor="${anchor}">${t1}</text><text class="d-call-sub" x="${anchor === 'start' ? x2 + 10 : x2 - 10}" y="${y2 + 11}" text-anchor="${anchor}">${t2}</text></g>`;
  b += call(170, 248, 60, 124, 'FLUSH CASEMENT', 'Anthracite RAL 7016', 'end');
  b += call(468, 248, 590, 120, 'A-RATED GLAZING', 'Warm-edge spacer');
  b += call(336, 392, 450, 500, 'COMPOSITE DOOR', 'Multipoint lock · PAS 24', 'start');
  b += call(317, 248, 250, 34, 'OBSCURE GLASS', 'Top-hung opener', 'end');
  // title block
  b += `<g class="d-titleblock"><rect x="20" y="486" width="210" height="26"/><text x="30" y="503">ELEVATION A · NTS</text><text x="220" y="503" text-anchor="end">VX-01</text></g>`;
  return `<svg class="diagram diagram--facade" viewBox="-34 0 734 520" role="img" aria-label="Technical elevation of a two-storey house fitted with uPVC casement windows, a bay window and a composite front door">${b}</svg>`;
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
