import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const pages=JSON.parse(fs.readFileSync(path.join(root,'content/pages.json'),'utf8'));
const course=JSON.parse(fs.readFileSync(path.join(root,'content/course.json'),'utf8'));
const ids=new Map();let checked=0;const errors=[];
for(const p of pages){const html=fs.readFileSync(path.join(dist,p.route),'utf8');const names=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(names).size,names.length,'Duplicate HTML IDs: '+p.route);ids.set(p.route,new Set(names));assert.match(html,/<html lang="zh-CN">/);assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,'Expected one H1: '+p.route);assert.ok(!html.includes('[['),'Unresolved wiki link: '+p.route);}
for(const p of pages){const html=fs.readFileSync(path.join(dist,p.route),'utf8');for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){const url=m[1].replace(/&amp;/g,'&');if(/^(https?:|mailto:|data:)/.test(url))continue;checked++;const [name,fragment]=url.split('#');const target=name?path.posix.normalize(path.posix.join(path.posix.dirname(p.route),decodeURI(name))):p.route;if(target.startsWith('../')||!fs.existsSync(path.join(dist,target)))errors.push(p.route+' → '+url);if(fragment&&ids.has(target)&&!ids.get(target).has(decodeURIComponent(fragment)))errors.push(p.route+' missing anchor → '+url);}}
assert.equal(course.lessons.length,28);assert.equal(course.lessons.reduce((sum,x)=>sum+x.hours,0),56);assert.equal(course.chapters.length,13);assert.equal(new Set(course.lessons.map(x=>x.number)).size,28);
for(const lesson of course.lessons)assert.equal(course.chapters.filter(c=>lesson.number>=c.start&&lesson.number<=c.end).length,1,'Chapter coverage: '+lesson.number);
for(const file of ['raw','private','teacher','.env'])assert.ok(!fs.existsSync(path.join(dist,file)),'Unexpected output directory '+file);
assert.equal(errors.length,0,errors.join('\n'));
console.log(`PASS: ${pages.length} pages, ${checked} local links/assets, unique headings, 28 lessons / 56 hours / 13 chapters.`);
