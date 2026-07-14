# SIS Flight Planner Mobile 1.0

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
