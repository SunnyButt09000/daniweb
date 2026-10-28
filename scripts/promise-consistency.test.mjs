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
test('all rendered routes retain free-survey policy without inventing included extras',()=>{
 const files=walk(fileURLToPath(new URL('../dist/',import.meta.url))).filter(x=>x.endsWith('.html'));assert.equal(files.length,50);
 for(const f of files){const html=readFileSync(f,'utf8');
  assert.ok(!/guaranteed (?:free |same.day )?visit|no travel costs anywhere|free repair diagnostic|old frames taken away|We come back and fix it|you don.t need to hire a skip/i.test(html),f);
  const jsonld=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if(!jsonld){assert.match(html,/noindex/);continue;}
  const b=JSON.parse(jsonld[1])['@graph'].find(n=>n['@type']==='HomeAndConstructionBusiness');
  assert.equal(b.openingHoursSpecification,undefined,f);assert.equal(b.contactPoint.hoursAvailable[0].closes,'00:00',f);
 }
 assert.match(read('dist/index.html'),/Free window &amp; door surveys/);
});
test('owner-confirmed free window-and-door survey remains distinct from travel and repair fees',()=>{
 const f=allFaqs.find(f=>f.q==='Are the survey and quote really free?');
 assert.ok(f,'Free-survey FAQ missing');assert.match(f.a,/surveys are free/i);
 assert.match(f.a,/postcode/i);assert.match(f.a,/separate fitter travel costs/i);
 assert.match(f.a,/Repair diagnostic or call-out visits.*separately agreed fee/i);
 const installation=read('dist/services/installation/index.html');
 assert.match(installation,/Confirm in your quote/);assert.match(installation,/Free window and door survey/);
 assert.match(installation,/waste disposal arrangements/);
 const survey=read('dist/services/survey-and-quote/index.html');
 assert.match(survey,/survey is free/i);assert.match(survey,/separate fitter travel costs/i);
 const about=read('dist/about/index.html');assert.match(about,/Free survey before price/);
 assert.doesNotMatch(about,/old frames taken away|We come back and fix it/);
});
test('chatbot, quote PDF and machine-readable copy use the confirmed free-survey terms',()=>{
 const bot=read('dist/assets/js/assistant.js'),forms=read('dist/assets/js/forms.js'),llms=read('dist/llms.txt');
 assert.match(bot,/window and door surveys are free/i);
 assert.match(bot,/separate fitter travel costs/i);
 assert.match(forms,/window and door surveys are free/i);
 assert.match(llms,/window and door surveys are free/i);
 assert.match(llms,/repair diagnostic call-outs.*fee/i);
 const kb=JSON.parse(read('dist/assets/data/kb.json'));
 assert.ok(kb.faqs.some(x=>x.q==='Are the survey and quote really free?'&&/surveys are free/i.test(x.a)));
});
test('repair visit descriptions do not invent completion frequencies or fixed durations',()=>{
 for(const r of repairs)assert.ok(!/usually|often|most|under an hour|about an hour|can take a day|two short visits/i.test(r.visit),r.slug);
 assert.ok(!/\b(?:Most|usually|often)[^.]{0,140}(?:one visit|under an hour)/i.test(JSON.stringify({repairs,allFaqs})),'Repair answers also avoid unsupported visit/duration promises');
});
