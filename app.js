// Static UI preview — localStorage only. Mirrors PHP schema (v3 industry features).
const $ = id => document.getElementById(id);
const store = {
  get(){ try{return JSON.parse(localStorage.getItem('it-demo3')||'null')||seed()}catch(e){return seed()} },
  set(d){ localStorage.setItem('it-demo3', JSON.stringify(d)) }
};
const CANNED = [
  'Hi, we received your ticket and IT will look into it shortly. Reply with any extra detail (screenshots help). — IT Department',
  'Hi, to proceed we need: exact error message, PC/asset tag, and when it started. — IT Department',
  'Hi, your password was reset. Use the temporary password sent separately and change it on first login. — IT Department',
  'Hi, we scheduled an onsite check. Please keep the equipment powered on. — IT Department',
  'Hi, we believe this is fixed. Please confirm; reply REOPEN if it persists. — IT Department',
  'Hi, access was granted. Log out and back in, then retry. — IT Department'];
const KB = [
  {t:'Wi-Fi keeps disconnecting — quick fix',c:'Network',b:'Forget the network and reconnect. If the whole floor is affected, restart the AP. Still failing? File a Network ticket with floor + asset tag.'},
  {t:'How to request shared-folder access',c:'Access',b:'File an Access ticket with the folder path and department-head approval. Granted within 1 business day.'},
  {t:'Printer offline checklist',c:'Hardware',b:'Check power, cable, paper. Restart the printer. Queue still Offline? File a Hardware ticket with the printer name.'},
  {t:'VPN setup for new laptops (staff)',c:'Network',b:'Install approved VPN client, import .ovpn profile from IT share, test ping 10.0.0.1. Never email profiles.'},
  {t:'New employee IT onboarding (staff)',c:'Access',b:'Create AD account, assign groups per role matrix, prepare laptop image, enroll MDM, sign asset form.'}];
const SLAH = p => p==='Critical'?24:p==='High'?48:120;
function seed(){
  const d=[{id:1,no:'IT-20261009-A1B2C3',sub:'Laptop won\'t boot — Finance PC-042',cat:'Hardware',pri:'High',st:'Open',by:'Maria',at:'2026-10-08 09:12',ageH:30,desc:'No power after update. Charger LED on.',file:'',assign:'',rtype:'Incident',tags:'laptop, finance',csat:0,firstResp:'09:40',logs:[{w:'Juan',m:25,n:'Diagnosed RAM',at:'10:05'}],msgs:[{w:'IT — Juan',t:'On the way to check RAM/SSD.',at:'09:40',vis:'public'}]},
  {id:2,no:'IT-20261008-F4E5D6',sub:'VPN drops every 10 min',cat:'Network',pri:'Critical',st:'In Progress',by:'Jose',at:'2026-10-08 14:02',ageH:20,desc:'Site-to-site VPN flapping.',file:'vpn-log.txt',assign:'Juan — IT',rtype:'Incident',tags:'vpn',csat:0,firstResp:'14:20',logs:[],msgs:[{w:'Juan',t:'Checking with ISP, will update HQ thread.',at:'15:00',vis:'internal'}]},
  {id:3,no:'IT-20261007-778899',sub:'Shared folder access request',cat:'Access',pri:'Medium',st:'Resolved',by:'Ana',at:'2026-10-07 11:20',ageH:50,desc:'Need fileshare read access.',file:'',assign:'Admin',rtype:'Access',tags:'access, accounting',csat:5,firstResp:'11:35',logs:[{w:'Admin',m:10,n:'Granted share perms',at:'12:00'}],msgs:[{w:'Admin',t:'Granted. Please re-login.',at:'12:01',vis:'public'}]}];
  localStorage.setItem('it-demo3',JSON.stringify(d)); return d;
}
let role=localStorage.getItem('it-role')||'';
let cur=null, charts=[];
function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',2600)}
function show(v){document.querySelectorAll('.container .view').forEach(s=>s.classList.remove('active'));$(v).classList.add('active')}
function setNav(id){document.querySelectorAll('.side-nav a').forEach(a=>a.classList.remove('active'));if(id)$(id).classList.add('active')}
function overdue(t){return !['Resolved','Closed'].includes(t.st)&&(t.ageH||0)>SLAH(t.pri)}
function slaLeft(t){if(['Resolved','Closed'].includes(t.st))return null;return SLAH(t.pri)-(t.ageH||0)}
function render(){
  const d=store.get(),q=($('q').value||'').toLowerCase(),fs=$('fS').value,fp=$('fP').value,ft=$('fT').value;
  const f=d.filter(t=>(!fs||t.st===fs)&&(!fp||t.pri===fp)&&(!ft||t.rtype===ft)&&(!$('fOver').checked||overdue(t))&&(!$('fUn').checked||!t.assign)&&(!q||(t.sub+t.no+(t.tags||'')).toLowerCase().includes(q)));
  $('rows').innerHTML=f.map(t=>{const l=slaLeft(t);return `<tr><td><a href="#" data-id="${t.id}">${t.no}</a></td><td>${esc(t.sub)}</td><td>${t.cat}</td><td><span class="pill ${t.pri}">${t.pri}</span></td><td>${t.st}</td><td class="${l===null?'':l<0?'sla-bad':'sla-ok'}">${l===null?'done':l<0?'🔴 '+Math.abs(l)+'h over':'🟢 '+l+'h left'}</td><td>${t.at}</td></tr>`}).join('')||'<tr><td colspan=7>No tickets</td></tr>';
  $('rows').querySelectorAll('a').forEach(a=>a.onclick=e=>{e.preventDefault();open(+a.dataset.id)});
  const res=d.filter(t=>['Resolved','Closed'].includes(t.st));
  $('sOpen').textContent=d.filter(t=>t.st==='Open').length;
  $('sProg').textContent=d.filter(t=>t.st==='In Progress').length;
  $('sRes').textContent=res.length;
  $('sOver').textContent=d.filter(overdue).length;
  $('sAvg').textContent='18.5h';
  const rated=d.filter(t=>t.csat>0);
  $('sCsat').textContent=rated.length?('⭐ '+(rated.reduce((s,t)=>s+t.csat,0)/rated.length).toFixed(1)):'—';
  $('sSla').textContent=res.length?Math.round(100*res.filter(t=>(t.ageH||0)<=SLAH(t.pri)).length/res.length)+'%':'—';
  draw(d);
}
function esc(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function draw(d){
  charts.forEach(c=>c.destroy());charts=[];
  const dark=document.documentElement.dataset.theme!=='light';
  Chart.defaults.color=dark?'#8b93b0':'#64748f';
  Chart.defaults.borderColor=dark?'#1e2742':'#e2e7f2';
  const cats={},pris={};d.forEach(t=>{cats[t.cat]=(cats[t.cat]||0)+1;pris[t.pri]=(pris[t.pri]||0)+1});
  charts.push(new Chart($('chCat'),{type:'bar',
    data:{labels:Object.keys(cats),datasets:[{data:Object.values(cats),backgroundColor:'#4ade80',borderRadius:6}]},
    options:{plugins:{legend:{display:false}},scales:{x:{grid:{display:false}}}}}));
  charts.push(new Chart($('chPri'),{type:'doughnut',
    data:{labels:Object.keys(pris),datasets:[{data:Object.values(pris),backgroundColor:['#4ade80','#facc15','#fb923c','#ef4444','#60a5fa']}]}}));
}
function open(id){cur=store.get().find(t=>t.id===id);if(!cur)return;
  const staff=role!=='employee';
  $('dTitle').textContent=cur.no+' — '+cur.sub;
  $('dMeta').textContent=`${cur.pri} · ${cur.st} · ${cur.cat} · ${cur.rtype} · By ${cur.by} · Assigned: ${cur.assign||'Unassigned'}${cur.tags?' · 🏷️ '+cur.tags:''}`;
  const l=slaLeft(cur);
  $('dSla').innerHTML=`⏱️ SLA: <b class="${l===null?'':l<0?'sla-bad':'sla-ok'}">${l===null?'done':l<0?'🔴 breached '+Math.abs(l)+'h over':'🟢 '+l+'h left'}</b> · First response: ${cur.firstResp||'—'} · Work: ${workTotal(cur)}`;
  $('dDesc').textContent=cur.desc;
  $('dFile').innerHTML=cur.file?`📎 ${esc(cur.file)} (preview only)`:'';
  $('dCsat').innerHTML=cur.csat?`<p>⭐ CSAT: ${'★'.repeat(cur.csat)}${'☆'.repeat(5-cur.csat)}</p>`:'';
  $('dStatus').value=cur.st;$('dAssign').value=cur.assign||'';
  $('staffBox').style.display=staff?'block':'none';
  $('cannedWrap').style.display=staff?'block':'none';
  $('visWrap').style.display=staff?'flex':'none';
  $('logCard').style.display=staff?'block':'none';
  const canRate=!cur.csat&&['Resolved','Closed'].includes(cur.st)&&role==='employee';
  $('rateCard').style.display=canRate?'block':'none';
  if(canRate)$('dRate').innerHTML=[5,4,3,2,1].map(s=>`<button class="btn" data-s="${s}">${'★'.repeat(s)}${'☆'.repeat(5-s)}</button>`).join('');
  $('dRate').querySelectorAll('button').forEach(b=>b.onclick=()=>{const d=store.get();d.find(x=>x.id===cur.id).csat=+b.dataset.s;store.set(d);open(cur.id);render();toast('Thanks for rating! ⭐')});
  const dc=$('dCanned');dc.innerHTML='<option value="">— insert template —</option>'+CANNED.map((c,i)=>`<option value="${i}">${esc(c.slice(0,40))}…</option>`).join('');
  dc.onchange=e=>{if(e.target.value!=='')$('dMsg').value=CANNED[+e.target.value]};
  renderComments();renderLogs();
  show('v-detail');setNav(null);
}
function workTotal(t){const m=(t.logs||[]).reduce((s,l)=>s+l.m,0);return `${Math.floor(m/60)}h ${m%60}m`}
function renderComments(){
  const staff=role!=='employee';
  $('dComments').innerHTML=cur.msgs.filter(m=>staff||m.vis!=='internal').map(m=>`<div class="comment"><b>${esc(m.w)}</b> <span class="muted">${esc(m.at)}</span>${m.vis==='internal'?' <span class="pill">🔒 internal</span>':''}<p>${esc(m.t)}</p></div>`).join('')||'<p class="muted">No replies yet.</p>';
}
function renderLogs(){
  $('dWorkTotal').textContent='('+workTotal(cur)+' total)';
  $('dLogs').innerHTML=(cur.logs||[]).map(l=>`<p class="muted">${esc(l.w)} — ${l.m} min — ${esc(l.n)} (${esc(l.at)})</p>`).join('')||'<p class="muted">No time logged yet.</p>';
}
function enter(){
  document.body.classList.add('logged-in');
  $('v-login').classList.remove('active');
  const init=(role||'?').trim().split(/[\s@._-]+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('')||'?';
  $('avatar').textContent=init;$('who').textContent=role;
  show('v-dash');setNav('navDash');render();
}
function renderKb(){
  const q=($('kbQ').value||'').toLowerCase();
  $('kbList').innerHTML=KB.filter(a=>!q||(a.t+a.b).toLowerCase().includes(q)).map((a,i)=>`<p>📖 <a href="#" data-kb="${i}">${esc(a.t)}</a> <span class="muted">[${a.c}]</span><br><span class="muted">${esc(a.b)}</span></p>`).join('')||'<p class="muted">No articles.</p>';
}
// events
$('themeBtn').onclick=()=>{const r=document.documentElement;r.dataset.theme=r.dataset.theme==='light'?'dark':'light';localStorage.setItem('it-theme',r.dataset.theme);$('themeBtn').textContent=r.dataset.theme==='light'?'☾':'☀';if(document.body.classList.contains('logged-in'))render()};
document.documentElement.dataset.theme=localStorage.getItem('it-theme')||'dark';
$('themeBtn').textContent=document.documentElement.dataset.theme==='light'?'☾':'☀';
$('loginBtn').onclick=()=>{role=$('role').value;localStorage.setItem('it-role',role);enter();toast('Signed in as '+role+' (demo)')};
$('logoutBtn').onclick=e=>{e.preventDefault();role='';localStorage.removeItem('it-role');document.body.classList.remove('logged-in');$('v-login').classList.add('active')};
function go(v,n){show(v);setNav(n)}
$('navDash').onclick=e=>{e.preventDefault();go('v-dash','navDash')};
$('navNew').onclick=e=>{e.preventDefault();go('v-new','navNew')};
$('navKb').onclick=e=>{e.preventDefault();renderKb();go('v-kb','navKb')};
$('kbQ').oninput=renderKb;
$('newBtn').onclick=()=>go('v-new','navNew');
$('backBtn').onclick=()=>go('v-dash','navDash');
$('backDash').onclick=e=>{e.preventDefault();go('v-dash','navDash')};
$('collapseBtn').onclick=e=>{e.preventDefault();document.querySelector('.app').classList.toggle('collapsed')};
$('backupBtn').onclick=()=>{
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([localStorage.getItem('it-demo3')||'[]'],{type:'application/json'}));a.download='helpdesk-backup.json';a.click();toast('Backup downloaded');
};
['q','fS','fP','fT'].forEach(id=>$(id).oninput=render);
$('fOver').onchange=render;$('fUn').onchange=render;
$('nFile').onchange=e=>{$('fileInfo').textContent=e.target.files[0]?('Selected: '+e.target.files[0].name+' (preview only, max 5MB)') : ''};
$('nSub').addEventListener('input',()=>{
  const v=$('nSub').value.toLowerCase();
  if(v.length<4){$('kbHints').innerHTML='';return}
  const hit=KB.filter(a=>(a.t+' '+a.b).toLowerCase().split(/\W+/).some(w=>w.length>3&&v.includes(w))).slice(0,2);
  $('kbHints').innerHTML=hit.length?'<p class="muted">📚 Maybe this solves it — no ticket needed:</p>'+hit.map(a=>`<p>📖 ${esc(a.t)}<br><span class="muted">${esc(a.b)}</span></p>`).join(''):'';
});
$('createBtn').onclick=()=>{
  const s=$('nSub').value.trim(),ds=$('nDesc').value.trim();
  if(s.length<5||ds.length<10)return toast('Subject min 5, description min 10 chars');
  const d=store.get(),id=Math.max(...d.map(t=>t.id),0)+1;
  const no='IT-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+Math.random().toString(16).slice(2,8).toUpperCase();
  d.unshift({id,no,sub:s,cat:$('nCat').value,pri:$('nPri').value,st:'Open',by:role||'demo',at:new Date().toLocaleString(),ageH:0,desc:ds,file:$('nFile').files[0]?.name||'',assign:'',rtype:$('nType').value,tags:$('nTags').value.trim(),csat:0,firstResp:'',logs:[],msgs:[]});
  store.set(d);$('nSub').value='';$('nDesc').value='';$('nTags').value='';$('kbHints').innerHTML='';go('v-dash','navDash');render();toast('✉️ Email sent to it-support + confirm to requester');
};
$('dReply').onclick=()=>{const m=$('dMsg').value.trim();if(m.length<2)return toast('Type a reply');const staff=role!=='employee';const vis=staff&&$('dVis').checked?'internal':'public';const d=store.get();const t=d.find(x=>x.id===cur.id);t.msgs.push({w:role||'demo',t:m,at:new Date().toLocaleString(),vis});if(staff&&!t.firstResp)t.firstResp='now';store.set(d);$('dMsg').value='';$('dVis').checked=false;open(cur.id);toast(vis==='internal'?'🔒 Internal note saved (no email)':'✉️ Reply email sent')};
$('dUpdate').onclick=()=>{const d=store.get();const t=d.find(x=>x.id===cur.id);t.st=$('dStatus').value;t.assign=$('dAssign').value;store.set(d);open(cur.id);render();toast('✉️ Status email sent to requester')};
$('dLog').onclick=()=>{const m=+$('dMins').value;if(!(m>0))return toast('Enter minutes');const d=store.get();const t=d.find(x=>x.id===cur.id);t.logs.push({w:role||'demo',m,n:$('dNote').value||'',at:new Date().toLocaleString()});store.set(d);$('dMins').value='';$('dNote').value='';open(cur.id);toast('⏱️ Time logged')};
$('expBtn').onclick=()=>{
  const d=store.get(),csv=['no,subject,type,category,priority,status,csat,by'].concat(d.map(t=>[t.no,`"${t.sub.replaceAll('"','""')}"`,t.rtype,t.cat,t.pri,t.st,t.csat||'',t.by].join(','))).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='tickets.csv';a.click();toast('Exported CSV');
};
$('impFile').onchange=e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{const lines=String(r.result).split('\n').slice(1).filter(Boolean);const d=store.get();let n=0;
    lines.forEach((L,i)=>{const p=L.split(',');if(p[1]){d.unshift({id:Date.now()+i,no:'IMP-'+(Date.now()+i),sub:p[1].replaceAll('"','').slice(0,200),cat:'Other',pri:'Medium',st:'Open',by:'import',at:new Date().toLocaleString(),ageH:0,desc:'Imported',file:'',assign:'',rtype:'Incident',tags:'',csat:0,firstResp:'',logs:[],msgs:[]});n++}});
    store.set(d);render();toast(`Imported ${n} tickets`)};r.readAsText(f);
};
// boot
if(role){enter()}else{$('v-login').classList.add('active')}
