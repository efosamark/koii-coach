"""Make the seven font files in fonts/ from the Atkinson Hyperlegible, Archivo and Saira variable fonts (SIL OFL 1.1,
no reserved names).

    pip install fonttools brotli
    curl -LO "https://raw.githubusercontent.com/google/fonts/main/ofl/atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext%5Bwght%5D.ttf"
    curl -LO "https://raw.githubusercontent.com/google/fonts/main/ofl/atkinsonhyperlegiblemono/AtkinsonHyperlegibleMono%5Bwght%5D.ttf"
    curl -LO "https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf"
    curl -LO "https://raw.githubusercontent.com/google/fonts/main/ofl/saira/Saira%5Bwdth%2Cwght%5D.ttf"
    python .github/scripts/make_fonts.py "AtkinsonHyperlegibleNext[wght].ttf" "AtkinsonHyperlegibleMono[wght].ttf" \
        "Archivo[wdth,wght].ttf" "Saira[wdth,wght].ttf" fonts

Each weight is cut from the variable font as its own file (about 12 KB each), then subset to Latin. The zero is
redrawn without its slash: the outer ring stays, and the two half-counters the slash leaves are replaced by one
counter (their convex hull, with the intact arcs mirrored left to right). A slashed zero reads as code in running
text ("0 of 8 done"). In Next, width still tells 0 from O; in Mono the two end up nearly the same
width, which is fine while no display value mixes them.

Next has no arrows, check mark or geometric shapes, so a page would draw them in the device's own font. They are
added here (SYMBOLS): strokes as thick as each weight's hyphen, with round ends like the icons in icons.svg,
centred on the hyphen's axis. The @font-face unicode-range in coach.css must list them too.

Archivo is the display face for titles only, subset to the same Latin range and left as drawn: SemiExpanded (width
112.5) Bold for the Studio look (plan decision 26) and Light (width 100, weight 300) for the Minimal look (decision 27).
Its zero has no slash already, and it has no arrows, so a title never uses them. Saira SemiExpanded (width 112.5) Light
is the title face of the Spec look (decision 28), cut and subset the same way.
"""
import math
import subprocess
import sys
import tempfile
from pathlib import Path

from fontTools.pens.basePen import BasePen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables import ttProgram
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphCoordinates

UNICODES = ('U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,'
            'U+20AC,U+2122,U+2212,U+2215,U+FEFF,U+FFFD')
SYMBOLS = 'U+2190,U+2192,U+2713,U+25A0,U+25B2,U+25C6,U+25CF'   # ← → ✓ ■ ▲ ◆ ●
FEATURES = 'kern,liga,calt,tnum,case,ccmp,locl,mark,mkmk'
CUTS = [('next', 400, 'AtkinsonHyperlegibleNext-Regular'), ('next', 600, 'AtkinsonHyperlegibleNext-SemiBold'),
        ('next', 700, 'AtkinsonHyperlegibleNext-Bold'), ('mono', 500, 'AtkinsonHyperlegibleMono-Medium')]
DISPLAY = [('ArchivoSemiExpanded-Bold', 'wdth=112.5', 'wght=700'), ('Archivo-Light', 'wdth=100', 'wght=300')]
SPEC = ('Saira-Light', 'wdth=112.5', 'wght=300')


class Flatten(BasePen):
    """Outlines as polygons, curves sampled finely."""
    def __init__(self, glyphs):
        super().__init__(glyphs)
        self.contours, self.cur = [], []

    def _moveTo(self, p):
        self.cur = [p]

    def _lineTo(self, p):
        self.cur.append(p)

    def _curveToOne(self, a, b, c):
        p0 = self.cur[-1]
        for i in range(1, 25):
            t = i / 24
            u = 1 - t
            self.cur.append(tuple(u ** 3 * p0[k] + 3 * u * u * t * a[k] + 3 * u * t * t * b[k] + t ** 3 * c[k] for k in (0, 1)))

    def _qCurveToOne(self, a, b):
        p0 = self.cur[-1]
        for i in range(1, 17):
            t = i / 16
            u = 1 - t
            self.cur.append(tuple(u * u * p0[k] + 2 * u * t * a[k] + t * t * b[k] for k in (0, 1)))

    def _closePath(self):
        self.contours.append(self.cur)
        self.cur = []

    _endPath = _closePath


def hull(points):
    pts = sorted({(round(x, 2), round(y, 2)) for x, y in points})
    cross = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


def area(c):
    return sum(c[i][0] * c[(i + 1) % len(c)][1] - c[(i + 1) % len(c)][0] * c[i][1] for i in range(len(c))) / 2


def unslash_zero(path):
    font = TTFont(path)
    glyf = font['glyf']
    zero = glyf['zero']
    assert zero.numberOfContours == 3, f'{path}: the zero is no longer ring + two half-counters'
    coords, ends, flags = zero.getCoordinates(glyf)
    starts = [0] + [e + 1 for e in ends[:-1]]
    spans = list(zip(starts, ends))
    width = lambda s: max(coords[j][0] for j in range(s[0], s[1] + 1)) - min(coords[j][0] for j in range(s[0], s[1] + 1))
    outer = max(spans, key=width)
    pen = Flatten(font.getGlyphSet())
    font.getGlyphSet()['zero'].draw(pen)
    ring, *halves = sorted(pen.contours, key=lambda c: abs(area(c)), reverse=True)
    inner = halves[0] + halves[1]
    xs = [x for x, _ in ring]
    cx = (min(xs) + max(xs)) / 2
    counter = hull(inner + [(2 * cx - x, y) for x, y in inner])
    ring_pts = [coords[j] for j in range(outer[0], outer[1] + 1)]
    if (area(counter) > 0) == (area(ring_pts) > 0):  # a counter runs opposite to its ring
        counter.reverse()
    glyph = Glyph()
    glyph.numberOfContours = 2
    glyph.coordinates = GlyphCoordinates(ring_pts + [(round(x), round(y)) for x, y in counter])
    glyph.flags = bytearray([flags[j] for j in range(outer[0], outer[1] + 1)] + [1] * len(counter))
    glyph.endPtsOfContours = [len(ring_pts) - 1, len(ring_pts) + len(counter) - 1]
    glyph.program = ttProgram.Program()
    glyph.program.fromBytecode(b'')
    glyf['zero'] = glyph
    glyph.recalcBounds(glyf)
    font.save(path)


def capsule(a, b, r, n=12):
    """A stroke from a to b, r thick on each side, with round ends, as one polygon."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    ang = math.atan2(dy, dx)
    pts = []
    for end, start in ((b, ang - math.pi / 2), (a, ang + math.pi / 2)):
        pts += [(end[0] + r * math.cos(start + math.pi * i / n), end[1] + r * math.sin(start + math.pi * i / n)) for i in range(n + 1)]
    return pts


def polygon(n, r, cx, cy, start):
    return [(cx + r * math.cos(start + 2 * math.pi * i / n), cy + r * math.sin(start + 2 * math.pi * i / n)) for i in range(n)]


def add_symbols(path):
    font = TTFont(path)
    glyf, cmap = font['glyf'], font.getBestCmap()
    hy = glyf[cmap[0x2D]]
    hy.recalcBounds(glyf)
    t, cy = hy.yMax - hy.yMin, (hy.yMax + hy.yMin) / 2   # stroke and axis of the hyphen
    r = t / 2
    shapes = {   # name, code point, advance, contours
        'arrowright': (0x2192, 760, [capsule((120, cy), (640, cy), r), capsule((640, cy), (440, cy + 200), r), capsule((640, cy), (440, cy - 200), r)]),
        'arrowleft': (0x2190, 760, [capsule((640, cy), (120, cy), r), capsule((120, cy), (320, cy + 200), r), capsule((120, cy), (320, cy - 200), r)]),
        'checkmark': (0x2713, 700, [capsule((90, 300), (270, 110), r), capsule((270, 110), (610, 560), r)]),
        'filledbox': (0x25A0, 700, [[(90, 50), (90, 570), (610, 570), (610, 50)]]),
        'triagup': (0x25B2, 700, [polygon(3, 330, 350, 270, math.pi / 2)]),
        'blackdiamond': (0x25C6, 700, [polygon(4, 300, 350, 310, math.pi / 2)]),
        'blackcircle': (0x25CF, 700, [polygon(96, 270, 350, 310, 0)]),
    }
    order = font.getGlyphOrder()
    for name, (cp, adv, contours) in shapes.items():
        pen = TTGlyphPen(None)
        for c in contours:
            c = [(round(x), round(y)) for x, y in c]
            if area(c) > 0:   # TrueType outlines run clockwise
                c.reverse()
            pen.moveTo(c[0])
            for p in c[1:]:
                pen.lineTo(p)
            pen.closePath()
        g = pen.glyph()
        if name not in order:
            order.append(name)
        glyf[name] = g
        g.recalcBounds(glyf)
        font['hmtx'][name] = (adv, g.xMin)
        for table in font['cmap'].tables:
            if table.isUnicode():
                table.cmap[cp] = name
    font.setGlyphOrder(order)
    font.save(path)


def main(next_ttf, mono_ttf, display_ttf, spec_ttf, out_dir):
    out = Path(out_dir)
    with tempfile.TemporaryDirectory() as tmp:
        for src, (name, *axes) in [(display_ttf, cut) for cut in DISPLAY] + [(spec_ttf, SPEC)]:
            ttf = str(Path(tmp) / f'{name}.ttf')
            subprocess.run([sys.executable, '-m', 'fontTools', 'varLib.instancer', src, *axes,
                            '--update-name-table', '-q', '-o', ttf], check=True)
            subprocess.run([sys.executable, '-m', 'fontTools', 'subset', ttf, f'--unicodes={UNICODES}',
                            f'--layout-features={FEATURES}', '--flavor=woff2', f'--output-file={out / (name + ".woff2")}'],
                           check=True)
            print(out / f'{name}.woff2', (out / f'{name}.woff2').stat().st_size, 'bytes')
        for family, weight, name in CUTS:
            src = next_ttf if family == 'next' else mono_ttf
            ttf = str(Path(tmp) / f'{name}.ttf')
            subprocess.run([sys.executable, '-m', 'fontTools', 'varLib.instancer', src, f'wght={weight}',
                            '--update-name-table', '-q', '-o', ttf], check=True)
            unslash_zero(ttf)
            if family == 'next':
                add_symbols(ttf)
            subprocess.run([sys.executable, '-m', 'fontTools', 'subset', ttf, f'--unicodes={UNICODES},{SYMBOLS}',
                            f'--layout-features={FEATURES}', '--flavor=woff2', f'--output-file={out / (name + ".woff2")}'],
                           check=True)
            print(out / f'{name}.woff2', (out / f'{name}.woff2').stat().st_size, 'bytes')


if __name__ == '__main__':
    main(*sys.argv[1:6])
