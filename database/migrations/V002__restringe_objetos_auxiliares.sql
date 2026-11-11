begin;

alter view if exists public.student_subject_averages set (security_invoker = true);
do $$
declare
    api_role text;
begin
    if to_regprocedure('public.purge_expired_school_history()') is not null then
        revoke execute on function public.purge_expired_school_history() from public;
        for api_role in select rolname from pg_roles where rolname in ('anon', 'authenticated') loop
            execute format('revoke execute on function public.purge_expired_school_history() from %I', api_role);
        end loop;
    end if;
end
$$;

commit;
