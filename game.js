(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const playArea = $('playArea'), bubbleLayer = $('bubbleLayer'), starLayer = $('starLayer');
  const tables = [3,4,6,7,8,9];
  const speeds = { turtle: 48, horse: 94, cheetah: 158 };
  const colors = ['#a9e9fa','#c6e9ff','#e0d5ff','#b9f1d5','#ffe1a9','#ffc9e4','#c8f0ed','#d6e4ff','#f8d7ff'];
  const state = { table:3, speed:'horse', bubbles:[], captured:new Set(), mistakes:[], startedAt:0, elapsed:0, running:true, completed:false, lastTime:0, raf:0, nextId:1, starOrder:[] };
  const rand = (min,max) => Math.random()*(max-min)+min;
  const product = n => state.table*n;
  const formatTime = ms => { const s=Math.floor(ms/1000); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };
  function updateProgress(){ $('progress').textContent=`${state.captured.size} von 10 Sternen`; $('progressFill').style.width=`${state.captured.size*10}%`; }
  function makeBubble(value, correct){
    const el=document.createElement('button'); el.type='button'; el.className='bubble'; el.textContent=value; el.setAttribute('aria-label',`${value}${correct?', richtiges Ergebnis':''}`);
    const c=colors[Math.floor(Math.random()*colors.length)]; el.style.background=`radial-gradient(circle at 30% 25%,#fff 0 5%,${c} 20%,${c} 62%,#78b9e4 100%)`;
    const rect=playArea.getBoundingClientRect(), size=Math.min(90,Math.max(55,rect.width*.07));
    const b={id:state.nextId++,value,correct,el,x:rand(8,Math.max(9,rect.width-size-8)),y:rand(8,Math.max(9,rect.height-size-8)),vx:rand(-1,1)||.5,vy:rand(-1,1)||.5,size};
    const norm=Math.hypot(b.vx,b.vy)||1;b.vx/=norm;b.vy/=norm;
    el.addEventListener('click',()=>catchBubble(b)); bubbleLayer.appendChild(el); state.bubbles.push(b); drawBubble(b); return b;
  }
  function drawBubble(b){b.el.style.transform=`translate3d(${b.x}px,${b.y}px,0)`;}
  function activeCorrectValues(){return new Set(state.bubbles.filter(b=>b.correct).map(b=>b.value));}
  function ensureBubbles(){
    if(!state.running||state.completed)return;
    const present=activeCorrectValues();
    const missing=[];for(let n=1;n<=10;n++){const v=product(n);if(!state.captured.has(v)&&!present.has(v))missing.push(v);}
    while(state.bubbles.filter(b=>b.correct).length<3&&missing.length){const i=Math.floor(Math.random()*missing.length);makeBubble(missing.splice(i,1)[0],true);}
    while(state.bubbles.length<8){let value;const products=new Set(Array.from({length:10},(_,i)=>product(i+1)));do{value=Math.floor(rand(1,Math.max(10,state.table*10+1)));}while(products.has(value)||state.bubbles.some(b=>b.value===value));makeBubble(value,false);}
  }
  function catchBubble(b){if(!state.running||state.completed||!state.bubbles.includes(b))return;
    if(b.correct&&!state.captured.has(b.value)){state.captured.add(b.value);state.starOrder.push(b.value);showBurstStar(b);b.el.classList.add('pop');setTimeout(()=>{removeBubble(b);if(state.captured.size===10)finish();else ensureBubbles();},300);updateProgress();}
    else{state.mistakes.push({value:b.value,at:performance.now()-state.startedAt});b.el.animate([{transform:`translate3d(${b.x}px,${b.y}px,0) scale(1)`},{transform:`translate3d(${b.x}px,${b.y}px,0) scale(.88)`},{transform:`translate3d(${b.x}px,${b.y}px,0) scale(1)`}],{duration:170});}
  }
  function showBurstStar(b){const s=document.createElement('div');s.className='burst-star';s.textContent='★';s.setAttribute('aria-label',`Stern ${b.value}`);s.style.left=`${b.x+b.size/2-22}px`;s.style.top=`${b.y+b.size/2-24}px`;s.innerHTML=`★<span>${b.value}</span>`;playArea.appendChild(s);setTimeout(()=>s.remove(),1250);}
  function removeBubble(b){const i=state.bubbles.indexOf(b);if(i>=0)state.bubbles.splice(i,1);b.el.remove();}
  function finish(){state.completed=true;state.running=false;state.elapsed=performance.now()-state.startedAt;state.bubbles.forEach(b=>b.el.remove());state.bubbles=[];starLayer.innerHTML='';
    const rect=playArea.getBoundingClientRect(), size=Math.min(65,Math.max(42,rect.width*.052)), gap=Math.min(size+5,(rect.width-24)/10), total=gap*10-size, start=(rect.width-total)/2;
    // Reveal in answer order, then keep all ten stars anchored along the lower edge.
    state.starOrder.forEach((value,i)=>{setTimeout(()=>{const s=document.createElement('div');s.className='star';s.style.left=`${start+i*gap}px`;s.style.width=`${size}px`;s.style.height=`${size}px`;s.innerHTML=`★<span>${value}</span>`;starLayer.appendChild(s);},i*160);});
    setTimeout(()=>{$('finalTime').textContent=`Zeit: ${formatTime(state.elapsed)}`;$('mistakes').textContent=`Falsch angetippt: ${state.mistakes.length}${state.mistakes.length?` · ${state.mistakes.map(m=>m.value).join(', ')}`:''}`;$('finishOverlay').hidden=false;},state.starOrder.length*160+500);
    emitResult();
  }
  function emitResult(){const detail={game:'seifenblasen',table:state.table,elapsedMs:Math.round(state.elapsed),elapsedSeconds:Math.round(state.elapsed/1000),mistakes:state.mistakes.map(m=>m.value),mistakeCount:state.mistakes.length,captured:[...state.captured],completed:true};window.dispatchEvent(new CustomEvent('denkavo:game-result',{detail}));window.dispatchEvent(new CustomEvent('denkavo:task-event',{detail:{type:'session_complete',...detail}}));}
  function reset(){cancelAnimationFrame(state.raf);state.bubbles.forEach(b=>b.el.remove());state.bubbles=[];state.captured.clear();state.mistakes=[];state.starOrder=[];state.completed=false;state.running=true;state.startedAt=performance.now();state.elapsed=0;state.lastTime=0;starLayer.innerHTML='';$('finishOverlay').hidden=true;updateProgress();ensureBubbles();state.raf=requestAnimationFrame(tick);}
  function selectTable(table){if(!tables.includes(table))return;state.table=table;document.querySelectorAll('.table-btn').forEach(btn=>{const active=Number(btn.dataset.table)===table;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});reset();}
  function selectSpeed(speed){if(!speeds[speed])return;state.speed=speed;document.querySelectorAll('.speed-btn').forEach(btn=>{const active=btn.dataset.speed===speed;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});}
  function tick(now){if(!state.running)return;if(!state.startedAt)state.startedAt=now;state.elapsed=now-state.startedAt;$('clock').textContent=formatTime(state.elapsed);const dt=Math.min(40,state.lastTime?now-state.lastTime:16)/1000;state.lastTime=now;
    const rect=playArea.getBoundingClientRect();for(const b of state.bubbles){const speed=speeds[state.speed];b.x+=b.vx*speed*dt;b.y+=b.vy*speed*dt;if(b.x<0){b.x=0;b.vx=Math.abs(b.vx);}if(b.y<0){b.y=0;b.vy=Math.abs(b.vy);}if(b.x>rect.width-b.size){b.x=rect.width-b.size;b.vx=-Math.abs(b.vx);}if(b.y>rect.height-b.size){b.y=rect.height-b.size;b.vy=-Math.abs(b.vy);}drawBubble(b);}
    state.raf=requestAnimationFrame(tick);
  }
  document.querySelectorAll('.table-btn').forEach(btn=>btn.addEventListener('click',()=>selectTable(Number(btn.dataset.table))));
  document.querySelectorAll('.speed-btn').forEach(btn=>btn.addEventListener('click',()=>selectSpeed(btn.dataset.speed)));
  $('restartBtn').addEventListener('click',reset);$('againBtn').addEventListener('click',reset);
  window.addEventListener('resize',()=>{const r=playArea.getBoundingClientRect();state.bubbles.forEach(b=>{b.x=Math.min(b.x,r.width-b.size);b.y=Math.min(b.y,r.height-b.size);drawBubble(b);});});
  // Integration contract: host platform can listen for denkavo:game-result and denkavo:task-event.
  // Optional parent bridge can forward these events into the existing session adapter.
  window.addEventListener('denkavo:game-result',e=>{if(window.parent!==window){window.parent.postMessage({type:'DENKAVO_GAME_RESULT',payload:e.detail},'*');}});
  reset();
  // Deterministic browser smoke-test interface, only enabled by ?selftest=1.
  if(new URLSearchParams(location.search).has('selftest')){window.__seifenblasenTest={state,selectTable,selectSpeed,ensureBubbles,finish,reset,catchBubble,formatTime};const out=document.createElement('output');out.id='testResult';out.textContent='RUNNING';document.body.appendChild(out);try{selectTable(7);if(state.table!==7)throw Error('Tabellenwechsel');if(state.bubbles.length<8)throw Error('Mindestens 8 Blasen');if(state.bubbles.filter(b=>b.correct).length<3)throw Error('Drei passende Blasen');selectSpeed('cheetah');if(state.speed!=='cheetah')throw Error('Tempo');const wrong=state.bubbles.find(b=>!b.correct);if(wrong)catchBubble(wrong);if(state.mistakes.length!==1)throw Error('Fehlversuch wird gezählt');state.captured=new Set(Array.from({length:10},(_,i)=>7*(i+1)));state.starOrder=[...state.captured];finish();out.textContent='PASS: Tabellenwechsel, 8+ Blasen, 3 richtige, Tempo, Fehlerzählung, Abschluss';}catch(e){out.textContent='FAIL: '+e.message;}}
})();
