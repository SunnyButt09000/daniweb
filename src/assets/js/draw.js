/* Parametric elevation drawings for the quote builder.
   VXDraw.svg(type, { w, h, hinge, colour, glass, box }) → { svg, fw, fh }
   Drawings are self-contained SVG (inline styles, own defs) so they can also be
   rendered to the downloadable quote sheet via <canvas>. Viewed from outside;
   dashed lines meet at the hinge side, as on a window schedule. */
(() => {
  'use strict';
  const INK = '#1b2024';
  const BRASS = '#a27434';
  const COLOURS = {
    White: '#f5f5f2', Cream: '#ede6cf', 'Agate grey': '#b4b2aa', 'Anthracite grey': '#3a4044',
    Black: '#232426', 'Chartwell green': '#8fa592', 'Golden oak': '#a8692d', Rosewood: '#5b2a22',
  };
  const DEFAULTS = {
    'casement-windows': [1200, 1250], 'flush-casement-windows': [1200, 1250], 'tilt-and-turn-windows': [900, 1250],
    'sash-windows': [900, 1500], 'bay-and-bow-windows': [2400, 1300], 'sliding-windows': [1500, 1100],
    'shaped-and-feature-windows': [1000, 1400], 'upvc-doors': [920, 2090], 'composite-doors': [920, 2090],
    'french-doors': [1500, 2100], 'patio-doors': [2400, 2100], 'bifold-doors': [3000, 2100], 'stable-doors': [920, 2090],
    'sealed-unit': [600, 800], other: [1000, 1000],
  };
  const KIND = {
    'casement-windows': 'W', 'flush-casement-windows': 'W', 'tilt-and-turn-windows': 'W', 'sash-windows': 'W',
    'bay-and-bow-windows': 'W', 'sliding-windows': 'W', 'shaped-and-feature-windows': 'W', 'upvc-doors': 'D',
    'composite-doors': 'D', 'french-doors': 'D', 'patio-doors': 'D', 'bifold-doors': 'D', 'stable-doors': 'D',
    'sealed-unit': 'G', other: 'X',
  };
  const HINGED = new Set(['casement-windows', 'flush-casement-windows', 'tilt-and-turn-windows', 'upvc-doors', 'composite-doors', 'stable-doors', 'bifold-doors', 'sliding-windows', 'patio-doors']);
  const SLIDING = new Set(['sliding-windows', 'patio-doors']);

  let uid = 0;
  const r = (n) => Math.round(n * 10) / 10;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const isDark = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 120;
  };

  function svg(type, o = {}) {
    const id = `vx${++uid}`;
    const def = DEFAULTS[type] || DEFAULTS.other;
    const W = Number(o.w) > 0 ? Number(o.w) : def[0];
    const H = Number(o.h) > 0 ? Number(o.h) : def[1];
    const box = o.box || 280;
    const aspect = clamp(W / H, 0.22, 4.5);
    let fw = aspect >= 1 ? box : box * aspect;
    let fh = aspect >= 1 ? box / aspect : box;
    fw = Math.max(fw, 36);
    fh = Math.max(fh, 36);
    const frameCol = COLOURS[o.colour] || COLOURS.White;
    const dark = isDark(frameCol);
    const handleCol = dark ? '#cfd3d6' : '#2b3237';
    const obscure = /obscure/i.test(o.glass || '');
    const right = o.hinge === 'right';
    const t = clamp(Math.min(fw, fh) * 0.05, 4, 11);
    const sw = clamp(box / 200, 0.9, 1.6);

    const defs = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6eff0"/><stop offset=".55" stop-color="#cddde0"/><stop offset="1" stop-color="#e9f1f2"/></linearGradient>` +
      `<pattern id="${id}o" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#e3e8e9"/><circle cx="1.5" cy="1.5" r=".8" fill="#b9c4c6"/><circle cx="4" cy="3.8" r=".6" fill="#c7d0d2"/></pattern></defs>`;
    const glassFill = obscure ? `url(#${id}o)` : `url(#${id}g)`;

    const rect = (x, y, w, h, fill, s = sw, extra = '') => `<rect x="${r(x)}" y="${r(y)}" width="${r(Math.max(w, 0))}" height="${r(Math.max(h, 0))}" fill="${fill}" stroke="${INK}" stroke-width="${s}"${extra}/>`;
    const frame = (x, y, w, h) => rect(x, y, w, h, frameCol, sw * 1.15);
    const glint = (x, y, w, h) => {
      if (obscure || w < 18 || h < 18) return '';
      const s = Math.min(w, h) * 0.28;
      return `<path d="M${r(x + w * 0.14)} ${r(y + h * 0.14 + s)} L${r(x + w * 0.14 + s)} ${r(y + h * 0.14)} M${r(x + w * 0.14)} ${r(y + h * 0.14 + s * 1.45)} L${r(x + w * 0.14 + s * 1.45)} ${r(y + h * 0.14)}" stroke="#fff" stroke-width="${sw * 1.1}" stroke-linecap="round" opacity=".9" fill="none"/>`;
    };
    const glass = (x, y, w, h) => rect(x, y, w, h, glassFill, sw * 0.7) + glint(x, y, w, h);
    // an opening or fixed light: profile ring + glass
    const light = (x, y, w, h, ring) => rect(x, y, w, h, frameCol, sw) + glass(x + ring, y + ring, w - 2 * ring, h - 2 * ring);
    const hingeMark = (x, y, w, h, side, dash = '6 4') => {
      const p = {
        left: [[x + w, y], [x, y + h / 2], [x + w, y + h]],
        right: [[x, y], [x + w, y + h / 2], [x, y + h]],
        top: [[x, y + h], [x + w / 2, y], [x + w, y + h]],
        bottom: [[x, y], [x + w / 2, y + h], [x + w, y]],
      }[side];
      return `<polyline points="${p.map((q) => q.map(r).join(',')).join(' ')}" fill="none" stroke="${BRASS}" stroke-width="${sw}" stroke-dasharray="${dash}"/>`;
    };
    const handleV = (x, y, len = Math.min(18, fh * 0.08)) => `<rect x="${r(x - 1.7)}" y="${r(y - len / 2)}" width="3.4" height="${r(len)}" rx="1.7" fill="${handleCol}"/>`;
    const arrow = (x1, y1, x2, y2) => {
      const a = Math.atan2(y2 - y1, x2 - x1);
      const L = 6;
      return `<path d="M${r(x1)} ${r(y1)} L${r(x2)} ${r(y2)} M${r(x2 - L * Math.cos(a - 0.5))} ${r(y2 - L * Math.sin(a - 0.5))} L${r(x2)} ${r(y2)} L${r(x2 - L * Math.cos(a + 0.5))} ${r(y2 - L * Math.sin(a + 0.5))}" stroke="${BRASS}" stroke-width="${sw * 1.3}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    };

    let b = '';
    const ring = t * 0.85;

    // ---------- window: casement / flush ----------
    function casement(flush) {
      b += frame(0, 0, fw, fh);
      const ix = t, iy = t, iw = fw - 2 * t, ih = fh - 2 * t;
      const n = W < 750 ? 1 : W < 1550 ? 2 : 3;
      const mull = t * 0.8;
      const cw = (iw - mull * (n - 1)) / n;
      const inset = flush ? 0 : -1.2;
      for (let i = 0; i < n; i++) {
        const x = ix + i * (cw + mull);
        if (i > 0) b += rect(x - mull, iy, mull, ih, frameCol, sw * 0.8);
        let opener = n === 1 ? (right ? 'right' : 'left') : n === 3 ? (i === 0 ? 'left' : i === 2 ? 'right' : null) : (right ? (i === 1 ? 'right' : null) : (i === 0 ? 'left' : null));
        if (opener) {
          b += light(x + inset, iy + inset, cw - 2 * inset, ih - 2 * inset, ring);
          b += hingeMark(x, iy, cw, ih, opener);
          b += handleV(opener === 'left' ? x + cw - ring / 2 : x + ring / 2, iy + ih / 2);
        } else if (H > 900 && fh > 90) {
          const fan = ih * 0.3;
          b += light(x + inset, iy + inset, cw - 2 * inset, fan - 2 * inset, ring * 0.9);
          b += hingeMark(x, iy, cw, fan, 'top');
          b += rect(x, iy + fan, cw, mull * 0.8, frameCol, sw * 0.8);
          b += glass(x + 1, iy + fan + mull * 0.8 + 1, cw - 2, ih - fan - mull * 0.8 - 2);
        } else {
          b += glass(x + 1, iy + 1, cw - 2, ih - 2);
        }
      }
    }

    function tiltTurn() {
      b += frame(0, 0, fw, fh);
      const ix = t, iy = t, iw = fw - 2 * t, ih = fh - 2 * t;
      const n = W > 1350 ? 2 : 1;
      const mull = t * 0.8;
      const cw = (iw - mull * (n - 1)) / n;
      for (let i = 0; i < n; i++) {
        const x = ix + i * (cw + mull);
        if (i > 0) b += rect(x - mull, iy, mull, ih, frameCol, sw * 0.8);
        const side = n === 2 ? (i === 0 ? 'left' : 'right') : right ? 'right' : 'left';
        b += light(x - 1, iy - 1, cw + 2, ih + 2, ring);
        b += hingeMark(x, iy, cw, ih, side);
        b += hingeMark(x, iy, cw, ih, 'bottom', '10 3 2 3');
        b += handleV(side === 'left' ? x + cw - ring / 2 : x + ring / 2, iy + ih / 2);
      }
    }

    function sash() {
      b += frame(0, 0, fw, fh);
      const ix = t, iy = t, iw = fw - 2 * t, ih = fh - 2 * t, mid = iy + ih / 2;
      const rails = (x, y, w, h, bottomRail) => {
        b += rect(x, y, w, h, frameCol, sw);
        const gx = x + ring, gy = y + ring, gw = w - 2 * ring, gh = h - ring - (bottomRail ? ring * 1.8 : ring);
        b += glass(gx, gy, gw, gh);
        if (W >= 600 && gw > 30) b += `<path d="M${r(gx + gw / 2)} ${r(gy)} V${r(gy + gh)} M${r(gx)} ${r(gy + gh / 2)} H${r(gx + gw)}" stroke="${frameCol}" stroke-width="${r(Math.max(2.4, t * 0.45))}"/><path d="M${r(gx + gw / 2)} ${r(gy)} V${r(gy + gh)} M${r(gx)} ${r(gy + gh / 2)} H${r(gx + gw)}" stroke="${INK}" stroke-width="${sw * 0.35}" opacity=".5"/>`;
      };
      rails(ix, iy, iw, ih / 2 + ring / 2, false);
      rails(ix + 2, mid - ring / 2, iw - 4, ih / 2 + ring / 2, true);
      // horns
      b += `<path d="M${r(ix)} ${r(mid + ring)} l-2.5 ${r(ring)} M${r(ix + iw)} ${r(mid + ring)} l2.5 ${r(ring)}" stroke="${INK}" stroke-width="${sw}"/>`;
      b += `<rect x="${r(fw / 2 - 7)}" y="${r(mid - 2.5)}" width="14" height="5" rx="2.5" fill="${handleCol}"/>`;
      b += arrow(ix + iw * 0.12, mid + ih * 0.18, ix + iw * 0.12, mid + ih * 0.04) + arrow(ix + iw * 0.88, mid - ih * 0.18, ix + iw * 0.88, mid - ih * 0.04);
    }

    function bay() {
      const side = fw * 0.22, skew = fh * 0.06;
      const poly = (pts, fill) => `<path d="M${pts.map((p) => p.map(r).join(' ')).join(' L')} Z" fill="${fill}" stroke="${INK}" stroke-width="${sw * 1.15}"/>`;
      b += poly([[0, skew], [side, 0], [side, fh], [0, fh - skew]], frameCol);
      b += poly([[t * 0.8, skew + t], [side - t * 0.8, t * 0.9], [side - t * 0.8, fh - t * 0.9], [t * 0.8, fh - skew - t]], glassFill);
      b += poly([[fw, skew], [fw - side, 0], [fw - side, fh], [fw, fh - skew]], frameCol);
      b += poly([[fw - t * 0.8, skew + t], [fw - side + t * 0.8, t * 0.9], [fw - side + t * 0.8, fh - t * 0.9], [fw - t * 0.8, fh - skew - t]], glassFill);
      b += `<polyline points="${r(side - t)},${r(t)} ${r(t)},${r(fh / 2)} ${r(side - t)},${r(fh - t)}" fill="none" stroke="${BRASS}" stroke-width="${sw}" stroke-dasharray="6 4"/>`;
      b += `<polyline points="${r(fw - side + t)},${r(t)} ${r(fw - t)},${r(fh / 2)} ${r(fw - side + t)},${r(fh - t)}" fill="none" stroke="${BRASS}" stroke-width="${sw}" stroke-dasharray="6 4"/>`;
      b += frame(side, 0, fw - 2 * side, fh);
      b += glass(side + t, t, fw - 2 * side - 2 * t, fh - 2 * t);
    }

    function sliders(panels, door) {
      b += frame(0, 0, fw, fh);
      const ix = t, iy = t, iw = fw - 2 * t, ih = fh - 2 * t;
      const pw = iw / panels;
      const overlap = Math.min(8, pw * 0.08);
      for (let i = 0; i < panels; i++) {
        const front = i % 2 === 1;
        const x = ix + i * pw - (i > 0 ? overlap / 2 : 0);
        const w = pw + (i > 0 && i < panels - 1 ? overlap : overlap / 2);
        b += light(x, iy + (front ? 0 : 2), w, ih - (front ? 0 : 4), ring * (door ? 1.1 : 1));
      }
      const slideIdx = right ? panels - 1 : 0;
      const sx = ix + slideIdx * pw;
      const ay = iy + ih * 0.78;
      b += right ? arrow(sx + pw * 0.75, ay, sx + pw * 0.25, ay) : arrow(sx + pw * 0.25, ay, sx + pw * 0.75, ay);
      b += handleV(right ? sx + ring : sx + pw - ring, iy + ih / 2, Math.min(26, fh * 0.12));
    }

    function shaped() {
      const rise = Math.min(fw / 2, fh * 0.55);
      const rad = (fw * fw / 4 + rise * rise) / (2 * rise);
      const arch = (x, y, w, h, rs) => {
        const rr = (w * w / 4 + rs * rs) / (2 * rs);
        return `M${r(x)} ${r(y + h)} V${r(y + rs)} A${r(rr)} ${r(rr)} 0 0 1 ${r(x + w)} ${r(y + rs)} V${r(y + h)} Z`;
      };
      b += `<path d="${arch(0, 0, fw, fh, rise)}" fill="${frameCol}" stroke="${INK}" stroke-width="${sw * 1.15}"/>`;
      const ir = Math.max(rise - t * 0.6, 4);
      b += `<path d="${arch(t, t, fw - 2 * t, fh - 2 * t, ir)}" fill="${glassFill}" stroke="${INK}" stroke-width="${sw * 0.7}"/>`;
      const cy = t + ir;
      b += `<path d="M${r(fw / 2)} ${r(t)} V${r(fh - t)} M${r(t)} ${r(cy)} H${r(fw - t)} M${r(fw / 2)} ${r(cy)} L${r(fw * 0.22)} ${r(t + ir * 0.35)} M${r(fw / 2)} ${r(cy)} L${r(fw * 0.78)} ${r(t + ir * 0.35)}" stroke="${frameCol}" stroke-width="${r(Math.max(2.6, t * 0.5))}"/><path d="M${r(fw / 2)} ${r(t)} V${r(fh - t)} M${r(t)} ${r(cy)} H${r(fw - t)}" stroke="${INK}" stroke-width="${sw * 0.35}" opacity=".5"/>`;
      void rad;
    }

    // ---------- doors ----------
    function doorLeaf(x, y, w, h, side, style) {
      const leafCol = frameCol;
      b += rect(x, y, w, h, leafCol, sw);
      const m = Math.max(ring * 1.4, w * 0.12);
      if (style === 'composite') {
        const gx = side === 'left' ? x + w * 0.58 : x + w * 0.28;
        b += glass(gx, y + h * 0.1, w * 0.14, h * 0.62);
        b += `<path d="M${r(x + m)} ${r(y + m)} V${r(y + h - m)} M${r(x + w - m)} ${r(y + m)} V${r(y + h - m)}" stroke="${dark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.14)'}" stroke-width="${sw}"/>`;
        b += `<rect x="${r(x + w / 2 - w * 0.17)}" y="${r(y + h * 0.8)}" width="${r(w * 0.34)}" height="${r(Math.max(4, h * 0.022))}" rx="1" fill="#c49a4f"/>`;
      } else if (style === 'glazed') {
        b += glass(x + m * 0.75, y + m * 0.75, w - m * 1.5, h * 0.72 - m * 0.75);
        b += rect(x + m * 0.75, y + h * 0.76, w - m * 1.5, h * 0.24 - m * 0.75, 'none', sw * 0.6);
      } else {
        b += glass(x + m, y + m, w - 2 * m, h * 0.42);
        b += rect(x + m, y + h * 0.5, w - 2 * m, h * 0.5 - m, 'none', sw * 0.6);
        b += `<rect x="${r(x + w / 2 - w * 0.17)}" y="${r(y + h * 0.56)}" width="${r(w * 0.34)}" height="${r(Math.max(4, h * 0.025))}" rx="1" fill="${handleCol}"/>`;
      }
      b += hingeMark(x, y, w, h, side);
      const hx = side === 'left' ? x + w - m * 0.45 : x + m * 0.45;
      b += `<rect x="${r(hx - 2)}" y="${r(y + h * 0.47)}" width="4" height="${r(Math.max(12, h * 0.1))}" rx="2" fill="${style === 'composite' ? '#c49a4f' : handleCol}"/>`;
    }

    function door(style) {
      b += frame(0, 0, fw, fh);
      const sideLight = W > 1250;
      const leafW = sideLight ? (fw - 2 * t) * clamp(920 / W, 0.4, 0.8) : fw - 2 * t;
      const side = right ? 'right' : 'left';
      const lx = sideLight && !right ? t : sideLight ? fw - t - leafW : t;
      doorLeaf(lx, t, leafW, fh - t * 1.4, side, style);
      if (sideLight) {
        const sx = right ? t : t + leafW;
        const sw2 = fw - 2 * t - leafW;
        b += rect(sx, t, sw2, fh - t * 1.4, frameCol, sw * 0.8);
        b += glass(sx + ring, t + ring, sw2 - 2 * ring, fh - t * 1.4 - 2 * ring);
      }
      b += `<path d="M0 ${r(fh)} H${r(fw)}" stroke="${INK}" stroke-width="${sw * 2}"/>`;
    }

    function french() {
      b += frame(0, 0, fw, fh);
      const sides = W > 2000;
      const panelW = sides ? (fw - 2 * t) * clamp((W - 1500) / W / 2, 0.08, 0.3) : 0;
      const lx = t + panelW, lw = fw - 2 * t - 2 * panelW;
      if (sides) {
        for (const sx of [t, fw - t - panelW]) {
          b += rect(sx, t, panelW, fh - t * 1.4, frameCol, sw * 0.8);
          b += glass(sx + ring, t + ring, panelW - 2 * ring, fh - t * 1.4 - 2 * ring);
        }
      }
      doorLeaf(lx, t, lw / 2, fh - t * 1.4, 'left', 'glazed');
      doorLeaf(lx + lw / 2, t, lw / 2, fh - t * 1.4, 'right', 'glazed');
      b += `<path d="M0 ${r(fh)} H${r(fw)}" stroke="${INK}" stroke-width="${sw * 2}"/>`;
    }

    function bifold() {
      b += frame(0, 0, fw, fh);
      const n = clamp(Math.round(W / 850), 2, 7);
      const ix = t, iy = t, iw = fw - 2 * t, ih = fh - t * 1.4;
      const pw = iw / n;
      for (let i = 0; i < n; i++) {
        b += light(ix + i * pw, iy, pw, ih, ring);
      }
      // traffic door at the hinge side, folding marks on the others
      const tIdx = right ? n - 1 : 0;
      b += hingeMark(ix + tIdx * pw, iy, pw, ih, right ? 'right' : 'left');
      for (let i = 0; i < n; i++) {
        if (i === tIdx) continue;
        const cx = ix + i * pw + pw / 2;
        b += `<path d="M${r(cx - pw * 0.18)} ${r(iy + ih * 0.06)} L${r(cx)} ${r(iy + ih * 0.06 + pw * 0.12)} L${r(cx + pw * 0.18)} ${r(iy + ih * 0.06)}" fill="none" stroke="${BRASS}" stroke-width="${sw}"/>`;
      }
      b += handleV(right ? ix + (n - 1) * pw + ring : ix + pw - ring, iy + ih / 2, Math.min(24, fh * 0.1));
      b += `<path d="M0 ${r(fh)} H${r(fw)}" stroke="${INK}" stroke-width="${sw * 2}"/>`;
    }

    function stable() {
      b += frame(0, 0, fw, fh);
      const side = right ? 'right' : 'left';
      const x = t, y = t, w = fw - 2 * t, h = fh - t * 1.4, split = h * 0.48;
      const m = Math.max(ring * 1.4, w * 0.12);
      b += rect(x, y, w, split - 1, frameCol, sw) + glass(x + m, y + m, w - 2 * m, split - 2 * m);
      b += rect(x, y + split + 1, w, h - split - 1, frameCol, sw) + rect(x + m, y + split + m, w - 2 * m, h - split - 2 * m, 'none', sw * 0.6);
      b += hingeMark(x, y, w, split - 1, side) + hingeMark(x, y + split + 1, w, h - split - 1, side);
      const hx = side === 'left' ? x + w - m * 0.45 : x + m * 0.45;
      b += `<rect x="${r(hx - 2)}" y="${r(y + split - h * 0.1)}" width="4" height="${r(h * 0.07)}" rx="2" fill="${handleCol}"/><rect x="${r(hx - 2)}" y="${r(y + split + h * 0.04)}" width="4" height="${r(h * 0.07)}" rx="2" fill="${handleCol}"/>`;
      b += `<path d="M0 ${r(fh)} H${r(fw)}" stroke="${INK}" stroke-width="${sw * 2}"/>`;
    }

    function sealedUnit() {
      b += rect(0, 0, fw, fh, glassFill, sw * 1.2) + glint(0, 0, fw, fh);
      const s = clamp(Math.min(fw, fh) * 0.04, 3, 8);
      b += `<rect x="${r(s)}" y="${r(s)}" width="${r(fw - 2 * s)}" height="${r(fh - 2 * s)}" fill="none" stroke="${BRASS}" stroke-width="${r(s * 0.7)}" opacity=".75"/>`;
    }

    function other() {
      b += frame(0, 0, fw, fh) + glass(t, t, fw - 2 * t, fh - 2 * t);
      b += `<path d="M${r(t)} ${r(t)} L${r(fw - t)} ${r(fh - t)} M${r(fw - t)} ${r(t)} L${r(t)} ${r(fh - t)}" stroke="${BRASS}" stroke-width="${sw}" stroke-dasharray="4 4"/>`;
    }

    switch (type) {
      case 'casement-windows': casement(false); break;
      case 'flush-casement-windows': casement(true); break;
      case 'tilt-and-turn-windows': tiltTurn(); break;
      case 'sash-windows': sash(); break;
      case 'bay-and-bow-windows': bay(); break;
      case 'sliding-windows': sliders(W > 2200 ? 3 : 2, false); break;
      case 'shaped-and-feature-windows': shaped(); break;
      case 'upvc-doors': door('upvc'); break;
      case 'composite-doors': door('composite'); break;
      case 'french-doors': french(); break;
      case 'patio-doors': sliders(W > 4200 ? 4 : W > 3000 ? 3 : 2, true); break;
      case 'bifold-doors': bifold(); break;
      case 'stable-doors': stable(); break;
      case 'sealed-unit': sealedUnit(); break;
      default: other();
    }
    const pad = 2;
    const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${r(fw + pad * 2)} ${r(fh + pad * 2)}" width="${r(fw + pad * 2)}" height="${r(fh + pad * 2)}" role="img" aria-label="${(o.label || 'Elevation drawing').replace(/"/g, '')}">${defs}${b}</svg>`;
    return { svg: out, fw: fw + pad * 2, fh: fh + pad * 2, W, H };
  }

  window.VXDraw = { svg, DEFAULTS, KIND, COLOURS, HINGED, SLIDING };
})();
