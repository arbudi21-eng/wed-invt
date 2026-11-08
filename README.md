# Wedding Studio
`node serve.js`, then open http://localhost:3000 (a static host also works). 
- **Homepage (index.html):** choose 1 of 33 designs, fill the wedding details, add photos, video, music and your Supabase URL + anon key, then press **Generate & download ZIP**. The ZIP has `site/` (invitation + `admin/` console), `database/wedding_schema.sql`, `SETUP.md`, `event.json`.
- **`sites/`:** all 33 designs prebuilt, each with its own `admin/` console and `config.js`, using sample data.
- **Command line:** `node generate.js --all` rebuilds `sites/`; `node generate.js --design 04` builds one from `event.json` + `assets/` into `dist/`.
"# Inv-Gen" 
