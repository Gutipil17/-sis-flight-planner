# GutiPilot Flight Planner 3.1 — Constructor inteligente de Casilla 18

## Novedades

- Modo guiado con catálogo de 24 indicadores de la casilla 18.
- Explicación sencilla de uso y ejemplo para cada indicador.
- Validación en tiempo real con mensajes que explican cómo corregir.
- Dependencias automáticas: ZZZZ en salida exige DEP/ y ZZZZ en destino exige DEST/.
- Validaciones de DOF/, CODE/, SEL/, EET/, DLE/, REG/, PER/ y otros.
- Ordenamiento automático según la secuencia estructurada del ítem 18.
- Modo avanzado para pilotos que prefieren escribir directamente.
- Copia rápida de la casilla 18.

## Fuentes de diseño

La estructura se basa en las instrucciones de presentación del plan de vuelo OACI, especialmente la lista y secuencia de indicadores del Ítem 18. Las capacidades PBN, comunicaciones, datos y vigilancia deben confirmarse contra la aprobación operacional y la configuración real de cada aeronave.

## Estado

Esta es una primera versión funcional para pruebas. Antes de uso operacional debe verificarse la implementación colombiana vigente y probarse con casos reales aceptados por la oficina ARO/AIS.
