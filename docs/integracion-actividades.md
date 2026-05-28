# Integracion de mini actividades de bienestar

Este documento describe como debe importar, aprobar, asignar, ejecutar y guardar resultados la otra plataforma.

## Flujo recomendado

1. El administrador importa un ZIP exportado desde este proyecto.
2. La plataforma lee `manifest.json` y crea una actividad en estado `pendiente`.
3. El administrador revisa `titulo`, `categoria`, `descripcion`, `indicaciones`, `embed_url` y aprueba o rechaza.
4. La psicologa ve solo actividades `aprobadas`.
5. La psicologa asigna una actividad a uno o varios estudiantes.
6. El estudiante abre la actividad en un `iframe`.
7. La plataforma registra inicio, interacciones, respuestas de IA y finalizacion.
8. La psicologa consulta cada intento: estado, duracion, textos escritos por el estudiante y respuestas de IA.

## Contrato del manifest.json exportado

```json
{
  "version": "1.0",
  "tipo": "actividad-bienestar",
  "titulo": "Arbol de Bienestar IA",
  "slug": "arbol-bienestar",
  "categoria": "Meditacion",
  "category": "Meditacion",
  "embed_url": "https://dominio/embed/arbol-bienestar",
  "emoji": "arbol",
  "descripcion": "Texto descriptivo",
  "indicaciones": ["Paso 1", "Paso 2"],
  "finalizacion": {
    "tipo": "manual_despues_de_tiempo_minimo",
    "duracion_minima_segundos": 50,
    "evento": "BIENESTAR_ACTIVIDAD_COMPLETADA"
  },
  "eventos": {
    "interaccion": "BIENESTAR_ACTIVIDAD_INTERACCION",
    "completada": "BIENESTAR_ACTIVIDAD_COMPLETADA"
  },
  "persistencia_recomendada": {
    "guardar_texto_estudiante": true,
    "guardar_respuesta_ia": true,
    "guardar_estado_culminacion": true
  }
}
```

## Eventos que debe escuchar la plataforma

La plataforma padre debe escuchar eventos con `window.addEventListener("message", handler)`. Sin este listener, el boton `Finalizar` de la actividad si enviara el evento, pero el otro proyecto no lo guardara.

Ejemplo minimo del listener en el proyecto padre:

```ts
useEffect(() => {
  const handleMessage = async (event: MessageEvent) => {
    const payload = event.data;

    if (!payload || typeof payload !== "object") return;

    if (payload.type === "BIENESTAR_ACTIVIDAD_INTERACCION") {
      await fetch("/api/bienestar/intentos/interaccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intento_id: payload.intentoId,
          asignacion_id: payload.asignacionId,
          estudiante_id: payload.estudianteId,
          actividad_slug: payload.actividad,
          entrada_estudiante: payload.datos?.entrada_estudiante,
          respuesta_ia: payload.datos?.respuesta_ia,
          datos: payload.datos,
          created_at: payload.timestamp,
        }),
      });
    }

    if (payload.type === "BIENESTAR_ACTIVIDAD_COMPLETADA") {
      await fetch("/api/bienestar/intentos/completar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intento_id: payload.intentoId,
          actividad_slug: payload.actividad,
          asignacion_id: payload.asignacionId,
          estudiante_id: payload.estudianteId,
          duracion_segundos: payload.duracion_segundos,
          culmino: payload.culmino,
          resumen: payload.datos?.resumen ?? payload.datos ?? {},
          completed_at: payload.timestamp,
        }),
      });
    }
  };

  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, []);
```

Al renderizar el iframe, pasar identificadores por query params para que la actividad los devuelva en el evento:

```tsx
<iframe
  src={`${embedUrl}?asignacionId=${asignacionId}&intentoId=${intentoId}&estudianteId=${estudianteId}`}
  title="Actividad de bienestar"
/>
```

En produccion tambien se recomienda validar `event.origin` contra el dominio donde esta publicado este proyecto antes de guardar datos.

Evento de interaccion, usado cada vez que el estudiante escribe algo y la IA responde:

```json
{
  "type": "BIENESTAR_ACTIVIDAD_INTERACCION",
  "actividad": "arbol-bienestar",
  "timestamp": "2026-05-21T12:00:00.000Z",
  "asignacionId": "uuid",
  "intentoId": "uuid",
  "datos": {
    "entrada_estudiante": "Hoy logre organizar mi tiempo",
    "respuesta_ia": {
      "categoria": "flor",
      "color": "#F9C6D0",
      "mensaje": "Tu avance tambien merece celebrarse."
    }
  }
}
```

Evento de finalizacion:

```json
{
  "type": "BIENESTAR_ACTIVIDAD_COMPLETADA",
  "actividad": "arbol-bienestar",
  "timestamp": "2026-05-21T12:03:00.000Z",
  "asignacionId": "uuid",
  "intentoId": "uuid",
  "duracion_segundos": 50,
  "culmino": true,
  "datos": {
    "resumen": {
      "total_interacciones": 3
    }
  }
}
```

## Finalizacion

La regla recomendada es: una actividad se considera culminada cuando el estudiante lleva al menos `duracion_minima_segundos` dentro de la actividad y presiona `Finalizar actividad`.

Para actividades de escritura con IA, conviene exigir ademas al menos una interaccion guardada. Para actividades visuales, basta con tiempo minimo y boton de finalizar.

## Prompt para el otro proyecto

```text
Necesito integrar mini actividades de bienestar importadas desde archivos ZIP.

Contexto del sistema:
- Existen tres roles: administrador, psicologo y estudiante.
- El administrador importa actividades. Toda actividad importada queda en estado pendiente.
- El administrador puede aprobar o rechazar actividades.
- La psicologa solo ve actividades aprobadas y puede asignarlas a estudiantes.
- El estudiante realiza la actividad dentro de un iframe.
- La psicologa debe poder revisar si el estudiante culmino la actividad, cuanto tiempo estuvo, que escribio y que respondio la IA.

Formato de importacion:
- Cada ZIP trae un manifest.json.
- Leer manifest.json y guardar estos campos: version, tipo, titulo, slug, categoria, embed_url, emoji, descripcion, indicaciones, finalizacion, eventos y persistencia_recomendada.
- Si no existe manifest.json, rechazar el ZIP o marcarlo como invalido.
- Al importar, crear la actividad con estado pendiente.
- Si la categoria se guarda como "Sin categoria", revisar que el importador este leyendo `manifest.categoria` y enviandolo explicitamente al `INSERT`; no basta con crear la columna en la base de datos.

Ejemplo de mapeo al importar:

```ts
const categoria = manifest.categoria ?? manifest.category ?? "Sin categoria";

await db.bienestar_actividades.create({
  data: {
    version: manifest.version ?? "1.0",
    tipo: manifest.tipo ?? "actividad-bienestar",
    slug: manifest.slug,
    categoria,
    titulo: manifest.titulo ?? manifest.title,
    emoji: manifest.emoji,
    descripcion: manifest.descripcion ?? manifest.description,
    embed_url: manifest.embed_url,
    indicaciones: manifest.indicaciones ?? manifest.steps ?? [],
    finalizacion: manifest.finalizacion ?? {},
    eventos: manifest.eventos ?? {},
    persistencia_recomendada: manifest.persistencia_recomendada ?? {},
    manifest_original: manifest,
    estado: "pendiente",
  },
});
```

Modelo funcional:
- Tabla de actividades importadas.
- Tabla de asignaciones de actividad a estudiantes por psicologo.
- Tabla `bienestar_intentos` como bitacora mixta:
  - En actividades con IA, cada `BIENESTAR_ACTIVIDAD_INTERACCION` crea una fila con `entrada_estudiante` y `respuesta_ia`.
  - En actividades visuales, como no hay texto ni IA, `BIENESTAR_ACTIVIDAD_COMPLETADA` debe crear una fila de cierre si no existe ninguna fila previa para ese `intento_id`.
  - En todos los casos, `BIENESTAR_ACTIVIDAD_COMPLETADA` marca el intento como culminado con `completed_at`, `duracion_segundos`, `culmino` y `resumen`.

Ejecucion:
- Al abrir una asignacion, crear o reutilizar un intento en estado iniciado.
- Renderizar iframe con embed_url.
- Pasar por query params asignacionId, intentoId y estudianteId.
- Escuchar postMessage desde el iframe.
- Si llega type = BIENESTAR_ACTIVIDAD_INTERACCION, guardar:
  - intento_id
  - actividad slug
  - entrada_estudiante
  - respuesta_ia completa en JSON
  - fecha/hora
- Si llega type = BIENESTAR_ACTIVIDAD_COMPLETADA, marcar el intento como completado:
  - completed_at
  - duracion_segundos
  - culmino = true
  - resumen JSON

SQL recomendado para `BIENESTAR_ACTIVIDAD_INTERACCION`:

```sql
insert into bienestar_intentos (
  intento_id,
  actividad_slug,
  estudiante_id,
  asignacion_id,
  entrada_estudiante,
  respuesta_ia,
  created_at
) values (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  now()
);
```

SQL recomendado para `BIENESTAR_ACTIVIDAD_COMPLETADA`:

```sql
update bienestar_intentos
set
  completed_at = $2,
  duracion_segundos = $3,
  culmino = true,
  resumen = $4
where intento_id = $1;
```

Si el `update` afecta `0` filas, significa que era una actividad visual sin interacciones previas. En ese caso crear una fila de cierre:

```sql
insert into bienestar_intentos (
  intento_id,
  actividad_slug,
  estudiante_id,
  asignacion_id,
  completed_at,
  duracion_segundos,
  culmino,
  resumen
) values (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  true,
  $7
);
```

Reglas:
- Actividades de escritura con IA requieren guardar lo que escribe el estudiante y lo que devuelve la IA.
- Actividades visuales pueden guardar solo inicio, fin, duracion y resumen.
- La finalizacion se habilita despues de finalizacion.duracion_minima_segundos.
- Nunca confiar ciegamente en el iframe: validar que el intento pertenece a la asignacion y al estudiante autenticado.
- La psicologa solo puede ver intentos de estudiantes que tenga asignados.

Pantallas requeridas:
- Admin: importar ZIP, ver pendientes, aprobar/rechazar, ver detalle del manifest.
- Psicologa: listar actividades aprobadas, asignar a estudiantes, revisar progreso e interacciones.
- Estudiante: ver actividades asignadas, abrir actividad, finalizar cuando cumpla tiempo minimo.
```
