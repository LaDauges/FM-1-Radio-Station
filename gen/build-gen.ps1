# FM-1 Radio : compile le générateur de JIANT (firmware/src/gen.c) en WebAssembly pour l'app.
# À lancer dans PowerShell depuis le dossier FM-1 Radio :  .\gen\build-gen.ps1 [-Version V10.26] [-Out app\gen]
# La version doit être celle de la machine (écran ABOUT, ou la ligne INFO de l'app) : une autre version donne
# d'autres morceaux pour la même seed.
# Prérequis : git, Python 3 (py) avec Pillow et fontTools, emsdk (activé, ou installé dans %USERPROFILE%\emsdk).
# Voir gen/README.md.
param(
    [string]$Version = "V10.26",
    [string]$Out = ""
)
$ErrorActionPreference = "Stop"

# les commits du firmware (pas les commits « Public: » du dépôt, qui portent un autre arbre)
$Commits = @{
    "V10.9"  = "f46764d"
    "V10.26" = "5db7ffc"
}
if (-not $Commits.ContainsKey($Version)) {
    throw "Version $Version inconnue. Connues : $($Commits.Keys -join ', '). Ajouter son commit dans `$Commits (git log --oneline -S 'FELUCCA_VERSION `"$Version`"' -- firmware/src/felucca.c)."
}
$Commit = $Commits[$Version]
$Root = Split-Path -Parent $PSScriptRoot
$Ref  = Join-Path $Root "reference\JIANT"
$Fix  = Join-Path $Root "gen\host_fix.h"
$Shim = Join-Path $Root "gen\py_noraqm.py"
if (-not $Out) { $Out = Join-Path $Root "app\gen" }

# une commande native : s'arrête si elle échoue (PowerShell 5.1 ne le fait pas seul)
function Run([string]$What, [scriptblock]$Do) {
    $ErrorActionPreference = "Continue"
    & $Do
    if ($LASTEXITCODE) { throw "$What : échec (code $LASTEXITCODE)" }
}

# emcc : celui du PATH, sinon l'emsdk de %USERPROFILE%\emsdk
if (-not (Get-Command emcc -ErrorAction SilentlyContinue)) {
    $EmsdkEnv = Join-Path $env:USERPROFILE "emsdk\emsdk_env.ps1"
    if (-not (Test-Path $EmsdkEnv)) { throw "emcc introuvable : installer emsdk (gen/README.md, étape 1)" }
    $env:EMSDK_QUIET = "1"
    $ErrorActionPreference = "Continue"     # (emsdk écrit sur stderr : sous Stop, PowerShell 5.1 en ferait une erreur)
    . $EmsdkEnv *> $null
    $ErrorActionPreference = "Stop"
    if (-not (Get-Command emcc -ErrorAction SilentlyContinue)) { throw "emcc toujours introuvable après $EmsdkEnv" }
}

# le source de JIANT à la version voulue
if (-not (Test-Path $Ref)) { Run "git clone" { git clone https://github.com/juanjiant-bit/JIANT.git $Ref } }
$ErrorActionPreference = "Continue"
git -C $Ref cat-file -e "$Commit^{commit}" 2>$null
$Have = -not $LASTEXITCODE
$ErrorActionPreference = "Stop"
if (-not $Have) { Run "git fetch" { git -C $Ref fetch origin } }
Run "git checkout" { git -C $Ref checkout -q --detach $Commit }
$Felucca = Get-Content (Join-Path $Ref "firmware\src\felucca.c") -Raw
if ($Felucca -notmatch '#define FELUCCA_VERSION "([^"]*)"' -or $Matches[1] -ne $Version) {
    throw "Le commit $Commit ne porte pas $Version (felucca.c dit $($Matches[1]))"
}
Write-Host "JIANT $Version (commit $Commit)"

Push-Location $Ref
try {
    # en-têtes générés (mêmes commandes que tools/build.py generate())
    New-Item -ItemType Directory -Force build\gen | Out-Null
    $G = "build\gen"
    Run "gen_aa_font" { py $Shim tools\gen_aa_font.py "$G\ui_fonts.h" --preset jiant-lab --kern-min 4 }   # (sans libraqm : py_noraqm.py)
    Run "gen_px_font" { py tools\gen_px_font.py "$G\ui_font_x.h" }
    Run "gen_aa_icons" { py tools\gen_aa_icons.py "$G\ui_icons.h" }
    Run "gen_aa_keycaps" { py tools\gen_aa_keycaps.py "$G\ui_keycaps.h" }
    Run "gen_ui_palettes" { py tools\gen_ui_palettes.py "$G\ui_palettes.h" }
    Run "gen_ui_shapes" { py tools\gen_ui_shapes.py "$G\ui_shapes.h" }
    Run "gen_tables" { py tools\gen_tables.py "$G\felucca_tables.h" }
    Run "gen_lyrics" { py tools\gen_lyrics.py "$G\felucca_lyrics.h" }
    Run "gen_fm6_patches" { py tools\gen_fm6_patches.py "$G\felucca_fm6.h" }
    Run "gen_drum_maps" { py tools\gen_drum_maps.py firmware\src\gen_tables.c firmware\src\song_dice.c "$G\gen_drum_maps.h" "$G\dice_bars.h" "$G\gen_bass.h" }

    # 1) contrôle : tests/gen_dump.c de JIANT, le même générateur lu comme une partition, pour comparer avec la
    #    machine. En natif si un compilateur C est là, sinon avec emcc pour Node :
    #    build\host\gen_dump.exe 2 421 30   ou   node build\host\gen_dump.js 2 421 30
    New-Item -ItemType Directory -Force build\host | Out-Null
    $CC = Get-Command cc, gcc, clang -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($CC) {
        Run "gen_dump (natif)" { & $CC.Source -O1 -w -include $Fix -Ibuild/gen -Ifirmware/src -Itests -o build/host/gen_dump.exe tests/gen_dump.c -lm }
    } else {
        Run "gen_dump (Node)" { emcc -O1 -w -include $Fix -Ibuild/gen -Ifirmware/src -Itests tests/gen_dump.c -lm `
            -sALLOW_MEMORY_GROWTH=1 -sSTACK_SIZE=4MB -sNODERAWFS=1 -o build/host/gen_dump.js }
    }

    # 2) WebAssembly pour l'app
    New-Item -ItemType Directory -Force $Out | Out-Null
    Run "jiant-gen.mjs" { emcc -O2 -w "-DJIANT_VERSION=$Version" -include $Fix -Ibuild/gen -Ifirmware/src -Itests (Join-Path $Root "gen\gen_export.c") -lm `
        -sMODULARIZE=1 -sEXPORT_ES6=1 -sEXPORT_NAME=createJiantGen -sSINGLE_FILE=1 -sALLOW_MEMORY_GROWTH=1 -sSTACK_SIZE=1MB -sENVIRONMENT=web `
        "-sEXPORTED_FUNCTIONS=_gen_version,_gen_ngenre,_gen_genre_name,_gen_piece" `
        "-sEXPORTED_RUNTIME_METHODS=cwrap,UTF8ToString" `
        -o (Join-Path $Out "jiant-gen.mjs") }
} finally {
    Pop-Location
}
Write-Host "OK : $(Join-Path $Out 'jiant-gen.mjs') (JIANT $Version)"
