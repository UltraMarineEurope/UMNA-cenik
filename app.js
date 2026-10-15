(() => {
  'use strict';
  const pages=window.UMNA_DOCUMENT, $=s=>document.querySelector(s), book=$('#book');
  let current=0,zoom=1,touch=null;
  const names=['Anchors & accessories','Stainless steel chains','Chain technology','Galvanized chains','Anchoring systems','Anchor selection'];
  function initial(){const match=location.hash.match(/^#page=(\d+)$/);return match?Math.max(0,Math.min(pages.length-1,Number(match[1])-1)):0}
  function show(index,animate=true){
    current=Math.max(0,Math.min(pages.length-1,index));
    book.replaceChildren();
    const img=document.createElement('img');img.src=`page-${current+1}.jpg`;img.alt=`Page ${current+1}: ${names[current]}`;img.draggable=false;img.width=1241;img.height=1754;book.append(img);
    pages[current].links.forEach(link=>{const a=document.createElement('a');a.className='hotspot';a.href=link.url;a.title=link.label;a.setAttribute('aria-label',link.label);if(link.url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer'}Object.assign(a.style,{left:link.x+'%',top:link.y+'%',width:link.width+'%',height:link.height+'%'});book.append(a)});
    paintMatches();
    $('#pageSelect').value=current;document.querySelectorAll('.previous').forEach(b=>b.disabled=current===0);document.querySelectorAll('.next').forEach(b=>b.disabled=current===pages.length-1);$('#first').disabled=current===0;$('#last').disabled=current===pages.length-1;
    document.querySelectorAll('#thumbnails button').forEach((b,i)=>{if(i===current)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    history.replaceState(null,'',`#page=${current+1}`);$('#viewport').scrollTo(0,0);
  }
  pages.forEach((p,i)=>{const option=document.createElement('option');option.value=i;option.textContent=i+1;$('#pageSelect').append(option);const b=document.createElement('button');const img=document.createElement('img');img.src=`page-${i+1}.jpg`;img.alt='';img.loading='lazy';b.append(img,document.createTextNode(`${i+1} · ${names[i]}`));b.addEventListener('click',()=>show(i));$('#thumbnails').append(b)});
  document.querySelectorAll('.previous').forEach(b=>b.onclick=()=>show(current-1));document.querySelectorAll('.next').forEach(b=>b.onclick=()=>show(current+1));$('#first').onclick=()=>show(0);$('#last').onclick=()=>show(pages.length-1);$('#pageSelect').onchange=e=>show(Number(e.target.value));
  $('#thumbToggle').onclick=()=>{const hidden=!$('#thumbnails').hidden;$('#thumbnails').hidden=hidden;$('#thumbToggle').setAttribute('aria-expanded',String(!hidden))};
  let fitPage = true;
  const viewport=$('#viewport');
  function contentSize(){const style=getComputedStyle(viewport);return {width:viewport.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),height:viewport.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)}}
  function baseWidth(){const size=contentSize();return Math.max(40,fitPage?Math.min(size.width,size.height*595.276/841.89):Math.min(size.width,1400))}
  function setZoom(value){zoom=Math.max(.5,Math.min(5,value));book.style.width=`${baseWidth()*zoom}px`;$('#zoomValue').textContent=Math.round(zoom*100)+' %';$('#zoomOut').disabled=zoom<=.5;$('#zoomIn').disabled=zoom>=5;$('#fit').setAttribute('aria-pressed',String(fitPage&&zoom===1));$('#fitWidth').setAttribute('aria-pressed',String(!fitPage&&zoom===1));viewport.classList.toggle('zoomed',book.getBoundingClientRect().width>contentSize().width+1);}
  function anchorAt(x,y){const rect=book.getBoundingClientRect();return{x:(x-rect.left)/rect.width,y:(y-rect.top)/rect.height}}
  function restoreAnchor(anchor,x,y){const rect=book.getBoundingClientRect();viewport.scrollLeft+=rect.left+rect.width*anchor.x-x;viewport.scrollTop+=rect.top+rect.height*anchor.y-y}
  function zoomAround(value){const r=viewport.getBoundingClientRect(),x=r.left+viewport.clientWidth/2,y=r.top+viewport.clientHeight/2,a=anchorAt(x,y);setZoom(value);restoreAnchor(a,x,y)}
  $('#zoomIn').onclick=()=>zoomAround(zoom+.25);$('#zoomOut').onclick=()=>zoomAround(zoom-.25);
  function fit(mode){fitPage=mode;setZoom(1);viewport.scrollTo(0,0)}
  $('#fit').onclick=()=>fit(true);$('#fitWidth').onclick=()=>fit(false);
  let resizeFrame;new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>setZoom(zoom))}).observe(viewport);
  function syncFullscreen(){const active=!!document.fullscreenElement||document.body.classList.contains('focus-mode');$('#fullscreen').innerHTML=active?'⛶ <span>Exit full screen</span>':'⛶ <span>Full screen</span>';$('#fullscreen').setAttribute('aria-label',active?'Exit full screen':'Enter full screen');requestAnimationFrame(()=>setZoom(zoom))}
  $('#fullscreen').onclick=async()=>{if(document.fullscreenElement){await document.exitFullscreen()}else if(document.body.classList.contains('focus-mode')){document.body.classList.remove('focus-mode')}else{try{if(!document.documentElement.requestFullscreen)throw new Error('unsupported');await document.documentElement.requestFullscreen()}catch{document.body.classList.add('focus-mode')}}syncFullscreen()};
  document.addEventListener('fullscreenchange',syncFullscreen);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('focus-mode')){document.body.classList.remove('focus-mode');syncFullscreen()}});
  document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();show(current+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}if(e.key==='Home')show(0);if(e.key==='End')show(pages.length-1)});
  let pinch=null,usedPinch=false;
  const distance=touches=>Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY);
  const midpoint=touches=>({x:(touches[0].clientX+touches[1].clientX)/2,y:(touches[0].clientY+touches[1].clientY)/2});
  viewport.addEventListener('touchstart',e=>{
    if(e.touches.length===2){const mid=midpoint(e.touches);pinch={distance:distance(e.touches),zoom,anchor:anchorAt(mid.x,mid.y)};usedPinch=true;touch=null}
    else if(e.touches.length===1){usedPinch=false;touch={x:e.touches[0].clientX,y:e.touches[0].clientY}}
  },{passive:true});
  viewport.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinch){e.preventDefault();const mid=midpoint(e.touches);setZoom(pinch.zoom*distance(e.touches)/Math.max(1,pinch.distance));restoreAnchor(pinch.anchor,mid.x,mid.y)}},{passive:false});
  viewport.addEventListener('touchend',e=>{if(e.touches.length<2)pinch=null;if(e.touches.length)return;
    const fits=book.getBoundingClientRect().width<=contentSize().width+2&&book.getBoundingClientRect().height<=contentSize().height+2;
    if(touch&&!usedPinch&&fits){const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.7)show(current+(dx<0?1:-1))}touch=null;
  },{passive:true});
  viewport.addEventListener('touchcancel',()=>{pinch=null;touch=null;usedPinch=false},{passive:true});
  viewport.addEventListener('dblclick',e=>{if(e.target.closest('a'))return;e.preventDefault();if(zoom>1)fit(true);else{const a=anchorAt(e.clientX,e.clientY);setZoom(2);restoreAnchor(a,e.clientX,e.clientY)}});
  const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let matches=[],activeMatch=-1,searchTimer;
  function paintMatches(){
    book.querySelectorAll('.match').forEach(el=>el.remove());
    matches.forEach((m,i)=>{if(m.page!==current)return;const box=document.createElement('span');box.className='match'+(i===activeMatch?' active':'');box.dataset.match=i;box.setAttribute('aria-hidden','true');Object.assign(box.style,{left:m.x+'%',top:m.y+'%',width:m.w+'%',height:m.h+'%'});book.append(box)});
  }
  function revealMatch(){const el=book.querySelector('.match.active');if(!el)return;const viewport=$('#viewport'),v=viewport.getBoundingClientRect(),r=el.getBoundingClientRect();viewport.scrollTo({top:viewport.scrollTop+r.top-v.top-viewport.clientHeight/2+r.height/2,left:Math.max(0,viewport.scrollLeft+r.left-v.left-viewport.clientWidth/2+r.width/2),behavior:'instant'})}
  function goMatch(index){if(!matches.length)return;activeMatch=(index+matches.length)%matches.length;show(matches[activeMatch].page,false);renderResults();setZoom(zoom);requestAnimationFrame(revealMatch)}
  function renderResults(){const results=$('#results');results.replaceChildren();results.hidden=!$('#search').value.trim();if(results.hidden)return;
    const label=document.createElement('span');label.textContent=matches.length?`${activeMatch+1} of ${matches.length} matches · Page ${matches[activeMatch].page+1}`:'No matches. Try a product code such as UA05.';results.append(label);
    if(matches.length){for(const [text,delta] of [['Previous match',-1],['Next match',1]]){const b=document.createElement('button');b.textContent=text;b.onclick=()=>goMatch(activeMatch+delta);results.append(b)}}
    const clear=document.createElement('button');clear.textContent='Clear';clear.onclick=()=>{$('#search').value='';runSearch();$('#search').focus()};results.append(clear);
  }
  function runSearch(){const term=normalize($('#search').value.trim()).replace(/\s+/g,' ');matches=[];activeMatch=-1;
    if(term){window.UMNA_WORDS.forEach((words,page)=>{for(let i=0;i<words.length;i++){if(!normalize(words[i].t).includes(term.split(' ')[0]))continue;let text='';for(let j=i;j<Math.min(words.length,i+20);j++){if(j>i&&Math.abs(words[j].y-words[j-1].y)>2)break;text+=(j>i?' ':'')+normalize(words[j].t);if(text.includes(term)){const group=words.slice(i,j+1);const x=Math.min(...group.map(w=>w.x)),y=Math.min(...group.map(w=>w.y));matches.push({page,x,y,w:Math.max(...group.map(w=>w.x+w.w))-x,h:Math.max(...group.map(w=>w.y+w.h))-y});break}if(text.length>term.length+words[i].t.length)break}}});}
    if(matches.length){fitPage=false;zoom=innerWidth<=700?2:1;goMatch(0)}else{paintMatches();renderResults();setZoom(zoom)}
  }
  $('#search').oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(runSearch,220)};
  $('#search').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(searchTimer);if(matches.length)goMatch(activeMatch+(e.shiftKey?-1:1));else runSearch()}if(e.key==='Escape'){$('#search').value='';runSearch()}};
  window.addEventListener('hashchange',()=>show(initial()));show(initial(),false);setZoom(1);
})();
