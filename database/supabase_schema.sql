-- Aurora production schema for PostgreSQL/Supabase.
-- Run this file in Supabase SQL Editor for a new project.

create extension if not exists pgcrypto;

create table if not exists organizations (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    created_at timestamptz not null default now(),
    active boolean not null default true
);

create table if not exists users (
    id bigserial primary key,
    email text not null unique,
    password text not null,
    name text not null,
    organization_key text not null default 'UNASSIGNED',
    role text not null check (role in ('STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN')),
    active boolean not null default true,
    created_at timestamptz not null default now(),
    last_login timestamptz,
    failed_attempts integer not null default 0
);

create index if not exists idx_users_organization on users (organization_key);
create index if not exists idx_users_role on users (role);

create table if not exists registrations (
    id bigserial primary key,
    type text not null default 'ADMIN' check (type = 'ADMIN'),
    data text,
    email text not null,
    name text not null,
    password text not null,
    organization_key text not null,
    status text not null check (status in ('PENDING', 'APPROVED', 'REJECTED')),
    submitted_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
    reviewed_at timestamptz,
    reviewed_by bigint references users(id),
    unique (email, status)
);

create table if not exists admins (
    id bigserial primary key,
    user_id bigint not null unique references users(id) on delete cascade,
    role text not null,
    cpf text,
    phone text,
    address text,
    active boolean not null default true
);

create table if not exists classes (
    id bigserial primary key,
    organization_key text not null,
    name text not null,
    school_year integer not null,
    active boolean not null default true,
    unique (organization_key, name, school_year)
);

create table if not exists subjects (
    id bigserial primary key,
    organization_key text not null,
    name text not null,
    active boolean not null default true,
    unique (organization_key, name)
);

create table if not exists students (
    id bigserial primary key,
    user_id bigint not null unique references users(id) on delete cascade,
    organization_key text not null,
    class_id bigint references classes(id),
    class_name text,
    enrollment text not null unique,
    cpf text,
    phone text,
    address text,
    active boolean not null default true
);

create table if not exists teachers (
    id bigserial primary key,
    user_id bigint not null unique references users(id) on delete cascade,
    organization_key text not null,
    subject text,
    cpf text,
    phone text,
    address text,
    active boolean not null default true
);

create table if not exists teacher_subjects (
    teacher_id bigint not null references teachers(id) on delete cascade,
    subject_id bigint not null references subjects(id) on delete cascade,
    primary key (teacher_id, subject_id)
);

create table if not exists teacher_classes (
    teacher_id bigint not null references teachers(id) on delete cascade,
    class_id bigint references classes(id) on delete cascade,
    class_name text,
    primary key (teacher_id, class_name)
);

create table if not exists activities (
    id bigserial primary key,
    organization_key text not null,
    teacher_id bigint not null references teachers(id) on delete restrict,
    subject_id bigint references subjects(id) on delete restrict,
    class_id bigint references classes(id) on delete restrict,
    subject text not null,
    class_name text not null,
    title text not null,
    description text,
    due_date timestamptz not null,
    created_at timestamptz not null default now(),
    archived_at timestamptz
);

create index if not exists idx_activities_teacher on activities (teacher_id, created_at desc);
create index if not exists idx_activities_class on activities (class_id, due_date);

create table if not exists activity_questions (
    id bigserial primary key,
    activity_id bigint not null references activities(id) on delete cascade,
    position integer not null,
    type text not null check (type in ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY')),
    prompt text not null,
    points numeric(6,2) not null check (points > 0),
    correct_answer text,
    options text,
    unique (activity_id, position)
);

create table if not exists submissions (
    id bigserial primary key,
    activity_id bigint not null references activities(id) on delete cascade,
    student_id bigint not null references students(id) on delete cascade,
    submitted_at timestamptz not null default now(),
    graded_at timestamptz,
    teacher_feedback text,
    total_score numeric(8,2),
    status text not null default 'SUBMITTED' check (status in ('SUBMITTED', 'GRADED')),
    unique (activity_id, student_id)
);

create table if not exists answers (
    id bigserial primary key,
    submission_id bigint not null references submissions(id) on delete cascade,
    question_id bigint not null references activity_questions(id) on delete cascade,
    answer text,
    score numeric(8,2),
    teacher_feedback text,
    unique (submission_id, question_id)
);

create table if not exists grades (
    id bigserial primary key,
    student_id bigint not null references students(id) on delete cascade,
    subject_id bigint references subjects(id) on delete restrict,
    subject text not null,
    period text not null,
    value double precision not null check (value between 0 and 10),
    weight integer not null default 1 check (weight > 0),
    status text not null check (status in ('APPROVED', 'FAILED', 'RECOVERING')),
    created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists idx_grades_student_subject on grades (student_id, subject_id);

create table if not exists security_audits (
    id bigserial primary key,
    email text not null,
    action text not null,
    resource text,
    details text,
    success boolean not null default false,
    ip_address text not null,
    user_agent text,
    timestamp bigint not null,
    created_at timestamptz not null default now()
);

create or replace view student_subject_averages as
select
    g.student_id,
    coalesce(g.subject_id::text, g.subject) as subject_key,
    avg(g.value * g.weight) / nullif(avg(g.weight), 0) as average,
    sum(g.weight) as total_weight
from grades g
group by g.student_id, coalesce(g.subject_id::text, g.subject);

-- Remove activity answers and old history after two weeks, as required by the product rules.
create or replace function purge_expired_school_history() returns void
language plpgsql security definer as $$
begin
    delete from submissions
    where (graded_at is not null and graded_at < now() - interval '14 days')
       or (graded_at is null and exists (
           select 1 from activities a
           where a.id = submissions.activity_id
             and a.due_date < now() - interval '14 days'
       ));
    delete from activities
    where due_date < now() - interval '14 days'
      and not exists (select 1 from submissions s where s.activity_id = activities.id);
end;
$$;

-- The backend connects with a private database role. These indexes and constraints enforce
-- organization boundaries in application queries; Supabase Auth RLS can be added when the
-- frontend is moved from the custom JWT flow to Supabase Auth.
create index if not exists idx_students_organization on students (organization_key);
create index if not exists idx_teachers_organization on teachers (organization_key);
create index if not exists idx_subjects_organization on subjects (organization_key);
create index if not exists idx_classes_organization on classes (organization_key);

-- Do not expose base tables through Supabase's anon/authenticated API.
-- The application backend uses the private PostgreSQL connection and applies
-- organization authorization before every domain query.
alter table organizations enable row level security;
alter table users enable row level security;
alter table registrations enable row level security;
alter table admins enable row level security;
alter table classes enable row level security;
alter table subjects enable row level security;
alter table students enable row level security;
alter table teachers enable row level security;
alter table teacher_subjects enable row level security;
alter table teacher_classes enable row level security;
alter table activities enable row level security;
alter table activity_questions enable row level security;
alter table submissions enable row level security;
alter table answers enable row level security;
alter table grades enable row level security;
alter table security_audits enable row level security;
