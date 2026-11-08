// Rebuilds the non-unique designs (02-24, 26, 27, 30) from four independent modules:
// cover x hero x photo-frame x section-rhythm. Words come from an MDS code over GF(7):
// (cover, hero, cover+hero, cover+2*hero) mod 7, so any two designs (and design 01 = 0,0,0,0)
// differ in at least 3 of the 4 dimensions. The shared JS block + body copy of 01 is reused verbatim
// because lib/core.js regex-patches it.
// Usage: node tools/build-designs.cjs   (run from project root)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const base = fs.readFileSync(path.join(root, 'designs/01-editorial-mocha.html'), 'utf8');

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgba = (h, a) => `rgba(${hex(h).join(',')},${a})`;
const mix = (a, b, t) => '#' + hex(a).map((x, i) => Math.round(x * (1 - t) + hex(b)[i] * t).toString(16).padStart(2, '0')).join('');

// ---------- shared pieces lifted from 01 ----------
const jsRaw = base.slice(base.indexOf('<script>') + 8, base.indexOf('</script>'));
let body = base.slice(base.indexOf('<body class="locked">'), base.indexOf('<script>'));
const sw = (s, a, b) => { if (!s.includes(a)) throw new Error('template drift: ' + a); return s.replace(a, b); };
body = sw(body, '<em>No. 01</em>', '<em>&amp;</em>');
body = sw(body, '<section class="rv">\n  <h2 data-t="cd">', '<section class="rv det">\n  <h2 data-t="cd">');

// ---------- modules ----------
const BASE = `
*{box-sizing:border-box;margin:0}
html{scroll-behavior:smooth;scroll-padding-top:env(safe-area-inset-top,0px)}
body{background:var(--bg);color:var(--ink);font:400 1.05rem/1.7 var(--sans);overflow-x:hidden}
body.locked{overflow:hidden;height:100vh}
h1,h2,h3{font-family:var(--serif);font-weight:400;line-height:.98;letter-spacing:-.01em}
section{padding:clamp(4rem,12vw,8rem) 1.5rem;max-width:880px;margin:auto;position:relative}
h2{font-size:clamp(2.3rem,8vw,4.4rem);margin-bottom:1.5rem}
p{max-width:52ch;color:var(--mute)}a{color:inherit}
:focus-visible{outline:2px solid var(--clay);outline-offset:3px}
.btn{font:500 1rem var(--sans);background:var(--on-mocha);color:var(--mocha);border:0;border-radius:99px;padding:.85rem 1.6rem;cursor:pointer;text-decoration:none;display:inline-block}
.btn.alt{background:transparent;color:var(--ink);border:1px solid var(--ink)}
.btn.solid{background:var(--mocha);color:var(--on-mocha);border:1px solid var(--line)}
#cover{position:fixed;inset:0;z-index:50;background:var(--mocha);color:var(--on-mocha);display:flex;flex-direction:column;justify-content:space-between;
 padding:calc(2rem + env(safe-area-inset-top,0px)) 1.5rem calc(2rem + env(safe-area-inset-bottom,0px));overflow:hidden}
#cover.open{pointer-events:none}
#cover .small{font-size:.9rem;opacity:.85;max-width:30ch}
#cover h1{font-size:calc(var(--hs,1)*clamp(4.2rem,24vw,12rem));line-height:.84;margin:auto 0;overflow-wrap:anywhere}
#cover h1 i{display:block;font-size:.34em;font-style:italic;margin:.2em 0;color:var(--clay)}
#cover.has-photo{background:#15110f}#cover.has-photo h1,#cover.has-photo .small{color:#fff;text-shadow:0 2px 28px rgba(0,0,0,.55)}
.vellum{background:var(--glass);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid var(--line);padding:1.2rem 1.4rem;
 display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;color:var(--on-mocha)}
.vellum span{font-size:.9rem;opacity:.8}.vellum strong{display:block;font:400 1.5rem/1.15 var(--serif)}
#hero{max-width:none;min-height:100vh;position:relative;overflow:hidden;padding:clamp(5.5rem,12vh,8rem) clamp(1.5rem,6vw,5rem) clamp(4rem,9vh,6rem)}
#hero p{color:inherit;opacity:.82}
#hero .hero-copy>p:first-child{font:500 .76rem/1 var(--sans);letter-spacing:.26em;text-transform:uppercase;color:var(--clay);opacity:1;margin-bottom:1.6rem}
#hero h2{font-size:calc(var(--hs,1)*clamp(3rem,9vw,6.6rem));margin:0 0 1.2rem;max-width:10ch;overflow-wrap:anywhere}
.arch,.person-photo,.card{position:relative;overflow:hidden;background:var(--fig);aspect-ratio:3/4}
.arch::after,.person-photo::after{content:"Your photo here";position:absolute;inset:auto 0 1rem;text-align:center;font-size:.8rem;color:#fff;opacity:.7}
.person-photo{width:100%}.person-photo::before{content:"";position:absolute;inset:9px;border:1px solid rgba(255,255,255,.4);border-radius:inherit;pointer-events:none}
.card{width:100%;display:flex;align-items:flex-end;justify-content:center;background:var(--g)}.card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.count{display:flex;gap:clamp(1rem,5vw,3rem);margin-top:2rem;flex-wrap:wrap}
.count div{font:400 clamp(2.4rem,10vw,4.6rem)/1 var(--serif)}.count small{display:block;font:400 .82rem var(--sans);color:var(--mute);margin-top:.4rem}
.rows{border-top:1px solid var(--line);margin-top:2rem}
.row{display:grid;grid-template-columns:7rem 1fr;gap:1rem;padding:1.2rem 0;border-bottom:1px solid var(--line)}
.row b{font:400 1.45rem var(--serif);color:var(--clay)}.row span{color:var(--ink)}.row small{display:block;color:var(--mute)}
.couple{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.78fr);gap:clamp(1.6rem,5vw,3.5rem);align-items:center}
.couple.flip{grid-template-columns:minmax(0,.78fr) minmax(0,1fr)}
.couple .who h2{font-size:calc(var(--hs,1)*clamp(2.6rem,8vw,5rem));margin:.5rem 0 1rem}.couple .who p{margin-bottom:1.3rem}
.kick{display:inline-block;font:500 .72rem/1 var(--sans);letter-spacing:.26em;text-transform:uppercase;color:var(--clay)}
.kin{display:block;border-top:1px solid var(--line);padding-top:.9rem;font:500 .74rem/1.6 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
#intro .intro-head{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;padding-bottom:.9rem}
#intro .intro-head em{font:italic 400 1.1rem/1 var(--serif);color:var(--clay)}
#intro .intro-body{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:clamp(1.5rem,5vw,4rem);align-items:start}
#intro h2{font-size:calc(var(--hs,1)*clamp(2.2rem,6vw,4rem));margin:0;max-width:13ch}
#intro .intro-side p{margin-bottom:1.4rem}
#intro .intro-date{display:block;font:500 .8rem/1.5 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--ink);opacity:.75}
#gallery,#album{max-width:none;padding-inline:0}
#gallery h2,#album h2{padding-inline:1.5rem;max-width:880px;margin-inline:auto}
.track{display:flex;gap:1.1rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:1rem 1.5rem 2rem;scrollbar-width:none}.track::-webkit-scrollbar{display:none}
.slide{flex:0 0 min(72vw,320px);scroll-snap-align:center}
.st{padding:1.1rem .3rem 0}.st h3{font:400 1.6rem/1.1 var(--serif);margin-bottom:.5rem}.st p{font-size:.96rem;line-height:1.6}
.dots{display:flex;justify-content:center;gap:.5rem}.dots i{width:7px;height:7px;border-radius:50%;background:var(--line);transition:.3s}
.dots i.on{background:var(--clay);width:22px;border-radius:9px}
.reel{margin-top:2rem}
.filmstrip{display:flex;gap:1.1rem;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:1.5rem;padding:.6rem 1.5rem 1rem;scrollbar-width:none;scroll-behavior:smooth}.filmstrip::-webkit-scrollbar{display:none}
.frame{position:relative;flex:0 0 clamp(180px,44vw,260px);aspect-ratio:4/5;scroll-snap-align:start;cursor:pointer;background:var(--g);overflow:hidden}
.frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.fn{position:absolute;left:.55rem;bottom:.55rem;z-index:2;padding:.28rem .45rem;background:rgba(0,0,0,.55);color:#fff;font:500 .66rem/1 var(--sans);letter-spacing:.16em}
.lb{position:fixed;inset:0;z-index:70;background:rgba(10,8,8,.94)}.lb:not([hidden]){display:flex;align-items:center;justify-content:center}
.big{height:min(80vh,140vw);max-width:92vw;border-radius:10px;overflow:hidden;background:var(--g)}.big img{width:100%;height:100%;object-fit:cover;display:block}
#lx{position:absolute;top:calc(1rem + env(safe-area-inset-top,0px));right:1rem;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.4);background:transparent;color:#fff;font-size:1.5rem;cursor:pointer;padding:0}
.vid{aspect-ratio:16/9;overflow:hidden;background:var(--fig);display:grid;place-items:center;color:#fff}.vid video{width:100%;height:100%;object-fit:cover;background:#000}
.vid .pl{display:flex;flex-direction:column;align-items:center;gap:.8rem;font-size:.9rem;opacity:.9}
.vid .pl::before{content:"▶";display:grid;place-items:center;width:64px;height:64px;border-radius:50%;border:1px solid currentColor;font-size:1.1rem;padding-left:4px}
#closing{text-align:center}#closing p{margin:1.5rem auto 2rem}
.rs{display:flex;gap:.8rem;flex-wrap:wrap;justify-content:center}
.pax{margin:1.4rem auto 0;display:flex;flex-direction:column;gap:.9rem;align-items:center}.pax[hidden]{display:none}
.pax div{display:flex;gap:1rem;align-items:center}.pax div button{width:42px;height:42px;border-radius:50%;border:1px solid var(--ink);background:transparent;color:var(--ink);font-size:1.3rem;cursor:pointer}
.pax b{font:400 2.2rem var(--serif);min-width:2ch;text-align:center}
.wq{margin:0 0 1.8rem;padding-left:1.1rem;border-left:2px solid var(--clay)}.wq p{font:italic 400 1.25rem/1.4 var(--serif);color:var(--ink)}
.wq cite{display:block;margin-top:.4rem;font-style:normal;font-size:.9rem;color:var(--mute)}
.acct{display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;padding:1.2rem 0;border-bottom:1px solid var(--line)}
.acct b{display:block;font:400 1.45rem var(--serif);color:var(--clay)}.acct .no{display:block;font:500 1.25rem var(--sans);letter-spacing:.05em;color:var(--ink)}.acct span{color:var(--mute);font-size:.92rem}
#giftlist{border-top:1px solid var(--line);margin-top:1.8rem}
footer{text-align:center;padding:2rem;color:var(--mute);font-size:.85rem}
#music{position:fixed;right:1rem;bottom:calc(1rem + env(safe-area-inset-bottom,0px));z-index:40;width:48px;height:48px;border-radius:50%;border:1px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer;display:grid;place-items:center}
#music svg{width:20px;height:20px;fill:currentColor}#music.on svg{animation:spin 6s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
#lang{position:fixed;top:calc(1rem + env(safe-area-inset-top,0px));right:1rem;z-index:60;border:0;border-radius:99px;padding:.45rem .9rem;font:500 .85rem var(--sans);background:var(--on-mocha);color:var(--mocha);cursor:pointer}
.rv{opacity:0;transform:translateY(14px);transition:opacity .9s,transform .9s}.rv.in{opacity:1;transform:none}
@media(max-width:760px){.couple,.couple.flip{grid-template-columns:1fr}.couple .who{order:2}.couple .person-photo{order:1;max-width:min(72vw,300px);margin-inline:auto}
 #intro .intro-body{grid-template-columns:1fr}.row{grid-template-columns:5.5rem 1fr}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.rv{opacity:1;transform:none}html{scroll-behavior:auto}}
`;

const HALVES = (dir) => `#cover{background:transparent;text-align:center;align-items:center;transition:opacity .01s 1.45s,visibility 0s 1.5s}
#cover::before,#cover::after{content:"";position:absolute;z-index:-1;background:var(--mocha);transition:transform 1.3s cubic-bezier(.7,0,.2,1)}
${dir === 'x' ? '#cover::before,#cover::after{top:0;bottom:0;width:50.5%}#cover::before{left:0}#cover::after{right:0}#cover.open::before{transform:translateX(-100%)}#cover.open::after{transform:translateX(100%)}'
    : '#cover::before,#cover::after{left:0;right:0;height:50.5%}#cover::before{top:0}#cover::after{bottom:0}#cover.open::before{transform:translateY(-100%)}#cover.open::after{transform:translateY(100%)}'}
#cover.open{opacity:0;visibility:hidden}#cover>*{transition:opacity .5s}#cover.open>*{opacity:0}
#cover.has-photo::before,#cover.has-photo::after{background:transparent}`;

const COVER = [
 // 0 slide-up, left aligned, hairline rules
 `#cover{transition:transform 1.3s cubic-bezier(.7,0,.2,1)}#cover.open{transform:translateY(-101%)}
 #cover::before,#cover::after{content:"";position:absolute;left:0;right:0;height:1px;background:var(--line);pointer-events:none}#cover::before{top:calc(1rem + env(safe-area-inset-top,0px))}#cover::after{bottom:calc(1rem + env(safe-area-inset-bottom,0px))}
 #cover .small{letter-spacing:.4em;text-transform:uppercase;font-size:.8rem}`,
 // 1 iris close, centred inside a ring
 `#cover{text-align:center;align-items:center;clip-path:circle(150% at 50% 78%);transition:clip-path 1.5s cubic-bezier(.7,0,.2,1)}#cover.open{clip-path:circle(0 at 50% 78%)}
 #cover::before{content:"";position:absolute;left:50%;top:46%;width:min(88vw,540px);aspect-ratio:1;border:1px solid currentColor;border-radius:50%;opacity:.28;transform:translate(-50%,-50%);pointer-events:none}`,
 // 2 curtain: two halves part sideways
 HALVES('x') + `#cover h1{font-style:italic}`,
 // 3 dissolve + scale, glow
 `#cover{text-align:center;align-items:center;background:radial-gradient(ellipse at 50% 38%,var(--clay-a),transparent 62%),var(--mocha);transition:opacity 1.2s,transform 1.6s,visibility 0s 1.3s}
 #cover.open{opacity:0;transform:scale(1.12);visibility:hidden}`,
 // 4 wipe left, right-aligned, accent edge
 `#cover{text-align:right;align-items:flex-end;border-right:8px solid var(--clay);transition:transform 1.2s cubic-bezier(.76,0,.24,1)}#cover.open{transform:translateX(-101%)}
 #cover .small{letter-spacing:.3em;text-transform:uppercase;font-size:.8rem}#cover .vellum{align-self:stretch}`,
 // 5 letterbox: bars part vertically, wide-set title
 HALVES('y') + `#cover h1{letter-spacing:.08em;font-size:calc(var(--hs,1)*clamp(3rem,17vw,9rem))}#cover h1 i{letter-spacing:0}`,
 // 6 blur bloom
 `#cover{text-align:center;align-items:center;justify-content:flex-start;gap:2.5rem;transition:opacity 1.3s,filter 1.3s,visibility 0s 1.3s}
 #cover h1{margin:auto 0}#cover.open{opacity:0;filter:blur(26px);visibility:hidden}#cover.open h1{letter-spacing:.18em;transition:letter-spacing 1.3s}#cover .vellum{align-self:stretch}`,
];

const HERO = [
 // 0 split, portrait right
 `#hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);align-items:center;gap:clamp(2rem,6vw,5rem);background:var(--mocha);color:var(--on-mocha)}
 #hero .arch{justify-self:end;width:min(100%,420px)}
 @media(max-width:760px){#hero{grid-template-columns:1fr}#hero .arch{order:-1;justify-self:start;width:min(56vw,240px)}}`,
 // 1 centred column, portrait on top
 `#hero{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:2rem;background:var(--bg);color:var(--ink)}
 #hero .arch{order:-1;width:min(60vw,280px)}#hero h2{max-width:12ch;margin-inline:auto}#hero p{margin-inline:auto}`,
 // 2 full-bleed portrait behind giant type
 `#hero{display:flex;flex-direction:column;justify-content:flex-end;background:var(--mocha);color:var(--on-mocha)}
 #hero .arch{position:absolute;inset:6% 8% 30% 8%;aspect-ratio:auto;opacity:.9}#hero .hero-copy{position:relative;z-index:2}
 #hero h2{font-size:calc(var(--hs,1)*clamp(3.6rem,17vw,10rem));max-width:7ch;line-height:.88;text-shadow:0 2px 30px rgba(0,0,0,.35)}`,
 // 3 reversed split, portrait left on tinted ground
 `#hero{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);align-items:center;gap:clamp(2rem,6vw,5rem);background:var(--bg2);color:var(--ink)}
 #hero .arch{justify-self:start;width:min(100%,380px)}#hero h2{font-style:italic}
 @media(max-width:760px){#hero{grid-template-columns:1fr}#hero .arch{width:min(64vw,270px)}}`,
 // 4 diagonal bleed
 `#hero{display:grid;align-items:center;background:var(--bg);color:var(--ink)}
 #hero .arch{position:absolute;right:0;top:0;bottom:0;width:52%;aspect-ratio:auto;border-radius:0!important;border:0!important;transform:none!important;box-shadow:none!important;clip-path:polygon(26% 0,100% 0,100% 100%,0 100%)!important}
 #hero .hero-copy{position:relative;z-index:2;max-width:min(100%,24rem)}
 @media(max-width:760px){#hero .arch{position:relative;width:calc(100% + 3rem);margin:0 -1.5rem;height:44vh;clip-path:polygon(0 0,100% 0,100% 84%,0 100%)!important}#hero{align-content:start;gap:2rem;padding-top:0}#hero .hero-copy{max-width:none}}`,
 // 5 bottom-aligned copy, small offset portrait
 `#hero{display:flex;flex-direction:column;justify-content:flex-end;background:var(--mocha);color:var(--on-mocha)}
 #hero .arch{position:absolute;top:calc(4.5rem + env(safe-area-inset-top,0px));right:clamp(1.5rem,6vw,5rem);width:min(42vw,210px)}
 #hero .hero-copy{border-top:1px solid currentColor;padding-top:1.6rem;max-width:42rem}#hero h2{font-size:calc(var(--hs,1)*clamp(3.2rem,13vw,8rem));max-width:9ch}`,
 // 6 text first, wide landscape below
 `#hero{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.4rem;background:var(--bg);color:var(--ink)}
 #hero .hero-copy,#hero .arch{width:min(100%,880px)}#hero .arch{aspect-ratio:16/9}#hero h2{max-width:14ch}`,
];

const FRAME = [
 // 0 arch
 `.arch,.person-photo,.card{border-radius:999px 999px 8px 8px}.frame{border-radius:999px 999px 6px 6px}`,
 // 1 oval / circle
 `.arch,.person-photo,.card{border-radius:50%}.frame{border-radius:50%;aspect-ratio:1}.person-photo{aspect-ratio:4/5}.fn{left:50%;transform:translateX(-50%);bottom:12%}`,
 // 2 hard square + offset block shadow
 `.arch,.person-photo,.card{border-radius:0;box-shadow:10px 10px 0 var(--clay)}.frame{border-radius:0;box-shadow:6px 6px 0 var(--clay);margin-bottom:6px}.person-photo::before{display:none}.track{padding-right:2rem}`,
 // 3 polaroid
 `.arch,.person-photo,.card{border-radius:2px;border:10px solid #fff;border-bottom-width:46px;transform:rotate(-2deg);box-shadow:0 16px 30px -16px rgba(0,0,0,.5)}
 .person-photo::before{display:none}.slide:nth-child(even) .card,#woman .person-photo{transform:rotate(2deg)}
 .frame{border-radius:2px;border:6px solid #fff;border-bottom-width:26px;transform:rotate(1.4deg);box-shadow:0 10px 20px -12px rgba(0,0,0,.5)}.frame:nth-child(even){transform:rotate(-1.6deg)}.fn{bottom:-22px;left:0;right:0;background:none;color:#555;text-align:center}`,
 // 4 slanted parallelogram
 `.arch,.person-photo,.card{clip-path:polygon(14% 0,100% 0,86% 100%,0 100%)}.frame{clip-path:polygon(10% 0,100% 0,90% 100%,0 100%)}.person-photo::before{display:none}.arch::after,.person-photo::after{inset:auto 0 12%}`,
 // 5 organic blob
 `.arch,.person-photo,.card{border-radius:62% 38% 54% 46%/46% 56% 44% 54%}.frame{border-radius:42% 58% 55% 45%/50% 42% 58% 50%}.person-photo::before{border-radius:inherit}`,
 // 6 chamfered (deco)
 `.arch,.person-photo,.card{clip-path:polygon(14% 0,86% 0,100% 12%,100% 88%,86% 100%,14% 100%,0 88%,0 12%)}.frame{clip-path:polygon(12% 0,88% 0,100% 10%,100% 90%,88% 100%,12% 100%,0 90%,0 10%)}.person-photo::before{display:none}`,
];

const BAND = `box-shadow:0 0 0 100vmax var(--bg2);clip-path:inset(0 -100vmax);background:var(--bg2)`;
const RHYTHM = [
 // 0 hairline paper
 `section+section{border-top:1px solid var(--line)}h2{font-weight:300}.slide:nth-child(even){margin-top:2.4rem}#gallery,#album{border-top:1px solid var(--line)}
 .frame{box-shadow:0 0 0 1px var(--line)}`,
 // 1 full-bleed colour bands
 `section:nth-of-type(even){${BAND}}#woman,#closing{background:var(--mocha);color:var(--on-mocha);box-shadow:0 0 0 100vmax var(--mocha);clip-path:inset(0 -100vmax)}
 #woman p,#closing p,#woman .kin{color:inherit;opacity:.82}#woman .btn.alt,#closing .btn.alt{color:var(--on-mocha);border-color:var(--on-mocha)}#closing .btn.solid{background:var(--on-mocha);color:var(--mocha)}
 #closing .pax div button{color:var(--on-mocha);border-color:var(--on-mocha)}h2{font-weight:600;letter-spacing:-.03em}
 .reel{background:var(--mocha);padding:1.6rem 0;margin-top:2rem}`,
 // 2 hard-edged overlapping cards
 `body{background:var(--bg2)}section:not(#hero){width:min(92vw,860px);margin:2.2rem auto 0;background:var(--bg);border:2px solid var(--ink);box-shadow:8px 8px 0 var(--clay);padding-inline:clamp(1.4rem,5vw,3rem)}
 #gallery,#album{max-width:860px;padding-inline:0}#gallery h2,#album h2{padding-inline:clamp(1.4rem,5vw,3rem)}
 #intro{margin-top:-3.2rem;z-index:2}section:nth-of-type(odd):not(#hero){left:-1.2vw}section:nth-of-type(even){left:1.2vw}footer{padding-top:3rem}`,
 // 3 newspaper columns
 `section:not(#hero){border-top:4px double var(--ink);max-width:960px}h2{font-size:clamp(2rem,6vw,3.4rem);border-bottom:1px solid var(--ink);padding-bottom:.5rem}
 #gallery,#album{max-width:none}#gallery h2,#album h2{max-width:960px}
 #intro .intro-side p,#gift>p,#closing>p{columns:2 13rem;column-gap:2rem;max-width:none}#intro .intro-side p::first-letter{float:left;font:700 3.6em/.8 var(--serif);padding:.06em .1em 0 0;color:var(--clay)}
 .reel .filmstrip{display:grid;grid-auto-flow:column;grid-template-rows:repeat(2,auto);grid-auto-columns:clamp(150px,36vw,210px)}.reel .frame{flex:none}`,
 // 4 vertical timeline
 `section:not(#hero){max-width:760px;margin-left:max(1.2rem,calc(50% - 380px));padding-left:clamp(2.6rem,9vw,4.4rem);border-left:2px solid var(--line)}
 section:not(#hero)::before{content:"";position:absolute;left:-8px;top:clamp(4.6rem,12vw,8.4rem);width:14px;height:14px;border-radius:50%;background:var(--clay);border:3px solid var(--bg);z-index:1}
 #gallery,#album{padding-inline:clamp(2.6rem,9vw,4.4rem) 0}#gallery h2,#album h2{padding-inline:0;margin-inline:0}.track,.filmstrip{padding-left:0}
 .slide:nth-child(even){margin-top:2rem}`,
 // 5 centred, ornament dividers
 `section{text-align:center}p,.couple .who p{margin-inline:auto}.count{justify-content:center}.row{grid-template-columns:1fr;gap:.2rem}.acct{justify-content:center;text-align:center}
 .couple .who{text-align:center}.kin{border:0;padding-top:0}.wq{border:0;padding:0}#intro .intro-head{justify-content:center}#intro h2{margin-inline:auto}
 section:not(#hero)+section::before{content:"${'${ORN}'}";position:absolute;top:0;left:0;right:0;transform:translateY(-55%);text-align:center;color:var(--clay);font-size:1.1rem;letter-spacing:1em;padding-left:1em}
 #gallery h2,#album h2{text-align:center}`,
 // 6 double inset frames on a tinted page
 `body{background:var(--bg2)}section:not(#hero){width:min(94vw,880px);margin:1.1rem auto;background:var(--bg);box-shadow:inset 0 0 0 7px var(--bg),inset 0 0 0 8px var(--ink);padding-inline:clamp(1.8rem,6vw,3.4rem)}
 #gallery,#album{max-width:880px;padding-inline:0}#gallery h2,#album h2{padding-inline:clamp(1.8rem,6vw,3.4rem)}
 .reel{background:var(--mocha);padding:1.4rem 0;margin-top:2rem}.frame{box-shadow:0 0 0 1px rgba(255,255,255,.3)}`,
];

// ---------- designs: [num, name, serif, serifFamilyParam, sans, sansFamilyParam, palette, ornament, headline scale, pin?] ----------
// palette = bg, bg2, ink, mute, deep (cover/hero ground), on-deep, accent
const D = [
 ['02', 'vellum-linen', 'Cormorant Garamond', 'Cormorant+Garamond', 'Jost', 'Jost', ['#f6f1e7', '#ebe3d3', '#2e2a22', '#7b7261', '#3a3427', '#f6f1e7', '#8c7a4f'], '❦', 1],
 ['03', 'garden-illustrated', 'Young Serif', 'Young+Serif', 'Nunito Sans', 'Nunito+Sans', ['#f2f6ec', '#e1ecd6', '#243322', '#5f7560', '#2f4a33', '#f2f6ec', '#c9506c'], '✿', 1],
 ['04', 'quiet-luxe', 'Bodoni Moda', 'Bodoni+Moda', 'Hanken Grotesk', 'Hanken+Grotesk', ['#f4f2ee', '#e8e4dd', '#1f1d1a', '#75706a', '#2b2926', '#f4f2ee', '#a98b55'], '◆', 1],
 ['05', 'minimal-mono', 'Syne', 'Syne', 'DM Sans', 'DM+Sans', ['#ffffff', '#f1f1f1', '#111111', '#6a6a6a', '#111111', '#ffffff', '#767676'], '—', .78, [3, 6]],
 ['06', 'midnight-celestial', 'Cinzel', 'Cinzel', 'Outfit', 'Outfit', ['#0d1226', '#151c3a', '#eef0ff', '#9aa3cf', '#070a18', '#eef0ff', '#c9b6ff'], '✦', .8, [1, 1]],
 ['07', 'terracotta-boho', 'DM Serif Display', 'DM+Serif+Display', 'Karla', 'Karla', ['#f6e9dc', '#ecd3bc', '#3b2218', '#80604e', '#a94d2b', '#fbefe3', '#d79a3f'], '☼', 1],
 ['08', 'blush-romantic', 'Playfair Display', 'Playfair+Display', 'Mulish', 'Mulish', ['#fdf1f1', '#f8dede', '#4a2630', '#8c626b', '#8f3b52', '#fff3f3', '#d9798f'], '♡', 1],
 ['09', 'emerald-deco', 'Marcellus', 'Marcellus', 'Figtree', 'Figtree', ['#f3efe3', '#e4ddc8', '#0f2a22', '#5a6d63', '#0b3b2e', '#f3efe3', '#b8902f'], '◇', .9],
 ['10', 'batik-nusantara', 'Spectral', 'Spectral', 'Work Sans', 'Work+Sans', ['#f3e7d0', '#e6d3ad', '#2b1b10', '#745e40', '#3b2414', '#f3e7d0', '#b0701b'], '❖', 1, [4, 3]],
 ['11', 'crimson-opulent', 'Yeseva One', 'Yeseva+One', 'Public Sans', 'Public+Sans', ['#fbf3ef', '#f1dfd8', '#2a0d12', '#7f545a', '#6a0f24', '#fbeee8', '#c9893f'], '✧', .95],
 ['12', 'snow-monochrome', 'Libre Caslon Text', 'Libre+Caslon+Text', 'Inter', 'Inter', ['#f7f8fa', '#e9ecf0', '#1a1d22', '#656b75', '#20242b', '#f7f8fa', '#6f7f99'], '·', .9],
 ['13', 'ocean-breeze', 'Prata', 'Prata', 'Manrope', 'Manrope', ['#eef7f8', '#d7ecef', '#0c2b33', '#4f7a85', '#0f4c5c', '#eef7f8', '#e0764a'], '≈', .9],
 ['14', 'amber-heritage', 'EB Garamond', 'EB+Garamond', 'Sora', 'Sora', ['#fbf1dc', '#f2e0b8', '#33200a', '#7d6336', '#5a3510', '#fbf1dc', '#c47a12'], '❧', 1],
 ['15', 'forest-mist', 'Newsreader', 'Newsreader', 'Figtree', 'Figtree', ['#eef1ec', '#dde4da', '#1b2a22', '#566a5d', '#22382c', '#eef1ec', '#7f9f7b'], '❦', 1],
 ['16', 'rose-linen', 'Bellefair', 'Bellefair', 'Karla', 'Karla', ['#f8efe9', '#efddd2', '#3a2523', '#85645f', '#9a5c5b', '#fff6f1', '#bf8278'], '❀', 1],
 ['17', 'navy-gold', 'Gilda Display', 'Gilda+Display', 'Jost', 'Jost', ['#f5f2ea', '#e7e2d3', '#0e1b33', '#566178', '#0e1f3f', '#f5f2ea', '#b8923a'], '◆', 1],
 ['18', 'palm-breeze', 'Bricolage Grotesque', 'Bricolage+Grotesque', 'Figtree', 'Figtree', ['#f1f6e9', '#dfeccd', '#17321e', '#55724f', '#1f5a34', '#f1f6e9', '#e8941a'], '✺', .8],
 ['19', 'charcoal-ink', 'Italiana', 'Italiana', 'Inter', 'Inter', ['#16171a', '#202226', '#ecebe6', '#9a9a95', '#0b0b0d', '#ecebe6', '#e8d9a8'], '◦', 1, [5, 5]],
 ['20', 'coral-modern', 'Sora', 'Sora', 'Manrope', 'Manrope', ['#fff6f2', '#ffe3d9', '#2a1a1a', '#85655e', '#e5503c', '#fff6f2', '#1e3a5f'], '●', .72],
 ['21', 'indigo-silk', 'Tenor Sans', 'Tenor+Sans', 'Nunito Sans', 'Nunito+Sans', ['#f1f0f8', '#dfdcf0', '#1d1a3d', '#66638f', '#2b2a6b', '#f1f0f8', '#a283cf'], '❋', .95],
 ['22', 'moss-rust', 'Alegreya', 'Alegreya', 'Alegreya Sans', 'Alegreya+Sans', ['#efeee2', '#dedcc6', '#26291a', '#686b4f', '#4a5230', '#efeee2', '#b0501f'], '❧', 1],
 ['23', 'apricot-soft', 'Libre Baskerville', 'Libre+Baskerville', 'Nunito', 'Nunito', ['#fff4e8', '#ffe3c8', '#4a2f1c', '#946c4d', '#d9803a', '#fff9f1', '#a8481a'], '✿', .88],
 ['24', 'slate-periwinkle', 'Instrument Serif', 'Instrument+Serif', 'IBM Plex Sans', 'IBM+Plex+Sans', ['#eef0f6', '#dde2ef', '#1f2740', '#606a8c', '#3b4a78', '#eef0f6', '#7889da'], '◈', 1.05],
 ['26', 'bubbling-green', 'Unbounded', 'Unbounded', 'DM Sans', 'DM+Sans', ['#f0fbe9', '#d9f3c8', '#10301a', '#4a7550', '#0f7a3a', '#f0fbe9', '#e0457e'], '○', .62],
 ['27', 'lilac-romantic', 'Gloock', 'Gloock', 'Mulish', 'Mulish', ['#f7f1fb', '#ebdff5', '#33224a', '#7d6a98', '#6a4a96', '#f7f1fb', '#d9709f'], '✾', 1],
 ['30', 'vintage-coral', 'Abril Fatface', 'Abril+Fatface', 'Lora', 'Lora', ['#f7ece1', '#efd7c3', '#3d2418', '#8c6a55', '#cf5f46', '#fff3ea', '#2b6a6e'], '❁', .85],
];

// ---------- assign (cover, hero) pairs: pins first, then balanced greedy ----------
const used = new Set(['0,0']), pair = {};
D.forEach(d => { if (d[9]) { pair[d[0]] = d[9]; used.add(d[9].join()); } });
const hc = Array(7).fill(0), cc = Array(7).fill(0);
D.forEach(d => { if (pair[d[0]]) { cc[pair[d[0]][0]]++; hc[pair[d[0]][1]]++; } });
D.forEach(d => {
  if (pair[d[0]]) return;
  let best = null, bs = 1e9;
  for (let a = 0; a < 7; a++) for (let b = 0; b < 7; b++) { if (used.has(a + ',' + b)) continue; const s = cc[a] * 10 + hc[b] * 10 + ((a * 3 + b * 5 + +d[0]) % 7); if (s < bs) { bs = s; best = [a, b]; } }
  pair[d[0]] = best; used.add(best.join()); cc[best[0]]++; hc[best[1]]++;
});

const words = [[0, 0, 0, 0]]; // design 01
D.forEach(d => { const [a, b] = pair[d[0]]; words.push([a, b, (a + b) % 7, (a + 2 * b) % 7]); });
for (let i = 0; i < words.length; i++) for (let j = i + 1; j < words.length; j++) {
  const same = words[i].filter((x, k) => x === words[j][k]).length;
  if (same > 1) throw new Error('uniqueness violated: ' + words[i] + ' vs ' + words[j]);
}

// ---------- build ----------
const out = [];
D.forEach(d => {
  const [num, name, serif, serifQ, sans, sansQ, P, orn, hs] = d;
  const [a, b] = pair[num], f = (a + b) % 7, r = (a + 2 * b) % 7;
  const [bg, bg2, ink, mute, deep, on, acc] = P;
  const vars = `:root{--bg:${bg};--bg2:${bg2};--ink:${ink};--mute:${mute};--mocha:${deep};--on-mocha:${on};--clay:${acc};--clay-a:${rgba(acc, .3)};
 --line:${rgba(ink, .2)};--glass:${rgba(deep, .55)};--fig:linear-gradient(160deg,${acc},${mix(acc, deep, .6)});--hs:${hs};
 --serif:'${serif}',Georgia,'Times New Roman',serif;--sans:'${sans}',system-ui,-apple-system,'Segoe UI',sans-serif;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}`;
  // palette-matched gradients for CFG.album / CFG.photos (14 slots), everything else in the JS stays verbatim
  const ladder = [acc, deep, mix(acc, deep, .5), mix(acc, bg2, .45), mix(deep, bg2, .4), mix(ink, acc, .5), mix(acc, deep, .25)];
  let gi = 0;
  const js = jsRaw.replace(/linear-gradient\(160deg,#[0-9a-f]{6},#[0-9a-f]{6}\)/gi, () => { const k = gi++; return `linear-gradient(160deg,${ladder[k % 7]},${ladder[(k + 3) % 7]})`; });
  if (gi !== 14) throw new Error('expected 14 gradients, got ' + gi);
  const css = vars + BASE + COVER[a] + HERO[b] + FRAME[f] + RHYTHM[r].replace('${ORN}', orn);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Amara &amp; Dewa — Wedding Invitation</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${serifQ}&family=${sansQ}:wght@400;500&display=swap">
<style>
/* ${num} ${name} — cover:${a} hero:${b} frame:${f} rhythm:${r} (see tools/build-designs.cjs) */
${css}
</style>
</head>
${body}<script>${js}</script>
</body>
</html>
`;
  const file = `${num}-${name}.html`;
  fs.writeFileSync(path.join(root, 'designs', file), html);
  out.push([num, name, a, b, f, r]);
});

// design 01: untouched look, but apply the lightbox [hidden] fix noted in REDESIGN_README
const p01 = path.join(root, 'designs/01-editorial-mocha.html');
let h01 = fs.readFileSync(p01, 'utf8');
h01 = h01.replace('.lb{position:fixed;inset:0;z-index:70;background:rgba(10,6,5,.94);display:grid;place-items:center}\n.lb[hidden]{display:none}',
  '.lb{position:fixed;inset:0;z-index:70;background:rgba(10,6,5,.94)}\n.lb:not([hidden]){display:grid;place-items:center}');
fs.writeFileSync(p01, h01);

const N = ['slide-up', 'iris', 'curtain', 'dissolve', 'wipe-left', 'letterbox', 'bloom'], H = ['split-right', 'centred', 'full-bleed', 'split-left', 'diagonal', 'bottom-copy', 'landscape'], F = ['arch', 'oval', 'hard-square', 'polaroid', 'slanted', 'blob', 'chamfer'], R = ['hairline', 'colour-bands', 'cards', 'newspaper', 'timeline', 'ornament', 'inset-frame'];
console.log('NN name'.padEnd(26) + 'cover'.padEnd(11) + 'hero'.padEnd(13) + 'frame'.padEnd(13) + 'rhythm');
console.log('01 editorial-mocha'.padEnd(26) + 'slide-up'.padEnd(11) + 'split-right'.padEnd(13) + 'arch'.padEnd(13) + 'hairline (original)');
out.forEach(o => console.log((o[0] + ' ' + o[1]).padEnd(26) + N[o[2]].padEnd(11) + H[o[3]].padEnd(13) + F[o[4]].padEnd(13) + R[o[5]]));
console.log('OK: every pair differs in >=3 of 4 dimensions');
