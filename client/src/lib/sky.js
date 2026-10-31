/*
  The animated sky behind the page: a full-screen WebGL shader (Three.js) with clouds, a real-looking sun and moon,
  mountains, mist and hills, plus point layers for stars, birds and fireflies. Scroll position drives the time of day,
  from 09:00 at the top of the page to past midnight at the night chapter. Falls back to a simple 2D canvas without WebGL.
*/
/* eslint-disable */
import { AdditiveBlending, BufferAttribute, BufferGeometry, Mesh, OrthographicCamera, PlaneGeometry, Points, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from 'three';
import { clamp, pad, reduceMotion } from './motion';

export function createSky(canvas) {
var gc=null,glMouse={x:0,y:0,tx:0,ty:0};
var onPointer=function(e){glMouse.tx=e.clientX/Math.max(innerWidth,1)-.5;glMouse.ty=.5-e.clientY/Math.max(innerHeight,1);};
var STOPS=[
 {p:0,   t:'#efe6cd',b:'#f8f3e6'},
 {p:.30, t:'#e4ecd9',b:'#f6f1e1'},
 {p:.50, t:'#d4e1cb',b:'#f1e6c6'},
 {p:.62, t:'#4a6f56',b:'#dcbd80'},
 {p:.74, t:'#143d29',b:'#7a6436'},
 {p:1,   t:'#06190f',b:'#0f3324'}
];
function hex(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function mix(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function css(c,a){return 'rgba('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+','+(a==null?1:a)+')';}
function lum(c){var f=c.map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*f[0]+.7152*f[1]+.0722*f[2];}
function smooth(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
STOPS.forEach(function(s){s.T=hex(s.t);s.B=hex(s.b);});
function skyAt(p){for(var i=0;i<STOPS.length-1;i++){var a=STOPS[i],b=STOPS[i+1];if(p<=b.p){var t=(p-a.p)/(b.p-a.p);return {top:mix(a.T,b.T,t),bot:mix(a.B,b.B,t)};}}
  var l=STOPS[STOPS.length-1];return {top:l.T,bot:l.B};}
var cv=canvas,ctx=cv.getContext('2d'),W=0,H=0;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
var rnd=rng(48),stars=[],flies=[],i;
for(i=0;i<140;i++)stars.push({x:rnd(),y:rnd()*.7,s:rnd()*1.3+.4,ph:rnd()*6.28});
for(i=0;i<20;i++)flies.push({x:rnd(),y:.72+rnd()*.25,vx:(rnd()-.5)*.012,vy:(rnd()-.5)*.008,ph:rnd()*6.28});
var lastRW=0,lastRH=0;
function resize(force){if(!force&&innerWidth===lastRW&&Math.abs(innerHeight-lastRH)<200)return;lastRW=innerWidth;lastRH=innerHeight;var d=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=Math.round(W*d);cv.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);if(GLOK)glResize();}
var DAYH=[hex('#9db38a'),hex('#7e9a72'),hex('#5f7f58')],NIGHTH=[hex('#0d2c1d'),hex('#0a2216'),hex('#06170f')];
function hillY(x,base,amp,cyc,ph){var u=x/W*Math.PI*2*cyc+ph;return base+amp*Math.sin(u)+amp*.5*Math.sin(u*2.3+ph*1.7);}
function hill(base,amp,cyc,ph,col){ctx.beginPath();ctx.moveTo(0,H);for(var x=0;x<=W+8;x+=8)ctx.lineTo(x,hillY(x,base,amp,cyc,ph));ctx.lineTo(W,H);ctx.closePath();ctx.fillStyle=css(col);ctx.fill();}
function draw(p,t,dt,sky,n){
  var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,css(sky.top));g.addColorStop(1,css(sky.bot));ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  var horizon=H*.82,k;
  if(n>.02){for(k=0;k<stars.length;k++){var s=stars[k],tw=reduceMotion?1:.88+.12*Math.sin(t*.8+s.ph);ctx.fillStyle='rgba(246,242,231,'+(n*tw*.85).toFixed(3)+')';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.s,0,6.283);ctx.fill();}}
  var sp=p/.72;
  if(sp<1.02){
    var sx=W*(.12+.76*clamp(sp,0,1)),sy=horizon-Math.sin(Math.PI*clamp(sp,0,1))*H*.5+H*.02,hi=clamp((horizon-sy)/(H*.5),0,1),
        sc=mix(hex('#d9a653'),hex('#fff4d0'),hi),sa=(1-smooth(.9,1.02,sp))*.6,r=Math.min(W,H)*.05+8;
    var gl=ctx.createRadialGradient(sx,sy,r*.3,sx,sy,r*5);gl.addColorStop(0,css(sc,.5*sa));gl.addColorStop(1,css(sc,0));
    ctx.fillStyle=gl;ctx.fillRect(sx-r*5,sy-r*5,r*10,r*10);ctx.fillStyle=css(sc,sa);ctx.beginPath();ctx.arc(sx,sy,r,0,6.283);ctx.fill();
  }
  var m=clamp((p-.62)/.38,0,1);
  if(m>0){var mx=W*(.2+.5*m),my=H*(.5-.3*Math.sin(m*Math.PI*.5)),ma=smooth(0,.3,m)*.55,mr=Math.min(W,H)*.042+7;
    var mg=ctx.createRadialGradient(mx,my,mr*.5,mx,my,mr*6);mg.addColorStop(0,'rgba(236,226,196,'+(.32*ma).toFixed(3)+')');mg.addColorStop(1,'rgba(236,226,196,0)');
    ctx.fillStyle=mg;ctx.fillRect(mx-mr*6,my-mr*6,mr*12,mr*12);ctx.fillStyle='rgba(246,240,220,'+ma.toFixed(3)+')';ctx.beginPath();ctx.arc(mx,my,mr,0,6.283);ctx.fill();}
  var hc=[0,1,2].map(function(j){return mix(DAYH[j],NIGHTH[j],n);});
  hill(H*.84,H*.016,1.3,.4,hc[0]);hill(H*.9,H*.018,1.1,2.2,hc[1]);hill(H*.955,H*.014,.9,4.1,hc[2]);
  if(n>.05){for(k=0;k<flies.length;k++){var f=flies[k];
    if(!reduceMotion){f.x+=f.vx*dt*8+Math.sin(t*.7+f.ph)*.0004;f.y+=f.vy*dt*8+Math.cos(t*.6+f.ph)*.0003;if(f.x<0)f.x=1;if(f.x>1)f.x=0;if(f.y<.68)f.y=.68;if(f.y>.97)f.y=.97;}
    var fa=n*(.45+.55*Math.sin(t*2.2+f.ph)),fx=f.x*W,fy=f.y*H,fg=ctx.createRadialGradient(fx,fy,0,fx,fy,9);
    fg.addColorStop(0,'rgba(220,192,138,'+Math.max(fa,0).toFixed(3)+')');fg.addColorStop(1,'rgba(220,192,138,0)');ctx.fillStyle=fg;ctx.fillRect(fx-9,fy-9,18,18);}}
}
/* ================= Three.js sky: shader clouds, grain, hills, stars and fireflies ================= */
var GLOK=false,glR,glScene,glCam,glMat,glStars,glFlies,glBirds;
(function initGL(){
  try{
    gc=document.createElement('canvas');gc.id='gl';gc.setAttribute('aria-hidden','true');cv.parentNode.insertBefore(gc,cv);
    glR=new WebGLRenderer({canvas:gc,antialias:false,alpha:false,powerPreference:'low-power'});
    glR.setClearColor(0xf8f3e6,1);
    glScene=new Scene();glCam=new OrthographicCamera(-1,1,1,-1,0,1);
    var noiseGLSL=[
      'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
      'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(7.1,3.7);a*=.5;}return v;}',
      'float fbm3(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise(p);p=p*2.07+vec2(3.1,5.3);a*=.5;}return v;}',
      /* ridged noise along one axis gives a mountain skyline with sharp crests */
      'float ridge(float x,float s){float v=0.,a=.55,f=1.;for(int i=0;i<4;i++){float n=noise(vec2(x*f+s,s*1.7));n=1.-abs(2.*n-1.);v+=a*n*n;f*=2.15;a*=.48;}return v;}',
      'vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}',
      /* craters: random bowls with raised rims, from a jittered grid */
      'float craters(vec2 p){vec2 ip=floor(p),fp=fract(p);float h=0.;for(int j=-1;j<=1;j++){for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=hash2(ip+g);if(o.x<.62){vec2 r=g+o-fp;float t=length(r)/(.16+.34*fract(o.y*7.3+o.x*3.1));h+=smoothstep(1.,.15,t)*-.6+exp(-pow((t-1.05)*7.,2.))*.45;}}}return h;}',
      'float lunarH(vec2 sp){return craters(sp*1.6)*.7+craters(sp*4.3)*.34+fbm3(sp*7.)*.2;}',
      /* the moon: a lit sphere with maria, craters and a soft terminator */
      'vec3 moonShade(vec2 d,float r2,vec3 sky){float z=sqrt(max(1.-r2,0.));vec3 n=vec3(d,z);vec2 sp=d*1.25;float mar=smoothstep(.44,.6,fbm3(sp*1.1+vec2(4.2,1.3)));mar=max(mar,.7*smoothstep(.5,.66,fbm3(sp*2.1+vec2(9.,2.))));float alb=.95-.36*mar;alb*=.92+.12*fbm3(sp*7.+3.);alb+=craters(sp*7.+1.7)*.045;vec2 ty=sp-vec2(-.3,-.45);alb+=.14*exp(-dot(ty,ty)*120.);vec3 L=normalize(vec3(.62,-.1,.78));float ci=max(dot(n,L),0.);float ls=clamp(2.*ci/(ci+max(z,.05)),0.,1.08);float lit=smoothstep(0.,.1,ci);vec3 mc=vec3(1.,.975,.93)*alb*ls*.96;vec3 dark=sky*.88+vec3(.02,.026,.034)*alb;return mix(dark,mc,lit);}',
      /* one mountain range: ridged skyline, strata, sun-facing light, rim light and haze */
      'vec4 mountLayer(vec2 uv,float asp,float xoff,float base,float amp,float freq,float seed,vec3 baseCol,float fogAmt,vec3 fog,float lx,float lI,vec3 warm){float x=(uv.x+xoff)*asp*freq;float h=base+amp*ridge(x,seed)*1.5;float e=.01;float h2=base+amp*ridge(x+e,seed)*1.5;float slope=(h2-h)/(e/(asp*freq));float m=smoothstep(h+.0022,h-.0022,uv.y);if(m<.001)return vec4(0.);float dpt=h-uv.y;vec2 q=vec2(uv.x*asp,uv.y);float rock=fbm3(vec2(q.x*9.+q.y*5.,q.y*26.)+seed*3.);float lit=clamp(.55-slope*clamp((lx-uv.x)*3.,-1.,1.)*.06,0.,1.);vec3 c=baseCol*(.72+.55*rock);c*=.62+.7*lit*lI+.25*(1.-lI);c*=.75+.45*smoothstep(0.,.14,dpt);float st=.5+.5*sin(uv.y*160.+rock*10.);c*=.95+.08*st;c+=warm*exp(-dpt*150.)*lit*.55;c=mix(c,fog,fogAmt*(.7+.6*smoothstep(0.,.25,dpt)));return vec4(c,m);}'
    ].join('\n');
    var frag=[
      'precision highp float;',
      'varying vec2 vUv;',
      'uniform vec2 uRes,uSun,uMoon,uMouse;',
      'uniform float uT,uP,uN,uSunA,uMoonA,uSunE,uMoonPh,uMoonR;',
      'uniform vec3 uTop,uBot;',
      noiseGLSL,
      'float hillMask(float x,float y,float base,float amp,float cyc,float ph){float u=x*6.2831*cyc+ph;float h=base+amp*sin(u)+amp*.5*sin(u*2.3+ph*1.7);return smoothstep(h+.0025,h-.0025,y);}',
      'void main(){',
      '  float asp=uRes.x/uRes.y;vec2 uv=vUv;vec2 q=vec2(uv.x*asp,uv.y);',
      '  vec3 col=mix(uBot,uTop,pow(uv.y,.9));',
      '  col+=(1.-uN)*.04*smoothstep(.45,.12,uv.y);',
      /* the Milky Way, a faint band across the night sky */
      '  float mwd=dot(uv-vec2(.5,.55),vec2(.82,-.57));',
      '  float mw=exp(-mwd*mwd*14.)*fbm(q*5.+2.)*smoothstep(.3,.6,uv.y);',
      '  col+=vec3(.55,.62,.8)*mw*.24*uN;',
      /* a shooting star every eleven seconds on clear nights */
      '  float sid=floor(uT/11.),sph=fract(uT/11.)/.09;',
      '  if(sph<1.&&uN>.7){vec2 s0=vec2(.2+.55*hash(vec2(sid,1.)),.68+.22*hash(vec2(sid,2.)));vec2 dir=normalize(vec2(.8,-.5));vec2 hd=s0+dir*sph*.32;vec2 tl=hd-dir*.11;vec2 pa=(uv-tl)*vec2(asp,1.),ba=(hd-tl)*vec2(asp,1.);float hh=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);float dd=length(pa-ba*hh);col+=vec3(.9,.95,1.)*smoothstep(.0035,0.,dd)*hh*hh*(1.-sph)*uN;}',
      /* sun: a bright, slightly warm disc with a soft atmospheric bloom (screen blended, so it never blows out the sky) */
      '  vec2 ds=(uv-uSun)*vec2(asp,1.);float rs=length(ds);float R=.03;',
      '  vec3 sunC=mix(vec3(1.,.52,.22),vec3(1.,.95,.84),smoothstep(.05,.6,uSunE));',
      '  vec3 bloom=sunC*(exp(-rs*2.4)*.14+exp(-rs*8.)*.24+exp(-rs*26.)*.42)*uSunA;',
      '  col=1.-(1.-col)*(1.-clamp(bloom,0.,1.));',
      '  col=1.-(1.-col)*(1.-vec3(1.,.55,.25)*exp(-max(uv.y-.1,0.)*6.)*exp(-pow((uv.x-uSun.x)*1.7,2.))*(1.-smoothstep(.05,.6,uSunE))*.3*uSunA);',
      '  float mu=sqrt(max(1.-(rs/R)*(rs/R),0.));',
      '  vec3 disc=mix(sunC,vec3(1.,.99,.96),.5+.5*smoothstep(0.,.8,mu)*smoothstep(.15,.7,uSunE));',
      '  col=mix(col,min(disc*1.04,vec3(1.)),(1.-smoothstep(R*.78,R*1.1,rs))*uSunA);',
      /* moon: a real-looking gibbous moon with maria and a cool halo */
      '  float Rm=uMoonR;vec2 dm=(uv-uMoon)*vec2(asp,1.)/Rm;float rm=length(dm);',
      '  col+=vec3(.78,.83,.88)*(exp(-rm*.6)*.035+exp(-rm*2.)*.09)*uMoonA;',
      '  if(rm<1.02){vec3 mc=moonShade(dm,min(rm*rm,1.),col);col=mix(col,mc,(1.-smoothstep(.975,1.,rm))*uMoonA);}',
      /* clouds: domain-warped noise, lit from one side */
      '  float t=uT*.012;',
      '  vec2 cp=q*vec2(1.3,3.2)+vec2(t*2.2+uP*1.1+uMouse.x*.07,uMouse.y*.04);',
      '  float w=fbm(cp*.7+t);',
      '  float c=fbm(cp+w*1.5);',
      '  float body=smoothstep(.42,.76,c);',
      '  float lit=clamp(c-fbm(cp+vec2(.14,.22)+w)+.5,0.,1.);',
      '  vec3 cDay=mix(vec3(.78,.85,.74),vec3(1.,.985,.94),lit);',
      '  vec3 cNight=mix(vec3(.04,.12,.09),vec3(.17,.31,.24),lit);',
      '  float band=smoothstep(.2,.55,uv.y)*(1.-smoothstep(.93,1.,uv.y));',
      '  col=mix(col,mix(cDay,cNight,uN),body*band*mix(.5,.34,uN));',
      /* two mountain ranges, valley mist, then three forested hills */
      '  float px=uMouse.x;float lx=mix(uSun.x,uMoon.x,uN);float lI=mix(1.,.18,uN);',
      '  vec3 warm=vec3(1.,.72,.4)*uSunA*(1.-uN);',
      '  vec3 cA=mix(vec3(.42,.56,.55),vec3(.06,.15,.14),uN);',
      '  vec3 cB=mix(vec3(.3,.46,.38),vec3(.04,.11,.09),uN);',
      '  vec4 mA=mountLayer(uv,asp,px*.004+uP*.012,.19,.105,1.5,3.1,cA,.6,uBot,lx,lI,warm);',
      '  col=mix(col,mA.rgb,mA.a);',
      '  vec4 mB=mountLayer(uv,asp,px*.008+uP*.025,.145,.075,2.3,8.7,cB,.34,uBot,lx,lI,warm);',
      '  col=mix(col,mB.rgb,mB.a);',
      '  float mist=fbm(vec2(q.x*2.2+uT*.01,q.y*9.))*exp(-pow((uv.y-.14)*10.,2.));',
      '  col=mix(col,mix(uBot*1.05,vec3(1.),.2*(1.-uN)),mist*.45);',
      '  float x=uv.x+uMouse.x*.012;',
      '  vec3 h1=mix(vec3(.62,.70,.54),vec3(.05,.17,.12),uN);',
      '  vec3 h2=mix(vec3(.49,.60,.45),vec3(.04,.13,.09),uN);',
      '  vec3 h3=mix(vec3(.37,.50,.35),vec3(.02,.09,.06),uN);',
      '  float m1=hillMask(x+uP*.02,uv.y,.16,.016,1.3,.4);',
      '  float m2=hillMask(x+uP*.04,uv.y,.10,.018,1.1,2.2);',
      '  float m3=hillMask(x+uP*.07,uv.y,.045,.014,.9,4.1);',
      '  col=mix(col,h1,m1);col=mix(col,h2,m2);col=mix(col,h3,m3);',
      '  float hm=max(max(m1,m2),m3);',
      '  col*=1.-hm*.08*noise(q*vec2(180.,70.));',
      '  col+=(hash(gl_FragCoord.xy)-.5)*.006;',
      '  vec2 vv=uv-.5;col*=1.-dot(vv,vv)*.3;',
      '  gl_FragColor=vec4(col,1.);',
      '}'
    ].join('\n');
    glMat=new ShaderMaterial({
      uniforms:{uRes:{value:new Vector2(1,1)},uSun:{value:new Vector2(.1,.5)},uMoon:{value:new Vector2(.3,.7)},uMouse:{value:new Vector2(0,0)},
        uT:{value:0},uP:{value:0},uN:{value:0},uSunA:{value:1},uMoonA:{value:0},uSunE:{value:.5},uMoonPh:{value:1},uMoonR:{value:.05},uTop:{value:new Vector3(.9,.9,.8)},uBot:{value:new Vector3(.97,.95,.9)}},
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader:frag,depthTest:false,depthWrite:false});
    var quad=new Mesh(new PlaneGeometry(2,2),glMat);quad.frustumCulled=false;quad.renderOrder=0;glScene.add(quad);
    /* stars: many small ones, a few bright ones with spikes, and a denser faint band for the Milky Way */
    var ns=620,nm=520,nt=ns+nm,sp=new Float32Array(nt*3),ss=new Float32Array(nt),sph=new Float32Array(nt),stn=new Float32Array(nt),r=rng(7),k;
    for(k=0;k<ns;k++){sp[k*3]=r()*2-1;sp[k*3+1]=.06+Math.pow(r(),.8)*.94;ss[k]=r()<.05?3+r()*2.4:.9+r()*1.5;sph[k]=r()*6.28;stn[k]=r();}
    for(k=ns;k<nt;k++){var tries=0,ux,uy;do{var u=(r()*2-1)*1.3,v=(r()+r()+r()-1.5)*.16;ux=.57*u+.82*v;uy=.1+.82*u-.57*v;tries++;}while((Math.abs(ux)>1||uy<.06||uy>1)&&tries<8);
      sp[k*3]=clamp(ux,-1,1);sp[k*3+1]=clamp(uy,.06,1);ss[k]=.8+r()*.5;sph[k]=r()*6.28;stn[k]=r();}
    var sg=new BufferGeometry();sg.setAttribute('position',new BufferAttribute(sp,3));sg.setAttribute('aS',new BufferAttribute(ss,1));sg.setAttribute('aPh',new BufferAttribute(sph,1));sg.setAttribute('aT',new BufferAttribute(stn,1));
    var pointUniforms=function(){return {uT:{value:0},uN:{value:0},uPx:{value:1},uAsp:{value:1},uMoonC:{value:new Vector2(0,0)}};};
    glStars=new Points(sg,new ShaderMaterial({uniforms:pointUniforms(),transparent:true,depthTest:false,depthWrite:false,blending:AdditiveBlending,
      vertexShader:'attribute float aS;attribute float aPh;attribute float aT;uniform float uT,uN,uPx,uAsp;uniform vec2 uMoonC;varying float vA;varying float vT;varying float vBig;void main(){gl_Position=vec4(position.xy,0.,1.);float big=step(2.5,aS);gl_PointSize=aS*uPx*(1.+big*1.6);float tw=.86+.14*sin(uT*(.6+aT*.5)+aPh);float dm=length((position.xy-uMoonC)*vec2(uAsp,1.));vA=uN*tw*smoothstep(.13,.35,dm)*smoothstep(-.3,-.05,position.y);vT=aT;vBig=big;}',
      fragmentShader:'precision mediump float;varying float vA;varying float vT;varying float vBig;void main(){vec2 pc=gl_PointCoord-.5;float d=length(pc);float core=1.-smoothstep(.0,.5,d);float a=core*core+vBig*(exp(-abs(pc.x)*38.)*exp(-abs(pc.y)*3.)+exp(-abs(pc.y)*38.)*exp(-abs(pc.x)*3.))*.5;vec3 c=mix(vec3(.75,.85,1.),vec3(1.,.9,.72),vT);gl_FragColor=vec4(c,a*vA*.9);}'}));
    glStars.frustumCulled=false;glStars.renderOrder=1;glScene.add(glStars);
    /* a small flock of birds that crosses the day sky */
    var nb=7,bp=new Float32Array(nb*3),bs=new Float32Array(nb*4);
    for(k=0;k<nb;k++){bs[k*4]=r();bs[k*4+1]=r();bs[k*4+2]=r();bs[k*4+3]=r();}
    var bg=new BufferGeometry();bg.setAttribute('position',new BufferAttribute(bp,3));bg.setAttribute('aSeed',new BufferAttribute(bs,4));
    glBirds=new Points(bg,new ShaderMaterial({uniforms:pointUniforms(),transparent:true,depthTest:false,depthWrite:false,
      vertexShader:'attribute vec4 aSeed;uniform float uT,uN,uPx;varying float vA;varying float vPh;void main(){float x=fract(aSeed.x*.12+.15*aSeed.w+uT*.0045*(.8+aSeed.y*.4));float y=.74+.1*aSeed.z+.02*sin(uT*.5+aSeed.w*8.)+.03*aSeed.y;gl_Position=vec4(x*2.-1.,y*2.-1.,0.,1.);gl_PointSize=(11.+7.*aSeed.y)*uPx;vA=(1.-uN)*smoothstep(0.,.08,x)*(1.-smoothstep(.92,1.,x));vPh=aSeed.w*6.28+uT*(5.+aSeed.y*2.);}',
      fragmentShader:'precision mediump float;varying float vA;varying float vPh;void main(){vec2 p=gl_PointCoord*2.-1.;float w=abs(p.x);float f=sin(vPh)*.5+.5;float cy=-w*mix(-.55,.6,f);float d=abs(p.y-cy);float a=(1.-smoothstep(.06,.15,d))*(1.-smoothstep(.8,1.,w));gl_FragColor=vec4(.1,.2,.16,a*vA*.5);}'}));
    glBirds.frustumCulled=false;glBirds.renderOrder=2;glScene.add(glBirds);
    /* fireflies */
    var nf=22,fp=new Float32Array(nf*3),fs=new Float32Array(nf*4);
    for(k=0;k<nf;k++){fs[k*4]=r();fs[k*4+1]=r();fs[k*4+2]=r();fs[k*4+3]=r();}
    var fg=new BufferGeometry();fg.setAttribute('position',new BufferAttribute(fp,3));fg.setAttribute('aSeed',new BufferAttribute(fs,4));
    glFlies=new Points(fg,new ShaderMaterial({uniforms:pointUniforms(),transparent:true,depthTest:false,depthWrite:false,blending:AdditiveBlending,
      vertexShader:'attribute vec4 aSeed;uniform float uT,uN,uPx;varying float vA;void main(){float x=fract(aSeed.x+uT*.004*(aSeed.w-.5)+sin(uT*.7+aSeed.z*6.)*.01);float y=-.92+aSeed.y*.5+sin(uT*.6+aSeed.w*9.)*.03;gl_Position=vec4(x*2.-1.,y,0.,1.);gl_PointSize=(8.+aSeed.z*7.)*uPx;vA=uN*(.6+.4*sin(uT*.9+aSeed.w*20.));}',
      fragmentShader:'precision mediump float;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.0,.5,d);gl_FragColor=vec4(vec3(.86,.75,.54),a*a*max(vA,0.));}'}));
    glFlies.frustumCulled=false;glFlies.renderOrder=3;glScene.add(glFlies);
    document.addEventListener('pointermove',onPointer,{passive:true});
    cv.style.display='none';GLOK=true;
  }catch(err){GLOK=false;if(gc&&gc.parentNode)gc.parentNode.removeChild(gc);cv.style.display='';}
})();
var glPx=1;
function glResize(){
  glPx=Math.min(window.devicePixelRatio||1,1.5)*(W<700?.75:.95);
  glR.setPixelRatio(glPx);glR.setSize(W,H,false);
  glMat.uniforms.uRes.value.set(glR.domElement.width,glR.domElement.height);
  glStars.material.uniforms.uPx.value=glPx*1.4;glFlies.material.uniforms.uPx.value=glPx*1.4;glBirds.material.uniforms.uPx.value=glPx*1.4;glStars.material.uniforms.uAsp.value=W/Math.max(H,1);glMat.uniforms.uMoonR.value=W<700?.034:.042;
}
function glDraw(p,t,sky,n){
  var u=glMat.uniforms,tt=reduceMotion?6:t;
  glMouse.x+=(glMouse.tx-glMouse.x)*.05;glMouse.y+=(glMouse.ty-glMouse.y)*.05;
  u.uT.value=tt;u.uP.value=p;u.uN.value=n;u.uMouse.value.set(reduceMotion?0:glMouse.x,reduceMotion?0:glMouse.y);
  u.uTop.value.set(sky.top[0]/255,sky.top[1]/255,sky.top[2]/255);u.uBot.value.set(sky.bot[0]/255,sky.bot[1]/255,sky.bot[2]/255);
  var sp=p/.72,sc=clamp(sp,0,1);
  u.uSun.value.set(.12+.76*sc,.26+Math.sin(Math.PI*sc)*.55);u.uSunE.value=Math.sin(Math.PI*sc);u.uSunA.value=(1-smooth(.9,1.02,sp))*.9;
  var m=clamp((p-.62)/.38,0,1);
  u.uMoon.value.set(W<700?.74+.12*m:.76+.12*m,.5+.34*Math.sin(m*Math.PI*.5));u.uMoonA.value=smooth(.22,.45,m)*(W<700?.8:.95);
  var su=glStars.material.uniforms;su.uT.value=tt;su.uN.value=n;su.uMoonC.value.set(u.uMoon.value.x*2-1,u.uMoon.value.y*2-1);
  glFlies.material.uniforms.uT.value=tt;glFlies.material.uniforms.uN.value=n;glBirds.material.uniforms.uT.value=tt;glBirds.material.uniforms.uN.value=n;
  glR.render(glScene,glCam);
}


/* tone, CSS colour and the virtual clock for a given scroll progress */
function info(p){
  var sky=skyAt(p),hrs=9+p*16,hh=Math.floor(hrs)%24,mm=Math.floor((hrs%1)*60);
  return {
    sky:sky,
    night:smooth(.6,.8,p),
    tone:lum(mix(sky.top,sky.bot,.5))<.23?'night':'day',
    skyBottom:css(sky.bot),
    clock:pad(hh)+':'+pad(mm),
    phase:hrs<12?0:hrs<16.5?1:hrs<20?2:3
  };
}
return {
  info:info,
  resize:resize,
  render:function(p,t,dt){var s=info(p);if(GLOK)glDraw(p,t,s.sky,s.night);else draw(p,t,dt,s.sky,s.night);return s;},
  destroy:function(){
    document.removeEventListener('pointermove',onPointer);
    if(GLOK){glR.dispose();glMat.dispose();glStars.geometry.dispose();glStars.material.dispose();glFlies.geometry.dispose();glFlies.material.dispose();glBirds.geometry.dispose();glBirds.material.dispose();}
    if(gc&&gc.parentNode)gc.parentNode.removeChild(gc);
  }
};
}
