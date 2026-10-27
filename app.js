const root=document.documentElement;
const toggle=document.querySelector('.theme-toggle');
let savedTheme;try{savedTheme=localStorage.getItem('bdt-theme')}catch{}
function setTheme(theme){root.dataset.theme=theme;toggle.setAttribute('aria-pressed',String(theme==='dark'));toggle.setAttribute('aria-label',theme==='dark'?'დღის რეჟიმის ჩართვა':'ღამის რეჟიმის ჩართვა');document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#0d121a':'#ffffff'}
setTheme(savedTheme==='dark'?'dark':'light');
toggle.addEventListener('click',()=>{const theme=root.dataset.theme==='dark'?'light':'dark';setTheme(theme);try{localStorage.setItem('bdt-theme',theme)}catch{}});
document.querySelectorAll('[data-service]').forEach(card=>card.addEventListener('click',()=>{document.getElementById('contact-intro').textContent=card.dataset.service+' — დეტალების შესათანხმებლად დაგვირეკეთ ან მოგვწერეთ Facebook-ზე.'}));
document.getElementById('year').textContent=new Date().getFullYear();

// Reveal the contact number once, when it enters the viewport.
const contactPhone=document.querySelector('.contact .phone');
if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  contactPhone.classList.add('phone-reveal');
  const phoneObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');phoneObserver.unobserve(entry.target)}});
  },{threshold:0.25});
  phoneObserver.observe(contactPhone);
}

// Keep scroll geometry stable while switching between equally timed theme videos.
(()=>{
 const section=document.querySelector('.hero-scroll'),video=document.getElementById('hero-video'),poster=document.querySelector('.film-poster');
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),cache=new Map();
 let target=0,raf=0,loaded=false,request=0;
 const dark=()=>root.dataset.theme==='dark';
 function setPoster(){poster.src=dark()?(motion.matches?'assets/car-dark-end.jpg':'assets/car-dark-zero.jpg'):(motion.matches?'assets/car-end-hd.jpg':'assets/car-zero-hd.jpg');video.poster=poster.src}
 function seek(){
  if(!loaded||video.seeking||motion.matches)return;
  if(Math.abs(video.currentTime-target)>1/48)video.currentTime=target;
  else video.classList.add('ready');
 }
 function update(){
  raf=0;const distance=section.offsetHeight-section.querySelector('.hero-pin').offsetHeight;
  const progress=distance>0?Math.max(0,Math.min(1,-section.getBoundingClientRect().top/distance)):0;
  target=progress*Math.min(4,video.duration||4);seek();
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(update)}
 function configure(){
  section.classList.toggle('is-scrubbing',!motion.matches);setPoster();video.pause();
  if(motion.matches)video.classList.remove('ready');else schedule();
 }
 async function selectVideo(){
  const id=++request,url=dark()?'assets/car-dark-scrub.mp4':'assets/car-1080-scrub.mp4';
  loaded=false;video.pause();video.classList.remove('ready');setPoster();
  if(motion.matches)return;
  try{
   if(!cache.has(url))cache.set(url,fetch(url).then(r=>{if(!r.ok)throw Error('Video unavailable');return r.blob()}).then(b=>URL.createObjectURL(b)));
   const source=await cache.get(url);if(id!==request)return;video.src=source;video.load();
  }catch{cache.delete(url);if(id===request)section.classList.remove('is-scrubbing')}
 }
 video.addEventListener('loadeddata',()=>{loaded=true;schedule()});
 video.addEventListener('seeked',()=>{if(!motion.matches){video.classList.toggle('ready',Math.abs(video.currentTime-target)<0.05);seek()}});
 video.addEventListener('error',()=>{loaded=false;video.classList.remove('ready')});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 motion.addEventListener('change',()=>{configure();selectVideo()});
 new MutationObserver(()=>{configure();selectVideo()}).observe(root,{attributes:true,attributeFilter:['data-theme']});
 configure();selectVideo();
})();
