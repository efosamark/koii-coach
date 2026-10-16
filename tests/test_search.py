"""Site search (docs/overhaul-plan.md 8.1, test_search.py), in the app bar's overlay:

- "turntable", "time-stretch", "sidechain" and "vocal" each find a chapter step;
- "hat" matches hat, hats and hi-hat, never the "hat" inside "that" or "what"; cheat-sheet moves are found too;
- the filter chips and group headings use the plan's names (Fixes, Troubleshooting, Glossary);
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
            # A sheet closed just before removes its history entry with history.back(), a moment later; a goto started
            # before that lands is aborted by it. Wait until no sheet's entry is left.
            page.wait_for_function("() => !(history.state && history.state.coachDialog) || !!document.querySelector('dialog[open]')")
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
    # The plan's names: chips All · Steps · Fixes · Learn · Words (5.8), groups headed Troubleshooting and Glossary (4.7).
    assert page.locator('#site-search-dialog [data-type]').all_text_contents()[:5] == ['All', 'Steps', 'Fixes', 'Learn', 'Words']
    run.search('silent')
    page.locator('#site-group-help').wait_for()
    assert page.locator('#site-group-help').text_content().startswith('Troubleshooting')
    # Cheat-sheet moves are found too (plan 4.7), under their chapter.
    run.search('hands-free')
    page.locator('#site-results a.search-hit[href^="./cheat-sheet.html#"]').first.wait_for()
    run.search('hat')
    page.locator(STEP).first.wait_for()
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


def test_symptom_phrasing_finds_the_fixes(run):
    """A learner types what is wrong, not the coach's words. Symptom words ("not working", "can't", "anything") need
    not be in a result and rank the Troubleshooting topics higher; synonyms cover click/metronome, slow/tempo,
    split/chop, effect/FX. When nothing has every word, the best partial matches come first, as "Close matches", above
    the link to Troubleshooting."""
    page = run.page
    run.go('./learn.html')
    groups = lambda: page.locator('#site-results .search-group-title').all_text_contents()
    titles = lambda: page.locator('#site-results .search-hit-title').all_text_contents()
    for q in ('arpeggio not working', 'cant hear anything', 'turn off the click', 'slow down the beat', 'no effect', 'split a sample'):
        run.search(q)
        assert page.locator('#site-results .search-hit').count() > 0, f'"{q}" finds something'
        assert not groups()[0].startswith('Close matches'), f'"{q}": every word is matched ({groups()})'
    run.search('arpeggio not working')
    assert groups()[0].startswith('Troubleshooting') and titles()[0] == 'The arpeggio does not play', (groups(), titles()[:3])
    run.search("can't hear anything")
    assert any(g.startswith('Troubleshooting') for g in groups())
    run.search('click')
    assert page.locator('#site-results mark', has_text='metronome').count() > 0, 'click finds metronome'
    run.search('slow down the beat')
    assert any('tempo' in t.lower() for t in titles()[:3]), titles()[:3]
    run.search('split a sample')
    assert any('chop' in t.lower() for t in titles()[:3]), titles()[:3]
    # Nothing has every word: close matches, then the way to Troubleshooting.
    run.search('hats zebra')
    assert groups()[0].startswith('Close matches') and 0 < page.locator('#site-results .search-hit').count() <= 5
    assert 'close match' in page.locator('#site-search-status').text_content()
    note = page.locator('#site-results .search-note')
    assert 'Nothing has every word of “hats zebra”' in note.text_content() and note.locator('a[href="./help.html"]').count() == 1
    assert page.evaluate("() => { const g = document.querySelector('#site-results .search-group'), n = document.querySelector('#site-results .search-note');"
                         " return Boolean(g.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING); }"), 'Close matches come above the note'
    run.search('zebra')
    assert page.locator('#site-results .search-group').count() == 0 and 'Nothing found for “zebra”' in page.locator('#site-results').text_content()
