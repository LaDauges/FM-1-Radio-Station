# Le moteur de mix

Code : `radio()` et `playPiece()` dans `app/index.html`. Tout se décide à la limite d'une phrase (4 mesures), sur l'horloge de la machine.

## Arc d'un morceau

Tiré de la seed et de l'énergie, la durée choisie dans l'app fixe le nombre de phrases (une phrase = 16 temps). Les phases marquées d'une étoile s'allongent pour remplir la durée.

| Arc | Énergie | Phases (en phrases) |
| --- | --- | --- |
| lent | < 30, ou 30 à 65 | intro 3, montée 2, sommet 5*, respiration 2, descente 3 |
| vague | < 65 | intro 2, sommet 3*, respiration 2, sommet 3*, respiration 1, descente 2 |
| classique | ≥ 30 | intro 2, montée 1, sommet 4*, respiration 2, montée 1, sommet 4*, descente 2 |
| double sommet | ≥ 65 | intro 1, montée 2, sommet 3*, respiration 1, montée 2, sommet 4*, descente 2 |

## Phases

- **Intro** : une des cinq recettes, une entrée par phrase. Elle n'est jamais choisie pour démarrer sur la piste qui sert de pont.
  - *nappe* : PAD (réverb +45, chorus +25), TEX, ARP (delay +35), BASS.
  - *rythme filtré* : DRUM, BASS, ARP, sous le DJ FILTER qui s'ouvre de -42 à -8.
  - *basse d'abord* : BASS (DIST +12), DRUM, PAD.
  - *écho* : LEAD (delay +50, réverb +40), ARP, PAD.
  - *percussions* : DRUM (réverb +25), TEX, ARP, filtre de -24 à 0.
- **Montée** : entrent les voix qui manquent, sauf DRUM, BASS et LEAD (gardés pour le sommet). Delay et réverb montent sur tout ce qui n'est pas le rythme. Sur la dernière phrase, le DJ FILTER monte en passe-haut (+28 à +48 selon l'énergie). Si l'énergie est d'au moins 35, le rythme et la basse se taisent la dernière mesure.
- **Sommet** : le filtre se rouvre d'un coup, tout entre (TEX une fois sur deux), effets ramenés à la base du morceau, DIST sur la basse et le lead selon l'énergie. Toutes les 4 phrases, un geste au hasard : une voix se retire une phrase, un lancer de delay sur une voix, le rythme coupé la dernière mesure, ou le filtre maître qui respire.
- **Respiration** : le rythme sort, la basse aussi s'il reste des voix mélodiques. PAD (réverb +50, chorus +30), LEAD (delay +40, réverb +35), ARP (delay +35), TEX (réverb +40). FEEDBK du delay +22 et SIZE de la réverb +25 (globaux), filtre vers -14.
- **Descente** : le morceau suivant est choisi avec son intro. Une piste qui joue reste comme **pont** : le rythme de préférence, ou la nappe si la nouvelle intro commence par le rythme. Les autres sortent, réverb et delay montent sur le pont. Chaque piste libérée reçoit aussitôt le nouveau morceau, coupée. Le tempo glisse sur la dernière phrase.
- Le nouveau morceau démarre son intro pendant que le pont joue encore. À sa deuxième phrase, le pont se coupe et sa piste reçoit le nouveau contenu.

## Morceau suivant, tout de suite

Un clic sur « Morceau suivant » met un morceau en route : il arrive après la descente, à la fin de la phase en cours. Le bouton devient alors « Tout de suite → ». Un second clic (ou un double clic) coupe la phrase en cours à la mesure suivante, fait sortir d'un coup toutes les pistes sauf le pont, et le nouveau morceau entre à la mesure d'après. Ses pistes entrent à mesure qu'elles sont écrites ; le pont tient la musique pendant ce temps.

## Tu joues, la radio attend

Une touche ou un réglage changé à la main (notifications WATCH) : pendant 30 s, aucun geste de mix ni rampe d'effet, puis la radio reprend sur une limite de phrase. Si tu joues encore quand vient la descente, ou si « Rester sur ce morceau » est actif, le morceau repart pour une respiration, une montée et un sommet.

## Coût

Chaque geste est une écriture (mute : une ; rampe d'effet : un cran par demi-mesure, 8 crans sur une phrase). Un sommet coûte quelques dizaines d'écritures, une descente écrit le morceau suivant (paramètres et pas qui diffèrent), en tâche de fond.

## À régler à l'oreille

Les valeurs ci-dessus sont des premiers jets : profondeur des effets par rôle, longueur des phases, fréquence des gestes, seuil d'énergie de la coupure avant le sommet.
