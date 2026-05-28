-- Esquema PostgreSQL recomendado para importar y ejecutar actividades de bienestar.
-- Ajusta las FK de usuarios segun los nombres reales de tu plataforma.

create extension if not exists pgcrypto;

create table bienestar_actividades (
  id uuid primary key default gen_random_uuid(),
  version text not null default '1.0',
  tipo text not null default 'actividad-bienestar',
  slug text not null,
  categoria text not null,
  titulo text not null,
  emoji text,
  descripcion text,
  embed_url text not null,
  indicaciones jsonb not null default '[]'::jsonb,
  finalizacion jsonb not null default '{}'::jsonb,
  eventos jsonb not null default '{}'::jsonb,
  persistencia_recomendada jsonb not null default '{}'::jsonb,
  manifest_original jsonb not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aprobada', 'rechazada', 'archivada')),
  importado_por uuid,
  aprobado_por uuid,
  aprobado_at timestamptz,
  rechazo_motivo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, embed_url)
);

create table bienestar_asignaciones (
  id uuid primary key default gen_random_uuid(),
  actividad_id uuid not null references bienestar_actividades(id),
  psicologo_id uuid not null,
  estudiante_id uuid not null,
  estado text not null default 'asignada'
    check (estado in ('asignada', 'en_progreso', 'completada', 'cancelada')),
  instrucciones_psicologo text,
  fecha_asignacion timestamptz not null default now(),
  fecha_limite timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table bienestar_intentos (
  id uuid primary key default gen_random_uuid(),
  asignacion_id uuid not null references bienestar_asignaciones(id) on delete cascade,
  actividad_id uuid not null references bienestar_actividades(id),
  estudiante_id uuid not null,
  estado text not null default 'iniciado'
    check (estado in ('iniciado', 'en_progreso', 'completado', 'abandonado')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duracion_segundos integer not null default 0,
  culmino boolean not null default false,
  resumen jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table bienestar_interacciones (
  id uuid primary key default gen_random_uuid(),
  intento_id uuid not null references bienestar_intentos(id) on delete cascade,
  asignacion_id uuid not null references bienestar_asignaciones(id) on delete cascade,
  actividad_id uuid not null references bienestar_actividades(id),
  estudiante_id uuid not null,
  actividad_slug text not null,
  tipo text not null default 'ia'
    check (tipo in ('ia', 'visual', 'sistema')),
  entrada_estudiante text,
  respuesta_ia jsonb,
  datos jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_bienestar_actividades_estado on bienestar_actividades(estado);
create index idx_bienestar_actividades_categoria on bienestar_actividades(categoria);
create index idx_bienestar_asignaciones_psicologo on bienestar_asignaciones(psicologo_id);
create index idx_bienestar_asignaciones_estudiante on bienestar_asignaciones(estudiante_id);
create index idx_bienestar_intentos_asignacion on bienestar_intentos(asignacion_id);
create index idx_bienestar_interacciones_intento on bienestar_interacciones(intento_id);

create or replace function bienestar_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_bienestar_actividades_updated_at
before update on bienestar_actividades
for each row execute function bienestar_touch_updated_at();

create trigger trg_bienestar_asignaciones_updated_at
before update on bienestar_asignaciones
for each row execute function bienestar_touch_updated_at();

create trigger trg_bienestar_intentos_updated_at
before update on bienestar_intentos
for each row execute function bienestar_touch_updated_at();
