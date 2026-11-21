(() => {
"use strict";
const arena = document.getElementById("arena");
const progressEl = document.getElementById("progress");
const timerEl = document.getElementById("timer");
const starTrack = document.getElementById("starTrack");
const result = document.getElementById("result");
const resultText = document.getElementById("resultText");
const mistakesText = document.getElementById("mistakes");
const speedConfig = {turtle:0.22,horse:0.42,cheetah:0.68};
const colors = ["#ffb8c8","#a9d9ff","#ffe49b","#c9f0cb","#d9c5ff","#ffc99f","#aeece8"];
// Allowed non-prime labels; 3 and 7 are explicit exceptions.
const isAllowedLabel = n => ![2,5,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97].includes(n) || n===3 || n===7;
let table=3, speed="horse", bubbles=[], caught=new Set(), errors=[], startedAt=0, elapsed=0, running=false, raf=0, last=0, spawnClock=0, nextId=1;
const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
function rowResults(t){return Array.from({length:10},(_,i)=>t*(i+1));}
function validDistractors(targets){
  const set=new Set(targets), out=[];
  for(let n=1;n<=90;n++) if(!set.has(n)&&isAllowedLabel(n)) out.push(n);
  return out;
}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
function clear(){bubbles.forEach(b=>b.el.remove());bubbles=[];arena.innerHTML="";starTrack.innerHTML="";}
function start(reset=true){
  cancelAnimationFrame(raf);clear();result.hidden=true;
  if(reset){caught=new Set();errors=[];elapsed=0;startedAt=performance.now();running=true;}
  progressEl.textContent=`${caught.size} / 10`;timerEl.textContent=fmt(elapsed);
  const targets=rowResults(table);
  const distractors=validDistractors(targets);
  // Begin with at least 8 bubbles, exactly 3 of them correct targets.
  const initial=targets.filter(n=>!caught.has(n)).sort(()=>Math.random()-.5).slice(0,3);
  while(initial.length<3) initial.push(pick(targets.filter(n=>!caught.has(n))));
  initial.forEach(n=>addBubble(n,true));
  while(bubbles.length<8) addBubble(pick(distractors),false);
  last=performance.now();spawnClock=0;raf=requestAnimationFrame(tick);
}
function addBubble(value,correct){
  const el=document.createElement("button");el.type="button";el.className="bubble";
  el.textContent=value;el.setAttribute("aria-label",`Ergebnis ${value}`);
  const rect=arena.getBoundingClientRect(), size=Math.min(94,Math.max(54,rect.height*.12));
  const x=size/2+Math.random()*Math.max(1,rect.width-size), y=size/2+Math.random()*Math.max(1,rect.height-size);
  const angle=Math.random()*Math.PI*2, base=speedConfig[speed];
  const b={id:nextId++,value,correct,el,x,y,vx:Math.cos(angle)*base*(.65+Math.random()*.7),vy:Math.sin(angle)*base*(.65+Math.random()*.7),size};
  el.style.left=x+"px";el.style.top=y+"px";el.style.background=colors[Math.floor(Math.random()*colors.length)];
  el.addEventListener("click",()=>tap(b));arena.appendChild(el);bubbles.push(b);
}
function tap(b){
  if(!running||!bubbles.includes(b))return;
  if(rowResults(table).includes(b.value)&&!caught.has(b.value)){
    caught.add(b.value);b.el.classList.add("pop");
    const star=document.createElement("span");star.className="star";star.textContent="⭐";
    star.style.left=b.x+"px";star.style.top=b.y+"px";arena.appendChild(star);
    setTimeout(()=>star.remove(),520);
    // The persistent success star is added in the order the facts are caught.
    const earned=document.createElement("span");earned.className="track-star";earned.textContent="⭐";
    earned.setAttribute("aria-label",`Ergebnis ${b.value} gefangen`);starTrack.appendChild(earned);
    setTimeout(()=>{if(b.el.isConnected)b.el.remove();},240);
    bubbles=bubbles.filter(x=>x!==b);
    progressEl.textContent=`${caught.size} / 10`;
    // Maintain minimum bubble count and replenish correct bubbles from uncaught facts.
    maintainTargets();
    if(caught.size===10)finish();
  }else{
    errors.push(b.value);b.el.animate([{filter:"brightness(1)"},{filter:"brightness(1.8)"},{filter:"brightness(1)"}],{duration:280});
  }
}
function maintainTargets(){
  const remaining=rowResults(table).filter(n=>!caught.has(n));
  const existing=new Set(bubbles.filter(b=>b.correct).map(b=>b.value));
  while([...existing].length<Math.min(3,remaining.length)){
    const n=pick(remaining.filter(v=>!existing.has(v)));if(n==null)break;addBubble(n,true);existing.add(n);
  }
  while(bubbles.length<8)addBubble(pick(validDistractors(rowResults(table))),false);
}
function tick(now){
  if(!running)return;
  const dt=Math.min(40,now-last);last=now;elapsed=(now-startedAt)/1000;timerEl.textContent=fmt(elapsed);
  const r=arena.getBoundingClientRect();
  bubbles.forEach(b=>{
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    const min=b.size/2,maxX=r.width-b.size/2,maxY=r.height-b.size/2;
    if(b.x<min||b.x>maxX)b.vx*=-1;if(b.y<min||b.y>maxY)b.vy*=-1;
    b.x=Math.max(min,Math.min(maxX,b.x));b.y=Math.max(min,Math.min(maxY,b.y));
    b.el.style.left=b.x+"px";b.el.style.top=b.y+"px";
  });
  // Gentle replacement keeps the arena lively while preserving 8+ bubbles.
  spawnClock+=dt;if(spawnClock>1250){spawnClock=0;maintainTargets();}
  raf=requestAnimationFrame(tick);
}
function finish(){
  running=false;cancelAnimationFrame(raf);elapsed=(performance.now()-startedAt)/1000;timerEl.textContent=fmt(elapsed);
  resultText.textContent=`Du hast alle 10 Ergebnisse in ${fmt(elapsed)} gefangen.`;
  mistakesText.textContent=errors.length?`Falsche Treffer: ${errors.join(", ")} (${errors.length} ${errors.length===1?"Fehler":"Fehler"})`:"Keine falschen Treffer – großartig!";
  result.hidden=false;
  // Adapter hook for later DENKAVO integration: event only, no network/storage.
  window.dispatchEvent(new CustomEvent("denkavo:game-complete",{detail:{game:"seifenblasen",table,elapsedSeconds:Math.round(elapsed*100)/100,wrongValues:[...errors],wrongCount:errors.length,correctCount:10}}));
}
function changeTable(t){table=t;document.querySelectorAll(".table-btn").forEach(b=>b.classList.toggle("active",Number(b.dataset.table)===t));start(true);}
document.getElementById("tables").addEventListener("click",e=>{const b=e.target.closest("[data-table]");if(b)changeTable(Number(b.dataset.table));});
document.querySelector(".speeds").addEventListener("click",e=>{const b=e.target.closest("[data-speed]");if(!b)return;speed=b.dataset.speed;document.querySelectorAll(".speed-btn").forEach(x=>x.classList.toggle("active",x===b));bubbles.forEach(x=>{const a=Math.atan2(x.vy,x.vx);x.vx=Math.cos(a)*speedConfig[speed];x.vy=Math.sin(a)*speedConfig[speed];});});
document.getElementById("restart").addEventListener("click",()=>start(true));
document.getElementById("again").addEventListener("click",()=>start(true));
window.addEventListener("resize",()=>{if(running){bubbles.forEach(b=>{const r=arena.getBoundingClientRect();b.x=Math.min(b.x,r.width-b.size/2);b.y=Math.min(b.y,r.height-b.size/2);});}});
start();
})();