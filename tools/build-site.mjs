// FM-1 Radio : construit le site publié dans dist/, à partir de app/index.html et app/i18n.js. Aucune dépendance.
//   node tools/build-site.mjs              (adresse du site : site.config.json, ou la variable SITE_URL)
// Pour chaque langue : la radio avec tous ses textes déjà dans le HTML, le contenu SEO, la page guide ;
// puis sitemap, robots, manifest, en-têtes (_headers, lu par Cloudflare Pages et Netlify), 404.
// Les fichiers dist/ ne se modifient jamais à la main : on change app/ ou site/, puis on relance.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...a) => path.join(ROOT, ...a);
const OUT = P("dist");
const cfg = JSON.parse(fs.readFileSync(P("site.config.json"), "utf8"));
const SITE = (process.env.SITE_URL || cfg.url).replace(/\/$/, "");
/* le compteur des FM-1 à l'antenne : adresse de l'API (même origine par défaut), false pour le couper */
const LIVE_URL = cfg.live === false ? "" : (cfg.live || "/api/live");
if (/example|CHANGEME/i.test(SITE)) console.warn(`! adresse du site provisoire (${SITE}) : à régler dans site.config.json avant la mise en ligne`);

/* ------------------------------------------------------------------ sources */
const tpl = fs.readFileSync(P("app/index.html"), "utf8");
const i18nSrc = fs.readFileSync(P("app/i18n.js"), "utf8");
const genSrc = fs.readFileSync(P("app/gen/jiant-gen.mjs"));
const ctx = vm.createContext({});
vm.runInContext(i18nSrc + "\n;globalThis.__ = { I18N, FAMILIES, UI, LINKS };", ctx);
const { I18N, FAMILIES, UI, LINKS } = ctx.__;
const LANGS = [...UI.LANGS];

const hash = buf => crypto.createHash("sha256").update(buf).digest("hex").slice(0, 10);
const sha = s => "'sha256-" + crypto.createHash("sha256").update(s, "utf8").digest("base64") + "'";
const esc = UI.esc;
const attr = s => esc(s).replace(/'/g, "&#39;");

try { fs.rmSync(OUT, { recursive: true, force: true }); }
catch (e) { console.warn(`! dist/ n'a pas pu être vidé (${e.code}) : les fichiers sont réécrits par-dessus, d'anciens fichiers hachés peuvent rester`); }
const write = (rel, data) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };
const copyDir = (from, to) => { if (!fs.existsSync(from)) return; for (const e of fs.readdirSync(from, { withFileTypes: true })) {
  if (e.isDirectory()) copyDir(path.join(from, e.name), path.join(to, e.name)); else write(path.join(to, e.name), fs.readFileSync(path.join(from, e.name))); } };

/* ------------------------------------------------------------------ fichiers statiques, noms hachés pour le cache */
const genURL = `/gen/jiant-gen.${hash(genSrc)}.mjs`; write(genURL, genSrc);
const i18nURL = `/assets/i18n.${hash(i18nSrc)}.js`; write(i18nURL, i18nSrc);
copyDir(P("site/assets"), "assets");
copyDir(P("site/public"), ".");                                   // favicon, icônes : servis à la racine
for (const f of fs.readdirSync(P("LICENSES"))) write("licenses/" + f, fs.readFileSync(P("LICENSES", f)));
write("licenses/LICENSE-GPL-3.0.txt", fs.readFileSync(P("LICENSE")));

/* les polices, chez nous : latin, et latin étendu chargé seulement si une page en a besoin.
   font-display optional + preload : jamais de saut de mise en page à l arrivée d une police (CLS nul) ; sur une connexion très lente, la première vue garde la police de repli */
const RANGE = {
  latin: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  "latin-ext": "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
};
const FONTS = [["Inter Tight", "inter-tight", [500, 800, 900]], ["DM Mono", "dm-mono", [400, 500]]];
const fontCSS = FONTS.flatMap(([fam, file, ws]) => ws.flatMap(w => ["latin-ext", "latin"].map(sub =>
  `@font-face{font-family:"${fam}";font-style:normal;font-weight:${w};font-display:optional;src:url(/assets/fonts/${file}-${sub}-${w}-normal.woff2) format("woff2");unicode-range:${RANGE[sub]}}`))).join("");
const PRELOAD = ["inter-tight-latin-900-normal", "inter-tight-latin-800-normal", "dm-mono-latin-400-normal", "dm-mono-latin-500-normal"]   // (tout ce qui s'affiche au-dessus de la ligne de flottaison : pas de saut à l'arrivée des polices)
  .map(f => `<link rel="preload" href="/assets/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join("\n");

/* le thème retenu, posé avant le premier affichage (pas de flash jour puis signal) */
const THEME_JS = `try{if(JSON.parse(localStorage.getItem("fm1radio.theme"))==="signal")document.documentElement.dataset.theme="signal"}catch(e){}`;

/* ------------------------------------------------------------------ outils de page */
const abs = u => SITE + u;
const tr = lang => (p, v) => UI.tr(lang, p, v);
const links = (lang, base = "") => ({ ...LINKS, guide: UI.url(lang, "guide", base), home: UI.url(lang, "home", base), licenses: LINKS.src + "/tree/main/LICENSES" });
const LOCALE = { en: "en_US", fr: "fr_FR", de: "de_DE", nl: "nl_NL" };

function headFor(lang, page) {
  const t = tr(lang), m = t("seo." + page), url = abs(UI.url(lang, page)), og = abs(`/assets/og-${lang}.png`);
  const alt = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${abs(UI.url(l, page))}">`).join("\n")
    + `\n<link rel="alternate" hreflang="x-default" href="${abs(UI.url("en", page))}">`;
  return `<title>${esc(m.title)}</title>
<meta name="description" content="${attr(m.desc)}">
<link rel="canonical" href="${url}">
${alt}
<meta property="og:type" content="website">
<meta property="og:site_name" content="FM-1 Radio">
<meta property="og:title" content="${attr(m.title)}">
<meta property="og:description" content="${attr(m.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${LOCALE[lang]}">
${LANGS.filter(l => l !== lang).map(l => `<meta property="og:locale:alternate" content="${LOCALE[l]}">`).join("\n")}
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${attr(t("seo.ogAlt"))}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
${PRELOAD}
<style>${fontCSS}</style>
<script>${THEME_JS}</script>`;
}
const jsonld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
const strip = h => String(h).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&");

function ldHome(lang) {
  const t = tr(lang), L = links(lang);
  return jsonld({ "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", "@id": abs("/#website"), url: abs("/"), name: "FM-1 Radio", inLanguage: LANGS },
    { "@type": "WebApplication", "@id": abs("/#app"), name: "FM-1 Radio", url: abs(UI.url(lang)), description: t("seo.appDesc"), inLanguage: lang,
      applicationCategory: "MultimediaApplication", applicationSubCategory: "Generative music", operatingSystem: "Windows, macOS, Linux, ChromeOS, Android",
      browserRequirements: "Requires Web MIDI with SysEx: Chrome or Edge", isAccessibleForFree: true, license: "https://www.gnu.org/licenses/gpl-3.0.html",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, author: { "@type": "Organization", name: "FM-1 Radio", url: abs("/"), email: LINKS.contact }, image: abs(`/assets/og-${lang}.png`), sameAs: [LINKS.src],
      isBasedOn: { "@type": "SoftwareApplication", name: "JIANT FM", url: LINKS.jiant, author: { "@type": "Person", name: "Juan Ignacio Antonucci" } } },
    { "@type": "FAQPage", "@id": abs(UI.url(lang)) + "#faq", inLanguage: lang, mainEntity: t("page.faq").map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ] });
}
function ldGuide(lang) {
  const t = tr(lang), L = links(lang);
  return jsonld({ "@context": "https://schema.org", "@graph": [
    { "@type": "HowTo", name: t("seo.guide.title"), description: t("seo.guide.desc"), inLanguage: lang, totalTime: "PT2M", url: abs(UI.url(lang, "guide")),
      tool: [{ "@type": "HowToTool", name: "M-VAVE FM-1 (JIANT FM)" }, { "@type": "HowToTool", name: "USB data cable" }, { "@type": "HowToTool", name: "Chrome / Edge" }],
      step: UI.SETUP.map((k, i) => { const g = t("setup." + k); return { "@type": "HowToStep", position: i + 1, name: g.title, url: abs(UI.url(lang, "guide")) + "#" + k,
        text: strip(UI.fill(g.why, L)), itemListElement: g.steps.map(([a, b]) => ({ "@type": "HowToDirection", text: `${a}: ${b}` })) }; }) },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "FM-1 Radio", item: abs(UI.url(lang)) },
      { "@type": "ListItem", position: 2, name: t("guide.h1"), item: abs(UI.url(lang, "guide")) } ] },
  ] });
}

/* remplit les éléments vides marqués data-t, et les aria-label marqués data-t-aria */
function fillTexts(html, t) {
  html = html.replace(/<(\w+)([^>]*?)\sdata-t="([\w.]+)"([^>]*)><\/\1>/g, (m, tag, a, k, b) => `<${tag}${a} data-t="${k}"${b}>${esc(t(k))}</${tag}>`);
  return html.replace(/\sdata-t-aria="([\w.]+)"/g, (m, k) => `${m} aria-label="${attr(t(k))}"`);
}
function put(html, re, inner) {
  let n = 0; const out = html.replace(re, (m, open, close) => { n++; return open + inner + close; });
  if (n !== 1) throw new Error("gabarit : " + re); return out;
}

/* ------------------------------------------------------------------ la radio, une page par langue */
const fonts = /<link rel="preconnect"[^>]*>\n<link rel="preconnect"[^>]*>\n<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n/;
if (!fonts.test(tpl)) throw new Error("gabarit : liens Google Fonts introuvables");
const appScript = tpl.match(/<script type="module">([^\n]*\n"use strict";[\s\S]*?)<\/script>/)[1];   // (le hachage CSP couvre le contenu exact, saut de ligne compris)
const inlineHashes = [sha(THEME_JS), sha(appScript)];
const defaultStyle = "DEEP HOUSE";

for (const lang of LANGS) {
  const t = tr(lang), L = links(lang);
  let h = tpl;
  h = h.replace('<html lang="en" data-theme="day">', `<html lang="${lang}" data-theme="day" data-site data-gen="${genURL}" data-live="${attr(LIVE_URL)}">`);
  h = h.replace(fonts, "");
  h = h.replace("<title>FM-1 Radio</title>", headFor(lang, "home") + "\n" + ldHome(lang));
  h = fillTexts(h, t);
  h = put(h, /(<nav class="langs" id="langs"[^>]*>)(<\/nav>)/, UI.langsHTML(lang, "home", ""));
  h = put(h, /(<span id="pillText">)(<\/span>)/, esc(t("offAir")));                    // (l'en-tête a sa taille finale dès le premier affichage)
  h = put(h, /(<button type="button" class="themebtn" id="themeBtn")(><\/button>)/, ` aria-label="${attr(t("toNight"))}">${moonSVG()}</button>`.slice(0, -10));
  const rows = UI.SETUP.map(key => ({ key, s: UI.MANUAL.has(key) ? "todo" : "wait", txt: t(UI.MANUAL.has(key) ? "sTodo" : "sWait") }));
  h = put(h, /(<ol class="checks" id="checks">)(<\/ol>)/, UI.checksHTML(t, rows, "connect"));
  h = put(h, /(<div class="guide" id="guide"[^>]*>)(<\/div>)/, UI.guidePanelHTML(t, "connect", { i: 1, n: UI.SETUP.length, links: L }));
  h = put(h, /(<div class="idx" id="idxPlug">)(<\/div>)/, UI.indexHTML(t, FAMILIES, g => g === defaultStyle));
  h = put(h, /(<button class="btn-prim huge" id="play">)(<\/button>)/, esc(`${t("start")} · ${defaultStyle}`));
  h = put(h, /(<div class="about" id="about">)(<\/div>)/, UI.aboutHTML(t, L));
  h = put(h, /(<footer class="foot" id="credits">)(<\/footer>)/, t("footH", L));       // (les liens passent à t : t sans valeurs vide les {…})
  h = h.replace('<script src="i18n.js" id="i18nScript" defer></script>', `<script src="${i18nURL}" id="i18nScript" defer></script>`);
  if (/data-t="[\w.]+"><\//.test(h.replace(/<option[^>]*>/g, ""))) console.warn("! un texte data-t est resté vide en " + lang);
  write(UI.url(lang).slice(1) + "index.html", h);
}

/* ------------------------------------------------------------------ la page guide, une par langue */
const styleBlock = tpl.match(/<style>[\s\S]*?<\/style>/)[0];
const GUIDE_JS = `(function(){var b=document.getElementById("themeBtn"),r=document.documentElement,m=document.querySelector('meta[name="theme-color"]');
function s(){var n=r.dataset.theme==="signal";b.innerHTML=n?${JSON.stringify(sunSVG())}:${JSON.stringify(moonSVG())};m.content=n?"#FF5A1F":"#F4F4F2";}
b.onclick=function(){r.dataset.theme=r.dataset.theme==="signal"?"day":"signal";try{localStorage.setItem("fm1radio.theme",JSON.stringify(r.dataset.theme))}catch(e){}s();};s();})();`;
inlineHashes.push(sha(GUIDE_JS));
function sunSVG() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>'; }
function moonSVG() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"/></svg>'; }
function shell(lang, page, head, body) {
  const t = tr(lang);
  return `<!doctype html>
<html lang="${lang}" data-theme="day" data-site>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#F4F4F2">
${head}
${styleBlock}
</head>
<body>
<main>
  <header>
    <div class="hl"><a class="brand" href="${UI.url(lang)}" style="text-decoration: none">${esc(t("brand"))}</a></div>
    <div class="hr">
      <nav class="langs" aria-label="${attr(t("langLabel"))}">${page ? UI.langsHTML(lang, page, "") : ""}</nav>
      <button type="button" class="themebtn" id="themeBtn" aria-label="${attr(t("toNight"))}"></button>
    </div>
  </header>
${body}
  <footer class="foot">${t("footH", links(lang))}</footer>
</main>
<script>${GUIDE_JS}</script>
</body>
</html>
`;
}
for (const lang of LANGS) {
  const t = tr(lang), L = links(lang);
  write(UI.url(lang, "guide").slice(1) + "index.html", shell(lang, "guide", headFor(lang, "guide") + "\n" + ldGuide(lang), `  <article class="guidepage">${UI.guideArticleHTML(t, L)}</article>`));
}

/* ------------------------------------------------------------------ 404 */
write("404.html", shell("en", null, `<title>Not found · FM-1 Radio</title>\n<meta name="robots" content="noindex">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<style>${fontCSS}</style>\n<script>${THEME_JS}</script>`,
  `  <section class="ghero"><h1 class="big">404</h1><p class="lead">${LANGS.map(l => `<a href="${UI.url(l)}" hreflang="${l}" lang="${l}">FM-1 Radio · ${esc(I18N[l].langName)}</a>`).join("<br>")}</p></section>`));

/* ------------------------------------------------------------------ sitemap, robots, manifest */
const today = new Date().toISOString().slice(0, 10);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${["home", "guide"].flatMap(page => LANGS.map(lang => `  <url>
    <loc>${abs(UI.url(lang, page))}</loc>
    <lastmod>${today}</lastmod>
${LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(UI.url(l, page))}"/>`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(UI.url("en", page))}"/>
  </url>`)).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /*?sim=\n\nSitemap: ${abs("/sitemap.xml")}\n`);
write("site.webmanifest", JSON.stringify({ name: "FM-1 Radio", short_name: "FM-1 Radio", description: I18N.en.seo.appDesc, start_url: "/", scope: "/", display: "standalone",
  background_color: "#F4F4F2", theme_color: "#F4F4F2", icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" } ] }, null, 2));

/* ------------------------------------------------------------------ en-têtes HTTP (Cloudflare Pages, Netlify) */
const extra = cfg.csp || {};
const CSP = [
  "default-src 'self'",
  `script-src 'self' ${inlineHashes.join(" ")} 'wasm-unsafe-eval' ${(extra.script || []).join(" ")}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'", "img-src 'self' data:",
  `connect-src 'self' ${(extra.connect || []).join(" ")}`.trim(),
  "base-uri 'self'", "form-action 'none'", "frame-ancestors 'none'", "object-src 'none'",
].join("; ");
write("_headers", `/*
  Content-Security-Policy: ${CSP}
  Permissions-Policy: midi=(self), camera=(), microphone=(), geolocation=(), payment=()
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  Cross-Origin-Opener-Policy: same-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/gen/*
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: text/javascript; charset=utf-8

/licenses/*
  Content-Type: text/plain; charset=utf-8
`);
/* sans barre finale : redirection définitive (301), pas la 307 que les hébergeurs font d'eux-mêmes */
const SLASH = ["home", "guide"].flatMap(page => LANGS.map(l => UI.url(l, page))).filter(u => u !== "/").map(u => `${u.slice(0, -1)} ${u} 301`);
write("_redirects", `/app /  301\n/app/ /  301\n/app/index.html /  301\n/en /  301\n/en/ /  301\n/en/* /:splat 301\n${SLASH.join("\n")}\n`);

const files = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); e.isDirectory() ? walk(f) : files.push(f); } })(OUT);
const size = files.reduce((a, f) => a + fs.statSync(f).size, 0);
console.log(`dist/ : ${files.length} fichiers, ${(size / 1024).toFixed(0)} Ko, pour ${SITE}`);
