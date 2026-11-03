# FM-1 Radio

A generative background radio for the **M-VAVE FM-1** running the **[JIANT FM](https://github.com/juanjiant-bit/JIANT)** firmware.

The web app writes the music, the FM-1 plays it with its own engines. Pick one of 43 styles, press PLAY on the machine and get back to work: each tune builds, peaks, breathes and hands over to the next one, with a track bridging the two. The machine keeps the clock, so you can play along at any time.

- Runs in **Chrome or Edge** (Windows, macOS, Linux, ChromeOS) and **Chrome on Android**, over Web MIDI. Not on iPhone or iPad.
- Needs an FM-1 with **JIANT FM V10.9 or later** (tested on V10.26) and a USB data cable.
- Writes in RAM only, through a whitelist of JIANT editor commands: no firmware or project commands, ever.
- English, French, German, Dutch.

## How it works

The tunes come from GEN, JIANT's own generator (`gen.c`), compiled to WebAssembly: a tune is a style, an energy and a seed, and the same three values always give the same tune. The radio adds the arrangement (an arc per tune), the mix (the FM-1's distortion, chorus, delay, reverb and DJ filter) and the transitions. No AI.

## Develop

```sh
py -m http.server 8000          # or: python3 -m http.server 8000
# Chrome: http://localhost:8000/app/?sim=1   (simulated FM-1, add &fast=1 to speed it up)
node tools/build-site.mjs       # builds the published site into dist/
node server/node.mjs            # serves dist/ like production (headers, CSP) + the live counter, http://localhost:8080
```

`app/index.html` is the app, `app/i18n.js` holds every text and the HTML templates shared with the build. Technical notes (in French) are in `docs/`: the JIANT editor protocol as measured on the machine (`probe-log.md`), the mix engine (`mix.md`) and the tune format (`format-morceau.md`).

## Deploy

Build with `node tools/build-site.mjs` (output `dist`). The site is static except for the live counter (`/api/live`, how many FM-1 are on air right now). Two ways to run it, both tested:

- **Cloudflare Workers** (production): `wrangler.jsonc` serves `dist/` as static assets and the counter from a Durable Object (`server/cloudflare.mjs`). `npx wrangler dev` locally, `npx wrangler deploy` to publish; the build runs first.
- **Any Node host**: `node server/node.mjs` serves `dist/` with its headers and redirects, plus the counter in memory (one instance). No dependencies.

The counter is anonymous: a random id kept in page memory, no cookie, no storage, forgotten 2 minutes after the radio stops.

## Credits and license

The generator is **JIANT FM** by Juan Ignacio Antonucci (GPL-3.0), a fork of **Felucca** by Leo Kuroshita / Hügelton Instruments. FM-1 Radio is free software under the **GPL-3.0** (`LICENSE`); third-party parts and fonts are listed in `LICENSES/`.

FM-1 Radio is an independent community project, not affiliated with M-VAVE.

Contact: [contact@fm1-radio.com](mailto:contact@fm1-radio.com)
