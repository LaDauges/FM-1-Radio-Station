/* SPDX-License-Identifier: GPL-3.0-only
 * FM-1 Radio : le générateur de morceaux de JIANT (firmware/src/gen.c, Juan Ignacio Antonucci) compilé hors machine,
 * pour que l'app produise exactement les morceaux du GEN de la machine. Modelé sur tests/gen_dump.c de JIANT, qui
 * fait tourner gen.c sur l'hôte à travers le harnais tests/ui_test.c.
 *
 * Source : la version de JIANT choisie par build-gen.ps1 -Version (V10.26 par défaut, celle de la machine), compilée
 * dans le clone reference/JIANT. Ce fichier ne compile qu'à l'intérieur de ce dépôt (voir build-gen.ps1).
 * Exporte, pour Emscripten :
 *   gen_version()                       la version du firmware compilé ("JIANT V10.26")
 *   gen_ngenre()                        nombre de genres (GENRE[] de gen_tables.c)
 *   gen_genre_name(i)                   nom du genre i (0 .. ngenre-1)
 *   gen_piece(genre, seed, energy, complex, human, six)
 *       genre : 1 .. ngenre (GENRE[genre-1]), ngenre+1 = EXPLORE ; seed 0 .. 9999 ; energy, complex, human 0 .. 100 ;
 *       six : 1 = MENU > TRACKS 6 (six pistes jouent), 0 = TRACKS 4.
 *       Renvoie le morceau en JSON (voir docs/format-morceau.md). FORM toujours LOOP : la radio porte l'arrangement. */
#define UI_TEST_NO_MAIN 1
/* la version vient de firmware/src/felucca.c (build-gen.ps1 la passe en -DJIANT_VERSION=V10.26, sans guillemets) ;
 * sans elle, ui_test.c dirait "TEST" */
#define GEN_STR2(x) #x
#define GEN_STR(x) GEN_STR2(x)
#ifdef JIANT_VERSION
#define FELUCCA_VERSION GEN_STR(JIANT_VERSION)
#endif
#include "ui_test.c"
#include <stdarg.h>
#include <emscripten/emscripten.h>

static char out[96 * 1024];
static uint32_t on;
static void put(const char *fmt, ...)
{
    va_list ap;
    va_start(ap, fmt);
    if (on < sizeof out) on += (uint32_t)vsnprintf(out + on, sizeof out - on, fmt, ap);
    va_end(ap);
}

/* les globaux que gen.c écrit (gen.c, fin de gen_go) : seuls ceux-là partent vers la machine */
static const uint8_t GEN_GLOBALS[] = {
    G_SWING, G_DTIME, G_DFDBK, G_DMIX, G_DCOLOR, G_DTYPE, G_DPING, G_DMOD, G_DPIT, G_DSPRY,
    G_RTYPE, G_RSIZE, G_RRATE, G_RWIDE, G_RDAMP, G_RFILT, G_RMOD, G_RPRE,
    G_CRATE, G_CDEPTH, G_DUCK, G_DREL, G_CLIP, G_PUNCH,
};

static int booted;
static void boot(void)
{
    if (booted) return;
    booted = 1;
    ui_power_on(); go_home(); frames(4);
    song.master_q12 = 4096;
}

EMSCRIPTEN_KEEPALIVE const char *gen_version(void) { return "JIANT " FELUCCA_VERSION; }
EMSCRIPTEN_KEEPALIVE int gen_ngenre(void) { return (int)NGENRE; }
EMSCRIPTEN_KEEPALIVE const char *gen_genre_name(int i) { return i >= 0 && (uint32_t)i < NGENRE ? GENRE[i].name : ""; }

EMSCRIPTEN_KEEPALIVE const char *gen_piece(int genre, int seed, int energy, int complex, int human, int six)
{
    uint32_t k, i;
    boot();
    if (six) ui_rec_prefs |= PREF_SIX >> 8; else ui_rec_prefs &= (uint8_t)~(PREF_SIX >> 8);
    rp_apply();
    gp.genre = (uint8_t)genre; gp.seed = (uint16_t)seed; gp.energy = (uint8_t)energy; gp.form = 0;
    for (k = 0; k < GP_N; k++) gp.amt[k] = GA_AUTO;
    gp.complex = (uint8_t)complex; gp.swing = GA_AUTO; gp.human = (uint8_t)human;
    gen_go();

    on = 0;
    put("{\"version\":\"JIANT %s\",\"genre\":%d,\"genreName\":\"%s\",\"seed\":%d,\"energy\":%d,\"complex\":%d,\"human\":%d,",
        FELUCCA_VERSION, genre, gs.g ? gs.g->name : "EXPLORE", seed, energy, complex, human);
    put("\"bpm\":%d,\"pCount\":%u,\"globals\":{", song.g[G_BPM], (unsigned)P_COUNT);
    for (i = 0; i < sizeof GEN_GLOBALS; i++)
        put("%s\"%u\":%d", i ? "," : "", (unsigned)GEN_GLOBALS[i], song.g[GEN_GLOBALS[i]]);
    put("},\"tracks\":[");
    for (k = 0; k < NTRK; k++) {
        const track_t *t = &trk[k];
        uint32_t len = (uint32_t)t->p[P_SLEN];
        if (len > NSTEP) len = NSTEP;
        uint32_t r = gs.role[k];
        /* "mute" : une piste dont le rôle ne joue pas (gen.c gen_role : !gs.act[r], ou une seconde TEX, laissée vide),
         * ou au-delà de MENU > TRACKS 4 (ui.c trk_live : la machine ne la fait pas sonner, GEN y écrit parfois) */
        int off = !gs.act[r] || (r == RL_TEX && k != gs.trk_of[RL_TEX]) || k >= trk_live;
        put("%s{\"role\":%u,%s\"eng\":%u,\"preset\":%u,\"p\":[", k ? "," : "", (unsigned)r, off ? "\"mute\":true," : "",
            (unsigned)trk_eng(t), (unsigned)t->preset);
        for (i = 0; i < P_COUNT; i++) put("%s%d", i ? "," : "", motion_base_value(t, i));
        put("],\"len\":%u,\"steps\":[", (unsigned)len);
        for (i = 0; i < len; i++) {
            const step_t *s = &t->step[i];
            /* le format d'écriture de TRACK_STEP (editor.c ed_step_put) : n, 4 notes, time, flags, vel,
             * hits (bas 7 bits), accents (bas 7 bits), bits hauts, chance, ratchet */
            put("%s[%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u]", i ? "," : "",
                s->n, s->note[0], s->note[1], s->note[2], s->note[3], s->time, s->flags & (SF_ACCENT | SF_SLIDE), s->vel,
                s->hit & 0x7Fu, s->acc & 0x7Fu, (unsigned)((s->hit >> 7) | (s->acc >> 7) << 1),
                step_chance(s), step_ratchet(s));
        }
        put("]}");
    }
    put("]}");
    return on < sizeof out ? out : "{\"error\":\"overflow\"}";
}
