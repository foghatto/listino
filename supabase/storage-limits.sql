-- Facoltativo (hardening): limita le foto a 5 MB e ai formati JPG/PNG/WebP.
-- Se hai già eseguito schema.sql, incolla ed esegui solo questo nello SQL Editor di Supabase.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('service-images', 'service-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
