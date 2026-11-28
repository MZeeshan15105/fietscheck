// FietsCheck 360: a 3D model of the app's city e-bike, built from simple shapes.
// mount(el,{onPart}) puts a canvas in el, auto-turns slowly, drag to turn, tap the dots.
import * as THREE from './three/three.module.js';
import {RoomEnvironment} from './three/RoomEnvironment.js';

const K=0.35/197;                       // metres per pixel of the reference picture
const X=px=>(px-550)*K, Y=py=>(660-py)*K;
const V=(px,py,z=0)=>new THREE.Vector3(X(px),Y(py),z);

export function build(){
  const bike=new THREE.Group();
  const M={
    paint:new THREE.MeshPhysicalMaterial({color:0x1d6468,metalness:.55,roughness:.32,clearcoat:1,clearcoatRoughness:.08}),
    chrome:new THREE.MeshStandardMaterial({color:0xd9dde2,metalness:1,roughness:.16}),
    alu:new THREE.MeshStandardMaterial({color:0xaeb3b9,metalness:1,roughness:.32}),
    dark:new THREE.MeshStandardMaterial({color:0x202326,metalness:.5,roughness:.45}),
    black:new THREE.MeshStandardMaterial({color:0x121314,metalness:.2,roughness:.6}),
    rubber:new THREE.MeshStandardMaterial({color:0x151617,roughness:.92}),
    cream:new THREE.MeshStandardMaterial({color:0xe8dcc0,roughness:.75}),
    leather:new THREE.MeshPhysicalMaterial({color:0x7b3f22,roughness:.5,clearcoat:.4,clearcoatRoughness:.4}),
    brass:new THREE.MeshStandardMaterial({color:0xc9a243,metalness:1,roughness:.25}),
    rotor:new THREE.MeshStandardMaterial({color:0xb9bec4,metalness:1,roughness:.38}),
    lens:new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff1d6,emissiveIntensity:1.6,roughness:.1}),
    red:new THREE.MeshStandardMaterial({color:0x8a0d0d,emissive:0x6a0505,emissiveIntensity:1.2,roughness:.3}),
    screen:new THREE.MeshStandardMaterial({color:0x0c1a22,emissive:0x2a8fb3,emissiveIntensity:.55,roughness:.2}),
  };
  const add=(m,parent=bike)=>{m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
  const tube=(pts,r,mat,parent,seg=64,closed=false)=>add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,closed,'catmullrom',.5),seg,r,20,closed),mat),parent);
  const cyl=(a,b,r,mat,parent,r2)=>{const d=b.clone().sub(a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r2??r,r,d.length(),24),mat);
    m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return add(m,parent)};
  const sph=(p,r,mat,parent)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),mat);m.position.copy(p);return add(m,parent)};
  const RA=V(245,465),FA=V(858,465),BB=V(512,500);
  // ---- wheels
  function wheel(c,front){const g=new THREE.Group();g.position.copy(c);bike.add(g);
    const R=197*K;
    const tyre=new THREE.Mesh(new THREE.TorusGeometry(R-.022,.022,24,160),M.rubber);add(tyre,g);
    [-1,1].forEach(s=>{const w=new THREE.Mesh(new THREE.TorusGeometry(R-.04,.0075,10,160),M.cream);w.position.z=s*.017;add(w,g)});
    const rim=new THREE.Mesh(new THREE.TorusGeometry(R-.052,.011,12,160),M.paint);rim.scale.z=1.4;add(rim,g);
    const hubL=front?.05:.065;add(new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,hubL*2,20).rotateX(Math.PI/2),M.alu),g);
    for(let i=0;i<36;i++){const a=i/36*Math.PI*2,side=i%2?1:-1,b=a+side*.52;
      const h=new THREE.Vector3(Math.cos(a)*.024,Math.sin(a)*.024,side*hubL*.8),r=new THREE.Vector3(Math.cos(b)*(R-.06),Math.sin(b)*(R-.06),0);
      cyl(h,r,.0011,M.chrome,g)}
    if(front){const rot=new THREE.Mesh(new THREE.RingGeometry(.03,.08,48),M.rotor);rot.position.z=-.045;add(rot,g);rot.material.side=THREE.DoubleSide;
      const cal=new THREE.Mesh(new THREE.BoxGeometry(.05,.035,.03),M.black);cal.position.set(-.06,.06,-.05);add(cal,g)}
    else{const rot=new THREE.Mesh(new THREE.RingGeometry(.03,.075,48),M.rotor);rot.position.z=-.05;rot.material.side=THREE.DoubleSide;add(rot,g);
      for(let i=0;i<8;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(.03+i*.006,.03+i*.006,.003,32).rotateX(Math.PI/2),M.alu);c.position.z=.045-i*.005;add(c,g)}}
    return g}
  const rw=wheel(RA,false),fw=wheel(FA,true);
  // ---- frame (step-through)
  const z0=0;
  const HTt=V(728,118),HTb=V(768,282);
  tube([V(768,282),V(735,300),V(640,330),V(560,395),V(525,440),BB.clone()],.034,M.paint);   // curved down tube
  tube([V(500,470),V(470,410),V(445,330),V(428,272)],.023,M.paint);                         // seat tube
  cyl(HTt,HTb,.03,M.paint);                                                                   // head tube
  // battery slot on the down tube
  tube([V(718,296),V(640,326),V(565,390)],.022,M.black,undefined,32).position.z=.016;
  [-1,1].forEach(s=>{const z=s*.055;
    tube([new THREE.Vector3(BB.x,BB.y,s*.03),V(400,485,z),new THREE.Vector3(RA.x,RA.y,z)],.012,M.paint);        // chainstays
    tube([V(438,310,s*.02),V(340,390,z),new THREE.Vector3(RA.x,RA.y,z)],.011,M.paint);                         // seatstays
  });
  sph(BB,.04,M.paint);sph(V(428,272),.024,M.paint);
  // chain guard
  const cg=new THREE.Shape();cg.moveTo(0,.035);cg.lineTo(-.4,.025);cg.quadraticCurveTo(-.44,0,-.4,-.02);cg.lineTo(0,-.07);cg.absarc(0,0,.072,-Math.PI/2,Math.PI/2,false);
  const cgm=new THREE.Mesh(new THREE.ExtrudeGeometry(cg,{depth:.008,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:3}),M.paint);cgm.position.set(BB.x,BB.y,.085);add(cgm);
  // fork
  const crown=V(772,292);
  [-1,1].forEach(s=>tube([new THREE.Vector3(crown.x,crown.y,s*.045),V(790,340,s*.048),V(830,430,s*.05),new THREE.Vector3(FA.x,FA.y,s*.05)],.013,M.paint));
  cyl(new THREE.Vector3(crown.x,crown.y,-.05),new THREE.Vector3(crown.x,crown.y,.05),.02,M.paint);
  // mudguards
  function guard(c,a0,a1,r){const pts=[];for(let i=0;i<=24;i++){const a=a0+(a1-a0)*i/24;pts.push(new THREE.Vector3(c.x+Math.cos(a)*r,c.y+Math.sin(a)*r,0))}
    const m=tube(pts,.026,M.paint,undefined,96);m.scale.z=1.5;return m}
  guard(RA,Math.PI*.95,Math.PI*.12,212*K);guard(FA,Math.PI*.98,Math.PI*.3,212*K);
  // seatpost + saddle
  cyl(V(428,272),V(405,190),.0135,M.chrome);
  const sd=new THREE.Shape();sd.moveTo(-.14,0);sd.bezierCurveTo(-.15,.085,-.02,.09,.04,.035);sd.lineTo(.13,.02);sd.quadraticCurveTo(.145,0,.13,-.02);sd.lineTo(.04,-.035);sd.bezierCurveTo(-.02,-.09,-.15,-.085,-.14,0);
  const saddle=add(new THREE.Mesh(new THREE.ExtrudeGeometry(sd,{depth:.018,bevelEnabled:true,bevelThickness:.022,bevelSize:.016,bevelSegments:10,curveSegments:32}),M.leather));
  saddle.rotation.x=-Math.PI/2;saddle.position.set(X(405),Y(150)-.03,0);saddle.position.x=X(405);
  [-1,1].forEach(s=>{for(let i=0;i<6;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.014,.003,6,16),M.chrome);t.rotation.x=Math.PI/2;t.position.set(X(345),Y(168)-i*.009,s*.045);add(t)}});
  cyl(V(345,150,.045),V(345,195,.045),.003,M.chrome);cyl(V(345,150,-.045),V(345,195,-.045),.003,M.chrome);
  // stem, bars, grips, bell, display
  const stemTop=V(712,70);cyl(HTt,stemTop,.016,M.alu);
  const bar=[];for(let i=0;i<=20;i++){const u=i/20*2-1,z=u*.3;const back=Math.pow(Math.abs(u),1.6)*.14;bar.push(new THREE.Vector3(stemTop.x-back,stemTop.y+.01+Math.abs(u)*.02,z))}
  tube(bar,.011,M.alu,undefined,80);
  [-1,1].forEach(s=>{const a=bar[s<0?0:20],b=bar[s<0?3:17];const d=b.clone().sub(a).normalize();
    cyl(a.clone().addScaledVector(d,-.02),a.clone().addScaledVector(d,.1),.017,M.leather);
    const lev=cyl(a.clone().addScaledVector(d,.12).add(new THREE.Vector3(.02,0,0)),a.clone().addScaledVector(d,.12).add(new THREE.Vector3(.11,-.03,0)),.005,M.alu)});
  const bell=sph(new THREE.Vector3(stemTop.x-.02,stemTop.y+.05,.13),.022,M.brass);bell.scale.y=.6;
  const disp=add(new THREE.Mesh(new THREE.BoxGeometry(.05,.016,.07),M.black));disp.position.set(stemTop.x-.035,stemTop.y+.035,-.1);disp.rotation.z=.5;
  const scr=add(new THREE.Mesh(new THREE.PlaneGeometry(.04,.055),M.screen));scr.rotation.set(-Math.PI/2,0,0);scr.rotateX(0);scr.position.set(stemTop.x-.035,stemTop.y+.045,-.1);scr.rotation.set(-Math.PI/2+.5*0,0,0);scr.rotation.y=0;scr.rotation.order='YXZ';scr.rotation.set(-1.07,Math.PI/2,0);
  // cables
  tube([stemTop.clone().add(new THREE.Vector3(0,.02,.12)),V(790,90,.12),V(820,200,.06),V(800,280,.05)],.004,M.black,undefined,40);
  tube([stemTop.clone().add(new THREE.Vector3(0,.02,-.12)),V(800,100,-.12),V(812,230,-.06),V(760,300,-.03)],.004,M.black,undefined,40);
  // front light
  const lamp=add(new THREE.Mesh(new THREE.CylinderGeometry(.045,.035,.07,32),M.chrome));lamp.rotation.z=Math.PI/2;lamp.position.copy(V(832,212));
  const lens=add(new THREE.Mesh(new THREE.CircleGeometry(.04,32),M.lens));lens.rotation.y=Math.PI/2;lens.position.copy(V(832,212)).add(new THREE.Vector3(.036,0,0));
  cyl(V(812,236),V(800,262),.006,M.alu);
  // rack + rear light
  const rk=[V(330,252),V(150,246)];[-1,1].forEach(s=>{const z=s*.075;tube([V(330,252,z),V(240,248,z),V(150,246,z)],.0085,M.chrome,undefined,24);
    tube([V(150,246,z),V(195,330,z),V(245,465,z*.85)],.007,M.chrome,undefined,24);cyl(V(330,252,z),V(420,300,z*.4),.006,M.chrome)});
  for(let i=0;i<4;i++){const x=170+i*45;cyl(V(x,247,-.075),V(x,247,.075),.0055,M.chrome)}
  const rl=add(new THREE.Mesh(new THREE.BoxGeometry(.02,.03,.06),M.red));rl.position.copy(V(135,260));
  // crank + pedals + chainring + chain
  const crank=new THREE.Group();crank.position.copy(BB);bike.add(crank);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.085,.006,8,64),M.chrome);ring.position.z=.075;add(ring,crank);
  [-1,1].forEach(s=>{const arm=cyl(new THREE.Vector3(0,0,s*.09),new THREE.Vector3(s*.15,-s*.06,s*.095),.011,M.alu,crank);
    const pd=add(new THREE.Mesh(new THREE.BoxGeometry(.1,.022,.08),M.black),crank);pd.position.set(s*.15,-s*.06,s*.15)});
  cyl(new THREE.Vector3(0,0,-.1),new THREE.Vector3(0,0,.1),.018,M.alu,crank);
  {const pts=[];const c1=new THREE.Vector2(BB.x,BB.y),c2=new THREE.Vector2(RA.x,RA.y),r1=.085,r2=.04;
    const ang=Math.atan2(c2.y-c1.y,c2.x-c1.x),L=c1.distanceTo(c2),beta=Math.asin((r1-r2)/L),a1=ang+Math.PI/2+beta,a2=ang-Math.PI/2-beta;
    const P=(c,r,a)=>new THREE.Vector3(c.x+r*Math.cos(a),c.y+r*Math.sin(a),.075);
    for(let i=0;i<=20;i++)pts.push(P(c1,r1,a2+2*Math.PI+(a1-a2-2*Math.PI)*i/20));for(let i=0;i<=12;i++)pts.push(P(c2,r2,a1+(a2-a1)*i/12));
    tube(pts,.0045,M.dark,undefined,160,true)}
  // derailleur
  const der=add(new THREE.Mesh(new THREE.BoxGeometry(.03,.07,.02),M.black));der.position.copy(V(255,520,.07));der.rotation.z=.3;
  // kickstand
  cyl(V(440,505,-.06),V(415,640,-.1),.009,M.alu);
  // anchors for the tappable dots (part ids match the app)
  const anchors={wheel:V(60,465,0),mudguard:V(395,300,0),frame:V(600,370,.03),steering:V(680,50,0),lights:V(840,212,.04),
    saddle:V(400,148,0),pedals:V(660,470,.15),chain:V(380,490,.08),gears:V(240,470,.08),brakes:V(858,465,-.06),stand:V(425,600,-.08),motor:V(650,330,.03)};
  bike.position.y=0;
  return {bike,anchors,wheels:[rw,fw],crank};
}

export function mount(el,opts={}){
  const R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:!!opts.capture});
  R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.1;
  R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
  el.appendChild(R.domElement);R.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y;cursor:grab';
  const scene=new THREE.Scene();const pm=new THREE.PMREMGenerator(R);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.6;
  const cam=new THREE.PerspectiveCamera(26,1,.05,30);
  const key=new THREE.DirectionalLight(0xfff3e8,2.4);key.position.set(2,4,3);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-1.5,right:1.5,top:1.5,bottom:-1.5,near:.5,far:10});key.shadow.radius=5;scene.add(key);
  const rim=new THREE.DirectionalLight(0xff8a4c,2.2);rim.position.set(-3,2,-2.5);scene.add(rim);
  const fill=new THREE.DirectionalLight(0x9fc0ff,.5);fill.position.set(-2,1,3);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.ShadowMaterial({opacity:.5}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.material.depthWrite=false;scene.add(floor);
  const {bike,anchors,wheels,crank}=build();scene.add(bike);
  // dots
  const layer=document.createElement('div');layer.style.cssText='position:absolute;inset:0;pointer-events:none';el.appendChild(layer);
  const dots={};Object.keys(anchors).forEach(p=>{const b=document.createElement('button');b.type='button';b.className='b3dot';b.dataset.part=p;b.setAttribute('aria-label',(opts.labels&&opts.labels[p])||p);
    b.onclick=e=>{e.stopPropagation();opts.onPart&&opts.onPart(p)};layer.appendChild(b);dots[p]=b});
  let yaw=-0.35,vel=0,drag=false,lx=0,auto=true,last=performance.now(),idle=0;
  const cv=R.domElement;
  cv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;auto=false;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
  cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx;lx=e.clientX;yaw+=dx*.01;vel=dx*.01});
  const up=()=>{drag=false;idle=0;cv.style.cursor='grab'};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  function size(){const w=el.clientWidth,h=el.clientHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
    const fitW=1.95/(2*Math.tan(THREE.MathUtils.degToRad(cam.fov/2))*cam.aspect),fitH=1.25/(2*Math.tan(THREE.MathUtils.degToRad(cam.fov/2)));cam.userData.d=Math.max(fitW,fitH)*1.18}
  size();if(window.ResizeObserver)new ResizeObserver(size).observe(el);
  const tmp=new THREE.Vector3(),camDir=new THREE.Vector3();
  function frame(t,dt){
    if(!drag){if(auto||idle>2.5){yaw+=dt*.35;auto=true}else{yaw+=vel;vel*=.92;idle+=dt}}
    const d=cam.userData.d||4;cam.position.set(Math.sin(yaw)*d,.62+.18,Math.cos(yaw)*d);cam.lookAt(0,.56,0);
    wheels.forEach(w=>w.rotation.z=-t*.6);crank.rotation.z=-t*.6*0.55;
    R.render(scene,cam);
    cam.getWorldDirection(camDir);
    const w=el.clientWidth,h=el.clientHeight;
    for(const p in anchors){tmp.copy(anchors[p]);const side=tmp.clone().sub(cam.position).normalize().dot(camDir);
      // facing: dots on the far side of the bike fade
      const toCam=cam.position.clone().sub(tmp);const facing=toCam.z*Math.cos(yaw)+toCam.x*Math.sin(yaw);
      const z=tmp.z*Math.cos(yaw)+tmp.x*Math.sin(yaw);
      tmp.project(cam);const x=(tmp.x*.5+.5)*w,y=(-tmp.y*.5+.5)*h;const back=z<-.02;
      const b=dots[p];b.style.transform=`translate(${x}px,${y}px) scale(${back?.7:1})`;b.style.opacity=back?.35:1;b.style.pointerEvents=back?'none':'auto'}
  }
  let raf;function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;frame(now/1000,dt);raf=requestAnimationFrame(loop)}
  if(!opts.capture)raf=requestAnimationFrame(loop);
  return {setYaw:v=>{yaw=v;auto=false},render:(t)=>frame(t,0),stop:()=>cancelAnimationFrame(raf)};
}
