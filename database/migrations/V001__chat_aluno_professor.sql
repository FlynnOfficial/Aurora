begin;

alter table public.support_chats
    add column if not exists recipient_id bigint references public.users(id),
    add column if not exists request_id uuid;

alter table public.support_messages
    add column if not exists request_id uuid;

create unique index if not exists uq_support_chat_participants
    on public.support_chats (requester_id, recipient_id);
create unique index if not exists uq_support_chat_request
    on public.support_chats (requester_id, request_id);
create unique index if not exists uq_support_message_request
    on public.support_messages (chat_id, sender_id, request_id);
create index if not exists idx_support_messages_chat_id
    on public.support_messages (chat_id, id);
create index if not exists idx_support_chat_recipient
    on public.support_chats (recipient_id);
create index if not exists idx_students_org_class
    on public.students (organization_key, class_name) where active;
create index if not exists idx_activities_org_class
    on public.activities (organization_key, class_name, created_at desc);

alter table public.support_chats enable row level security;
alter table public.support_messages enable row level security;

commit;
