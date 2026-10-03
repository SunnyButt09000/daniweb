// Runs the browser drawing engine (src/assets/js/draw.js) at build time, so the model cards on
// product pages show exactly the same drawings as the quote builder.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL('../src/assets/js/draw.js', import.meta.url), 'utf8'), ctx);
export const VXDraw = ctx.window.VXDraw;

// static drawing of one model, in white with clear glass
export function modelDrawing(type, m, box = 170) {
  return VXDraw.svg(type, { w: m.size[0], h: m.size[1], layout: m.layout, colour: 'White', glass: 'Clear', box, idPrefix: 'md', label: `${m.name}: elevation drawing` }).svg;
}

// Checks every model before the site is built, so a typo can't publish a broken drawing.
const CELL = /^(F|L|R|T|B|TL|TR)(\*\d+(\.\d+)?)?$/;
const gridOk = (s) => s.split('|').every((c) => { const m = /^(\d+(?:\.\d+)?:)?(.+)$/.exec(c.trim()); return m && m[2].split('/').every((x) => CELL.test(x.trim())); });
const DOOR = ['half', 'half-georgian', 'glazed', 'glazed-georgian', 'slot', 'squares3', 'arch', 'stripes', 'panel2', 'panel4', 'solid', 'cottage'];
const RULES = {
  'casement-windows': gridOk,
  'flush-casement-windows': gridOk,
  'tilt-and-turn-windows': gridOk,
  'sash-windows': (s) => /^(1|2|3|4|6|8|9|12)\/(1|2|3|4|6|8|9|12)$/.test(s),
  'bay-and-bow-windows': (s) => ['3@45', '3@30', '3@90', '4@bow', '5@bow'].includes(s),
  'sliding-windows': (s) => /^[SF](\|[SF])+$/.test(s) && s.includes('S'),
  'patio-doors': (s) => /^[SF](\|[SF])+$/.test(s) && s.includes('S'),
  'shaped-and-feature-windows': (s) => ['arch', 'segment', 'gable', 'rake', 'triangle', 'circle', 'octagon'].includes(s),
  'upvc-doors': (s) => DOOR.includes(s),
  'composite-doors': (s) => DOOR.includes(s),
  'stable-doors': (s) => ['half', 'half-georgian', 'solid', 'cottage'].includes(s),
  'french-doors': (s) => ['pair', 'pair+1', 'pair+2', 'pair+top', 'pair+2+top', 'georgian'].includes(s),
  'bifold-doors': (s) => /^[0-7]-[0-7]$/.test(s) && Number(s[0]) + Number(s[2]) >= 1,
};
export function checkModels(models, products) {
  const errors = [];
  const seen = new Set();
  for (const [slug, list] of Object.entries(models)) {
    if (!products.some((p) => p.slug === slug)) errors.push(`models.mjs: "${slug}" is not a product slug`);
    for (const m of list) {
      const at = `models.mjs ${slug} ${m.code || '(no code)'}`;
      if (!/^[A-Z]{2}-\d{2}$/.test(m.code || '')) errors.push(`${at}: code must look like CW-01`);
      if (seen.has(m.code)) errors.push(`${at}: code used twice`);
      seen.add(m.code);
      if (!m.name || !m.desc) errors.push(`${at}: name and desc are required`);
      if (!Array.isArray(m.size) || !(m.size[0] >= 200 && m.size[0] <= 8000 && m.size[1] >= 200 && m.size[1] <= 4000)) errors.push(`${at}: size must be [width, height] in mm`);
      if (!RULES[slug] || !RULES[slug](String(m.layout || ''))) errors.push(`${at}: layout "${m.layout}" is not valid (see the legend at the top of models.mjs)`);
    }
  }
  return errors;
}
