"""Site search (docs/overhaul-plan.md 8.1, test_search.py), in the app bar's overlay:

- "turntable", "time-stretch", "sidechain" and "vocal" each find a chapter step;
- "hat" matches hat, hats and hi-hat, never the "hat" inside "that" or "what";
- it works offline once the service worker has saved the site, and says so when the pages are not saved yet;
- a step result opens a preview, so searching never moves the learner (test_smoke.py follows one through).
Run after a build:  python -m pytest tests/test_search.py
"""
from urllib.parse import urljoin

import pytest

from support import watch

pytestmark = pytest.mark.browser

STEP = '#site-results a.search-hit[href*=".html#s-"]'


@pytest.fixture
def run(browser, site_url):
    context = browser.new_context(viewport={'width': 390, 'height': 844})
    page = context.new_page()
    page.set_default_timeout(20000)
    errors, bad = [], []
    watch(page, site_url, errors, bad)
    page.goto(urljoin(site_url, 'manifest.webmanifest'))
    page.evaluate("() => { localStorage.clear(); localStorage.setItem('koii-coach-prefs', JSON.stringify({v: 1, setup: 'ready'})); }")

    class Run:
        def __init__(self):
            self.page, self.context = page, context

        def go(self, href):
            page.goto(urljoin(site_url, href), wait_until='networkidle')

        def search(self, q):
            if not page.locator('#site-search').is_visible():
                page.locator('#appbar .search-btn').click()
            # Clear first, so the wait below sees this query's results, never the last one's.
            page.locator('#site-search').fill('')
            page.wait_for_function("() => !/result/.test(document.querySelector('#site-search-status').textContent)")
            page.locator('#site-search').fill(q)
            page.wait_for_function("() => /result|No results|offline copy/.test(document.querySelector('#site-search-status').textContent)")

    yield Run()
    context.close()
    assert errors == [], f'Browser JavaScript errors: {errors}'
    assert bad == [], f'Failed app assets: {bad}'


def test_words_find_chapter_steps(run):
    page = run.page
    run.go('./learn.html')
    for q in ('turntable', 'time-stretch', 'sidechain', 'vocal'):
        run.search(q)
        page.locator(STEP).first.wait_for()
        assert page.locator(STEP).count() >= 1, f'"{q}" finds a chapter step'
    run.search('hat')
    page.locator(STEP).first.wait_for()
    marks = page.evaluate("""() => [...document.querySelectorAll('#site-results mark')].map(m => {
        const before = (m.previousSibling && m.previousSibling.textContent || '').slice(-1);
        return before + '|' + m.textContent; })""")
    assert marks, 'The matches are marked'
    inside = [m for m in marks if m.split('|')[0].isalpha()]
    assert inside == [], f'"hat" matched inside a word: {inside[:5]}'
    # A step result opens a preview: the page does not move.
    url = page.url
    page.locator(STEP).first.click()
    page.locator('#site-results .search-preview').wait_for()
    assert page.url == url, 'A step result opens a preview, not the step'


def test_search_offline(run):
    page = run.page
    run.go('./learn.html')
    assert page.evaluate("() => navigator.serviceWorker.ready.then(r => Boolean(r.active))"), 'The service worker is active'
    page.reload(wait_until='networkidle')
    page.wait_for_function("() => Boolean(navigator.serviceWorker.controller)")
    run.context.set_offline(True)
    page.reload(wait_until='load')
    run.search('sidechain')
    page.locator(STEP).first.wait_for()
    assert page.locator(STEP).count() >= 1, 'Search works offline'
    run.context.set_offline(False)


def test_search_says_when_pages_are_not_saved(browser, site_url):
    context = browser.new_context(viewport={'width': 390, 'height': 844}, service_workers='block')
    page = context.new_page()
    page.goto(urljoin(site_url, 'learn.html'), wait_until='networkidle')
    context.route('**/*.html', lambda route: route.abort())   # the pages are neither online nor saved
    page.locator('#appbar .search-btn').click()
    page.locator('#site-search').fill('sidechain')
    page.wait_for_function("""() => /Search needs the offline copy|could not be searched/.test(document.querySelector('#site-results').textContent)""", timeout=20000)
    context.close()
