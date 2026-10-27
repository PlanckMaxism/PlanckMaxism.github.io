(() => {
  const dialog = document.querySelector('#search-dialog');
  const input = document.querySelector('#search-input');
  const results = document.querySelector('#search-results');
  const status = document.querySelector('#search-status');
  const root = document.body.dataset.root;
  const index = window.SITE_SEARCH || [];
  let previousFocus;
  function draw() {
    const query = input.value.trim().toLocaleLowerCase();
    const words = query.split(/\s+/).filter(Boolean);
    const matches = (query ? index.filter(p => words.every(w => (p.title+' '+p.text).toLocaleLowerCase().includes(w))).sort((a,b) => Number(b.title.toLocaleLowerCase().includes(query))-Number(a.title.toLocaleLowerCase().includes(query))) : index.filter(p => ['课程 Wiki','教学进度','概念索引','研究方向','个人简介'].includes(p.title))).slice(0,30);
    results.replaceChildren();
    status.textContent = query ? (matches.length ? `找到 ${matches.length} 个相关页面` : '暂未找到相关页面，请尝试更短的关键词。') : '快速入口';
    for (const p of matches) {
      const li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small'),title=document.createElement('strong'),excerpt=document.createElement('span');
      a.href=root+p.url;small.textContent=p.section;title.textContent=p.title;
      const at=query?p.text.toLocaleLowerCase().indexOf(words[0]):-1;
      excerpt.textContent=(at>25?'…':'')+p.text.slice(Math.max(0,at-25),Math.max(0,at-25)+100);
      a.append(small,title,excerpt);li.append(a);results.append(li);
    }
  }
  function open(){previousFocus=document.activeElement;dialog.showModal();draw();input.focus();}
  function close(){dialog.close();}
  document.querySelectorAll('.search-open').forEach(b=>b.addEventListener('click',open));
  document.querySelector('.search-close').addEventListener('click',close);
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  dialog.addEventListener('close',()=>previousFocus?.focus());
  input.addEventListener('input',draw);
  input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('a')?.focus();}if(e.key==='Enter'){const a=results.querySelector('a');if(a)a.click();}});
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!dialog.open)open();}});
  const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
  toggle.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));nav.classList.toggle('is-open',!expanded);});
})();
