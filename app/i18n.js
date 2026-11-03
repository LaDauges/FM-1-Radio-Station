"use strict";
/* =========================================================================================================
 * FM-1 Radio : les textes (une entrée par langue), les familles de styles et les gabarits HTML partagés
 * entre l'app (app/index.html) et le build du site (tools/build-site.mjs, qui pré-rend chaque page).
 * Les chaînes sous setup, page, guide, creditsH, footH, kofiAir et kofiStop peuvent contenir du HTML : elles viennent d'ici, jamais de l'utilisateur.
 * Les mots de la machine (HOME, SAVE, MIDI OUT, CLOCK...) restent en anglais : ils sont écrits sur le FM-1.
 * Jamais de tiret cadratin.
 * ========================================================================================================= */
const LINKS = {
  jiant: "https://github.com/juanjiant-bit/JIANT",
  hub: "https://thefirmwarehub.com/#fw-jiant",           // la fiche JIANT FM sur The Firmware Hub (installation depuis le navigateur)
  src: "https://github.com/LaDauges/FM-1-Radio-Station",
  kofi: "https://ko-fi.com/Q8U529ZL7N",                  // un simple lien, pas le widget Ko-fi (script tiers, Google Fonts, document.write)
};

/* les styles, rangés par famille (le classement est le nôtre, pas celui de JIANT) ; energy : l'énergie de départ */
const FAMILIES = [
  { key: "house", energy: 40, g: ["HOUSE", "DEEP HOUSE", "MICRO HOUSE", "TECH HOUSE", "ACID HOUSE", "DISCO", "ITALO", "UK GARAGE"] },
  { key: "techno", energy: 50, g: ["TECHNO", "DETROIT", "DUB TECHNO", "HARD TECHNO", "HYPNOTIC", "TRANCE", "ELECTRO", "EBM"] },
  { key: "synth", energy: 45, g: ["SYNTH POP", "DARKWAVE", "MINIMAL SYNTH", "MAN MACHINE", "MOTORIK"] },
  { key: "guitar", energy: 50, g: ["POST PUNK", "TRIBAL PUNK", "INDIE", "SHOEGAZE", "POST ROCK"] },
  { key: "groove", energy: 40, g: ["FUNK", "BOOM BAP", "TRAP", "AFROBEAT", "JAZZ", "BOSSA"] },
  { key: "bass", energy: 50, g: ["DUBSTEP", "BREAKS", "DRUM & BASS", "DUB", "STEPPERS", "BROKEN", "IDM"] },
  { key: "calm", energy: 20, g: ["AMBIENT", "NEO CLASSIC", "IMPRESSION", "SOUNDTRACK"] },
];

const I18N = {
  /* ======================================================================================= anglais */
  en: {
    langName: "English",
    brand: "FM-1 RADIO", onAir: "ON AIR", offAir: "OFF AIR", waiting: "WAITING FOR PLAY", by: "broadcast by", soon: "Soon",
    kicker: "Generative radio for the M-VAVE FM-1 on JIANT firmware",
    plugTitle: "Plug in your FM-1", plugIntro: "Seven checks, about two minutes. The radio verifies what it can by itself; the rest happens on the machine.",
    connect: "Connect", reconnect: "Reconnect", start: "Start the radio", restoreMine: "Put my music back",
    sWait: "waiting", sPort: "FM-1 PORT FOUND", sNoClock: "NOTHING RECEIVED", sClock: "RECEIVED", sAppClock: "app clock (USB)", sArmed: "A TRACK IS ARMED",
    sMidi: "WEB MIDI OK", sNoMidi: "NO WEB MIDI", sIOS: "NOT ON IPHONE OR IPAD", sTodo: "to do", sDone: "DONE", sNoArmed: "NONE ARMED", sSong: "SONG MODE", sOther: "ANOTHER PAGE",
    listening: "Listening for the clock... turns black by itself.", clockOk: "Clock received: you're good.", notConnected: "Connect the FM-1 first.",
    stepN: "Step {i} / {n}", markDone: "Done, next step", undoDone: "Not done yet", more: "Full setup guide",
    where: { browser: "In the browser", machine: "On the machine" },
    setup: {
      browser: { name: "Chrome or Edge", title: "A browser that speaks MIDI", where: "browser",
        why: "The radio talks to the FM-1 over Web MIDI. Chrome and Edge have it on Windows, macOS, Linux and ChromeOS, and so does Chrome on Android. Safari, and every browser on iPhone and iPad, don't.",
        steps: [["Chrome or Edge", "open this page there"], ["Android", "Chrome, with a USB OTG adapter or a USB-C cable"]],
        note: "Firefox is not tested yet." },
      connect: { name: "USB and permission", title: "Connect", where: "browser",
        why: "Plug the FM-1 in with a USB data cable, then press Connect. The browser asks to control your MIDI devices: allow it.",
        steps: [["USB data cable", "a charge-only cable shows no port"], ["no hub", "straight into the computer or phone"], ["close", "DAWs and other pages using the FM-1"], ["Connect", "then Allow in the browser's prompt"]],
        note: "One page at a time: two FM-1 Radio tabs would mix up the machine's replies." },
      firmware: { name: "JIANT firmware", title: "JIANT on the machine", where: "machine",
        why: "The radio speaks the editor protocol of <a href='{jiant}'>JIANT FM</a>, the custom firmware by Juan Ignacio Antonucci. On the stock firmware or another firmware, it can't do anything.",
        steps: [["JIANT FM", "V10.9 or later, tested on V10.26"], ["quick install", "with The Firmware Hub", "hub"]],
        note: "The radio reads the version when you connect and refuses a version it doesn't know." },
      save: { name: "Your music saved", title: "Save your music", where: "machine",
        why: "The radio writes its tunes into the tracks, in RAM. JIANT saves by itself 10 s after the machine stops, so the radio's music could end up as your autosave. Save first. The radio also keeps a copy and offers to put it back when you stop.",
        steps: [["SAVE", "saves your current project"]],
        note: "" },
      loop: { name: "LOOP mode", title: "LOOP mode", where: "machine",
        why: "In SONG mode the machine plays its arrangement and the patterns are frozen. The radio needs LOOP: it carries the arrangement itself.",
        steps: [["STOP", "the machine must be stopped"], ["hold SAVE + D5", "switches between LOOP and SONG"]],
        note: "Checked again when you press PLAY: in SONG mode, the radio stops and tells you." },
      clock: { name: "MIDI OUT on CLOCK", title: "MIDI OUT to CLOCK", where: "machine",
        why: "The radio follows your machine's clock: you keep the tempo, TAP and all your settings.",
        steps: [["HOLD HOME 1 s", "opens the MENU"], ["ALGORITHM", "to the CONTROL tab"], ["SELECT", "to the MIDI OUT row"], ["any knob", "from KEYS to CLOCK"], ["HOME", "closes and saves"]],
        note: "Not ALL: with ALL, the machine also sends its sequencer's notes, and the radio would think you're playing." },
      armed: { name: "No armed track", title: "No armed track", where: "machine",
        why: "On a track armed for recording, every change the radio makes would be recorded as automation. The radio checks it live and writes nothing while a track is armed.",
        steps: [["disarm", "every track armed for recording"]],
        note: "" },
      ready: { title: "All set", why: "Pick a style below and start the radio, then press PLAY on the machine. Stop it whenever you want: the machine keeps playing." },
    },
    tracks: "Tracks", schedule: "Schedule", keptTitle: "Kept", startStyle: "Starting style", hintStart: "pick one, or let the radio surprise you",
    idxTitle: "All {n} styles", hintAir: "on air in color · tap one to queue it, tap again to cancel", surprise: "Surprise me",
    toNight: "Switch to the signal theme", toDay: "Switch to the day theme", langLabel: "Language",
    fam: { house: "House & disco", techno: "Techno", synth: "Synth & wave", guitar: "Guitars", groove: "Groove", bass: "Bass & breaks", calm: "Calm", other: "More" },
    next: "Next tune →", keep: "Keep", stay: "Stay here", resume: "Back to the radio", stop: "Stop",
    kofiAir: "<a href='{kofi}' target='_blank' rel='noopener'>Support on Ko-fi</a>",
    kofiStop: "Enjoyed the radio? <a href='{kofi}' target='_blank' rel='noopener'>Support it on Ko-fi</a>.",
    playing: "You're playing", playingText: "The radio keeps this tune and touches nothing. It picks up again 30 s after your last move.",
    holdingTitle: "Staying here", holdingText: "The radio keeps this tune until you hand it back.",
    meta: "{fam} · {bpm} BPM · energy {e}",
    phase: { intro: "intro", build: "build", peak: "peak", breakdown: "breathe", outro: "outro" },
    arcs: { classique: "classic", vague: "wave", lent: "slow", "double sommet": "double peak" },
    intros: { nappe: "pad", "rythme filtré": "filtered beat", "basse d'abord": "bass first", "écho": "echo", percussions: "percussion" },
    lane: { off: "off", on: "on", write: "writing", wait: "queued" },
    sched: { played: "played", now: "on air", next: "next", surprise: "surprise" },
    favEmpty: "Nothing yet. A tune is a style, an energy and a seed: it plays back identically.",
    play: "Play", copy: "Copy", remove: "Remove", fallbackTag: "fallback",
    settings: "Settings", energy: "Energy", duration: "Tune length", tracksSet: "Tracks", clock: "Clock",
    clkMachine: "the machine (you keep control)", clkApp: "the app (CLOCK USB)", keepMine: "keep a copy of my music to put it back at the end",
    logTitle: "Technical log",
    genJiant: "Generator: {v} (gen.c compiled), {n} genres.",
    genFallback: "Fallback generator: gen.c is not compiled yet (gen/build-gen.ps1). Tunes are simpler and don't match the machine's seeds.",
    creditsH: "Generator: <a href='{jiant}'>JIANT FM</a> by Juan Ignacio Antonucci (GPL-3.0), a fork of Felucca by Hügelton Instruments. FM-1 Radio is free software under GPL-3.0: <a href='{src}'>source code</a>. An independent community project, not affiliated with M-VAVE.",
    liveLabel: "FM-1 ON AIR", liveTitle: "FM-1 playing the radio right now", liveTitleMe: "FM-1 playing the radio right now, yours included",
    footH: "FM-1 Radio · GPL-3.0 · <a href='{guide}'>Setup guide</a> · <a href='{src}'>Source code</a> · <a href='{licenses}'>Licenses</a> · <a href='{kofi}' target='_blank' rel='noopener'>Support on Ko-fi</a>",
    noscript: "FM-1 Radio needs JavaScript and Web MIDI: open it in Chrome or Edge.",
    st: { reading: "Reading the music on the machine...", ready: "Ready.", usb: "Switching to the USB clock, tracks muted.",
      pressPlay: "Press PLAY on your machine (STOP then PLAY if it's already playing). The first tune is loading meanwhile.", loading: "Loading the first tune...", stoppedM: "Stopped on the machine: press PLAY to resume.",
      kept: "{name} kept.", arrives: "{name} comes after the outro.", queued: "Next: {name}, after the outro.", unqueued: "Cancelled: the radio stays on this style.",
      busyNext: "{name} is already on its way: pick again once it's on air.",
      handback: "The radio hands control back, the machine keeps playing.", restoring: "Your music is coming back...", restored: "Your music is back. Press PLAY on the machine.",
      otherPage: "Another FM-1 Radio page is connected to the FM-1: close it (replies get mixed up).", phase: "{phase}{i} · {arc} arc · intro {intro}",
      waitPlaying: "You're playing: the radio waits.", holding: "The radio stays on this tune.", playing: "On air." },
    err: { nomidi: "No Web MIDI here: use Chrome or Edge (not Safari).", sysex: "The browser refused MIDI access: allow it in the site settings, then Connect again.",
      noport: "No FM-1 port: data cable, no hub, close the other pages and DAWs.", nojiant: "{v}: JIANT not detected.",
      version: "Unsupported version (id {id}: expected {want}, read {got}).", armed: "A track is armed for recording: disarm it.",
      noclock: "No clock from the machine: set MENU › CONTROL › MIDI OUT to CLOCK (not ALL), or pick the app clock in Settings.",
      song: "The machine is in SONG mode: stop, hold SAVE and press D5 for LOOP, then start again." },
    page: {
      whatT: "A radio that plays on your FM-1",
      what: [
        "FM-1 Radio turns an <b>M-VAVE FM-1</b> running the <a href='{jiant}'>JIANT FM</a> firmware into an endless background radio. The web app writes the music, the FM-1 plays it with its own engines: the sound is the machine's, nothing is streamed.",
        "Pick a style, press PLAY on the machine and get back to work. Each tune builds, peaks, breathes and hands over to the next, with one track bridging the two, so the music never stops. From deep house and dub techno to shoegaze, boom bap, drum &amp; bass and ambient: 43 styles in seven families.",
      ],
      howT: "How it works",
      how: [
        ["JIANT's own generator.", "The app runs GEN, the generator of JIANT, compiled to WebAssembly. A tune is a style, an energy and a seed: the same three values always give the same tune."],
        ["An arc for every tune.", "Intro, build, peak, breathe, outro. Five ways to start a tune, and the FM-1's own effects (distortion, chorus, delay, reverb, DJ filter) moving on the beat."],
        ["Your machine keeps the clock.", "The radio follows the FM-1's MIDI clock. Tempo, TAP and effects stay yours: play along, and the radio waits until you're done."],
        ["Gentle with your FM-1.", "Everything is written in RAM over USB, through a short list of editor commands. The radio never sends firmware or project commands, and it can put your own music back when you stop."],
      ],
      needT: "What you need",
      need: [
        "An <b>M-VAVE FM-1</b> with <a href='{jiant}'>JIANT FM</a> V10.9 or later (tested on V10.26).",
        "A USB data cable.",
        "<b>Chrome or Edge</b> on Windows, macOS, Linux or ChromeOS, or <b>Chrome on Android</b> with an OTG adapter. Not on iPhone or iPad: Safari has no Web MIDI.",
        "Two minutes of setup on the machine: <a href='{guide}'>the setup guide</a>.",
      ],
      faqT: "Questions",
      faq: [
        ["Does it work without an FM-1?", "No. The app makes no sound: it writes the music into the machine, and the FM-1 plays it. You need an FM-1 running JIANT FM."],
        ["Will it change or erase my music?", "The radio writes into the tracks in RAM, never into saved projects. But JIANT saves by itself 10 s after the machine stops, so save your project before you start. The radio also keeps a copy of your music and offers to put it back at the end."],
        ["Can I play along?", "Yes. Turn a knob, play a key or change the tempo: the radio notices, keeps the current tune and waits 30 s after your last move. Stay here keeps a tune for as long as you want."],
        ["Can I find a tune again?", "Yes. Press Keep: the radio stores the style, energy and seed in your browser. The same three values give the same tune, note for note."],
        ["Why Chrome or Edge?", "The radio needs Web MIDI with SysEx, which Chrome and Edge support. Safari doesn't, on Mac, iPhone or iPad."],
        ["Does it work on a phone?", "On Android, yes: Chrome, plus an OTG adapter or a USB-C cable. The interface is made for small screens. Not on iPhone."],
        ["Is it free? What happens to my data?", "FM-1 Radio is free software under GPL-3.0, with no account and no cookie. Your settings and kept tunes stay in your browser. While the radio is on air, it sends an anonymous signal so the site can show how many FM-1 are on air: no name, nothing about your music, and it is forgotten 2 minutes after you stop."],
        ["Does it use AI?", "No. The tunes come from JIANT's generator (musical rules). The radio adds the arrangement and the mix."],
      ],
      creditsT: "Credits",
      credits: "The generator is <a href='{jiant}'>JIANT FM</a> by Juan Ignacio Antonucci (GPL-3.0), a fork of Felucca by Leo Kuroshita / Hügelton Instruments. FM-1 Radio is free software under GPL-3.0: <a href='{src}'>source code</a>, <a href='{licenses}'>licenses</a>. It is an independent community project, not affiliated with M-VAVE.",
      support: "The radio is free, with no ads and no account. If it keeps you company while you work, you can <a href='{kofi}' target='_blank' rel='noopener'>support it on Ko-fi</a>.",
    },
    guide: {
      h1: "Set up your FM-1",
      intro: "FM-1 Radio needs seven things before it can play on an M-VAVE FM-1 running JIANT FM. When you connect, the radio checks most of them by itself and shows you what's left. Here they all are, in the order you'll do them.",
      thenT: "Then",
      then: "Pick a starting style, press <b>Start the radio</b>, then <b>PLAY</b> on the machine. The first tune is written while you wait. Press <b>Stop</b> whenever you want: the machine keeps playing, and <b>Put my music back</b> restores your own.",
      open: "Open the radio",
      troubleT: "If something goes wrong",
      trouble: [
        ["No FM-1 port", "Use a USB data cable (a charge-only cable shows no port), plug the FM-1 in without a hub, and close the DAWs and other pages that use it. Then press Connect again."],
        ["The browser refused MIDI access", "Open the site settings (the icon left of the address), allow MIDI devices, reload and Connect."],
        ["No clock from the machine", "Set MENU › CONTROL › MIDI OUT to CLOCK, not ALL. Or choose the app clock in the radio's Settings: the app then sends the clock over USB."],
        ["The machine is in SONG mode", "Stop the machine, hold SAVE and press D5 to switch to LOOP, then start the radio again."],
        ["A track is armed", "Disarm recording on every track: otherwise the radio's changes would be recorded as automation, so it refuses to write."],
        ["Another page is connected", "Close the other FM-1 Radio tabs: two pages talking to the same FM-1 mix up its replies."],
      ],
    },
    seo: {
      home: { title: "FM-1 Radio · Generative radio for the M-VAVE FM-1 (JIANT)",
        desc: "Turn your M-VAVE FM-1 running JIANT FM into an endless background radio: 43 styles, smooth transitions, free and open source. Chrome, Edge and Android." },
      guide: { title: "Set up your M-VAVE FM-1 for FM-1 Radio · Setup guide",
        desc: "MIDI OUT on CLOCK, LOOP mode, saving your music, Web MIDI: the seven settings FM-1 Radio needs on an M-VAVE FM-1 running JIANT, step by step." },
      ogAlt: "FM-1 Radio: generative radio for the M-VAVE FM-1",
      appDesc: "A web app that turns the M-VAVE FM-1 synthesizer running the JIANT FM firmware into a generative background radio over Web MIDI.",
    },
  },

  /* ======================================================================================= français */
  fr: {
    langName: "Français",
    brand: "FM-1 RADIO", onAir: "EN DIRECT", offAir: "HORS ANTENNE", waiting: "EN ATTENTE DE PLAY", by: "émis par", soon: "Bientôt",
    kicker: "Radio générative pour le M-VAVE FM-1 sous firmware JIANT",
    plugTitle: "Branche ton FM-1", plugIntro: "Sept vérifications, deux minutes environ. La radio contrôle elle-même ce qu'elle peut ; le reste se fait sur la machine.",
    connect: "Connecter", reconnect: "Reconnecter", start: "Lancer la radio", restoreMine: "Remettre ma musique",
    sWait: "en attente", sPort: "PORT FM-1 TROUVÉ", sNoClock: "RIEN REÇU", sClock: "REÇUE", sAppClock: "horloge de l'app (USB)", sArmed: "UNE PISTE EST ARMÉE",
    sMidi: "WEB MIDI OK", sNoMidi: "PAS DE WEB MIDI", sIOS: "PAS SUR IPHONE NI IPAD", sTodo: "à faire", sDone: "FAIT", sNoArmed: "AUCUNE ARMÉE", sSong: "MODE SONG", sOther: "AUTRE PAGE",
    listening: "J'écoute l'horloge... ça passe au noir tout seul.", clockOk: "Horloge reçue : c'est bon.", notConnected: "Connecte d'abord le FM-1.",
    stepN: "Étape {i} / {n}", markDone: "Fait, étape suivante", undoDone: "Pas encore fait", more: "Le guide complet",
    where: { browser: "Dans le navigateur", machine: "Sur la machine" },
    setup: {
      browser: { name: "Chrome ou Edge", title: "Un navigateur qui parle MIDI", where: "browser",
        why: "La radio parle au FM-1 par Web MIDI. Chrome et Edge l'ont sous Windows, macOS, Linux et ChromeOS, tout comme Chrome sur Android. Safari, et tous les navigateurs sur iPhone et iPad, ne l'ont pas.",
        steps: [["Chrome ou Edge", "ouvre cette page dedans"], ["Android", "Chrome, avec un adaptateur USB OTG ou un câble USB-C"]],
        note: "Firefox n'est pas encore testé." },
      connect: { name: "USB et autorisation", title: "Connecter", where: "browser",
        why: "Branche le FM-1 avec un câble USB data, puis appuie sur Connecter. Le navigateur demande à contrôler tes appareils MIDI : autorise-le.",
        steps: [["câble USB data", "un câble de charge seule ne montre aucun port"], ["pas de hub", "directement sur l'ordi ou le téléphone"], ["ferme", "les DAW et les autres pages qui utilisent le FM-1"], ["Connecter", "puis Autoriser dans la fenêtre du navigateur"]],
        note: "Une page à la fois : deux onglets FM-1 Radio mélangeraient les réponses de la machine." },
      firmware: { name: "Firmware JIANT", title: "JIANT sur la machine", where: "machine",
        why: "La radio parle le protocole d'éditeur de <a href='{jiant}'>JIANT FM</a>, le firmware custom de Juan Ignacio Antonucci. Avec le firmware d'origine ou un autre firmware, elle ne peut rien faire.",
        steps: [["JIANT FM", "V10.9 ou plus récent, testé en V10.26"], ["installation rapide", "avec The Firmware Hub", "hub"]],
        note: "La radio lit la version à la connexion et refuse une version qu'elle ne connaît pas." },
      save: { name: "Ta musique sauvegardée", title: "Sauvegarde ta musique", where: "machine",
        why: "La radio écrit ses morceaux dans les pistes, en RAM. JIANT sauvegarde tout seul 10 s après l'arrêt de la machine : la musique de la radio pourrait devenir ta sauvegarde automatique. Sauvegarde d'abord. La radio garde aussi une copie et te propose de la remettre à l'arrêt.",
        steps: [["SAVE", "sauvegarde ton projet en cours"]],
        note: "" },
      loop: { name: "Mode LOOP", title: "Mode LOOP", where: "machine",
        why: "En mode SONG, la machine joue son arrangement et les patterns sont figés. La radio a besoin du mode LOOP : c'est elle qui porte l'arrangement.",
        steps: [["STOP", "la machine doit être arrêtée"], ["SAVE maintenu + D5", "bascule entre LOOP et SONG"]],
        note: "Revérifié quand tu appuies sur PLAY : en mode SONG, la radio s'arrête et te le dit." },
      clock: { name: "MIDI OUT sur CLOCK", title: "MIDI OUT sur CLOCK", where: "machine",
        why: "La radio suit l'horloge de ta machine : tu gardes le tempo, le TAP et tous tes réglages.",
        steps: [["HOME maintenu 1 s", "le MENU s'ouvre"], ["ALGORITHM", "jusqu'à l'onglet CONTROL"], ["SELECT", "jusqu'à la ligne MIDI OUT"], ["un potard", "de KEYS à CLOCK"], ["HOME", "ferme et enregistre"]],
        note: "Pas ALL : avec ALL, la machine envoie aussi les notes de son séquenceur, et la radio croirait que tu joues." },
      armed: { name: "Aucune piste armée", title: "Aucune piste armée", where: "machine",
        why: "Sur une piste armée en enregistrement, chaque changement de la radio serait enregistré comme automation. La radio le vérifie en direct et n'écrit rien tant qu'une piste est armée.",
        steps: [["désarme", "toute piste armée en enregistrement"]],
        note: "" },
      ready: { title: "Tout est prêt", why: "Choisis un style ci-dessous et lance la radio, puis appuie sur PLAY sur la machine. Arrête-la quand tu veux : la machine continue de jouer." },
    },
    tracks: "Pistes", schedule: "Grille", keptTitle: "Gardés", startStyle: "Style de départ", hintStart: "choisis-en un, ou laisse la radio te surprendre",
    idxTitle: "Les {n} styles", hintAir: "en couleur : à l'antenne · touche-en un pour le mettre à suivre, encore une fois pour annuler", surprise: "Surprends-moi",
    toNight: "Passer au thème signal", toDay: "Passer au thème jour", langLabel: "Langue",
    fam: { house: "House et disco", techno: "Techno", synth: "Synth et wave", guitar: "Guitares", groove: "Groove", bass: "Basses et breaks", calm: "Calme", other: "Autres" },
    next: "Morceau suivant →", keep: "Garder", stay: "Rester ici", resume: "Reprendre la radio", stop: "Arrêter",
    kofiAir: "<a href='{kofi}' target='_blank' rel='noopener'>Soutenir sur Ko-fi</a>",
    kofiStop: "La radio t'a plu ? <a href='{kofi}' target='_blank' rel='noopener'>Soutiens-la sur Ko-fi</a>.",
    playing: "Tu joues", playingText: "La radio garde ce morceau et ne touche plus à rien. Elle reprend 30 s après ton dernier geste.",
    holdingTitle: "On reste ici", holdingText: "La radio garde ce morceau jusqu'à ce que tu la relâches.",
    meta: "{fam} · {bpm} BPM · énergie {e}",
    phase: { intro: "intro", build: "montée", peak: "sommet", breakdown: "respiration", outro: "descente" },
    arcs: { classique: "classique", vague: "vague", lent: "lent", "double sommet": "double sommet" },
    intros: { nappe: "nappe", "rythme filtré": "rythme filtré", "basse d'abord": "basse d'abord", "écho": "écho", percussions: "percussions" },
    lane: { off: "coupé", on: "joue", write: "écriture", wait: "en attente" },
    sched: { played: "joué", now: "en cours", next: "à suivre", surprise: "surprise" },
    favEmpty: "Rien pour l'instant. Un morceau, c'est un style, une énergie et une seed : il se rejoue à l'identique.",
    play: "Jouer", copy: "Copier", remove: "Retirer", fallbackTag: "secours",
    settings: "Réglages", energy: "Énergie", duration: "Durée d'un morceau", tracksSet: "Pistes", clock: "Horloge",
    clkMachine: "la machine (tu gardes la main)", clkApp: "l'app (CLOCK USB)", keepMine: "garder une copie de ma musique pour la remettre à la fin",
    logTitle: "Journal technique",
    genJiant: "Générateur : {v} (gen.c compilé), {n} genres.",
    genFallback: "Générateur de secours : gen.c n'est pas encore compilé (gen/build-gen.ps1). Les morceaux sont plus simples et ne correspondent pas aux seeds de la machine.",
    creditsH: "Générateur : <a href='{jiant}'>JIANT FM</a> de Juan Ignacio Antonucci (GPL-3.0), fork de Felucca par Hügelton Instruments. FM-1 Radio est un logiciel libre sous GPL-3.0 : <a href='{src}'>code source</a>. Un projet communautaire indépendant, sans lien avec M-VAVE.",
    liveLabel: "FM-1 À L'ANTENNE", liveTitle: "FM-1 qui jouent la radio en ce moment", liveTitleMe: "FM-1 qui jouent la radio en ce moment, le tien compris",
    footH: "FM-1 Radio · GPL-3.0 · <a href='{guide}'>Guide de réglage</a> · <a href='{src}'>Code source</a> · <a href='{licenses}'>Licences</a> · <a href='{kofi}' target='_blank' rel='noopener'>Soutenir sur Ko-fi</a>",
    noscript: "FM-1 Radio a besoin de JavaScript et de Web MIDI : ouvre-la dans Chrome ou Edge.",
    st: { reading: "Lecture de la musique de la machine...", ready: "Prêt.", usb: "Passage en horloge USB, pistes coupées.",
      pressPlay: "Appuie sur PLAY sur ta machine (STOP puis PLAY si elle joue déjà). Le premier morceau se charge pendant ce temps.", loading: "Chargement du premier morceau...", stoppedM: "Arrêtée sur la machine : appuie sur PLAY pour reprendre.",
      kept: "{name} gardé.", arrives: "{name} arrive après la descente.", queued: "Ensuite : {name}, après la descente.", unqueued: "Annulé : la radio reste sur ce style.",
      busyNext: "{name} arrive déjà : choisis à nouveau quand il sera à l'antenne.",
      handback: "La radio te rend la main, la machine continue de jouer.", restoring: "Ta musique revient...", restored: "Ta musique est revenue. Appuie sur PLAY sur la machine.",
      otherPage: "Une autre page FM-1 Radio est connectée au FM-1 : ferme-la (les réponses se mélangent).", phase: "{phase}{i} · arc {arc} · intro {intro}",
      waitPlaying: "Tu joues : la radio attend.", holding: "La radio reste sur ce morceau.", playing: "En direct." },
    err: { nomidi: "Pas de Web MIDI ici : utilise Chrome ou Edge (pas Safari).", sysex: "Le navigateur a refusé l'accès MIDI : autorise-le dans les paramètres du site, puis reconnecte.",
      noport: "Aucun port FM-1 : câble data, pas de hub, ferme les autres pages et les DAW.", nojiant: "{v} : JIANT non détecté.",
      version: "Version non prise en charge (id {id} : attendu {want}, lu {got}).", armed: "Une piste est armée en enregistrement : désarme-la.",
      noclock: "Aucune horloge de la machine : règle MENU › CONTROL › MIDI OUT sur CLOCK (pas ALL), ou choisis l'horloge de l'app dans les réglages.",
      song: "La machine est en mode SONG : arrête, maintiens SAVE et appuie sur D5 pour LOOP, puis relance." },
    page: {
      whatT: "Une radio qui joue sur ton FM-1",
      what: [
        "FM-1 Radio transforme un <b>M-VAVE FM-1</b> sous firmware <a href='{jiant}'>JIANT FM</a> en radio de fond sans fin. L'app web écrit la musique, le FM-1 la joue avec ses propres moteurs : le son est celui de la machine, rien n'est diffusé en streaming.",
        "Choisis un style, appuie sur PLAY sur la machine et retourne travailler. Chaque morceau monte, culmine, respire et passe la main au suivant, avec une piste qui fait le pont entre les deux : la musique ne s'arrête jamais. De la deep house et la dub techno au shoegaze, au boom bap, à la drum &amp; bass et à l'ambient : 43 styles en sept familles.",
      ],
      howT: "Comment ça marche",
      how: [
        ["Le générateur de JIANT.", "L'app fait tourner GEN, le générateur de JIANT, compilé en WebAssembly. Un morceau, c'est un style, une énergie et une seed : les trois mêmes valeurs donnent toujours le même morceau."],
        ["Un arc pour chaque morceau.", "Intro, montée, sommet, respiration, descente. Cinq façons d'ouvrir un morceau, et les effets du FM-1 (distorsion, chorus, delay, réverb, DJ filter) qui bougent sur le temps."],
        ["Ta machine garde l'horloge.", "La radio suit l'horloge MIDI du FM-1. Le tempo, le TAP et les effets restent à toi : joue par-dessus, la radio attend que tu aies fini."],
        ["Douce avec ton FM-1.", "Tout s'écrit en RAM par USB, avec une courte liste de commandes d'éditeur. La radio n'envoie jamais de commande de firmware ou de projet, et peut remettre ta propre musique à l'arrêt."],
      ],
      needT: "Ce qu'il te faut",
      need: [
        "Un <b>M-VAVE FM-1</b> sous <a href='{jiant}'>JIANT FM</a> V10.9 ou plus récent (testé en V10.26).",
        "Un câble USB data.",
        "<b>Chrome ou Edge</b> sous Windows, macOS, Linux ou ChromeOS, ou <b>Chrome sur Android</b> avec un adaptateur OTG. Pas sur iPhone ni iPad : Safari n'a pas Web MIDI.",
        "Deux minutes de réglages sur la machine : <a href='{guide}'>le guide de réglage</a>.",
      ],
      faqT: "Questions",
      faq: [
        ["Ça marche sans FM-1 ?", "Non. L'app ne produit aucun son : elle écrit la musique dans la machine, et c'est le FM-1 qui la joue. Il te faut un FM-1 sous JIANT FM."],
        ["Est-ce que ça modifie ou efface ma musique ?", "La radio écrit dans les pistes en RAM, jamais dans les projets sauvegardés. Mais JIANT sauvegarde tout seul 10 s après l'arrêt de la machine : sauvegarde ton projet avant de commencer. La radio garde aussi une copie de ta musique et te propose de la remettre à la fin."],
        ["Je peux jouer par-dessus ?", "Oui. Tourne un potard, joue une touche ou change le tempo : la radio s'en rend compte, garde le morceau en cours et attend 30 s après ton dernier geste. Rester ici garde un morceau aussi longtemps que tu veux."],
        ["Je peux retrouver un morceau ?", "Oui. Appuie sur Garder : la radio note le style, l'énergie et la seed dans ton navigateur. Les trois mêmes valeurs redonnent le même morceau, note pour note."],
        ["Pourquoi Chrome ou Edge ?", "La radio a besoin de Web MIDI avec le SysEx, que Chrome et Edge prennent en charge. Safari non, ni sur Mac, ni sur iPhone ou iPad."],
        ["Ça marche sur un téléphone ?", "Sur Android, oui : Chrome, plus un adaptateur OTG ou un câble USB-C. L'interface est faite pour les petits écrans. Pas sur iPhone."],
        ["C'est gratuit ? Que deviennent mes données ?", "FM-1 Radio est un logiciel libre sous GPL-3.0, sans compte ni cookie. Tes réglages et tes morceaux gardés restent dans ton navigateur. Pendant que la radio est à l'antenne, elle envoie un signal anonyme pour que le site affiche combien de FM-1 sont à l'antenne : aucun nom, rien de ta musique, et c'est oublié 2 minutes après l'arrêt."],
        ["Il y a de l'IA ?", "Non. Les morceaux viennent du générateur de JIANT (des règles musicales). La radio ajoute l'arrangement et le mix."],
      ],
      creditsT: "Crédits",
      credits: "Le générateur est <a href='{jiant}'>JIANT FM</a> de Juan Ignacio Antonucci (GPL-3.0), fork de Felucca par Leo Kuroshita / Hügelton Instruments. FM-1 Radio est un logiciel libre sous GPL-3.0 : <a href='{src}'>code source</a>, <a href='{licenses}'>licences</a>. C'est un projet communautaire indépendant, sans lien avec M-VAVE.",
      support: "La radio est gratuite, sans pub ni compte. Si elle t'accompagne pendant que tu travailles, tu peux <a href='{kofi}' target='_blank' rel='noopener'>la soutenir sur Ko-fi</a>.",
    },
    guide: {
      h1: "Régler ton FM-1",
      intro: "FM-1 Radio a besoin de sept choses avant de jouer sur un M-VAVE FM-1 sous JIANT FM. À la connexion, la radio en vérifie elle-même la plupart et te montre ce qui reste. Les voici toutes, dans l'ordre où tu les feras.",
      thenT: "Ensuite",
      then: "Choisis un style de départ, appuie sur <b>Lancer la radio</b>, puis sur <b>PLAY</b> sur la machine. Le premier morceau s'écrit pendant que tu attends. Appuie sur <b>Arrêter</b> quand tu veux : la machine continue de jouer, et <b>Remettre ma musique</b> remet la tienne.",
      open: "Ouvrir la radio",
      troubleT: "Si quelque chose coince",
      trouble: [
        ["Aucun port FM-1", "Prends un câble USB data (un câble de charge seule ne montre aucun port), branche le FM-1 sans hub et ferme les DAW et les autres pages qui l'utilisent. Puis appuie de nouveau sur Connecter."],
        ["Le navigateur a refusé l'accès MIDI", "Ouvre les paramètres du site (l'icône à gauche de l'adresse), autorise les appareils MIDI, recharge et connecte."],
        ["Aucune horloge de la machine", "Règle MENU › CONTROL › MIDI OUT sur CLOCK, pas ALL. Ou choisis l'horloge de l'app dans les réglages de la radio : l'app envoie alors l'horloge par USB."],
        ["La machine est en mode SONG", "Arrête la machine, maintiens SAVE et appuie sur D5 pour passer en LOOP, puis relance la radio."],
        ["Une piste est armée", "Désarme l'enregistrement sur toutes les pistes : sinon les changements de la radio seraient enregistrés comme automation, donc elle refuse d'écrire."],
        ["Une autre page est connectée", "Ferme les autres onglets FM-1 Radio : deux pages qui parlent au même FM-1 mélangent ses réponses."],
      ],
    },
    seo: {
      home: { title: "FM-1 Radio · Radio générative pour le M-VAVE FM-1 (JIANT)",
        desc: "Transforme ton M-VAVE FM-1 sous JIANT FM en radio de fond sans fin : 43 styles, transitions fluides, gratuit et open source. Chrome, Edge et Android." },
      guide: { title: "Régler le M-VAVE FM-1 pour FM-1 Radio · Guide",
        desc: "MIDI OUT sur CLOCK, mode LOOP, sauvegarde de ta musique, Web MIDI : les sept réglages dont FM-1 Radio a besoin sur un M-VAVE FM-1 sous JIANT, pas à pas." },
      ogAlt: "FM-1 Radio : radio générative pour le M-VAVE FM-1",
      appDesc: "Une app web qui transforme le synthé M-VAVE FM-1 sous firmware JIANT FM en radio générative de fond, par Web MIDI.",
    },
  },

  /* ======================================================================================= allemand */
  de: {
    langName: "Deutsch",
    brand: "FM-1 RADIO", onAir: "ON AIR", offAir: "OFF AIR", waiting: "WARTET AUF PLAY", by: "gesendet von", soon: "Bald",
    kicker: "Generatives Radio für den M-VAVE FM-1 mit JIANT-Firmware",
    plugTitle: "Schließ deinen FM-1 an", plugIntro: "Sieben Checks, etwa zwei Minuten. Das Radio prüft selbst, was es kann; der Rest passiert an der Maschine.",
    connect: "Verbinden", reconnect: "Neu verbinden", start: "Radio starten", restoreMine: "Meine Musik zurück",
    sWait: "wartet", sPort: "FM-1-PORT GEFUNDEN", sNoClock: "NICHTS EMPFANGEN", sClock: "EMPFANGEN", sAppClock: "App-Clock (USB)", sArmed: "EINE SPUR IST SCHARF",
    sMidi: "WEB MIDI OK", sNoMidi: "KEIN WEB MIDI", sIOS: "NICHT AUF IPHONE ODER IPAD", sTodo: "zu tun", sDone: "ERLEDIGT", sNoArmed: "KEINE SCHARF", sSong: "SONG-MODUS", sOther: "ANDERE SEITE",
    listening: "Ich höre auf die Clock... wird von selbst schwarz.", clockOk: "Clock empfangen: alles gut.", notConnected: "Verbinde zuerst den FM-1.",
    stepN: "Schritt {i} / {n}", markDone: "Erledigt, weiter", undoDone: "Noch nicht erledigt", more: "Ganze Anleitung",
    where: { browser: "Im Browser", machine: "An der Maschine" },
    setup: {
      browser: { name: "Chrome oder Edge", title: "Ein Browser, der MIDI spricht", where: "browser",
        why: "Das Radio spricht über Web MIDI mit dem FM-1. Chrome und Edge können das unter Windows, macOS, Linux und ChromeOS, ebenso Chrome auf Android. Safari und alle Browser auf iPhone und iPad können es nicht.",
        steps: [["Chrome oder Edge", "öffne diese Seite dort"], ["Android", "Chrome, mit USB-OTG-Adapter oder USB-C-Kabel"]],
        note: "Firefox ist noch nicht getestet." },
      connect: { name: "USB und Erlaubnis", title: "Verbinden", where: "browser",
        why: "Schließ den FM-1 mit einem USB-Datenkabel an und drück auf Verbinden. Der Browser fragt, ob er deine MIDI-Geräte steuern darf: erlaube es.",
        steps: [["USB-Datenkabel", "ein reines Ladekabel zeigt keinen Port"], ["kein Hub", "direkt an Computer oder Handy"], ["schließen", "DAWs und andere Seiten, die den FM-1 nutzen"], ["Verbinden", "dann Zulassen im Browser-Dialog"]],
        note: "Immer nur eine Seite: Zwei FM-1-Radio-Tabs würden die Antworten der Maschine durcheinanderbringen." },
      firmware: { name: "JIANT-Firmware", title: "JIANT auf der Maschine", where: "machine",
        why: "Das Radio spricht das Editor-Protokoll von <a href='{jiant}'>JIANT FM</a>, der Custom-Firmware von Juan Ignacio Antonucci. Mit der Original-Firmware oder einer anderen Firmware kann es nichts tun.",
        steps: [["JIANT FM", "V10.9 oder neuer, getestet mit V10.26"], ["Schnellinstallation", "mit The Firmware Hub", "hub"]],
        note: "Das Radio liest beim Verbinden die Version und lehnt Versionen ab, die es nicht kennt." },
      save: { name: "Deine Musik gesichert", title: "Sichere deine Musik", where: "machine",
        why: "Das Radio schreibt seine Stücke in die Spuren, im RAM. JIANT speichert 10 s nach dem Stoppen der Maschine von selbst, also könnte die Musik des Radios zu deinem Autosave werden. Speichere vorher. Das Radio behält außerdem eine Kopie und bietet dir beim Stoppen an, sie zurückzuspielen.",
        steps: [["SAVE", "speichert dein aktuelles Projekt"]],
        note: "" },
      loop: { name: "LOOP-Modus", title: "LOOP-Modus", where: "machine",
        why: "Im SONG-Modus spielt die Maschine ihr Arrangement, und die Patterns sind eingefroren. Das Radio braucht LOOP: Es trägt das Arrangement selbst.",
        steps: [["STOP", "die Maschine muss gestoppt sein"], ["SAVE halten + D5", "wechselt zwischen LOOP und SONG"]],
        note: "Wird beim Drücken von PLAY erneut geprüft: Im SONG-Modus stoppt das Radio und sagt es dir." },
      clock: { name: "MIDI OUT auf CLOCK", title: "MIDI OUT auf CLOCK", where: "machine",
        why: "Das Radio folgt der Clock deiner Maschine: Tempo, TAP und alle Einstellungen bleiben bei dir.",
        steps: [["HOME 1 s halten", "öffnet das MENU"], ["ALGORITHM", "bis zum Tab CONTROL"], ["SELECT", "bis zur Zeile MIDI OUT"], ["ein Regler", "von KEYS auf CLOCK"], ["HOME", "schließt und speichert"]],
        note: "Nicht ALL: Mit ALL sendet die Maschine auch die Noten ihres Sequencers, und das Radio würde denken, dass du spielst." },
      armed: { name: "Keine Spur scharf", title: "Keine Spur scharf", where: "machine",
        why: "Auf einer aufnahmebereiten Spur würde jede Änderung des Radios als Automation aufgenommen. Das Radio prüft das live und schreibt nichts, solange eine Spur scharf ist.",
        steps: [["entschärfen", "jede aufnahmebereite Spur"]],
        note: "" },
      ready: { title: "Alles bereit", why: "Wähl unten einen Stil, starte das Radio und drück dann PLAY an der Maschine. Stopp es, wann du willst: Die Maschine spielt weiter." },
    },
    tracks: "Spuren", schedule: "Programm", keptTitle: "Gemerkt", startStyle: "Startstil", hintStart: "wähl einen oder lass dich vom Radio überraschen",
    idxTitle: "Alle {n} Stile", hintAir: "farbig: on air · tippe einen an, um ihn einzureihen, nochmal zum Abbrechen", surprise: "Überrasch mich",
    toNight: "Zum Signal-Theme wechseln", toDay: "Zum Tag-Theme wechseln", langLabel: "Sprache",
    fam: { house: "House & Disco", techno: "Techno", synth: "Synth & Wave", guitar: "Gitarren", groove: "Groove", bass: "Bass & Breaks", calm: "Ruhig", other: "Mehr" },
    next: "Nächstes Stück →", keep: "Merken", stay: "Hierbleiben", resume: "Zurück zum Radio", stop: "Stopp",
    kofiAir: "<a href='{kofi}' target='_blank' rel='noopener'>Auf Ko-fi unterstützen</a>",
    kofiStop: "Hat dir das Radio gefallen? <a href='{kofi}' target='_blank' rel='noopener'>Unterstütze es auf Ko-fi</a>.",
    playing: "Du spielst", playingText: "Das Radio behält dieses Stück und rührt nichts an. Es macht 30 s nach deiner letzten Bewegung weiter.",
    holdingTitle: "Wir bleiben hier", holdingText: "Das Radio behält dieses Stück, bis du es zurückgibst.",
    meta: "{fam} · {bpm} BPM · Energie {e}",
    phase: { intro: "Intro", build: "Aufbau", peak: "Höhepunkt", breakdown: "Atmen", outro: "Outro" },
    arcs: { classique: "klassisch", vague: "Welle", lent: "langsam", "double sommet": "Doppelgipfel" },
    intros: { nappe: "Pad", "rythme filtré": "gefilterter Beat", "basse d'abord": "Bass zuerst", "écho": "Echo", percussions: "Percussion" },
    lane: { off: "aus", on: "an", write: "schreibt", wait: "wartet" },
    sched: { played: "gespielt", now: "on air", next: "als Nächstes", surprise: "Überraschung" },
    favEmpty: "Noch nichts. Ein Stück ist ein Stil, eine Energie und ein Seed: Es spielt identisch wieder.",
    play: "Spielen", copy: "Kopieren", remove: "Entfernen", fallbackTag: "Ersatz",
    settings: "Einstellungen", energy: "Energie", duration: "Stücklänge", tracksSet: "Spuren", clock: "Clock",
    clkMachine: "die Maschine (du behältst die Kontrolle)", clkApp: "die App (CLOCK USB)", keepMine: "eine Kopie meiner Musik behalten, um sie am Ende zurückzuspielen",
    logTitle: "Technisches Protokoll",
    genJiant: "Generator: {v} (gen.c kompiliert), {n} Genres.",
    genFallback: "Ersatz-Generator: gen.c ist noch nicht kompiliert (gen/build-gen.ps1). Die Stücke sind einfacher und passen nicht zu den Seeds der Maschine.",
    creditsH: "Generator: <a href='{jiant}'>JIANT FM</a> von Juan Ignacio Antonucci (GPL-3.0), ein Fork von Felucca von Hügelton Instruments. FM-1 Radio ist freie Software unter GPL-3.0: <a href='{src}'>Quellcode</a>. Ein unabhängiges Community-Projekt, nicht mit M-VAVE verbunden.",
    liveLabel: "FM-1 ON AIR", liveTitle: "FM-1, die gerade das Radio spielen", liveTitleMe: "FM-1, die gerade das Radio spielen, deiner mitgezählt",
    footH: "FM-1 Radio · GPL-3.0 · <a href='{guide}'>Anleitung</a> · <a href='{src}'>Quellcode</a> · <a href='{licenses}'>Lizenzen</a> · <a href='{kofi}' target='_blank' rel='noopener'>Auf Ko-fi unterstützen</a>",
    noscript: "FM-1 Radio braucht JavaScript und Web MIDI: Öffne es in Chrome oder Edge.",
    st: { reading: "Lese die Musik der Maschine...", ready: "Bereit.", usb: "Wechsel auf die USB-Clock, Spuren stumm.",
      pressPlay: "Drück PLAY an deiner Maschine (STOP, dann PLAY, wenn sie schon spielt). Das erste Stück lädt in der Zwischenzeit.", loading: "Lade das erste Stück...", stoppedM: "An der Maschine gestoppt: drück PLAY, um weiterzumachen.",
      kept: "{name} gemerkt.", arrives: "{name} kommt nach dem Outro.", queued: "Als Nächstes: {name}, nach dem Outro.", unqueued: "Abgebrochen: Das Radio bleibt bei diesem Stil.",
      busyNext: "{name} ist schon unterwegs: wähl nochmal, sobald es on air ist.",
      handback: "Das Radio gibt die Kontrolle zurück, die Maschine spielt weiter.", restoring: "Deine Musik kommt zurück...", restored: "Deine Musik ist zurück. Drück PLAY an der Maschine.",
      otherPage: "Eine andere FM-1-Radio-Seite ist mit dem FM-1 verbunden: schließ sie (die Antworten geraten durcheinander).", phase: "{phase}{i} · Bogen {arc} · Intro {intro}",
      waitPlaying: "Du spielst: Das Radio wartet.", holding: "Das Radio bleibt bei diesem Stück.", playing: "On air." },
    err: { nomidi: "Hier gibt es kein Web MIDI: nimm Chrome oder Edge (nicht Safari).", sysex: "Der Browser hat den MIDI-Zugriff verweigert: erlaube ihn in den Website-Einstellungen und verbinde neu.",
      noport: "Kein FM-1-Port: Datenkabel, kein Hub, schließ die anderen Seiten und DAWs.", nojiant: "{v}: JIANT nicht erkannt.",
      version: "Nicht unterstützte Version (ID {id}: erwartet {want}, gelesen {got}).", armed: "Eine Spur ist aufnahmebereit: entschärfe sie.",
      noclock: "Keine Clock von der Maschine: stell MENU › CONTROL › MIDI OUT auf CLOCK (nicht ALL) oder wähl in den Einstellungen die App-Clock.",
      song: "Die Maschine ist im SONG-Modus: stoppen, SAVE halten und D5 drücken für LOOP, dann neu starten." },
    page: {
      whatT: "Ein Radio, das auf deinem FM-1 spielt",
      what: [
        "FM-1 Radio macht aus einem <b>M-VAVE FM-1</b> mit der Firmware <a href='{jiant}'>JIANT FM</a> ein endloses Hintergrundradio. Die Web-App schreibt die Musik, der FM-1 spielt sie mit seinen eigenen Engines: Der Klang kommt von der Maschine, nichts wird gestreamt.",
        "Wähl einen Stil, drück PLAY an der Maschine und arbeite weiter. Jedes Stück baut sich auf, erreicht seinen Höhepunkt, atmet und übergibt an das nächste, mit einer Spur als Brücke zwischen beiden: Die Musik hört nie auf. Von Deep House und Dub Techno bis Shoegaze, Boom Bap, Drum &amp; Bass und Ambient: 43 Stile in sieben Familien.",
      ],
      howT: "So funktioniert es",
      how: [
        ["JIANTs eigener Generator.", "Die App führt GEN aus, den Generator von JIANT, kompiliert zu WebAssembly. Ein Stück ist ein Stil, eine Energie und ein Seed: Dieselben drei Werte ergeben immer dasselbe Stück."],
        ["Ein Bogen für jedes Stück.", "Intro, Aufbau, Höhepunkt, Atmen, Outro. Fünf Arten, ein Stück zu beginnen, und die Effekte des FM-1 (Distortion, Chorus, Delay, Reverb, DJ-Filter) im Takt bewegt."],
        ["Deine Maschine behält die Clock.", "Das Radio folgt der MIDI-Clock des FM-1. Tempo, TAP und Effekte bleiben bei dir: Spiel mit, und das Radio wartet, bis du fertig bist."],
        ["Schonend für deinen FM-1.", "Alles wird per USB in den RAM geschrieben, über eine kurze Liste von Editor-Befehlen. Das Radio sendet nie Firmware- oder Projektbefehle und kann beim Stoppen deine eigene Musik zurückspielen."],
      ],
      needT: "Was du brauchst",
      need: [
        "Einen <b>M-VAVE FM-1</b> mit <a href='{jiant}'>JIANT FM</a> V10.9 oder neuer (getestet mit V10.26).",
        "Ein USB-Datenkabel.",
        "<b>Chrome oder Edge</b> unter Windows, macOS, Linux oder ChromeOS, oder <b>Chrome auf Android</b> mit OTG-Adapter. Nicht auf iPhone oder iPad: Safari hat kein Web MIDI.",
        "Zwei Minuten Einrichtung an der Maschine: <a href='{guide}'>die Anleitung</a>.",
      ],
      faqT: "Fragen",
      faq: [
        ["Funktioniert es ohne FM-1?", "Nein. Die App macht keinen Ton: Sie schreibt die Musik in die Maschine, und der FM-1 spielt sie. Du brauchst einen FM-1 mit JIANT FM."],
        ["Verändert oder löscht es meine Musik?", "Das Radio schreibt im RAM in die Spuren, nie in gespeicherte Projekte. Aber JIANT speichert 10 s nach dem Stoppen der Maschine von selbst, also speichere dein Projekt, bevor du anfängst. Das Radio behält außerdem eine Kopie deiner Musik und bietet am Ende an, sie zurückzuspielen."],
        ["Kann ich mitspielen?", "Ja. Dreh an einem Regler, spiel eine Taste oder änder das Tempo: Das Radio merkt es, behält das aktuelle Stück und wartet 30 s nach deiner letzten Bewegung. Hierbleiben hält ein Stück, so lange du willst."],
        ["Kann ich ein Stück wiederfinden?", "Ja. Drück Merken: Das Radio speichert Stil, Energie und Seed in deinem Browser. Dieselben drei Werte ergeben dasselbe Stück, Note für Note."],
        ["Warum Chrome oder Edge?", "Das Radio braucht Web MIDI mit SysEx, das Chrome und Edge unterstützen. Safari nicht, weder auf dem Mac noch auf iPhone oder iPad."],
        ["Funktioniert es auf dem Handy?", "Auf Android ja: Chrome plus OTG-Adapter oder USB-C-Kabel. Die Oberfläche ist für kleine Bildschirme gemacht. Nicht auf dem iPhone."],
        ["Ist es kostenlos? Was passiert mit meinen Daten?", "FM-1 Radio ist freie Software unter GPL-3.0, ohne Konto und ohne Cookie. Deine Einstellungen und gemerkten Stücke bleiben in deinem Browser. Solange das Radio on air ist, sendet es ein anonymes Signal, damit die Seite zeigen kann, wie viele FM-1 gerade on air sind: kein Name, nichts von deiner Musik, und 2 Minuten nach dem Stoppen ist es vergessen."],
        ["Steckt KI dahinter?", "Nein. Die Stücke kommen aus JIANTs Generator (musikalische Regeln). Das Radio fügt Arrangement und Mix hinzu."],
      ],
      creditsT: "Credits",
      credits: "Der Generator ist <a href='{jiant}'>JIANT FM</a> von Juan Ignacio Antonucci (GPL-3.0), ein Fork von Felucca von Leo Kuroshita / Hügelton Instruments. FM-1 Radio ist freie Software unter GPL-3.0: <a href='{src}'>Quellcode</a>, <a href='{licenses}'>Lizenzen</a>. Es ist ein unabhängiges Community-Projekt, nicht mit M-VAVE verbunden.",
      support: "Das Radio ist kostenlos, ohne Werbung und ohne Konto. Wenn es dich bei der Arbeit begleitet, kannst du es <a href='{kofi}' target='_blank' rel='noopener'>auf Ko-fi unterstützen</a>.",
    },
    guide: {
      h1: "Richte deinen FM-1 ein",
      intro: "FM-1 Radio braucht sieben Dinge, bevor es auf einem M-VAVE FM-1 mit JIANT FM spielen kann. Beim Verbinden prüft das Radio die meisten selbst und zeigt dir, was noch fehlt. Hier sind alle, in der Reihenfolge, in der du sie erledigst.",
      thenT: "Danach",
      then: "Wähl einen Startstil, drück <b>Radio starten</b> und dann <b>PLAY</b> an der Maschine. Das erste Stück wird geschrieben, während du wartest. Drück <b>Stopp</b>, wann du willst: Die Maschine spielt weiter, und <b>Meine Musik zurück</b> stellt deine eigene wieder her.",
      open: "Radio öffnen",
      troubleT: "Wenn etwas nicht klappt",
      trouble: [
        ["Kein FM-1-Port", "Nimm ein USB-Datenkabel (ein reines Ladekabel zeigt keinen Port), schließ den FM-1 ohne Hub an und schließ DAWs und andere Seiten, die ihn nutzen. Dann drück erneut auf Verbinden."],
        ["Der Browser hat den MIDI-Zugriff verweigert", "Öffne die Website-Einstellungen (das Symbol links neben der Adresse), erlaube MIDI-Geräte, lade neu und verbinde."],
        ["Keine Clock von der Maschine", "Stell MENU › CONTROL › MIDI OUT auf CLOCK, nicht ALL. Oder wähl in den Einstellungen des Radios die App-Clock: Die App sendet die Clock dann per USB."],
        ["Die Maschine ist im SONG-Modus", "Stopp die Maschine, halte SAVE und drück D5, um auf LOOP zu wechseln, dann starte das Radio neu."],
        ["Eine Spur ist scharf", "Entschärfe die Aufnahme auf allen Spuren: Sonst würden die Änderungen des Radios als Automation aufgenommen, deshalb schreibt es nichts."],
        ["Eine andere Seite ist verbunden", "Schließ die anderen FM-1-Radio-Tabs: Zwei Seiten, die mit demselben FM-1 sprechen, bringen seine Antworten durcheinander."],
      ],
    },
    seo: {
      home: { title: "FM-1 Radio · Generatives Radio für den M-VAVE FM-1 (JIANT)",
        desc: "Mach deinen M-VAVE FM-1 mit JIANT FM zum endlosen Hintergrundradio: 43 Stile, fließende Übergänge, kostenlos und Open Source. Chrome, Edge und Android." },
      guide: { title: "M-VAVE FM-1 für FM-1 Radio einrichten · Anleitung",
        desc: "MIDI OUT auf CLOCK, LOOP-Modus, Musik sichern, Web MIDI: die sieben Einstellungen, die FM-1 Radio auf einem M-VAVE FM-1 mit JIANT braucht, Schritt für Schritt." },
      ogAlt: "FM-1 Radio: generatives Radio für den M-VAVE FM-1",
      appDesc: "Eine Web-App, die den Synthesizer M-VAVE FM-1 mit der Firmware JIANT FM über Web MIDI zum generativen Hintergrundradio macht.",
    },
  },

  /* ======================================================================================= néerlandais */
  nl: {
    langName: "Nederlands",
    brand: "FM-1 RADIO", onAir: "ON AIR", offAir: "OFF AIR", waiting: "WACHT OP PLAY", by: "uitgezonden door", soon: "Binnenkort",
    kicker: "Generatieve radio voor de M-VAVE FM-1 met JIANT-firmware",
    plugTitle: "Sluit je FM-1 aan", plugIntro: "Zeven checks, ongeveer twee minuten. De radio controleert zelf wat hij kan; de rest gebeurt op het apparaat.",
    connect: "Verbinden", reconnect: "Opnieuw verbinden", start: "Radio starten", restoreMine: "Mijn muziek terug",
    sWait: "wacht", sPort: "FM-1-POORT GEVONDEN", sNoClock: "NIETS ONTVANGEN", sClock: "ONTVANGEN", sAppClock: "app-clock (USB)", sArmed: "EEN TRACK STAAT OP OPNAME",
    sMidi: "WEB MIDI OK", sNoMidi: "GEEN WEB MIDI", sIOS: "NIET OP IPHONE OF IPAD", sTodo: "te doen", sDone: "KLAAR", sNoArmed: "GEEN OP OPNAME", sSong: "SONG-MODUS", sOther: "ANDERE PAGINA",
    listening: "Ik luister naar de clock... wordt vanzelf zwart.", clockOk: "Clock ontvangen: alles goed.", notConnected: "Verbind eerst de FM-1.",
    stepN: "Stap {i} / {n}", markDone: "Klaar, volgende stap", undoDone: "Nog niet klaar", more: "Volledige handleiding",
    where: { browser: "In de browser", machine: "Op het apparaat" },
    setup: {
      browser: { name: "Chrome of Edge", title: "Een browser die MIDI spreekt", where: "browser",
        why: "De radio praat via Web MIDI met de FM-1. Chrome en Edge hebben dat op Windows, macOS, Linux en ChromeOS, en Chrome op Android ook. Safari en alle browsers op iPhone en iPad hebben het niet.",
        steps: [["Chrome of Edge", "open deze pagina daarin"], ["Android", "Chrome, met een USB-OTG-adapter of een USB-C-kabel"]],
        note: "Firefox is nog niet getest." },
      connect: { name: "USB en toestemming", title: "Verbinden", where: "browser",
        why: "Sluit de FM-1 aan met een USB-datakabel en druk op Verbinden. De browser vraagt of hij je MIDI-apparaten mag bedienen: sta het toe.",
        steps: [["USB-datakabel", "een kabel die alleen laadt toont geen poort"], ["geen hub", "rechtstreeks in de computer of telefoon"], ["sluit", "DAW's en andere pagina's die de FM-1 gebruiken"], ["Verbinden", "dan Toestaan in het venster van de browser"]],
        note: "Eén pagina tegelijk: twee FM-1 Radio-tabbladen zouden de antwoorden van het apparaat door elkaar halen." },
      firmware: { name: "JIANT-firmware", title: "JIANT op het apparaat", where: "machine",
        why: "De radio spreekt het editorprotocol van <a href='{jiant}'>JIANT FM</a>, de custom firmware van Juan Ignacio Antonucci. Met de originele firmware of een andere firmware kan hij niets.",
        steps: [["JIANT FM", "V10.9 of nieuwer, getest met V10.26"], ["snelle installatie", "met The Firmware Hub", "hub"]],
        note: "De radio leest de versie bij het verbinden en weigert een versie die hij niet kent." },
      save: { name: "Je muziek bewaard", title: "Bewaar je muziek", where: "machine",
        why: "De radio schrijft zijn nummers in de tracks, in het RAM. JIANT slaat 10 s nadat het apparaat stopt vanzelf op, dus de muziek van de radio kan je autosave worden. Sla eerst op. De radio houdt ook een kopie bij en biedt aan die terug te zetten als je stopt.",
        steps: [["SAVE", "slaat je huidige project op"]],
        note: "" },
      loop: { name: "LOOP-modus", title: "LOOP-modus", where: "machine",
        why: "In SONG-modus speelt het apparaat zijn arrangement en liggen de patterns vast. De radio heeft LOOP nodig: hij draagt het arrangement zelf.",
        steps: [["STOP", "het apparaat moet gestopt zijn"], ["SAVE ingedrukt + D5", "wisselt tussen LOOP en SONG"]],
        note: "Opnieuw gecontroleerd als je op PLAY drukt: in SONG-modus stopt de radio en zegt het je." },
      clock: { name: "MIDI OUT op CLOCK", title: "MIDI OUT op CLOCK", where: "machine",
        why: "De radio volgt de clock van je apparaat: tempo, TAP en al je instellingen blijven van jou.",
        steps: [["HOME 1 s ingedrukt", "opent het MENU"], ["ALGORITHM", "naar het tabblad CONTROL"], ["SELECT", "naar de regel MIDI OUT"], ["een knop", "van KEYS naar CLOCK"], ["HOME", "sluit en bewaart"]],
        note: "Niet ALL: met ALL stuurt het apparaat ook de noten van zijn sequencer, en de radio zou denken dat je speelt." },
      armed: { name: "Geen track op opname", title: "Geen track op opname", where: "machine",
        why: "Op een track die op opname staat, zou elke wijziging van de radio als automation worden opgenomen. De radio controleert het live en schrijft niets zolang er een track op opname staat.",
        steps: [["uitschakelen", "elke track die op opname staat"]],
        note: "" },
      ready: { title: "Alles klaar", why: "Kies hieronder een stijl, start de radio en druk dan op PLAY op het apparaat. Stop wanneer je wilt: het apparaat blijft spelen." },
    },
    tracks: "Tracks", schedule: "Programma", keptTitle: "Bewaard", startStyle: "Startstijl", hintStart: "kies er een, of laat je verrassen door de radio",
    idxTitle: "Alle {n} stijlen", hintAir: "in kleur: on air · tik er een aan om hem in de rij te zetten, nog eens om te annuleren", surprise: "Verras me",
    toNight: "Naar het signaal-thema", toDay: "Naar het dag-thema", langLabel: "Taal",
    fam: { house: "House & disco", techno: "Techno", synth: "Synth & wave", guitar: "Gitaren", groove: "Groove", bass: "Bass & breaks", calm: "Rustig", other: "Meer" },
    next: "Volgend nummer →", keep: "Bewaren", stay: "Hier blijven", resume: "Terug naar de radio", stop: "Stop",
    kofiAir: "<a href='{kofi}' target='_blank' rel='noopener'>Steunen op Ko-fi</a>",
    kofiStop: "Vond je de radio fijn? <a href='{kofi}' target='_blank' rel='noopener'>Steun hem op Ko-fi</a>.",
    playing: "Je speelt", playingText: "De radio houdt dit nummer en raakt niets aan. Hij gaat verder 30 s na je laatste beweging.",
    holdingTitle: "We blijven hier", holdingText: "De radio houdt dit nummer tot je hem teruggeeft.",
    meta: "{fam} · {bpm} BPM · energie {e}",
    phase: { intro: "intro", build: "opbouw", peak: "piek", breakdown: "ademen", outro: "outro" },
    arcs: { classique: "klassiek", vague: "golf", lent: "traag", "double sommet": "dubbele piek" },
    intros: { nappe: "pad", "rythme filtré": "gefilterde beat", "basse d'abord": "bas eerst", "écho": "echo", percussions: "percussie" },
    lane: { off: "uit", on: "aan", write: "schrijft", wait: "wacht" },
    sched: { played: "gespeeld", now: "on air", next: "hierna", surprise: "verrassing" },
    favEmpty: "Nog niets. Een nummer is een stijl, een energie en een seed: het speelt precies hetzelfde terug.",
    play: "Spelen", copy: "Kopiëren", remove: "Verwijderen", fallbackTag: "reserve",
    settings: "Instellingen", energy: "Energie", duration: "Lengte van een nummer", tracksSet: "Tracks", clock: "Clock",
    clkMachine: "het apparaat (jij houdt de controle)", clkApp: "de app (CLOCK USB)", keepMine: "een kopie van mijn muziek bewaren om die aan het eind terug te zetten",
    logTitle: "Technisch logboek",
    genJiant: "Generator: {v} (gen.c gecompileerd), {n} genres.",
    genFallback: "Reservegenerator: gen.c is nog niet gecompileerd (gen/build-gen.ps1). De nummers zijn eenvoudiger en komen niet overeen met de seeds van het apparaat.",
    creditsH: "Generator: <a href='{jiant}'>JIANT FM</a> van Juan Ignacio Antonucci (GPL-3.0), een fork van Felucca van Hügelton Instruments. FM-1 Radio is vrije software onder GPL-3.0: <a href='{src}'>broncode</a>. Een onafhankelijk communityproject, niet verbonden aan M-VAVE.",
    liveLabel: "FM-1 ON AIR", liveTitle: "FM-1's die nu de radio spelen", liveTitleMe: "FM-1's die nu de radio spelen, die van jou meegeteld",
    footH: "FM-1 Radio · GPL-3.0 · <a href='{guide}'>Handleiding</a> · <a href='{src}'>Broncode</a> · <a href='{licenses}'>Licenties</a> · <a href='{kofi}' target='_blank' rel='noopener'>Steunen op Ko-fi</a>",
    noscript: "FM-1 Radio heeft JavaScript en Web MIDI nodig: open het in Chrome of Edge.",
    st: { reading: "De muziek van het apparaat wordt gelezen...", ready: "Klaar.", usb: "Overschakelen naar de USB-clock, tracks gedempt.",
      pressPlay: "Druk op PLAY op je apparaat (STOP en dan PLAY als het al speelt). Het eerste nummer laadt ondertussen.", loading: "Het eerste nummer laadt...", stoppedM: "Gestopt op het apparaat: druk op PLAY om verder te gaan.",
      kept: "{name} bewaard.", arrives: "{name} komt na de outro.", queued: "Hierna: {name}, na de outro.", unqueued: "Geannuleerd: de radio blijft bij deze stijl.",
      busyNext: "{name} is al onderweg: kies opnieuw zodra het on air is.",
      handback: "De radio geeft de controle terug, het apparaat blijft spelen.", restoring: "Je muziek komt terug...", restored: "Je muziek is terug. Druk op PLAY op het apparaat.",
      otherPage: "Een andere FM-1 Radio-pagina is met de FM-1 verbonden: sluit die (de antwoorden raken door elkaar).", phase: "{phase}{i} · boog {arc} · intro {intro}",
      waitPlaying: "Je speelt: de radio wacht.", holding: "De radio blijft bij dit nummer.", playing: "On air." },
    err: { nomidi: "Hier is geen Web MIDI: gebruik Chrome of Edge (niet Safari).", sysex: "De browser heeft MIDI-toegang geweigerd: sta die toe in de site-instellingen en verbind opnieuw.",
      noport: "Geen FM-1-poort: datakabel, geen hub, sluit de andere pagina's en DAW's.", nojiant: "{v}: JIANT niet gevonden.",
      version: "Niet-ondersteunde versie (id {id}: verwacht {want}, gelezen {got}).", armed: "Er staat een track op opname: schakel die uit.",
      noclock: "Geen clock van het apparaat: zet MENU › CONTROL › MIDI OUT op CLOCK (niet ALL), of kies de app-clock in de instellingen.",
      song: "Het apparaat staat in SONG-modus: stop, houd SAVE ingedrukt en druk op D5 voor LOOP, en start dan opnieuw." },
    page: {
      whatT: "Een radio die op je FM-1 speelt",
      what: [
        "FM-1 Radio maakt van een <b>M-VAVE FM-1</b> met de firmware <a href='{jiant}'>JIANT FM</a> een eindeloze achtergrondradio. De web-app schrijft de muziek, de FM-1 speelt die met zijn eigen engines: het geluid komt van het apparaat, er wordt niets gestreamd.",
        "Kies een stijl, druk op PLAY op het apparaat en ga verder met je werk. Elk nummer bouwt op, piekt, ademt en geeft het stokje door aan het volgende, met één track als brug tussen de twee: de muziek stopt nooit. Van deep house en dub techno tot shoegaze, boom bap, drum &amp; bass en ambient: 43 stijlen in zeven families.",
      ],
      howT: "Hoe het werkt",
      how: [
        ["De eigen generator van JIANT.", "De app draait GEN, de generator van JIANT, gecompileerd naar WebAssembly. Een nummer is een stijl, een energie en een seed: dezelfde drie waarden geven altijd hetzelfde nummer."],
        ["Een boog voor elk nummer.", "Intro, opbouw, piek, ademen, outro. Vijf manieren om een nummer te beginnen, en de effecten van de FM-1 (distortion, chorus, delay, reverb, DJ-filter) die op de maat bewegen."],
        ["Je apparaat houdt de clock.", "De radio volgt de MIDI-clock van de FM-1. Tempo, TAP en effecten blijven van jou: speel mee, en de radio wacht tot je klaar bent."],
        ["Zacht voor je FM-1.", "Alles wordt via USB in het RAM geschreven, met een korte lijst editorcommando's. De radio stuurt nooit firmware- of projectcommando's en kan je eigen muziek terugzetten als je stopt."],
      ],
      needT: "Wat je nodig hebt",
      need: [
        "Een <b>M-VAVE FM-1</b> met <a href='{jiant}'>JIANT FM</a> V10.9 of nieuwer (getest met V10.26).",
        "Een USB-datakabel.",
        "<b>Chrome of Edge</b> op Windows, macOS, Linux of ChromeOS, of <b>Chrome op Android</b> met een OTG-adapter. Niet op iPhone of iPad: Safari heeft geen Web MIDI.",
        "Twee minuten instellen op het apparaat: <a href='{guide}'>de handleiding</a>.",
      ],
      faqT: "Vragen",
      faq: [
        ["Werkt het zonder FM-1?", "Nee. De app maakt geen geluid: hij schrijft de muziek in het apparaat, en de FM-1 speelt die. Je hebt een FM-1 met JIANT FM nodig."],
        ["Verandert of wist het mijn muziek?", "De radio schrijft in het RAM in de tracks, nooit in opgeslagen projecten. Maar JIANT slaat 10 s nadat het apparaat stopt vanzelf op, dus sla je project op voordat je begint. De radio houdt ook een kopie van je muziek bij en biedt aan het eind aan die terug te zetten."],
        ["Kan ik meespelen?", "Ja. Draai aan een knop, speel een toets of verander het tempo: de radio merkt het, houdt het huidige nummer en wacht 30 s na je laatste beweging. Hier blijven houdt een nummer zo lang als je wilt."],
        ["Kan ik een nummer terugvinden?", "Ja. Druk op Bewaren: de radio slaat stijl, energie en seed op in je browser. Dezelfde drie waarden geven hetzelfde nummer, noot voor noot."],
        ["Waarom Chrome of Edge?", "De radio heeft Web MIDI met SysEx nodig, en dat ondersteunen Chrome en Edge. Safari niet, op Mac, iPhone of iPad."],
        ["Werkt het op een telefoon?", "Op Android wel: Chrome, plus een OTG-adapter of een USB-C-kabel. De interface is gemaakt voor kleine schermen. Niet op iPhone."],
        ["Is het gratis? Wat gebeurt er met mijn gegevens?", "FM-1 Radio is vrije software onder GPL-3.0, zonder account en zonder cookie. Je instellingen en bewaarde nummers blijven in je browser. Zolang de radio on air is, stuurt hij een anoniem signaal zodat de site kan tonen hoeveel FM-1's er on air zijn: geen naam, niets van je muziek, en 2 minuten na het stoppen is het vergeten."],
        ["Zit er AI in?", "Nee. De nummers komen uit de generator van JIANT (muzikale regels). De radio voegt het arrangement en de mix toe."],
      ],
      creditsT: "Credits",
      credits: "De generator is <a href='{jiant}'>JIANT FM</a> van Juan Ignacio Antonucci (GPL-3.0), een fork van Felucca van Leo Kuroshita / Hügelton Instruments. FM-1 Radio is vrije software onder GPL-3.0: <a href='{src}'>broncode</a>, <a href='{licenses}'>licenties</a>. Het is een onafhankelijk communityproject, niet verbonden aan M-VAVE.",
      support: "De radio is gratis, zonder advertenties en zonder account. Houdt hij je gezelschap tijdens het werk, dan kun je hem <a href='{kofi}' target='_blank' rel='noopener'>steunen op Ko-fi</a>.",
    },
    guide: {
      h1: "Stel je FM-1 in",
      intro: "FM-1 Radio heeft zeven dingen nodig voordat hij kan spelen op een M-VAVE FM-1 met JIANT FM. Bij het verbinden controleert de radio de meeste zelf en laat hij zien wat er nog ontbreekt. Hier staan ze allemaal, in de volgorde waarin je ze doet.",
      thenT: "Daarna",
      then: "Kies een startstijl, druk op <b>Radio starten</b> en dan op <b>PLAY</b> op het apparaat. Het eerste nummer wordt geschreven terwijl je wacht. Druk op <b>Stop</b> wanneer je wilt: het apparaat blijft spelen, en <b>Mijn muziek terug</b> zet die van jou terug.",
      open: "Radio openen",
      troubleT: "Als er iets misgaat",
      trouble: [
        ["Geen FM-1-poort", "Gebruik een USB-datakabel (een kabel die alleen laadt toont geen poort), sluit de FM-1 aan zonder hub en sluit de DAW's en andere pagina's die hem gebruiken. Druk dan opnieuw op Verbinden."],
        ["De browser heeft MIDI-toegang geweigerd", "Open de site-instellingen (het pictogram links van het adres), sta MIDI-apparaten toe, herlaad en verbind."],
        ["Geen clock van het apparaat", "Zet MENU › CONTROL › MIDI OUT op CLOCK, niet ALL. Of kies de app-clock in de instellingen van de radio: de app stuurt de clock dan via USB."],
        ["Het apparaat staat in SONG-modus", "Stop het apparaat, houd SAVE ingedrukt en druk op D5 om naar LOOP te gaan, en start de radio opnieuw."],
        ["Er staat een track op opname", "Schakel opname uit op alle tracks: anders zouden de wijzigingen van de radio als automation worden opgenomen, dus schrijft hij niets."],
        ["Een andere pagina is verbonden", "Sluit de andere FM-1 Radio-tabbladen: twee pagina's die met dezelfde FM-1 praten, halen zijn antwoorden door elkaar."],
      ],
    },
    seo: {
      home: { title: "FM-1 Radio · Generatieve radio voor de M-VAVE FM-1 (JIANT)",
        desc: "Maak van je M-VAVE FM-1 met JIANT FM een eindeloze achtergrondradio: 43 stijlen, vloeiende overgangen, gratis en open source. Chrome, Edge en Android." },
      guide: { title: "M-VAVE FM-1 instellen voor FM-1 Radio · Handleiding",
        desc: "MIDI OUT op CLOCK, LOOP-modus, je muziek bewaren, Web MIDI: de zeven instellingen die FM-1 Radio nodig heeft op een M-VAVE FM-1 met JIANT, stap voor stap." },
      ogAlt: "FM-1 Radio: generatieve radio voor de M-VAVE FM-1",
      appDesc: "Een web-app die de M-VAVE FM-1-synthesizer met de firmware JIANT FM via Web MIDI tot generatieve achtergrondradio maakt.",
    },
  },
};

/* =========================================================================================================
 * Gabarits partagés : l'app les appelle pour se dessiner, le build pour pré-rendre chaque page.
 * t(chemin, valeurs) renvoie le texte de la langue en cours (repli sur l'anglais).
 * ========================================================================================================= */
const UI = (() => {
  const LANGS = ["en", "fr", "de", "nl"];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const PATH = { home: "", guide: "guide/" };
  const url = (lang, page = "home", base = "") => base + "/" + (lang === "en" ? "" : lang + "/") + PATH[page];
  function fill(s, v) { return String(s).replace(/\{(\w+)\}/g, (m, k) => (v && v[k] !== undefined ? (typeof v[k] === "function" ? v[k]() : v[k]) : "")); }
  function get(o, path) { for (const p of path.split(".")) o = o == null ? o : o[p]; return o; }
  function tr(lang, path, v) {
    let o = get(I18N[lang] || I18N.en, path); if (o == null) o = get(I18N.en, path);
    return typeof o === "string" ? fill(o, v) : o;
  }
  /* les sept étapes de l'onboarding, dans l'ordre où on les fait ; save et loop se cochent à la main */
  const SETUP = ["browser", "connect", "firmware", "save", "loop", "clock", "armed"];
  const MANUAL = new Set(["save", "loop"]);
  const ICON = { ok: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    bad: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" stroke-width="2"/></svg>' };
  ICON.done = ICON.ok;
  /* une étape : [touche, texte] ou [touche, texte, lien] ; le lien est une clé de LINKS et rend le texte cliquable */
  const stepsHTML = steps => (steps || []).map(([k, w, a], i) => `<li><span class="n">${i + 1}</span><span class="k">${esc(k)}</span>`
    + `<span>${a && LINKS[a] ? `<a href="${esc(LINKS[a])}">${esc(w)}</a>` : esc(w)}</span></li>`).join("");
  /* rows : [{ key, s (ok, bad, wait, todo, done), txt }] */
  function checksHTML(t, rows, sel) {
    return rows.map((r, i) => `<li><button type="button" class="check ${r.s}${r.key === sel ? " sel" : ""}" data-step="${r.key}"${r.key === sel ? ' aria-current="step"' : ""}>`
      + `<span>0${i + 1}</span><span>${esc(t("setup." + r.key + ".name"))}</span><span class="s">${ICON[r.s] || ""}${esc(r.txt)}</span></button></li>`).join("");
  }
  /* le panneau de droite : le guide d'une étape (ctx : i, n, done, links) */
  function guidePanelHTML(t, key, ctx) {
    const g = t("setup." + key) || {}, L = ctx.links || {};
    const head = key === "ready" ? "" : `<div class="ghead"><span class="label">${esc(t("stepN", { i: ctx.i + 1, n: ctx.n }))}</span><span class="label dim">${esc(t("where." + g.where))}</span></div>`;
    return head + `<h2 class="big">${esc(g.title)}</h2><div>${fill(g.why, L)}</div>`
      + (g.steps && g.steps.length ? `<ol class="gsteps">${stepsHTML(g.steps)}</ol>` : "")
      + (g.note ? `<div class="note">${fill(g.note, L)}</div>` : "")
      + (key === "clock" ? `<div class="listen" id="listen"><i></i><span></span></div>` : "")
      + (MANUAL.has(key) ? `<div class="row"><button type="button" class="btn${ctx.done ? " on" : ""}" id="gDone" data-step="${key}" aria-pressed="${!!ctx.done}">${esc(ctx.done ? t("undoDone") : t("markDone"))}</button></div>` : "")
      + (L.guide ? `<a class="more" href="${L.guide}#${key === "ready" ? "then" : key}">${esc(t("more"))} →</a>` : "");
  }
  /* l'index des styles ; isOn(g), isQ(g) disent quel style est allumé ou à suivre */
  function indexHTML(t, fams, isOn = () => false, isQ = () => false) {
    return fams.map(f => `<div class="fam"><span>${esc(t("fam." + f.key))}</span>${f.g.map(g => {
      const on = isOn(g), q = isQ(g);
      return `<button type="button" data-genre="${esc(g)}" class="${on ? "on" : ""}${q ? " q" : ""}" aria-pressed="${on || q}">${esc(g)}</button>`;
    }).join("")}</div>`).join("");
  }
  /* le contenu de la page d'accueil, sous la radio */
  function aboutHTML(t, L) {
    const P = k => t("page." + k), F = s => fill(s, L);
    return `<section aria-labelledby="whatT"><h2 class="big" id="whatT">${esc(P("whatT"))}</h2><div class="body">${P("what").map(p => `<p>${F(p)}</p>`).join("")}</div></section>`
      + `<section aria-labelledby="howT"><h2 class="big" id="howT">${esc(P("howT"))}</h2><ul class="body">${P("how").map(([b, s]) => `<li><b>${esc(b)}</b> ${esc(s)}</li>`).join("")}</ul></section>`
      + `<section aria-labelledby="needT"><h2 class="big" id="needT">${esc(P("needT"))}</h2><ul class="body">${P("need").map(s => `<li>${F(s)}</li>`).join("")}</ul></section>`
      + `<section aria-labelledby="faqT"><h2 class="big" id="faqT">${esc(P("faqT"))}</h2><div class="body faq">${P("faq").map(([q, a]) => `<details class="qa"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div></section>`
      + `<section aria-labelledby="creditsT"><h2 class="big" id="creditsT">${esc(P("creditsT"))}</h2><div class="body"><p>${t("page.credits", L)}</p><p>${t("page.support", L)}</p></div></section>`;   // (t vide les {…} sans valeurs : les liens lui sont passés)
  }
  /* la page guide : les sept étapes en entier */
  function guideArticleHTML(t, L) {
    const G = k => t("guide." + k);
    return `<div class="ghero"><p class="kicker">${esc(t("kicker"))}</p><h1 class="big">${esc(G("h1"))}</h1><p class="lead">${esc(G("intro"))}</p></div>`
      + SETUP.map((k, i) => { const g = t("setup." + k);
        return `<section id="${k}" class="gsec"><div class="gnum big">0${i + 1}</div><div class="body"><p class="label dim">${esc(t("where." + g.where))}</p><h2>${esc(g.title)}</h2><p>${fill(g.why, L)}</p>`
          + `<ol class="gsteps">${stepsHTML(g.steps)}</ol>${g.note ? `<p class="note">${fill(g.note, L)}</p>` : ""}</div></section>`; }).join("")
      + `<section id="then" class="gsec"><div class="gnum big">→</div><div class="body"><h2>${esc(G("thenT"))}</h2><p>${G("then")}</p><p><a class="btn-prim" href="${L.home}">${esc(G("open"))}</a></p></div></section>`
      + `<section id="trouble" class="gsec"><div class="gnum big">?</div><div class="body"><h2>${esc(G("troubleT"))}</h2><div class="faq">${G("trouble").map(([q, a]) => `<details class="qa"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div></div></section>`;
  }
  /* sélecteur de langue : de vrais liens, pour les moteurs */
  function langsHTML(lang, page, base) {
    return LANGS.map(c => `<a href="${url(c, page, base)}" hreflang="${c}" lang="${c}" data-lang="${c}" class="${c === lang ? "on" : ""}"${c === lang ? ' aria-current="true"' : ""} title="${esc(I18N[c].langName)}">${c.toUpperCase()}</a>`).join("");
  }
  return { LANGS, esc, url, fill, tr, SETUP, MANUAL, ICON, stepsHTML, checksHTML, guidePanelHTML, indexHTML, aboutHTML, guideArticleHTML, langsHTML };
})();
