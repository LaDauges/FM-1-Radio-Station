"""Lance un outil Python de JIANT (tools/gen_*.py) quand Pillow n'a pas libraqm, le cas des wheels Windows.

Sans libraqm, Pillow refuse les options OpenType (gen_aa_font.py demande « tnum » pour les chiffres) : on les
ignore. Seuls les pixels de la police de l'interface changent (chasse des chiffres, crénage), sans aucun effet sur
le générateur que compile build-gen.ps1. Le code de JIANT n'est pas modifié.

    py gen/py_noraqm.py reference/JIANT/tools/gen_aa_font.py ARGS...
"""
import os
import runpy
import sys

from PIL import ImageFont, features

if not features.check("raqm"):
    _getlength = ImageFont.FreeTypeFont.getlength
    _getbbox = ImageFont.FreeTypeFont.getbbox
    _getmask2 = ImageFont.FreeTypeFont.getmask2

    def getlength(self, text, mode="", direction=None, features=None, language=None):
        return _getlength(self, text, mode)

    def getbbox(self, text, mode="", direction=None, features=None, language=None, stroke_width=0, anchor=None):
        return _getbbox(self, text, mode, stroke_width=stroke_width, anchor=anchor)

    def getmask2(self, text, mode="", direction=None, features=None, language=None, *args, **kw):
        return _getmask2(self, text, mode, None, None, None, *args, **kw)

    ImageFont.FreeTypeFont.getlength = getlength
    ImageFont.FreeTypeFont.getbbox = getbbox
    ImageFont.FreeTypeFont.getmask2 = getmask2

tool = os.path.abspath(sys.argv[1])
sys.argv = sys.argv[1:]
sys.path.insert(0, os.path.dirname(tool))
runpy.run_path(tool, run_name="__main__")
