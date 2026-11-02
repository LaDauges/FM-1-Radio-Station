# Format d'un morceau

Ce que produit un générateur (gen.c compilé ou générateur de secours) et ce que l'app écrit dans le FM-1.

```json
{
  "version": "JIANT V10.26",
  "genre": 2, "genreName": "DEEP HOUSE",
  "seed": 421, "energy": 30, "complex": 50, "human": 30,
  "bpm": 122, "pCount": 123,
  "globals": { "1": 20, "9": 70 },
  "tracks": [
    { "role": 0, "eng": 10, "preset": 3, "p": [123 valeurs], "len": 16, "steps": [[13 nombres], ...] }
  ]
}
```

- `genre` : 1 à 43 pour `GENRE[genre-1]` de `gen_tables.c`, 44 pour EXPLORE.
- `globals` : id de global JIANT vers valeur. L'app n'envoie que ceux dont le label, lu par DESC sur la machine, figure dans sa liste (SWING, effets, DUCK, CLIP, PUNCH...). Jamais CLOCK, MIDI, ROUTE, SLOT, LOAD, SAVE, ENG.
- `tracks[k]` : la piste k de la machine.
  - `role` : 0 DRUM, 1 BASS, 2 PAD, 3 LEAD, 4 ARP, 5 TEX.
  - `eng`, `preset` : envoyés par `PRESET` (moteur et son), sur la piste sélectionnée.
  - `p` : les 123 paramètres de piste (V10.9 comme V10.26, `pCount`), dans l'ordre de `core.h`. L'app n'écrit que ceux qui diffèrent de la machine (`TRACK_PARAM`), jamais MUTE (id 40), qu'elle pilote elle-même. Le générateur de secours donne `pSet` (quelques ids seulement) à la place.
  - `mute` (facultatif) : la piste ne doit pas jouer. Le gen.c compilé le pose sur une piste dont le rôle ne joue pas dans ce morceau (ses pas sont vides) et sur les pistes 5 et 6 en TRACKS 4.
  - `len`, `steps` : chaque pas au format d'écriture de `TRACK_STEP` : `n, note0, note1, note2, note3, time (0 NOTE, 1 TIE, 2 REST), flags (1 accent, 2 slide), vel, hits bas 7 bits, accents bas 7 bits, bits hauts (bit 0 : hit 8, bit 1 : accent 8), chance 0..100, ratchet 1..4`. Lanes DRUM : bit 0 BD, 1 SD, 2 CP, 3 CH, 4 OH, 5 TM, 6 RS, 7 CB. L'app n'écrit que les pas qui diffèrent.

Un favori garde `genre`, `seed`, `energy`, `complex`, `human` et `version` : avec le même générateur, il redonne le même morceau.
