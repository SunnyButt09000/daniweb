import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const main = readFileSync(new URL('../src/assets/js/main.js', import.meta.url), 'utf8');
const topbarCode = main.slice(main.indexOf("  const tb = document.querySelector('.topbar');"), main.indexOf('\n  const io ='));
function topbar({ mobile = true, reduce = false } = {}) {
  const element = () => ({
    classes: new Set(), attrs: {}, inert: false,
    classList: { toggle(c, yes) { yes ? this.owner.classes.add(c) : this.owner.classes.delete(c); }, remove(c) { this.owner.classes.delete(c); }, add(c) { this.owner.classes.add(c); } },
    setAttribute(k,v) { this.attrs[k] = v; }, removeAttribute(k) { delete this.attrs[k]; },
  });
  const messages = Array.from({length:3}, element);
  const tb = element();
  for (const el of [...messages,tb]) el.classList.owner=el;
  tb.querySelector = s => messages[['.topbar__wa','.topbar__msg','.topbar__hours'].indexOf(s)];
  const doc = { querySelector: () => tb, activeElement: null };
  tb.contains = el => messages.includes(el);
  let tick, changed;
  const mq = {matches:mobile,addEventListener:(_,f)=>{changed=f;}};
  runInNewContext(topbarCode,{document:doc,window:{matchMedia:()=>mq},reduce,setInterval:f=>{tick=f;return 1;},clearInterval:()=>{tick=null;}});
  return {messages,doc,tb,tick:()=>tick?.(),resize:mobile=>{mq.matches=mobile;changed();}};
}

test('header logo uses its visible name with home context, without an overriding label',()=>{
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const logo=html.match(/<a class="logo"[^>]*>[\s\S]*?<\/a>/)?.[0];
  assert.ok(logo);
  assert.doesNotMatch(logo,/aria-label=/);
  assert.match(logo,/class="sr">[^<]*home/);
});

test('rotating topbar makes every visually hidden item inert across a full cycle',()=>{
  const {messages,tick}=topbar();
  for(let active=0;active<3;active++){
    messages.forEach((el,i)=>{assert.equal(el.inert,i!==active);assert.equal(el.attrs['aria-hidden'],String(i!==active));});
    tick();
  }
});

test('rotation does not hide a topbar link while it holds keyboard focus',()=>{
  const {messages,doc,tick}=topbar();doc.activeElement=messages[0];tick();
  assert.equal(messages[0].attrs['aria-hidden'],'false');
  assert.equal(messages[0].inert,false);
  doc.activeElement=null;tick();assert.equal(messages[0].inert,true);
});

test('desktop and reduced-motion modes restore normal accessibility and focusability',()=>{
  const state=topbar();state.tick();state.resize(false);
  for(const el of state.messages){assert.equal(el.inert,false);assert.equal(el.attrs['aria-hidden'],undefined);}
  const reduced=topbar({reduce:true});
  for(const el of reduced.messages){assert.equal(el.inert,false);assert.equal(el.attrs['aria-hidden'],undefined);}
});
