/* Juice ka asli jaisa glass (SVG). Alag file taaki code saaf rahe. */
(function(){
"use strict";
var C = window.FRESHERS;
var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var $ = function(s,r){return (r||document).querySelector(s)};
var esc = function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
/* ---------- glass (realistic) ---------- */
var gid = 0;
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function wl(y){return 38+(y-150)*0.10625}
function wr(y){return 262-(y-150)*0.10625}
function f1(n){return n.toFixed(1)}
function f2(n){return n.toFixed(2)}
function iceCube(u,x,y,s,rot,dl){
  var h=s/2,r=s*.24;
  return '<g transform="translate('+x+' '+y+') rotate('+rot+')"><g class="bob" style="animation-delay:-'+dl+'s">'+
    '<rect x="'+(-h)+'" y="'+(-h)+'" width="'+s+'" height="'+s+'" rx="'+f1(r)+'" fill="url(#ice'+u+')" stroke="#fff" stroke-opacity=".75" stroke-width="1.5"/>'+
    '<rect x="'+f1(-h*.64)+'" y="'+f1(-h*.64)+'" width="'+f1(s*.64)+'" height="'+f1(s*.64)+'" rx="'+f1(r*.6)+'" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1"/>'+
    '<path d="M'+f1(-h*.78)+' '+f1(-h*.4)+' Q'+f1(-h*.78)+' '+f1(-h*.8)+' '+f1(-h*.4)+' '+f1(-h*.82)+'" fill="none" stroke="#fff" stroke-opacity=".92" stroke-width="2.2" stroke-linecap="round"/>'+
    '<circle cx="'+f1(h*.3)+'" cy="'+f1(h*.25)+'" r="'+f1(s*.045)+'" fill="#fff" fill-opacity=".7"/><circle cx="'+f1(h*.02)+'" cy="'+f1(h*.52)+'" r="'+f1(s*.03)+'" fill="#fff" fill-opacity=".6"/>'+
  '</g></g>';
}
function glass(){
  var u=++gid, R=rng(11+u*97), i, x, y;
  var BODY='M38 150 L72 470 A78 11 0 0 0 228 470 L262 150 Z';
  var bub='', pulp='', dr='', run='', ice='';
  for(i=0;i<16;i++){
    y=250+R()*205; x=wl(y)+14+R()*(wr(y)-wl(y)-28); var r=1.2+R()*2.6;
    bub+='<g transform="translate('+f1(x)+' '+f1(y)+')"><g class="bub" style="--up:'+(-Math.round(y-186))+'px;--t:'+f1(5+R()*6)+'s;--d:-'+f1(R()*9)+'s"><circle r="'+f1(r)+'" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".55" stroke-width=".7"/><circle cx="'+f2(-r*.3)+'" cy="'+f2(-r*.3)+'" r="'+f2(r*.28)+'" fill="#fff" fill-opacity=".9"/></g></g>';
  }
  for(i=0;i<70;i++){
    y=196+R()*272; x=wl(y)+6+R()*(wr(y)-wl(y)-12);
    pulp+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(.5+R()*1.5)+'" fill="'+(R()>.5?'#fff':'#000')+'" fill-opacity="'+f2(.07+R()*.17)+'"/>';
  }
  for(i=0;i<46;i++){
    y=168+Math.pow(R(),.9)*292; x=wl(y)+7+R()*(wr(y)-wl(y)-14);
    var rr=1.3+Math.pow(R(),2.2)*5.6, ry=rr*(1.05+R()*.4);
    dr+='<g transform="translate('+f1(x)+' '+f1(y)+')"><ellipse rx="'+f2(rr)+'" ry="'+f2(ry)+'" fill="url(#dp'+u+')" stroke="#fff" stroke-opacity=".3" stroke-width=".6"/>'+
      '<ellipse cx="'+f2(-rr*.32)+'" cy="'+f2(-ry*.38)+'" rx="'+f2(rr*.26)+'" ry="'+f2(ry*.18)+'" fill="#fff" fill-opacity=".9"/>'+
      '<path d="M'+f2(-rr*.62)+' '+f2(ry*.5)+' Q0 '+f2(ry*1.02)+' '+f2(rr*.62)+' '+f2(ry*.5)+'" fill="none" stroke="#000" stroke-opacity=".25" stroke-width=".7"/></g>';
  }
  [[96,205,3.6,0],[206,232,3,-4],[165,176,3.2,-7]].forEach(function(d){
    run+='<g transform="translate('+d[0]+' '+d[1]+')"><g class="run" style="--t:'+(9+d[2])+'s;--d:'+d[3]+'s"><line y1="-34" y2="-3" stroke="#fff" stroke-opacity=".22" stroke-width="1.7" stroke-linecap="round"/>'+
      '<ellipse rx="'+d[2]+'" ry="'+f1(d[2]*1.35)+'" fill="url(#dp'+u+')" stroke="#fff" stroke-opacity=".4" stroke-width=".7"/><ellipse cx="'+f2(-d[2]*.3)+'" cy="'+f2(-d[2]*.5)+'" rx="'+f2(d[2]*.25)+'" ry="'+f2(d[2]*.2)+'" fill="#fff" fill-opacity=".9"/></g></g>';
  });
  ice=iceCube(u,112,186,48,-14,0)+iceCube(u,188,196,42,12,1.6)+iceCube(u,150,238,38,-6,3)+iceCube(u,96,246,30,22,2.2);

  var label = C.brand.logo
    ? '<circle cy="-30" r="56" fill="#000" fill-opacity=".18" transform="translate(2 4)"/><image href="'+esc(C.brand.logo)+'" x="-54" y="-84" width="108" height="108" preserveAspectRatio="xMidYMid meet"/>'
    : '<g transform="translate(-27 -90)"><use href="#slice" width="54" height="54" style="color:#FF8B1A"/></g><text class="gink" y="-14" text-anchor="middle" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="800" font-size="24" letter-spacing="-.8">'+esc(C.brand.name.toUpperCase())+'</text><text class="gink" y="4" text-anchor="middle" font-family="DM Sans,system-ui,sans-serif" font-weight="700" font-size="8.5" letter-spacing="2.4" opacity=".8">'+esc(C.brand.tagline.toUpperCase())+'</text>';

  var straw=function(){return '<g transform="translate(206 6) rotate(7.87)"><rect x="-6" y="0" width="12" height="452" rx="2" fill="url(#st'+u+')"/><rect x="-1.4" y="0" width="1.6" height="452" fill="#fff" fill-opacity=".35"/></g>'};

  return '<svg class="glass" viewBox="0 0 300 520" role="img" aria-label="Sealed plastic glass of fresh juice">'+
  '<defs>'+
   '<clipPath id="cp'+u+'"><path d="'+BODY+'"/></clipPath>'+
   '<clipPath id="tp'+u+'"><rect width="300" height="78"/></clipPath>'+
   '<linearGradient id="lq'+u+'" x1="0" x2="1"><stop offset="0" style="stop-color:color-mix(in srgb,var(--j) 70%,#000)"/><stop offset=".13" style="stop-color:color-mix(in srgb,var(--j) 94%,#000)"/><stop offset=".4" style="stop-color:color-mix(in srgb,var(--j) 80%,#fff)"/><stop offset=".68" style="stop-color:color-mix(in srgb,var(--j) 94%,#fff)"/><stop offset=".9" style="stop-color:color-mix(in srgb,var(--j) 84%,#000)"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--j) 64%,#000)"/></linearGradient>'+
   '<linearGradient id="dep'+u+'" gradientUnits="userSpaceOnUse" x1="0" y1="190" x2="0" y2="480"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>'+
   '<radialGradient id="sf'+u+'" cx=".5" cy=".5" r=".55"><stop offset="0" style="stop-color:color-mix(in srgb,var(--j) 55%,#fff)"/><stop offset=".72" style="stop-color:color-mix(in srgb,var(--j) 90%,#fff)"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--j) 68%,#000)"/></radialGradient>'+
   '<radialGradient id="gl'+u+'"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
   '<linearGradient id="ice'+u+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".66"/><stop offset=".55" stop-color="#fff" stop-opacity=".16"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--j) 40%,#fff)" stop-opacity=".42"/></linearGradient>'+
   '<radialGradient id="dp'+u+'" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>'+
   '<linearGradient id="spv'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".15" stop-color="#fff" stop-opacity=".6"/><stop offset=".7" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
   '<linearGradient id="cy'+u+'" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".34"/><stop offset=".2" stop-color="#000" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>'+
   '<linearGradient id="dm'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>'+
   '<linearGradient id="st'+u+'" x1="0" x2="1"><stop offset="0" stop-color="#0b1511"/><stop offset=".3" stop-color="#3a4e46"/><stop offset=".48" stop-color="#86a096"/><stop offset=".62" stop-color="#26352f"/><stop offset="1" stop-color="#0b1511"/></linearGradient>'+
   '<radialGradient id="ca'+u+'"><stop offset="0" style="stop-color:var(--j)" stop-opacity=".6"/><stop offset="1" style="stop-color:var(--j)" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="sd'+u+'"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'+
  '</defs>'+
  '<ellipse cx="150" cy="487" rx="128" ry="15" fill="url(#ca'+u+')"/><ellipse cx="150" cy="485" rx="96" ry="9" fill="url(#sd'+u+')"/>'+
  '<path d="'+BODY+'" fill="#fff" fill-opacity=".09"/>'+
  straw()+
  '<g clip-path="url(#cp'+u+')"><g class="juice">'+
    '<rect y="190" width="300" height="340" fill="url(#lq'+u+')" fill-opacity=".98"/>'+
    '<rect y="190" width="300" height="340" fill="url(#dep'+u+')"/>'+
    '<ellipse cx="150" cy="335" rx="96" ry="120" fill="url(#gl'+u+')"/>'+
    pulp+bub+
    '<g class="surf"><ellipse cx="150" cy="190" rx="134" ry="13" fill="url(#sf'+u+')"/><path d="M28 191 A122 12 0 0 0 272 191" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1.6"/></g>'+
    ice+
  '</g></g>'+
  '<g transform="translate(150 360)">'+label+'</g>'+
  '<path d="'+BODY+'" fill="url(#cy'+u+')" opacity=".6"/>'+
  '<g clip-path="url(#cp'+u+')">'+dr+run+'</g>'+
  '<path d="M38 150 L72 470 A78 11 0 0 0 228 470 L262 150" fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="2"/>'+
  '<path d="M71 457 L72 470 A78 11 0 0 0 228 470 L229 457 A79 10 0 0 1 71 457 Z" fill="#fff" fill-opacity=".17"/>'+
  '<path d="M78 463 A72 9 0 0 0 222 463" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="1.2"/>'+
  '<g class="hl"><path d="M52 170 C47 250 60 360 80 452 L91 450 C75 360 66 250 66 172 Z" fill="url(#spv'+u+')"/><path d="M46 178 L76 458" stroke="#fff" stroke-opacity=".7" stroke-width="1.3" fill="none"/><path d="M252 190 L225 458" stroke="#fff" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/><rect x="196" y="236" width="14" height="120" rx="7" fill="#fff" fill-opacity=".11" transform="rotate(5 203 296)"/></g>'+
  '<ellipse cx="150" cy="148" rx="119" ry="15.5" fill="#fff" fill-opacity=".2" stroke="#fff" stroke-opacity=".85" stroke-width="2"/>'+
  '<path d="M36 148 C38 86 94 62 150 62 C206 62 262 86 264 148 A114 15 0 0 1 36 148 Z" fill="url(#dm'+u+')" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/>'+
  '<ellipse cx="150" cy="148" rx="106" ry="11" fill="none" stroke="#fff" stroke-opacity=".35"/>'+
  '<ellipse cx="197" cy="72" rx="9" ry="3.6" fill="#0a120f" fill-opacity=".6" stroke="#fff" stroke-opacity=".5"/>'+
  '<g class="hl"><path d="M56 124 C60 92 92 72 136 67" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="10" stroke-linecap="round"/><path d="M56 124 C60 92 92 72 136 67" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="2.6" stroke-linecap="round"/></g>'+
  '<g clip-path="url(#tp'+u+')">'+straw()+'</g>'+
  '<g transform="translate(238 128) rotate(16)"><use href="#slice" x="-34" y="-34" width="68" height="68" style="color:var(--j)"/></g>'+
  '</svg>';
}
function setFill(svg, px, instant){
  var j = $(".juice", svg);
  if(instant || reduce){j.style.transition="none";}
  j.style.setProperty("--fill", px+"px");
  if(instant){void j.getBoundingClientRect(); j.style.transition="";}
}
function tilt(zone, svg){
  if(reduce || !window.matchMedia("(pointer:fine)").matches) return;
  var raf=0, nx=0, ny=0;
  function apply(){raf=0; svg.style.setProperty("--ry",(nx*16).toFixed(2)); svg.style.setProperty("--rx",(-ny*8).toFixed(2));}
  zone.addEventListener("pointermove",function(e){
    var r=svg.getBoundingClientRect();
    nx=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(window.innerWidth/2)));
    ny=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(window.innerHeight/2)));
    if(!raf) raf=requestAnimationFrame(apply);
  },{passive:true});
  zone.addEventListener("pointerleave",function(){nx=0;ny=0;if(!raf) raf=requestAnimationFrame(apply);});
}
function sloshIt(svg){svg.classList.remove("slosh"); void svg.getBoundingClientRect(); svg.classList.add("slosh"); setTimeout(function(){svg.classList.remove("slosh")},1600);}


window.FRGlass = { glass: glass, setFill: setFill, tilt: tilt, slosh: sloshIt };
})();
