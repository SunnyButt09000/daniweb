/* Parametric elevation drawings for the quote builder and the model cards on product pages.
   VXDraw.svg(type, { w, h, hinge, colour, glass, box, layout, idPrefix }) → { svg, fw, fh }
   `layout` draws a specific model from src/content/models.mjs (see the legend there);
   without it the drawing picks a sensible layout from the size.
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
    const id = `${o.idPrefix || 'vx'}${++uid}`;
    const LAY = typeof o.layout === 'string' ? o.layout.trim() : '';
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
    const handleH = (x, y, len = Math.min(18, fw * 0.08)) => `<rect x="${r(x - len / 2)}" y="${r(y - 1.7)}" width="${r(len)}" height="3.4" rx="1.7" fill="${handleCol}"/>`;
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

    // ---------- model layouts: a grid of lights ----------
    // "L|F" = two equal columns; "2:F|L" = first column twice as wide; "T*1/F*2" = top-hung over fixed, 1:2 high.
    // F fixed · L / R side-hung, hinges left / right · T top-hung · B bottom-hung · TL / TR tilt & turn, hinges left / right
    const SWAP = { L: 'R', R: 'L', TL: 'TR', TR: 'TL' };
    function parseGrid(spec) {
      const cols = spec.split('|').map((c) => {
        const m = /^(\d+(?:\.\d+)?):(.+)$/.exec(c.trim());
        const cells = (m ? m[2] : c).split('/').map((x) => {
          const q = /^([A-Z]{1,2})(?:\*(\d+(?:\.\d+)?))?$/.exec(x.trim());
          return q ? { op: q[1], h: q[2] ? Number(q[2]) : 1 } : { op: 'F', h: 1 };
        });
        return { w: m ? Number(m[1]) : 1, cells };
      });
      // "opposite hand": mirror the whole window
      if (right) { cols.reverse(); cols.forEach((c) => c.cells.forEach((x) => { x.op = SWAP[x.op] || x.op; })); }
      return cols;
    }
    function cell(op, x, y, w, h, inset) {
      const rg = Math.min(ring, w * 0.18, h * 0.18);
      if (op === 'F') { b += glass(x + 1, y + 1, w - 2, h - 2); return; }
      b += light(x + inset, y + inset, w - 2 * inset, h - 2 * inset, rg);
      if (op === 'L' || op === 'R' || op === 'TL' || op === 'TR') {
        const s = op === 'L' || op === 'TL' ? 'left' : 'right';
        b += hingeMark(x, y, w, h, s);
        if (op.length === 2) b += hingeMark(x, y, w, h, 'bottom', '10 3 2 3');
        b += handleV(s === 'left' ? x + w - rg / 2 : x + rg / 2, y + h / 2, Math.min(18, h * 0.3));
      } else if (op === 'T') {
        b += hingeMark(x, y, w, h, 'top');
        b += handleH(x + w / 2, y + h - rg / 2, Math.min(18, w * 0.3));
      } else if (op === 'B') {
        b += hingeMark(x, y, w, h, 'bottom', '10 3 2 3');
        b += handleH(x + w / 2, y + rg / 2, Math.min(18, w * 0.3));
      }
    }
    function gridWindow(spec, flush) {
      b += frame(0, 0, fw, fh);
      const ix = t, iy = t, iw = fw - 2 * t, ih = fh - 2 * t, mull = t * 0.8, tr = mull * 0.8;
      const cols = parseGrid(spec);
      const tw = cols.reduce((a, c) => a + c.w, 0);
      const avail = iw - mull * (cols.length - 1);
      const inset = flush ? 0 : -1.2;
      let x = ix;
      cols.forEach((col, ci) => {
        const cw = (avail * col.w) / tw;
        if (ci > 0) b += rect(x - mull, iy, mull, ih, frameCol, sw * 0.8);
        const th = col.cells.reduce((a, c) => a + c.h, 0);
        const ah = ih - tr * (col.cells.length - 1);
        let y = iy;
        col.cells.forEach((c, ri) => {
          const ch = (ah * c.h) / th;
          if (ri > 0) b += rect(x, y - tr, cw, tr, frameCol, sw * 0.8);
          cell(c.op, x, y, cw, ch, inset);
          y += ch + tr;
        });
        x += cw + mull;
      });
    }

    // bays and bows: "3@45", "3@30", "3@90" (box), "4@bow", "5@bow"
    const BAYS = {
      '3@45': { w: [0.62, 1, 0.62], s: [1, 0, 0, 1] },
      '3@30': { w: [0.82, 1, 0.82], s: [0.6, 0, 0, 0.6] },
      '3@90': { w: [0.16, 1, 0.16], s: [1.5, 0, 0, 1.5] },
      '4@bow': { w: [0.62, 1, 1, 0.62], s: [1, 0.25, 0, 0.25, 1] },
      '5@bow': { w: [0.55, 0.88, 1, 0.88, 0.55], s: [1, 0.4, 0, 0, 0.4, 1] },
    };
    function bayLayout(spec) {
      const cfgB = BAYS[spec] || BAYS['3@45'];
      const n = cfgB.w.length, tot = cfgB.w.reduce((a, v) => a + v, 0), unit = fh * 0.06;
      const xs = [0];
      cfgB.w.forEach((v) => xs.push(xs[xs.length - 1] + (fw * v) / tot));
      const poly = (pts, fill, s2 = sw * 1.15) => `<path d="M${pts.map((p) => p.map(r).join(' ')).join(' L')} Z" fill="${fill}" stroke="${INK}" stroke-width="${s2}"/>`;
      for (let i = 0; i < n; i++) {
        const x0 = xs[i], x1 = xs[i + 1], s0 = unit * cfgB.s[i], s1 = unit * cfgB.s[i + 1];
        const flat = !s0 && !s1;
        const side = i < (n - 1) / 2 ? 'left' : i > (n - 1) / 2 ? 'right' : '';
        if (flat) {
          b += frame(x0, 0, x1 - x0, fh);
          // centre facets: a top-hung fanlight over a fixed light
          const gx = x0 + t, gw = x1 - x0 - 2 * t, gy = t, gh = fh - 2 * t, fan = gh * 0.3;
          cell('T', gx, gy, gw, fan, -1.2);
          b += rect(gx, gy + fan, gw, t * 0.6, frameCol, sw * 0.8);
          b += glass(gx + 1, gy + fan + t * 0.6 + 1, gw - 2, gh - fan - t * 0.6 - 2);
        } else {
          const ins = t * 0.8;
          b += poly([[x0, s0], [x1, s1], [x1, fh - s1], [x0, fh - s0]], frameCol);
          b += poly([[x0 + ins, s0 + t], [x1 - ins, s1 + t], [x1 - ins, fh - s1 - t], [x0 + ins, fh - s0 - t]], glassFill, sw * 0.7);
          if (x1 - x0 > 18 && side) {
            const [hx, ox] = side === 'left' ? [x0 + ins, x1 - ins] : [x1 - ins, x0 + ins];
            const [hs, os] = side === 'left' ? [s0, s1] : [s1, s0];
            b += `<polyline points="${r(ox)},${r(os + t)} ${r(hx)},${r(fh / 2)} ${r(ox)},${r(fh - os - t)}" fill="none" stroke="${BRASS}" stroke-width="${sw}" stroke-dasharray="6 4"/>`;
            void hs;
          }
        }
      }
    }

    // horizontal sliders and patio doors: "S|F", "F|S|F", "F|S|S|F" (S slides, F fixed)
    function slidersLayout(spec, door) {
      let p = spec.split('|').map((x) => x.trim().toUpperCase());
      if (right) p = p.reverse();
      const n = p.length;
      b += frame(0, 0, fw, fh);
      const ix = t, iy = t, iw = fw - 2 * t, ih = fh - (door ? t * 1.4 : 2 * t);
      const pw = iw / n, overlap = Math.min(8, pw * 0.08);
      p.forEach((k, i) => {
        const front = k === 'S';
        const x = ix + i * pw - (i > 0 ? overlap / 2 : 0);
        const w = pw + (i > 0 && i < n - 1 ? overlap : overlap / 2);
        b += light(x, iy + (front ? 0 : 2), w, ih - (front ? 0 : 4), ring * (door ? 1.1 : 1));
        if (!front) return;
        const ay = iy + ih * 0.78, cx = ix + i * pw;
        const mid = (n - 1) / 2;
        if (i < mid) b += arrow(cx + pw * 0.25, ay, cx + pw * 0.75, ay);
        else if (i > mid) b += arrow(cx + pw * 0.75, ay, cx + pw * 0.25, ay);
        else b += arrow(cx + pw * 0.5, ay, cx + pw * 0.2, ay) + arrow(cx + pw * 0.5, ay, cx + pw * 0.8, ay);
        b += handleV(i <= mid ? cx + pw - ring : cx + ring, iy + ih / 2, Math.min(26, fh * 0.12));
      });
      if (door) b += `<path d="M0 ${r(fh)} H${r(fw)}" stroke="${INK}" stroke-width="${sw * 2}"/>`;
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

    // Georgian bars: number of panes → columns × rows
    const PANES = { 1: [1, 1], 2: [2, 1], 3: [3, 1], 4: [2, 2], 6: [3, 2], 8: [4, 2], 9: [3, 3], 12: [4, 3] };
    function bars(gx, gy, gw, gh, n) {
      const [c, rw] = PANES[n] || [1, 1];
      let d = '';
      for (let i = 1; i < c; i++) d += `M${r(gx + (gw * i) / c)} ${r(gy)} V${r(gy + gh)} `;
      for (let j = 1; j < rw; j++) d += `M${r(gx)} ${r(gy + (gh * j) / rw)} H${r(gx + gw)} `;
      return d ? `<path d="${d}" stroke="${frameCol}" stroke-width="${r(Math.max(2.4, t * 0.45))}"/><path d="${d}" stroke="${INK}" stroke-width="${sw * 0.35}" opacity=".5"/>` : '';
    }
    // sash layouts: "6/6" = six panes over six; "1/1" = plain; "2/2"; "4/4"
    function sash(spec) {
      const m = /^(\d+)\/(\d+)$/.exec(spec || '');
      const auto = W >= 600 ? 4 : 1;
      const [top, bottom] = m ? [Number(m[1]), Number(m[2])] : [auto, auto];
      b += frame(0, 0, fw, fh);
      const ix = t, iy = t, iw = fw - 2 * t, ih = fh - 2 * t, mid = iy + ih / 2;
      const rails = (x, y, w, h, bottomRail, n) => {
        b += rect(x, y, w, h, frameCol, sw);
        const gx = x + ring, gy = y + ring, gw = w - 2 * ring, gh = h - ring - (bottomRail ? ring * 1.8 : ring);
        b += glass(gx, gy, gw, gh);
        if (gw > 30) b += bars(gx, gy, gw, gh, n);
      };
      rails(ix, iy, iw, ih / 2 + ring / 2, false, top);
      rails(ix + 2, mid - ring / 2, iw - 4, ih / 2 + ring / 2, true, bottom);
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

    // shaped windows: arch, segment, gable, rake, triangle, circle, octagon
    function shapeD(kind, x, y, w, h) {
      const P = (pts) => `M${pts.map((p) => p.map(r).join(' ')).join(' L')} Z`;
      const archD = (rs) => {
        const rr = (w * w / 4 + rs * rs) / (2 * rs);
        return `M${r(x)} ${r(y + h)} V${r(y + rs)} A${r(rr)} ${r(rr)} 0 0 1 ${r(x + w)} ${r(y + rs)} V${r(y + h)} Z`;
      };
      switch (kind) {
        case 'segment': return archD(Math.max(4, Math.min(w * 0.16, h * 0.3)));
        case 'gable': { const rise = Math.min(h * 0.42, w * 0.5); return P([[x, y + h], [x, y + rise], [x + w / 2, y], [x + w, y + rise], [x + w, y + h]]); }
        case 'rake': return P([[x, y + h], [x, y + h * 0.38], [x + w, y], [x + w, y + h]]);
        case 'triangle': return P([[x, y + h], [x + w / 2, y], [x + w, y + h]]);
        case 'circle': { const d = Math.min(w, h), rr = d / 2, cx = x + w / 2, cy = y + h / 2; return `M${r(cx - rr)} ${r(cy)} A${r(rr)} ${r(rr)} 0 1 1 ${r(cx + rr)} ${r(cy)} A${r(rr)} ${r(rr)} 0 1 1 ${r(cx - rr)} ${r(cy)} Z`; }
        case 'octagon': { const d = Math.min(w, h), cx = x + w / 2, cy = y + h / 2, k = d * 0.2071; return P([[cx - k, cy - d / 2], [cx + k, cy - d / 2], [cx + d / 2, cy - k], [cx + d / 2, cy + k], [cx + k, cy + d / 2], [cx - k, cy + d / 2], [cx - d / 2, cy + k], [cx - d / 2, cy - k]]); }
        default: return archD(Math.max(4, Math.min(w / 2, h * 0.55)));
      }
    }
    function shaped(kind) {
      b += `<path d="${shapeD(kind, 0, 0, fw, fh)}" fill="${frameCol}" stroke="${INK}" stroke-width="${sw * 1.15}"/>`;
      b += `<path d="${shapeD(kind, t, t, fw - 2 * t, fh - 2 * t)}" fill="${glassFill}" stroke="${INK}" stroke-width="${sw * 0.7}"/>`;
      const barW = r(Math.max(2.6, t * 0.5));
      const barPath = (d) => `<path d="${d}" stroke="${frameCol}" stroke-width="${barW}" fill="none"/><path d="${d}" stroke="${INK}" stroke-width="${sw * 0.35}" opacity=".5" fill="none"/>`;
      if (kind === 'arch' || !kind) {
        const ir = Math.max(Math.min((fw - 2 * t) / 2, (fh - 2 * t) * 0.55), 4), cy = t + ir;
        b += barPath(`M${r(fw / 2)} ${r(t)} V${r(fh - t)} M${r(t)} ${r(cy)} H${r(fw - t)} M${r(fw / 2)} ${r(cy)} L${r(fw * 0.22)} ${r(t + ir * 0.35)} M${r(fw / 2)} ${r(cy)} L${r(fw * 0.78)} ${r(t + ir * 0.35)}`);
      } else if (kind === 'circle') {
        const d = Math.min(fw, fh) - 2 * t;
        b += barPath(`M${r(fw / 2)} ${r(fh / 2 - d / 2)} V${r(fh / 2 + d / 2)} M${r(fw / 2 - d / 2)} ${r(fh / 2)} H${r(fw / 2 + d / 2)}`);
      } else if (kind === 'gable' || kind === 'segment') {
        // a transom where the shaped head meets the square part, and a mullion below
        const ty = kind === 'gable' ? t + Math.min((fh - 2 * t) * 0.42, (fw - 2 * t) * 0.5) : t + Math.min((fw - 2 * t) * 0.16, (fh - 2 * t) * 0.3);
        b += barPath(`M${r(t)} ${r(ty)} H${r(fw - t)} M${r(fw / 2)} ${r(ty)} V${r(fh - t)}`);
      }
    }

    // ---------- doors ----------
    // door designs: half · half-georgian · glazed · glazed-georgian · slot · squares3 · arch · stripes ·
    // panel2 · panel4 · solid · cottage (plus the automatic 'upvc' and 'composite' looks)
    function doorLeaf(x, y, w, h, side, style, furn = handleCol) {
      b += rect(x, y, w, h, frameCol, sw);
      const m = Math.max(ring * 1.4, w * 0.12);
      const line = dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.16)';
      const panel = (px, py, pw, ph) => rect(px, py, pw, ph, 'none', sw * 0.6) + `<rect x="${r(px + 3)}" y="${r(py + 3)}" width="${r(Math.max(pw - 6, 0))}" height="${r(Math.max(ph - 6, 0))}" fill="none" stroke="${line}" stroke-width="${sw}"/>`;
      const letter = (fy) => `<rect x="${r(x + w / 2 - w * 0.17)}" y="${r(y + h * fy)}" width="${r(w * 0.34)}" height="${r(Math.max(4, h * 0.022))}" rx="1" fill="${furn}"/>`;
      const gx = x + m, gw = w - 2 * m;
      switch (style) {
        case 'composite': case 'slot': {
          const sx = side === 'left' ? x + w * 0.58 : x + w * 0.28;
          b += glass(sx, y + h * 0.1, w * 0.14, h * 0.62);
          b += `<path d="M${r(x + m)} ${r(y + m)} V${r(y + h - m)} M${r(x + w - m)} ${r(y + m)} V${r(y + h - m)}" stroke="${line}" stroke-width="${sw}"/>`;
          b += letter(0.8);
          break;
        }
        case 'glazed': case 'glazed-georgian':
          b += glass(x + m * 0.75, y + m * 0.75, w - m * 1.5, h * 0.72 - m * 0.75);
          if (style === 'glazed-georgian') b += bars(x + m * 0.75, y + m * 0.75, w - m * 1.5, h * 0.72 - m * 0.75, 6);
          b += panel(x + m * 0.75, y + h * 0.76, w - m * 1.5, h * 0.24 - m * 0.75);
          break;
        case 'squares3': {
          const q = Math.min(gw * 0.42, h * 0.11);
          for (let i = 0; i < 3; i++) b += glass(x + w / 2 - q / 2, y + h * 0.12 + i * (q + h * 0.04), q, q);
          b += panel(gx, y + h * 0.62, gw, h * 0.3);
          b += letter(0.56);
          break;
        }
        case 'arch': {
          const ah = h * 0.3, rs = Math.min(gw / 2, ah * 0.6), rr = (gw * gw / 4 + rs * rs) / (2 * rs);
          b += `<path d="M${r(gx)} ${r(y + m + ah)} V${r(y + m + rs)} A${r(rr)} ${r(rr)} 0 0 1 ${r(gx + gw)} ${r(y + m + rs)} V${r(y + m + ah)} Z" fill="${glassFill}" stroke="${INK}" stroke-width="${sw * 0.7}"/>`;
          b += panel(gx, y + m + ah + h * 0.06, gw / 2 - 3, h * 0.48) + panel(gx + gw / 2 + 3, y + m + ah + h * 0.06, gw / 2 - 3, h * 0.48);
          b += letter(0.5);
          break;
        }
        case 'stripes':
          for (let i = 0; i < 4; i++) b += glass(gx + gw * 0.12, y + h * (0.14 + i * 0.13), gw * 0.76, h * 0.035);
          b += letter(0.78);
          break;
        case 'panel2':
          b += panel(gx, y + m, gw, h * 0.4) + panel(gx, y + h * 0.5, gw, h * 0.5 - m);
          b += letter(0.45);
          break;
        case 'panel4':
          b += panel(gx, y + m, gw / 2 - 3, h * 0.4) + panel(gx + gw / 2 + 3, y + m, gw / 2 - 3, h * 0.4);
          b += panel(gx, y + h * 0.5, gw / 2 - 3, h * 0.5 - m) + panel(gx + gw / 2 + 3, y + h * 0.5, gw / 2 - 3, h * 0.5 - m);
          b += letter(0.455);
          break;
        case 'solid':
          b += `<path d="M${r(x + w * 0.32)} ${r(y + m)} V${r(y + h - m)}" stroke="${line}" stroke-width="${sw * 1.4}"/>`;
          b += letter(0.62);
          break;
        case 'cottage': {
          const th = h * 0.2;
          b += glass(gx, y + m, gw, th);
          b += bars(gx, y + m, gw, th, 3);
          let d = '';
          for (let i = 1; i < 5; i++) d += `M${r(gx + (gw * i) / 5)} ${r(y + m + th + h * 0.04)} V${r(y + h - m)} `;
          b += rect(gx, y + m + th + h * 0.04, gw, h - 2 * m - th - h * 0.04, 'none', sw * 0.6) + `<path d="${d}" stroke="${line}" stroke-width="${sw}"/>`;
          b += letter(0.58);
          break;
        }
        case 'half-georgian':
          b += glass(gx, y + m, gw, h * 0.42) + bars(gx, y + m, gw, h * 0.42, 6);
          b += panel(gx, y + h * 0.5, gw, h * 0.5 - m);
          b += letter(0.56);
          break;
        default: // 'upvc' / 'half'
          b += glass(gx, y + m, gw, h * 0.42);
          b += panel(gx, y + h * 0.5, gw, h * 0.5 - m);
          b += letter(0.56);
      }
      b += hingeMark(x, y, w, h, side);
      const hx = side === 'left' ? x + w - m * 0.45 : x + m * 0.45;
      b += `<rect x="${r(hx - 2)}" y="${r(y + h * 0.47)}" width="4" height="${r(Math.max(12, h * 0.1))}" rx="2" fill="${furn}"/>`;
    }

    function door(style, furn) {
      b += frame(0, 0, fw, fh);
      const sideLight = W > 1250;
      const leafW = sideLight ? (fw - 2 * t) * clamp(920 / W, 0.4, 0.8) : fw - 2 * t;
      const side = right ? 'right' : 'left';
      const lx = sideLight && !right ? t : sideLight ? fw - t - leafW : t;
      doorLeaf(lx, t, leafW, fh - t * 1.4, side, style, furn);
      if (sideLight) {
        const sx = right ? t : t + leafW;
        const sw2 = fw - 2 * t - leafW;
        b += rect(sx, t, sw2, fh - t * 1.4, frameCol, sw * 0.8);
        b += glass(sx + ring, t + ring, sw2 - 2 * ring, fh - t * 1.4 - 2 * ring);
      }
      b += `<path d="M0 ${r(fh)} H${r(fw)}" stroke="${INK}" stroke-width="${sw * 2}"/>`;
    }

    // french layouts: "pair", "pair+1" (one side panel), "pair+2", "pair+top", "pair+2+top", "georgian"
    function french(spec) {
      b += frame(0, 0, fw, fh);
      const tok = (spec || '').split('+');
      const nSides = spec ? (tok.includes('2') ? 2 : tok.includes('1') ? 1 : 0) : W > 2000 ? 2 : 0;
      const top = tok.includes('top');
      const leafStyle = tok.includes('georgian') ? 'glazed-georgian' : 'glazed';
      const topH = top ? (fh - t * 1.4) * 0.17 : 0;
      const y0 = t + topH, hh = fh - t * 1.4 - topH;
      if (top) {
        b += rect(t, t, fw - 2 * t, topH - t * 0.3, frameCol, sw * 0.8);
        b += glass(t + ring, t + ring, fw - 2 * t - 2 * ring, topH - t * 0.3 - 2 * ring);
      }
      const panelW = nSides ? (fw - 2 * t) * (spec ? (nSides === 2 ? 0.18 : 0.24) : clamp((W - 1500) / W / 2, 0.08, 0.3)) : 0;
      const leftPanel = nSides === 2 || (nSides === 1 && !right);
      const rightPanel = nSides === 2 || (nSides === 1 && right);
      const lx = t + (leftPanel ? panelW : 0), lw = fw - 2 * t - (leftPanel ? panelW : 0) - (rightPanel ? panelW : 0);
      for (const [on, sx] of [[leftPanel, t], [rightPanel, fw - t - panelW]]) {
        if (!on) continue;
        b += rect(sx, y0, panelW, hh, frameCol, sw * 0.8);
        b += glass(sx + ring, y0 + ring, panelW - 2 * ring, hh - 2 * ring);
      }
      doorLeaf(lx, y0, lw / 2, hh, 'left', leafStyle);
      doorLeaf(lx + lw / 2, y0, lw / 2, hh, 'right', leafStyle);
      b += `<path d="M0 ${r(fh)} H${r(fw)}" stroke="${INK}" stroke-width="${sw * 2}"/>`;
    }

    // bi-fold layouts: "3-0" = three panels folding left; "2-2" = two each way; traffic door on an odd stack
    function bifold(spec) {
      const m = /^(\d)-(\d)$/.exec(spec || '');
      if (m) return bifoldLayout(Number(m[1]), Number(m[2]));
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

    function bifoldLayout(a, c) {
      if (right) [a, c] = [c, a];
      const n = Math.max(1, a + c);
      b += frame(0, 0, fw, fh);
      const ix = t, iy = t, iw = fw - 2 * t, ih = fh - t * 1.4, pw = iw / n;
      for (let i = 0; i < n; i++) b += light(ix + i * pw, iy, pw, ih, ring);
      const traffic = a % 2 ? 0 : c % 2 ? n - 1 : -1;
      for (let i = 0; i < n; i++) {
        const x = ix + i * pw, cx = x + pw / 2;
        if (i === traffic) {
          b += hingeMark(x, iy, pw, ih, i === 0 ? 'left' : 'right');
          b += handleV(i === 0 ? x + pw - ring : x + ring, iy + ih / 2, Math.min(24, fh * 0.1));
          continue;
        }
        const toLeft = i < a;
        const d = toLeft ? -1 : 1;
        b += `<path d="M${r(cx - d * pw * 0.16)} ${r(iy + ih * 0.06)} L${r(cx + d * pw * 0.16)} ${r(iy + ih * 0.06 + pw * 0.12)} L${r(cx - d * pw * 0.16)} ${r(iy + ih * 0.06 + pw * 0.24)}" fill="none" stroke="${BRASS}" stroke-width="${sw}"/>`;
      }
      b += `<path d="M0 ${r(fh)} H${r(fw)}" stroke="${INK}" stroke-width="${sw * 2}"/>`;
    }

    // stable door designs: half (glazed top) · solid · cottage · half-georgian
    function stable(spec) {
      b += frame(0, 0, fw, fh);
      const side = right ? 'right' : 'left';
      const x = t, y = t, w = fw - 2 * t, h = fh - t * 1.4, split = h * 0.48;
      const m = Math.max(ring * 1.4, w * 0.12);
      const line = dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.16)';
      b += rect(x, y, w, split - 1, frameCol, sw);
      if (spec === 'solid') b += rect(x + m, y + m, w - 2 * m, split - 2 * m, 'none', sw * 0.6);
      else {
        b += glass(x + m, y + m, w - 2 * m, split - 2 * m);
        if (spec === 'half-georgian') b += bars(x + m, y + m, w - 2 * m, split - 2 * m, 4);
        if (spec === 'cottage') b += bars(x + m, y + m, w - 2 * m, split - 2 * m, 2);
      }
      b += rect(x, y + split + 1, w, h - split - 1, frameCol, sw) + rect(x + m, y + split + m, w - 2 * m, h - split - 2 * m, 'none', sw * 0.6);
      if (spec === 'cottage') {
        let d = '';
        for (let i = 1; i < 4; i++) d += `M${r(x + m + ((w - 2 * m) * i) / 4)} ${r(y + split + m)} V${r(y + h - m)} `;
        b += `<path d="${d}" stroke="${line}" stroke-width="${sw}"/>`;
      }
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
      case 'casement-windows': if (LAY) gridWindow(LAY, false); else casement(false); break;
      case 'flush-casement-windows': if (LAY) gridWindow(LAY, true); else casement(true); break;
      case 'tilt-and-turn-windows': if (LAY) gridWindow(LAY, false); else tiltTurn(); break;
      case 'sash-windows': sash(LAY); break;
      case 'bay-and-bow-windows': if (LAY) bayLayout(LAY); else bay(); break;
      case 'sliding-windows': if (LAY) slidersLayout(LAY, false); else sliders(W > 2200 ? 3 : 2, false); break;
      case 'shaped-and-feature-windows': shaped(LAY || 'arch'); break;
      case 'upvc-doors': door(LAY || 'upvc'); break;
      case 'composite-doors': door(LAY || 'composite', '#c49a4f'); break;
      case 'french-doors': french(LAY); break;
      case 'patio-doors': if (LAY) slidersLayout(LAY, true); else sliders(W > 4200 ? 4 : W > 3000 ? 3 : 2, true); break;
      case 'bifold-doors': bifold(LAY); break;
      case 'stable-doors': stable(LAY); break;
      case 'sealed-unit': sealedUnit(); break;
      default: other();
    }
    const pad = 2;
    const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${r(fw + pad * 2)} ${r(fh + pad * 2)}" width="${r(fw + pad * 2)}" height="${r(fh + pad * 2)}" role="img" aria-label="${(o.label || 'Elevation drawing').replace(/"/g, '')}">${defs}${b}</svg>`;
    return { svg: out, fw: fw + pad * 2, fh: fh + pad * 2, W, H };
  }

  window.VXDraw = { svg, DEFAULTS, KIND, COLOURS, HINGED, SLIDING };
})();
