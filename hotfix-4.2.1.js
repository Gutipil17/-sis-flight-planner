
(function(){
'use strict';
const $=id=>document.getElementById(id);
const SETTINGS_KEY='fplSettings';
const AIRCRAFT_PROFILES_KEY='gutipilotAircraftProfilesV1';

const defaults={
 HK3779:{type:'MI8'},HK4692:{type:'MI8'},HK5334:{type:'MI8'},
 HK3882:{type:'MI8'},HK3911:{type:'MI8'},HK4900:{type:'MI171'}
};

function settings(){
 try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');}catch{return{};}
}
function aircraftList(){
 const cfg=window.SIS_CONFIG?.aircraft||{};
 return Object.keys(cfg).length?Object.keys(cfg):Object.keys(defaults);
}
function activeReg(){
 const s=settings(),list=aircraftList();
 return list.includes(s.activeRegistration)?s.activeRegistration:(list.includes('HK3911')?'HK3911':list[0]);
}
function saveActive(reg){
 const s=settings();s.activeRegistration=reg;
 localStorage.setItem(SETTINGS_KEY,JSON.stringify(s));
}
function fillSelect(id,selected){
 const el=$(id);if(!el)return;
 const list=aircraftList();
 el.innerHTML=list.map(reg=>`<option value="${reg}">${reg}</option>`).join('');
 el.value=list.includes(selected)?selected:list[0];
 el.disabled=false;
}
function aircraftType(reg){
 if(reg==='HK4900')return'MI-171';
 return'MI-8';
}
function syncAircraft(reg){
 if(!reg)return;
 saveActive(reg);
 ['quickAircraftSelect','aircraftProfileSelect','registration'].forEach(id=>{
   const el=$(id);
   if(el && [...el.options].some(o=>o.value===reg))el.value=reg;
 });
 if($('quickAircraftType'))$('quickAircraftType').textContent=aircraftType(reg);
 if($('copilotActiveAircraft'))$('copilotActiveAircraft').textContent=reg;
 try{if(typeof window.applyAircraftProfile==='function')window.applyAircraftProfile(reg);}catch(e){console.warn('Perfil principal no disponible',e);}
}
function buildContext(){
 const g=id=>$(id)?.value||'';
 const other=g('variableOtherInfo');
 return{
   registration:g('registration')||activeReg(),
   departure:g('departure'),destination:g('destination'),
   flightDate:g('flightDate'),departureTime:g('departureTime'),
   eet:g('eet'),level:g('level'),endurance:g('endurance'),pob:g('pob'),
   dep:(other.match(/(?:^|\s)DEP\/(.+?)(?=\s+[A-Z]{2,5}\/|$)/)||[])[1]||'',
   dest:(other.match(/(?:^|\s)DEST\/(.+?)(?=\s+[A-Z]{2,5}\/|$)/)||[])[1]||''
 };
}
let lastResult=null;
function renderAnalysis(result){
 lastResult=result;
 const section=$('voicePreviewSection'),box=$('voiceRecognizedFields'),messages=$('voiceMissingFields');
 const status=$('voicePreviewStatus'),apply=$('applyVoicePlanBtn');
 if(!section||!box||!messages)return;
 section.classList.remove('hidden');
 const labels=window.GutiPilotTextEngine?.FIELD_LABELS||{};
 box.innerHTML=Object.entries(result.fields||{}).map(([key,value])=>`
   <div class="voice-field valid">
     <span class="voice-field-label">${labels[key]||key}</span>
     <span class="voice-field-value">${value}</span>
     <span class="voice-field-source">Motor GutiPilot 4.2.1</span>
   </div>`).join('')||'<div class="validation-message error">No se reconocieron datos. Dicta con pausas y vuelve a analizar.</div>';
 const notes=[
   ...(result.errors||[]).map(t=>['error','✕',t]),
   ...(result.warnings||[]).map(t=>['warning','⚠',t])
 ];
 messages.innerHTML=notes.length?notes.map(n=>`<div class="validation-message ${n[0]}">${n[1]} ${n[2]}</div>`).join(''):'<div class="validation-message valid">✓ Texto analizado. Revisa los datos antes de aplicarlos.</div>';
 const blocked=(result.errors||[]).length>0||!Object.keys(result.fields||{}).length;
 if(status){
   status.className='validation-pill '+(blocked?'error':(result.warnings||[]).length?'warning':'valid');
   status.textContent=blocked?'FALTAN DATOS':(result.warnings||[]).length?'REVISAR':'LISTO';
 }
 if(apply)apply.disabled=blocked;
}
function analyze(){
 const text=$('voiceTranscript')?.value?.trim()||'';
 if(!text){
   alert('Primero dicta o escribe el plan en el cuadro de texto.');
   $('voiceTranscript')?.focus();return;
 }
 if(!window.GutiPilotTextEngine?.parse){
   alert('El motor de análisis no se cargó. Cierra la aplicación, vuelve a abrirla y pulsa Recargar aplicación.');
   return;
 }
 try{
   renderAnalysis(window.GutiPilotTextEngine.parse(text,buildContext()));
 }catch(error){
   console.error(error);
   alert('No se pudo analizar el texto: '+error.message);
 }
}
function setField(id,value){
 const el=$(id);if(!el||value===undefined||value==='')return;
 el.value=value;
 el.dispatchEvent(new Event('input',{bubbles:true}));
 el.dispatchEvent(new Event('change',{bubbles:true}));
}
function applyAnalysis(){
 if(!lastResult||lastResult.errors?.length)return;
 const f=lastResult.fields||{};
 ['registration','departure','departureTime','destination','flightDate','route','level','speed','eet','endurance','pob','alternate1','flightRules','flightType','wakeCategory'].forEach(k=>setField(k,f[k]));
 if(f.remarks)setField('remarks',f.remarks);
 const parts=[];
 if(f.dep)parts.push('DEP/'+f.dep);
 if(f.dest)parts.push('DEST/'+f.dest);
 if(f.flightDate){
   const [y,m,d]=f.flightDate.split('-');parts.push('DOF/'+y.slice(-2)+m+d);
 }
 if(f.remarks)parts.push('RMK/'+f.remarks);
 if(parts.length)setField('variableOtherInfo',parts.join(' '));
 $('voiceAssistantModal')?.classList.add('hidden');
 document.body.classList.remove('modal-open');
 $('manualPlanStart')?.scrollIntoView({behavior:'smooth'});
}
function init(){
 const reg=activeReg();
 fillSelect('quickAircraftSelect',reg);
 fillSelect('aircraftProfileSelect',reg);
 // main registration select may already be present but empty
 const main=$('registration');
 if(main && main.options.length===0)fillSelect('registration',reg);
 syncAircraft(reg);

 $('quickAircraftSelect')?.addEventListener('change',e=>syncAircraft(e.target.value));
 $('aircraftProfileSelect')?.addEventListener('change',e=>{
   syncAircraft(e.target.value);
   try{if(typeof window.renderAircraftProfileEditor==='function')window.renderAircraftProfileEditor(e.target.value);}catch{}
 });
 $('registration')?.addEventListener('change',e=>syncAircraft(e.target.value));

 const analyzeBtn=$('analyzeVoiceBtn');
 if(analyzeBtn){
   analyzeBtn.onclick=null;
   analyzeBtn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();analyze();},true);
 }
 const applyBtn=$('applyVoicePlanBtn');
 if(applyBtn){
   applyBtn.onclick=null;
   applyBtn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();applyAnalysis();},true);
 }
 const state=$('voiceListeningState');
 if(state){state.className='voice-listening-state done';state.textContent='Motor de análisis listo. Dicta con el micrófono del teclado y pulsa “Analizar dictado”.';}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
