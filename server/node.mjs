// FM-1 Radio : serveur Node sans dépendance. Sert le site construit (dist/) avec ses en-têtes (_headers),
// ses redirections (_redirects), la compression, et le compteur des FM-1 à l'antenne (/api/live).
//   node tools/build-site.mjs && node server/node.mjs              -> http://localhost:8080
//   node server/node.mjs --port 3000 --root dist
// Derrière un proxy (nginx, Caddy, Cloudflare) : TRUST_PROXY=1 pour lire l'IP du visiteur dans X-Forwarded-For.
// Une seule instance : le compteur vit en mémoire (un redémarrage le remet à zéro, les pages le reremplissent en 45 s).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { LiveCounter, handleLive } from "./live-core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = +(process.env.PORT || arg("port", 8080));
const DIR = path.resolve(ROOT, arg("root", "dist"));
const TRUST = process.env.TRUST_PROXY === "1";
if (!fs.existsSync(path.join(DIR, "index.html"))) { console.error(`${DIR} : pas de site, lance d'abord node tools/build-site.mjs`); process.exit(1); }

/* _headers : blocs « chemin » puis lignes « Nom: valeur » ; un chemin finit par * pour tout un dossier */
function parseHeaders(file) {
  const rules = []; let cur = null;
  if (!fs.existsSync(file)) return rules;
  for (const l of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!l.trim()) continue;
    if (/^\S/.test(l)) { cur = { pat: l.trim(), h: {} }; rules.push(cur); }
    else if (cur) { const i = l.indexOf(":"); cur.h[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
  }
  return rules;
}
const match = (pat, p) => pat.endsWith("*") ? p.startsWith(pat.slice(0, -1)) : p === pat;
function parseRedirects(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split(/\r?\n/).map(l => l.trim().split(/\s+/)).filter(a => a.length >= 2 && a[0])
    .map(([from, to, code]) => ({ from, to, code: +(code || 301) }));
}
const HEADERS = parseHeaders(path.join(DIR, "_headers")), REDIRECTS = parseRedirects(path.join(DIR, "_redirects"));
const headersFor = p => Object.assign({}, ...HEADERS.filter(r => match(r.pat, p)).map(r => r.h));
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2" };
const COMPRESS = /^(text\/|application\/(json|xml|manifest)|image\/svg)/;

const counter = new LiveCounter();
function send(req, res, status, headers, body) {
  const type = headers["Content-Type"] || "";
  if (body && body.length > 1024 && COMPRESS.test(type)) {
    const ae = String(req.headers["accept-encoding"] || "");
    if (/\bbr\b/.test(ae)) { body = zlib.brotliCompressSync(body); headers["Content-Encoding"] = "br"; }
    else if (/\bgzip\b/.test(ae)) { body = zlib.gzipSync(body); headers["Content-Encoding"] = "gzip"; }
    headers.Vary = "Accept-Encoding";
  }
  res.writeHead(status, headers); res.end(req.method === "HEAD" ? undefined : body);
}
function readJSON(req) {
  return new Promise((resolve, reject) => { let s = ""; req.setEncoding("utf8");
    req.on("data", c => { s += c; if (s.length > 1024) { reject(new Error("too big")); req.destroy(); } });
    req.on("end", () => { try { resolve(JSON.parse(s)); } catch (e) { reject(e); } }); req.on("error", reject); });
}

http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://x"); let p = decodeURIComponent(u.pathname);
    if (p === "/api/live") {
      const ip = TRUST ? String(req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress : req.socket.remoteAddress;
      const r = await handleLive(counter, { method: req.method, ip, readJSON: () => readJSON(req) });
      return send(req, res, r.status, { ...headersFor(p), ...r.headers }, r.body);
    }
    if (req.method !== "GET" && req.method !== "HEAD") return send(req, res, 405, { Allow: "GET, HEAD" }, "");
    for (const r of REDIRECTS) {
      if (r.from.endsWith("*") ? p.startsWith(r.from.slice(0, -1)) : p === r.from) {
        const to = r.to.replace(":splat", r.from.endsWith("*") ? p.slice(r.from.length - 1) : "");
        return send(req, res, r.code, { Location: to + u.search }, "");
      }
    }
    if (p.endsWith("/")) p += "index.html";
    let f = path.join(DIR, p);
    if (!f.startsWith(DIR + path.sep) || path.basename(f).startsWith("_")) f = null;      // (ni sortie du dossier, ni _headers servi)
    else if (fs.existsSync(f) && fs.statSync(f).isDirectory()) return send(req, res, 301, { Location: p + "/" + u.search }, "");
    if (!f || !fs.existsSync(f)) return send(req, res, 404, { ...headersFor(p), "Content-Type": TYPES[".html"] }, fs.readFileSync(path.join(DIR, "404.html")));
    const type = TYPES[path.extname(f)] || "application/octet-stream";
    send(req, res, 200, { "Content-Type": type, ...(type.startsWith("text/html") ? { "Cache-Control": "no-cache" } : {}), ...headersFor(p) }, fs.readFileSync(f));
  } catch (e) { console.error(e); if (!res.headersSent) { res.writeHead(500); res.end(); } }
}).listen(PORT, () => console.log(`FM-1 Radio : ${DIR} sur http://localhost:${PORT} (compteur /api/live)`));
