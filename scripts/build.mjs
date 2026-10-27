import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {marked} from '../vendor/marked.esm.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const config=JSON.parse(read('site.config.json'));
const pages=JSON.parse(read('content/pages.json'));
const course=JSON.parse(read('content/course.json'));
const out=path.join(root,'dist');
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=new Map(pages.map(p=>[p.id,p]));
if(byId.size!==pages.length) throw Error('Duplicate page IDs');
const routes=new Set();
for(const p of pages){
 if(routes.has(p.route)||!/^([a-z0-9-]+\/)*index\.html$/.test(p.route)) throw Error('Invalid/duplicate route: '+p.route);
 routes.add(p.route);
 const absolute=path.resolve(root,p.file);
 if(!absolute.startsWith(path.join(root,'content')+path.sep)||fs.lstatSync(absolute).isSymbolicLink()) throw Error('Content outside allowed directory: '+p.file);
 p.source=read(p.file);
 p.links=[...p.source.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map(m=>m[1]);
 for(const id of p.links) if(!byId.has(id)) throw Error(`Broken wiki link in ${p.file}: ${id}`);
}
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
const prefix=p=>'../'.repeat(p.route.split('/').length-1);
const link=(p,id)=>prefix(p)+byId.get(id).route;
const arrow='<span aria-hidden="true">↗</span>';
function renderMD(p){
 const headings=[];const counts=new Map();
 const renderer=new marked.Renderer();
 renderer.heading=function({tokens,depth}){
  const label=this.parser.parseInline(tokens),plain=label.replace(/<[^>]*>/g,'');
  const raw=plain.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'')||'section';
  const n=counts.get(raw)||0;counts.set(raw,n+1);const id=raw+(n?'-'+n:'');
  if(depth===2) headings.push({id,label:plain});
  return `<h${depth} id="${esc(id)}">${label}</h${depth}>`;
 };
 const body=p.source.replace(/^# .+\n/,'').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(_,id,label)=>`[${label||byId.get(id).title}](${link(p,id)})`);
 const html=marked.parse(body,{renderer,gfm:true});
 return {html,headings};
}
function header(p){
 const nav=[['home','首页'],['research','研究'],['about','关于'],['course','教学'],['wiki','课程 Wiki']];
 return `<a class="skip-link" href="#main">跳到正文</a><header class="header"><a class="brand" href="${link(p,'home')}"><span class="monogram">jc<span>·</span></span><span>${esc(config.name)}<small>RESEARCH & TEACHING</small></span></a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav">菜单 <span aria-hidden="true">☰</span></button><nav id="main-nav" aria-label="主导航">${nav.map(([id,title])=>`<a href="${link(p,id)}" ${p.id===id?'aria-current="page"':''}>${title}</a>`).join('')}</nav><button class="search-open" aria-label="搜索全站"><span aria-hidden="true">⌕</span><span>搜索</span><kbd>⌘ K</kbd></button></header>`;
}
function footer(p){return `<footer class="footer"><div><strong>${esc(config.name)}</strong><span>研究 · 教学 · 持续探索</span></div><div><a href="${esc(config.github)}">GitHub ${arrow}</a><span>© ${config.updated.slice(0,4)} · 网站初版</span></div></footer>`;}
function search(){return `<dialog id="search-dialog" aria-labelledby="search-heading"><div class="search-top"><h2 id="search-heading">搜索研究与课程</h2><button class="search-close" aria-label="关闭搜索">✕</button></div><label class="sr-only" for="search-input">输入关键词</label><input id="search-input" type="search" placeholder="试试：声子、能带、教学进度…" autocomplete="off"><p id="search-status" aria-live="polite">输入关键词，查找页面与课程内容。</p><ul id="search-results"></ul><div class="search-bottom">搜索当前网站内容 <span>ESC 关闭</span></div></dialog>`;}
function banner(){return config.draft?'<div class="draft-banner"><span class="dot"></span> 网站初版 · 研究介绍为草案，课程内容将逐步完善</div>':'';}
function researchRows(p){return `<div class="research-rows">${[['01','超快动力学与相干声子','ULTRAFAST DYNAMICS','光激发后的晶格与电子响应，相干振动及其光谱表征。'],['02','太赫兹产生与光物质耦合','TERAHERTZ PHYSICS','从时域光谱、偏振响应到耦合传播模式。'],['03','极性材料与集体激发','POLAR MATERIALS','连接材料结构、极化动力学与可观测的光学响应。']].map(([n,t,en,d])=>`<a class="research-row" href="${link(p,'research')}"><span class="row-number">${n}</span><div><small>${en}</small><h3>${t}</h3><p>${d}</p></div>${arrow}</a>`).join('')}</div>`;}
function home(p){return `${banner()}<section class="hero"><div class="hero-copy"><p class="eyebrow">LIGHT · MATTER · UNDERSTANDING</p><h1>探索光与物质的<br><em>超快相互作用。</em></h1><p class="hero-intro">${esc(config.intro)}</p><div class="hero-actions"><a class="button primary" href="${link(p,'research')}">探索研究方向 ${arrow}</a><a class="button text-button" href="${link(p,'course')}">走进固体物理课堂 <span aria-hidden="true">→</span></a></div><div class="hero-signature"><span>${esc(config.name)}</span><small>${esc(config.tagline)}</small></div></div><figure class="hero-art"><img src="${prefix(p)}assets/field.svg" alt="光波穿过晶格的抽象示意图"><figcaption><span>光 · 晶格 · 响应</span><span>概念示意 / 01</span></figcaption></figure></section><section class="home-research"><div class="section-heading"><div><p class="eyebrow">RESEARCH INTERESTS</p><h2>从问题出发，理解微观世界</h2></div><a href="${link(p,'research')}">全部研究方向 ${arrow}</a></div>${researchRows(p)}</section><section class="teaching-feature"><div><p class="eyebrow">TEACHING & OPEN KNOWLEDGE</p><h2>固体物理<br><em>从晶体结构，到材料性质。</em></h2><p>以黄昆教材为依据，沿 Kittel 的主题主线，<br class="desktop-only">搭建一套可导航、可关联、持续完善的课程 Wiki。</p><a class="button light" href="${link(p,'course')}">进入课程 ${arrow}</a></div><div class="course-preview"><div class="course-meta"><span>本科 · 大三下学期</span><span>课程框架</span></div><div class="course-numbers"><div><strong>56</strong><span>学时</span></div><div><strong>28</strong><span>讲次</span></div><div><strong>13</strong><span>章节</span></div></div><div class="course-path"><span>晶体结构</span><span>晶格振动</span><span>电子与能带</span><span>材料性质</span></div><a class="course-bottom" href="${link(p,'wiki')}">浏览课程 Wiki <span aria-hidden="true">→</span></a></div></section><section class="home-about"><p class="eyebrow">ABOUT THIS SPACE</p><div><h2>研究与教学，在这里相遇。</h2><p>这个网站用于分享研究兴趣、学术经历和学习资源。<br>个人简介与代表成果将在后续逐步补充。</p><a href="${link(p,'about')}">了解更多 ${arrow}</a></div></section>`;}
function sidebar(p){const entries=[['course','课程首页'],['syllabus','教学进度'],['wiki','Wiki 总览'],['concepts','概念索引'],['resources','学习资源']];return `<aside class="wiki-sidebar" aria-label="课程导航"><a class="course-back" href="${link(p,'course')}">SOLID STATE PHYSICS</a><strong>固体物理</strong><nav>${entries.map(([id,t])=>`<a ${p.id===id?'aria-current="page"':''} href="${link(p,id)}">${t}</a>`).join('')}<span class="nav-label">章节目录</span>${course.chapters.map(c=>`<a ${p.id===c.id?'aria-current="page"':''} href="${link(p,c.id)}"><span>${String(c.number).padStart(2,'0')}</span>${esc(c.title)}</a>`).join('')}</nav></aside>`;}
function chapterList(p){return `<div class="chapter-list">${course.chapters.map(c=>`<a class="chapter-link" href="${link(p,c.id)}"><span class="chapter-number">${String(c.number).padStart(2,'0')}</span><div><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><small>第 ${String(c.start).padStart(2,'0')}${c.end!==c.start?'–'+String(c.end).padStart(2,'0'):''} 讲 · ${(c.end-c.start+1)*2} 学时</small></div><span class="chapter-state">框架 ${arrow}</span></a>`).join('')}</div>`;}
function wiki(p){return `<div class="wiki-layout">${sidebar(p)}<div class="wiki-main"><div class="breadcrumbs"><a href="${link(p,'course')}">教学</a><span>/</span>固体物理<span>/</span>Wiki</div><p class="eyebrow">A CONNECTED LEARNING SPACE</p><h1>课程 Wiki</h1><p class="page-lead">循着章节学习，也沿着概念探索。<br>从晶体结构出发，逐步建立固体物理的知识联系。</p><button class="wiki-search search-open">搜索概念、章节或学习目标 <span aria-hidden="true">⌕</span></button><div class="wiki-quick"><a href="${link(p,'syllabus')}"><strong>28 讲教学进度</strong><span>查看学时与学习目标 →</span></a><a href="${link(p,'concepts')}"><strong>概念索引</strong><span>从关键词进入章节 →</span></a></div><div class="section-heading compact"><h2>章节地图</h2><span>13 个章节 · 56 学时</span></div>${chapterList(p)}<p class="quiet-note">当前为网站架构版。章节页面展示学习目标，学生版讲义将逐步补充。</p></div></div>`;}
function article(p){const {html,headings}=renderMD(p);const isCourse=p.group==='wiki'||p.group==='course';const backlinks=pages.filter(q=>q.id!==p.id&&q.links.includes(p.id));return `<div class="${isCourse?'wiki-layout':'article-layout'}">${isCourse?sidebar(p):''}<div class="article-main"><div class="breadcrumbs"><a href="${link(p,'home')}">首页</a><span>/</span>${isCourse?`<a href="${link(p,'course')}">固体物理</a><span>/</span>`:''}${esc(p.title)}</div><p class="eyebrow">${isCourse?'SOLID STATE PHYSICS':p.group==='research'?'RESEARCH':'ABOUT'}</p><h1>${esc(p.title)}</h1><p class="article-meta">网站初版 <span>·</span> 更新于 ${esc(config.updated)}</p><article class="prose">${html}</article>${backlinks.length?`<section class="backlinks"><h2>关联此页</h2>${backlinks.map(q=>`<a href="${link(p,q.id)}">${esc(q.title)} ${arrow}</a>`).join('')}</section>`:''}<div class="article-bottom"><a href="${link(p,isCourse?'wiki':'home')}">← ${isCourse?'课程 Wiki':'返回首页'}</a><a href="#main">回到顶部 ↑</a></div></div><aside class="toc" aria-label="本页目录"><span>本页目录</span>${headings.map(h=>`<a href="#${esc(h.id)}">${esc(h.label)}</a>`).join('')}</aside></div>`;}
for(const p of pages){const body=p.kind==='home'?home(p):p.kind==='wiki'?wiki(p):article(p);const html=`<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title)} · ${esc(config.name)}</title><meta name="description" content="${esc(p.kind==='home'?config.intro:p.title+' · '+config.siteTitle)}"><meta name="theme-color" content="#f7f7f2">${config.draft?'<meta name="robots" content="noindex">':''}<link rel="icon" href="${prefix(p)}assets/favicon.svg" type="image/svg+xml"><link rel="canonical" href="${esc(config.url+'/'+p.route.replace(/index.html$/,''))}"><link rel="stylesheet" href="${prefix(p)}assets/style.css"><script defer src="${prefix(p)}assets/search-index.js"></script><script defer src="${prefix(p)}assets/app.js"></script></head><body data-root="${prefix(p)}">${header(p)}<main id="main">${body}</main>${footer(p)}${search()}</body></html>`;const f=path.join(out,p.route);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,html);}
const searchIndex=pages.map(p=>({title:p.title,url:p.route,section:['course','wiki'].includes(p.group)?'固体物理':'个人网站',text:p.source.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(_,id,label)=>label||byId.get(id).title).replace(/[#*|>\[\]]/g,' ').replace(/\s+/g,' ').slice(0,25000)}));
fs.writeFileSync(path.join(out,'assets/search-index.js'),'window.SITE_SEARCH='+JSON.stringify(searchIndex).replace(/</g,'\\u003c')+';\n');
fs.writeFileSync(path.join(out,'.nojekyll'),'');
fs.writeFileSync(path.join(out,'404.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>页面未找到</title><style>body{font:18px/1.8 system-ui;margin:15vh auto;max-width:560px;padding:24px;color:#173d37;background:#f7f7f2}a{color:inherit}</style><h1>这个页面还没有到来。</h1><p>链接可能已更新，请从网站首页重新查找。</p><a href="${esc(config.url)}/">返回首页 →</a></html>`);
console.log(`Built ${pages.length} pages; ${course.lessons.length} lessons; ${course.chapters.length} chapters.`);
