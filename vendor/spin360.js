// FietsCheck 360: turntable of the app's e-bike (120 frames, 3 degrees apart).
// Frame 0 shows the right side, frames turn the front towards the viewer.
const N=120, FW=688, FH=456, CROPX=120, CROPY=320, CROPW=860;   // source frames were 1080px, cropped
const CX=538, EYE=350, D=1765;                                    // turntable axis, eye height, camera distance (source px)
// part anchors measured on the side view (source px), z = towards the viewer at frame 0
const A={wheel:[217,775,0],mudguard:[790,540,0],frame:[540,630,25],steering:[640,360,0],lights:[740,505,0],saddle:[440,455,0],
  pedals:[570,695,55],chain:[500,710,40],gears:[325,715,30],brakes:[760,670,-20],motor:[600,550,15]};
function project(p,th){const X=p[0]-CX,Y=p[1]-EYE,Z=p[2];const c=Math.cos(th),s=Math.sin(th);
  const depth=X*s+Z*c,k=D/(D-depth);return {x:CX+(X*c-Z*s)*k,y:EYE+Y*k,depth}}
export function mount(el,opts={}){
  const cv=document.createElement('canvas');cv.width=FW;cv.height=FH;cv.style.cssText='position:absolute;left:0;top:50%;width:100%;height:auto;transform:translateY(-50%);touch-action:pan-y;cursor:grab';el.appendChild(cv);
  const ctx=cv.getContext('2d');const imgs=[];let loaded=0;
  for(let i=0;i<N;i++)imgs.push(null);
  const ok=i=>{const im=imgs[i];return im&&im.complete&&im.naturalWidth};
  const order=[];for(let i=0;i<N;i+=2)order.push(i);for(let i=1;i<N;i+=2)order.push(i);
  order.forEach((i,n)=>{const im=new Image();im.decoding='async';im.onload=()=>{loaded++;if(i===0)draw()};im.fetchPriority=n<N/2?'high':'low';im.src='img/spin/'+String(i).padStart(3,'0')+'.webp';imgs[i]=im});
  const near=f=>{if(ok(f))return f;for(let d=1;d<N/2;d++){if(ok((f+d)%N))return (f+d)%N;if(ok((f-d+N)%N))return (f-d+N)%N}return -1};
  const layer=document.createElement('div');layer.style.cssText='position:absolute;inset:0;pointer-events:none';el.appendChild(layer);
  const dots={};for(const p in A){const b=document.createElement('button');b.type='button';b.className='b3dot';b.dataset.part=p;b.setAttribute('aria-label',(opts.labels&&opts.labels[p])||p);
    b.onclick=e=>{e.stopPropagation();opts.onPart&&opts.onPart(p)};layer.appendChild(b);dots[p]=b}
  let t0=0,pos=-N,tgt=0,vel=0,drag=false,lx=0,last=performance.now(),raf,intro=true,show=0;
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  cv.addEventListener('pointerdown',e=>{drag=true;intro=false;tgt=pos;lx=e.clientX;vel=0;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
  cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx;lx=e.clientX;const step=-dx/el.clientWidth*N*1.0;tgt+=step;vel=vel*.5+step*.5});
  const up=()=>{drag=false;cv.style.cursor='grab'};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  function draw(){const fl=Math.floor(pos),fr=pos-fl,f0=((fl%N)+N)%N,f1=(f0+1)%N;const f=fr<.5?f0:f1;
    const a0=near(f0),a1=near(f1);
    if(a0>=0){ctx.clearRect(0,0,FW,FH);ctx.globalAlpha=1;ctx.drawImage(imgs[a0],0,0,FW,FH);
      if(a1>=0&&a1!==a0&&fr>.02&&fr<.98){ctx.globalAlpha=fr;ctx.drawImage(imgs[a1],0,0,FW,FH);ctx.globalAlpha=1}}
    const th=pos*2*Math.PI/N,w=el.clientWidth,h=el.clientHeight,k=w/CROPW;
    for(const p in A){const q=project(A[p],th),b=dots[p];const oy=(h-w*FH/FW)/2,x=(q.x-CROPX)*k,y=(q.y-CROPY)*k+oy;
      const back=q.depth<-60;b.style.transform=`translate(${x}px,${y}px) scale(${back?.7:1})`;b.style.opacity=(back?0:1)*show;b.style.pointerEvents=(back||show<.5)?'none':'auto'}}
  function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
    let moving=drag;
    if(intro&&!drag){if(!t0)t0=now;const k=reduce?1:Math.min(1,(now-t0)/1800);pos=-N*(1-(1-Math.pow(1-k,3)));if(k>=1){pos=0;tgt=0;intro=false}else moving=true}
    else if(drag){pos+=(tgt-pos)*Math.min(1,dt*18);moving=true}
    else{if(Math.abs(vel)>.01){tgt+=vel;vel*=Math.pow(.9,dt*60)}else{vel=0;tgt=Math.round(tgt)}
      const d=tgt-pos;if(Math.abs(d)>.005){pos+=d*Math.min(1,dt*12);moving=Math.abs(d)>.05||Math.abs(vel)>.01}else pos=tgt}
    show=Math.max(0,Math.min(1,show+(moving?-dt*6:dt*4)));
    draw();raf=requestAnimationFrame(loop)}
  raf=requestAnimationFrame(loop);
  return {setFrame:f=>{pos=f;tgt=f;vel=0;intro=false;show=1;draw()},stop:()=>cancelAnimationFrame(raf)};
}
