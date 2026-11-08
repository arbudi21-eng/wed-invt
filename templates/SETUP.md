# Setup

1. Create a free project at supabase.com.
2. SQL Editor: run `database/wedding_schema.sql` (includes `claim_slug` and `am_i_admin`).
3. Authentication > Users > Add user (your email + password), then run:
   `insert into public.admins (user_id) select id from auth.users where email = 'YOU@EXAMPLE.COM';`
4. Settings > API: copy Project URL and anon public key into `site/{SLUG}/config.js`.
5. Put photos in `site/{SLUG}/assets/` (WebP, ~1600 px, <300 KB), music as `music.mp3` (<3 MB). Edit names, date, venue, gifts in `CFG` / `T` inside `site/{SLUG}/index.html`.
6. Deploy the `site/{SLUG}/` folder to your host.
   - Shared host (Netlify, Cloudflare Pages, etc.): deploy `site/{SLUG}/` under path `/{SLUG}/`. Your link: `https://YOUR-HOST/{SLUG}/`
   - Separate host per couple: deploy `site/` as its own project. Your link: `https://{SLUG}.YOUR-DOMAIN/` (with wildcard DNS).
7. Set the deployed address as Base URL in admin Settings (`/{SLUG}/admin/`).
8. Remove demo data: `delete from public.guests where code like 'DEMO%';`
9. Add guests, tap Send on WhatsApp for each, watch RSVPs arrive. Guest link: `https://YOUR-HOST/{SLUG}/?c=<code>`; console: `https://YOUR-HOST/{SLUG}/admin/`.
