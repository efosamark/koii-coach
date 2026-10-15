'use strict';
/* Site-wide search. shell.js loads this file the first time someone opens the Search overlay, so nothing here runs on
   page load. shell.js builds the overlay's frame (<dialog id="site-search-dialog"> with #site-search, the type chips
   [data-type] and #site-results) so the phone keyboard can open inside the tap; mount() below takes it over.

   The index is built in the browser, once per page load, from the pages themselves: each one is fetch()ed (they are
   precached, so this works offline) and read with DOMParser.
     chapter pages       every .steps ol > li[data-step] and every part (<details> with its summary). A step's title is
                         its h3.step-title; a step without one would show its id instead ("record-first-sample" as
                         "Record first sample").
     help.html           every details[data-topic], with its group heading
     learn.html          every details[data-lesson]
     glossary.html       every .term (dt and dd)
     controls.html       every control explained under "Every control" ([data-key])
     safety.html         every .risk card
     cheat-sheet.html    every move (section[id] .moves > li), under the chapter it comes from
   A source that fails to load is skipped, and tried again the next time the overlay opens.

   Where a result goes:
     chapter              the chapter's page (found by its name, its number, and its number and name before the
                          renumber: "07", "start here")
     chapter step         a read-only preview of the step, here in the overlay, with "Go to this step"
                          (<page>.html#s-<step id>, where the player opens it) as the second action: searching never
                          moves the learner. A middle click or Ctrl-click still opens the step itself.
     chapter part         <page>.html#s-<its first step id>
     help topic           opens in place (a <details>, so the answer reads without leaving the search), with a
                          link to ./help.html#<topic id>
     Learn lesson         ./learn.html#<lesson id>
     glossary word        ./glossary.html#term-<word>  (the definition is shown in the result as well)
     control              ./controls.html#control-<name>
     safety entry         ./safety.html#<id>
     cheat-sheet move     ./cheat-sheet.html#<chapter section id>

   Matching (docs/overhaul-plan.md 4.7): whole words, with a prefix match on the last one while it is being typed
   ("hat" finds "hats" and "hi-hat", never "that"); case and accents folded; plurals and -ing/-ed folded; a few synonyms;
   filler words like "the" and "my" ignored. Ranking: the query as the title, then title words, then key names (ERASE
   written as a button in the text), then the body. Results are grouped (Steps, Troubleshooting, Learn, Glossary, Cheat sheet), the group with the
   best match first (Words second at most), so Enter opens the best link. Arrow keys move real focus through the field and the results. */
(()=>{
const site=window.COACH_SITE;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s==null?'':s).replace(/\s+/g,' ').trim();
const slug=t=>String(t).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const HELP='<a href="./help.html">Troubleshooting</a>';

// ---------- Words ----------
const fold=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
const WORD=/\d+(?:\.\d+)+|[\p{L}\p{N}]+/gu;   // a position like 1.2.3 or a version like 2.5.1 is one word
const words=s=>fold(s).match(WORD)||[];
const STOP=new Set('a an and are as at be by do does for from how i if in is it its my of on or so the to was we what when where why with you your'.split(' '));
// Not a real stemmer, just enough that "hats", "chopping", "samples" and "sampling" meet their root. Query and text
// both go through it, so a wrong guess is wrong the same way on both sides.
function stem(w){
  if(!/^[a-z]+$/.test(w))return w;
  if(w.length>3){
    if(w.length>4&&w.endsWith('ies'))w=w.slice(0,-3)+'y';
    else if(/(?:ch|sh|ss|x|z)es$/.test(w))w=w.slice(0,-2);
    else if(w.endsWith('s')&&!/(?:ss|us|is)$/.test(w))w=w.slice(0,-1);
  }
  const m=w.length>4&&/(?:ing|ed)$/.exec(w),b=m?w.slice(0,-m[0].length):'';
  if(/[aeiouy]/.test(b))w=/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(b)?b+'e':b;   // timing -> time, saved -> save (but running -> run)
  if(w.length>2&&/([^aeiouylsz])\1$/.test(w))w=w.slice(0,-1);                // chopping -> chop
  return w.length>4&&w.endsWith('e')?w.slice(0,-1):w;                        // sample and sampling meet at "sampl"; note stays apart from "not"
}
// Any phrase in a group finds the others. Longest phrase first, so "hi hat" is read as one thing.
const SYNONYMS=[['hi hat','hihat','hat'],['sidechain','side chain','pump'],['hip hop','hiphop'],['vocal','voice'],['bpm','tempo']]
  .map(g=>g.map(p=>{const raws=words(p);return{raws,stems:raws.map(stem)};}).sort((a,b)=>b.raws.length-a.raws.length));
const at=(hay,needle)=>{for(let i=0;i+needle.length<=hay.length;i++)if(needle.every((x,j)=>hay[i+j]===x))return i;return -1;};

// A query is a list of alternatives (the words as typed, then each synonym swap); a result needs all the words of one.
function parse(q){
  let raws=words(q).slice(0,8);   // a pasted paragraph is not a query
  const kept=raws.filter(w=>!STOP.has(w));
  if(kept.length)raws=kept;
  if(!raws.length)return null;
  const alts=[{raws,stems:raws.map(stem),weight:1}];
  for(const group of SYNONYMS)for(const a of [...alts]){
    const p=group.find(x=>at(a.stems,x.stems)>=0);
    if(!p)continue;
    const i=at(a.stems,p.stems);
    for(const o of group)if(o!==p){
      const r=[...a.raws.slice(0,i),...o.raws,...a.raws.slice(i+p.raws.length)],s=r.map(stem);
      if(!alts.some(x=>x.stems.join(' ')===s.join(' ')))alts.push({raws:r,stems:s,weight:.8});
    }
  }
  return alts;
}

// ---------- Documents ----------
// Hardware names written in capitals in the text ("hold ERASE", "tap A1") are the "key names" a query can hit.
const KEYS=/\b(?:MAIN|SOUND|TEMPO|TIMING|SAMPLE|KEYS|FX|FADER|SHIFT|ERASE|RECORD|PLAY|ENTER|[A-D][1-9])\b/g;
function doc(o){
  const t=words(o.title),b=words(o.body||''),keys=new Set((o.keys||[]).map(k=>k.toLowerCase()));
  for(const k of (o.title+' '+(o.body||'')).match(KEYS)||[])keys.add(k.toLowerCase());
  return Object.assign(o,{tRaw:t,tStem:t.map(stem),bRaw:b,bStem:b.map(stem),keys});
}
// A step's id as a title. Ids end in -v2 or -v3 when a step was rewritten (but "record-v2-to-v5" is vocals 2 to 5), name
// pads and groups as c2 or d, and abbreviate a few words.
const SAY={sc:'sidechain',rec:'record',arp:'arpeggio',fx:'FX',usb:'USB',bpm:'BPM',os:'OS'};
const label=id=>{
  const t=id.replace(/(-to)?-v\d+$/,(m,to)=>to?m:'').split('-').map(w=>SAY[w]||(/^(?:[a-d]|[a-z]\d)$/.test(w)?w.toUpperCase():w)).join(' ').replace(/\b(\d+) (\d+)\b/,'$1–$2');
  return t[0].toUpperCase()+t.slice(1);
};

async function fetchDoc(href){
  const res=await fetch(href,{signal:AbortSignal.timeout?AbortSignal.timeout(10000):undefined});
  if(!res.ok)return null;
  const dom=new DOMParser().parseFromString(await res.text(),'text/html');
  dom.querySelectorAll('br,p,li,div,td,th,h2,h3,dt,dd,summary').forEach(n=>n.after(' '));   // so neighbouring words do not run together
  return dom;
}
const text=n=>clean(n?n.textContent:'');
async function loadChapter(c){
  try{
    const dom=await fetchDoc(c.href);if(!dom)return null;
    const book='Chapter '+c.num+' · '+c.title,out=[];
    dom.querySelectorAll('.steps > details').forEach(d=>{
      const head=text(d.querySelector('summary')),m=/^(?:Part\s+)?(\d+)\s*[\/·]\s*(.*)$/.exec(head),no=m?m[1]:'',name=m?m[2]:head;
      const lis=[...d.querySelectorAll('ol>li')],ids=lis.map(li=>li.dataset.step).filter(Boolean);
      const notes=[...d.children].filter(e=>e.tagName!=='SUMMARY'&&e.tagName!=='OL'&&!/^\s*Official guide/.test(e.textContent));
      const intro=notes.map(e=>e.textContent).join(' ');
      const html=notes.map(e=>{const x=e.cloneNode(true);x.removeAttribute('id');x.querySelectorAll('[id]').forEach(y=>y.removeAttribute('id'));return x.outerHTML;}).join('')+`<p class="meta">${lis.length} step${lis.length===1?'':'s'}.</p>`;
      out.push(doc({type:'step',part:true,title:name,body:clean(intro),html,crumb:[book,no?'Part '+no:'Part'],href:c.href+(ids[0]?'#s-'+ids[0]:'')}));
      lis.forEach(li=>{
        const id=li.dataset.step;if(!id)return;
        const t=li.querySelector('.step-title');
        if(t)t.remove();
        const shown=li.cloneNode(true);shown.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));   // the preview
        li.querySelectorAll('.step-source').forEach(x=>x.remove());
        out.push(doc({type:'step',title:t?text(t):label(id),body:text(li),html:shown.innerHTML,risk:li.dataset.risk||'',crumb:[book,[no,name].filter(Boolean).join(' '),'Step '+(lis.indexOf(li)+1)],href:c.href+'#s-'+id}));
      });
    });
    return out;
  }catch(e){return null;}
}
// The tool pages: [file, how to read one of its entries]
const TOOLS=[
  ['./help.html',dom=>[...dom.querySelectorAll('details[data-topic]')].map(d=>{
    const g=d.closest('section'),h=g&&g.querySelector('h2');
    const s=d.querySelector('summary'),title=text(s),inside=d.querySelector('.inside'),html=inside?inside.innerHTML:'';
    s.remove();d.querySelectorAll('.step-source').forEach(x=>x.remove());
    return doc({type:'help',title,body:text(d),html,topic:true,crumb:['Troubleshooting',text(h)].filter(Boolean),href:'./help.html#'+d.id});
  })],
  ['./learn.html',dom=>{const all=[...dom.querySelectorAll('details[data-lesson]')];return all.map((d,i)=>{
    const t=d.querySelector('summary h2'),n=t&&t.querySelector('.lesson-n');if(n)n.remove();
    const title=text(t);d.querySelector('summary').remove();d.querySelectorAll('.step-source,h3,button').forEach(x=>x.remove());
    return doc({type:'learn',title,body:text(d),crumb:['Learn',`Lesson ${i+1} of ${all.length}`],href:'./learn.html#'+d.id});
  });}],
  ['./glossary.html',dom=>[...dom.querySelectorAll('.term[id]')].map(t=>doc({type:'word',title:text(t.querySelector('dt')),body:text(t.querySelector('dd')),crumb:['Glossary'],href:'./glossary.html#'+t.id}))],
  ['./controls.html',dom=>[...dom.querySelectorAll('#every-control [data-key]')].map(e=>{
    const k=e.dataset.key,b=e.querySelector('dd b');e.querySelectorAll('.step-source').forEach(x=>x.remove());
    const title=text(b);if(b)b.remove();
    return doc({type:'help',title,body:text(e.querySelector('dd')),cap:{MINUS:'−',PLUS:'+',PAD:'0–9'}[k]||k,keys:[k],crumb:['Control map',text(e.querySelector('dt'))],href:'./controls.html#'+e.id});
  })],
  ['./cheat-sheet.html',dom=>[...dom.querySelectorAll('section[id] .moves > li')].map(li=>{
    const s=li.closest('section'),t=text(li),k=t.indexOf(':');
    return doc({type:'cheat',title:k>0&&k<40?t.slice(0,k):t.split(' ').slice(0,6).join(' ')+' …',body:t,crumb:['Cheat sheet',text(s.querySelector('h2')).replace(/:[^:]*$/,'')],href:'./cheat-sheet.html#'+s.id});
  })],
  ['./safety.html',dom=>[...dom.querySelectorAll('.risk[id]')].map(e=>{
    const h=e.querySelector('h3'),title=text(h);h.remove();e.querySelectorAll('.step-source').forEach(x=>x.remove());
    return doc({type:'help',title,body:text(e),crumb:['Safety and erasing'],href:'./safety.html#'+e.id});
  })]
];
async function loadTool([href,read]){
  try{const dom=await fetchDoc(href);return dom?read(dom):null;}catch(e){return null;}
}

// ---------- The index ----------
const parts=new Map();   // a chapter's slug or a tool page -> its documents, once that source has loaded
let all=[],missing=0,ready=false,building=null,view=null;
// Each chapter itself, so "07" or "start here" (its number and name before the renumber) still finds it.
const CHAPTERS=site.chapters.map(c=>doc({type:'step',title:'Chapter '+c.num+' · '+c.title,body:[c.formerly?'Formerly '+c.formerly+', chapter '+c.formerly:'',c.oldTitle||''].join(' '),crumb:['Course'],href:c.href}));
function assemble(){
  all=CHAPTERS.slice();
  site.chapters.forEach(c=>all.push(...(parts.get(c.slug)||[])));
  TOOLS.forEach(t=>all.push(...(parts.get(t[0])||[])));
  missing=site.chapters.length+TOOLS.length-parts.size;
}
function fill(){
  if(building)return building;
  const jobs=[];
  site.chapters.forEach(c=>{if(!parts.has(c.slug))jobs.push(loadChapter(c).then(d=>{if(d)parts.set(c.slug,d);}));});
  TOOLS.forEach(t=>{if(!parts.has(t[0]))jobs.push(loadTool(t).then(d=>{if(d)parts.set(t[0],d);}));});
  building=Promise.all(jobs).then(()=>{building=null;ready=true;assemble();});
  return building;
}

// ---------- Matching ----------
const W={title:30,key:20,body:8,titlePhrase:40,bodyPhrase:10,exactTitle:60};
function hasWord(stems,raws,qs,qr,typing){
  if(!typing)return stems.includes(qs);
  return stems.some((s,i)=>s.startsWith(qs)||raws[i].startsWith(qr));
}
function phrase(hay,needle){   // the words in a row; the last may still be a prefix
  const n=needle.length;
  for(let i=0;i+n<=hay.length;i++){
    let j=0;
    while(j<n-1&&hay[i+j]===needle[j])j++;
    if(j===n-1&&hay[i+j].startsWith(needle[j]))return true;
  }
  return false;
}
function score(d,a){
  const n=a.stems.length;
  let s=0;
  for(let i=0;i<n;i++){
    const typing=i===n-1;
    if(hasWord(d.tStem,d.tRaw,a.stems[i],a.raws[i],typing))s+=W.title;
    else if(d.keys.has(a.raws[i]))s+=W.key;
    else if(hasWord(d.bStem,d.bRaw,a.stems[i],a.raws[i],typing))s+=W.body;
    else return 0;
  }
  if(d.tStem.length===n&&phrase(d.tStem,a.stems))s+=W.exactTitle;
  else if(n>1&&phrase(d.tStem,a.stems))s+=W.titlePhrase;
  if(n>1&&phrase(d.bStem,a.stems))s+=W.bodyPhrase;
  return s;
}
// Does this word of the displayed text count as a match? Used to mark it.
function matcher(a){
  const last=a.stems.length-1;
  return w=>{const f=fold(w),s=stem(f);return a.stems.some((q,i)=>i===last?s.startsWith(q)||f.startsWith(a.raws[i]):s===q);};
}

// ---------- Results ----------
function marked(text,m){
  let out='',from=0,open=false;   // matched words one hyphen or space apart share a mark: "hi-hat", "time stretch"
  for(const w of text.matchAll(WORD)){
    const gap=text.slice(from,w.index),hit=m(w[0]);
    if(open&&hit&&/^[-\s]$/.test(gap))out+=esc(gap+w[0]);
    else{
      if(open)out+='</mark>';
      out+=esc(gap)+(hit?'<mark>':'')+esc(w[0]);
      open=hit;
    }
    from=w.index+w[0].length;
  }
  return out+(open?'</mark>':'')+esc(text.slice(from));
}
// One line of the body around the first matched word. The stylesheet clips it to the width of the row, so the match
// starts early in the line.
function snippet(body,m){
  const hit=[...body.matchAll(WORD)].find(w=>m(w[0]));
  const from=hit&&hit.index>30?body.lastIndexOf(' ',hit.index-24)+1:0;
  let to=Math.min(body.length,from+150);
  if(to<body.length&&body.lastIndexOf(' ',to)>from)to=body.lastIndexOf(' ',to);
  return(from?'… ':'')+marked(body.slice(from,to),m)+(to<body.length?' …':'');
}
const GROUPS=[['step','Steps','steps'],['help','Troubleshooting','troubleshooting topics'],['learn','Learn','lessons'],['word','Glossary','words'],['cheat','Cheat sheet','moves']];   // headings as in plan 4.7
const TRY=['silent pad','undo','chop','sidechain','song list'];
const CAP={step:5,help:4,learn:4,word:3,cheat:3},PAGE=30;   // rows per group under All (a glossary entry is several lines long), and per page of one group
const NEEDS=`<p class="search-note"><b>Search needs the offline copy.</b> Open the course once while online so every page is saved, then try again. ${HELP} has its own search.</p>`;

function mount(dlg,enter){   // enter: Enter was pressed before this file had loaded
  if(mount.done)return;
  mount.done=true;
  const input=dlg.querySelector('#site-search'),list=dlg.querySelector('#site-results'),status=dlg.querySelector('#site-search-status'),
    body=dlg.querySelector('.search-body'),chips=[...dlg.querySelectorAll('[data-type]')];
  let type='all',shown=PAGE,found={step:[],help:[],learn:[],word:[],cheat:[]},timer=0,openFirst=Boolean(enter);

  function run(){
    clearTimeout(timer);
    const alts=parse(input.value);
    found={step:[],help:[],learn:[],word:[],cheat:[]};
    if(alts&&ready){
      for(const d of all){
        let best=0,alt=null;
        for(const a of alts){const s=score(d,a)*a.weight;if(s>best){best=s;alt=a;}}
        if(best)found[d.type].push({d,s:best,alt});
      }
      GROUPS.forEach(([k])=>found[k].sort((x,y)=>y.s-x.s));
    }
    shown=PAGE;body.scrollTop=0;
    render();
  }
  function item(r){
    const {d,alt}=r,m=matcher(alt);
    const title=(d.cap?`<kbd class="key">${esc(d.cap)}</kbd> `:'')+marked(d.title,m);
    if(d.type==='word')return`<li><a class="search-hit search-word" href="${esc(d.href)}"><span class="search-hit-title">${title}</span><span class="search-hit-snip">${marked(d.body,m)}</span></a></li>`;
    // A troubleshooting topic opens where it is; a step opens a preview (data-stay keeps the overlay open).
    if(d.topic)return`<li><details class="search-topic" data-href="${esc(d.href)}"><summary class="search-hit"><span class="search-hit-title">${title}</span><span class="search-hit-crumb">${esc(d.crumb.join(' · '))}</span></summary>`+
      `<div class="inside">${d.html}<p class="meta"><a href="${esc(d.href)}">Open in Troubleshooting</a></p></div></details></li>`;
    if(d.type==='step'&&d.html)return`<li><a class="search-hit" href="${esc(d.href)}" data-stay data-preview="${all.indexOf(d)}">`+
      `<span class="search-hit-title">${title}</span><span class="search-hit-crumb">${esc(d.crumb.join(' · '))}</span>${d.body?`<span class="search-hit-snip">${snippet(d.body,m)}</span>`:''}</a></li>`;
    return`<li><a class="search-hit" href="${esc(d.href)}"><span class="search-hit-title">${title}</span><span class="search-hit-crumb">${esc(d.crumb.join(' · '))}</span>${d.body?`<span class="search-hit-snip">${snippet(d.body,m)}</span>`:''}</a></li>`;
  }
  function render(){
    // The group holding the best match comes first (ties keep the order Steps, Troubleshooting, Learn, Glossary, Cheat sheet).
    const best=k=>found[k].length?found[k][0].s:0;
    const q=clean(input.value),alts=parse(q),kinds=GROUPS.filter(([k])=>type==='all'||k===type).sort((a,b)=>best(b[0])-best(a[0]));
    // A glossary word has no link and runs to several lines, so on a phone it would push every step below the fold:
    // it never leads while another group has results, and comes straight after the best one instead.
    if(kinds.length>1&&kinds[0][0]==='word'&&found[kinds[1][0]].length)kinds.splice(1,0,kinds.shift());
    const total=kinds.reduce((n,[k])=>n+found[k].length,0);
    let html='',say='';
    if(!alts){
      html=`<div class="search-empty"><p class="meta">Search every step, help topic, lesson and word.</p><p class="eyebrow">Try</p><div class="search-try">${TRY.map(t=>`<button class="search-chip" type="button" data-try="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`;
    }else if(!ready){
      html='<p class="search-note">Preparing search…</p>';say='Preparing search';
    }else if(!all.length){
      html=NEEDS;say='Search needs the offline copy';
    }else{
      if(!total){
        const some=type==='all'?'':' in '+kinds[0][2];
        html=`<p class="search-note">Nothing found for “${esc(q)}”${some}. Try a shorter or different word${type==='all'?'':' or choose All'}, or look through ${HELP}.</p>`;
      }
      for(const [k,name,noun] of kinds){
        const hits=found[k];
        if(!hits.length)continue;
        const cap=type==='all'?CAP[k]:shown;
        html+=`<div class="search-group" role="group" aria-labelledby="site-group-${k}"><h2 class="search-group-title" id="site-group-${k}">${name} <span class="search-count">${hits.length}</span></h2><ul class="search-list">${hits.slice(0,cap).map(item).join('')}</ul>`+
          (hits.length>cap?`<button class="btn ghost" type="button" ${type==='all'?`data-all="${k}"`:'data-more'}>${type==='all'?`Show all ${hits.length} ${noun}`:'Show more'}</button>`:'')+'</div>';
      }
      if(missing)html+='<p class="search-note">Some pages could not be searched. Open the course once while online to save them.</p>';
      say=total?`${total} result${total===1?'':'s'}`:'No results';
    }
    previewing=null;
    list.innerHTML=html;
    status.textContent=say;
  }
  // A step's preview: its text as in the chapter, read-only, with the way there as the second action.
  let previewing=null;
  function preview(d,from){
    previewing={d,top:body.scrollTop,from:from&&from.getAttribute('data-preview')};
    const tag={erase:'<span class="tag caution">Clears notes</span>',delete:'<span class="tag danger">Deletes · no undo</span>',overwrite:'<span class="tag danger">Overwrites · no undo</span>','erase-scene':'<span class="tag danger">Erases the scene · no undo</span>'}[d.risk]||'';
    list.innerHTML=`<div class="search-preview"><button class="btn ghost" type="button" data-back><svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-back"></use></svg>Back to results</button>`+
      `<p class="search-hit-crumb">${esc(d.crumb.join(' · '))}</p><h2 class="preview-title" id="site-preview-title" tabindex="-1">${esc(d.title)}</h2>${tag?`<p>${tag}</p>`:''}`+
      `<div class="preview-body">${d.html}</div><p class="row"><a class="btn" href="${esc(d.href)}">${d.part?'Go to this part':'Go to this step'}<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-next"></use></svg></a></p>`+
      `<p class="meta">A preview: nothing is ticked, and your place in the chapter stays where it is.</p></div>`;
    status.textContent='Preview: '+d.title;
    body.scrollTop=0;
    list.querySelector('.preview-title').focus();
  }
  function unpreview(){
    if(!previewing)return;
    const p=previewing;previewing=null;
    render();
    body.scrollTop=p.top;
    const a=list.querySelector(`[data-preview="${p.from}"]`);if(a)a.focus();else input.focus();
  }
  function setType(t){
    type=t;shown=PAGE;
    chips.forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.type===t)));
    body.scrollTop=0;
    render();
  }

  input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,60);});
  chips.forEach(c=>c.addEventListener('click',()=>setType(c.dataset.type)));
  list.addEventListener('click',e=>{
    const p=e.target.closest('a[data-preview]');
    if(p&&!(e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)){e.preventDefault();const d=all[+p.dataset.preview];if(d)preview(d,p);return;}
    if(e.target.closest('[data-back]')){unpreview();return;}
    const b=e.target.closest('button');
    if(!b)return;
    if(b.dataset.try){input.value=b.dataset.try;run();input.focus();}
    else if(b.dataset.all){setType(b.dataset.all);const a=list.querySelector('a.search-hit');if(a)a.focus();}
    else if('more' in b.dataset){shown+=PAGE;render();}
  });
  // Arrow keys walk the field and the results (real focus, so the links keep their usual meaning for screen readers).
  dlg.addEventListener('keydown',e=>{
    if(e.isComposing)return;
    const t=e.target;
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      const order=[input,...list.querySelectorAll('.search-hit,button')],i=order.indexOf(t);
      const j=e.key==='ArrowDown'?(i<0?1:i+1):(i<0?0:i-1);
      if(order[j]&&j!==i){e.preventDefault();order[j].focus();}
    }else if(e.key==='Enter'&&t===input){
      e.preventDefault();
      if(!ready){openFirst=true;return;}   // still building the index: open the best match as soon as there is one
      run();
      openBest();
    }else if(e.key==='Escape'&&previewing){
      e.preventDefault();unpreview();
    }else if(e.key==='Escape'&&t===input){
      e.preventDefault();dlg.querySelector('[data-close]').click();
    }else if((e.key||'').length===1&&e.key!==' '&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&t!==input){
      input.focus();   // typing while on a result or a chip goes back to the field
    }
  });

  // Enter in the field: the best match opens (a step as its preview, a topic in place).
  function openBest(){
    const a=list.querySelector('.search-hit');
    if(!a)return;
    if(a.tagName==='SUMMARY'){a.parentElement.open=true;a.focus();}
    else a.click();
  }
  function settle(){
    run();
    if(!openFirst)return;
    openFirst=false;
    openBest();
  }
  view={run:settle,render};
  render();
  fill().then(settle);
}
// The overlay was opened again: try whatever failed to load last time.
function reopen(){
  if(!view)return;
  if(missing||!ready)fill().then(view.run);else view.render();
}
window.CoachSearch={mount,reopen};
})();
