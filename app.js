
const CFG = window.SIS_CONFIG;
const { jsPDF } = window.jspdf;
const STORAGE_SETTINGS = 'sis-flight-settings-v1';
const STORAGE_HISTORY = 'sis-flight-history-v1';
let deferredPrompt = null;
let lastPdfBlob = null;

const $ = id => document.getElementById(id);
const upper = value => String(value || '').trim().toUpperCase();
const today = () => new Date().toISOString().slice(0,10);
const defaultSettings = {...CFG.fixed};

function getSettings(){
  try { return {...defaultSettings, ...JSON.parse(localStorage.getItem(STORAGE_SETTINGS) || '{}')}; }
  catch { return {...defaultSettings}; }
}
function saveSettings(value){ localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(value)); }
function getHistory(){
  try { return JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]'); }
  catch { return []; }
}
function saveHistory(items){ localStorage.setItem(STORAGE_HISTORY, JSON.stringify(items.slice(0,60))); }
function toast(message){
  const el=$('toast'); el.textContent=message; el.classList.remove('hidden');
  setTimeout(()=>el.classList.add('hidden'),2200);
}
function normalizeCode(value, length){
  return upper(value).replace(/[^A-Z0-9]/g,'').slice(0,length);
}
function onlyDigits(value, length){ return String(value||'').replace(/\D/g,'').slice(0,length); }

function loadAircraft(){
  const select=$('registration');
  select.innerHTML=Object.keys(CFG.aircraft).map(reg=>`<option value="${reg}">${reg}</option>`).join('');
  select.value='HK3911';
}
function loadFormDefaults(){
  const s=getSettings();
  $('flightDate').value=today();
  $('pilotInCommand').value=s.contactName;
  $('pilotLicense').value=s.pilotLicense || '';
  $('aircraftColour').value=s.aircraftColour || 'BLANCO';
  updateFixedPreview();
}
function loadSettingsForm(){
  const s=getSettings();
  $('operator').value=s.operator;
  $('contactName').value=s.contactName;
  $('contactPhone').value=s.contactPhone;
  $('contactEmail').value=s.contactEmail;
  $('mission').value=s.mission;
  $('equipmentComNav').value=s.equipmentComNav || '';
  $('defaultLicense').value=s.pilotLicense || '';
}
function updateFixedPreview(){
  const s=getSettings(), ac=CFG.aircraft[$('registration').value];
  $('fixedPreview').textContent=[
    `OPR/${s.operator} CODE/${ac.code} SUR/${ac.sur}`,
    `RMK/${s.mission}`,
    `CONTACT/${s.contactName} TEL/${s.contactPhone}`,
    `EMAIL/${s.contactEmail}`
  ].join('\n');
}
function buildOtherInfo(){
  const s=getSettings(), ac=CFG.aircraft[$('registration').value];
  const variable=upper($('variableOtherInfo').value);
  return [
    `OPR/${s.operator} CODE/${ac.code} SUR/${ac.sur}`,
    variable,
    `RMK/${s.mission}`,
    `CONTACT/${s.contactName} TEL/${s.contactPhone}`,
    `EMAIL/${s.contactEmail}`
  ].filter(Boolean).slice(0,5);
}
function splitWords(text, maxChars, maxLines){
  const words=upper(text).replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
  const lines=[]; let current='';
  for(const word of words){
    const candidate=current ? `${current} ${word}` : word;
    if(candidate.length<=maxChars) current=candidate;
    else { if(current) lines.push(current); current=word; }
    if(lines.length>=maxLines) break;
  }
  if(current && lines.length<maxLines) lines.push(current);
  while(lines.length<maxLines) lines.push('');
  return lines.slice(0,maxLines);
}
function fieldRect(name){
  const r=CFG.fieldRects[name];
  if(!r) throw new Error(`Campo no encontrado: ${name}`);
  return {x:r[0],y:r[1],w:r[2]-r[0],h:r[3]-r[1]};
}
function drawCentered(doc,name,text,size=9){
  if(!text) return;
  const r=fieldRect(name);
  doc.setFont('helvetica','normal'); doc.setFontSize(size);
  doc.text(String(text),r.x+r.w/2,r.y+r.h/2+size*.28,{align:'center'});
}
function drawLeft(doc,name,text,size=7.3,pad=4){
  if(!text) return;
  const r=fieldRect(name);
  doc.setFont('helvetica','normal'); doc.setFontSize(size);
  doc.text(String(text),r.x+pad,r.y+r.h/2+size*.28);
}
function drawComb(doc,name,text,cells,size=9.5){
  text=String(text||'').slice(0,cells);
  const r=fieldRect(name), cellW=r.w/cells;
  doc.setFont('helvetica','normal'); doc.setFontSize(size);
  [...text].forEach((char,i)=>doc.text(char,r.x+cellW*(i+.5),r.y+r.h/2+size*.28,{align:'center'}));
}
function drawX(doc,name){
  const r=fieldRect(name), pad=Math.min(r.w,r.h)*.22;
  doc.setDrawColor(0); doc.setLineWidth(Math.max(.7,Math.min(r.w,r.h)*.07));
  doc.line(r.x+pad,r.y+pad,r.x+r.w-pad,r.y+r.h-pad);
  doc.line(r.x+pad,r.y+r.h-pad,r.x+r.w-pad,r.y+pad);
}
function addBackground(doc){
  doc.addImage('assets/plan-background.png','PNG',0,0,612,792,undefined,'FAST');
}
async function createPdf(){
  const s=getSettings(), reg=$('registration').value, ac=CFG.aircraft[reg];
  const dateParts=$('flightDate').value.split('-');
  if(dateParts.length!==3) throw new Error('Fecha inválida.');
  const [year,month,day]=dateParts;
  const doc=new jsPDF({orientation:'portrait',unit:'pt',format:[612,792],compress:true});
  addBackground(doc);

  drawComb(doc,'Aircraft_ID',reg,7,9.2);
  drawCentered(doc,'Flight_Rules',s.flightRules||'V',10);
  drawCentered(doc,'Flight_Type',s.flightType||'M',10);
  drawComb(doc,'Aircraft_Number',ac.number||'01',2,9);
  drawCentered(doc,'Aircraft_Type',ac.type||'MI8',9.5);
  drawCentered(doc,'Wake_Turbulence_Category',ac.wake||'M',10);
  drawLeft(doc,'Equipment_COM_NAV',s.equipmentComNav||'',9,5);
  drawCentered(doc,'Equipment_Surveillance',ac.sur||'260B',9);

  drawComb(doc,'Departure_Aerodrome',normalizeCode($('departure').value,4),4,9.3);
  drawComb(doc,'Departure_Time',onlyDigits($('departureTime').value,4),4,9.3);
  drawComb(doc,'Cruising_Speed',normalizeCode($('speed').value,5),5,9.1);
  drawComb(doc,'Cruising_Level',normalizeCode($('level').value,5),5,9.1);

  const routeLines=splitWords($('route').value,48,5);
  routeLines.forEach((line,i)=>drawLeft(doc,`Route_Line_${i+1}`,line,8.1,i===0?4:6));

  drawComb(doc,'Destination_Aerodrome',normalizeCode($('destination').value,4),4,9.3);
  drawComb(doc,'Total_EET',onlyDigits($('eet').value,4),4,9.1);
  drawComb(doc,'Alternate_Aerodrome_1',normalizeCode($('alternate1').value,4),4,9.1);
  drawComb(doc,'Alternate_Aerodrome_2',normalizeCode($('alternate2').value,4),4,9.1);

  buildOtherInfo().forEach((line,i)=>drawLeft(doc,`Other_Info_Line_${i+1}`,line,7.0,5));

  drawComb(doc,'Endurance',onlyDigits($('endurance').value,4),4,9);
  drawComb(doc,'Persons_On_Board',onlyDigits($('pob').value,3),3,9);

  const checks={
    Emergency_Radio_UHF:$('radioUHF').checked, Emergency_Radio_VHF:$('radioVHF').checked,
    Emergency_Radio_ELT:$('radioELT').checked,
    Survival_Equipment_None:$('survivalNone').checked,
    Survival_Equipment_Polar:$('survivalPolar').checked,
    Survival_Equipment_Desert:$('survivalDesert').checked,
    Survival_Equipment_Maritime:$('survivalMaritime').checked,
    Survival_Equipment_Jungle:$('survivalJungle').checked,
    Jackets_None:$('jacketsNone').checked, Jackets_Light:$('jacketsLight').checked,
    Jackets_Fluorescent:$('jacketsFluorescent').checked,
    Jackets_UHF:$('jacketsUHF').checked, Jackets_VHF:$('jacketsVHF').checked,
    Dinghies_None:$('dinghiesNone').checked, Dinghies_Cover:$('dinghiesCover').checked
  };
  Object.entries(checks).forEach(([name,checked])=>{if(checked)drawX(doc,name)});

  drawComb(doc,'Dinghies_Number',onlyDigits($('dinghiesNumber').value,2),2,8.5);
  drawCentered(doc,'Dinghies_Capacity',upper($('dinghiesCapacity').value),8.5);
  drawCentered(doc,'Dinghies_Colour',upper($('dinghiesColour').value),8.3);
  drawLeft(doc,'Aircraft_Colour_Markings',upper($('aircraftColour').value),8.4,7);
  drawLeft(doc,'Remarks_Text',upper($('remarks').value),8.2,7);
  drawCentered(doc,'Pilot_In_Command',upper($('pilotInCommand').value||s.contactName),8.5);
  drawCentered(doc,'Filed_By',s.contactName,7.8);
  drawLeft(doc,'Additional_Requirements',upper($('additionalRequirements').value),7.3,5);
  drawCentered(doc,'Date_Day',day,8.5);
  drawCentered(doc,'Date_Month',month,8.5);
  drawCentered(doc,'Date_Year',year,8.2);
  drawCentered(doc,'Pilot_License',upper($('pilotLicense').value||s.pilotLicense),8.4);

  return doc;
}
function filename(){
  return `${$('flightDate').value}_${$('registration').value}_${upper($('departure').value)||'DEP'}_${upper($('destination').value)||'DEST'}.pdf`;
}
function collectData(){
  const ids=['registration','flightDate','departure','departureTime','destination','eet','speed','level',
    'alternate1','alternate2','route','endurance','pob','pilotInCommand','pilotLicense',
    'variableOtherInfo','aircraftColour','remarks','additionalRequirements','dinghiesNumber',
    'dinghiesCapacity','dinghiesColour'];
  const values={}; ids.forEach(id=>values[id]=$(id).value);
  const checks=['radioUHF','radioVHF','radioELT','survivalNone','survivalPolar','survivalDesert',
    'survivalMaritime','survivalJungle','jacketsNone','jacketsLight','jacketsFluorescent',
    'jacketsUHF','jacketsVHF','dinghiesNone','dinghiesCover'];
  checks.forEach(id=>values[id]=$(id).checked);
  return values;
}
function loadData(values){
  if(!values)return;
  Object.entries(values).forEach(([id,val])=>{
    const el=$(id); if(!el)return;
    if(el.type==='checkbox')el.checked=!!val; else el.value=val??'';
  });
  updateFixedPreview(); switchTab('plan'); window.scrollTo({top:0,behavior:'smooth'});
}
async function downloadOrShare(doc){
  const blob=doc.output('blob'), name=filename(); lastPdfBlob=blob;
  const file=new File([blob],name,{type:'application/pdf'});
  if(navigator.canShare && navigator.canShare({files:[file]})){
    try{ await navigator.share({files:[file],title:name}); return; }catch(e){ if(e.name==='AbortError')return; }
  }
  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
}
function addHistory(){
  const history=getHistory();
  history.unshift({
    id:Date.now(), created:new Date().toISOString(), filename:filename(),
    summary:`${$('registration').value} · ${upper($('departure').value)} → ${upper($('destination').value)}`,
    data:collectData()
  });
  saveHistory(history); renderHistory();
}
function renderHistory(){
  const list=$('historyList'), history=getHistory();
  if(!history.length){list.innerHTML='<p class="help">Todavía no hay planes guardados.</p>';return;}
  list.innerHTML=history.map(item=>`
    <article class="history-item">
      <strong>${item.summary}</strong>
      <small>${new Date(item.created).toLocaleString()}<br>${item.filename}</small>
      <div class="history-actions">
        <button class="secondary" data-action="duplicate" data-id="${item.id}">Duplicar datos</button>
        <button class="primary" data-action="generate" data-id="${item.id}">Generar otra vez</button>
      </div>
    </article>`).join('');
}
function switchTab(tab){
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===`tab-${tab}`));
  if(tab==='history')renderHistory();
}
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.tab)));
$('registration').addEventListener('change',updateFixedPreview);
function validateRequired(){
  const required=[
    ['registration','Matrícula'],['flightDate','Fecha'],['departure','Salida'],
    ['departureTime','Hora UTC'],['destination','Destino'],['eet','EET total']
  ];
  for(const [id,label] of required){
    if(!$(id).value.trim()) throw new Error(`Falta: ${label}`);
  }
}
async function makePdfFile(){
  validateRequired();
  const doc=await createPdf();
  const blob=doc.output('blob');
  return {doc, blob, file:new File([blob],filename(),{type:'application/pdf'})};
}
async function sharePdfFile(file,title,text=''){
  if(navigator.canShare && navigator.canShare({files:[file]})){
    await navigator.share({files:[file],title,text});
    return true;
  }
  return false;
}
function forceDownload(blob,name){
  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
}
$('flightForm').addEventListener('submit',e=>e.preventDefault());
$('generateBtn').addEventListener('click',async()=>{
  try{
    const {blob,file}=await makePdfFile();
    addHistory();
    const shared=await sharePdfFile(file,'Plan de vuelo SIS');
    if(!shared) forceDownload(blob,file.name);
    toast('Plan generado');
  }catch(err){if(err.name!=='AbortError')alert(err.message||String(err));}
});
$('saveFilesBtn').addEventListener('click',async()=>{
  try{
    const {blob,file}=await makePdfFile();
    const shared=await sharePdfFile(file,'Guardar plan de vuelo','Seleccione “Guardar en Archivos”.');
    if(!shared) forceDownload(blob,file.name);
    toast('Seleccione Guardar en Archivos');
  }catch(err){if(err.name!=='AbortError')alert(err.message||String(err));}
});
$('emailBtn').addEventListener('click',async()=>{
  try{
    const office=getSuggestedOffice();
    if(!office || !office.email){
      throw new Error('No hay correo registrado para la oficina sugerida. Revíselo o use otro destinatario.');
    }
    const {file}=await makePdfFile();
    const subject=`PLAN DE VUELO ${$('registration').value} ${upper($('departure').value)}-${upper($('destination').value)} ${$('flightDate').value}`;
    const body=`Señores ${office.name}\n\nAdjunto plan de vuelo ${$('registration').value}, salida ${upper($('departure').value)}, destino ${upper($('destination').value)}.\n\nContacto: ${getSettings().contactName} ${getSettings().contactPhone}\n\nDestinatario sugerido: ${office.email}`;
    const shared=await sharePdfFile(file,subject,body);
    if(!shared){
      await navigator.clipboard?.writeText(office.email);
      window.location.href=`mailto:${encodeURIComponent(office.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body+'\n\nEl PDF debe adjuntarse desde Archivos.')}`;
    }
  }catch(err){if(err.name!=='AbortError')alert(err.message||String(err));}
});
$('previewBtn').addEventListener('click',()=>{
  $('previewText').textContent=buildOtherInfo().join('\n');
  $('modal').classList.remove('hidden');
});
$('closeModal').addEventListener('click',()=>$('modal').classList.add('hidden'));
$('modal').addEventListener('click',e=>{if(e.target===$('modal'))$('modal').classList.add('hidden')});
$('settingsForm').addEventListener('submit',e=>{
  e.preventDefault();
  const s=getSettings();
  Object.assign(s,{
    operator:upper($('operator').value),contactName:upper($('contactName').value),
    contactPhone:$('contactPhone').value.trim(),contactEmail:upper($('contactEmail').value),
    mission:upper($('mission').value),equipmentComNav:upper($('equipmentComNav').value),
    pilotLicense:upper($('defaultLicense').value)
  });
  saveSettings(s); loadFormDefaults(); updateFixedPreview(); toast('Datos fijos guardados');
});
$('historyList').addEventListener('click',async e=>{
  const btn=e.target.closest('button[data-id]'); if(!btn)return;
  const item=getHistory().find(x=>String(x.id)===btn.dataset.id); if(!item)return;
  loadData(item.data);
  if(btn.dataset.action==='generate'){
    setTimeout(async()=>{try{const doc=await createPdf();await downloadOrShare(doc)}catch(err){alert(err.message)}},150);
  }
});
$('clearHistoryBtn').addEventListener('click',()=>{
  if(confirm('¿Borrar todo el historial guardado en este dispositivo?')){saveHistory([]);renderHistory();}
});
['departure','destination','alternate1','alternate2','level','speed','route','variableOtherInfo'].forEach(id=>{
  $(id).addEventListener('input',e=>{e.target.value=upper(e.target.value)});
});
['departureTime','eet','endurance','pob','dinghiesNumber','dinghiesCapacity'].forEach(id=>{
  $(id).addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'')});
});


function getSuggestedOffice(){
  const code=normalizeCode($('departure').value,4);
  return window.FPL_CONTACTS?.[code] || null;
}
function updateOffice(){
  const office=getSuggestedOffice();
  const box=$('contactOffice');
  if(!office){
    box.innerHTML='No hay contacto cargado para este código. Puede generar el PDF y enviarlo manualmente.';
    $('callBtn').disabled=true;$('copyEmailBtn').disabled=true;
    return;
  }
  box.innerHTML=`<strong>${office.name}</strong>
    Torre: ${office.tower||'No registrado'}<br>
    Plan de vuelo: ${office.fpl||'No registrado'}<br>
    Correo: ${office.email||'No registrado'}`;
  $('callBtn').disabled=!(office.fpl||office.tower);
  $('copyEmailBtn').disabled=!office.email;
}
$('departure').addEventListener('input',updateOffice);
$('callBtn').addEventListener('click',()=>{
  const office=getSuggestedOffice(); if(!office)return;
  const number=office.fpl||office.tower;
  if(number)window.location.href=`tel:${number}`;
});
$('copyEmailBtn').addEventListener('click',async()=>{
  const office=getSuggestedOffice(); if(!office?.email)return;
  try{await navigator.clipboard.writeText(office.email);toast('Correo copiado');}
  catch{window.prompt('Copie el correo:',office.email);}
});

window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();deferredPrompt=e;$('installBtn').classList.remove('hidden');
});
$('installBtn').addEventListener('click',async()=>{
  if(!deferredPrompt)return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null;
  $('installBtn').classList.add('hidden');
});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));

loadAircraft();loadSettingsForm();loadFormDefaults();renderHistory();updateOffice();
