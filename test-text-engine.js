
const fs=require('fs'),vm=require('vm');const c={globalThis:{},console};vm.createContext(c);vm.runInContext(fs.readFileSync('text-engine.js','utf8'),c);const E=c.globalThis.GutiPilotTextEngine;
const cases=[
['ZZZZ','Salida Zulu Zulu Zulu Zulu. Departure Batallon en Carepa. Hora 1230. Destino Zulu Zulu Zulu Zulu. Destination Batallon en Animas Choco. Fecha 16 de julio de 2026. Altitud 4500 pies. Tiempo en ruta 1 hora 30 minutos. Autonomia 3 horas 30 minutos. Cinco personas a bordo.',r=>r.fields.departure==='ZZZZ'&&r.fields.dep.includes('BATALLON')&&r.fields.destination==='ZZZZ'&&r.fields.eet==='0130'&&!r.fields.route&&r.fields.endurance==='0330'&&r.fields.pob==='005'],
['OACI','Salida SKLC hora 0830 destino SKUI fecha 17-07-2026 ruta directa altitud 6500 pies tiempo en ruta 45 minutos autonomia 3 horas personas a bordo 4',r=>r.fields.departure==='SKLC'&&r.fields.destination==='SKUI'&&r.fields.route==='DCT'&&r.fields.level==='A065'&&r.fields.eet==='0045'],
['Mañana','Mañana salida SKBO hora 1000 destino SKBG altitud 8500 pies tiempo en ruta 2 horas autonomia 4 horas seis personas a bordo',r=>r.fields.flightDate==='2026-07-16'&&r.fields.pob==='006']
];let bad=0;for(const [n,t,f] of cases){const r=E.parse(t,{registration:'HK3911',now:'2026-07-15T10:00:00'});const ok=f(r);console.log(ok?'PASS':'FAIL',n,JSON.stringify(r.fields));if(!ok)bad++;}process.exit(bad?1:0);
