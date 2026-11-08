# Wedding Generator — Design Redesign Brief

**Updated by a chat session on 2026-11-07.** The original version of this
file described one problem (30 color-swap clones). That problem is real for
*some* of the 30, but this session found a second, more serious problem the
original brief didn't know about. Read "The Real Problem" below before you
touch anything — it changes what "rewrite design NN" means for 6 of the 30.

---

## The Real Problem (corrected)

There are actually **two different broken clusters** inside `designs/01
through designs/30`, not one:

### Cluster 1 — designs 02–22: exact color-swap clones (the original claim, confirmed true)

```bash
diff designs/01-editorial-mocha.html designs/09-emerald-deco.html
```
Only 4 lines differ — the CSS custom property values near the top of the
file. Same HTML structure, same cover, same hero, same layout, same
everything, for all of 02 through 22. This part of the original brief is
accurate.

### Cluster 2 — designs 23, 24, 26, 27, 30: a *different*, structurally incomplete template

These five are **not** clones of design 01 — they're a shorter, 161-line
file (vs. 429 lines for the 01-style clones) that is **missing entire
required sections**: no `#gallery`, no `#film`, no `#closing` (RSVP), no
`#wishes`, no `#gift`, no `#track`/`#dots` (story carousel), no RSVP button
IDs (`#yes #no #pax #pm #pp #pn #send #wish`), no lightbox (`#lb #lx #lc`).

Run the ID check from `REDESIGN_PROGRESS.md` → "Validation" against any of
these five and you'll see 15+ missing IDs. **Giving these five "a unique
look" will not fix them** — they need the missing sections built from
scratch, structured the way design 31 (`javanese-manuscript`) does it, with
real content wired to the shared JS contract (see "The JS block" below).
Treat them like an 01-style clone that also happens to be missing half its
HTML, not like a design that just needs new CSS.

**Designs 25, 28, 29** were also originally part of this broken cluster.
This session rewrote all three from scratch as working, distinct designs —
they can now be used as additional structural references alongside 31–33.

### Cluster 3 — designs 31, 32, 33: genuinely distinct, complete, correct

These were already done before this session and remain the primary
reference for what "distinct" and "structurally complete" both mean.

**When you pick up a design to work on, check `REDESIGN_PROGRESS.md` first**
to see which cluster it's actually in — don't assume from its number.

---

## Known Gaps In This Project Snapshot (read before assuming tools exist)

Several files referenced throughout this project's own documentation —
including the original version of this README and `.agent-brief.md` — do
**not exist** in this copy of the project:

- **`lib/core.js`** — described everywhere as "the generator engine," "DO
  NOT TOUCH," the thing that "injects real event data" into a design file.
  `lib/` is an empty directory in this snapshot. There is currently no
  generator. If you need it, you'll have to build it, find it in a
  different snapshot/branch, or ask whoever has it — don't assume it's
  hiding somewhere in this zip.
- **`generate.js`** and **`qa-design.js`** — referenced in `.agent-brief.md`
  as mandatory verification steps ("run `node qa-design.js NN`... must
  print OK"). Neither file exists here. Use the manual validation steps in
  `REDESIGN_PROGRESS.md` instead until/unless these are restored.
- **`serve_test.cjs`** does exist, and **`serve.cjs`** does exist — these
  just serve static files, they don't reference the missing generator.

This means: right now, you cannot "build" a design with real guest data and
QA the built output the way `.agent-brief.md` describes. You can only
validate the static `designs/*.html` files directly (structure, required
IDs, JS syntax, and — recommended — an actual browser render). This
session did the latter using a local static file server + Playwright
screenshots; see the pattern in "How This Session Validated Designs" below.

If you're a future AI and you *do* have access to `lib/core.js` in your
environment (e.g. a different snapshot was supplied), ignore this section —
it only applies to whatever zip/copy you're reading this inside of right
now.

---

## Project Structure

```
wedding-generator/
├── designs/              ← SOURCE: edit these (one file per design)
│   ├── 01-editorial-mocha.html   ← color-swap base (Cluster 1's origin) — rewrite this first
│   ├── 02-vellum-linen.html      ← Cluster 1 clone — TODO
│   ...
│   ├── 23-apricot-soft.html      ← Cluster 2, BROKEN — missing sections, not just a reskin
│   ├── 25-mustard-gold.html      ← DONE this session — was Cluster 2, now a working reference
│   ├── 28-ivory-berg.html        ← DONE this session — was Cluster 2, now a working reference
│   ├── 29-teal-depth.html        ← DONE this session — was Cluster 2, now a working reference
│   ├── 31-javanese-manuscript.html  ← DONE (reference for new style)
│   ├── 32-sacred-geometry.html      ← DONE (reference for new style)
│   └── 33-cinematic-reel.html       ← DONE (reference for new style)
│
├── sites/                ← DEPLOYED copies — after editing a design,
│   ├── 01-editorial-mocha/   copy designs/01-*.html → sites/01-*/index.html
│   │   ├── index.html        (this is what the picker iframe previews)
│   │   ├── admin/index.html  (shared console — see "Admin console" below;
│   │   │                      this session fixed 2 small issues project-wide)
│   │   ├── config.js         (per-site Supabase config — do not touch)
│   │   └── _headers          (do not touch)
│   ...
│
├── lib/                  ← EMPTY in this snapshot — see "Known Gaps" above
├── templates/            ← admin.html (shared console source), SETUP.md, SQL schema
├── index.html            ← Studio picker UI — update D[] array if adding designs
│                            (currently only lists 01–10; don't add a design
│                            here until it's genuinely done and validated)
│
├── REDESIGN_README.md    ← This file
├── REDESIGN_PROGRESS.md  ← Track what's done / in progress / todo — check this FIRST
└── DESIGN_SPECS.md       ← Per-design visual brief for all 30
                             (note: specs for 23–30 are noticeably thinner
                             than 01–22's — they give palette/fonts/cover
                             only, not hero layout or section rhythm. You'll
                             need to invent those parts yourself, the way
                             this session did for 25/28/29.)
```

---

## Rules — Read Before Touching Any File

### 1. The JS block is sacred — never change it (with one caveat below)

Lines 311–429 of a Cluster-1-style design file (01-style, 429 lines total)
contain the shared JavaScript. **Copy it verbatim** from
`designs/01-editorial-mocha.html` (once rewritten) or from `designs/31-*`,
`designs/25-*`, `designs/28-*`, or `designs/29-*` — all four are confirmed
working references — into every new design.

The only JS you may change per-design:
- `CFG.album[].g` — gradient colors to match the design palette
- `CFG.photos[].g` — same

Everything else in the JS block must be **identical** across all designs.

**Caveat found this session:** the shared CSS pattern for `.lb` (the
lightbox) in the *existing* reference designs (01, 31) has a real bug:

```css
/* BUGGY — present in 01 and 31 as of this snapshot: */
.lb{position:fixed;inset:0;z-index:70;background:rgba(10,6,5,.94);display:grid;place-items:center}
```

`display:grid` (or `flex`) on `.lb` applies regardless of the `hidden`
attribute, because an author CSS rule wins over the browser's built-in
`[hidden]{display:none}` default. In practice this means the "hidden"
lightbox overlay still intercepts clicks, which breaks `#open` and other
buttons underneath it. This session confirmed it with Playwright (a click
on `#open` timed out, with Playwright's error log naming `#lb` as the
element intercepting pointer events) and fixed it in 25/28/29 using this
pattern instead:

```css
/* FIXED pattern — use this in any new design: */
.lb{position:fixed;inset:0;z-index:60;background:rgba(10,6,5,.94)}
.lb:not([hidden]){display:flex;align-items:center;justify-content:center}
```

**This bug is still present in design 01 and design 31, and therefore in
every Cluster-1 clone (02–22) once they're copied from 01.** It's a
one-line fix; apply it whenever you next touch any of those files, even if
you're not otherwise changing that design's CSS.

### 2. Required HTML element IDs — all must be present

Every design must include elements with these exact IDs or the generator
breaks:

```
#cover        — the splash screen (position:fixed, z-index:50)
#open         — the button that dismisses the cover
#guest        — where the guest name is shown on the cover
#lang         — language toggle button
#music        — music toggle button

#hero         — first full-screen section
#intro        — invitation intro section  
#man          — groom section
#woman        — bride section
#gallery      — story carousel section
#album        — photo gallery section
#film         — video section
#closing      — RSVP section
#wishes       — guest wishes (starts hidden)
#gift         — gift accounts section

#track        — carousel scroll container
#dots         — carousel dot indicators
#count        — countdown container
#mas          — filmstrip/album container
#vid          — video container
#vl           — video external link container
#map          — map link anchor
#giftlist     — gift accounts container
#wl           — wishes list container

#yes, #no     — RSVP buttons
#pax          — guest count panel (starts hidden)
#pm, #pp, #pn — count −/+ and display
#send         — WhatsApp confirm button
#wish         — send wish button

#lb, #lx, #lc — lightbox, close button, content
```

**This is exactly the list that designs 23, 24, 26, 27, 30 fail.** Check it
for real before marking anything done — see Validation in
`REDESIGN_PROGRESS.md`.

### 3. Required data-t attributes

The JS fills content via `[data-t]` attributes. Every design needs these
present on some element:
`wed, dear, open, date, h, hp, cd, when, where, dress, w, v, d, map, gal, cl, clp, yes, no, how, send, wh, wb, gf, gfp, copy, copied, fl, gl, vph, vl, guest, introK, introH, introP, manK, manP, manF, womanK, womanP, womanF, lang`

Validate that every `data-t="x"` in your HTML has a matching key in both
`T.en` and `T.id` inside the script block — a missing key renders literally
as nothing (not an error) and is easy to miss by eye. This session checked
it programmatically; see the pattern in "How This Session Validated
Designs" below.

### 4. Required data-photo attributes

```html
<div data-photo="cover">  — cover background photo slot
<div data-photo="man">    — groom photo slot
<div data-photo="woman">  — bride photo slot
```

The generator adds `.has-photo` and sets `background-image` on these.

### 5. Required CSS classes

```
.rv      — reveal on scroll (IntersectionObserver adds .in)
.btn     — primary button style
.btn.alt — secondary/outline button style
.cp      — carousel photo caption heading (filled by JS)
.sp      — carousel photo story paragraph (filled by JS)
.card    — story carousel card (needs --g CSS var for gradient) — note: this
           session's 25/28/29 used differently-named card classes
           (.story-card) consistent with 01/31's own naming; `.card` in the
           original list appears aspirational rather than actually used by
           the shared JS — the JS only requires `.cp` and `.sp` to exist
           somewhere inside whatever card markup you choose
.frame   — album filmstrip frame (needs --g CSS var) — same note as .card;
           the actual JS only sets `.style.background` on whatever element
           you hand it in the album-building forEach, not a fixed class name
.fn      — frame number label inside .frame (same note)
.big     — lightbox enlarged view (this one IS created literally by the JS
           — `d.className='big'` — keep this one exact)
.acct    — gift account row (created literally by JS — keep exact)
.no      — account number inside .acct (created literally by JS — keep exact)
.wq      — wish blockquote (created literally by JS — keep exact)
.slide   — story carousel slide wrapper — not actually referenced by the
           shared JS in 01/31/25/28/29; likely stale from an earlier version
```

**Correction from the original brief:** `.card`, `.frame`, `.fn`, and
`.slide` are not names the shared JS creates or depends on — they appear to
be leftover naming suggestions, not a real contract. Don't spend time
matching them exactly; name your own card/frame/slide markup however suits
the design, as 25/28/29 do. `.rv`, `.btn`, `.cp`, `.sp`, `.big`, `.acct`,
`.no`, and `.wq` **are** load-bearing — the JS creates or selects these by
exact class name — keep those exact.

---

## What Makes a Design Distinct

Unchanged from the original brief — each design must differ in at least
**3 of these 4 dimensions** from every other design:

| Dimension | Examples of distinct choices |
|-----------|------------------------------|
| **Cover** | Slide-up / clip-path iris / horizontal scroll panels / letterbox / split curtain / fade-out / scale-dissolve / silhouette-rise |
| **Hero layout** | Split grid / centered column / full-bleed portrait / diagonal / stacked type / side-by-side |
| **Photo frame shape** | Arch (999px radius) / circle / square / polaroid / filmstrip / diagonal clip / irregular / oval |
| **Section rhythm** | Hairline rules / full-bleed colored bands / overlapping cards / newspaper columns / timeline / alternating color bands |

Palette alone does **not** make a design distinct. 25 (black/mustard
high-contrast blocks), 28 (calm ivory/berg alternating bands with an
iceberg-silhouette cover), and 29 (deep teal with gold corner brackets and
an arch frieze) each hit cover + hero + frame + rhythm distinctly — use
them as a fourth, fifth, and sixth reference alongside 31/32/33.

### Anti-patterns to avoid (make designs look AI-generated)

- Warm cream `#F4F1EA` + terracotta `#D97757` as the default palette
- `border-radius: 12px` on every single card/element  
- ALL CAPS labels on everything — only use sparingly
- `A · B · C` middle-dot separators as the only typographic device
- Numbered markers `01 / 02 / 03` unless content is genuinely sequential
- `box-shadow: rgba(0,0,0,.1)` softly under every card
- Fade-and-slide-up on every section (`.rv` reveal is fine but should be subtle)

---

## How to Rewrite One Design

### Step 1 — Check REDESIGN_PROGRESS.md for which cluster it's in

Cluster 1 (clone) → proceed to Step 2 as normal.
Cluster 2 (broken) → you're not reskinning, you're rebuilding missing
sections. Use design 31's full HTML structure as your skeleton (it has
every required section correctly ordered and wired) rather than starting
from the broken 161-line file.

### Step 2 — Read the spec

Open `DESIGN_SPECS.md` and read the brief for the design number you're
doing. If it's one of 23–30, the spec is thin (palette/fonts/cover only) —
you'll need to invent the hero layout, frame shape, and section rhythm
yourself, consistent with the batch's theme. 25/28/29's specs were equally
thin; see their finished files for how this session filled those gaps.

### Step 3 — Write a 5-line design plan

Before touching the file, decide:
```
Cover:   [look + dismiss animation]
Hero:    [layout]  
Frames:  [photo shape]
Rhythm:  [section flow]
Palette: [5 hex values: bg, ink, accent1, accent2, mute]
Fonts:   [Google Fonts — serif + sans pair]
```

### Step 4 — Write the file

Structure (same as before):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- charset, viewport, title -->
  <!-- Google Fonts link -->
  <style>
    /* :root — CSS custom properties (palette + fonts) */
    /* dark mode override */
    /* base reset */
    /* cover styles */
    /* hero styles */
    /* section styles */
    /* component styles (carousel, album, lightbox, RSVP, gifts, wishes) */
    /* music/lang fixed buttons */
    /* footer */
    /* .rv reveal animation */
  </style>
</head>
<body class="locked">
  <!-- #music button (fixed) -->
  <!-- #lang button (fixed) -->
  <!-- #cover (fixed fullscreen) -->
  <!-- #hero -->
  <!-- #intro.rv -->
  <!-- #man.rv -->  
  <!-- #woman.rv -->
  <!-- countdown + details section.rv -->
  <!-- #gallery.rv -->
  <!-- #film.rv -->
  <!-- #album.rv -->
  <!-- #lb (lightbox, hidden) -->
  <!-- #closing.rv -->
  <!-- #wishes.rv (hidden) -->
  <!-- #gift.rv -->
  <!-- <footer> -->
  <script>
    /* PASTE VERBATIM from a confirmed-working reference: 01 (once fixed),
       25, 28, 29, or 31–33. Only change: CFG.album[].g, CFG.photos[].g,
       and apply the .lb fix from Rule #1 if copying from 01 or 31. */
  </script>
</body>
</html>
```

### Step 5 — Validate

See `REDESIGN_PROGRESS.md` → "Validation" for the full command set
(required-ID check, data-photo check, diff-uniqueness check, JS syntax
check). There is no `qa-design.js` in this snapshot — see "Known Gaps."

### Step 6 — Copy to sites folder

```bash
cp designs/01-editorial-mocha.html sites/01-editorial-mocha/index.html
```

---

## How This Session Validated Designs

No real generator exists here, so validation was structural + a live
browser render, not a full build-with-real-data pass:

1. **Required-ID grep loop** (see Validation section in PROGRESS.md).
2. **JS syntax check** via Node's `Function` constructor against the
   extracted `<script>` block, with DOM globals stubbed:
   ```bash
   node -e "
   const fs=require('fs');
   const html=fs.readFileSync('designs/NN-name.html','utf8');
   const m=html.match(/<script>([\s\S]*?)<\/script>/);
   try{new Function('document','window','location','navigator','addEventListener','crypto', m[1]); console.log('JS SYNTAX OK');}catch(e){console.log('SYNTAX ERROR:',e.message);}
   "
   ```
3. **data-t key coverage** — every `data-t="x"` found in the HTML checked
   against the keys present in `T.en` inside the script block, flagging any
   that would silently render blank.
4. **Live render with Playwright** (chromium already available in this
   environment via the `playwright` pip package) — served the `designs/`
   folder with Python's `http.server`, loaded each design at a 420×900
   mobile viewport, clicked `#open`, scrolled to key sections, and clicked
   an album tile to open the lightbox — checking for zero console errors
   and confirming `#lb`'s `hidden` property via `page.eval_on_selector`
   (not just a screenshot, since a dark-palette design can make an open
   lightbox hard to distinguish from closed in a static image).

This is not the `artifact-emulator` skill (that's for Claude-made
artifacts/Claude Docs, not arbitrary static sites, and needs a cloud Cowork
session this environment may not be) — it's a plain local Playwright
script. Reuse this pattern for future designs if no better tool exists by
then.

---

## Admin Console (`templates/admin.html`, mirrored to every `sites/*/admin/index.html`)

This session did a **light** pass, not a rewrite — there was no stated bug
list, and the console is otherwise a working, reasonably clean ~450-line
guest/wishes/settings manager wired to Supabase. Two real issues found and
fixed, propagated to the template and all 33 deployed copies:

1. **Dead/misleading validation logic** in the bulk-import handler: the
   Import button's `disabled` state was computed as
   `!rows.length||!!$('#bv').textContent.includes(' — ')&&false` — the
   trailing `&&false` makes the second half of that expression always
   `false` regardless of whether any pasted row had an error, so it was
   doing nothing except making the code misleading to read. Simplified to
   `!rows.length` (enable whenever at least one valid row exists), which is
   what the code actually did anyway — just without the confusing dead
   branch.
2. **No empty-state messaging.** A brand-new deployment with zero guests or
   zero wishes showed a bare, unexplained empty table. Added a one-line
   placeholder row/message in both cases ("No guests yet — add one above or
   use Bulk import." / "No wishes yet.").

**Reviewed and left alone** (no changes, no stated problems found):
CSV export escaping (quote-doubling is correct), phone number
normalization (`nph()`), all guest/wish rendering (uses `textContent` via
a small `h()` helper throughout — no `innerHTML` of user data, so no XSS
exposure there), RSVP/WhatsApp link building, Supabase auth guard.

If "revise the admin console" meant something more specific when this was
requested (a particular broken workflow, a missing feature), that context
wasn't available this session — flag it explicitly next time so a future
pass can target it instead of guessing.

---

## Rewrite Order (Suggested — updated)

Do these in batches of 5, same as before, but now cluster-aware:

| Batch | Designs | Theme | Cluster |
|-------|---------|-------|---------|
| A | 01–05 | Editorial / print / type-led | 1 (clone) |
| B | 06–10 | Dark luxury / night / Indonesian heritage | 1 (clone) |
| C | 11–15 | Romantic / floral / soft | 1 (clone) |
| D | 16–20 | Modern / geometric / clean | 1 (clone) |
| E | 21–25 | Earth / organic / textured | 21–22 clone, 23–24 **broken**, 25 ✅ done |
| F | 26–30 | Colour-forward / bold / contemporary | 26–27 **broken**, 28–29 ✅ done, 30 **broken** |

See `DESIGN_SPECS.md` for per-design briefs (thinner for 23–30, see note
above). See `REDESIGN_PROGRESS.md` for current status — it is the source of
truth, more detailed and more current than this table.

---

## After All 30 Are Done

1. Update `index.html` — the `D[]` array currently only shows designs
   01–10. Extend it to show all genuinely-done designs — do not add a
   design to this array until it passes the full validation in
   `REDESIGN_PROGRESS.md`, or the picker will link to a broken or
   indistinct page.
   ```js
   const D=[['01','editorial-mocha'],['02','vellum-linen'],...,['30','vintage-coral']];
   ```

2. Final validation:
   ```bash
   for f in designs/0{1..9}-*.html designs/[12][0-9]-*.html designs/30-*.html; do
     echo -n "$f: "
     for id in cover open hero man woman gallery album closing track dots count mas; do
       grep -q "id=\"$id\"" "$f" || echo -n "MISSING#$id "
     done
     echo ""
   done
   ```

3. Zip and deliver: `zip -r wedding-generator-final.zip wedding-generator/`
