// FM-1 Radio : le compteur des FM-1 à l'antenne, indépendant de l'hébergeur (serveur Node, Worker Cloudflare...).
// Chaque page à l'antenne envoie un battement anonyme : un identifiant tiré au hasard à l'ouverture de la page,
// gardé en mémoire de la page seulement (ni cookie, ni stockage). Une page muette depuis ttl ms ne compte plus.
// Rien n'est écrit sur disque. L'adresse IP n'est gardée que hachée (sel tiré au démarrage), en mémoire, pour limiter
// le nombre de pages par connexion : personne ne peut gonfler le chiffre depuis un seul poste.
import crypto from "node:crypto";

export class LiveCounter {
  constructor({ ttl = 120000, perIp = 4, max = 20000 } = {}) {
    this.ttl = ttl; this.perIp = perIp; this.max = max;
    this.ids = new Map();                                // id -> { at, who }
    this.salt = crypto.randomBytes(16).toString("hex");
  }
  who(ip) { return crypto.createHash("sha256").update(this.salt + String(ip || "")).digest("hex").slice(0, 16); }
  sweep(now) { for (const [id, s] of this.ids) if (now - s.at > this.ttl) this.ids.delete(id); }
  /* un battement : on = true (à l'antenne) ou false (arrêtée, page fermée). Renvoie false si refusé. */
  beat(id, on, ip, now = Date.now()) {
    if (typeof id !== "string" || !/^[a-f0-9]{16,32}$/.test(id)) return false;
    this.sweep(now);
    if (!on) { this.ids.delete(id); return true; }
    const who = this.who(ip), s = this.ids.get(id);
    if (s && s.who !== who) return false;                // (un identifiant ne change pas de connexion)
    if (!s) {
      if (this.ids.size >= this.max) return false;
      let n = 0; for (const x of this.ids.values()) if (x.who === who) n++;
      if (n >= this.perIp) return false;
    }
    this.ids.set(id, { at: now, who });
    return true;
  }
  count(now = Date.now()) { this.sweep(now); return this.ids.size; }
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
