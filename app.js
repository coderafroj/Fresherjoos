/* Fresher's — site ka poora dimaag. Daam/naam badalne ke liye config.js use karo, yahan kuch nahi badalna. */
(function(){
"use strict";
var C = window.FRESHERS, F = window.FRFormat, G = window.FRGlass;
/* Console mein "window" likhne par config/code ke naam na dikhein */
try{ delete window.FRESHERS; delete window.FRFormat; delete window.FRGlass; }catch(e){}
try{
  console.log("%cRuko!","font:800 42px system-ui;color:#B3123A");
  console.log("%cYahan koi bhi text paste mat karna. Koi aapko yahan kuch daalne ko kahe to wo aapka phone number, address ya account chura sakta hai.","font:600 15px system-ui");
}catch(e){}
var $  = function(s,r){return (r||document).querySelector(s)};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var rupee = function(n){return "₹"+Number(n).toLocaleString("en-IN")};
var esc = function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var fine = window.matchMedia("(pointer:fine)").matches;
var A = C.area || {}, zones = (A.zones||[]), mainZone = zones[0] || null;
var areaOn = A.enabled !== false && zones.length > 0;
var phoneShow = C.contact.phone.replace(/^(\d{5})(\d+)$/,"$1 $2");
var SITE = C.brand.siteUrl || location.origin;

function lum(hex){
  var c=[1,3,5].map(function(i){var v=parseInt(hex.slice(i,i+2),16)/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
  return .2126*c[0]+.7152*c[1]+.0722*c[2];
}
var onColor = function(hex){return lum(hex)>.24?"#0E3B2A":"#FFF6DF"};
var JUICE = function(id){return C.juices.filter(function(j){return j.id===id})[0]};
var SIZE  = function(id){return C.sizes.filter(function(s){return s.id===id})[0]};
var okSizes = function(j){return C.sizes.filter(function(s){return j.prices && j.prices[s.id]!=null})};
var minPrice = function(j){return Math.min.apply(null, okSizes(j).map(function(s){return j.prices[s.id]}))};
var waLink = function(text){return "https://wa.me/"+C.contact.whatsapp+"?text="+encodeURIComponent(text)};
var km = function(d){return d<1 ? Math.round(d*1000)+" m" : d.toFixed(1)+" km"};
var PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.6"/></svg>';
var PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>';

var toastT = 0;
function toast(m, ms){var t=$("#toast"); t.textContent=m; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(function(){t.hidden=true}, ms||2800);}

/* ================= static text ================= */
document.title = C.brand.name+" — "+C.brand.tagline+" Taaza juice, hospital aur gym tak";
$("#wordmark").innerHTML = (C.brand.logo?'<img src="'+esc(C.brand.logo)+'" alt="" width="44" height="44">':'')+"<span>"+esc(C.brand.name)+"</span>";
$("#hook").textContent = C.brand.hook || "";
$("#heroIntro").textContent = C.brand.intro;
$("#callTop").href = "tel:+91"+C.contact.phone; $("#callTop").innerHTML = PHONE+'<span class="num">'+phoneShow+"</span>";
$("#telBig").href = "tel:+91"+C.contact.phone; $("#telBig").textContent = phoneShow;
$("#callBig").href = "tel:+91"+C.contact.phone;
$("#badgeMin").textContent = C.delivery.minutes;
$("#mega").textContent = C.brand.name;
$("#fine").innerHTML = "© "+new Date().getFullYear()+" "+esc(C.brand.name)+". Sealed glass mein taaza juice. · <a href=\""+waLink("Namaste "+C.brand.name+"! Mujhe ek sawal poochhna hai.")+"\" target=\"_blank\" rel=\"noopener\">Sawal hai? WhatsApp pe poochho</a>";
var mq = C.marquee.map(function(t){return "<span>"+esc(t)+'<svg viewBox="0 0 100 100"><use href="#slice"/></svg></span>'}).join("");
$("#marquee").innerHTML = mq+mq;
$("#areaH").textContent = !areaOn ? "Hum aapke paas aate hain." : (zones.length===1 ? "Hum "+mainZone.name+" se "+mainZone.radiusKm+" km tak." : "Hum "+(A.city||"shehar")+" mein "+zones.length+" jagah se.");

/* khule / band */
function paintOpen(){
  var chip=$("#openChip"), h=C.hours; if(!h){chip.hidden=true;return;}
  var o=F.isOpen(C);
  chip.classList.toggle("ok", o); chip.lastElementChild.textContent = o ? "Abhi khule hain · "+h.close+" tak" : "Abhi band · "+h.open+" se khulenge";
}
paintOpen(); setInterval(paintOpen, 60000);

/* ================= HERO: juice badalta rehta hai ================= */
var hero=$("#top"), heroG=$("#heroGlass"), pick=$("#heroPick");
var avail = C.juices.filter(function(j){return j.available!==false}); if(!avail.length) avail=C.juices;
var hi = 0, hovering = false;
heroG.insertAdjacentHTML("afterbegin", G.glass());
var heroSvg = $(".glass", heroG);
pick.innerHTML = '<button class="nm" type="button" id="pickName"></button><div class="dots" role="group" aria-label="Juice chuno">'+avail.map(function(j,i){return '<button type="button" data-i="'+i+'" aria-label="'+esc(j.name)+'" aria-pressed="false"></button>'}).join("")+'</div>';
function applyHero(i, anim){
  hi = i; var j = avail[i];
  hero.style.setProperty("--hbg", j.color); hero.style.setProperty("--hfg", onColor(j.color));
  heroSvg.style.setProperty("--j", j.color); heroSvg.style.setProperty("--gink", onColor(j.color));
  if(anim && !reduce) G.slosh(heroSvg);
  $("#pickName").innerHTML = esc(j.name)+"<small>se "+rupee(minPrice(j))+"</small>"; $("#pickName").dataset.id = j.id;
  $$(".dots button", pick).forEach(function(b,k){b.setAttribute("aria-pressed", k===i?"true":"false")});
}
G.setFill(heroSvg, 330, true); applyHero(0,false);
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function(){setTimeout(function(){requestAnimationFrame(function(){G.setFill(heroSvg,0)})},150)});
G.tilt(hero, heroSvg);
if(!reduce && avail.length>1){
  setInterval(function(){ if(hovering || hero.classList.contains("off") || document.hidden) return; applyHero((hi+1)%avail.length, true); }, 5200);
}
if(fine){heroG.addEventListener("pointerenter",function(){hovering=true}); heroG.addEventListener("pointerleave",function(){hovering=false});}
pick.addEventListener("click", function(e){
  var d=e.target.closest("[data-i]"); if(d){applyHero(+d.dataset.i,true); return;}
  var n=e.target.closest("#pickName"); if(n){selectJuice(n.dataset.id); $("#menu").scrollIntoView({behavior:reduce?"auto":"smooth"});}
});

/* ================= MENU ================= */
var menu=$("#menu"), menuBox=$("#menuGlass"), menuSvg=null;
var firstOk = avail[0];
var cur = firstOk.id, curSize = (okSizes(firstOk)[1]||okSizes(firstOk)[0]||C.sizes[0]).id, qty = 1;
function glassVars(){ if(!menuSvg) return; var j=JUICE(cur); menuSvg.style.setProperty("--j",j.color); menuSvg.style.setProperty("--gink",onColor(j.color)); }
function ensureGlass(){
  if(menuSvg) return;
  menuBox.innerHTML = G.glass(); menuSvg = $(".glass", menuBox);
  G.tilt(menu, menuSvg); glassVars();
  G.setFill(menuSvg, 330, true);
  requestAnimationFrame(function(){requestAnimationFrame(function(){G.setFill(menuSvg,0)})});
}
$("#jlist").innerHTML = C.juices.map(function(j){
  var out = j.available===false;
  return '<li><button class="jrow'+(out?" out":"")+'" type="button" data-id="'+j.id+'" aria-pressed="false"><span><span class="n">'+esc(j.name)+'</span><span class="e">'+esc(j.english||"")+'</span></span><span class="p">'+(out?"Abhi khatam":"se "+rupee(minPrice(j)))+'</span></button></li>';
}).join("");
function paintMenu(sip, noGlass){
  var j = JUICE(cur), ink = onColor(j.color);
  menu.style.setProperty("--bg", j.color); menu.style.setProperty("--fg", ink);
  if(!noGlass) ensureGlass();
  glassVars();
  if(sip && menuSvg && !reduce){G.setFill(menuSvg,46,true); requestAnimationFrame(function(){requestAnimationFrame(function(){G.setFill(menuSvg,0)})}); G.slosh(menuSvg);}
  $$("#jlist .jrow").forEach(function(b){b.setAttribute("aria-pressed", b.dataset.id===cur?"true":"false")});
  var sizes = okSizes(j);
  if(!sizes.some(function(s){return s.id===curSize})) curSize = (sizes[1]||sizes[0]||{}).id;
  var out = j.available===false || !sizes.length, price = out ? 0 : j.prices[curSize]*qty;
  $("#detail").innerHTML =
    '<h3>'+esc(j.name)+(j.tag?'<span class="tag">'+esc(j.tag)+'</span>':'')+'</h3>'+
    '<p>'+esc(j.desc||"")+(j.ingredients?' <em>('+esc(j.ingredients)+')</em>':'')+'</p>'+
    '<div class="for">'+(j.for||[]).map(function(f){return '<span>'+(f==="gym"?"Gym ke liye":"Hospital ke liye")+'</span>'}).join("")+'</div>'+
    '<fieldset class="sizes"><legend class="sr">Size chuno</legend>'+sizes.map(function(s){return '<label class="size"><input type="radio" name="size" value="'+s.id+'"'+(s.id===curSize?" checked":"")+'><span><b>'+s.ml+' ml</b><i>'+rupee(j.prices[s.id])+'</i></span></label>'}).join("")+'</fieldset>'+
    '<div class="buyrow"><div class="stepper"><button type="button" data-q="-1" aria-label="Kam karo">−</button><output aria-live="polite">'+qty+'</output><button type="button" data-q="1" aria-label="Badhao">+</button></div><button class="btn solid" type="button" id="addBtn"'+(out?" disabled":"")+'>'+(out?"Abhi khatam":"Order mein jodo · "+rupee(price))+'</button></div>';
}
function selectJuice(id){cur=id; qty=1; paintMenu(true);}
$("#jlist").addEventListener("click", function(e){var b=e.target.closest(".jrow"); if(b) selectJuice(b.dataset.id);});
$("#detail").addEventListener("change", function(e){if(e.target.name==="size"){curSize=e.target.value; paintMenu(false);}});
$("#detail").addEventListener("click", function(e){
  var q=e.target.closest("[data-q]");
  if(q){qty=Math.max(1,Math.min(20,qty+Number(q.dataset.q))); paintMenu(false); return;}
  if(e.target.closest("#addBtn")){
    addToCart(cur,curSize,qty); toast(JUICE(cur).name+" order mein jud gaya"); qty=1; paintMenu(false);
    if(!reduce) $("#cartBtn").animate([{transform:"scale(1)"},{transform:"scale(1.18)"},{transform:"scale(1)"}],{duration:320});
  }
});
paintMenu(false,true);
if("IntersectionObserver" in window){
  new IntersectionObserver(function(en,ob){en.forEach(function(x){if(x.isIntersecting){ensureGlass();ob.disconnect()}})},{rootMargin:"500px 0px"}).observe(menu);
}else{ensureGlass();}

/* ================= race / places / hygiene / faq ================= */
var track=$("#track"); track.style.setProperty("--n", C.steps.length);
track.insertAdjacentHTML("beforeend", C.steps.map(function(s,i){return '<li class="step" style="--i:'+i+'"><div class="m">'+s.min+'<small>min</small></div><h3>'+esc(s.title)+'</h3><p>'+esc(s.text)+'</p></li>'}).join(""));

function placeHTML(key){
  var P=C.places[key], js=C.juices.filter(function(j){return j.available!==false && (j.for||[]).indexOf(key)>-1});
  return '<h2 class="disp">'+esc(P.title)+'</h2><p>'+esc(P.text)+'</p>'+
    (js.length?'<div class="pchips">'+js.map(function(j){return '<button class="chip" type="button" data-pick="'+j.id+'" style="--c:'+j.color+'"><i></i>'+esc(j.name)+'</button>'}).join("")+'</div>':'')+
    (P.plans||[]).map(function(p){return '<div class="plan"><div><h3>'+esc(p.name)+'</h3><span>'+esc(p.detail)+'</span></div><div><div class="price">'+rupee(p.price)+'</div><a href="tel:+91'+C.contact.phone+'">Plan ke liye call karo</a></div></div>'}).join("")+
    (P.note?'<p class="note">'+esc(P.note)+'</p>':'');
}
$("#hospital").innerHTML = placeHTML("hospital"); $("#gym").innerHTML = placeHTML("gym");
$("#places").addEventListener("click", function(e){var c=e.target.closest("[data-pick]"); if(!c) return; selectJuice(c.dataset.pick); menu.scrollIntoView({behavior:reduce?"auto":"smooth"});});

$("#hy").innerHTML = C.hygiene.map(function(h){return '<li><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="#0E3B2A"/><path d="M13 25l7 7 15-16" fill="none" stroke="#C8F03C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><div><h3>'+esc(h.title)+'</h3><p>'+esc(h.text)+'</p></div></li>'}).join("");

var areaName = mainZone ? mainZone.name : (A.city||"hamare area");
$("#faqList").innerHTML = (C.faq||[]).map(function(f){
  var a = f.a.replace(/\{area\}/g,areaName).replace(/\{radius\}/g,mainZone?mainZone.radiusKm:"").replace(/\{minutes\}/g,C.delivery.minutes);
  return '<details><summary>'+esc(f.q)+'</summary><p>'+esc(a)+'</p></details>';
}).join("");

/* ================= LOCATION (accurate) ================= */
var L = {status:"idle", lat:null, lng:null, acc:null, res:null};
var perm = "unknown", locBusy = null;
function setLoc(p, silent){
  L.lat=p.lat; L.lng=p.lng; L.acc=p.acc;
  L.res = areaOn ? F.zoneFor(C,p.lat,p.lng,p.acc) : {zone:null,dist:0,inside:true};
  L.status = L.res.inside ? "ok" : "out";
  try{sessionStorage.setItem("fr-loc", JSON.stringify({lat:p.lat,lng:p.lng,acc:p.acc,t:Date.now()}))}catch(e){}
  paintLoc();
}
function locate(){
  if(locBusy) return locBusy;
  locBusy = new Promise(function(resolve, reject){
    if(!navigator.geolocation){L.status="error"; paintLoc(); locBusy=null; return reject({code:0});}
    L.status="locating"; L.acc=null; paintLoc();
    var best=null, done=false, start=Date.now(), wid=0, to=0;
    function finish(){
      if(done) return; done=true; navigator.geolocation.clearWatch(wid); clearTimeout(to); locBusy=null;
      if(best){setLoc(best); resolve(best);} else {L.status = (L.status==="denied")?"denied":"error"; paintLoc(); reject({code:3});}
    }
    wid = navigator.geolocation.watchPosition(function(p){
      var c=p.coords; if(!best || c.accuracy<best.acc) best={lat:c.latitude,lng:c.longitude,acc:c.accuracy};
      L.acc=best.acc; paintLocLive();
      var t=Date.now()-start;
      if(best.acc<=25 || (best.acc<=60 && t>4500) || (best.acc<=150 && t>9000)) finish();
    }, function(err){
      if(done) return;
      if(err.code===1){L.status="denied"; done=true; navigator.geolocation.clearWatch(wid); clearTimeout(to); locBusy=null; paintLoc(); reject(err);}
    }, {enableHighAccuracy:true, maximumAge:0, timeout:20000});
    to = setTimeout(finish, 15000);
  });
  return locBusy;
}
function chipView(){
  var s=L.status;
  if(s==="locating") return {cls:"live", html:"<i></i>Location dhoondh rahe"+(L.acc?" · ±"+Math.round(L.acc)+" m":"")};
  if(s==="ok") return {cls:"ok", html:PIN+(L.res&&L.res.zone ? km(L.res.dist)+" door · delivery available" : "Location mil gayi")};
  if(s==="out") return {cls:"bad", html:PIN+km(L.res.dist)+" door · abhi area ke bahar"};
  if(s==="denied") return {cls:"bad", html:PIN+"Location band hai"};
  if(s==="error") return {cls:"", html:PIN+"Location nahi mili · dobara try"};
  return {cls:"", html:PIN+"Delivery area check karo"};
}
function paintChip(){var v=chipView(), c=$("#locChip"); c.className="pill "+v.cls; c.innerHTML=v.html;}
function paintLocLive(){paintChip(); if($("#locBox")) paintLocBox();}

function drawRadar(){
  var z = (L.res && L.res.zone) || mainZone; if(!z){$("#radar").innerHTML="";return;}
  var R=170, r2=z.radiusKm/2, you="";
  if(L.status==="ok"||L.status==="out"){
    var lat0=z.lat*Math.PI/180, dx=(L.lng-z.lng)*Math.cos(lat0)*111.32, dy=(L.lat-z.lat)*110.57;
    var k=R/z.radiusKm, px=dx*k, py=-dy*k, d=Math.sqrt(px*px+py*py), cap=R*1.22;
    if(d>cap){px*=cap/d; py*=cap/d;}
    var inside = L.status==="ok", col = inside?"#17703d":"#B3123A", ar=Math.max(9, Math.min(60,(L.acc||0)/1000*k));
    you='<g class="you" style="transform:translate('+px.toFixed(1)+'px,'+py.toFixed(1)+'px)"><circle r="'+ar.toFixed(0)+'" fill="'+col+'" fill-opacity=".18"/><circle r="9" fill="'+col+'" stroke="#fff" stroke-width="3"/><text y="-17" text-anchor="middle">Aap</text></g>';
  }
  $("#radar").innerHTML='<svg viewBox="-215 -215 430 430" aria-hidden="true"><circle class="zone" r="'+R+'"/><circle class="ring" r="'+(R/2)+'"/><circle class="pulse" r="'+R+'"/>'+
    '<text x="0" y="'+(-R-8)+'" text-anchor="middle">'+z.radiusKm+' km</text><text x="0" y="'+(-R/2-6)+'" text-anchor="middle">'+(+r2.toFixed(1))+' km</text><text x="0" y="-198" text-anchor="middle" opacity="0"></text>'+
    '<g transform="translate(0 0)"><circle r="17" fill="#0E3B2A"/><path d="M-8 0H8M0 -8V8" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>'+
    '<text y="36" text-anchor="middle">'+esc(z.name.length>26?z.name.slice(0,24)+"…":z.name)+'</text>'+you+'</svg>';
}
function paintAreaCard(){
  var s=L.status, el=$("#areaCard"), z=(L.res&&L.res.zone)||mainZone, R=z?z.radiusKm:0, h="";
  var low = L.acc && L.acc>150 ? '<p class="muted">GPS thoda kam sahi hai (±'+Math.round(L.acc)+' m). Pata zaroor likhna.</p>' : "";
  if(s==="ok") h='<b class="big">'+(L.res.zone?"Haan! Aap "+km(L.res.dist)+" door ho.":"Location mil gayi.")+'</b><p>'+(L.res.zone?"Delivery available hai. Aap "+esc(L.res.zone.name)+" ke "+R+" km ke andar ho.":"")+(L.acc?" Sahi hone ka andaaza ±"+Math.round(L.acc)+" m.":"")+'</p>'+low+'<div class="row"><button class="btn solid" type="button" data-act="order">Juice order karo</button><button class="btn" type="button" data-act="loc">Dobara check karo</button></div>';
  else if(s==="out") h='<b class="big">Aap abhi area ke bahar ho ('+km(L.res.dist)+').</b><p>Hum abhi sirf '+esc(z.name)+' ke '+R+' km mein delivery karte hain. Aur jagah jaldi jodenge.</p><div class="row"><a class="btn solid" href="tel:+91'+C.contact.phone+'">Call karke poochho</a><button class="btn" type="button" data-act="loc">Dobara check karo</button></div>';
  else if(s==="locating") h='<b class="big">Location dhoondh rahe hain…</b><p>GPS ko 5 se 10 second lag sakte hain. Khule mein jaldi milti hai.'+(L.acc?" Abhi sahi hone ka andaaza ±"+Math.round(L.acc)+" m.":"")+'</p>';
  else if(s==="denied") h='<b class="big">Location band hai.</b><p>Phone ya browser ki settings mein is site ke liye <b>Location → Allow</b> kar do, phir dobara dabao.</p><div class="row"><button class="btn solid" type="button" data-act="loc">Dobara try karo</button></div>';
  else if(s==="error") h='<b class="big">Location nahi mili.</b><p>Bahar khule mein ya GPS on karke dobara try karo.</p><div class="row"><button class="btn solid" type="button" data-act="loc">Dobara try karo</button></div>';
  else h='<b class="big">Kya aap hamare area mein ho?</b><p>Ek tap mein pata chal jayega. Location sirf aapke order ke liye use hoti hai.</p><div class="row"><button class="btn solid" type="button" data-act="loc">Meri location check karo</button></div>';
  el.innerHTML = h;
}
function paintLoc(){paintChip(); paintAreaCard(); drawRadar(); if($("#locBox")) paintLocBox();}
$("#areaCard").addEventListener("click", function(e){
  var b=e.target.closest("[data-act]"); if(!b) return;
  if(b.dataset.act==="loc") locate().catch(function(){});
  if(b.dataset.act==="order") openSheet();
});
$("#locChip").addEventListener("click", function(){
  if(L.status==="ok"||L.status==="out"){$("#area").scrollIntoView({behavior:reduce?"auto":"smooth"}); return;}
  if(L.status==="denied"){toast("Browser settings mein Location allow karo, phir dobara dabao",4200);}
  locate().catch(function(){});
});

/* location card (app khulte hi) */
var card=$("#locCard");
$("#locP").textContent = areaOn ? "Taaki hum dekh sakein ki aap hamare "+(mainZone.radiusKm)+" km ke delivery area mein ho aur juice sahi jagah pahunche. Location sirf aapke order ke liye use hoti hai." : "Taaki juice sahi jagah pahunche. Location sirf aapke order ke liye use hoti hai.";
$("#locAllow").addEventListener("click", function(){card.hidden=true; locate().catch(function(){});});
$("#locLater").addEventListener("click", function(){card.hidden=true; try{sessionStorage.setItem("fr-skip","1")}catch(e){}});
function bootLocation(){
  var saved=null; try{saved=JSON.parse(sessionStorage.getItem("fr-loc")||"null")}catch(e){}
  if(saved && Date.now()-saved.t < 20*60*1000){setLoc(saved); return;}
  var skip=false; try{skip=sessionStorage.getItem("fr-skip")==="1"}catch(e){}
  function decide(){
    if(perm==="granted") locate().catch(function(){});
    else if(perm==="denied"){L.status="denied"; paintLoc();}
    else if(!skip){card.hidden=false;}
  }
  if(navigator.permissions && navigator.permissions.query){
    navigator.permissions.query({name:"geolocation"}).then(function(p){
      perm=p.state; decide();
      p.onchange=function(){perm=p.state; if(p.state==="granted" && L.status!=="ok" && L.status!=="out") locate().catch(function(){}); else if(p.state==="denied"){L.status="denied"; paintLoc();}};
    }).catch(function(){decide()});
  }else decide();
}
paintLoc();
setTimeout(bootLocation, 1300);

/* ================= CART + ORDER SHEET ================= */
var cart=[], cpState={code:"",discount:0,msg:""}, busy=false, clockTimer=0, lastFail=null;
try{cart=(JSON.parse(localStorage.getItem("freshers-cart")||"[]")||[]).filter(function(i){var j=JUICE(i.j);return j&&j.available!==false&&SIZE(i.s)&&j.prices[i.s]!=null&&i.q>0})}catch(e){cart=[]}
function saveCart(){try{localStorage.setItem("freshers-cart",JSON.stringify(cart))}catch(e){}}
function addToCart(j,s,q){var f=cart.filter(function(i){return i.j===j&&i.s===s})[0]; if(f) f.q=Math.min(50,f.q+q); else cart.push({j:j,s:s,q:q}); saveCart(); paintCart();}
function totals(){
  var sub=cart.reduce(function(t,i){return t+JUICE(i.j).prices[i.s]*i.q},0);
  var cp={ok:!!cpState.code, discount:Math.min(cpState.discount||0,sub), code:cpState.code, msg:cpState.msg};
  var d=C.delivery, after=sub-cp.discount, fee=(sub&&d.freeAbove>0&&after>=d.freeAbove)?0:(sub?(d.fee||0):0);
  return {sub:sub, disc:cp.discount, cp:cp, fee:fee, total:after+fee, count:cart.reduce(function(t,i){return t+i.q},0)};
}
function postJSON(url,body){return fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}).then(function(r){return r.json()});}
var cpTimer=0;
function recheckCoupon(){
  if(!cpState.code) return; clearTimeout(cpTimer);
  cpTimer=setTimeout(function(){
    if(!cart.length){cpState={code:"",discount:0,msg:""}; return;}
    postJSON("/api/coupon",{code:cpState.code,items:cart.map(function(i){return {j:i.j,s:i.s,q:i.q}})}).then(function(d){
      cpState = d&&d.ok ? {code:d.code,discount:d.discount,msg:d.msg||"Coupon laga"} : {code:"",discount:0,msg:""};
      if($("#sheet").open && $("#cartLines")) paintSheet(true);
    }).catch(function(){});
  },350);
}
function paintCart(){
  var t=totals(); $("#cartBtn").textContent = t.count ? "Order · "+t.count+" · "+rupee(t.total) : "Order";
  if($("#sheet").open && $("#cartLines")) paintSheet(true);
  recheckCoupon();
}
var sheet=$("#sheet");
function sv(){try{return JSON.parse(localStorage.getItem("freshers-info")||"{}")}catch(e){return {}}}
function fv(id){var e=$("#"+id); return e?e.value:""}
function outMsg(){var z=L.res&&L.res.zone; return z ? "Aap "+km(L.res.dist)+" door ho. Abhi sirf "+z.name+" ke "+z.radiusKm+" km mein delivery hai." : "Aap hamare delivery area ke bahar ho.";}

function locBoxHTML(){
  var s=L.status;
  if(!areaOn && s==="idle") return '<div class="locbox"><b>Location (optional)</b><span>Location bhejoge to delivery tez hogi.</span><button class="btn" type="button" data-act="loc">'+PIN+'Meri location bhejo</button></div>';
  if(s==="ok") return '<div class="locbox ok"><b>Location mil gayi'+(L.res&&L.res.zone?" · "+km(L.res.dist)+" door":"")+'</b><span>Delivery area mein ho'+(L.acc?" · sahi hone ka andaaza ±"+Math.round(L.acc)+" m":"")+'.</span><button class="btn" type="button" data-act="loc">Dobara lo</button></div>';
  if(s==="out") return '<div class="locbox bad"><b>Aap area ke bahar ho</b><span>'+esc(outMsg())+'</span><button class="btn" type="button" data-act="loc">Dobara check karo</button></div>';
  if(s==="locating") return '<div class="locbox"><b>Location dhoondh rahe hain…</b><span>'+(L.acc?"±"+Math.round(L.acc)+" m tak sahi":"Thoda ruko")+'</span></div>';
  if(s==="denied") return '<div class="locbox bad"><b>Location ki permission band hai</b><span>Delivery ke liye Location allow karna zaroori hai. Phone/browser settings mein allow karo.</span><button class="btn" type="button" data-act="loc">Dobara try karo</button></div>';
  return '<div class="locbox"><b>Apni location bhejo</b><span>Isse hum dekhte hain ki aap delivery area mein ho aur rider seedha aap tak pahunche.</span><button class="btn" type="button" data-act="loc">'+PIN+'Meri location bhejo</button></div>';
}
function paintLocBox(){var b=$("#locBox"); if(!b) return; b.innerHTML=locBoxHTML();}

function paintSheet(keep){
  clearInterval(clockTimer);
  var body=$("#sheetBody");
  if(!cart.length){
    var last=null; try{last=JSON.parse(localStorage.getItem("fr-last")||"null")}catch(e){}
    body.innerHTML='<div class="empty"><p>Abhi kuch nahi chuna. Menu se juice jodo.</p><button class="btn solid" type="button" id="goMenu">Menu dekho</button>'+(last&&last.items&&last.items.length?'<button class="btn" type="button" id="reorder">Pichhla order dobara</button>':'')+'</div>';
    return;
  }
  var t=totals(), d=C.delivery, low=d.minOrder>0&&(t.sub-t.disc)<d.minOrder, s0=sv();
  var kp=keep?{name:fv("fName"),phone:fv("fPhone"),place:fv("fPlace"),addr:fv("fAddr"),pay:fv("fPay"),when:fv("fWhen"),note:fv("fNote"),cp:fv("fCoupon")}:null;
  var v=function(k){return kp&&kp[k]!=null?kp[k]:(s0[k]||"")};
  var pays=(C.orders&&C.orders.payments)||["Cash on delivery"], slots=(C.orders&&C.orders.slots)||[];
  body.innerHTML=
    '<div id="cartLines">'+cart.map(function(i,ix){var j=JUICE(i.j),s=SIZE(i.s);return '<div class="line" style="--c:'+j.color+'"><span class="dot"></span><div><b>'+esc(j.name)+'</b><small>'+s.ml+' ml · '+rupee(j.prices[i.s])+'</small></div><div class="stepper"><button type="button" data-ci="'+ix+'" data-d="-1" aria-label="Kam karo">−</button><output>'+i.q+'</output><button type="button" data-ci="'+ix+'" data-d="1" aria-label="Badhao">+</button></div></div>'}).join("")+'</div>'+
    '<form id="orderForm" novalidate style="display:grid;gap:1rem">'+
      '<div><div class="cp"><input id="fCoupon" placeholder="Coupon code (agar hai)" autocapitalize="characters" value="'+esc(kp?kp.cp:cpState.code)+'" aria-label="Coupon code" style="font:500 1rem var(--body);min-height:3rem;padding:.75rem 1rem;border:2px solid var(--leaf);border-radius:16px;background:#fff;color:var(--leaf);width:100%"><button class="btn" type="button" id="cpBtn">Lagao</button></div><p class="cpmsg'+(cpState.code?" ok":"")+'" id="cpMsg">'+(cpState.code?esc(cpState.msg):"")+'</p></div>'+
      '<div class="sum"><div><span>Juice</span><span>'+rupee(t.sub)+'</span></div>'+(t.disc?'<div class="off"><span>Coupon '+esc(t.cp.code)+'</span><span>−'+rupee(t.disc)+'</span></div>':'')+'<div><span>Delivery</span><span>'+(t.fee?rupee(t.fee):"Free")+'</span></div><div class="tot"><span>Total</span><span>'+rupee(t.total)+'</span></div></div>'+
      '<div id="locBox">'+locBoxHTML()+'</div>'+
      '<div class="two"><label class="fld" id="wName">Aapka naam<input id="fName" autocomplete="name" value="'+esc(v("name"))+'"></label><label class="fld" id="wPhone">Mobile number<input id="fPhone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="14" placeholder="10 digit" value="'+esc(v("phone"))+'"></label></div>'+
      '<div class="two"><label class="fld">Delivery kahan?<select id="fPlace">'+["Hospital","Gym","Ghar","Office","Aur kahin"].map(function(p){return '<option'+(v("place")===p?" selected":"")+'>'+p+'</option>'}).join("")+'</select></label><label class="fld">Kab chahiye?<select id="fWhen">'+slots.map(function(p){return '<option'+(v("when")===p?" selected":"")+'>'+esc(p)+'</option>'}).join("")+'</select></label></div>'+
      '<label class="fld" id="wAddr">Pata, ward ya room number<textarea id="fAddr" rows="2" autocomplete="street-address" placeholder="Jaise: Ward 3, Bed 12, 2nd floor">'+esc(v("addr"))+'</textarea></label>'+
      '<div class="two"><label class="fld">Payment<select id="fPay">'+pays.map(function(p){return '<option'+(v("pay")===p?" selected":"")+'>'+esc(p)+'</option>'}).join("")+'</select></label><label class="fld">Koi khaas baat?<input id="fNote" placeholder="bina cheeni, kam baraf…" value="'+esc(v("note"))+'"></label></div>'+
      (low?'<p class="msg">Kam se kam order '+rupee(d.minOrder)+' ka hona chahiye.</p>':'')+
      '<p class="msg" id="formMsg" role="alert"></p>'+
      '<div class="sheet-foot"><button class="btn solid" type="submit" id="sendBtn"'+(low?" disabled":"")+'>Order bhejo · '+rupee(t.total)+'</button><a class="btn" href="tel:+91'+C.contact.phone+'">Call karke order do</a></div>'+
    '</form>';
}
function openSheet(){busy=false; paintSheet(false); if(!sheet.open) sheet.showModal();}
$("#cartBtn").addEventListener("click", openSheet);
$("#orderBig").addEventListener("click", function(){ if(cart.length) openSheet(); else {menu.scrollIntoView({behavior:reduce?"auto":"smooth"}); toast("Pehle juice chuno, phir order karo");} });
$("#sheetX").addEventListener("click", function(){sheet.close()});
sheet.addEventListener("close", function(){clearInterval(clockTimer)});
sheet.addEventListener("click", function(e){if(e.target===sheet) sheet.close()});

function unbusy(btn,total){busy=false; btn.disabled=false; btn.textContent="Order bhejo · "+rupee(total);}
function showDone(order){
  var body=$("#sheetBody"), mins=(C.delivery&&C.delivery.minutes)||20, end=Date.now()+mins*60000;
  body.innerHTML='<div class="done"><div class="tick"><svg viewBox="0 0 48 48" fill="none" stroke="#0E3B2A" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 25l9 9 18-20"/></svg></div>'+
    '<h3>Order mil gaya!</h3><span class="oid">#'+esc(order.id)+'</span><p>Hum juice bana rahe hain. Ye time ghoomta rahega:</p><div class="clock" id="clock">'+mins+':00</div>'+
    '<div class="recap">'+order.items.map(function(i){return '<div><span>'+esc(i.name)+' '+i.ml+' ml × '+i.q+'</span><b>'+rupee(i.line)+'</b></div>'}).join("")+(order.discount?'<div><span>Coupon '+esc(order.coupon)+'</span><b>−'+rupee(order.discount)+'</b></div>':'')+'<div><span>Total ('+esc(order.customer.pay||"")+')</span><b>'+rupee(order.total)+'</b></div></div>'+
    '<a class="btn" href="tel:+91'+C.contact.phone+'">Call karo</a><button class="btn lime" type="button" id="shareDone">Dost ko bhi bata do</button><button class="btn" type="button" id="newOrder">Naya order</button></div>';
  clearInterval(clockTimer);
  clockTimer=setInterval(function(){var left=Math.max(0,Math.round((end-Date.now())/1000)), el=$("#clock"); if(!el){clearInterval(clockTimer);return;} el.textContent=Math.floor(left/60)+":"+String(left%60).padStart(2,"0"); if(!left) clearInterval(clockTimer);},1000);
}
function showFail(order, why){
  var body=$("#sheetBody"), wa=C.orders&&C.orders.showWhatsAppBackup;
  body.innerHTML='<div class="done"><div class="tick bad"><svg viewBox="0 0 48 48" fill="none" stroke="#B3123A" stroke-width="5.5" stroke-linecap="round" aria-hidden="true"><path d="M14 14l20 20M34 14L14 34"/></svg></div>'+
    '<h3>Order nahi ja paya</h3><p>Net ya server mein dikkat aayi. Aapka cart safe hai. Dobara try karo ya seedha call karo.</p>'+
    '<button class="btn solid" type="button" id="retry">Dobara try karo</button><a class="btn" href="tel:+91'+C.contact.phone+'">Call karke order do</a>'+
    (wa?'<a class="btn wa" href="'+waLink(F.message(C,order))+'" target="_blank" rel="noopener">WhatsApp se bhejo (backup)</a>':'')+
    (why?'<p class="muted">('+esc(why)+')</p>':'')+'</div>';
}
function share(){
  var data={title:C.brand.name,text:(C.brand.hook||"")+" "+C.brand.tagline+" Hospital aur gym tak 20 minute mein.",url:SITE};
  if(navigator.share){navigator.share(data).catch(function(){});}
  else if(navigator.clipboard){navigator.clipboard.writeText(SITE).then(function(){toast("Link copy ho gaya. Ab kisi ko bhi bhej do")});}
  else toast(SITE,5000);
}
$("#shareBtn").addEventListener("click", share);

async function submitOrder(){
  if(busy) return;
  var msg=$("#formMsg"), btn=$("#sendBtn"), t=totals();
  $$(".fld.err").forEach(function(e){e.classList.remove("err")}); msg.textContent="";
  var name=fv("fName").trim(), phone=F.tenDigits(fv("fPhone")), addr=fv("fAddr").trim();
  function bad(w,m){msg.textContent=m; var wr=$("#"+w); if(wr){wr.classList.add("err"); var i=$("input,textarea",wr); if(i) i.focus();}}
  if(name.length<2) return bad("wName","Apna naam likhein");
  if(!/^[6-9]\d{9}$/.test(phone)) return bad("wPhone","Sahi 10 digit mobile number likhein");
  if(addr.length<3) return bad("wAddr","Pata, ward ya room number likhein");
  busy=true; btn.disabled=true; btn.innerHTML='<span class="sp"></span> Ek minute…';
  var need = areaOn && A.requireLocation;
  if(need && L.status!=="ok"){
    if(L.status!=="out"){ btn.innerHTML='<span class="sp"></span> Location le rahe hain…'; try{await locate()}catch(e){} }
    if(L.status==="denied"){msg.textContent="Delivery ke liye location zaroori hai. Phone ya browser settings mein Location allow karo, phir dobara dabao."; return unbusy(btn,t.total);}
    if(L.status==="out"){msg.textContent=outMsg(); return unbusy(btn,t.total);}
    if(L.status!=="ok"){msg.textContent="Location nahi mil paayi. Bahar khule mein ya GPS on karke dobara try karo."; return unbusy(btn,t.total);}
  }
  var raw={id:"FR-"+String(Date.now()%100000).padStart(5,"0"), website:"", coupon:cpState.code,
    items:cart.map(function(i){return {j:i.j,s:i.s,q:i.q}}),
    customer:{name:name,phone:phone,place:fv("fPlace"),addr:addr,note:fv("fNote"),pay:fv("fPay"),when:fv("fWhen")},
    loc:(L.status==="ok"||L.status==="out")?{lat:L.lat,lng:L.lng,acc:L.acc}:null};
  var order;
  try{order=F.normalize(C,raw,{noCoupon:true}); if(cpState.code){order.coupon=cpState.code; order.discount=Math.min(cpState.discount,order.sub); order.total=order.sub-order.discount+order.fee;}}catch(e){msg.textContent=e.message; return unbusy(btn,t.total);}
  try{localStorage.setItem("freshers-info",JSON.stringify({name:name,phone:phone,place:order.customer.place,addr:addr,pay:order.customer.pay,when:order.customer.when}))}catch(x){}
  btn.innerHTML='<span class="sp"></span> Order bhej rahe hain…';
  var delivered=false, why="";
  try{
    var r=await fetch("/api/order",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(raw),keepalive:true});
    var d=await r.json().catch(function(){return {}});
    if(r.status===400||r.status===429){msg.textContent=d.error||"Order nahi gaya, dobara try karein."; return unbusy(btn,t.total);}
    delivered=!!(d&&d.delivered); why=d&&d.why||"";
  }catch(e){why="net/server se jawab nahi aaya";}
  busy=false;
  if(delivered){
    try{localStorage.setItem("fr-last",JSON.stringify({items:raw.items}))}catch(x){}
    cart=[]; cpState={code:"",discount:0,msg:""}; saveCart(); paintCart(); showDone(order);
  }else{ showFail(order, why); lastFail=order; }
}
$("#sheetBody").addEventListener("submit", function(e){e.preventDefault(); submitOrder();});
$("#sheetBody").addEventListener("click", function(e){
  var t=e.target;
  if(t.closest("#goMenu")){sheet.close(); menu.scrollIntoView({behavior:reduce?"auto":"smooth"}); return;}
  if(t.closest("#reorder")){try{var l=JSON.parse(localStorage.getItem("fr-last")||"null"); (l.items||[]).forEach(function(i){if(JUICE(i.j)&&SIZE(i.s)&&JUICE(i.j).prices[i.s]!=null&&JUICE(i.j).available!==false) cart.push({j:i.j,s:i.s,q:i.q})}); saveCart(); paintCart(); paintSheet(false);}catch(x){} return;}
  if(t.closest("[data-act='loc']")){locate().catch(function(){}); return;}
  if(t.closest("#cpBtn")){
    var code=fv("fCoupon").trim(), m=$("#cpMsg");
    if(!code){cpState={code:"",discount:0,msg:""}; paintSheet(true); return;}
    m.className="cpmsg"; m.textContent="Check kar rahe hain…";
    postJSON("/api/coupon",{code:code,items:cart.map(function(i){return {j:i.j,s:i.s,q:i.q}})}).then(function(d){
      if(d&&d.ok){cpState={code:d.code,discount:d.discount,msg:d.msg||"Coupon laga"}; paintSheet(true);}
      else{cpState={code:"",discount:0,msg:""}; m.className="cpmsg bad"; m.textContent=(d&&d.msg)||"Ye coupon sahi nahi hai";}
    }).catch(function(){m.className="cpmsg bad"; m.textContent="Abhi coupon check nahi ho paya";});
    return;
  }
  if(t.closest("#retry")){paintSheet(false); return;}
  if(t.closest("#newOrder")){sheet.close(); menu.scrollIntoView({behavior:reduce?"auto":"smooth"}); return;}
  if(t.closest("#shareDone")){share(); return;}
  var b=t.closest("[data-ci]");
  if(b){var it=cart[+b.dataset.ci]; it.q+=Number(b.dataset.d); if(it.q<=0) cart.splice(+b.dataset.ci,1); saveCart(); paintCart();}
});
paintCart();

/* ================= install, SW, observers, SEO ================= */
var deferred=null;
window.addEventListener("beforeinstallprompt", function(e){e.preventDefault(); deferred=e; $("#installBtn").hidden=false;});
$("#installBtn").addEventListener("click", function(){ if(!deferred) return; deferred.prompt(); deferred.userChoice.finally(function(){deferred=null; $("#installBtn").hidden=true;}); });
window.addEventListener("appinstalled", function(){$("#installBtn").hidden=true; toast("App install ho gayi!");});
if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})});}

try{
  var ld={"@context":"https://schema.org","@type":"FoodEstablishment","name":C.brand.name,"description":C.brand.intro,"telephone":"+91"+C.contact.phone,"url":SITE,"image":SITE+"/assets/logo.webp","servesCuisine":"Fresh fruit juice","priceRange":"₹","areaServed":A.city||"","hasMenu":SITE};
  var s=document.createElement("script"); s.type="application/ld+json"; s.textContent=JSON.stringify(ld); document.head.appendChild(s);
}catch(e){}

if("IntersectionObserver" in window){
  var raceEl=$("#race");
  new IntersectionObserver(function(en,ob){en.forEach(function(x){if(x.isIntersecting){raceEl.classList.add("go");ob.disconnect()}})},{threshold:.35}).observe(raceEl);
  var links=$$(".dock a[data-sec]");
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){links.forEach(function(a){a.classList.toggle("on",a.dataset.sec===x.target.id)})}})},{rootMargin:"-45% 0px -50% 0px"});
  ["menu","race","places","area","order"].forEach(function(id){io.observe(document.getElementById(id))});
  var ao=new IntersectionObserver(function(en){en.forEach(function(x){x.target.classList.toggle("off",!x.isIntersecting)})},{rootMargin:"80px"});
  $$("[data-ao]").forEach(function(el){ao.observe(el)});
}else{raceEl&&0; $("#race").classList.add("go");}
})();
