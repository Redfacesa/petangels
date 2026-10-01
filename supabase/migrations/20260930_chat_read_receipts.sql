-- Paste on kdqqetllmtoeafrphsjc if the previous grant was too wide.
-- Clients may only set read_at on unread messages they received.

alter table public.pa_chat_messages
  add column if not exists read_at timestamptz;

revoke update on public.pa_chat_messages from authenticated;
grant update (read_at) on public.pa_chat_messages to authenticated;

drop policy if exists pa_chat_messages_update on public.pa_chat_messages;
create policy pa_chat_messages_update on public.pa_chat_messages for update to authenticated
  using (
    read_at is null
    and sender_id not in (select id from public.pa_profiles where auth_user_id = auth.uid())
    and chat_id in (
      select id from public.pa_chats
      where a_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
         or b_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    )
  )
  with check (
    read_at is not null
    and sender_id not in (select id from public.pa_profiles where auth_user_id = auth.uid())
    and chat_id in (
      select id from public.pa_chats
      where a_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
         or b_id in (select id from public.pa_profiles where auth_user_id = auth.uid())
    )
  );

notify pgrst, 'reload schema';
