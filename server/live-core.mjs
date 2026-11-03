// FM-1 Radio : le compteur des FM-1 à l'antenne, indépendant de l'hébergeur (serveur Node, Worker Cloudflare...).
// Chaque page à l'antenne envoie un battement anonyme : un identifiant tiré au hasard à l'ouverture de la page,
// gardé en mémoire de la page seulement (ni cookie, ni stockage). Une page muette depuis ttl ms ne compte plus.
// L'adresse IP n'est gardée que hachée (avec un sel tiré une fois), pour limiter le nombre de pages par connexion :
// personne ne peut gonfler le chiffre depuis un seul poste. Rien d'autre n'est gardé.
// Le stockage est fourni par l'adaptateur : en mémoire pour server/node.mjs (MemoryStore), dans la base SQLite du
// Durable Object pour Cloudflare (server/cloudflare.mjs), qui peut être évincé de la mémoire entre deux battements.
import crypto from "node:crypto";

/* un stockage : get, set, del, purge (tout ce qui est plus vieux que before), count, countWho */
export class MemoryStore {
  constructor() { this.m = new Map(); }
  get(id) { return this.m.get(id); }
  set(id, r) { this.m.set(id, r); }
  del(id) { this.m.delete(id); }
  purge(before) { for (const [k, v] of this.m) if (v.at < before) this.m.delete(k); }
  count() { return this.m.size; }
  countWho(who) { let n = 0; for (const v of this.m.values()) if (v.who === who) n++; return n; }
}

export class LiveCounter {
  constructor({ ttl = 120000, perIp = 4, max = 20000, store = new MemoryStore(), salt } = {}) {
    this.ttl = ttl; this.perIp = perIp; this.max = max; this.store = store;
    this.salt = salt || crypto.randomBytes(16).toString("hex");
  }
  who(ip) { return crypto.createHash("sha256").update(this.salt + String(ip || "")).digest("hex").slice(0, 16); }
  /* un battement : on = true (à l'antenne) ou false (arrêtée, page fermée). Renvoie false si refusé. */
  beat(id, on, ip, now = Date.now()) {
    if (typeof id !== "string" || !/^[a-f0-9]{16,32}$/.test(id)) return false;
    this.store.purge(now - this.ttl);
    if (!on) { this.store.del(id); return true; }
    const who = this.who(ip), s = this.store.get(id);
    if (!s || s.who !== who) {                         // (nouvelle page, ou page passée sur une autre connexion : wifi vers 4G)
      if (!s && this.store.count() >= this.max) return false;
      if (this.store.countWho(who) >= this.perIp) return false;
    }
    this.store.set(id, { at: now, who });
    return true;
  }
  count(now = Date.now()) { this.store.purge(now - this.ttl); return this.store.count(); }
}

/* la réponse HTTP, commune aux adaptateurs : GET -> { live }, POST { id, on } -> { live } */
export async function handleLive(counter, { method, ip, readJSON }) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (method === "GET") return { status: 200, headers, body: JSON.stringify({ live: counter.count() }) };
  if (method !== "POST") return { status: 405, headers: { ...headers, Allow: "GET, POST" }, body: "{}" };
  let j; try { j = await readJSON(); } catch { return { status: 400, headers, body: "{}" }; }
  const ok = counter.beat(j && j.id, !!(j && j.on), ip);
  return { status: ok ? 200 : 429, headers, body: JSON.stringify({ live: counter.count() }) };
}
