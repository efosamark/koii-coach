#!/usr/bin/env python3
"""Copy only the app files into a site folder and check it before anything is published.

Usage: python3 .github/scripts/build_site.py _site

Fails (exit 1) when:
- a required file is missing, or a page/script is suspiciously small (placeholder text),
- manifest.webmanifest is not valid JSON or names an icon that is not in the site,
- a page links to a local file that is not in the site, or a stylesheet's url() does (a missing font fails silently),
- sw.js precaches a file that is not in the site (one 404 stops the offline install),
- a page, script, stylesheet, font or SVG in the site is not precached by sw.js (it would not work offline),
- VERSION in sw.js, version in site.js and the newest CHANGELOG.md heading differ,
- a page's visible text names a chapter by its number before the renumber ("chapter 07", "07 / Sample…", "section 04",
  "CHAPTER 09") or by an old name ("Start here", "Tech House"): the course is Chapter 0-7 and parts are "Part 4".
Standard library only, so it runs anywhere Python 3.8+ does.
"""
import json, pathlib, re, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
# App files only. README, CHANGELOG, tests/ and .github/ are never published.
INCLUDE = ['*.html', '*.js', '*.css', 'manifest.webmanifest', 'icon.svg', 'icons.svg', 'icons/*.png', 'icons/*.svg',
           'fonts/*.woff2', 'fonts/OFL.txt']
REQUIRED = ['index.html', '404.html', 'site.js', 'sw.js', 'manifest.webmanifest', 'icon.svg']
MIN_BYTES = {'.html': 2000, '.js': 500, '.css': 200, '.woff2': 1000}
PRECACHED = ('.html', '.js', '.css', '.woff2', '.svg')  # every one of these in the site must be in sw.js ASSETS
SKIP_LINK = re.compile(r'^(?:[a-z][a-z0-9+.-]*:|//|#)', re.I)  # http:, mailto:, data:, //host, #anchor

errors, warnings = [], []

# Bare-number lint (plan 4.2, P6). Old chapter numbers are 00 01 02 07 08 09 10 11; the "Formerly 07" chip and search
# alias are added by scripts, never written in a page.
OLD_NUM = r'(?:00|01|02|07|08|09|10|11)'
BARE = [
    (re.compile(r'\b[Cc]hapters?\s+' + OLD_NUM + r'\b'), 'a chapter by its old number'),
    (re.compile(r'CHAPTER\s+\d\d\b'), 'a two-digit chapter number'),
    (re.compile(r'(?<![\d.])\b' + OLD_NUM + r'\s*/\s*[A-Z]'), 'an old "NN / Name" chapter or part number'),
    (re.compile(r'\b[Ss]ections?\s+\d\d\b'), 'a numbered "section" (use "Part 4")'),
    (re.compile(r'\b(?:Start here|Tech House|House with your own vocal samples)\b'), 'an old chapter name'),
]
ALLOW_OLD_NAME = {'thodorakis-house.html': ['House with your own vocal samples']}   # its subtitle


def visible_text(page):
    t = re.sub(r'<(script|style)\b.*?</\1>', ' ', page, flags=re.S | re.I)
    t = re.sub(r'<[^>]+>', ' ', t)
    return re.sub(r'\s+', ' ', t.replace('&amp;', '&').replace('&nbsp;', ' '))


def build(out):
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    for pattern in INCLUDE:
        for src in sorted(ROOT.glob(pattern)):
            if src.is_file():
                dst = out / src.relative_to(ROOT)
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
    return sorted(p.relative_to(out).as_posix() for p in out.rglob('*') if p.is_file())


def local_path(ref):
    ref = ref.strip()
    if not ref or SKIP_LINK.match(ref) or '${' in ref or '{{' in ref:
        return None
    ref = re.split(r'[?#]', ref, maxsplit=1)[0]
    if ref.startswith('./'):
        ref = ref[2:]
    if ref in ('', '.', '/'):
        return 'index.html'
    return ref.lstrip('/')


def main():
    if len(sys.argv) != 2:
        sys.exit('usage: build_site.py <output-folder>')
    out = (ROOT / sys.argv[1]).resolve()
    if out == ROOT or ROOT not in out.parents:
        sys.exit('output folder must be inside the repository, e.g. _site')
    files = build(out)
    have = set(files)

    for name in REQUIRED:
        if name not in have:
            errors.append(f'{name} is missing')
    for name in files:
        size = (out / name).stat().st_size
        minimum = MIN_BYTES.get(pathlib.PurePosixPath(name).suffix)
        if minimum and size < minimum:
            errors.append(f'{name} is only {size} bytes; is it a placeholder?')

    # Manifest
    try:
        manifest = json.loads((out / 'manifest.webmanifest').read_text(encoding='utf-8'))
        for icon in manifest.get('icons', []):
            p = local_path(icon.get('src', ''))
            if p and p not in have:
                errors.append(f'manifest icon {icon.get("src")} is not in the site')
        if not any('maskable' in i.get('purpose', '') for i in manifest.get('icons', [])):
            warnings.append('manifest has no maskable icon')
    except (OSError, ValueError) as e:
        errors.append(f'manifest.webmanifest is not valid JSON: {e}')

    # Local links in every page
    for name in [f for f in files if f.endswith('.html')]:
        text = (out / name).read_text(encoding='utf-8')
        # 404.html sets <base href="/koii-coach/"> (the live site's root) so its links work at any depth; it is not a file.
        for ref in re.findall(r'''\b(?:href|src)\s*=\s*["']([^"']*)["']''', re.sub(r'<base\b[^>]*>', '', text, flags=re.I), re.I):
            p = local_path(ref)
            if p and p not in have:
                errors.append(f'{name} links to {ref}, which is not in the site')
        head = text.split('</head>', 1)[0]
        for need, what in [('rel="manifest"', 'manifest link'), ('rel="apple-touch-icon"', 'apple-touch-icon'),
                           ('name="description"', 'meta description'), ('name="theme-color"', 'theme-color')]:
            if need not in head:
                warnings.append(f'{name} has no {what} in <head>')

    # Local files a stylesheet loads (fonts); a wrong path would only fall back to another font without any error
    for name in [f for f in files if f.endswith('.css')]:
        css = (out / name).read_text(encoding='utf-8')
        for ref in re.findall(r'''url\(\s*["']?([^"')]+)''', css):
            p = local_path(ref)
            if p and p not in have:
                errors.append(f'{name} loads {ref}, which is not in the site')

    # Service worker precache list
    sw = (out / 'sw.js').read_text(encoding='utf-8') if 'sw.js' in have else ''
    m = re.search(r'ASSETS\s*=\s*\[(.*?)\]', sw, re.S)
    if not m:
        errors.append('could not find the ASSETS list in sw.js')
    else:
        assets = re.findall(r'''["']([^"']+)["']''', m.group(1))
        precached = set()
        for a in assets:
            p = local_path(a)
            precached.add(p)
            if p not in have:
                errors.append(f'sw.js precaches {a}, which is not in the site (offline install would fail)')
        for name in files:
            if name.endswith(PRECACHED) and name != 'sw.js' and name not in precached:
                errors.append(f'{name} is not in the sw.js ASSETS list, so it will not work offline')

    # One release version everywhere: the service worker cache name, Home and Settings (site.js) and the changelog.
    versions = {}
    m = re.search(r'''\bVERSION\s*=\s*['"]([^'"]+)['"]''', sw)
    versions['VERSION in sw.js'] = m.group(1) if m else None
    registry = (out / 'site.js').read_text(encoding='utf-8') if 'site.js' in have else ''
    m = re.search(r'''COACH_SITE\s*=\s*\{.*?\bversion\s*:\s*['"]([^'"]+)['"]''', registry, re.S)
    versions['version in site.js'] = m.group(1) if m else None
    changelog = ROOT / 'CHANGELOG.md'
    text = changelog.read_text(encoding='utf-8') if changelog.is_file() else ''
    m = re.search(r'^## +(\S+)', text, re.M)
    versions['newest CHANGELOG.md heading'] = m.group(1) if m else None
    for where, value in versions.items():
        if value is None:
            errors.append(f'could not find the {where}')
    if None not in versions.values() and len(set(versions.values())) > 1:
        errors.append('release versions differ: ' + ', '.join(f'{w} is {v}' for w, v in versions.items())
                      + '. Set all three to the same value (see README, "Releasing a content change").')

    for name in [f for f in files if f.endswith('.html')]:
        text = visible_text((out / name).read_text(encoding='utf-8'))
        for rule, what in BARE:
            for m in rule.finditer(text):
                if m.group(0) in ALLOW_OLD_NAME.get(name, []):
                    continue
                errors.append(f'{name} names {what}: "…{text[max(0, m.start() - 30):m.end() + 20].strip()}…"')

    print(f'Site folder {out.name}/ has {len(files)} files:')
    for name in files:
        print(f'  {name}  ({(out / name).stat().st_size} bytes)')
    for w in warnings:
        print(f'::warning::{w}')
    for e in errors:
        print(f'::error::{e}')
    if errors:
        sys.exit(1)
    print('Site checks passed.')


if __name__ == '__main__':
    main()
