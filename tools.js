'use strict';
/* Behaviour of the tool pages learn.html, help.html, controls.html and glossary.html. Each page is complete HTML
   without it; this file only enhances what it finds:
   - details[id] (a lesson, a help topic): a link to <page>#<id> opens and focuses it. Opening one by hand adds a
     history entry with its address, so a phone's Back closes it again; closing it by hand removes that entry.
   - learn.html: the "I tried it on my K.O. II" toggle of each lesson (button.complete), saved as koii-coach-v2.done
     (the lesson ids), plus the "Tried" tag and the count.
   - help.html: #search filters the topics as you type (whole words, the last one may be half typed), hides the empty
     groups and keeps the query in the address (?q=) so it can be shared. "Search every step, lesson and word" opens the
     site search with the same words.
   - controls.html: the buttons ([data-control]) are two radio groups with arrow keys; the chosen one's explanation,
     copied from "Every control" below the map, shows in #info under the buttons (a fixed-height panel, so nothing moves).
     controls.html#control-<name> chooses that control. */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],main=document.getElementById('main');
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const P=window.CoachProgress;
function toast(text){
  const el=document.getElementById('toast');if(!el)return;
  el.textContent=text;el.classList.remove('hidden');
  clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.add('hidden'),5000);
}
const hashId=()=>{try{return decodeURIComponent(location.hash.slice(1));}catch(e){return location.hash.slice(1);}};

// ---------- Items opened from a link ----------
const items=$$('main details[id]');
let pushed=null,last=null;
function openItem(d){
  if(!d.open){d.dataset.byLink='1';d.open=true;}
  d.scrollIntoView({block:'start'});
  const s=d.querySelector('summary');if(s)s.focus({preventScroll:true});
}
function route(){
  const h=location.hash;if(h===last)return;last=h;
  const id=hashId();
  if(pushed&&pushed!==id){const d=document.getElementById(pushed);pushed=null;if(d&&d.open){d.dataset.byLink='1';d.open=false;}}
  const el=id&&document.getElementById(id);
  if(el&&main.contains(el)&&el.tagName==='DETAILS'&&items.includes(el))openItem(el);
}
items.forEach(d=>d.addEventListener('toggle',()=>{
  if(d.dataset.byLink){delete d.dataset.byLink;return;}   // opened or closed by route(), not by hand
  const path=location.pathname+location.search;
  if(d.open){
    if(location.hash!=='#'+d.id){try{history.pushState(null,'',path+'#'+d.id);pushed=d.id;last=location.hash;}catch(e){}}
  }else if(location.hash==='#'+d.id){
    if(pushed===d.id){pushed=null;history.back();}
    else{try{history.replaceState(null,'',path);last=location.hash;}catch(e){}}
  }
}));
addEventListener('popstate',route);
addEventListener('hashchange',route);
// The first route waits for load: the browser's own jump to the #fragment comes then, and would take focus back.
if(items.length){if(document.readyState==='complete')route();else addEventListener('load',()=>setTimeout(route,0),{once:true});}

// ---------- Learn: "I tried it on my K.O. II" ----------
const lessons=$$('details[data-lesson]');
if(lessons.length&&P){
  const tried=()=>new Set(P.v2().done);
  const mark=on=>on?icon('check')+'Tried on the device':'I tried it on my K.O. II';
  function paint(){
    const t=tried();let n=0;
    lessons.forEach(l=>{
      const on=t.has(l.id),b=l.querySelector('.complete'),tag=l.querySelector('.lesson-tried');
      if(on)n++;
      if(tag)tag.hidden=!on;
      if(b){b.hidden=false;b.setAttribute('aria-pressed',String(on));b.innerHTML=mark(on);}
    });
    const c=$('#learn-count');if(c)c.textContent=`${n} of ${lessons.length} lessons tried on the device.`;
  }
  lessons.forEach(l=>{
    const b=l.querySelector('.complete');if(!b)return;
    b.addEventListener('click',()=>{
      const t=tried(),on=!t.has(l.id);
      if(on)t.add(l.id);else t.delete(l.id);
      if(!P.writeV2({done:[...t]})){toast('This browser is not saving progress, so the mark will be lost.');return;}
      paint();toast(on?'Saved. Revisit whenever you need it.':'Mark removed.');
    });
  });
  paint();
  addEventListener('storage',e=>{if(e.key==='koii-coach-v2')paint();});
}

// ---------- Troubleshooting: filter the topics ----------
const input=$('#search'),results=$('#results');
if(input&&results&&$('details[data-topic]')){
  const fold=s=>String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
  const words=s=>fold(s).match(/[\p{L}\p{N}]+/gu)||[];
  const topics=$$('#results details[data-topic]').map(d=>({d,w:words(d.textContent)}));
  const groups=$$('#results .help-group'),count=$('#result-count'),more=$('.help-more'),total=topics.length;
  function filter(){
    const q=words(input.value).slice(0,8),lastI=q.length-1;
    let n=0;
    topics.forEach(t=>{
      const hit=q.every((w,i)=>t.w.some(x=>i===lastI?x.startsWith(w):x===w||x.startsWith(w)&&x.length-w.length<=2));
      t.d.hidden=!hit;if(hit)n++;
    });
    groups.forEach(g=>{g.hidden=!g.querySelector('details[data-topic]:not([hidden])');});
    const text=input.value.trim();
    count.textContent=!q.length?`${total} troubleshooting topics.`:n?`${n} of ${total} topics match “${text}”.`:`No troubleshooting topic matches “${text}”. Try: silent, repeat, erase, scene, USB.`;
    if(more)more.hidden=!q.length;
    try{const u=new URL(location.href);if(text)u.searchParams.set('q',text);else u.searchParams.delete('q');history.replaceState(history.state,'',u.pathname+u.search+u.hash);}catch(e){}
  }
  const q=new URLSearchParams(location.search).get('q');
  if(q)input.value=q;
  input.addEventListener('input',filter);
  input.form&&input.form.addEventListener('submit',e=>{e.preventDefault();filter();});
  const all=$('#search-all');
  if(all)all.addEventListener('click',()=>{if(window.CoachShell)CoachShell.openSearch(input.value.trim());});
  if(q)filter();
}

// ---------- Control map ----------
const radios=$$('[data-control]'),info=$('#info');
if(radios.length&&info){
  function choose(b,focus){
    radios.forEach(x=>{const on=x===b;x.classList.toggle('chosen',on);x.setAttribute('aria-checked',String(on));x.tabIndex=on?0:-1;});
    // Only one stop per group for Tab: the chosen one, or the group's first.
    $$('[role="radiogroup"]').forEach(g=>{if(!g.querySelector('[tabindex="0"]')){const f=g.querySelector('[data-control]');if(f)f.tabIndex=0;}});
    const k=b.dataset.control,e=document.getElementById('control-'+k.toLowerCase());
    const name=b.getAttribute('aria-label');
    info.innerHTML=e?`<span class="eyebrow">${name.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</span>`+e.querySelector('dd').innerHTML.replace(/^<p><b>(.*?)<\/b><\/p>/,'<h3>$1</h3>'):'';
    info.scrollTop=0;
    if(focus)b.focus();
  }
  radios.forEach(b=>b.addEventListener('click',()=>choose(b,false)));
  $$('[role="radiogroup"]').forEach(g=>g.addEventListener('keydown',e=>{
    const list=[...g.querySelectorAll('[data-control]')],i=list.indexOf(e.target);
    if(i<0)return;
    const cols=g.classList.contains('pads')?3:4;
    const step={ArrowRight:1,ArrowDown:cols,ArrowLeft:-1,ArrowUp:-cols}[e.key];
    let j=-1;
    if(step)j=(i+step+list.length)%list.length;
    else if(e.key==='Home')j=0;else if(e.key==='End')j=list.length-1;
    if(j<0)return;
    e.preventDefault();choose(list[j],true);
  }));
  const fromHash=()=>{const m=/^control-([a-z]+)$/.exec(hashId());return m&&$(`[data-control="${m[1].toUpperCase()}"]`);};
  choose(fromHash()||$('[data-control="MAIN"]')||radios[0],false);
  addEventListener('hashchange',()=>{const b=fromHash();if(b)choose(b,false);});
}
})();
