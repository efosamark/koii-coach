"""Every address of the coach lands on the right page (docs/overhaul-plan.md 8.1, test_urls.py and test_offline.py):

- typed in: every page of the site, a page with a ?query, a step link (#s-<id>) and an out-of-date one, and the
  retired single-page app's addresses (index.html#first, #help/<topic>, …);
- an unknown address three levels deep gets the site's 404.html (status 404, as GitHub Pages answers; the test server
  .github/scripts/serve.py does the same), with its stylesheet, and its links lead to the right pages;
- offline, once the service worker has saved the site: every page, a ?query, two old addresses and the deep unknown
  address (the saved 404.html), whose links still work.
Each page is checked by its h1, taken from the built page itself. Run after a build:  python -m pytest tests/test_urls.py
"""
import pathlib
import re
from urllib.parse import urljoin

import pytest

from support import watch

pytestmark = pytest.mark.browser

SITE = pathlib.Path(__file__).resolve().parents[1] / '_site'
PAGES = sorted(p.name for p in SITE.glob('*.html'))
H1 = """() => { const h = document.querySelector('h1'); return h ? h.textContent.replace(/\\s+/g, ' ').trim() : ''; }"""
OLD = [('index.html#first', 'first-beat.html', 'li[data-step]'), ('index.html#help/a-pad-is-silent', 'help.html', 'details#a-pad-is-silent[open]'),
       ('index.html#manual/groups-and-scenes', 'learn.html', 'details#groups-and-scenes[open]')]


def heading(name):
    if name == 'index.html':
        return 'Welcome back'   # Home's heading once set-up is answered (home.js), as the fixture leaves it
    src = (SITE / name).read_text(encoding='utf-8')
    m = re.search(r'<h1\b[^>]*>(.*?)</h1>', src, re.S)
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', m.group(1))).replace('&amp;', '&').strip() if m else ''


@pytest.fixture
def run(browser, site_url):
    context = browser.new_context(viewport={'width': 390, 'height': 844})
    page = context.new_page()
    page.set_default_timeout(15000)
    errors, bad = [], []
    watch(page, site_url, errors, bad)

    class Run:
        def __init__(self):
            self.page, self.context, self.bad = page, context, bad

        def url(self, href):
            return urljoin(site_url, href)

        def lands(self, href, name):
            page.goto('about:blank')
            response = page.goto(self.url(href), wait_until='load')
            want = heading(name)
            page.wait_for_function(f'want => ({H1})().includes(want)', arg=want, timeout=10000)
            return response

    run = Run()
    page.goto(run.url('manifest.webmanifest'))
    page.evaluate("() => { localStorage.clear(); localStorage.setItem('koii-coach-prefs', JSON.stringify({v: 1, setup: 'ready'})); }")
    yield run
    context.close()
    # The unknown address itself answers 404, which the browser also logs; every other request must succeed.
    errors = [e for e in errors if not re.search(r'/(a/b/c|x/y/z): console.error: Failed to load resource: .* 404', e)]
    assert errors == [], f'Browser JavaScript errors: {errors}'
    deep = [b for b in bad if not re.search(r'/(a/b/c|x/y/z)$', b['url'])]
    assert deep == [], f'Failed app assets: {deep}'


def test_every_page_typed_in(run):
    assert len(PAGES) >= 18, 'The built site is there'
    for name in PAGES:
        if name == '404.html':
            continue
        response = run.lands(name, name)
        assert response.status == 200, f'{name}: status {response.status}'
    run.lands('hiphop.html?utm_source=test', 'hiphop.html')
    run.lands('sampling.html#s-record-kick', 'sampling.html')
    run.page.wait_for_function("() => (document.querySelector('li.is-current, li.linked') || {dataset: {}}).dataset.step === 'record-kick'")
    run.lands('first-beat.html#s-not-a-step-any-more', 'first-beat.html')
    run.page.locator('#toast', has_text='out of date').wait_for()
    for href, name, sel in OLD:
        run.page.goto('about:blank')
        run.page.goto(run.url(href))
        run.page.wait_for_url(re.compile(re.escape(name)))
        run.page.locator(sel).first.wait_for(state='attached')


def test_unknown_address_three_levels_deep(run):
    page = run.page
    response = run.lands('a/b/c', '404.html')
    assert response.status == 404, 'The unknown address answers 404, as on GitHub Pages'
    assert page.evaluate("() => getComputedStyle(document.querySelector('.btn.primary')).display") != 'inline', 'Its stylesheet loaded'
    page.get_by_role('link', name='Go to Home').click()
    page.wait_for_url(run.url('index.html'))
    assert heading('index.html') in page.evaluate(H1)
    run.lands('a/b/c', '404.html')
    page.locator('.path a', has_text='Tech house').click()
    page.wait_for_url(run.url('tech-house.html'))
    assert heading('tech-house.html') in page.evaluate(H1)


def test_every_page_offline(run):
    page = run.page
    run.lands('index.html', 'index.html')
    active = page.evaluate("""() => 'serviceWorker' in navigator && Promise.race([
        navigator.serviceWorker.ready.then(r => Boolean(r.active)), new Promise(r => setTimeout(() => r(false), 30000))])""")
    assert active, 'The service worker is active'
    page.reload(wait_until='networkidle')
    page.wait_for_function("() => /Offline ready/.test(document.querySelector('#offline').textContent)", timeout=30000)
    run.context.set_offline(True)
    for name in PAGES:
        if name != '404.html':
            run.lands(name, name)
    run.lands('hiphop.html?utm_source=test', 'hiphop.html')
    for href, name, sel in OLD[:2]:
        page.goto('about:blank')
        page.goto(run.url(href))
        page.wait_for_url(re.compile(re.escape(name)))
        page.locator(sel).first.wait_for(state='attached')
    run.lands('x/y/z', '404.html')
    page.locator('main a', has_text='Glossary').first.click()
    page.wait_for_url(run.url('glossary.html'))
    assert heading('glossary.html') in page.evaluate(H1)
    run.context.set_offline(False)


def test_a_new_release_under_an_open_page(browser, tmp_path):
    """Plan 7.6: deploy release N+1 while a page of release N is open. The new service worker takes over, the page says
    "Coach updated" with a Reload button, search still opens in the old page, and Reload brings the new release."""
    import http.server
    import shutil
    import threading
    import serve
    site = tmp_path / 'site'
    shutil.copytree(SITE, site)
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), serve.handler(site))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_address[1]}/'
    context = browser.new_context(viewport={'width': 390, 'height': 844})
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    try:
        page.goto(base + 'manifest.webmanifest')
        page.evaluate("() => localStorage.setItem('koii-coach-prefs', JSON.stringify({v: 1, setup: 'ready'}))")
        page.goto(base + 'learn.html', wait_until='networkidle')
        assert page.evaluate("() => navigator.serviceWorker.ready.then(r => Boolean(r.active))")
        page.reload(wait_until='networkidle')
        page.wait_for_function('() => Boolean(navigator.serviceWorker.controller)')
        assert page.locator('#toast', has_text='Coach updated').count() == 0, 'No notice on the first install'
        # Release N+1: a new sw.js (its VERSION, so its cache, changes).
        sw = (site / 'sw.js').read_text(encoding='utf-8')
        (site / 'sw.js').write_text(sw.replace("const VERSION='", "const VERSION='next-", 1), encoding='utf-8')
        page.evaluate('() => navigator.serviceWorker.getRegistration().then(r => r.update())')
        page.locator('#toast', has_text='Coach updated').wait_for(timeout=30000)
        page.locator('body').click(position={'x': 5, 'y': 300})
        page.keyboard.press('/')
        page.locator('#site-search').wait_for()
        page.keyboard.type('sidechain')
        page.locator('#site-results .search-hit').first.wait_for(timeout=15000)
        page.keyboard.press('Escape')
        page.locator('#toast [data-reload]').click()
        page.wait_for_load_state('networkidle')
        assert page.evaluate("() => caches.keys()").count('koii-coach-next-' + sw.split("const VERSION='", 1)[1].split("'", 1)[0]) == 1, 'The new release is the cache now'
        assert errors == [], errors
    finally:
        context.close()
        server.shutdown()
        server.server_close()
