/*
  The sky's palette and timing, plus a light 2D-canvas sky. Scroll progress drives the time of day,
  from 09:00 at the top of the page to past midnight at the night chapter.
  When a WebGL sky (skyGL.js) is passed in, it draws instead of the 2D one.
*/
/* eslint-disable */
import { clamp, pad, reduceMotion } from './motion';

export function createSky(canvas, gl) {
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
function resize(force){if(!force&&innerWidth===lastRW&&Math.abs(innerHeight-lastRH)<200)return;lastRW=innerWidth;lastRH=innerHeight;var d=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=Math.round(W*d);cv.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);if(gl)gl.resize(W,H);}
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
  var m=clamp((p-.62)/.38,0,1),ma=smooth(.22,.45,m)*(W<700?.8:.95);
  if(ma>0){
    /* same place as the WebGL moon: upper right, night only; a soft-lit disc with a cool halo */
    var mx=W*(W<700?.74+.12*m:.76+.12*m),my=H*(1-(.5+.34*Math.sin(m*Math.PI*.5))),mr=H*(W<700?.034:.042);
    var mg=ctx.createRadialGradient(mx,my,mr*.8,mx,my,mr*4.5);mg.addColorStop(0,'rgba(200,212,224,'+(.16*ma).toFixed(3)+')');mg.addColorStop(1,'rgba(200,212,224,0)');
    ctx.fillStyle=mg;ctx.fillRect(mx-mr*4.5,my-mr*4.5,mr*9,mr*9);
    var md=ctx.createRadialGradient(mx+mr*.35,my-mr*.1,mr*.1,mx,my,mr);md.addColorStop(0,'rgba(250,246,234,'+ma.toFixed(3)+')');md.addColorStop(.75,'rgba(226,222,208,'+ma.toFixed(3)+')');md.addColorStop(1,'rgba(196,192,180,'+ma.toFixed(3)+')');
    ctx.fillStyle=md;ctx.beginPath();ctx.arc(mx,my,mr,0,6.283);ctx.fill();
    ctx.fillStyle='rgba(120,124,118,'+(.16*ma).toFixed(3)+')';
    [[-.3,-.25,.28],[.1,.2,.22],[-.05,-.45,.14],[.35,-.1,.12]].forEach(function(c){ctx.beginPath();ctx.ellipse(mx+c[0]*mr,my+c[1]*mr,c[2]*mr*1.3,c[2]*mr,0.4,0,6.283);ctx.fill();});
  }
  var hc=[0,1,2].map(function(j){return mix(DAYH[j],NIGHTH[j],n);});
  hill(H*.84,H*.016,1.3,.4,hc[0]);hill(H*.9,H*.018,1.1,2.2,hc[1]);hill(H*.955,H*.014,.9,4.1,hc[2]);
  if(n>.05){for(k=0;k<flies.length;k++){var f=flies[k];
    if(!reduceMotion){f.x+=f.vx*dt*8+Math.sin(t*.7+f.ph)*.0004;f.y+=f.vy*dt*8+Math.cos(t*.6+f.ph)*.0003;if(f.x<0)f.x=1;if(f.x>1)f.x=0;if(f.y<.68)f.y=.68;if(f.y>.97)f.y=.97;}
    var fa=n*(.45+.55*Math.sin(t*2.2+f.ph)),fx=f.x*W,fy=f.y*H,fg=ctx.createRadialGradient(fx,fy,0,fx,fy,9);
    fg.addColorStop(0,'rgba(220,192,138,'+Math.max(fa,0).toFixed(3)+')');fg.addColorStop(1,'rgba(220,192,138,0)');ctx.fillStyle=fg;ctx.fillRect(fx-9,fy-9,18,18);}}
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
  gl:!!gl,
  render:function(p,t,dt){var s=info(p);if(gl)gl.draw(p,t,s.sky,s.night);else draw(p,t,dt,s.sky,s.night);return s;},
  destroy:function(){if(gl)gl.destroy();}
};
}
