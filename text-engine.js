
(function(global){
'use strict';
const MONTHS={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,octubre:10,noviembre:11,diciembre:12};
const UNITS={cero:0,un:1,uno:1,una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,trece:13,catorce:14,quince:15,dieciseis:16,diecisiete:17,dieciocho:18,diecinueve:19};
const TENS={veinte:20,treinta:30,cuarenta:40,cincuenta:50};
const HUNDREDS={cien:100,ciento:100,doscientos:200,trescientos:300,cuatrocientos:400,quinientos:500,seiscientos:600,setecientos:700,ochocientos:800,novecientos:900};
const ICAO={alfa:'A',alpha:'A',bravo:'B',charlie:'C',delta:'D',eco:'E',echo:'E',foxtrot:'F',golf:'G',hotel:'H',india:'I',juliet:'J',juliett:'J',kilo:'K',lima:'L',mike:'M',november:'N',oscar:'O',papa:'P',quebec:'Q',romeo:'R',sierra:'S',tango:'T',uniform:'U',victor:'V',whiskey:'W',xray:'X','x-ray':'X',yankee:'Y',zulu:'Z'};
const FIELD_LABELS={registration:'Aeronave',departure:'Salida',dep:'Lugar real de salida',departureTime:'Hora UTC',destination:'Destino',dest:'Lugar real de destino',flightDate:'Fecha',route:'Ruta',level:'Altitud o nivel',speed:'Velocidad',eet:'Tiempo estimado',endurance:'Autonomía',pob:'Personas a bordo',alternate1:'Alterno',remarks:'Observaciones',flightRules:'Reglas de vuelo',flightType:'Tipo de vuelo',wakeCategory:'Turbulencia'};

function clean(text){return String(text||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[.,:;!?]/g,' ').replace(/\s+/g,' ').trim();}
function upperValue(text){return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 \-\/]/g,'').replace(/\s+/g,' ').trim();}
function numberWords(text){
 const t=clean(text),direct=t.match(/\d+/);if(direct)return Number(direct[0]);
 let total=0,current=0,found=false;
 for(const w of t.split(' ')){
  if(UNITS[w]!==undefined){current+=UNITS[w];found=true;}
  else if(TENS[w]!==undefined){current+=TENS[w];found=true;}
  else if(HUNDREDS[w]!==undefined){current+=HUNDREDS[w];found=true;}
  else if(w==='mil'){current=(current||1)*1000;total+=current;current=0;found=true;}
 }
 return found?total+current:null;
}
function sequenceCode(text){
 let out='';for(const w of clean(text).split(' ')){if(ICAO[w])out+=ICAO[w];else if(UNITS[w]!==undefined&&UNITS[w]<10)out+=String(UNITS[w]);else if(/^[a-z]{1,4}\d*$/.test(w))out+=w.toUpperCase();}
 return out.replace(/[^A-Z0-9]/g,'');
}
function isoDate(d){return d.toISOString().slice(0,10);}
function parseDate(text,now){
 const t=clean(text),base=now?new Date(now):new Date();
 if(/\bmanana\b/.test(t)){const d=new Date(base);d.setDate(d.getDate()+1);return isoDate(d);}
 if(/\bhoy\b/.test(t))return isoDate(base);
 let m=t.match(/\b(\d{1,2})\s+de\s+([a-z]+)(?:\s+de\s+(\d{2,4}))?/);
 if(m&&MONTHS[m[2]]){let y=m[3]?Number(m[3]):base.getFullYear();if(y<100)y+=2000;return `${y}-${String(MONTHS[m[2]]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;}
 m=t.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/);if(m){let y=Number(m[3]);if(y<100)y+=2000;return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;}
 return '';
}
function parseTime(text){
 const t=clean(text);let m=t.match(/\b([01]?\d|2[0-3])\s+([0-5]\d)\b/);if(m)return m[1].padStart(2,'0')+m[2];
 m=t.match(/\b(\d{3,4})\b/);if(m){const v=m[1].padStart(4,'0'),h=+v.slice(0,2),mi=+v.slice(2);if(h<24&&mi<60)return v;}
 m=t.match(/\b(\d{1,2})\s+(media|cuarto)\b/);if(m)return String(+m[1]).padStart(2,'0')+(m[2]==='media'?'30':'15');
 const n=numberWords(t);return n!==null&&n<24?String(n).padStart(2,'0')+'00':'';
}
function parseDuration(text){
 const t=clean(text);let h=0,m=0,found=false;
 let x=t.match(/(\d{1,2})\s*horas?(?:\s+y?\s*(\d{1,2})\s*minutos?)?/);if(x){h=+x[1];m=+(x[2]||0);found=true;}
 if(!found){const hw=t.match(/(.+?)\s+horas?/);if(hw){h=numberWords(hw[1])||0;found=true;}const mw=t.match(/(?:y\s+)?(.+?)\s+minutos?/);if(mw){m=numberWords(mw[1])||0;found=true;}}
 if(!found){const only=t.match(/\b(\d{3,4})\b/);if(only)return only[1].padStart(4,'0');}
 return found?String(h).padStart(2,'0')+String(m).padStart(2,'0'):'';
}
function segment(t,starts,stops){
 let best=-1,key='';for(const s of starts){const i=t.indexOf(s);if(i>=0&&(best<0||i<best)){best=i;key=s;}}
 if(best<0)return'';let from=best+key.length,end=t.length;for(const stop of stops){const i=t.indexOf(stop,from);if(i>=0&&i<end)end=i;}return t.slice(from,end).trim();
}
function inferPlace(raw){
 const c=clean(raw),compact=c.replace(/\s/g,''),code=sequenceCode(c);
 if(code==='ZZZZ'||c.includes('zulu zulu zulu zulu'))return{code:'ZZZZ',detail:''};
 if(/^[a-z]{4}$/.test(compact))return{code:compact.toUpperCase(),detail:''};
 if(/^[A-Z]{4}$/.test(code)&&c.split(' ').length<=4)return{code,detail:''};
 return{code:'ZZZZ',detail:upperValue(raw)};
}
function parse(text,context={}){
 const raw=String(text||''),t=clean(raw),r={},warnings=[],errors=[],confidence={};
 const stops=[' salida ',' departure ',' desde ',' destino ',' destination ',' hacia ',' fecha ',' dof ',' hora ',' ruta ',' altitud ',' altura ',' nivel ',' velocidad ',' tiempo en ruta ',' tiempo estimado ',' autonomia ',' combustible ',' personas a bordo ',' pob ',' alterno ',' observaciones ',' remark ',' rmk ',' aeronave ',' matricula ',' vuelo visual ',' vuelo ifr ',' vuelo no regular ',' vuelo regular ',' turbulencia '];

 let s=segment(t,['cambiar aeronave a ','aeronave ','matricula '],stops);if(s){const reg=(sequenceCode(s).match(/HK\d{3,5}/)||[])[0]||upperValue(s).replace(/[^A-Z0-9]/g,'');if(reg)r.registration=reg;}
 if(t.includes('vuelo ifr')||t.includes('vuelo instrumental'))r.flightRules='I';else if(t.includes('vuelo visual')||t.includes('vuelo vfr'))r.flightRules='V';
 if(t.includes('vuelo no regular'))r.flightType='N';else if(t.includes('vuelo regular'))r.flightType='S';if(t.includes('vuelo militar'))r.flightType='M';
 if(t.includes('turbulencia media'))r.wakeCategory='M';else if(t.includes('turbulencia ligera'))r.wakeCategory='L';else if(t.includes('turbulencia pesada'))r.wakeCategory='H';

 let depDetail=segment(t,['departure ','dep '],stops),out=segment(t,['salida ','salgo de ','salimos de ','desde '],stops);
 if(out){const p=inferPlace(out);r.departure=p.code;if(p.detail)r.dep=p.detail;}if(depDetail){r.departure='ZZZZ';r.dep=upperValue(depDetail);}
 let destDetail=segment(t,['destination ','dest '],stops),dest=segment(t,['destino ','voy para ','vamos para ','hacia '],stops);
 if(dest){const p=inferPlace(dest);r.destination=p.code;if(p.detail)r.dest=p.detail;}if(destDetail){r.destination='ZZZZ';r.dest=upperValue(destDetail);}

 const date=parseDate(segment(t,['fecha ','dof '],stops)||t,context.now);if(date)r.flightDate=date;
 const timeSeg=segment(t,['hora de salida ','hora ','salimos a las ','salgo a las ','a las '],stops),time=parseTime(timeSeg);if(time)r.departureTime=time;
 const routeMatch=t.match(/(?:^|\s)ruta\s+(directa|directo|dct)(?=\s|$)/);
 if(routeMatch)r.route='DCT';
 const levelSeg=segment(t,['altitud ','altura ','nivel '],stops);if(levelSeg){const n=numberWords(levelSeg);if(n!==null){r.level=/nivel de vuelo|flight level|\bfl\b/.test(levelSeg)?'F'+String(Math.round(n)).padStart(3,'0'):'A'+String(Math.round(n/100)).padStart(3,'0');warnings.push(`Confirma la altitud interpretada como ${r.level}.`);}}
 const speedSeg=segment(t,['velocidad '],stops);if(speedSeg){const n=numberWords(speedSeg);if(n)r.speed='N'+String(Math.round(n)).padStart(4,'0');}
 const eetMatch=t.match(/(?:tiempo en ruta|tiempo estimado|duracion del vuelo|eet)\s+(.+?)(?=\s+(?:autonomia|combustible para|personas a bordo|pob|alterno|observaciones|remark|rmk|$))/);
 const eetSeg=eetMatch?eetMatch[1]:'';
 if(eetSeg){const d=parseDuration(eetSeg);if(d)r.eet=d;}
 const endSeg=segment(t,['autonomia ','combustible para ','endurance '],stops);if(endSeg){const d=parseDuration(endSeg);if(d)r.endurance=d;}
 const pobRegex=t.match(/\b(cero|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieciseis|diecisiete|dieciocho|diecinueve|\d{1,3})\s+personas?\s+a\s+bordo\b/);
 if(pobRegex){const n=numberWords(pobRegex[1]);if(n!==null)r.pob=String(n).padStart(3,'0');}
 else{const pobSeg=segment(t,['personas a bordo ','pob '],stops);if(pobSeg){const n=numberWords(pobSeg);if(n!==null)r.pob=String(n).padStart(3,'0');}}
 const alt=segment(t,['alterno '],stops);if(alt){const p=inferPlace(alt);r.alternate1=p.code;}
 const remarks=segment(t,['observaciones ','remark ','rmk '],stops);if(remarks)r.remarks=upperValue(remarks);

 const effective=k=>r[k]||context[k]||'';
 ['departure','destination','flightDate','departureTime','eet','level','endurance','pob'].forEach(k=>{if(!effective(k))errors.push(`Falta ${FIELD_LABELS[k]}.`);});
 if(effective('departure')==='ZZZZ'&&!r.dep&&!context.dep)errors.push('La salida es ZZZZ: falta DEP/.');
 if(effective('destination')==='ZZZZ'&&!r.dest&&!context.dest)errors.push('El destino es ZZZZ: falta DEST/.');
 if(!r.registration&&context.registration)r.registration=context.registration;
 return{raw,fields:r,warnings,errors,confidence,valid:errors.length===0};
}
function dof(iso){if(!iso)return'';const[y,m,d]=iso.split('-');return y.slice(-2)+m+d;}
function item18(result){const f=result.fields,p=[];if(f.dep)p.push('DEP/'+f.dep);if(f.dest)p.push('DEST/'+f.dest);if(f.flightDate)p.push('DOF/'+dof(f.flightDate));if(f.remarks)p.push('RMK/'+f.remarks);return p.join(' ');}
global.GutiPilotTextEngine={parse,clean,numberWords,parseDate,parseTime,parseDuration,item18,FIELD_LABELS};
})(typeof window!=='undefined'?window:globalThis);
