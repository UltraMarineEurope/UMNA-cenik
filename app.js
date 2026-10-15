(() => {
  'use strict';
  const pages=window.UMNA_DOCUMENT, $=s=>document.querySelector(s), book=$('#book');
  let current=0,zoom=1,touch=null;
  const names=['Kotvy a příslušenství','Nerezové řetězy','Technologie řetězů','Pozinkované řetězy','Kotevní systémy','Výběr kotvy'];
  function initial(){const match=location.hash.match(/^#page=(\d+)$/);return match?Math.max(0,Math.min(pages.length-1,Number(match[1])-1)):0}
  function show(index,animate=true){
    current=Math.max(0,Math.min(pages.length-1,index));
    book.replaceChildren();
    const img=document.createElement('img');img.src=`page-${current+1}.jpg`;img.alt=`Strana ${current+1}: ${names[current]}`;img.draggable=false;img.width=1241;img.height=1754;book.append(img);
    pages[current].links.forEach(link=>{const a=document.createElement('a');a.className='hotspot';a.href=link.url;a.title=link.label;a.setAttribute('aria-label',link.label);if(link.url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer'}Object.assign(a.style,{left:link.x+'%',top:link.y+'%',width:link.width+'%',height:link.height+'%'});book.append(a)});
    if(animate){book.classList.remove('flip');void book.offsetWidth;book.classList.add('flip')}
    $('#pageSelect').value=current;document.querySelectorAll('.previous').forEach(b=>b.disabled=current===0);document.querySelectorAll('.next').forEach(b=>b.disabled=current===pages.length-1);$('#first').disabled=current===0;$('#last').disabled=current===pages.length-1;
    document.querySelectorAll('#thumbnails button').forEach((b,i)=>{if(i===current)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    history.replaceState(null,'',`#page=${current+1}`);$('#viewport').scrollTo(0,0);
  }
  pages.forEach((p,i)=>{const option=document.createElement('option');option.value=i;option.textContent=i+1;$('#pageSelect').append(option);const b=document.createElement('button');const img=document.createElement('img');img.src=`page-${i+1}.jpg`;img.alt='';img.loading='lazy';b.append(img,document.createTextNode(`${i+1} · ${names[i]}`));b.addEventListener('click',()=>show(i));$('#thumbnails').append(b)});
  document.querySelectorAll('.previous').forEach(b=>b.onclick=()=>show(current-1));document.querySelectorAll('.next').forEach(b=>b.onclick=()=>show(current+1));$('#first').onclick=()=>show(0);$('#last').onclick=()=>show(pages.length-1);$('#pageSelect').onchange=e=>show(Number(e.target.value));
  $('#thumbToggle').onclick=()=>{const hidden=!$('#thumbnails').hidden;$('#thumbnails').hidden=hidden;$('#thumbToggle').setAttribute('aria-expanded',String(!hidden))};
  function setZoom(value){zoom=Math.max(.75,Math.min(3,value));book.style.width=zoom===1?'':`${Math.min(innerWidth*.76,innerHeight*.53)*zoom}px`;$('#zoomValue').textContent=Math.round(zoom*100)+' %';$('#zoomOut').disabled=zoom<=.75;$('#zoomIn').disabled=zoom>=3}
  $('#zoomIn').onclick=()=>setZoom(zoom+.25);$('#zoomOut').onclick=()=>setZoom(zoom-.25);window.addEventListener('resize',()=>setZoom(zoom));
  $('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{$('#fullscreen').textContent='Celá obrazovka není dostupná'}};
  document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();show(current+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}if(e.key==='Home')show(0);if(e.key==='End')show(pages.length-1)});
  book.addEventListener('touchstart',e=>{touch={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}},{passive:true});book.addEventListener('touchend',e=>{if(!touch||zoom>1)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)show(current+(dx<0?1:-1));touch=null},{passive:true});
  const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();$('#search').oninput=e=>{const term=normalize(e.target.value.trim()),results=$('#results');results.replaceChildren();results.hidden=!term;if(!term)return;const matches=pages.map((p,i)=>normalize(p.text).includes(term)?i:-1).filter(i=>i>=0);results.append(document.createTextNode(matches.length?'Nalezeno na stranách: ':'Žádné výsledky.'));matches.forEach(i=>{const b=document.createElement('button');b.textContent=`${i+1} · ${names[i]}`;b.onclick=()=>show(i);results.append(b)})};
  window.addEventListener('hashchange',()=>show(initial()));show(initial(),false);
})();
