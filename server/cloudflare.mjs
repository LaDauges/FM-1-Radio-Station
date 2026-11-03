// FM-1 Radio sur Cloudflare : un seul Worker sert le site (dist/, avec _headers et _redirects) et le compteur
// des FM-1 à l'antenne (/api/live). Le compteur vit dans un Durable Object unique (« global ») : un seul endroit
// au monde tient le chiffre, quel que soit le centre de données qui reçoit le battement.
// Configuration : wrangler.jsonc. Local : npx wrangler dev. Mise en ligne : npx wrangler deploy (le build passe avant).
// Un Durable Object est évincé de la mémoire après quelques secondes sans requête : les pages à l'antenne et le sel
// sont donc gardés dans sa petite base SQLite, une ligne par page (identifiant, heure du dernier battement, IP hachée).
import { DurableObject } from "cloudflare:workers";
import { LiveCounter, handleLive } from "./live-core.mjs";

class SqlStore {
  constructor(sql) { this.sql = sql; sql.exec("CREATE TABLE IF NOT EXISTS live (id TEXT PRIMARY KEY, at INTEGER NOT NULL, who TEXT NOT NULL)"); }
  get(id) { return this.sql.exec("SELECT at, who FROM live WHERE id = ?", id).toArray()[0]; }
  set(id, r) { this.sql.exec("INSERT INTO live (id, at, who) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET at = excluded.at, who = excluded.who", id, r.at, r.who); }
  del(id) { this.sql.exec("DELETE FROM live WHERE id = ?", id); }
  purge(before) { this.sql.exec("DELETE FROM live WHERE at < ?", before); }
  count() { return this.sql.exec("SELECT COUNT(*) AS n FROM live").one().n; }
  countWho(who) { return this.sql.exec("SELECT COUNT(*) AS n FROM live WHERE who = ?", who).one().n; }
}

export class LiveRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    const sql = ctx.storage.sql;
    sql.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
    let salt = sql.exec("SELECT v FROM meta WHERE k = 'salt'").toArray()[0]?.v;
    if (!salt) { salt = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, "0")).join(""); sql.exec("INSERT INTO meta (k, v) VALUES ('salt', ?)", salt); }
    this.counter = new LiveCounter({ store: new SqlStore(sql), salt });
  }
  async fetch(request) {
    const ip = request.headers.get("cf-connecting-ip") || "";
    const r = await handleLive(this.counter, {
      method: request.method, ip,
      readJSON: async () => { const s = await request.text(); if (s.length > 1024) throw new Error("too big"); return JSON.parse(s); },
    });
    return new Response(r.body, { status: r.status, headers: r.headers });
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/live") return env.LIVE.get(env.LIVE.idFromName("global")).fetch(request);
    if (pathname.startsWith("/api/")) return new Response("{}", { status: 404, headers: { "Content-Type": "application/json" } });
    return env.ASSETS.fetch(request);                 // (jamais atteint pour le site : run_worker_first ne vise que /api/*)
  },
};
