import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const [app,index,config,serviceWorker,version,manifest]=await Promise.all([
  readFile(new URL('../app.js',import.meta.url),'utf8'),
  readFile(new URL('../index.html',import.meta.url),'utf8'),
  readFile(new URL('../config.js',import.meta.url),'utf8'),
  readFile(new URL('../sw.js',import.meta.url),'utf8'),
  readFile(new URL('../version.json',import.meta.url),'utf8'),
  readFile(new URL('../manifest.webmanifest',import.meta.url),'utf8')
]);

const published=JSON.parse(version);
const webManifest=JSON.parse(manifest);

assert.equal(published.version,'3.2.0','version.json debe indicar 3.2.0');
assert.match(app,/const APP_VERSION='3\.2\.0'/,'app.js debe indicar 3.2.0');
assert.match(index,/v3\.2\.0/,'la interfaz debe mostrar 3.2.0');
assert.match(index,/app\.js\?v=320/,'app.js debe tener cachebuster 320');
assert.match(serviceWorker,/gutipilot-v3\.2\.0/,'la caché debe estar versionada');
assert.match(app,/serviceWorker\.register/,'la PWA debe registrar el Service Worker');
assert.doesNotMatch(serviceWorker,/registration\.unregister/,'el Service Worker no debe desinstalarse');
assert.match(app,/validTime/,'debe validar la hora UTC');
assert.match(app,/validDuration/,'debe validar EET y autonomía');
assert.match(app,/enforceNoneExclusive/,'debe evitar selecciones contradictorias');
assert.match(app,/gutipilot-backup/,'debe admitir respaldos identificables');
assert.doesNotMatch(config,/@GMAIL\.COM/i,'config.js no debe incluir correos personales predeterminados');
assert.doesNotMatch(config,/"contactPhone":\s*"\d+/,'config.js no debe incluir teléfonos personales predeterminados');
assert.equal(webManifest.display,'standalone','la PWA debe ejecutarse en modo standalone');

console.log('GutiPilot 3.2: comprobaciones estáticas superadas.');
