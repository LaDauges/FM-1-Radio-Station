// FM-1 Radio : dessine les icônes (site/public) et les images de partage (site/assets/og-<langue>.png).
// À relancer seulement si le dessin ou les textes d'accroche changent ; les images sont versionnées.
//   node tools/make-assets.js        (Playwright et son Chromium)
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, ".."), P = (...a) => path.join(ROOT, ...a);
const ctx = vm.createContext({}); vm.runInContext(fs.readFileSync(P("app/i18n.js"), "utf8") + ";globalThis.__={I18N,UI};", ctx);
const { I18N, UI } = ctx.__;

/* la signature : la silhouette de l'arc d'un morceau (intro, montée, sommet, respiration, montée, sommet, descente) */
const LV = [4, 24, 45, 66, 82, 94, 100, 94, 98, 42, 36, 66, 84, 100, 95, 52, 6];
function arcPath(W, H, top) {
  const x = i => (i * W / (LV.length - 1)).toFixed(1), y = v => (H - v * (H - top) / 100).toFixed(1);
  return `M0,${H} ` + LV.map((v, i) => `L${x(i)},${y(v)}`).join(" ") + ` L${W},${H} Z`;
}
const FAV = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0E0E10"/><path transform="translate(6 0)" d="${arcPath(52, 52, 14)}" fill="#FF5A1F"/></svg>\n`;
const MASK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0E0E10"/><path transform="translate(13 0)" d="${arcPath(38, 44, 22)}" fill="#FF5A1F"/></svg>`;

const fontFace = [["Inter Tight", "inter-tight", 900], ["DM Mono", "dm-mono", 400], ["DM Mono", "dm-mono", 500]].map(([f, n, w]) =>
  `@font-face{font-family:"${f}";font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(P(`site/assets/fonts/${n}-latin-${w}-normal.woff2`)).toString("base64")}) format("woff2")}`).join("");
const og = lang => `<!doctype html><html><head><meta charset="utf-8"><style>${fontFace}
  html,body{margin:0;width:1200px;height:630px;background:#FF5A1F;color:#0E0E10;overflow:hidden}
  .top{position:absolute;left:64px;right:64px;top:48px;display:flex;justify-content:space-between;font:500 22px "DM Mono";letter-spacing:.08em;border-bottom:3px solid #0E0E10;padding-bottom:16px}
  .top i{display:inline-block;width:16px;height:16px;border-radius:50%;background:#0E0E10;margin-right:12px;vertical-align:-1px}
  h1{position:absolute;left:56px;top:128px;margin:0;font:900 204px/.8 "Inter Tight";letter-spacing:-.06em;word-spacing:.18em;text-transform:uppercase;white-space:nowrap}
  p{position:absolute;left:64px;top:318px;width:1072px;margin:0;font:400 27px/1.35 "DM Mono";letter-spacing:.01em}
  svg{position:absolute;left:0;bottom:0}
</style></head><body><div class="top"><span><i></i>FM-1 RADIO · ON AIR</span><span>JIANT FM · 43 STYLES</span></div>
<h1>FM-1 Radio</h1><p>${UI.esc(I18N[lang].kicker)}</p>
<svg width="1200" height="170" viewBox="0 0 1200 170"><path d="${arcPath(1200, 170, 16)}" fill="#0E0E10"/></svg></body></html>`;

/* un .ico qui embarque un PNG (accepté par tous les navigateurs actuels) */
function ico(png, size) {
  const h = Buffer.alloc(22); h.writeUInt16LE(0, 0); h.writeUInt16LE(1, 2); h.writeUInt16LE(1, 4);
  h[6] = size; h[7] = size; h[8] = 0; h[9] = 0; h.writeUInt16LE(1, 10); h.writeUInt16LE(32, 12); h.writeUInt32LE(png.length, 14); h.writeUInt32LE(22, 18);
  return Buffer.concat([h, png]);
}
(async () => {
  fs.mkdirSync(P("site/public"), { recursive: true });
  fs.writeFileSync(P("site/public/favicon.svg"), FAV);
  const b = await chromium.launch();
  async function shot(html, w, h, file) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(100);
    const buf = await p.screenshot({ type: "png" }); await p.close(); if (file) fs.writeFileSync(file, buf); return buf;
  }
  const svgPage = (svg, s) => `<html><body style="margin:0">${svg.replace("<svg ", `<svg width="${s}" height="${s}" `)}</body></html>`;
  for (const [s, f] of [[180, "apple-touch-icon.png"], [192, "icon-192.png"], [512, "icon-512.png"]]) await shot(svgPage(FAV, s), s, s, P("site/public", f));
  await shot(svgPage(MASK, 512), 512, 512, P("site/public/icon-maskable-512.png"));
  fs.writeFileSync(P("site/public/favicon.ico"), ico(await shot(svgPage(FAV, 32), 32, 32), 32));
  for (const lang of UI.LANGS) await shot(og(lang), 1200, 630, P(`site/assets/og-${lang}.png`));
  await b.close();
  console.log("icônes et images de partage écrites");
})();
