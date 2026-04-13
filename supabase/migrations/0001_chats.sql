-- Tabla de chats/investigaciones
create table if not exists solv_chats (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text not null default 'General',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla de mensajes dentro de cada chat
create table if not exists solv_mensajes (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references solv_chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Índices
create index if not exists idx_solv_mensajes_chat_id on solv_mensajes(chat_id);
create index if not exists idx_solv_chats_categoria on solv_chats(categoria);
create index if not exists idx_solv_chats_updated_at on solv_chats(updated_at desc);

-- RLS deshabilitado por ahora (app personal)
alter table solv_chats enable row level security;
alter table solv_mensajes enable row level security;

create policy "Allow all on solv_chats" on solv_chats for all using (true) with check (true);
create policy "Allow all on solv_mensajes" on solv_mensajes for all using (true) with check (true);
