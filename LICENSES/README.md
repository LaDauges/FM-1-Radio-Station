# Licences des parties tierces

FM-1 Radio est sous GPL-3.0 (`../LICENSE`), parce que `app/gen/jiant-gen.mjs` contient le code de JIANT (GPL-3.0-only).

Ce fichier compilé embarque tout le harnais hôte de JIANT (`tests/ui_test.c`), donc aussi des parties qui gardent leur propre licence (détail dans `reference/JIANT/LICENSING.md`) :

| Partie | Licence | Texte |
| --- | --- | --- |
| msfa (Google, Pascal Gauthier), le moteur FM6 (`fm6_core.c`) | Apache-2.0 | `Apache-2.0-msfa.txt` |
| CMU Pronouncing Dictionary, les mots anglais de VOICE (`sing.c`) | BSD-2-Clause | `BSD-2-Clause-CMUdict.txt` |
| Polices Chakra Petch, Inter Tight, Michroma, rastérisées dans l'interface | SIL OFL 1.1 | `OFL-*.txt` |
| Police d'icônes Fukiai (Hügelton Instruments), rastérisée | MIT | `MIT-Fukiai.txt` |
