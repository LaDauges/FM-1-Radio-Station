# Compiler le générateur de JIANT pour FM-1 Radio

Comment produire `app/gen/jiant-gen.mjs`, le générateur de JIANT compilé en WebAssembly, et vérifier qu'il donne les mêmes morceaux que la machine.

**État (2026-11-01)** : fait. `app/gen/jiant-gen.mjs` est compilé depuis JIANT V10.26 et vérifié hors machine (résultats dans `docs/probe-log.md`). Reste la vérification 3 sur la machine.

## But

Produire `app/gen/jiant-gen.mjs` : `gen.c` de JIANT compilé en WebAssembly, dans la version installée sur la machine, chargé par `app/index.html`. Sans ce fichier, l'app tourne avec son générateur de secours.

## Fichiers

- `gen_export.c` : enveloppe Emscripten. Inclut le harnais hôte de JIANT (`tests/ui_test.c`, comme `tests/gen_dump.c`), règle `gp` (genre, seed, énergie, complexité, humain, FORM LOOP), appelle `gen_go()`, sérialise `trk[]` et les globaux en JSON.
- `build-gen.ps1` : clone JIANT dans `reference/JIANT`, se place sur le commit de la version demandée (`-Version`, V10.26 par défaut), génère les en-têtes `build/gen` (les mêmes scripts que `tools/build.py generate()`), compile `gen_dump` pour contrôle (en natif si un compilateur C est présent, sinon pour Node), puis `jiant-gen.mjs` avec `emcc`.
- `host_fix.h` : bouchons pour deux fonctions MUTATE retirées du firmware mais encore appelées par `tests/ui_test.c` (clang refuse ce que gcc tolère).
- `py_noraqm.py` : lance `gen_aa_font.py` quand Pillow n'a pas libraqm (cas des wheels Windows).

Règle : ne jamais modifier le code de JIANT dans `reference/`, seulement l'enveloppe et ces fichiers.

## Recompiler

1. emsdk installé dans `%USERPROFILE%\emsdk` (https://emscripten.org/docs/getting_started/downloads.html) : le script l'active seul. Ailleurs, l'activer avant (`emsdk_env.ps1`).
2. Python 3 (`py`) avec Pillow et fontTools : `py -m pip install --user pillow fonttools`.
3. `.\gen\build-gen.ps1` depuis le dossier `FM-1 Radio`. Autre version : `-Version V10.9`. Autre dossier de sortie : `-Out <dossier>`.
4. Servir le dossier (`py -m http.server 8000`) et ouvrir http://localhost:8000/app/?sim=1 : la ligne « Générateur » doit afficher `JIANT V10.26 (gen.c compilé), 43 genres`.

**Nouvelle version de JIANT sur la machine** : ajouter son commit dans `$Commits` (le commit du firmware dont `firmware/src/felucca.c` porte la version, pas un commit « Public: »), recompiler, refaire les vérifications. Le script refuse un commit dont `felucca.c` ne dit pas la version demandée.

## Vérifications (à consigner dans `docs/probe-log.md`)

1. **Format** : `gen_piece(2, 421, 30, 50, 30, 1)` renvoie un JSON valide de 6 pistes, `pCount` 123, chaque pas a 13 nombres (voir `docs/format-morceau.md`). Fait.
2. **Déterminisme** : deux appels identiques donnent le même JSON, y compris après d'autres appels entre les deux. Fait.
3. **Fidélité à la machine** : sur le FM-1, GEN (HOME + SELECT) avec DEEP HOUSE, seed 421, ENERGY 30, FORM LOOP, puis lire les pistes avec la sonde ou en Python (TRACK_DUMP, TRACK_STEP) et comparer au JSON. Si ça diffère, chercher pourquoi (réglages COMPLEX, HUMAN, SWING, pages DRUMS BASS CHORDS ARP du GEN, MENU › TRACKS 4 ou 6) avant de conclure. Attention, sur la machine, GEN écrit dans la musique courante : sauvegarde d'abord. **À faire.** Fidélité au harnais de JIANT (`gen_dump`) : vérifiée, aucun écart. Résultat attendu sur la machine : `node reference/JIANT/build/host/gen_dump.js 2 421 30 0`.
4. **Débit** : nombre de paramètres et de pas qui diffèrent d'un morceau à l'autre (le log de l'app l'affiche par piste). À 50 à 100 ms par écriture, il fixe la durée réelle d'une transition. Estimé hors machine (environ 24 à 38 s), à mesurer sur la machine.

## Pièges connus

- `FELUCCA_VERSION` : `ui_test.c` le définit à « TEST ». Le script lit la vraie version dans `felucca.c` et la passe (`-DJIANT_VERSION=V10.26`, sans guillemets, mise en chaîne dans `gen_export.c`) pour que l'app ne signale pas d'écart de version.
- `gs.role[k]` : 0 DRUM, 1 BASS, 2 PAD, 3 LEAD, 4 ARP, 5 TEX (ordre de `RLN` dans `tests/gen_dump.c`). L'app s'en sert pour l'ordre d'entrée des pistes.
- `mute` : posé sur une piste dont le rôle ne joue pas (vide) et sur les pistes 5 et 6 en TRACKS 4.
- Les automations que GEN pose (`motion_set`, ouvertures de filtre) ne sont pas exportées : la commande MOTION reste interdite par la liste blanche.
- Les patches FM6 vivent dans `fm6_patch[]`, hors des paramètres de piste. `gen.c` n'y touche pas (vérifié : aucun usage).
- La pile d'Emscripten (64 Ko par défaut) déborde en silence sur les données statiques en `-O2` : le module en réserve 1 Mo (64 Ko suffisent, vérifié avec le contrôle de débordement).
- PowerShell 5.1 : un message sur stderr d'un programme devient une erreur sous `$ErrorActionPreference = "Stop"`. Le script vérifie les codes de sortie lui-même (`Run`).
- Le WASM embarque tout le harnais : msfa (Apache-2.0), CMUdict (BSD-2-Clause), polices OFL et Fukiai (MIT). Leurs textes sont dans `../LICENSES/`.
