# Journal de sonde, FM-1 Radio

Distinguer ce qui est **observé** sur la machine de ce qui est **lu dans le code** de JIANT.

## 2026-11-01 : lecture du code de JIANT (main, ligne 0.9.18, base V10)

Lu dans le code, pas encore observé :

- **Protocole éditeur** `F0 7D 46 4C <cmd> <args> F7`, une réponse par requête valide, même cmd. Valeurs v14 : 2 octets, LSB d'abord, valeur + 8192.
- `INFO` (1) : version « JIANT ... », NENGINES, P_COUNT (123), G_COUNT (32), NSTEP (64), P_E0, noms des moteurs, NTRK (6), CHAIN_ROWS, puis blocs tagués (`4A 01 01` = JIANT).
- `TRACK_STEP` (30) : piste, index, puis n, 4 notes, time (0 NOTE, 1 TIE, 2 REST), flags (1 accent, 2 slide), vel. Ignoré pendant une chaîne de song (`chain_busy`), la réponse renvoie alors la valeur en place.
- `TRACK_PARAM` (31) et `SET` (3) passent par `motion_capture` : si la piste est armée en enregistrement, la modification est enregistrée comme automation.
- `PRESET` (8) agit sur la piste sélectionnée (`TRACK` pour sélectionner). Program Change sur le canal d'une piste : charge le n+1-ième son de la liste PRESETS. Program Change canal 16 : 0..3 section A..D à la mesure suivante, 16..23 projet 1..8 (à l'arrêt seulement).
- `BACKUP_LIST` arrête le transport. Les écritures flash de l'éditeur arrêtent le transport (`ed_flash_stop`).
- **Horloge** : global CLOCK (id 2) = INT, USB ou TRS. Changer CLOCK arrête le séquenceur. En USB, Start (FA) remet au pas zéro, la machine estime le tempo toutes les 6 impulsions (40 à 240 BPM), et **s'arrête si aucune impulsion pendant 500 ms** (`events_block`). Risque direct : un onglet Chrome caché qui bride ses minuteries.
- MIDI OUT (menu) sur CLOCK ou ALL avec horloge INT : la machine envoie 24 impulsions par noire, même à l'arrêt.
- **Autosave** (`project.c`) : jamais pendant la lecture ; seulement transport arrêté, aucune note ni touche, 10 s sans changement, au plus une écriture par minute, en alternance sur deux secteurs (`0xE5000` / `0xE6000`). Une radio qui joue n'écrit donc pas en flash.
- Bluetooth MIDI (V10.13 beta) : notes, CC, program change, clock. **Pas de SysEx** : le protocole éditeur reste USB.
- Ids fixes utilisés par la sonde (vérifiés par `DESC` à la connexion) : piste LEVEL 0, LEN 29, MUTE 40 ; globaux BPM 0, CLOCK 2, DJ FILT 17.

## Les quatre questions de la sonde

| # | Question | Ce qui en dépend |
| --- | --- | --- |
| 1 | `TRACK_STEP` en lecture hors chaîne : accepté ? sans glitch ? combien de temps pour réécrire une piste ? | Les transitions piste par piste |
| 2 | Changement de son (`PRESET`, Program Change), fondu de niveau, balayage DJ FILTER en lecture : clics ? escaliers ? | La qualité des transitions |
| 3 | L'app comme horloge maître : rampes de tempo suivies ? arrêt si l'onglet est caché ? | App maître ou suiveuse |
| 4 | Chrome Android : SysEx autorisé en USB ? | Version téléphone complète ou dégradée |

## 2026-11-01 : sonde testée contre le simulateur (`?sim=1&fast=1`, Chromium headless)

- Tests 1 à 3 déroulés sans erreur, état du faux FM-1 identique avant et après (restauration complète).
- Liste blanche vérifiée : bloqués update `F0 22 24 35 7F`, soft key `7D`, handshake OTA, PROJECT, UP_PUT, BACKUP_LIST, BACKUP_PUT, MENU_SET, SONG start, SET d'un paramètre de piste, SET G_ENGSEL, TRACK_PARAM hors LEVEL, notes, CC. Autorisés : SET BPM, TRACK_PARAM LEVEL.
- Rien de cela ne dit comment réagit la vraie machine.

## Résultats sur la vraie machine

### 2026-11-01, passage 1 : JIANT V10.9, Chrome 156 Windows

Observé :

- Connexion OK : port `FM-1`, **SysEx autorisé**, INFO en 5,2 ms. `JIANT V10.9`, 6 pistes, NSTEP 64, P_COUNT 123, **G_COUNT 72**, P_E0 115. Moteurs : ANALOG, PHASE, LOFI, VOICE, WHEEL, **STRING** (8), DRUM, NOISE, FM6, **ADD** (13), ANIMAL.
- Les ids utilisés par la sonde sont confirmés par DESC sur cette version (LEVEL, LEN, MUTE, BPM, CLOCK, DJ FILT).
- BPM 125, CLOCK INT. Pistes : DRUM, FM6, ANALOG, ANALOG, WHEEL, NOISE, aucune armée.
- Les tests 1, 2 et 3 se sont tous arrêtés au contrôle préalable : `SONG` (requête) indiquait une chaîne en lecture. **Aucune écriture envoyée.**
- Un « Glitch entendu » noté à 7,1 s, alors qu'aucun test ne tournait. LaDague jouait un son sur la machine pendant le test. La sonde n'avait envoyé que des lectures (INFO, DESC, GET, TRACK, SONG requête) : le glitch ne vient pas d'une écriture. Une simple lecture SysEx pendant le jeu peut-elle s'entendre ? À surveiller au prochain passage.

Lu dans le code de V10.9 (commit `f46764d`, branche `codex/add15-private`, publiée comme installeur V10.9 par `11c4bdc`) :

- V10.9 n'est pas `main` (ligne 0.9.18) : c'est une branche à part, avec 72 globaux et les moteurs STRING et ADD. **Toujours lire cette source pour la version installée**, pas `main`.
- Format de la réponse `SONG` inchangé (op, rc, count, running, row, remaining) : la chaîne tournait vraiment.
- Les morceaux de GEN en 2 à 4 parties sont arrangés dans ARRANGE, et **PLAY joue la song**. SAVE maintenu + D5 bascule LOOP / SONG.
- Pendant une chaîne, seuls les pas, LEN, DIV, SWING, GATE et MOTION sont figés. Sons, niveaux, filtres et DJ FILTER restent modifiables.

Corrections de la sonde après ce passage :

- Détection du tag JIANT : un bloc de INFO (`4D 01 64 01`) a plus d'octets que sa longueur annoncée, ce qui décalait la lecture. La sonde cherche maintenant la séquence `4A 01 01`. À revérifier sur la machine.
- Seul le test 1 exige le mode LOOP, avec la consigne SAVE + D5 affichée. Les tests 2 et 3 tournent aussi en mode SONG.

Conséquence pour le design : une radio qui réécrit les patterns doit faire tourner la machine en LOOP et porter l'arrangement elle-même. En mode SONG, elle peut seulement faire évoluer les sons, le mix et les filtres.

### 2026-11-01, passage 2 : JIANT V10.9, Chrome 156 Windows, mode LOOP

Observé :

- Tag JIANT détecté (correction validée). Ids confirmés par DESC.
- **Test 1 non concluant** : piste 4 (ANALOG) choisie, LEN 32, **aucun pas avec des notes**. Aucune écriture de transposition n'est partie (0 acceptée, 0 ignorée). À refaire sur une piste mélodique.
- **Débit des écritures, la vraie découverte** :
  - lectures (`TRACK_STEP`, `GET`, `DESC`, `TRACK_PARAM` sans valeur) : environ 3 ms chacune ;
  - `PRESET` (écriture) : 3 à 4,5 ms ;
  - `TRACK_STEP` en écriture : **médiane 100 ms, max 104 ms** ; réécrire 32 pas prend 2,9 s ;
  - `TRACK_PARAM` en écriture (fondu de niveau) : environ 65 ms (122 messages en 12 s, pauses de 33 ms comprises) ;
  - `SET` du DJ FILTER : environ 45 ms (91 messages en 10,3 s, pauses de 66 ms comprises).
  Hypothèse à vérifier : la réponse aux écritures de pas et de paramètres attend une image de l'écran (`ui.force`), alors que `PRESET` ne l'attend pas. Peut-être aggravé par MENU > LARGE (animations, V10.9).
- **Program Change** sur le canal 1 (piste DRUM) : la piste passe en **ANALOG preset 1**. Le numéro de PC indexe la liste PRESETS globale de la machine (tous les moteurs à la suite), pas les presets du moteur courant. Il faut construire la table PC vers (moteur, preset) dans l'ordre de la machine.
- Restauration OK : « 19 paramètres corrigés » (le PRESET d'origine ne restitue pas tes réglages, la restauration paramètre par paramètre les remet).
- Glitchs notés à 111,96 s (2 s après la fin du test 2 et sa restauration) et à 137,3 s (pendant la descente du fondu de niveau, second passage du test 2). Sur ce second : fondu à environ 10 pas par seconde, escalier probable.
- Test 3 (horloge) non lancé.

Lu dans le code de V10.9 (`firmware/src/midi_control.c`) :

- Carte CC fixe (MENU > CONTROL > MIDI MAP sur FACTORY) : 7 LEVEL, 10 PAN, 74 brillance du moteur, 71 résonance du moteur, 102 coupure du filtre post, 103 sa résonance, 104 DIST, 5 GLIDE, 72 REL, 73 ATK, 75 DEC, 91 REV, 93 CHOR, 94 DLY, 16 à 23 les huit valeurs du moteur (E1 à E8).
- Les CC passent par la file MIDI du séquenceur (`events_block`), pas par l'éditeur SysEx. Ils devraient être bien plus rapides : **fondus et filtres par CC, SysEx réservé aux pas et aux sons**. À mesurer.
- Un CC passe aussi par `motion_capture` : même règle que le SysEx, ne rien envoyer si une piste est armée.

### 2026-11-01, passage 3 : JIANT V10.9, Chrome 156 Windows, mode LOOP

Rapporté par LaDague, sans journal joint :

- **Test 1 OK** : les pas réécrits en lecture s'entendent (transposition d'une octave), restauration correcte.
- **Test 3 OK** : JIANT suit l'horloge envoyée par l'app (CLOCK USB), y compris les rampes de tempo et la phase onglet caché.
- Tests 2 et 3 réécoutés : fonctionnent.

Chiffres manquants pour ce passage (latences du test 1, pire trou de minuterie onglet caché du test 3) : à récupérer dans le JSON si besoin.

Conclusion de la sonde : le design « radio qui mue » est faisable sur V10.9 en mode LOOP, avec l'app comme horloge maître. Restent à mesurer (brief Claude Code) : CC contre SysEx pour les fondus, clics objectifs dans l'audio, table des Program Change.

## 2026-11-01 : gen.c compilé (`app/gen/jiant-gen.mjs`, JIANT V10.26)

Compilé sur la machine de LaDague (emsdk 6.0.13, Windows) par `gen/build-gen.ps1`, depuis le commit firmware `5db7ffc` (V10.26, la version de la machine). Les commits « Public: » du dépôt JIANT portent un autre arbre (`felucca.c` y dit v0.9.18) : ne pas les prendre.

Corrections nécessaires, sans toucher au code de JIANT :

- `tests/ui_test.c` appelle encore `mutate_poll` et `mut_sid`, retirés avec MUTATE en V10.6. gcc accepte la déclaration implicite, clang (emcc) la refuse : bouchons dans `gen/host_fix.h`, inclus de force. Ces tests ne servent pas au générateur.
- `ui_test.c` définit `FELUCCA_VERSION` à « TEST » : le script lit la version dans `felucca.c` et la passe à `gen_export.c`.
- Pillow sous Windows n'a pas libraqm, que `gen_aa_font.py` exige pour l'option OpenType `tnum` : `gen/py_noraqm.py` l'ignore. Seuls les pixels de la police de l'interface changent.
- `<stdarg.h>` manquait dans `gen_export.c`.

Vérifié hors machine (Node 24 et Chrome 156 headless) :

1. **Format** : `gen_piece(2, 421, 30, 50, 30, 1)` donne un JSON valide, 6 pistes, `pCount` 123, chaque pas 13 entiers, 24 globaux. 132 morceaux (43 genres et EXPLORE, TRACKS 4 et 6, énergie 0 à 100) tous valides, le plus long 14,5 Ko (tampon 96 Ko).
2. **Déterminisme** : deux appels identiques donnent le même JSON, y compris après d'autres appels entre les deux.
3. **Fidélité au harnais de JIANT** (pas encore à la machine) : `tests/gen_dump.c`, compilé tel quel, et l'export JSON comparés pas à pas (notes, liaisons, silences, frappes et accents des 8 lanes, BPM, SWING, pistes coupées) sur 18 morceaux : aucun écart. Contrôle : avec une seed décalée, 18 morceaux sur 18 diffèrent.
4. **V10.9 et V10.26** : `gen.c`, `gen_tables.c` et `song_dice.c` sont identiques entre les deux. 528 morceaux comparés, tous identiques. Les favoris enregistrés en V10.9 redonnent le même morceau.
5. **Pile** : 64 Ko suffisent (contrôle de débordement actif sur les 132 morceaux) ; le module en réserve 1 Mo.
6. **Dans l'app** (`?sim=1&fast=1`) : ligne « Générateur : JIANT V10.26 (gen.c compilé), 43 genres. », un morceau DUB TECHNO joué et ses 6 pistes écrites (51 à 59 paramètres, 64 pas chacune), aucune erreur JS. Le simulateur se présente encore en V10.9, d'où un avertissement de version propre au simulateur.

Ajout à l'export : `"mute": true` sur une piste dont le rôle ne joue pas (GEN la laisse vide, `gen_dump` l'affiche « off ») et sur les pistes 5 et 6 en TRACKS 4 (la machine ne les fait pas sonner, GEN y écrit parfois).

**Débit, estimé** depuis le générateur (pas mesuré sur la machine) : d'un morceau au suivant du même genre, environ 120 paramètres et 180 pas différents (2,6 sons changés) ; entre deux genres, environ 160 paramètres et 290 pas (4,6 sons). Aux vitesses mesurées (55 ms par paramètre, 100 ms par pas), environ 24 s d'écriture par transition dans un genre, 38 s entre genres, 47 s au pire. Chiffre approché : après un `PRESET`, l'app compare aux paramètres du nouveau son, pas à ceux du morceau précédent. Le journal de l'app donne les vrais nombres par piste.

Reste à observer sur la machine (vérification 3 du brief) : GEN (HOME + SELECT), DEEP HOUSE, seed 421, ENERGY 30, **FORM LOOP** (la machine démarre en PARTS), COMPLEX 50, HUMAN 30, SWING AUTO (les défauts), MENU › TRACKS 6, après avoir sauvegardé sa musique. Attendu (`node reference/JIANT/build/host/gen_dump.js 2 421 30 0`) : 122 BPM, SWING 35, LA dorien, Bm7 Em7 Am9 Am6 ; T1 DRUM son DRUM-X, T2 ANALOG son SUB BASS, T3 FM6 son TINE EP (accords à 4 sons), T4 à T6 sans notes ; 64 pas par piste.

### 2026-11-02, pourquoi une écriture prend 100 ms (lu dans le code, pas mesuré)

- `editor.c` : chaque écriture (`TRACK_STEP`, `TRACK_PARAM`, `SET`) pose `ui.force = 1`. Les lectures, non.
- `main.c` : la boucle traite une trame SysEx, puis `ui_draw()`, qui redessine tout l'écran quand `ui.force` est posé (de l'ordre de 85 à 100 ms sur l'écran 240x240). Les lectures sont servies dans l'attente entre deux images (`ed_service()` dans la boucle de 15 ms), d'où leurs 3 ms.
- `usb.c` : une seule trame SysEx en attente (`sx_frame`, `sx_ready`). Envoyer plusieurs écritures sans attendre les réponses les perdrait : pas de pipeline possible côté app.
- `ui_draw.c` : écran éteint par MENU > DISPLAY > SCREEN OFF, rien n'est dessiné. Hypothèse à mesurer : écran éteint, une écriture tomberait vers 15 ms.
- Côté firmware, une écriture de pas en lot, ou un rafraîchissement limité à la zone touchée, accélérerait tout. À proposer à Juan Jiant, pas à faire nous-mêmes.
- Côté app (v0.5.1) : les pistes s'écrivent l'une après l'autre dans l'ordre d'entrée. Avant, elles partaient en parallèle et leurs messages se mêlaient dans la file : la première piste n'était prête qu'avec la dernière (34 s contre 12 s sur le simulateur à vitesse réelle, PLAY immédiat).
