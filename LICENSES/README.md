# Licences des parties tierces

FM-1 Radio est sous GPL-3.0 (`../LICENSE`), parce que `app/gen/jiant-gen.mjs` contient le code de JIANT (GPL-3.0-only).

Source correspondante (GPL-3.0, section 6) : `app/gen/jiant-gen.mjs` est compilé depuis le dépôt public de JIANT, https://github.com/juanjiant-bit/JIANT, commit `5db7ffc` (V10.26, branche `codex/add15-private`), avec l'enveloppe et le script de `../gen/`. Copie de sauvegarde du même commit : https://github.com/LaDauges/JIANT (fork). Recompiler : `../gen/README.md`.

Ce fichier compilé embarque tout le harnais hôte de JIANT (`tests/ui_test.c`), donc aussi des parties qui gardent leur propre licence (détail dans `reference/JIANT/LICENSING.md`) :

| Partie | Licence | Texte |
| --- | --- | --- |
| msfa (Google, Pascal Gauthier), le moteur FM6 (`fm6_core.c`) | Apache-2.0 | `Apache-2.0-msfa.txt` |
| CMU Pronouncing Dictionary, les mots anglais de VOICE (`sing.c`) | BSD-2-Clause | `BSD-2-Clause-CMUdict.txt` |
| Polices Chakra Petch, Inter Tight, Michroma, rastérisées dans l'interface | SIL OFL 1.1 | `OFL-*.txt` |
| Police d'icônes Fukiai (Hügelton Instruments), rastérisée | MIT | `MIT-Fukiai.txt` |

Le site publié sert aussi deux polices, hébergées avec lui (`site/assets/fonts/`) :

| Partie | Licence | Texte |
| --- | --- | --- |
| Inter Tight (titres) | SIL OFL 1.1 | `OFL-InterTight.txt` |
| DM Mono (texte) | SIL OFL 1.1 | `OFL-DMMono.txt` |
