#!/usr/bin/env python3
"""Optional developer tool; normal npm builds use the committed glyph data.

Install its dependencies in a Python virtual environment:
    python -m pip install -r tools/requirements-font.txt
Run from anywhere:
    python tools/generate-wordmark.py
"""
import json
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import pathops

root = Path(__file__).resolve().parents[1]
variable = TTFont(root / 'src/assets/inter-latin.woff2')
# Preserve the live 24px header's optical design while enlarging its geometry.
ttf = instantiateVariableFont(variable, {'wght': 450, 'opsz': 24}, inplace=False)
factor = 40 / ttf['head'].unitsPerEm
cmap = ttf.getBestCmap()
glyphset = ttf.getGlyphSet()
glyphs = {}
chars = list(dict.fromkeys('NICK JENSEN'))
def number(n):
    return str(round(n, 5)).rstrip('0').rstrip('.') if '.' in str(round(n, 5)) else str(round(n, 5))
for char in chars:
    glyph = glyphset[cmap[ord(char)]]
    outline = pathops.Path()
    glyph.draw(TransformPen(outline.getPen(), (factor, 0, 0, -factor, 0, 0)))
    svg = SVGPathPen(glyphset, ntos=number)
    pathops.simplify(outline, fix_winding=True, keep_starting_points=True).draw(svg)
    bounds = BoundsPen(glyphset)
    glyph.draw(bounds)
    info = {'d': svg.getCommands(), 'advance': round(glyph.width * factor, 5)}
    if bounds.bounds:
        x1, y1, x2, y2 = bounds.bounds
        info['bounds'] = {'x': round(x1 * factor, 5), 'y': round(-y2 * factor, 5), 'width': round((x2 - x1) * factor, 5), 'height': round((y2 - y1) * factor, 5)}
    glyphs[char] = info

gpos = ttf['GPOS'].table
indices = sorted({i for feature in gpos.FeatureList.FeatureRecord if feature.FeatureTag == 'kern' for i in feature.Feature.LookupListIndex})
def kerning(first, second):
    a, b = cmap[ord(first)], cmap[ord(second)]
    value = 0
    for index in indices:
        lookup = gpos.LookupList.Lookup[index]
        for raw in lookup.SubTable:
            sub = raw.ExtSubTable if lookup.LookupType == 9 else raw
            if a not in sub.Coverage.glyphs:
                continue
            if sub.Format == 1:
                pairset = sub.PairSet[sub.Coverage.glyphs.index(a)]
                found = next((p for p in pairset.PairValueRecord if p.SecondGlyph == b), None)
                if found is None:
                    continue
                rec = found.Value1
            elif sub.Format == 2:
                class1 = sub.ClassDef1.classDefs.get(a, 0)
                class2 = sub.ClassDef2.classDefs.get(b, 0)
                rec = sub.Class1Record[class1].Class2Record[class2].Value1
            else:
                continue
            value += getattr(rec, 'XAdvance', 0) if rec else 0
            break
    return round(value * factor, 5)

kern = {a + b: v for a in chars for b in chars if (v := kerning(a, b))}
font = {'em': 40, 'cap': round(ttf['OS/2'].sCapHeight * factor, 5), 'glyphs': glyphs}
family = {'name': 'Inter', 'opticalSize': 24, 'weights': {'450': font}, 'kern': kern}
out = root / 'src/components/Wordmark/inter450.json'
out.write_text(json.dumps(family, separators=(',', ':')) + '\n')
spacing = -40 / 24
word_gap = glyphs['K']['advance'] - glyphs['K']['bounds']['x'] - glyphs['K']['bounds']['width'] + glyphs[' ']['advance'] + glyphs['J']['bounds']['x'] + 2 * spacing + kern.get('K ', 0) + kern.get(' J', 0)
print(json.dumps({'file': str(out), 'weight': 450, 'opticalSize': 24, 'trackingAt40': spacing, 'wordGapAt40': word_gap, 'kerning': {p: kern.get(p, 0) for p in ['NI', 'IC', 'CK', 'K ', ' J', 'JE', 'EN', 'NS', 'SE', 'NJ']}}))
