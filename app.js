// Static UI preview — localStorage only. Mirrors PHP schema.
const $ = id => document.getElementById(id);
const store = {
  get(){ try{return JSON.parse(localStorage.getItem('it-demo')||'null')||seed()}catch(e){return seed()} },
  set(d){ localStorage.setItem('it-demo', JSON.stringify(d)) }
};
function seed(){
  const d=[{id:1,no:'IT-20261009-A1B2C3',sub:'Laptop won\'t boot — Finance PC-042',cat:'Hardware',pri:'High',st:'Open',by:'Maria',at:'2026-10-08 09:12',desc:'No power after update. Charger LED on.',file:'',assign:'',msgs:[{w:'IT — Juan',t:'On the way to check RAM/SSD.',at:'09:40'}]},
  {id:2,no:'IT-20261008-F4E5D6',sub:'VPN drops every 10 min',cat:'Network',pri:'Critical',st:'In Progress',by:'Jose',at:'2026-10-08 14:02',desc:'Site-to-site VPN flapping.',file:'vpn-log.txt',assign:'Juan — IT',msgs:[]},
  {id:3,no:'IT-20261007-778899',sub:'Shared folder access request',cat:'Access',pri:'Medium',st:'Resolved',by:'Ana',at:'2026-10-07 11:20',desc:'Need fileshare read access.',file:'',assign:'Admin',msgs:[{w:'Admin',t:'Granted. Please re-login.',at:'12:01'}]}];
  localStorage.setItem('it-demo',JSON.stringify(d)); return d;
}
let role=localStorage.getItem('it-role')||'';
let cur=null, charts=[];
function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',2600)}
function show(v){document.querySelectorAll('.container .view').forEach(s=>s.classList.remove('active'));$(v).classList.add('active')}
function setNav(id){document.querySelectorAll('.side-nav a').forEach(a=>a.classList.remove('active'));if(id)$(id).classList.add('active')}
function overdue(t){return (t.pri==='Critical'||t.pri==='High')&&!['Resolved','Closed'].includes(t.st)}
function render(){
  const d=store.get(),q=($('q').value||'').toLowerCase(),fs=$('fS').value,fp=$('fP').value;
  const f=d.filter(t=>(!fs||t.st===fs)&&(!fp||t.pri===fp)&&(!q||(t.sub+t.no).toLowerCase().includes(q)));
  $('rows').innerHTML=f.map(t=>`<tr><td><a href="#" data-id="${t.id}">${t.no}</a></td><td>${esc(t.sub)}</td><td>${t.cat}</td><td><span class="pill ${t.pri}">${t.pri}</span></td><td>${t.st}</td><td class="${overdue(t)?'sla-bad':'sla-ok'}">${overdue(t)?'🔴 overdue':'🟢 on-track'}</td><td>${t.at}</td></tr>`).join('')||'<tr><td colspan=7>No tickets</td></tr>';
  $('rows').querySelectorAll('a').forEach(a=>a.onclick=e=>{e.preventDefault();open(+a.dataset.id)});
  $('sOpen').textContent=d.filter(t=>t.st==='Open').length;
  $('sProg').textContent=d.filter(t=>t.st==='In Progress').length;
  $('sRes').textContent=d.filter(t=>['Resolved','Closed'].includes(t.st)).length;
  $('sOver').textContent=d.filter(overdue).length;
  $('sAvg').textContent='18.5h';
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
  $('dTitle').textContent=cur.no+' — '+cur.sub;
  $('dMeta').textContent=`${cur.pri} · ${cur.st} · ${cur.cat} · By ${cur.by} · Assigned: ${cur.assign||'Unassigned'}`;
  $('dDesc').textContent=cur.desc;
  $('dFile').innerHTML=cur.file?`📎 ${esc(cur.file)} (preview only)`:'';
  $('dStatus').value=cur.st;$('dAssign').value=cur.assign||'';
  $('staffBox').style.display=(role==='employee')?'none':'block';
  $('dComments').innerHTML=cur.msgs.map(m=>`<div class="comment"><b>${esc(m.w)}</b> <span class="muted">${esc(m.at)}</span><p>${esc(m.t)}</p></div>`).join('')||'<p class="muted">No replies yet.</p>';
  show('v-detail');setNav(null);
}
function enter(){
  document.body.classList.add('logged-in');
  $('v-login').classList.remove('active');
  const init=(role||'?').trim().split(/[\s@._-]+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('')||'?';
  $('avatar').textContent=init;$('who').textContent=role;
  show('v-dash');setNav('navDash');render();
}
// events
$('themeBtn').onclick=()=>{const r=document.documentElement;r.dataset.theme=r.dataset.theme==='light'?'dark':'light';localStorage.setItem('it-theme',r.dataset.theme);render()};
document.documentElement.dataset.theme=localStorage.getItem('it-theme')||'dark';
$('themeBtn').textContent=document.documentElement.dataset.theme==='light'?'☾':'☀';
const _tt=$('themeBtn').onclick;
$('themeBtn').onclick=()=>{_tt();$('themeBtn').textContent=document.documentElement.dataset.theme==='light'?'☾':'☀'};
$('loginBtn').onclick=()=>{role=$('role').value;localStorage.setItem('it-role',role);enter();toast('Signed in as '+role+' (demo)')};
$('logoutBtn').onclick=e=>{e.preventDefault();role='';localStorage.removeItem('it-role');document.body.classList.remove('logged-in');$('v-login').classList.add('active')};
$('navDash').onclick=e=>{e.preventDefault();show('v-dash');setNav('navDash')};
$('navNew').onclick=e=>{e.preventDefault();show('v-new');setNav('navNew')};
$('newBtn').onclick=()=>{show('v-new');setNav('navNew')};
$('backBtn').onclick=()=>{show('v-dash');setNav('navDash')};
$('backDash').onclick=e=>{e.preventDefault();show('v-dash');setNav('navDash')};
$('collapseBtn').onclick=e=>{e.preventDefault();document.querySelector('.app').classList.toggle('collapsed')};
$('backupBtn').onclick=()=>{
  const blob=new Blob([localStorage.getItem('it-demo')||'[]'],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='helpdesk-backup.json';a.click();toast('Backup downloaded');
};
['q','fS','fP'].forEach(id=>$(id).oninput=render);
$('nFile').onchange=e=>{$('fileInfo').textContent=e.target.files[0]?('Selected: '+e.target.files[0].name+' (preview only, max 5MB)') : ''};
$('createBtn').onclick=()=>{
  const s=$('nSub').value.trim(),ds=$('nDesc').value.trim();
  if(s.length<5||ds.length<10)return toast('Subject min 5, description min 10 chars');
  const d=store.get(),id=Math.max(...d.map(t=>t.id),0)+1;
  const no='IT-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+Math.random().toString(16).slice(2,8).toUpperCase();
  d.unshift({id,no,sub:s,cat:$('nCat').value,pri:$('nPri').value,st:'Open',by:role||'demo',at:new Date().toLocaleString(),desc:ds,file:$('nFile').files[0]?.name||'',assign:'',msgs:[]});
  store.set(d);$('nSub').value='';$('nDesc').value='';show('v-dash');setNav('navDash');render();toast('✉️ Email sent to it-support + confirm to requester');
};
$('dReply').onclick=()=>{const m=$('dMsg').value.trim();if(m.length<2)return toast('Type a reply');const d=store.get();const t=d.find(x=>x.id===cur.id);t.msgs.push({w:role||'demo',t:m,at:new Date().toLocaleString()});store.set(d);$('dMsg').value='';open(cur.id);toast('✉️ Reply email sent')};
$('dUpdate').onclick=()=>{const d=store.get();const t=d.find(x=>x.id===cur.id);t.st=$('dStatus').value;t.assign=$('dAssign').value;store.set(d);open(cur.id);render();toast('✉️ Status email sent to requester')};
$('expBtn').onclick=()=>{
  const d=store.get(),csv=['no,subject,category,priority,status,by'].concat(d.map(t=>[t.no,`"${t.sub.replaceAll('"','""')}"`,t.cat,t.pri,t.st,t.by].join(','))).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='tickets.csv';a.click();toast('Exported CSV');
};
$('impFile').onchange=e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{const lines=String(r.result).split('\n').slice(1).filter(Boolean);const d=store.get();let n=0;
    lines.forEach((L,i)=>{const p=L.split(',');if(p[1]){d.unshift({id:Date.now()+i,no:'IMP-'+(Date.now()+i),sub:p[1].replaceAll('"','').slice(0,200),cat:p[2]||'Other',pri:p[3]||'Medium',st:p[4]||'Open',by:p[5]||'import',at:new Date().toLocaleString(),desc:'Imported',file:'',assign:'',msgs:[]});n++}});
    store.set(d);render();toast(`Imported ${n} tickets`)};r.readAsText(f);
};
// boot
if(role){enter()}else{$('v-login').classList.add('active')}
