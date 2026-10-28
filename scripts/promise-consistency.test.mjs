import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {businessSchema} from '../lib/layout.mjs';
import {allFaqs} from '../src/content/faqs.mjs';
import {repairs} from '../src/content/repairs.mjs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(join(dir,x.name)):[join(dir,x.name)]);

test('confirmed contact hours are ContactPoint availability, not unverified business attendance hours',()=>{
 const site=JSON.parse(read('src/data/site.json'));const b=businessSchema(site);
 assert.equal(b.openingHoursSpecification,undefined);
 assert.equal(b.contactPoint.hoursAvailable[0].opens,'07:00');
 assert.equal(b.contactPoint.hoursAvailable[0].closes,'00:00');
 assert.equal(b.contactPoint.hoursAvailable[0].dayOfWeek.length,7);
});
test('all rendered routes avoid blanket free-survey and included-waste promises',()=>{
 const files=walk(fileURLToPath(new URL('../dist/',import.meta.url))).filter(x=>x.endsWith('.html'));assert.equal(files.length,50);
 for(const f of files){const html=readFileSync(f,'utf8');
  assert.ok(!/Free survey and (?:an itemised |a |written)|Book a free survey|after a free survey|at a free survey|old frames taken away|We come back and fix it|you don.t need to hire a skip/i.test(html),f);
  const jsonld=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if(!jsonld){assert.match(html,/noindex/);continue;}
  const b=JSON.parse(jsonld[1])['@graph'].find(n=>n['@type']==='HomeAndConstructionBusiness');
  assert.equal(b.openingHoursSpecification,undefined,f);assert.equal(b.contactPoint.hoursAvailable[0].closes,'00:00',f);
 }
});
test('survey FAQ and installation scope require job-specific fee and responsibility checks',()=>{
 const f=allFaqs.find(f=>f.q==='Are the survey and quote really free?');assert.match(f.a,/availability/i);assert.match(f.a,/charges/i);
 const installation=read('dist/services/installation/index.html');assert.match(installation,/Confirm in your quote/);assert.match(installation,/any charges/);assert.match(installation,/waste disposal arrangements/);
 const about=read('dist/about/index.html');assert.match(about,/aftercare contact/);assert.doesNotMatch(about,/old frames taken away|We come back and fix it/);
});
test('chatbot, PDF text and machine summary retain the same survey qualification',()=>{
 const bot=read('dist/assets/js/assistant.js'),forms=read('dist/assets/js/forms.js'),llms=read('dist/llms.txt');
 for(const text of [bot,forms,llms])assert.ok(!/after a free survey|at a free survey|surveys and written quotes.*are free/i.test(text),'No unconditional survey promise in machine-facing copy');
 assert.match(bot,/survey availability and any charges/);assert.match(forms,/survey arrangements and any charges/);assert.match(llms,/survey availability and any charges/);
 const kb=JSON.parse(read('dist/assets/data/kb.json'));assert.ok(kb.faqs.some(x=>x.q==='Are the survey and quote really free?'&&/charges/i.test(x.a)));
});
test('repair visit descriptions do not invent completion frequencies or fixed durations',()=>{
 for(const r of repairs)assert.ok(!/usually|often|most|under an hour|about an hour|can take a day|two short visits/i.test(r.visit),r.slug);
 assert.ok(!/\b(?:Most|usually|often)[^.]{0,140}(?:one visit|under an hour)/i.test(JSON.stringify({repairs,allFaqs})),'Repair answers also avoid unsupported visit/duration promises');
});
