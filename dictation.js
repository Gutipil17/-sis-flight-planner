
(() => {
  const byId=id=>document.getElementById(id);
  const settingsKey='fplSettings';

  function readSettings(){
    try{return JSON.parse(localStorage.getItem(settingsKey)||'{}');}catch{return{};}
  }
  function activeRegistration(){
    const select=byId('registration');
    const settings=readSettings();
    const regs=(window.CFG&&window.CFG.aircraft)?Object.keys(window.CFG.aircraft):['HK3911'];
    const reg=select?.value || settings.activeRegistration || (regs.includes('HK3911')?'HK3911':regs[0]) || 'HK3911';
    if(select && !select.value && [...select.options].some(o=>o.value===reg)) select.value=reg;
    return reg;
  }
  function renderHeader(){
    const reg=activeRegistration();
    const badge=byId('copilotActiveAircraft');
    if(badge) badge.textContent=reg;
    const settings=readSettings();
    const box=byId('copilotFixedSummary');
    if(box){
      box.innerHTML=`<strong>Datos activos</strong>
        <span>${reg}</span>
        <span>${settings.fullName||settings.contactName||'PILOTO'}</span>
        <span>${settings.company||settings.operator||'OPERADOR'}</span>
        <span>${settings.flightRules||'V'} / ${settings.flightType||'N'} / ${settings.wakeCategory||'M'}</span>`;
    }
  }
  function renderContext(){
    const settings=readSettings(), reg=activeRegistration();
    const ac=window.CFG?.aircraft?.[reg]||{};
    const el=byId('voiceActiveContext');
    if(!el)return;
    el.innerHTML=`<h3>Datos ya cargados</h3>
      <div class="voice-context-grid">
        <div><span>Aeronave</span><strong>${reg}</strong></div>
        <div><span>Piloto</span><strong>${settings.fullName||settings.contactName||'SIN CONFIGURAR'}</strong></div>
        <div><span>Operador</span><strong>${settings.company||settings.operator||'SIN CONFIGURAR'}</strong></div>
        <div><span>Equipo casilla 10</span><strong>${settings.equipmentComNav||'S'}/${settings.equipmentSurveillance||'CB1'}</strong></div>
        <div><span>Reglas / tipo / turbulencia</span><strong>${settings.flightRules||'V'} / ${settings.flightType||'N'} / ${settings.wakeCategory||'M'}</strong></div>
        <div><span>CODE / SUR</span><strong>${ac.code||'—'} / ${ac.sur||'—'}</strong></div>
      </div>`;
  }
  function openModal(){
    renderContext();
    const modal=byId('voiceAssistantModal');
    if(modal){modal.classList.remove('hidden');document.body.classList.add('modal-open');}
    setTimeout(()=>byId('voiceTranscript')?.focus(),150);
  }
  function closeModal(){
    byId('voiceAssistantModal')?.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
  function manualMode(){
    const target=byId('manualPlanStart') || byId('registration');
    target?.scrollIntoView({behavior:'smooth',block:'start'});
    const reg=byId('registration');
    if(reg){reg.classList.add('manual-highlight');setTimeout(()=>reg.classList.remove('manual-highlight'),1600);}
  }

  document.addEventListener('DOMContentLoaded',()=>{
    renderHeader();
    byId('openVoiceAssistantBtn')?.addEventListener('click',openModal);
    byId('closeVoiceAssistantBtn')?.addEventListener('click',closeModal);
    byId('voiceAssistantModal')?.addEventListener('click',e=>{if(e.target===byId('voiceAssistantModal'))closeModal();});
    byId('focusDictationBtn')?.addEventListener('click',()=>byId('voiceTranscript')?.focus());
    byId('manualPlanBtn')?.addEventListener('click',manualMode);
    byId('registration')?.addEventListener('change',renderHeader);
    byId('editVoiceTextBtn')?.addEventListener('click',()=>byId('voiceTranscript')?.focus());
  });
})();
