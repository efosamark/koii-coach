"""The step player's newer parts, and the order of a risky step's text.

- Risk steps (static check of the HTML): the check that prevents loss comes before the press, the undo after it.
- Skipping a run of optional steps: they stop counting, the player moves past them, the toast can undo it.
- A part's checkpoint: "Not quite" shows the fix and is kept in koii-coach-meta.checkpoints; it never changes a tick.
- Chapter complete: arriving ticks the recap once everything else is done, and shows what you made and the new moves.
- The Tools sheet: the step's keys on the map in press order, its help topics, the other tabs, T to open it, and a
  help link in a step opening it at that topic.
- The menu's "This chapter" tab jumps to a step without ticking it; keyboard shortcuts and their off switch.
Run after a build, like test_smoke.py:  python -m pytest tests/test_player.py
"""
import pathlib
import re
from html import unescape
from html.parser import HTMLParser
from urllib.parse import urljoin

import pytest

from support import watch

ROOT = pathlib.Path(__file__).resolve().parents[1]
CHAPTERS = ['setup', 'first-beat', 'song', 'sampling', 'perform', 'hiphop', 'tech-house', 'thodorakis-house']


class Steps(HTMLParser):
    """Each step's data-step, data-risk and the classes of its direct <p> children, in order."""

    def __init__(self):
        super().__init__()
        self.steps, self.depth, self.li = [], 0, None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'li' and 'data-step' in a:
            self.li = {'id': a['data-step'], 'risk': a.get('data-risk'), 'parts': [], 'depth': self.depth}
            self.steps.append(self.li)
        elif self.li and tag == 'p' and self.depth == self.li['depth'] + 1:
            self.li['parts'].append(a.get('class') or '')
        if tag not in ('br', 'img', 'input', 'meta', 'link', 'source', 'hr', 'wbr'):
            self.depth += 1

    def handle_endtag(self, tag):
        if tag in ('br', 'img', 'input', 'meta', 'link', 'source', 'hr', 'wbr'):
            return
        self.depth -= 1
        if tag == 'li' and self.li and self.depth == self.li['depth']:
            self.li = None


@pytest.mark.parametrize('name', CHAPTERS)
def test_risky_steps_check_before_the_press_and_undo_after(name):
    parser = Steps()
    parser.feed((ROOT / f'{name}.html').read_text(encoding='utf-8'))
    risky = [s for s in parser.steps if s['risk']]
    for s in parser.steps:
        parts = s['parts']
        assert 'step-do' in parts, f"{name}/{s['id']}: every step has a Do line"
        first_do, last_do = parts.index('step-do'), len(parts) - 1 - parts[::-1].index('step-do')
        for i, cls in enumerate(parts):
            if cls == 'preflight':  # it guards the press that follows it (a step may first say where to go)
                assert i < last_do, f"{name}/{s['id']}: Before you press comes before the press ({parts})"
            if cls in ('step-undo', 'step-noundo', 'step-check'):
                assert i > first_do, f"{name}/{s['id']}: {cls} comes after the press ({parts})"
    for s in risky:
        assert s['parts'].count('step-do') >= 1, f"{name}/{s['id']}: a risky step names its press in a Do line"


# Chapters rewritten to the glance budget (plan 5.3, P7). Each step: a title of at most 48 characters; Do at most 26
# words in at most 3 sentences (a risk step: Before you press and Do together at most 40); Check at most 15 words; undo
# at most 12. Add a chapter here when it is rewritten.
STRUCTURED = ['sampling', 'perform']


def _words(h):
    h = re.sub(r'</kbd>\s*\+\s*<kbd', '</kbd> <kbd', h)   # SHIFT + B is one chord
    text = re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', ' ', h)))
    return [w for w in text.split() if re.search(r'[\w−+]', w)]


def _sentences(h):
    text = re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', '', h))).strip()
    text = re.sub(r'K\.O\. II', 'KO II', text)
    return [s for s in re.split(r'(?<=[.?!])\s+(?=[A-Z“(])', text) if s]


@pytest.mark.parametrize('name', STRUCTURED)
def test_glance_budget(name):
    page = (ROOT / f'{name}.html').read_text(encoding='utf-8')
    over = []
    for sid, attrs, body in re.findall(r'<li data-step="([^"]+)"([^>]*)>(.*?)</li>', page, re.S):
        title = re.search(r'<h3 class="step-title">(.*?)</h3>', body, re.S)
        field = lambda c: ' '.join(re.findall(rf'<p class="{c}">(.*?)</p>', body, re.S))
        do, pre, check, undo = field('step-do'), field('preflight'), field('step-check'), field('step-undo')
        risk = 'data-risk' in attrs
        problems = []
        if not title or len(unescape(re.sub(r'<[^>]+>', '', title.group(1)))) > 48:
            problems.append('title')
        if len(_words(do)) + (len(_words(pre)) if risk else 0) > (40 if risk else 26) or len(_sentences(do)) > 3:
            problems.append(f'do {len(_words(do))}w/{len(_sentences(do))}')
        if len(_words(re.sub(r'<span class="sr">Check: </span>', '', check))) > 15:
            problems.append('check')
        if len(_words(undo)) > 12:
            problems.append('undo')
        if problems:
            over.append(f'{sid}: ' + ', '.join(problems))
    assert not over, f'{name}: steps over the glance budget: ' + '; '.join(over)


@pytest.fixture
def run(browser, site_url):
    """A fresh phone-sized page on the built site, plus helpers to seed and read localStorage."""
    context = browser.new_context(viewport={'width': 390, 'height': 844})
    page = context.new_page()
    page.set_default_timeout(15000)
    errors, bad = [], []
    watch(page, site_url, errors, bad)

    class Run:
        def __init__(self):
            self.page = page

        def go(self, href):
            page.goto('about:blank')
            page.goto(urljoin(site_url, href), wait_until='networkidle')

        def seed(self, values):
            page.goto(urljoin(site_url, 'manifest.webmanifest'))  # same origin, runs no page script
            page.evaluate('v => { localStorage.clear(); for (const [k, x] of Object.entries(v)) localStorage.setItem(k, JSON.stringify(x)); }', values)

        def get(self, key):
            return page.evaluate('k => JSON.parse(localStorage.getItem(k) || "null")', key)

    yield Run()
    context.close()
    assert errors == [], 'Browser JavaScript errors'
    assert bad == [], 'Failed app assets'


STEP = "(document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step"


@pytest.mark.browser
def test_skip_a_run_of_optional_steps(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./first-beat.html#s-beat-live-practice')
    box = page.locator('li[data-step="beat-live-practice"] .skip-box')
    assert box.is_visible() and 'Skip these 3 steps' in box.text_content(), 'The first of three optional steps offers to skip them'
    total = page.evaluate('() => CoachChapter.total()')
    box.locator('[data-skip]').click()
    rec = run.get('koii-coach-ch-first-beat')
    assert rec['skip'] == ['beat-live-practice', 'beat-live-record', 'beat-live-undo'], f'The run is saved as skipped ({rec})'
    assert page.evaluate('() => CoachChapter.total()') == total - 3, 'Skipped steps stop counting'
    page.wait_for_function(STEP + " === 'beat-recap'")
    page.locator('#toast button', has_text='Undo').click()
    page.wait_for_function(STEP + " === 'beat-live-practice'")
    assert run.get('koii-coach-ch-first-beat')['skip'] == [], 'Undo brings the steps back'


@pytest.mark.browser
def test_part_checkpoint_not_quite(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'new'}})
    run.go('./setup.html#s-listen-headphones')
    page.locator('#player-next').click()
    page.locator('#player-check').wait_for(state='visible')
    assert 'Part 1 done' in page.locator('#player-check h2').text_content()
    assert page.locator('#player-check .led-row .led').count() == page.locator('.steps > details').count(), 'One LED per part'
    page.locator('#player-check .pc-not').click()
    assert page.locator('#player-check .pc-fix').is_visible() and 'If it doesn' in page.locator('#player-check .pc-fix').text_content()
    assert run.get('koii-coach-meta')['checkpoints'] == {'setup': {'part-1': 'not-yet'}}
    page.locator('#player-check [data-redo]').click()
    page.wait_for_function(STEP + " === 'power-batteries'")
    assert run.get('koii-coach-ch-setup')['done'] == ['listen-headphones'], 'A checkpoint answer never changes ticks'


@pytest.mark.browser
def test_chapter_complete_ticks_the_recap(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./first-beat.html#all')
    ids = page.evaluate("() => CoachChapter.ids().filter(id => id !== 'beat-recap')")
    page.evaluate('ids => ids.forEach(id => CoachChapter.setDone(id, true))', ids)
    run.go('./first-beat.html#done')
    page.locator('#player-done').wait_for(state='visible')
    assert 'beat-recap' in run.get('koii-coach-ch-first-beat')['done'], 'Arriving at #done ticks the recap'
    card = page.locator('#player-done')
    assert 'Chapter 1 done' in card.locator('h2').text_content()
    assert card.locator('.pd-made').text_content().startswith('You made:'), 'You made, from the page'
    assert card.locator('.pd-moves li').count() == 6, 'New moves, from the recap'
    assert card.locator('.led-row .led.on').count() == 16


@pytest.mark.browser
def test_tools_sheet(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./first-beat.html#s-beat-load-kick')
    page.locator('#player-tools-btn').click()
    sheet = page.locator('#tools-sheet')
    sheet.wait_for(state='visible')
    assert page.locator('#tools-tab-step').get_attribute('aria-selected') == 'true', 'It opens on For this step'
    page.locator('#tools-panel-step .press-order').wait_for()
    hot = page.evaluate("() => [...document.querySelectorAll('#tools-panel-step .control.hot')].map(c => c.dataset.key + ':' + c.querySelector('.order').textContent)")
    assert hot[:2] == ['SOUND:1', 'A:2'], f'The step\'s keys, numbered in press order ({hot})'
    for tab, sel in (('map', '.control[aria-pressed]'), ('fixes', 'details.tools-topic'), ('words', '.tools-gloss .term'), ('cheat', '.tools-cheat')):
        page.locator(f'#tools-tab-{tab}').click()
        page.locator(f'#tools-panel-{tab} {sel}').first.wait_for()
    page.keyboard.press('Escape')
    sheet.wait_for(state='hidden')
    page.locator('body').click(position={'x': 5, 'y': 400})
    page.keyboard.press('t')
    sheet.wait_for(state='visible')
    page.keyboard.press('Escape')
    sheet.wait_for(state='hidden')
    # A help link inside the step opens the sheet at that topic, expanded.
    step = page.locator('li[data-step="beat-load-kick"]')
    step.locator('.step-more summary', has_text='Not working?').click()
    step.locator('a[href="./help.html#a-pad-is-silent"]').click()
    topic = page.locator('#tools-panel-fixes details[data-topic="a-pad-is-silent"]')
    topic.wait_for()
    assert topic.evaluate('d => d.open') and page.url.endswith('#s-beat-load-kick'), 'The topic opens in the sheet; the page stays'


@pytest.mark.browser
def test_menu_jump_and_shortcuts(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./sampling.html#s-record-kick')
    page.locator('.menu-btn').click()
    assert page.locator('#shell-menu [data-tab="chapter"]').get_attribute('aria-pressed') == 'true', 'A chapter page opens the menu on This chapter'
    page.locator('#shell-menu .chapter-pane [data-jump="record-snare"]').click()
    page.wait_for_function(STEP + " === 'record-snare'")
    assert run.get('koii-coach-ch-sampling')['done'] == [], 'A jump ticks nothing'
    pill = page.locator('.back-pill')
    assert not pill.is_visible(), 'No progress yet: no way back to show'
    # Shortcuts: ? lists them; M opens the menu; with letter shortcuts off, M does nothing but Ctrl+K still searches.
    run.go('./index.html')
    page.keyboard.press('?')
    page.locator('#shell-keys').wait_for(state='visible')
    page.keyboard.press('Escape')
    page.locator('#shell-keys').wait_for(state='hidden')
    page.wait_for_timeout(300)  # closing gives back the dialog's history entry first
    page.keyboard.press('m')
    page.locator('#shell-menu').wait_for(state='visible')
    page.keyboard.press('Escape')
    page.locator('#shell-menu').wait_for(state='hidden')
    page.wait_for_timeout(300)
    page.evaluate("() => CoachProgress.patch('koii-coach-prefs', {keys: false})")
    page.keyboard.press('m')
    page.wait_for_timeout(300)
    assert not page.locator('#shell-menu').is_visible(), 'Letter shortcuts can be switched off'
    page.keyboard.press('Control+k')
    page.locator('#site-search-dialog').wait_for(state='visible')
    assert run.get('koii-coach-prefs')['keys'] is False


@pytest.mark.browser
def test_renumbered_course(run):
    """The course reads Chapter 0-7 in teaching order; a renumbered chapter says what it was, and search still finds it."""
    page = run.page
    run.go('./sampling.html#start')
    assert page.locator('header .eyebrow').text_content().startswith('CHAPTER 3 /')
    assert 'Formerly 07' in page.locator('.player-chips').text_content(), 'A renumbered chapter shows "Formerly 07"'
    assert page.locator('h1').text_content() == 'Sample, chop & resample'
    run.go('./setup.html#start')
    assert page.locator('h1').text_content() == 'Set up your K.O. II' and 'Formerly' not in page.locator('.player-chips').text_content()
    page.keyboard.press('/')
    page.locator('#site-search').fill('07')
    hit = page.locator('#site-results a.search-hit').first
    hit.wait_for()
    assert hit.get_attribute('href') == './sampling.html' and 'Chapter 3' in hit.text_content(), 'Search maps "07" to Chapter 3'
    page.locator('#site-search').fill('start here')
    page.locator('#site-results a.search-hit[href="./setup.html"]').first.wait_for()
