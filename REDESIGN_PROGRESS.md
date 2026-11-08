# Redesign Progress Tracker

## ✅ Current status (latest session): all 33 designs are now unique and complete

Designs **02–24, 26, 27, 30** (the colour-swap clones and the incomplete 161-line template) were rebuilt by
`tools/build-designs.cjs`. Everything older in this file below this section is **historical** — the status tables
that say ❌ CLONE / ❌ BROKEN are out of date.

**How uniqueness is guaranteed.** Each design is a combination of four independent modules — *cover*, *hero layout*,
*photo-frame shape*, *section rhythm* (7 options each). Combinations come from a code over GF(7):
`(cover, hero, (cover+hero) mod 7, (cover+2·hero) mod 7)`, so any two designs share at most one of the four, i.e. they
differ in **≥3 of 4 dimensions** (the project's own rule). The script asserts this on every run (design 01 is the
word 0,0,0,0). Palette and font pair are on top of that and are unique per design.

| Design | Cover | Hero | Frames | Rhythm |
|---|---|---|---|---|
| 01 editorial-mocha | slide-up | split-right | arch | hairline (original) |
| 02 vellum-linen | curtain | diagonal | chamfer | newspaper |
| 03 garden-illustrated | bloom | split-right | chamfer | inset-frame |
| 04 quiet-luxe | slide-up | full-bleed | hard-square | timeline |
| 05 minimal-mono | dissolve | landscape | hard-square | colour-bands |
| 06 midnight-celestial | iris | centred | hard-square | newspaper |
| 07 terracotta-boho | iris | bottom-copy | chamfer | timeline |
| 08 blush-romantic | slide-up | diagonal | slanted | colour-bands |
| 09 emerald-deco | dissolve | full-bleed | blob | hairline |
| 10 batik-nusantara | wipe-left | split-left | arch | newspaper |
| 11 crimson-opulent | wipe-left | centred | blob | inset-frame |
| 12 snow-monochrome | letterbox | split-left | oval | timeline |
| 13 ocean-breeze | curtain | landscape | oval | hairline |
| 14 amber-heritage | bloom | full-bleed | oval | newspaper |
| 15 forest-mist | curtain | split-right | hard-square | cards |
| 16 rose-linen | slide-up | centred | oval | cards |
| 17 navy-gold | iris | split-left | slanted | hairline |
| 18 palm-breeze | letterbox | landscape | slanted | newspaper |
| 19 charcoal-ink | letterbox | bottom-copy | polaroid | colour-bands |
| 20 coral-modern | dissolve | diagonal | arch | timeline |
| 21 indigo-silk | bloom | bottom-copy | slanted | cards |
| 22 moss-rust | wipe-left | split-right | slanted | timeline |
| 23 apricot-soft | iris | landscape | arch | inset-frame |
| 24 slate-periwinkle | slide-up | bottom-copy | blob | newspaper |
| 26 bubbling-green | curtain | full-bleed | slanted | inset-frame |
| 27 lilac-romantic | letterbox | split-right | blob | ornament |
| 30 vintage-coral | bloom | split-left | hard-square | ornament |

(25, 28, 29, 31, 32, 33 are the earlier hand-built designs and were not touched.)

### What the build does / does not do
- Reuses 01's body markup and the **shared JS block verbatim** (lib/core.js regex-patches both). Only the 14 gradient
  colours inside `CFG.album` / `CFG.photos` are recoloured to each palette. Verified: JS identical to 01 modulo those.
- Uses the **fixed `.lb:not([hidden])` lightbox pattern**; 01 got the same one-line fix.
- Dark-mode auto-override was dropped from the rebuilt designs: each design now has one fixed palette.
- Removed the "No. 01" masthead numeral from the intro (anti-pattern list); 01 keeps its original.
- Sample "Dress" text still says "Warm neutrals / Mocha, sand…" in every design — it is placeholder copy that the
  generator replaces with the real event data.

### Re-running
```bash
node tools/build-designs.cjs          # regenerates designs/02-24,26,27,30 (+ applies the lb fix to 01)
node tools/rebuild-sites.cjs --all    # regenerates sites/*/index.html for those designs from lib/core.js
```
Edit the `D` table / module arrays at the top of `build-designs.cjs` to change a palette, font or module.

### ⚠ Pre-existing bug found in `lib/core.js` (not changed)
`WedCore.build()` step 7 (`/let pax=1;const nm[\s\S]*?parse\(\);[\s]*(<\/script>)/`) is lazy but anchored on the *last*
`parse();`, so it deletes everything between the RSVP handlers and the end of the script — the **video, album/lightbox,
gift list and wishes rendering** — and replaces it with WIRING_JS, which does not contain them. A site generated through
the studio's *Generate & download ZIP* therefore gets an empty gallery and no gift list. `tools/rebuild-sites.cjs` works
around it by moving that block above `let pax=1` before calling `build()`; the real fix is either the same reorder inside
the templates or putting the missing code in `templates/wiring.js`. Worth fixing before shipping the generator.

### Validation done this session
All 27 rebuilt designs: required-ID check, JS syntax, JS-identity vs 01, Playwright at 390px (no console errors, no
horizontal overflow, lightbox opens/closes), and the 27 built `sites/` copies render 9 album frames, 1 gift row and
5 story slides. Screenshots were taken with Google Fonts blocked, so serif/sans fell back to Georgia/system — check the
real fonts once online. The checker's `data-photo="cover"` warning is a false alarm: 01 never had that slot, core.js
injects `.cover-bg` itself.

---
# Historical notes (older sessions)

Last updated by: Claude Sonnet 4.6 (chat session)
Session: Verified real status of all 33 designs, fixed a shared JS bug, rewrote
3 designs from the broken template (25, 28, 29), light admin console fixes.

**Read `REDESIGN_README.md` first** — it explains a structural problem this
session found that the original brief didn't know about: designs 23–30 are
not color-swap clones, they are a **different, incomplete template** missing
required sections. Fixing those is a bigger job than "give it a unique look."

---

## How to Use This File

1. When you pick up a design to work on, change its status to `🔄 IN PROGRESS` and note the session
2. When finished, change to `✅ DONE` and note what's distinctive about it
3. After copying to `sites/XX-name/index.html`, mark the Sites column ✅
4. Validate before marking DONE — see "Validation" below (the old script
   referenced `qa-design.js` and `generate.js`; neither exists in this
   project snapshot — see README for what to use instead)

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| ❌ CLONE | Not started — still the exact 4-line color-swap of design 01 |
| ❌ BROKEN | Not started — the short 161-line template, missing required sections (see README) |
| 🔄 | In progress — being worked on this session |
| ✅ | Done — rewritten, validated, and copied to sites/ |
| ⚠️ | Done but needs review |

---

## Batch A — Editorial / Print / Type-led

| # | Name | Design Status | Sites Copy | Distinctive Features |
|---|------|--------------|-----------|----------------------|
| 01 | editorial-mocha | ❌ CLONE (this IS the base file everything else was copied from) | — | See DESIGN_SPECS.md §01 — rewrite this first, it's the reference for Batch A |
| 02 | vellum-linen | ❌ CLONE | ❌ | See DESIGN_SPECS.md §02 |
| 03 | garden-illustrated | ❌ CLONE | ❌ | See DESIGN_SPECS.md §03 |
| 04 | quiet-luxe | ❌ CLONE | ❌ | See DESIGN_SPECS.md §04 |
| 05 | minimal-mono | ❌ CLONE | ❌ | See DESIGN_SPECS.md §05 |

---

## Batch B — Dark Luxury / Night / Indonesian Heritage

| # | Name | Design Status | Sites Copy | Distinctive Features |
|---|------|--------------|-----------|----------------------|
| 06 | midnight-celestial | ❌ CLONE | ❌ | See DESIGN_SPECS.md §06 |
| 07 | terracotta-boho | ❌ CLONE | ❌ | See DESIGN_SPECS.md §07 |
| 08 | blush-romantic | ❌ CLONE | ❌ | See DESIGN_SPECS.md §08 |
| 09 | emerald-deco | ❌ CLONE | ❌ | See DESIGN_SPECS.md §09 |
| 10 | batik-nusantara | ❌ CLONE | ❌ | See DESIGN_SPECS.md §10 |

---

## Batch C — Romantic / Floral / Soft

| # | Name | Design Status | Sites Copy | Distinctive Features |
|---|------|--------------|-----------|----------------------|
| 11 | crimson-opulent | ❌ CLONE | ❌ | See DESIGN_SPECS.md §11 |
| 12 | snow-monochrome | ❌ CLONE | ❌ | See DESIGN_SPECS.md §12 |
| 13 | ocean-breeze | ❌ CLONE | ❌ | See DESIGN_SPECS.md §13 |
| 14 | amber-heritage | ❌ CLONE | ❌ | See DESIGN_SPECS.md §14 |
| 15 | forest-mist | ❌ CLONE | ❌ | See DESIGN_SPECS.md §15 |

---

## Batch D — Modern / Geometric / Clean

| # | Name | Design Status | Sites Copy | Distinctive Features |
|---|------|--------------|-----------|----------------------|
| 16 | rose-linen | ❌ CLONE | ❌ | See DESIGN_SPECS.md §16 |
| 17 | navy-gold | ❌ CLONE | ❌ | See DESIGN_SPECS.md §17 |
| 18 | palm-breeze | ❌ CLONE | ❌ | See DESIGN_SPECS.md §18 |
| 19 | charcoal-ink | ❌ CLONE | ❌ | See DESIGN_SPECS.md §19 |
| 20 | coral-modern | ❌ CLONE | ❌ | See DESIGN_SPECS.md §20 |

---

## Batch E — Earth / Organic / Textured

| # | Name | Design Status | Sites Copy | Distinctive Features |
|---|------|--------------|-----------|----------------------|
| 21 | indigo-silk | ❌ CLONE | ❌ | See DESIGN_SPECS.md §21 |
| 22 | moss-rust | ❌ CLONE | ❌ | See DESIGN_SPECS.md §22 |
| 23 | apricot-soft | ❌ **BROKEN** — missing `#gallery #film #closing #wishes #gift #track #dots #yes #no #pax #pm #pp #pn #send #wish #lb #lx #lc` and more. Do not treat as "just needs a look" — rebuild from the design-31 structural pattern. | ❌ | See DESIGN_SPECS.md §23 (palette/cover only — spec is thin, you'll need to invent hero/rhythm/frame choices yourself) |
| 24 | slate-periwinkle | ❌ **BROKEN** — same missing-sections problem as 23. | ❌ | See DESIGN_SPECS.md §24 (same caveat as 23) |
| 25 | mustard-gold | ✅ **DONE this session** — rewritten from scratch (was BROKEN like 23/24) | ✅ | Giant mustard initials filling a black cover, scale-fade dismiss; alternating black/mustard person bands; checkerboard count cells; strict 3-col rectangle album grid with difference-blend numbering |

---

## Batch F — Colour-Forward / Bold / Contemporary

| # | Name | Design Status | Sites Copy | Distinctive Features |
|---|------|--------------|-----------|----------------------|
| 26 | bubbling-green | ❌ **BROKEN** — same missing-sections problem as 23/24. | ❌ | See DESIGN_SPECS.md §26 (same caveat) |
| 27 | lilac-romantic | ❌ **BROKEN** — same missing-sections problem. | ❌ | See DESIGN_SPECS.md §27 (same caveat) |
| 28 | ivory-berg | ✅ **DONE this session** — rewritten from scratch (was BROKEN) | ✅ | Layered CSS-polygon iceberg silhouette rising on cover dismiss; calm alternating ivory/berg-blue person bands; centered single-column story carousel; irregular 4-col mosonry-style photo mosaic |
| 29 | teal-depth | ✅ **DONE this session** — rewritten from scratch (was BROKEN) | ✅ | Deep teal cover with gold corner brackets on intro, bottom band slides out left on dismiss; arch-frame person portraits with gold border; staggered two-row arch "frieze" album |
| 30 | vintage-coral | ❌ **BROKEN** — same missing-sections problem. | ❌ | See DESIGN_SPECS.md §30 (same caveat) |

---

## New Unique Designs (Reference-quality, already complete)

| # | Name | Design Status | Sites Copy | Distinctive Features |
|---|------|--------------|-----------|----------------------|
| 31 | javanese-manuscript | ✅ DONE | ✅ | Horizontal-scroll cover · batik border · kris ornament · masonry album |
| 32 | sacred-geometry | ✅ DONE | ✅ | Mandala clip-path cover · all-circle frames · teal/gold |
| 33 | cinematic-reel | ✅ DONE | ✅ | Letterbox cover · film grain · credit-roll intro · widescreen strips |

---

## What This Session Actually Did

1. **Audited all 33 designs** against the required-ID contract (see README).
   Found the brief's "30 color swaps" claim is only true for 02–22. Designs
   23–24, 26–27, 30 are a *different* 161-line template missing entire
   sections (gallery, film, closing/RSVP, wishes, lightbox). This is a more
   serious problem than a cosmetic one — these would fail hard in the real
   generator, not just look bland.
2. **Rewrote 25, 28, 29 from scratch** as genuine, distinct designs (one from
   each remaining un-rewritten batch: E, F, F), each validated against the
   full ID/class/data-t contract, each diffing 300+ lines from one another
   and 670+ lines from design 01.
3. **Found and fixed a real bug** present in the reference designs (31, 01)
   and now avoided in 25/28/29: `.lb{display:flex}` (or `grid`) with no
   `:not([hidden])` guard means the CSS `display` property wins over the
   browser's default `[hidden]{display:none}`, so the lightbox overlay
   intercepts clicks even while "hidden." Confirmed via Playwright: clicking
   `#open` on design 25 timed out because `#lb` (supposedly hidden) was
   blocking the button. **This bug is still present in designs 01 and 31+
   and everything cloned from them (02–22).** Worth fixing project-wide
   whenever those are next touched — the pattern is:
   ```css
   .lb{position:fixed;inset:0; /* ...no display here... */ }
   .lb:not([hidden]){display:flex;align-items:center;justify-content:center}
   ```
4. **Verified rendering** of 25/28/29 with Playwright (cover, hero, person
   sections, album, lightbox) at mobile viewport width — all load with zero
   console errors, all required `data-t` keys resolve in both `T.en` and
   `T.id`, lightbox confirmed opening via DOM state (not just screenshot).
5. **Light admin console fix** (`templates/admin.html`, propagated to all 33
   `sites/*/admin/index.html` copies): removed dead/misleading logic in the
   bulk-import validation (`...&&false` that always evaluated false,
   making the surrounding error check pointless — the button now just
   enables whenever there's at least one valid row, which was already the
   actual behavior, but the dead code made it confusing to read); added
   empty-state messages to the guest table and wishes list so a first-time
   admin with zero data doesn't see a blank table with no explanation.
   No other changes — see README for what was reviewed and left alone.

## Still Not Done (be honest with whoever picks this up next)

- **02–22**: still exact clones of 01. Rewriting 01 first (per the original
  plan — it's the reference for Batch A) unblocks nothing for these; each
  still needs its own pass per DESIGN_SPECS.md.
- **23, 24, 26, 27, 30**: still broken (missing sections), not just
  "needs a unique look." Treat like 25/28/29 were treated — rebuild from
  the design-31 structural skeleton, don't patch the existing 161-line file.
- **`lib/core.js` is missing from this project entirely.** See README,
  "Known gaps" section. Nothing in `designs/` can currently be test-driven
  through the real generator because the generator doesn't exist in this
  zip. Confirm this is still true before assuming the engine exists
  somewhere else.
- **`index.html` (studio picker)**: still only lists designs 01–10 in its
  `D[]` array (grep for `const $=s=>document.querySelector(s),D=` to find
  it). Needs updating once more designs are genuinely done — don't add
  23/24/26/27/30 to it until they're fixed, and don't add 02–22 until
  they're rewritten, or the picker will link to broken/identical pages.

## Validation (do this for every design you touch)

No `qa-design.js` exists in this project. Until/unless someone restores it
or an equivalent, validate manually:

```bash
F=designs/NN-name.html
for id in cover open guest lang music hero intro man woman gallery album film closing wishes gift track dots count mas vid vl map giftlist wl yes no pax pm pp pn send wish lb lx lc; do
  grep -q "id=\"$id\"" "$F" || echo "MISSING: #$id"
done
for slot in cover man woman; do grep -q "data-photo=\"$slot\"" "$F" || echo "MISSING: data-photo=$slot"; done
# diff from 01 and from your other recent designs — want 100+ lines different from each
diff designs/01-editorial-mocha.html "$F" | wc -l
# JS syntax check (replace path)
node -e "
const fs=require('fs');
const html=fs.readFileSync('$F','utf8');
const m=html.match(/<script>([\s\S]*?)<\/script>/);
try{new Function('document','window','location','navigator','addEventListener','crypto', m[1]); console.log('JS SYNTAX OK');}catch(e){console.log('SYNTAX ERROR:',e.message);}
"
```

For an actual visual check (recommended, not just structural), serve the
`designs/` folder locally and screenshot with Playwright — see README for
the exact pattern used this session. Confirm the lightbox and RSVP flow by
reading DOM state (`el.hidden`), not just by eyeballing a screenshot — a
dark-palette design can make an open lightbox hard to see in a static image.

## After All 30 Are Done

### Update index.html

The `D[]` array in `index.html` currently only shows 10 designs (01–10).
After completing all 30 + the 3 new unique designs, update it — same
instructions as before, see git history or ask for the full target array
if it's not obvious from the file.

Also update the description paragraph in `index.html`:
```
"Pick one of 33 designs..."
```

### Final zip
```bash
cd /home/claude  # or wherever the project lives
zip -r wedding-generator-final.zip wedding-generator/ \
  --exclude "wedding-generator/.qa/*" \
  --exclude "wedding-generator/dist/*" \
  --exclude "wedding-generator/*.ps1"
```
