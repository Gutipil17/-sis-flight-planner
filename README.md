# GutiPilot Flight Planner Mobile 1.0

Aplicación web móvil (PWA) para iPhone y Mac.

## Alcance de esta versión

- No calcula combustible.
- No calcula coordenadas ni distancias.
- Selecciona matrícula y añade automáticamente CODE y SUR.
- Añade operador, misión y datos de contacto.
- Permite diligenciar los datos variables del plan.
- Genera un PDF nuevo, plano y estable desde la plantilla oficial.
- Guarda localmente hasta 60 planes como datos reutilizables.
- Permite duplicar un vuelo sin copiar el PDF anterior.
- Puede compartir el PDF desde el menú nativo del iPhone.
- Después de la primera instalación, los archivos de la aplicación quedan en caché.

## Publicación

Para instalarla como aplicación en iPhone debe estar publicada mediante HTTPS.

La carpeta está preparada para servicios de alojamiento estático. No necesita servidor, base de datos ni código backend.

### Método simple

1. Descomprima el ZIP.
2. Publique el contenido de la carpeta `SIS_Flight_Planner_Mobile` en un alojamiento estático.
3. Abra la dirección publicada en Safari.
4. Toque Compartir.
5. Seleccione “Añadir a pantalla de inicio”.

## Datos

Los datos fijos y el historial se guardan solamente en el navegador del dispositivo mediante localStorage. Si se borran los datos de Safari o se cambia de dispositivo, se pierde ese historial.

## Seguridad operacional

La aplicación solo diligencia y genera el formato. No verifica NOTAM, AIP, espacio aéreo, meteorología, performance, autorización ATS ni legalidad de la ruta.


## Versión 1.1

Se añadieron:

- Directorio de oficinas de plan de vuelo según aeródromo de salida.
- Botón **Generar PDF**.
- Botón **Enviar correo** mediante la hoja de compartir de iOS.
- Botón **Llamar** a la oficina de plan de vuelo o torre.
- Botón **Guardar en Archivos**.
- Botón para copiar el correo sugerido.

### Limitación de iPhone

Una aplicación web no puede obligar a Mail a colocar simultáneamente un destinatario y un archivo adjunto. La aplicación comparte el PDF mediante la hoja nativa de iOS y muestra el correo sugerido. Al elegir Mail, iOS adjunta el PDF; verifique o copie el destinatario antes de enviarlo.


## Versión 1.2

- El campo **Piloto al mando** es editable para cada plan.
- El campo **Licencia del piloto al mando** es editable para cada plan.
- Estos valores se guardan en el historial del vuelo y vuelven a cargarse al duplicar los datos.
- El campo **Presentado por** permanece separado y utiliza el nombre fijo configurado en la aplicación.


## Versión 1.3

Valores marcados por defecto en cada plan nuevo:

- Radio de emergencia: VHF.
- Equipo de supervivencia: Polar, Desértico y Marítimo.
- Chalecos: Ninguno.
- Botes: Ninguno.

Todos siguen siendo editables para un vuelo particular.

Corrección de casilla 10:

- COM/NAV: `S`
- Vigilancia: `CB1`

El texto `SUR/260B` se conserva exclusivamente en la casilla 18, asociado al CODE de cada aeronave.


## Versión 1.4

Correcciones:

- Radio de emergencia predeterminado: **UHF**.
- VHF y ELT quedan desmarcados por defecto.
- Polar, Desértico y Marítimo marcados por defecto.
- Chalecos: Ninguno.
- Botes: Ninguno.
- Nuevo botón **Nuevo plan** para restablecer esos valores sin afectar planes del historial.
- Caché de la PWA renovada para que las actualizaciones aparezcan más rápido.
- Casilla 10 permanece como `S / CB1`.


## Versión 1.5

Corrección de escritura:

- La información variable de la casilla 18 permite escribir espacios normalmente.
- La ruta, observaciones, piloto, licencia y demás campos de texto también conservan los espacios mientras se escribe.
- El texto continúa convirtiéndose automáticamente a mayúsculas.


## Versión 1.6

- Aviso visible cuando hay una actualización nueva.
- Botón **Actualizar ahora**.
- Nueva pestaña **Directorio**.
- Búsqueda por código OACI o nombre del aeródromo.
- Filtros para correos, teléfonos de plan de vuelo y teléfonos de torre.
- Los teléfonos permiten llamar y los correos abren Mail desde el iPhone.


## Versión 1.7

- El directorio fue reemplazado por el JSON estructurado suministrado por el usuario.
- Al final del formulario se puede buscar manualmente la oficina destinataria por:
  - código OACI;
  - ciudad;
  - aeropuerto;
  - departamento;
  - regional.
- La oficina destinataria puede ser diferente al aeródromo de salida.
- Botón **Usar aeródromo de salida** para selección rápida.
- Botones integrados al final del plan:
  - Llamar.
  - Copiar correo.
  - Enviar correo.
- “Enviar correo” genera el PDF, copia el destinatario y abre la hoja de compartir del iPhone.


## Versión 1.8 — Nueva identidad

- Nuevo nombre: **GutiPilot Flight Planner**.
- Nombre corto en el iPhone: **GutiPilot**.
- Nuevo ícono con las iniciales **GP**.
- Se eliminó la marca SIS del nombre de la aplicación.
- El operador continúa siendo editable en **Datos fijos**, por lo que la aplicación puede utilizarse con SIS u otra empresa.
- Se conservaron las claves de almacenamiento anteriores para no borrar la configuración ni el historial ya guardado en el dispositivo.


## Versión 1.9 — Corrección del directorio

- El directorio completo de 46 aeródromos queda embebido directamente en `app.js`.
- Ya no depende de cargar `contacts.js`.
- Se corrige el error `window.FPL_CONTACTS = undefined`.
- Se añadieron metadatos modernos para PWA y un favicon.
- El buscador por OACI, ciudad y aeródromo funciona sin depender de un archivo adicional.


## Versión 1.10 — Validación y actualización manual

- Corrección para iPhone: antes de generar, se cierra el teclado y se confirma el último texto escrito.
- Si falta un campo, la aplicación lo marca en rojo, se desplaza hasta él y lo enfoca.
- Los ejemplos grises ahora indican claramente “ESCRIBA…”, para no confundirlos con valores diligenciados.
- Se añadió un botón permanente **Verificar actualización** en la pestaña **Datos fijos**.
- La aplicación informa si está actualizada, si hay una versión disponible o si la actualización se está descargando.


## Versión 1.11 — Correo formal automático

El botón **Enviar correo** prepara automáticamente:

- Destinatario según la oficina seleccionada.
- Asunto con matrícula, salida y destino.
- Nombre del aeropuerto y ciudad.
- Matrícula.
- Salida.
- Destino.
- Fecha.
- Hora UTC.
- Piloto al mando.
- Licencia, cuando esté diligenciada.
- Nombre, teléfono y correo de contacto.
- Despedida: `CAP. ANDRÉS GUTIÉRREZ`.

En iPhone, la aplicación genera el PDF y abre la hoja de compartir. El destinatario se copia al portapapeles para pegarlo en el campo “Para” de Mail.


## Versión 1.12

- La firma del correo deja de estar fija.
- Se añade el campo **Firma para correos** en Datos fijos.
- El nombre, teléfono, correo y firma utilizados en el correo salen de la configuración del usuario, facilitando el uso por cualquier piloto o empresa.


## Versión 2.0 — Perfil multiusuario

- Nombre completo.
- Cargo o grado.
- Empresa u operador.
- Teléfono.
- Correo.
- Licencia.
- Firma personalizada.
- Logo opcional.
- Aeronaves asignadas.

Los datos configurados alimentan automáticamente la casilla 18, los datos de contacto y el correo formal. Se mantiene compatibilidad con la configuración guardada en versiones anteriores.


## Versión 3.0 — Primera base estable

La aplicación se reorganizó en módulos independientes:

- Plan.
- Directorio.
- Historial.
- Aeronaves.
- Perfil.
- Actualizaciones.

La pestaña **Actualizar** y el botón ↻ del encabezado están siempre visibles. El módulo de aeronaves permite decidir qué matrículas aparecen en Nuevo plan sin modificar los CODE protegidos.


## Versión 3.0.1 — Corrección de envío de correo

- Se corrige el error `Can't find variable: setting`.
- El botón **Enviar correo** vuelve a utilizar correctamente los datos del perfil guardado.
- Se renovó la caché de la PWA para que la corrección se cargue en iPhone.


## Versión 3.0.2 — Corrección definitiva del correo

- Se corrigen referencias mal formadas en el cuerpo del correo.
- Nombre, teléfono, correo y firma se toman correctamente del perfil.
- Se eliminan expresiones redundantes creadas por actualizaciones anteriores.
- Se renovó la caché de la aplicación.


## Versión 3.0.3 — Ícono oficial GutiPilot

- Se reemplazó el ícono anterior por el logo suministrado por el usuario.
- Se generaron versiones de 180×180, 192×192 y 512×512.
- El mismo logo se usa como ícono de iPhone, PWA y favicon.
- No se modificó el diseño del logo original.
