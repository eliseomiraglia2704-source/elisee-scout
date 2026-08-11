/**
 * ELISEE SCOUT — Integrazioni Runtime (PDF I2 + I3 + Agenti Task)
 * window.EliseeIntegrazioni
 */
﻿(function(){
'use strict';
var _esIntInjecting=false,_esIntBooted=false;
var LS={blocks:'elisee_profile_blocks_v1',poReports:'elisee_po_reports_v1',career:'elisee_career_sim_v1',team:'elisee_selected_team_v1',events:'elisee_selection_events_v1',consentCareer:'elisee_career_consent_v1',maReports:'elisee_match_analyst_v1',rolesLog:'elisee_roles_actions_log_v1',kpi:'elisee_ops_kpi_v1',evaluations:'elisee_scout_evaluations_v1',aiFeedback:'elisee_ai_feedback_loop_v1',datasetTracker:'elisee_dataset_tracker_v1'};
var CATEGORIES=['Terza Categoria','Seconda Categoria','Prima Categoria','Promozione','Eccellenza','Serie D','Under 19','Femminile','Svincolato'];
var TRAITS=['Leadership','Fair-play','Ambizione','Resilienza','Teamwork','Disciplina'];
var BIVI=[
{id:'b1',title:'Il mister ti offre la fascia da capitano, ma il vice-capitano e un amico.',options:[{t:'Accetti e parli subito con l amico',tags:{Leadership:2,Teamwork:1,'Fair-play':1}},{t:'Rifiuti per non creare tensioni',tags:{'Fair-play':2,Teamwork:1,Ambizione:-1}},{t:'Proponi di condividere il ruolo a rotazione',tags:{Leadership:1,Teamwork:2,Disciplina:1}}]},
{id:'b2',title:'In trasferta un dirigente ti chiede di esagerare su un contatto da cartellino.',options:[{t:'Rifiuti e resti sul fair-play',tags:{'Fair-play':3,Disciplina:2,Ambizione:-1}},{t:'Accetti per fare bella figura',tags:{Ambizione:2,'Fair-play':-2,Disciplina:-1}},{t:'Segnali la situazione al Privacy Officer',tags:{Disciplina:2,Leadership:1,Resilienza:1}}]},
{id:'b3',title:'Hai un offerta da una squadra superiore, ma la tua societa ti ha lanciato.',options:[{t:'Parti per crescere di categoria',tags:{Ambizione:3,Resilienza:1,Teamwork:-1}},{t:'Resti un anno per ripagare la fiducia',tags:{'Fair-play':2,Teamwork:2,Ambizione:-1}},{t:'Negozia un prestito con opzione di ritorno',tags:{Leadership:1,Ambizione:1,Disciplina:1}}]},
{id:'b4',title:'Dopo un infortunio il preparatore ti spinge a rientrare in anticipo.',options:[{t:'Ascolti il medico e aspetti i tempi giusti',tags:{Disciplina:2,Resilienza:2,Ambizione:-1}},{t:'Forzi per non perdere il posto',tags:{Ambizione:2,Resilienza:1,Disciplina:-2}},{t:'Proponi un rientro graduale con monitoraggi',tags:{Leadership:1,Disciplina:2,Teamwork:1}}]}
];
var SAMPLE_TEAMS=[
{id:'t1',name:'ASD Foggia Calcio',cat:'Serie D',area:'Puglia',color:'#e11d48'},
{id:'t2',name:'US San Severo',cat:'Eccellenza',area:'Puglia',color:'#2563eb'},
{id:'t3',name:'Virtus Francavilla',cat:'Serie D',area:'Puglia',color:'#16a34a'},
{id:'t4',name:'Atletico Vieste',cat:'Promozione',area:'Puglia',color:'#ca8a04'},
{id:'t5',name:'Real Cerignola',cat:'Serie C',area:'Puglia',color:'#7c3aed'},
{id:'t6',name:'Nardo Calcio',cat:'Serie D',area:'Puglia',color:'#0891b2'},
{id:'t7',name:'Bitonto Calcio',cat:'Eccellenza',area:'Puglia',color:'#db2777'},
{id:'t8',name:'Team Svincolato',cat:'Svincolato',area:'Italia',color:'#64748b'}
];
var CAREER_AGENTS=['Assegnazione Obiettivi','Difficolta Dinamica','Monitoraggio Progresso','Coerenza Narrativa','Valutazione Esito','Obiettivi Speciali','Feedback Club','Bilanciamento Multi-categoria','Cronologia Obiettivi','Suggerimento Prossimo Obiettivo','Costruzione Percorso','Posizionamento Tappa','Transizione Categoria','Eventi su Tappa','Animazione Percorso','Coerenza Cronologica','Retrocessione','Traguardi Percorso','Sintesi Percorso','Visualizzazione Percorso','Selezione Bivio','Generazione Testo Bivio','Tagging Comportamentale','Anti-ripetizione','Bilanciamento Scelte','Animazione Comparsa','Bivi Categoria-specifici','Coerenza con Obiettivo','Archivio Bivi Utente','Espansione Contenuti','Calcolo Radar','Normalizzazione Punteggi','Storico Radar','Rendering Grafico','Confronto Radar','Spiegabilita','Consenso Visibilita Radar','Anomalie Radar','Aggiornamento Incrementale','Privacy Radar','Generazione Riepilogo','Aggregazione Dati Stagione','Invito Rigioco','Highlight Stagione','Confronto Stagioni','Esportazione Riepilogo','Notifica Fine Stagione','Archiviazione Stagione','Suggerimento Prossima Categoria','Qualita Riepilogo'];
var OPS_AGENTS_I3=[
{name:'Suggerimento Escalation',desc:'Segnalazioni senza risposta oltre soglia'},
{name:'Migrazione Dati Informali',desc:'Import guidato da fogli di calcolo'},
{name:'Rilevamento Duplicati Profilo',desc:'Doppioni tra fonti diverse'},
{name:'Trascrizione Note Vocali',desc:'Note da campo in testo strutturato'},
{name:'Sincronizzazione Offline',desc:'Salvataggio locale + sync'},
{name:'Generazione Template Evento',desc:'Modelli stage/open day'},
{name:'Monitoraggio Adesioni QR',desc:'Contatore real-time posti'},
{name:'Verifica Consenso Minori su Evento',desc:'Consenso genitoriale pre-conferma'},
{name:'Coordinamento Roadmap-Sezione5',desc:'Allineamento comunicazione e conformita'}
];
function load(k,f){try{var r=localStorage.getItem(k);return r?JSON.parse(r):f;}catch(e){return f;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function uid(p){return (p||'id')+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function toast(m,t){if(typeof window.showToast==='function')window.showToast(m,t||'success');else console.log('[EliseeIntegrazioni]',m);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function defaultCareer(){var radar={};TRAITS.forEach(function(t){radar[t]=50;});return{categoryIndex:0,season:1,objective:'Guadagna 3 convocazioni da titolare',objectiveProgress:0,radar:radar,history:[],usedBivi:[],seasons:[]};}
function defaultKpi(){return{signalResponseHours:18,informalMigratedPct:12,mobileEvalPct:64,eventCreateMinutes:7,parentalConsentPct:78,freeToPremiumPct:4,informalCommsDownPct:9};}
var root,main,currentPanel='hub',hubMode='user';
/* zone: user | admin | privacy — non mescolare moduli pubblici e staff */
var NAV_ALL=[
{id:'hub',ico:'*',title:'Panoramica',sub:'Moduli di quest area',zone:'all'},
{id:'career',ico:'C',title:'Simulatore Carriera',sub:'Minigioco + radar + bivi',zone:'user'},
{id:'team',ico:'T',title:'Selettore Squadra',sub:'Card + animazione',zone:'user'},
{id:'events',ico:'Q',title:'Eventi e QR',sub:'Stage / open day',zone:'user'},
{id:'analyst',ico:'A',title:'Match Analyst',sub:'Report 8 blocchi',zone:'user'},
{id:'roles',ico:'R',title:'Azioni per ruolo',sub:'Il tuo ruolo',zone:'user'},
{id:'admin',ico:'S',title:'Blocchi profilo',sub:'Moderazione e log',zone:'admin'},
{id:'agents',ico:'AI',title:'Agenti IA',sub:'Catalogo operativo',zone:'admin'},
{id:'kpi',ico:'K',title:'KPI operativi',sub:'Carico e eventi',zone:'admin'},
{id:'privacy',ico:'P',title:'Report Privacy',sub:'Riesami e report PO',zone:'privacy'}
];
function isAdminAuth(){try{return localStorage.getItem('elisee_admin_auth')==='true';}catch(e){return false;}}
function isPrivacyAuth(){try{return localStorage.getItem('elisee_privacy_auth')==='true';}catch(e){return false;}}
function isLoggedUser(){
  try{
    if(typeof window.getActiveUser==='function'){var u=window.getActiveUser();if(u&&(u.nome||u.email||u.id))return true;}
    if(localStorage.getItem('elisee_logged_in')==='true')return true;
    var raw=localStorage.getItem('elisee_active_user')||localStorage.getItem('elisee_user')||localStorage.getItem('elisee_current_user');
    if(raw&&raw!=='null'&&raw!=='{}')return true;
  }catch(e){}
  return false;
}
function navForMode(mode){
  mode=mode||'user';
  return NAV_ALL.filter(function(n){
    if(n.id==='hub')return true;
    if(mode==='admin')return n.zone==='admin';
    if(mode==='privacy')return n.zone==='privacy'||n.id==='admin';
    return n.zone==='user';
  });
}
function defaultPanelForMode(mode){
  if(mode==='admin')return 'admin';
  if(mode==='privacy')return 'privacy';
  return 'career';
}
function modeLabel(mode){
  if(mode==='admin')return 'Area Admin';
  if(mode==='privacy')return 'Responsabile Privacy';
  return 'Area Utente';
}

function ensureDOM(){
if(document.getElementById('es-int-root')){root=document.getElementById('es-int-root');main=document.getElementById('es-int-main');return;}
root=document.createElement('div');root.id='es-int-root';root.className='es-int-root';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
root.innerHTML='<div class="es-int-top"><div class="es-int-brand"><span class="es-int-badge">PDF > SITO</span><div><h2>Hub Integrazioni ELISEE SCOUT</h2><p>Integrazioni 2 · 3 · Catalogo Agenti Task Estesi</p></div></div><button type="button" class="es-int-close" id="es-int-close">Chiudi</button></div><div class="es-int-body"><nav class="es-int-side" id="es-int-side"></nav><div class="es-int-main" id="es-int-main"></div></div>';
document.body.appendChild(root);main=document.getElementById('es-int-main');
document.getElementById('es-int-close').addEventListener('click',close);
root.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
renderSide();
}
function renderSide(){
var side=document.getElementById('es-int-side');if(!side)return;
var nav=navForMode(hubMode);
side.innerHTML=nav.map(function(n){return '<button type="button" data-panel="'+n.id+'" class="'+(n.id===currentPanel?'is-active':'')+'"><span class="es-int-nav-ico">'+n.ico+'</span><span><strong>'+n.title+'</strong><small>'+n.sub+'</small></span></button>';}).join('');
side.querySelectorAll('button').forEach(function(btn){btn.addEventListener('click',function(){showPanel(btn.getAttribute('data-panel'));});});
}
function showPanel(id){
currentPanel=id||'hub';renderSide();
var map={hub:panelHub,career:panelCareer,team:panelTeam,events:panelEvents,analyst:panelAnalyst,roles:panelRoles,admin:panelAdmin,privacy:panelPrivacy,agents:panelAgents,kpi:panelKpi};
main.innerHTML=(map[currentPanel]||panelHub)();
bindPanel(currentPanel);
}
function open(panel,mode){
  mode=mode||hubMode||'user';
  // gate access
  if(mode==='admin'&&!isAdminAuth()){
    toast('Modulo riservato all\'Admin','error');
    if(typeof window.switchView==='function')window.switchView('admin','#admin-portal');
    return;
  }
  if(mode==='privacy'&&!isPrivacyAuth()&&!isAdminAuth()){
    toast('Modulo riservato al Responsabile Privacy','error');
    if(typeof window.switchView==='function')window.switchView('admin','#admin-portal');
    return;
  }
  if(mode==='user'&&!isLoggedUser()&&!isAdminAuth()){
    // utente non loggato: porta ad accedi, ma permette se admin
    toast('Accedi per usare i tuoi strumenti','info');
    if(typeof window.switchView==='function')window.switchView('account','#account-portal');
    // non bloccare del tutto se vuole solo vedere — richiedi login
    return;
  }
  hubMode=mode;
  ensureDOM();
  // update brand subtitle
  try{
    var brand=root.querySelector('.es-int-brand p');
    if(brand)brand.textContent=modeLabel(hubMode)+' · moduli dedicati';
    var h2=root.querySelector('.es-int-brand h2');
    if(h2)h2.textContent=mode==='admin'?'Strumenti Admin':(mode==='privacy'?'Strumenti Privacy':'I miei strumenti');
    var badge=root.querySelector('.es-int-badge');
    if(badge)badge.textContent=mode==='admin'?'ADMIN':(mode==='privacy'?'PRIVACY':'UTENTE');
  }catch(e){}
  root.classList.add('is-open');
  document.body.style.overflow='hidden';
  var allowed=navForMode(hubMode).map(function(n){return n.id;});
  var start=panel||defaultPanelForMode(hubMode);
  if(allowed.indexOf(start)<0)start=defaultPanelForMode(hubMode);
  showPanel(start);
}
function close(){if(!root)return;root.classList.remove('is-open');document.body.style.overflow='';}
function card(id,title,desc,tag){return '<button type="button" class="es-int-card" data-go="'+id+'"><h3>'+title+'</h3><p>'+desc+'</p><span class="es-int-tag">'+tag+'</span></button>';}
function panelHub(){
var cards='';
if(hubMode==='admin'){
  cards=
    card('admin','Blocchi profilo','Moderazione graduata, log immutabile, riesami.','Admin')+
    card('agents','Agenti IA operativi','Catalogo 50 carriera + 9 Ops I3 + riferimento 715.','Admin')+
    card('kpi','KPI operativi','Carico dirigenti, mobile, eventi, conversione.','Admin');
  return '<h1 class="es-int-h">Strumenti Admin</h1><p class="es-int-sub">Moduli di governance e automazione — non visibili al pubblico.</p><div class="es-int-grid">'+cards+'</div>';
}
if(hubMode==='privacy'){
  cards=
    card('privacy','Report e riesami Privacy','Report semplificati, riesami blocchi, tracciamento.','Privacy')+
    card('admin','Coda blocchi (sola lettura operativa)','Verifica blocchi e avvia riesame.','Privacy');
  return '<h1 class="es-int-h">Strumenti Responsabile Privacy</h1><p class="es-int-sub">Moduli GDPR/compliance — riservati al Privacy Officer.</p><div class="es-int-grid">'+cards+'</div>';
}
cards=
  card('career','Simulatore di Carriera','Minigioco con bivi, radar e percorso categorie.','Per te')+
  card('team','Selettore Squadra','Scegli e salva la tua societa.','Per te')+
  card('events','Eventi e QR','Crea stage/open day e raccogli adesioni.','Per te')+
  card('analyst','Match Analyst','Report tattica a 8 blocchi.','Per te')+
  card('roles','Azioni del tuo ruolo','Scorciatoie operative per il tuo profilo.','Per te');
return '<h1 class="es-int-h">I miei strumenti</h1><p class="es-int-sub">Funzioni del tuo account. I moduli di Admin e Privacy non compaiono qui.</p><div class="es-int-grid">'+cards+'</div>';
}
function panelCareer(){
var c=load(LS.career,defaultCareer());var consent=!!load(LS.consentCareer,false);var cat=CATEGORIES[c.categoryIndex]||CATEGORIES[0];
var pathHtml=CATEGORIES.map(function(name,i){var cls='es-path-node';if(i<c.categoryIndex)cls+=' done';if(i===c.categoryIndex)cls+=' current';return '<span class="'+cls+'">'+esc(name)+'</span>';}).join('');
return '<h1 class="es-int-h">Simulatore di Carriera Dilettantistica</h1><p class="es-int-sub">Minigioco opt-in (revocabile). Radar a terzi solo con consenso separato (sez. 6.5 / art. 22).</p><div class="es-int-box"><div class="es-int-row"><span class="es-int-pill '+(consent?'green':'yellow')+'">'+(consent?'Consenso carriera ATTIVO':'Consenso carriera NON attivo')+'</span><button type="button" class="es-int-btn '+(consent?'danger':'ok')+'" id="es-career-consent">'+(consent?'Revoca consenso':'Attiva consenso opt-in')+'</button><button type="button" class="es-int-btn ghost" id="es-career-reset">Reset stagione</button></div><p style="margin:0;font-size:.8rem;color:#94a3b8">Autorizzo ELISEE SCOUT a elaborare le scelte del Simulatore per un profilo comportamentale sportivo. Revocabile. Nessuna decisione esclusivamente automatizzata senza intervento umano.</p></div>'+(consent?('<div class="es-kpi-strip"><div class="es-kpi"><div class="n">S'+c.season+'</div><div class="l">Stagione</div></div><div class="es-kpi"><div class="n">'+esc(cat)+'</div><div class="l">Categoria</div></div><div class="es-kpi"><div class="n">'+c.objectiveProgress+'/3</div><div class="l">'+esc(c.objective)+'</div></div><div class="es-kpi"><div class="n">'+c.history.length+'</div><div class="l">Bivi</div></div></div><div class="es-int-box"><strong style="color:#7dd3fc">Percorso a tappe</strong><div class="es-path">'+pathHtml+'</div></div><div class="es-radar-wrap"><canvas class="es-radar-canvas" id="es-radar" width="260" height="260"></canvas><div><div class="es-int-row"><button type="button" class="es-int-btn primary" id="es-career-bivio">Affronta un bivio</button><button type="button" class="es-int-btn" id="es-career-promote">Simula promozione</button><button type="button" class="es-int-btn ok" id="es-career-end">Chiudi stagione</button></div><div id="es-bivio-slot"></div><div id="es-season-summary"></div></div></div>'):'<div class="es-int-box"><p style="margin:0;color:#fcd34d">Attiva il consenso per giocare.</p></div>');
}
function panelTeam(){
var selected=load(LS.team,null);
var cards=SAMPLE_TEAMS.map(function(t){var sel=selected&&selected.id===t.id?' is-selected':'';var ini=t.name.split(' ').map(function(w){return w[0];}).join('').slice(0,3).toUpperCase();return '<button type="button" class="es-team-card'+sel+'" data-team="'+t.id+'"><div class="crest" style="background:radial-gradient(circle at 30% 30%,'+t.color+',#0c4a6e)">'+esc(ini)+'</div><h4>'+esc(t.name)+'</h4><span>'+esc(t.cat)+' · '+esc(t.area)+'</span></button>';}).join('');
return '<h1 class="es-int-h">Selettore Squadra</h1><p class="es-int-sub">Flusso: sfoglia, seleziona card, conferma (sez. 7).</p><div class="es-int-box">Squadra attuale: <strong style="color:#38bdf8">'+(selected?esc(selected.name)+' ('+esc(selected.cat)+')':'Nessuna')+'</strong></div><div class="es-team-grid">'+cards+'</div><div class="es-int-row" style="margin-top:1rem"><button type="button" class="es-int-btn danger" id="es-team-clear">Rimuovi selezione</button></div>';
}
function panelEvents(){
var events=load(LS.events,[]);
var list=events.length?('<table class="es-int-table"><thead><tr><th>Evento</th><th>Fascia</th><th>Adesioni</th><th>Limite</th><th>QR</th><th></th></tr></thead><tbody>'+events.map(function(ev){var qr='https://api.qrserver.com/v1/create-qr-code/?size=160x160&data='+encodeURIComponent('elisee-scout://event/'+ev.id);return '<tr><td>'+esc(ev.title)+'<br><small style="color:#64748b">'+esc(ev.date||'')+' · '+esc(ev.place||'')+'</small></td><td>'+esc(ev.fascia||'-')+'</td><td>'+(ev.adesioni||0)+'</td><td>'+(ev.limit||'inf')+'</td><td><img src="'+qr+'" alt="QR" width="64" height="64" style="border-radius:6px;background:#fff;padding:2px"></td><td><button type="button" class="es-int-btn ok es-ev-join" data-id="'+ev.id+'">+1 adesione</button></td></tr>';}).join('')+'</tbody></table>'):'<p style="color:#94a3b8">Nessun evento ancora.</p>';
return '<h1 class="es-int-h">Eventi di selezione + QR</h1><p class="es-int-sub">Stage/open day, fasce, limite posti, QR adesioni, consenso minori (I3 5.6 / 6.4).</p><div class="es-int-box"><div class="es-int-field"><label class="es-int-label">Titolo</label><input class="es-int-input" id="es-ev-title" placeholder="Open Day Under 17"></div><div class="es-int-row" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem"><div class="es-int-field" style="margin:0"><label class="es-int-label">Data</label><input class="es-int-input" id="es-ev-date" type="date"></div><div class="es-int-field" style="margin:0"><label class="es-int-label">Luogo</label><input class="es-int-input" id="es-ev-place"></div><div class="es-int-field" style="margin:0"><label class="es-int-label">Fascia</label><input class="es-int-input" id="es-ev-fascia" placeholder="U15/U17"></div></div><div class="es-int-row" style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-top:.75rem"><div class="es-int-field" style="margin:0"><label class="es-int-label">Limite posti</label><input class="es-int-input" id="es-ev-limit" type="number" min="1" value="40"></div><div class="es-int-field" style="margin:0;display:flex;align-items:flex-end"><label style="font-size:.82rem;color:#cbd5e1;display:flex;gap:.4rem;align-items:center;cursor:pointer"><input type="checkbox" id="es-ev-minors" checked> Consenso genitoriale minori</label></div></div><div class="es-int-row" style="margin-top:.85rem"><button type="button" class="es-int-btn primary" id="es-ev-create">Crea evento + QR</button><button type="button" class="es-int-btn ghost" id="es-ev-template">Template Stage standard</button></div></div><div class="es-int-box"><strong style="color:#7dd3fc">Eventi attivi</strong><div style="margin-top:.75rem;overflow-x:auto">'+list+'</div></div>';
}
function panelAnalyst(){
var reports=load(LS.maReports,[]);var last=reports[0];
var tracker=load(LS.datasetTracker, { validatedCount: 42, targetFineTuning: 1000, lastUpdated: null });
var pct=Math.min(100, Math.round((tracker.validatedCount / tracker.targetFineTuning) * 100));
var labels=['1. Tesi di apertura','2. Contesto','3. Identita di gioco','4. Dati a supporto','5. Modulo e distribuzione','6. Giocatori chiave','7. Vulnerabilita','8. Conclusione'];
var keys=['tesi','contesto','identita','dati','modulo','chiavi','vulnerabilita','conclusione'];
var fields=keys.map(function(k,i){var val=last&&last[k]?last[k]:'';return '<div class="es-int-field"><label class="es-int-label">'+labels[i]+'</label><textarea class="es-int-textarea es-ma-field" data-k="'+k+'" rows="2">'+esc(val)+'</textarea></div>';}).join('');

var legalDisclaimer='<div style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:8px;padding:.75rem;margin:1rem 0;color:#fef08a;font-size:.82rem;line-height:1.4"><strong>⚠️ Disclaimer Legale / Compliance GDPR & Minori (Step 2 Roadmap):</strong> Questo report e generato con l assistenza dell Intelligenza Artificiale. Le analisi devono essere preventivamente validate ed approvate da uno scout umano prima di qualsiasi decisione societaria o contrattuale.</div>';

var feedbackForm='<div class="es-int-box" style="margin-top:1rem;border-color:rgba(56,189,248,.3)"><h3 style="margin:0 0 .5rem;color:#38bdf8;font-size:1.05rem">Feedback Loop & Correzioni Scout (Step 3 Roadmap)</h3><p style="margin:0 0 .75rem;color:#cbd5e1;font-size:.82rem">Ogni tua conferma o correzione alimenta il dataset proprietario della piattaforma senza sovrascrivere le valutazioni storiche.</p><div class="es-int-row" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.65rem"><div class="es-int-field" style="margin:0"><label class="es-int-label">Voto AI (1-10)</label><input type="number" min="1" max="10" step="0.1" class="es-int-input" id="es-fb-aiscore" value="7.5"></div><div class="es-int-field" style="margin:0"><label class="es-int-label">Voto Umano (1-10)</label><input type="number" min="1" max="10" step="0.1" class="es-int-input" id="es-fb-humanscore" value="8.0"></div><div class="es-int-field" style="margin:0"><label class="es-int-label">Confidenza Scout</label><select class="es-int-select" id="es-fb-conf"><option value="5">⭐⭐⭐⭐⭐ Alta (5/5)</option><option value="4">⭐⭐⭐⭐ Buona (4/5)</option><option value="3">⭐⭐⭐ Media (3/5)</option></select></div></div><div class="es-int-field" style="margin-top:.65rem"><label class="es-int-label">Motivazione della correzione (testuale - Step 3)</label><input class="es-int-input" id="es-fb-reason" placeholder="Es: Sottostimata la visione di gioco in transizione positiva"></div><div class="es-int-row" style="margin-top:.75rem"><button type="button" class="es-int-btn primary" id="es-fb-submit">Invia Feedback AI + Salva Delta</button></div></div>';

var datasetTrackerHtml='<div class="es-int-box" style="margin-top:1rem;background:rgba(15,23,42,.6)"><div style="display:flex;justify-content:space-between;align-items:center"><strong style="color:#7dd3fc">Dataset Proprietario — Avanzamento Fine-Tuning (Step 4)</strong><span style="font-size:.8rem;color:#38bdf8;font-weight:bold">'+tracker.validatedCount+' / '+tracker.targetFineTuning+' valutazioni validate ('+pct+'%)</span></div><div style="background:rgba(56,189,248,.15);border-radius:10px;height:10px;margin-top:.65rem;overflow:hidden"><div style="background:linear-gradient(90deg,#38bdf8,#818cf8);height:100%;width:'+pct+'%;transition:width .4s"></div></div><p style="margin:.5rem 0 0;font-size:.78rem;color:#94a3b8">Al raggiungimento delle 1.000 valutazioni validate, il dataset sara pronto per il fine-tuning del modello custom proprietario.</p></div>';

return '<h1 class="es-int-h">Match Analyst — report 8 blocchi</h1><p class="es-int-sub">Analisi tattica strutturata & Roadmap AI Scouting.</p>'+legalDisclaimer+'<div class="es-int-box">'+fields+'<div class="es-int-row"><button type="button" class="es-int-btn primary" id="es-ma-save">Salva report</button><button type="button" class="es-int-btn" id="es-ma-ai">Bozza Agente Scrittura Guidata</button></div></div>'+feedbackForm+datasetTrackerHtml+'<div class="es-int-box" style="margin-top:1rem"><strong style="color:#7dd3fc">Archivio Report ('+reports.length+')</strong>'+(reports.length?'<ul style="margin:.5rem 0 0;padding-left:1.1rem;font-size:.82rem;color:#cbd5e1">'+reports.slice(0,8).map(function(r){return '<li>'+esc(r.createdAt)+' — '+esc((r.tesi||'').slice(0,80))+'</li>';}).join('')+'</ul>':'<p style="color:#64748b;margin:.5rem 0 0">Nessun report.</p>')+'</div>';
}
function panelRoles(){
var samples={'Calciatore/Utente':['Aggiornare ruolo e piede preferito','Attivare consenso profilo comportamentale','Richiedere intervento umano (art. 22)','Esportare i propri dati'],'Famiglia/Tutore':['Confermare consenso genitoriale','Opposizione rapida profilo minore','Verificare organizzatore evento','Ricevere notifiche stage'],'Club/Dirigente':['Creare evento selezione + QR','Delegato temporaneo con scadenza','Vedere carico segnalazioni','Import da foglio di calcolo'],'Osservatore/Scout':['Valutazione mobile','Nota vocale in testo','Geolocalizzazione opt-in','Passaggio segnalazioni in assenza'],'Privacy Officer':['Report semplificato non tecnico','Log immutabile blocchi','Coda art. 22','Audit escalation'],'Admin':['Blocco attivita profilo graduato','Riesame su richiesta','War Room AI Dev Team','KPI operativi'],'Match Analyst':['Compilare report 8 blocchi','Mappa di calore semplificata','Comparatore giocatori','Esportazione report'],'Procuratore':['Shortlist svincolati','Segui profilo talento','Richiesta contatto tracciata','Piano osservatore indipendente']};
return '<h1 class="es-int-h">Azioni possibili per ruolo</h1><p class="es-int-sub">Campione operativo sez. 13 + Match Analyst + I3.</p>'+Object.keys(samples).map(function(role){return '<div class="es-int-box"><strong style="color:#38bdf8">'+esc(role)+'</strong><div class="es-int-row" style="margin-top:.55rem">'+samples[role].map(function(a){return '<button type="button" class="es-int-btn es-role-act" data-role="'+esc(role)+'" data-act="'+esc(a)+'">'+esc(a)+'</button>';}).join('')+'</div></div>';}).join('')+'<div class="es-int-box"><strong style="color:#7dd3fc">Log azioni simulate</strong><div id="es-role-log-body" style="margin-top:.5rem;font-size:.78rem;color:#94a3b8"></div></div>';
}

function panelAdmin(){
var blocks=load(LS.blocks,[]);var reports=load(LS.poReports,[]);
var blockRows=blocks.length?blocks.map(function(b){return '<tr><td>'+esc(b.user)+'</td><td>'+esc(b.level)+'</td><td>'+esc(b.reason)+'</td><td>'+esc(b.at)+'</td><td><span class="es-int-pill '+(b.review==='pending'?'yellow':b.review==='accepted'?'green':'blue')+'">'+esc(b.review||'active')+'</span></td><td><button type="button" class="es-int-btn es-block-review" data-id="'+b.id+'">Riesame PO</button></td></tr>';}).join(''):'<tr><td colspan="6" style="color:#64748b">Nessun blocco.</td></tr>';
var repRows=reports.length?reports.map(function(r){return '<tr><td>'+esc(r.level)+'</td><td>'+esc(r.what)+'</td><td>'+esc(r.done)+'</td><td>'+esc(r.you)+'</td><td>'+esc(r.at)+'</td></tr>';}).join(''):'<tr><td colspan="5" style="color:#64748b">Nessun report.</td></tr>';
return '<h1 class="es-int-h">Admin — Blocco profilo e Privacy Officer</h1><p class="es-int-sub">Sez. 2-3 I2: blocco graduato, notifica, riesame, log write-once, report semplificato.</p><div class="es-int-box"><h3 style="margin:0 0 .75rem;color:#fff;font-size:1rem">Nuovo blocco attivita</h3><div class="es-int-row" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.65rem"><div class="es-int-field" style="margin:0"><label class="es-int-label">Utente</label><input class="es-int-input" id="es-blk-user"></div><div class="es-int-field" style="margin:0"><label class="es-int-label">Livello</label><select class="es-int-select" id="es-blk-level"><option>Sola messaggistica sospesa</option><option>Visibilita profilo ridotta</option><option>Blocco login temporaneo</option><option>Blocco totale</option></select></div><div class="es-int-field" style="margin:0"><label class="es-int-label">Motivazione</label><input class="es-int-input" id="es-blk-reason"></div></div><div class="es-int-row" style="margin-top:.75rem"><button type="button" class="es-int-btn danger" id="es-blk-add">Registra blocco + log</button></div></div><div class="es-int-box" style="overflow-x:auto"><strong style="color:#7dd3fc">Log blocchi (append-only)</strong><table class="es-int-table" style="margin-top:.5rem"><thead><tr><th>Utente</th><th>Livello</th><th>Motivo</th><th>Quando</th><th>Riesame</th><th></th></tr></thead><tbody>'+blockRows+'</tbody></table></div><div class="es-int-box"><h3 style="margin:0 0 .75rem;color:#fff;font-size:1rem">Report semplificato Privacy Officer</h3><div class="es-int-field"><label class="es-int-label">Cosa e successo</label><input class="es-int-input" id="es-po-what"></div><div class="es-int-field"><label class="es-int-label">Cosa abbiamo fatto</label><input class="es-int-input" id="es-po-done"></div><div class="es-int-field"><label class="es-int-label">Cosa devi fare tu</label><input class="es-int-input" id="es-po-you"></div><div class="es-int-field"><label class="es-int-label">Rischio</label><select class="es-int-select" id="es-po-level"><option value="basso">Basso</option><option value="medio">Medio</option><option value="alto">Alto</option></select></div><button type="button" class="es-int-btn primary" id="es-po-add">Genera report</button></div><div class="es-int-box" style="overflow-x:auto"><strong style="color:#7dd3fc">Report PO</strong><table class="es-int-table" style="margin-top:.5rem"><thead><tr><th>Rischio</th><th>Successo</th><th>Azione nostra</th><th>Azione utente</th><th>Quando</th></tr></thead><tbody>'+repRows+'</tbody></table></div><div class="es-int-box"><strong style="color:#7dd3fc">Antifrode — base giuridica</strong><p style="font-size:.82rem;color:#cbd5e1;line-height:1.5;margin:.5rem 0 0">Il sistema antifrode opera per adempimento di obblighi legali ai sensi dell art. 6, par. 1, lett. c) GDPR, con riferimento alla prevenzione di attivita fraudolente e, ove applicabile, al D.Lgs. 231/2007. Misure graduate e log immutabili.</p></div>';
}
function panelPrivacy(){
// Vista Privacy Officer: report + riesami (stesso motore di panelAdmin, titolo diverso)
var html=panelAdmin();
return html.replace('Admin — Blocco profilo e Privacy Officer','Responsabile Privacy — Report e riesami')
  .replace('Admin \u00b7 Blocco profilo & Privacy Officer','Responsabile Privacy — Report e riesami')
  .replace('Admin — Blocco profilo & Privacy Officer','Responsabile Privacy — Report e riesami');
}
function panelAgents(){
var careerList=CAREER_AGENTS.map(function(a,i){return '<span class="es-int-pill blue" style="margin:.2rem">'+(i+1)+'. '+esc(a)+'</span>';}).join(' ');
var ops=OPS_AGENTS_I3.map(function(a){return '<div class="es-int-box" style="margin-bottom:.5rem"><strong style="color:#38bdf8">'+esc(a.name)+'</strong><p style="margin:.35rem 0 0;font-size:.8rem;color:#94a3b8">'+esc(a.desc)+'</p></div>';}).join('');
return '<h1 class="es-int-h">Agenti IA operativi</h1><p class="es-int-sub">50 agenti carriera + 9 Ops I3. Catalogo completo 215+500 nel PDF consolidato.</p><div class="es-int-box"><strong style="color:#7dd3fc">50 · Simulatore carriera</strong><div style="margin-top:.65rem;line-height:1.9">'+careerList+'</div></div><div style="margin-top:1rem"><strong style="color:#7dd3fc">9 · Ops Integrazioni 3</strong>'+ops+'</div><div class="es-int-box"><strong style="color:#fcd34d">Riferimento</strong><p style="margin:.4rem 0 0;font-size:.82rem;color:#cbd5e1">Apri <code>Elisee_Scout_COMPLETO_consolidato.pdf</code> (341 pagine).</p></div>';
}
function panelKpi(){
var k=load(LS.kpi,defaultKpi());
function kpi(val,unit,label){return '<div class="es-kpi"><div class="n">'+val+'<span style="font-size:.75rem;color:#64748b">'+unit+'</span></div><div class="l">'+label+'</div></div>';}
return '<h1 class="es-int-h">KPI operativi (I3 · 6.10)</h1><p class="es-int-sub">Indicatori demo per carico dirigenti, mobile, eventi e minori.</p><div class="es-kpi-strip">'+kpi(k.signalResponseHours,'h','Tempo medio risposta segnalazione')+kpi(k.informalMigratedPct,'%','Profili migrati da fonti informali')+kpi(k.mobileEvalPct,'%','Valutazioni da mobile')+kpi(k.eventCreateMinutes,'min','Tempo medio creazione evento')+kpi(k.parentalConsentPct,'%','Consenso genitoriale pre-evento')+kpi(k.freeToPremiumPct,'%','Conversione free-premium')+kpi(k.informalCommsDownPct,'%','Calo comunicazioni informali')+'</div><div class="es-int-box"><button type="button" class="es-int-btn primary" id="es-kpi-improve">Simula +1 ciclo miglioramento</button> <button type="button" class="es-int-btn ghost" id="es-kpi-reset">Reset KPI</button></div>';
}
function bindPanel(id){
if(id==='hub'){main.querySelectorAll('[data-go]').forEach(function(el){el.addEventListener('click',function(){showPanel(el.getAttribute('data-go'));});});}
if(id==='career')bindCareer();
if(id==='team')bindTeam();
if(id==='events')bindEvents();
if(id==='analyst')bindAnalyst();
if(id==='roles')bindRoles();
if(id==='admin')bindAdmin();
if(id==='kpi')bindKpi();
}
function bindCareer(){
var consentBtn=document.getElementById('es-career-consent');
if(consentBtn)consentBtn.addEventListener('click',function(){var cur=!!load(LS.consentCareer,false);save(LS.consentCareer,!cur);toast(!cur?'Consenso carriera attivato':'Consenso revocato',!cur?'success':'info');showPanel('career');});
var reset=document.getElementById('es-career-reset');
if(reset)reset.addEventListener('click',function(){save(LS.career,defaultCareer());toast('Stagione resettata');showPanel('career');});
if(!load(LS.consentCareer,false))return;
drawRadar(load(LS.career,defaultCareer()).radar);
var bivioBtn=document.getElementById('es-career-bivio');if(bivioBtn)bivioBtn.addEventListener('click',showBivio);
var prom=document.getElementById('es-career-promote');
if(prom)prom.addEventListener('click',function(){var c=load(LS.career,defaultCareer());if(c.categoryIndex<CATEGORIES.length-2)c.categoryIndex++;c.objectiveProgress=Math.min(3,c.objectiveProgress+1);save(LS.career,c);toast('Promozione: '+CATEGORIES[c.categoryIndex]);showPanel('career');});
var end=document.getElementById('es-career-end');if(end)end.addEventListener('click',endSeason);
}
function showBivio(){
var c=load(LS.career,defaultCareer());var pool=BIVI.filter(function(b){return c.usedBivi.indexOf(b.id)<0;});if(!pool.length){c.usedBivi=[];pool=BIVI.slice();}
var b=pool[Math.floor(Math.random()*pool.length)];var slot=document.getElementById('es-bivio-slot');if(!slot)return;
slot.innerHTML='<div class="es-bivio"><h4>Bivio decisionale</h4><p style="margin:0;color:#cbd5e1;font-size:.9rem">'+esc(b.title)+'</p><div class="es-bivio-opts">'+b.options.map(function(o,i){return '<button type="button" data-bi="'+b.id+'" data-oi="'+i+'">'+esc(o.t)+'</button>';}).join('')+'</div></div>';
slot.querySelectorAll('button').forEach(function(btn){btn.addEventListener('click',function(){applyBivio(btn.getAttribute('data-bi'),parseInt(btn.getAttribute('data-oi'),10));});});
}
function applyBivio(bid,oi){
var b=BIVI.find(function(x){return x.id===bid;});if(!b)return;var opt=b.options[oi];var c=load(LS.career,defaultCareer());
Object.keys(opt.tags).forEach(function(t){c.radar[t]=Math.max(0,Math.min(100,(c.radar[t]||50)+opt.tags[t]*4));});
c.usedBivi.push(bid);c.history.push({bivio:b.title,choice:opt.t,at:new Date().toISOString()});c.objectiveProgress=Math.min(3,c.objectiveProgress+1);save(LS.career,c);toast('Scelta registrata');showPanel('career');
}
function endSeason(){
var c=load(LS.career,defaultCareer());
var summary={season:c.season,category:CATEGORIES[c.categoryIndex],objective:c.objective,reached:c.objectiveProgress>=3,bivi:c.history.length,radar:Object.assign({},c.radar),highlight:c.history.length?c.history[c.history.length-1].choice:'Nessun bivio',at:new Date().toLocaleString('it-IT')};
c.seasons.unshift(summary);c.season+=1;c.objectiveProgress=0;c.history=[];c.usedBivi=[];c.objective=summary.reached?'Mantieni lo standard da titolare':'Riconquista un posto da titolare';save(LS.career,c);
var box=document.getElementById('es-season-summary');
if(box)box.innerHTML='<div class="es-int-box" style="margin-top:.75rem;border-color:rgba(34,197,94,.35)"><strong style="color:#86efac">Riepilogo stagione S'+summary.season+'</strong><p style="margin:.5rem 0 0;font-size:.85rem;color:#cbd5e1;line-height:1.5">Categoria: <b>'+esc(summary.category)+'</b><br>Obiettivo: <b>'+(summary.reached?'RAGGIUNTO':'PARZIALE')+'</b><br>Bivi: '+summary.bivi+' · Highlight: '+esc(summary.highlight)+'</p></div>';
toast('Stagione archiviata');drawRadar(c.radar);
}
function drawRadar(radar){
var canvas=document.getElementById('es-radar');if(!canvas||!canvas.getContext)return;var ctx=canvas.getContext('2d');var w=canvas.width,h=canvas.height,cx=w/2,cy=h/2,R=Math.min(w,h)*0.38;
ctx.clearRect(0,0,w,h);ctx.fillStyle='#070d16';ctx.fillRect(0,0,w,h);var n=TRAITS.length;
for(var ring=1;ring<=4;ring++){ctx.beginPath();for(var i=0;i<n;i++){var ang=-Math.PI/2+(i*2*Math.PI)/n;var rr=(R*ring)/4;var x=cx+Math.cos(ang)*rr;var y=cy+Math.sin(ang)*rr;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.strokeStyle='rgba(56,189,248,.15)';ctx.stroke();}
ctx.font='10px Inter,sans-serif';ctx.fillStyle='#94a3b8';
TRAITS.forEach(function(t,i){var ang=-Math.PI/2+(i*2*Math.PI)/n;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(ang)*R,cy+Math.sin(ang)*R);ctx.strokeStyle='rgba(56,189,248,.2)';ctx.stroke();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,cx+Math.cos(ang)*(R+18),cy+Math.sin(ang)*(R+18));});
ctx.beginPath();TRAITS.forEach(function(t,i){var ang=-Math.PI/2+(i*2*Math.PI)/n;var v=Math.max(0,Math.min(100,radar[t]||50))/100;var x=cx+Math.cos(ang)*R*v;var y=cy+Math.sin(ang)*R*v;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
ctx.closePath();ctx.fillStyle='rgba(56,189,248,.25)';ctx.strokeStyle='#38bdf8';ctx.lineWidth=2;ctx.fill();ctx.stroke();
}
function bindTeam(){
document.querySelectorAll('[data-team]').forEach(function(btn){btn.addEventListener('click',function(){var t=SAMPLE_TEAMS.find(function(x){return x.id===btn.getAttribute('data-team');});if(!t)return;save(LS.team,t);toast('Squadra: '+t.name);showPanel('team');});});
var clr=document.getElementById('es-team-clear');if(clr)clr.addEventListener('click',function(){save(LS.team,null);toast('Selezione rimossa','info');showPanel('team');});
}
function bindEvents(){
var create=document.getElementById('es-ev-create');
if(create)create.addEventListener('click',function(){var title=(document.getElementById('es-ev-title').value||'').trim();if(!title){toast('Inserisci un titolo','error');return;}var events=load(LS.events,[]);events.unshift({id:uid('ev'),title:title,date:document.getElementById('es-ev-date').value||'',place:document.getElementById('es-ev-place').value||'',fascia:document.getElementById('es-ev-fascia').value||'',limit:parseInt(document.getElementById('es-ev-limit').value,10)||40,minors:!!document.getElementById('es-ev-minors').checked,adesioni:0,createdAt:new Date().toISOString()});save(LS.events,events);toast('Evento creato con QR');showPanel('events');});
var tpl=document.getElementById('es-ev-template');
if(tpl)tpl.addEventListener('click',function(){document.getElementById('es-ev-title').value='Stage di selezione - template standard';document.getElementById('es-ev-fascia').value='U15-U17';document.getElementById('es-ev-limit').value='40';document.getElementById('es-ev-place').value='Campo comunale';document.getElementById('es-ev-minors').checked=true;toast('Template caricato','info');});
document.querySelectorAll('.es-ev-join').forEach(function(btn){btn.addEventListener('click',function(){var events=load(LS.events,[]);var ev=events.find(function(e){return e.id===btn.getAttribute('data-id');});if(!ev)return;if(ev.limit&&ev.adesioni>=ev.limit){toast('Limite posti raggiunto','error');return;}ev.adesioni=(ev.adesioni||0)+1;save(LS.events,events);toast('Adesione registrata'+(ev.minors?' · verifica consenso minori':''));showPanel('events');});});
}
function bindAnalyst(){
var saveBtn=document.getElementById('es-ma-save');
if(saveBtn)saveBtn.addEventListener('click',function(){var rep={id:uid('ma'),createdAt:new Date().toLocaleString('it-IT')};document.querySelectorAll('.es-ma-field').forEach(function(el){rep[el.getAttribute('data-k')]=el.value.trim();});if(!rep.tesi){toast('Compila la tesi','error');return;}var all=load(LS.maReports,[]);all.unshift(rep);save(LS.maReports,all.slice(0,50));toast('Report salvato');showPanel('analyst');});
var ai=document.getElementById('es-ma-ai');
if(ai)ai.addEventListener('click',function(){var map={tesi:'La squadra costruisce dal basso ma resta esposta sul lato destro in non possesso.',contesto:'Eccellenza, giornata 4, scontro diretto.',identita:'Con palla 3-2-5. Senza palla blocco medio.',dati:'Possesso 54% - tiri in porta 6-3 - cross 4/11.',modulo:'Base 4-3-3 -> possesso 3-2-5.',chiavi:'Mediano regista; esterno sinistro crea superiorita.',vulnerabilita:'Corsia destra in transizione negativa.',conclusione:'Solidita centrale, debolezza sul lato destro da correggere.'};document.querySelectorAll('.es-ma-field').forEach(function(el){var k=el.getAttribute('data-k');if(!el.value.trim())el.value=map[k]||'';});toast('Bozza generata con Disclaimer Legale AI');});
var fbBtn=document.getElementById('es-fb-submit');
if(fbBtn)fbBtn.addEventListener('click',function(){
  var aiScore=parseFloat(document.getElementById('es-fb-aiscore').value)||7.5;
  var humanScore=parseFloat(document.getElementById('es-fb-humanscore').value)||8.0;
  var reason=(document.getElementById('es-fb-reason').value||'').trim();
  window.EliseeIntegrazioni.submitAIFeedback('scout_active', null, aiScore, humanScore, reason);
  showPanel('analyst');
});
}
function bindRoles(){
renderRoleLog();
document.querySelectorAll('.es-role-act').forEach(function(btn){btn.addEventListener('click',function(){var log=load(LS.rolesLog,[]);log.unshift({role:btn.getAttribute('data-role'),act:btn.getAttribute('data-act'),at:new Date().toLocaleString('it-IT')});save(LS.rolesLog,log.slice(0,100));toast('Azione: '+btn.getAttribute('data-act'));renderRoleLog();});});
}
function renderRoleLog(){var body=document.getElementById('es-role-log-body');if(!body)return;var log=load(LS.rolesLog,[]);body.innerHTML=log.length?log.slice(0,12).map(function(l){return '<div style="padding:.25rem 0;border-bottom:1px solid rgba(148,163,184,.08)"><b style="color:#7dd3fc">'+esc(l.role)+'</b> — '+esc(l.act)+' <span style="color:#64748b">('+esc(l.at)+')</span></div>';}).join(''):'Nessuna azione ancora.';}
function bindAdmin(){
var add=document.getElementById('es-blk-add');
if(add)add.addEventListener('click',function(){var user=(document.getElementById('es-blk-user').value||'').trim();if(!user){toast('Indica l utente','error');return;}var blocks=load(LS.blocks,[]);blocks.unshift({id:uid('blk'),user:user,level:document.getElementById('es-blk-level').value,reason:document.getElementById('es-blk-reason').value||'non specificato',at:new Date().toLocaleString('it-IT'),review:'active',immutable:true,hash:'sha-demo-'+Math.random().toString(36).slice(2,10)});save(LS.blocks,blocks);var reports=load(LS.poReports,[]);reports.unshift({level:'medio',what:'Blocco attivita su profilo '+user,done:document.getElementById('es-blk-level').value,you:'Puoi richiedere un riesame al Privacy Officer.',at:new Date().toLocaleString('it-IT')});save(LS.poReports,reports);toast('Blocco registrato + report PO');showPanel('admin');});
document.querySelectorAll('.es-block-review').forEach(function(btn){btn.addEventListener('click',function(){var id=btn.getAttribute('data-id');var blocks=load(LS.blocks,[]).map(function(b){return b.id===id?Object.assign({},b,{review:'pending',reviewAt:new Date().toISOString()}):b;});save(LS.blocks,blocks);toast('Riesame inoltrato al PO');showPanel('admin');});});
var po=document.getElementById('es-po-add');
if(po)po.addEventListener('click',function(){var what=(document.getElementById('es-po-what').value||'').trim();if(!what){toast('Compila il campo','error');return;}var reports=load(LS.poReports,[]);reports.unshift({level:document.getElementById('es-po-level').value,what:what,done:document.getElementById('es-po-done').value||'-',you:document.getElementById('es-po-you').value||'-',at:new Date().toLocaleString('it-IT')});save(LS.poReports,reports);toast('Report PO generato');showPanel('admin');});
}
function bindKpi(){
var imp=document.getElementById('es-kpi-improve');
if(imp)imp.addEventListener('click',function(){var k=load(LS.kpi,defaultKpi());k.signalResponseHours=Math.max(2,+(k.signalResponseHours*0.9).toFixed(1));k.informalMigratedPct=Math.min(100,k.informalMigratedPct+5);k.mobileEvalPct=Math.min(100,k.mobileEvalPct+2);k.eventCreateMinutes=Math.max(2,+(k.eventCreateMinutes*0.92).toFixed(1));k.parentalConsentPct=Math.min(100,k.parentalConsentPct+1);k.freeToPremiumPct=Math.min(40,+(k.freeToPremiumPct+0.4).toFixed(1));k.informalCommsDownPct=Math.min(80,k.informalCommsDownPct+3);save(LS.kpi,k);toast('KPI aggiornati');showPanel('kpi');});
var rst=document.getElementById('es-kpi-reset');if(rst)rst.addEventListener('click',function(){save(LS.kpi,defaultKpi());toast('KPI resettati','info');showPanel('kpi');});
}
function injectEntryPoints(){
  if(_esIntInjecting)return;
  _esIntInjecting=true;
  try{
  // RIMUOVI Ops Hub dalla nav pubblica
  var pub=document.getElementById('es-int-nav-chip');
  if(pub)pub.remove();

  // --- Area UTENTE (dropdown se loggato) ---
  var dd=document.getElementById('user-dropdown-menu');
  if(dd&&!document.getElementById('es-int-user-link')){
    var link=document.createElement('a');
    link.href='#';link.id='es-int-user-link';
    link.style.cssText='display:flex;align-items:center;gap:0.65rem;padding:0.65rem 1rem;color:#e2e8f0;font-size:0.83rem;font-weight:600;text-decoration:none';
    link.innerHTML='<span style="color:#38bdf8">◆</span> I miei strumenti';
    link.addEventListener('click',function(e){
      e.preventDefault();
      if(typeof window.closeUserDropdown==='function')window.closeUserDropdown();
      open('hub','user');
    });
    var logout=dd.querySelector('a[onclick*="logoutUser"]');
    if(logout)dd.insertBefore(link,logout);else dd.appendChild(link);
  }

  // --- Area ADMIN: card + chip toolbar ---
  var wr=document.querySelector('.wr-admin-trigger-card');
  var dash=document.getElementById('admin-authenticated-dashboard');
  if(dash&&!document.getElementById('es-int-admin-card')){
    var card=document.createElement('div');
    card.id='es-int-admin-card';
    card.className='wr-admin-trigger-card es-int-admin-card';
    card.style.marginTop='1rem';
    card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem"><div><div class="pf-section-label" style="margin-bottom:.4rem"><span>STRUMENTI ADMIN</span><span class="pf-section-line"></span><span style="font-size:.72rem;color:#38bdf8;font-weight:bold">NON PUBBLICO</span></div><h3 style="margin:0 0 .4rem;color:#fff;font-size:1.2rem;font-weight:900">Moduli operativi Admin</h3><p style="margin:0;color:#cbd5e1;font-size:.88rem;max-width:620px;line-height:1.5">Blocchi profilo, agenti IA, KPI. Separati da area utente e Privacy.</p></div><button type="button" class="btn-war-room-trigger" id="es-int-admin-open">Apri strumenti Admin</button></div>';
    var apCard=document.getElementById('es-ap-admin-card-static');
    if(apCard&&apCard.parentNode)apCard.parentNode.insertBefore(card,apCard.nextSibling);
    else if(wr&&wr.parentNode)wr.parentNode.insertBefore(card,wr);
    else dash.appendChild(card);
    var b=document.getElementById('es-int-admin-open');
    if(b)b.addEventListener('click',function(){open('hub','admin');});
  }
  var tbAdmin=document.getElementById('btn-show-admin');
  // chip extra next to autopilot if missing
  if(document.getElementById('admin-authenticated-dashboard')&&!document.getElementById('btn-show-int-admin')){
    var chips=document.querySelector('#admin-authenticated-dashboard .pf-chips');
    if(chips){
      var c=document.createElement('button');
      c.type='button';c.id='btn-show-int-admin';c.className='gov-btn pf-chip-btn';
      c.textContent='Strumenti Admin';
      c.style.cssText='border-color:rgba(56,189,248,.45);color:#7dd3fc';
      c.addEventListener('click',function(e){e.preventDefault();open('hub','admin');});
      chips.appendChild(c);
    }
  }

  // --- Area PRIVACY: chip in toolbar ---
  if(document.getElementById('admin-authenticated-dashboard')&&!document.getElementById('btn-show-int-privacy')){
    var chips2=document.querySelector('#admin-authenticated-dashboard .pf-chips');
    if(chips2){
      var c2=document.createElement('button');
      c2.type='button';c2.id='btn-show-int-privacy';c2.className='gov-btn pf-chip-btn';
      c2.textContent='Strumenti Privacy';
      c2.style.cssText='border-color:rgba(167,139,250,.5);color:#c4b5fd';
      c2.addEventListener('click',function(e){e.preventDefault();open('hub','privacy');});
      chips2.appendChild(c2);
    }
  }
  // Card privacy under dashboard when privacy panel active is harder — static card
  if(dash&&!document.getElementById('es-int-privacy-card')){
    var pcard=document.createElement('div');
    pcard.id='es-int-privacy-card';
    pcard.className='wr-admin-trigger-card';
    pcard.style.cssText='margin-top:1rem;border-color:rgba(167,139,250,.35)';
    pcard.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem"><div><div class="pf-section-label" style="margin-bottom:.4rem"><span>RESPONSABILE PRIVACY</span><span class="pf-section-line"></span><span style="font-size:.72rem;color:#c4b5fd;font-weight:bold">GDPR</span></div><h3 style="margin:0 0 .4rem;color:#fff;font-size:1.2rem;font-weight:900">Report e riesami</h3><p style="margin:0;color:#cbd5e1;font-size:.88rem;max-width:620px;line-height:1.5">Report semplificati per famiglie/dirigenti, riesami blocchi, log. Non in home pubblica.</p></div><button type="button" class="btn-war-room-trigger" id="es-int-privacy-open" style="background:linear-gradient(135deg,#7c3aed,#5b21b6)">Apri strumenti Privacy</button></div>';
    var after=document.getElementById('es-int-admin-card')||document.getElementById('es-ap-admin-card-static');
    if(after&&after.parentNode)after.parentNode.insertBefore(pcard,after.nextSibling);
    else dash.appendChild(pcard);
    var pb=document.getElementById('es-int-privacy-open');
    if(pb)pb.addEventListener('click',function(){open('hub','privacy');});
  }
}finally{_esIntInjecting=false;}
}
/** Bridge minigioco: landing/UI in minigioco-carriera.js */
function openCareerMinigame(){
  if(window.EliseeMinigioco&&typeof window.EliseeMinigioco.open==='function'){
    window.EliseeMinigioco.open();
    return;
  }
  if(typeof window.openMinigiocoCarriera==='function'&&window.openMinigiocoCarriera!==openCareerMinigame){
    window.openMinigiocoCarriera();
    return;
  }
  // fallback hub career
  try{ ensureDOM(); hubMode='user'; root.classList.add('is-open'); document.body.style.overflow='hidden'; showPanel('career'); }catch(e){ console.error(e); }
}
window.openMinigiocoCarriera=openCareerMinigame;
window.EliseeIntegrazioni={
  open:open,
  close:close,
  openUser:function(p){open(p||'hub','user');},
  openAdmin:function(p){open(p||'hub','admin');},
  openPrivacy:function(p){open(p||'hub','privacy');},
  openCareer:openCareerMinigame,
  openMinigioco:openCareerMinigame,
  closeMinigioco:function(){ if(window.EliseeMinigioco) window.EliseeMinigioco.close(); },
  openTeam:function(){open('team','user');},
  openEvents:function(){open('events','user');},
  openAnalyst:function(){open('analyst','user');},
  saveScoutEvaluation: function(scoutId, playerId, playerName, objectiveData, subjectiveData, confidence) {
    var evals = load(LS.evaluations, []);
    var record = {
      id: uid('eval'),
      scoutId: scoutId || 'scout_anon',
      playerId: playerId || 'player_default',
      playerName: playerName || 'Giocatore',
      timestamp: new Date().toISOString(),
      confidence: Math.max(1, Math.min(5, parseInt(confidence || 5, 10))),
      objectiveData: objectiveData || {},
      subjectiveData: subjectiveData || {},
      version: evals.filter(function(e){ return e.playerId === playerId; }).length + 1
    };
    evals.unshift(record);
    save(LS.evaluations, evals);
    toast('Valutazione per ' + record.playerName + ' salvata (v' + record.version + ')');
    return record;
  },
  getScoutEvaluations: function(playerId) {
    var evals = load(LS.evaluations, []);
    if(!playerId) return evals;
    return evals.filter(function(e){ return e.playerId === playerId; });
  },
  submitAIFeedback: function(scoutId, evaluationId, aiScore, humanScore, reason) {
    var feedback = load(LS.aiFeedback, []);
    var deltaNumeric = Number((humanScore - aiScore).toFixed(2));
    var entry = {
      id: uid('fb'),
      scoutId: scoutId || 'scout_anon',
      evaluationId: evaluationId || uid('eval'),
      timestamp: new Date().toISOString(),
      aiScore: Number(aiScore),
      humanScore: Number(humanScore),
      deltaNumeric: deltaNumeric,
      correctionReason: reason || 'Nessuna motivazione fornita',
      confirmedByHuman: true
    };
    feedback.unshift(entry);
    save(LS.aiFeedback, feedback);

    var tracker = load(LS.datasetTracker, { validatedCount: 42, targetFineTuning: 1000, lastUpdated: null });
    tracker.validatedCount += 1;
    tracker.lastUpdated = new Date().toISOString();
    save(LS.datasetTracker, tracker);

    toast('Feedback AI salvato. Delta: ' + (deltaNumeric > 0 ? '+' : '') + deltaNumeric + ' | Dataset: ' + tracker.validatedCount + '/' + tracker.targetFineTuning);
    return entry;
  },
  getDatasetProgress: function() {
    return load(LS.datasetTracker, { validatedCount: 42, targetFineTuning: 1000, lastUpdated: new Date().toISOString() });
  },
  getAIFeedbacks: function() {
    return load(LS.aiFeedback, []);
  },
  version:'2026-08-11_ROADMAP_AI_SCOUTING'
};

function boot(){
  if(_esIntBooted)return;
  _esIntBooted=true;
  // sblocca UI se un overlay ha lasciato body bloccato
  try{document.body.style.overflow='';document.documentElement.style.overflow='';}catch(e){}
  try{injectEntryPoints();}catch(e){console.error('[EliseeIntegrazioni]',e);}
  document.addEventListener('elisee:auth-changed',function(){try{injectEntryPoints();}catch(e){}});
  document.addEventListener('elisee:view-changed',function(){try{injectEntryPoints();}catch(e){}});
  // un solo retry se admin DOM non era pronto
  setTimeout(function(){try{injectEntryPoints();}catch(e){}},2000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
