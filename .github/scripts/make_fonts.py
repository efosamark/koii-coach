"""Make the four font files in fonts/ from the Atkinson Hyperlegible variable fonts (SIL OFL 1.1, no reserved name).

    pip install fonttools brotli
    curl -LO "https://raw.githubusercontent.com/google/fonts/main/ofl/atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext%5Bwght%5D.ttf"
    curl -LO "https://raw.githubusercontent.com/google/fonts/main/ofl/atkinsonhyperlegiblemono/AtkinsonHyperlegibleMono%5Bwght%5D.ttf"
    python .github/scripts/make_fonts.py "AtkinsonHyperlegibleNext[wght].ttf" "AtkinsonHyperlegibleMono[wght].ttf" fonts

Each weight is cut from the variable font as its own file (about 12 KB each), then subset to Latin. The zero is
redrawn without its slash: the outer ring stays, and the two half-counters the slash leaves are replaced by one
counter (their convex hull, with the intact arcs mirrored left to right). A slashed zero reads as code in running
text ("0 of 8 done"). In Next, width still tells 0 from O; in Mono the two end up nearly the same
width, which is fine while no display value mixes them.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables import ttProgram
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphCoordinates

UNICODES = ('U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,'
            'U+20AC,U+2122,U+2212,U+2215,U+FEFF,U+FFFD')
FEATURES = 'kern,liga,calt,tnum,case,ccmp,locl,mark,mkmk'
CUTS = [('next', 400, 'AtkinsonHyperlegibleNext-Regular'), ('next', 600, 'AtkinsonHyperlegibleNext-SemiBold'),
        ('next', 700, 'AtkinsonHyperlegibleNext-Bold'), ('mono', 500, 'AtkinsonHyperlegibleMono-Medium')]


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


def main(next_ttf, mono_ttf, out_dir):
    out = Path(out_dir)
    with tempfile.TemporaryDirectory() as tmp:
        for family, weight, name in CUTS:
            src = next_ttf if family == 'next' else mono_ttf
            ttf = str(Path(tmp) / f'{name}.ttf')
            subprocess.run([sys.executable, '-m', 'fontTools', 'varLib.instancer', src, f'wght={weight}',
                            '--update-name-table', '-q', '-o', ttf], check=True)
            unslash_zero(ttf)
            subprocess.run([sys.executable, '-m', 'fontTools', 'subset', ttf, f'--unicodes={UNICODES}',
                            f'--layout-features={FEATURES}', '--flavor=woff2', f'--output-file={out / (name + ".woff2")}'],
                           check=True)
            print(out / f'{name}.woff2', (out / f'{name}.woff2').stat().st_size, 'bytes')


if __name__ == '__main__':
    main(*sys.argv[1:4])
