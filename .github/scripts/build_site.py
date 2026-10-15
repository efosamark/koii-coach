#!/usr/bin/env python3
"""Copy only the app files into a site folder, shrink its CSS and JavaScript (minify.py), tag each page's scripts and
stylesheet with the release (src="player.js?v=<release>", so a page never runs with files from another release
that GitHub Pages' 10-minute HTTP cache still holds; sw.js ignores the query), and check it before anything is published.

Usage: python3 .github/scripts/build_site.py _site

Fails (exit 1) when:
- a required file is missing, or a page/script is suspiciously small (placeholder text),
- manifest.webmanifest is not valid JSON or names an icon that is not in the site,
- a page links to a local file that is not in the site, or a stylesheet's url() does (a missing font fails silently),
- sw.js precaches a file that is not in the site (one 404 stops the offline install),
- a page, script, stylesheet, font or SVG in the site is not precached by sw.js (it would not work offline),
- VERSION in sw.js, version in site.js and the newest CHANGELOG.md heading differ,
- a link to one step (page.html#s-<id>, or #s-<id> on the same page) names a step that is not on that page,
- a step with data-os has no "Needs OS x or newer" fallback badge,
- a page loads shell.js without site.js and progress.js before it (progress and migrations would not run there),
- a page with its stylesheets and scripts weighs more than its budget, gzipped (plan 7.8): 60 KB for Home and the tool
  pages, 80 KB for a chapter page (docs/overhaul-plan.md decision 19; today they weigh 66-76 KB),
- another budget of plan 7.8 and decision 19 is broken: a page's HTML over 35 KB gzipped, the CSS over 18 KB, all the
  JavaScript over 68 KB or one page's over 48 KB (gzipped), the icon sprite over 6 KB, the font over 18 KB, or what
  sw.js saves for offline use over 600 KB gzipped,
- a page's visible text names a chapter by its number before the renumber ("chapter 07", "07 / Sample…", "section 04",
  "CHAPTER 09") or by an old name ("Start here", "Tech House"): the course is Chapter 0-7 and parts are "Part 4".
Standard library only, so it runs anywhere Python 3.8+ does.
"""
import gzip, json, pathlib, re, shutil, sys

import minify

ROOT = pathlib.Path(__file__).resolve().parents[2]
# App files only. README, CHANGELOG, tests/ and .github/ are never published.
INCLUDE = ['*.html', '*.js', '*.css', 'manifest.webmanifest', 'icon.svg', 'icons.svg', 'icons/*.png', 'icons/*.svg',
           'fonts/*.woff2', 'fonts/OFL.txt']
REQUIRED = ['index.html', '404.html', 'site.js', 'sw.js', 'manifest.webmanifest', 'icon.svg']
MIN_BYTES = {'.html': 2000, '.js': 500, '.css': 200, '.woff2': 1000}
PRECACHED = ('.html', '.js', '.css', '.woff2', '.svg')  # every one of these in the site must be in sw.js ASSETS
SKIP_LINK = re.compile(r'^(?:[a-z][a-z0-9+.-]*:|//|#)', re.I)  # http:, mailto:, data:, //host, #anchor

errors, warnings = [], []
# A page's own scripts and stylesheets (not sw.js, which keeps one address, and not other sites).
TAGGED = re.compile(r'(<script src="|<link rel="stylesheet" href=")((?:\./)?(?!sw\.js)[a-z0-9-]+\.(?:js|css))"')

# Bare-number lint (plan 4.2, P6). Old chapter numbers are 00 01 02 07 08 09 10 11; the "Formerly 07" chip and search
# alias are added by scripts, never written in a page.
OLD_NUM = r'(?:00|01|02|07|08|09|10|11)'
BARE = [
    (re.compile(r'\b[Cc]hapters?\s+' + OLD_NUM + r'\b'), 'a chapter by its old number'),
    (re.compile(r'CHAPTER\s+\d\d\b'), 'a two-digit chapter number'),
    (re.compile(r'(?<![\d.])\b' + OLD_NUM + r'\s*/\s*[A-Z]'), 'an old "NN / Name" chapter or part number'),
    (re.compile(r'\b[Ss]ections?\s+\d\d\b'), 'a numbered "section" (use "Part 4")'),
    (re.compile(r'(?:\b[Tt]he |\()0\d\b(?![.:\d])'), 'a zero-padded old number ("the 07 recordings", "(03 update")'),
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
                # Published CSS and JS lose their comments and indentation (minify.py); sw.js stays as written.
                if dst.suffix in ('.css', '.js') and dst.name != 'sw.js':
                    text = src.read_text(encoding='utf-8')
                    dst.write_text(minify.css(text) if dst.suffix == '.css' else minify.js(text), encoding='utf-8')
    m = re.search(r"""\bversion\s*:\s*['"]([^'"]+)['"]""", (ROOT / 'site.js').read_text(encoding='utf-8'))
    if m:
        for page in out.glob('*.html'):
            src = page.read_text(encoding='utf-8')
            page.write_text(TAGGED.sub(lambda x: f'{x.group(1)}{x.group(2)}?v={m.group(1)}"', src), encoding='utf-8')
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

    step_ids = {f: set(re.findall(r'data-step="([^"]+)"', (out / f).read_text(encoding='utf-8'))) for f in files if f.endswith('.html')}
    for name in [f for f in files if f.endswith('.html') or f.endswith('.js')]:
        src = (out / name).read_text(encoding='utf-8')
        for page, sid in re.findall(r'\./([a-z-]+\.html)#s-([a-z0-9-]+)', src):
            if page in step_ids and sid not in step_ids[page]:
                errors.append(f'{name} links to {page}#s-{sid}, but {page} has no step "{sid}"')
        if name.endswith('.html'):
            for sid in re.findall(r'href="#s-([a-z0-9-]+)"', src):
                if sid not in step_ids[name]:
                    errors.append(f'{name} links to #s-{sid}, but it has no step "{sid}"')
    for name in [f for f in files if f.endswith('.html')]:
        # A step that needs a newer OS says so without JavaScript too (CONTRIBUTING, data-os).
        for m in re.finditer(r'<li data-step="([^"]+)"[^>]*data-os="([^"]+)"[^>]*>(.*?)</li>', (out / name).read_text(encoding='utf-8'), re.S):
            if f'<p class="badge os-badge">Needs OS {m.group(2)} or newer</p>' not in m.group(3):
                errors.append(f'{name}: step {m.group(1)} has data-os="{m.group(2)}" but no "Needs OS {m.group(2)} or newer" badge for readers without JavaScript')
    for name in [f for f in files if f.endswith('.html')]:
        # Steps are numbered within their part (plan 4: "Step 4 of 8"): every part's list starts at 1, for readers
        # without JavaScript too.
        for m in re.finditer(r'<ol start="(\d+)">(.*?)</ol>', (out / name).read_text(encoding='utf-8'), re.S):
            if re.search(r'<li data-step=', m.group(2)):
                errors.append(f'{name} has <ol start="{m.group(1)}">: each part numbers its steps from 1')
    for name in [f for f in files if f.endswith('.html')]:
        src = (out / name).read_text(encoding='utf-8')
        order = re.findall(r'<script src="(site|progress|shell)\.js(?:\?[^"]*)?"></script>', src)
        if 'shell' in order and order[:3] != ['site', 'progress', 'shell']:
            errors.append(f'{name} must load site.js, progress.js and shell.js in that order (it has {order})')
    for name in [f for f in files if f.endswith('.html')]:
        text = visible_text((out / name).read_text(encoding='utf-8'))
        for rule, what in BARE:
            for m in rule.finditer(text):
                if m.group(0) in ALLOW_OLD_NAME.get(name, []):
                    continue
                errors.append(f'{name} names {what}: "…{text[max(0, m.start() - 30):m.end() + 20].strip()}…"')

    # Page weight: the page plus the stylesheets and scripts it loads, gzipped (the font and icons are shared and cached).
    gz = lambda f: len(gzip.compress((out / f).read_bytes(), 9))
    weights = {}
    for name in [f for f in files if f.endswith('.html')]:
        src = (out / name).read_text(encoding='utf-8')
        deps = [local_path(d) for d in re.findall(r'<script src="([^"]+)"', src) + re.findall(r'<link rel="stylesheet" href="([^"]+)"', src)]
        weights[name] = gz(name) + sum(gz(d) for d in deps if d in have)
        budget = 80 if 'data-chapter=' in src.split('<main', 1)[0] else 60
        if weights[name] > budget * 1024:
            errors.append(f'{name} weighs {weights[name] / 1024:.1f} KB gzipped with its CSS and JS (budget {budget} KB)')

    js = [f for f in files if f.endswith('.js') and f != 'sw.js']
    for what, size, limit in ([('the CSS', sum(gz(f) for f in files if f.endswith('.css')), 18), ('all the JavaScript', sum(gz(f) for f in js), 68),
                               ('the icon sprite', (out / 'icons.svg').stat().st_size if 'icons.svg' in have else 0, 6)] +
                              [(f, (out / f).stat().st_size, 18) for f in files if f.endswith('.woff2')]):
        if size > limit * 1024:
            errors.append(f'{what} weighs {size / 1024:.1f} KB (budget {limit} KB)')
    # Everything the service worker saves for offline use (plan 7.8: 600 KB gzipped).
    m = re.search(r'ASSETS\s*=\s*\[(.*?)\]', (out / 'sw.js').read_text(encoding='utf-8'), re.S) if 'sw.js' in have else None
    saved = sum(gz(p) for p in (local_path(a) for a in re.findall(r"'([^']+)'", m.group(1) if m else '')) if p in have)
    if saved > 600 * 1024:
        errors.append(f'the offline copy weighs {saved / 1024:.0f} KB gzipped (budget 600 KB)')
    for name in [f for f in files if f.endswith('.html')]:
        src = (out / name).read_text(encoding='utf-8')
        if gz(name) > 35 * 1024:
            errors.append(f'{name} weighs {gz(name) / 1024:.1f} KB gzipped (budget 35 KB of HTML)')
        own = sum(gz(d) for d in (local_path(x) for x in re.findall(r'<script src="([^"]+)"', src)) if d in have)
        if own > 48 * 1024:
            errors.append(f'{name} loads {own / 1024:.1f} KB of JavaScript gzipped (budget 48 KB)')

    print(f'Site folder {out.name}/ has {len(files)} files:')
    for name in files:
        print(f'  {name}  ({(out / name).stat().st_size} bytes' + (f', {weights[name] / 1024:.1f} KB gzipped with CSS and JS)' if name in weights else ')'))
    for w in warnings:
        print(f'::warning::{w}')
    for e in errors:
        print(f'::error::{e}')
    if errors:
        sys.exit(1)
    print('Site checks passed.')


if __name__ == '__main__':
    main()
