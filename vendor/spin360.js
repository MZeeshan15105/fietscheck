// FietsCheck 360: turntable of the app's e-bike (60 frames, 6 degrees apart).
// Frame 0 shows the right side, frames turn the front towards the viewer.
const N=60, FW=688, FH=456, CROPX=120, CROPY=320, CROPW=860;   // source frames were 1080px, cropped
const CX=538, EYE=350, D=1765;                                    // turntable axis, eye height, camera distance (source px)
// part anchors measured on the side view (source px), z = towards the viewer at frame 0
const A={wheel:[217,775,0],mudguard:[790,540,0],frame:[540,630,25],steering:[640,360,0],lights:[740,505,0],saddle:[440,455,0],
  pedals:[570,695,55],chain:[500,710,40],gears:[325,715,30],brakes:[760,670,-20],motor:[600,550,15]};
function project(p,th){const X=p[0]-CX,Y=p[1]-EYE,Z=p[2];const c=Math.cos(th),s=Math.sin(th);
  const depth=X*s+Z*c,k=D/(D-depth);return {x:CX+(X*c-Z*s)*k,y:EYE+Y*k,depth}}
export function mount(el,opts={}){
  const cv=document.createElement('canvas');cv.width=FW;cv.height=FH;cv.style.cssText='position:absolute;left:0;top:50%;width:100%;height:auto;transform:translateY(-50%);touch-action:pan-y;cursor:grab';el.appendChild(cv);
  const ctx=cv.getContext('2d');const imgs=[];let loaded=0;
  for(let i=0;i<N;i++){const im=new Image();im.decoding='async';im.onload=()=>{loaded++;if(i===0)draw()};im.src='img/spin/'+String(i).padStart(2,'0')+'.webp';imgs.push(im)}
  const layer=document.createElement('div');layer.style.cssText='position:absolute;inset:0;pointer-events:none';el.appendChild(layer);
  const dots={};for(const p in A){const b=document.createElement('button');b.type='button';b.className='b3dot';b.dataset.part=p;b.setAttribute('aria-label',(opts.labels&&opts.labels[p])||p);
    b.onclick=e=>{e.stopPropagation();opts.onPart&&opts.onPart(p)};layer.appendChild(b);dots[p]=b}
  let pos=-N,vel=0,drag=false,lx=0,last=performance.now(),raf,intro=true,show=0;
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  cv.addEventListener('pointerdown',e=>{drag=true;intro=false;lx=e.clientX;vel=0;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
  cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx;lx=e.clientX;const step=-dx/el.clientWidth*N*1.1;pos+=step;vel=step});
  const up=()=>{drag=false;cv.style.cursor='grab'};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  function draw(){const f=((Math.round(pos)%N)+N)%N;const im=imgs[f];if(im&&im.complete&&im.naturalWidth){ctx.clearRect(0,0,FW,FH);ctx.drawImage(im,0,0,FW,FH)}
    const th=f*2*Math.PI/N,w=el.clientWidth,h=el.clientHeight,k=w/CROPW;
    for(const p in A){const q=project(A[p],th),b=dots[p];const oy=(h-w*FH/FW)/2,x=(q.x-CROPX)*k,y=(q.y-CROPY)*k+oy;
      const back=q.depth<-60;b.style.transform=`translate(${x}px,${y}px) scale(${back?.7:1})`;b.style.opacity=(back?0:1)*show;b.style.pointerEvents=(back||show<.5)?'none':'auto'}}
  function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
    let moving=drag;
    if(intro&&!drag){if(reduce||pos>=0){pos=0;intro=false}else{pos=Math.min(0,pos+dt*N/2.6*Math.max(.12,Math.min(1,-pos/N*1.6)));moving=true}}
    else if(!drag){if(Math.abs(vel)>.02){pos+=vel;vel*=.88;moving=true}else{const r=Math.round(pos);if(Math.abs(r-pos)>.01){pos+=(r-pos)*.3;moving=true}}}
    show=Math.max(0,Math.min(1,show+(moving?-dt*6:dt*3)));
    draw();raf=requestAnimationFrame(loop)}
  raf=requestAnimationFrame(loop);
  return {setFrame:f=>{pos=f;vel=0;intro=false;show=1;draw()},stop:()=>cancelAnimationFrame(raf)};
}
