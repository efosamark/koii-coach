"""The step player's newer parts, and the order of a risky step's text.

- Risk steps (static check of the HTML): the check that prevents loss comes before the press, the undo after it.
- Every step has a Check, except info and recap steps; a risk step names what it clears or deletes.
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
        # Plan principle 2: a check that prevents loss above the press, the undo or an explicit "No undo" after it.
        assert 'preflight' in s['parts'], f"{name}/{s['id']}: a risky step has Before you press ({s['parts']})"
        assert 'step-undo' in s['parts'] or 'step-noundo' in s['parts'], f"{name}/{s['id']}: a risky step has its undo or No undo"
        assert 'step-check' in s['parts'], f"{name}/{s['id']}: a risky step says what to check after the press"
        if s['risk'] in ('delete', 'overwrite', 'erase-scene'):
            assert 'step-noundo' in s['parts'], f"{name}/{s['id']}: an irreversible step says No undo"


@pytest.mark.parametrize('name', CHAPTERS)
def test_every_step_says_what_to_check(name):
    """Plan 5.3, 5.4(f) and 7.2: every step has one Check (what you hear or see afterwards), except an info or recap
    step; a risk step names what its press clears or deletes (p.step-consequence) between Before you press and the Do
    lines. A Check never says "You should" (CONTRIBUTING.md)."""
    page = (ROOT / f'{name}.html').read_text(encoding='utf-8')
    missing = []
    for sid, attrs, body in re.findall(r'<li data-step="([^"]+)"([^>]*)>(.*?)\n *</li>', page, re.S):
        kind = re.search(r'data-kind="([^"]+)"', attrs)
        checks = re.findall(r'<p class="step-check">(.*?)</p>', body, re.S)
        if kind and kind.group(1) in ('info', 'recap'):
            assert not checks and 'data-risk' not in attrs, f'{name}/{sid}: an info or recap step has no Check and no risk (plan 5.4 f)'
            continue
        if len(checks) != 1:
            missing.append(sid)
        elif re.search(r'\byou should\b', unescape(re.sub(r'<[^>]+>', '', checks[0])), re.I):
            missing.append(sid + ' ("You should")')
        if 'data-risk' in attrs:
            order = re.findall(r'\n\s*<p class="([^"]+)"', body)
            assert 'step-consequence' in order and order.index('step-consequence') < order.index('step-do') and \
                ('preflight' not in order or order.index('preflight') < order.index('step-consequence')), \
                f'{name}/{sid}: a risk step says what it clears, after Before you press and before the Do ({order})'
    assert not missing, f'{name}: steps without a Check: ' + ', '.join(missing)


def test_pad_plans():
    """Plan 5.2 and 6.4: Chapters 1–7 and the cheat sheet show each group's pads as a mini 3×4 grid, as on the unit,
    with a legend in words (the grid itself is hidden from screen readers)."""
    for name, n in [(c, 4) for c in CHAPTERS if c != 'setup'] + [('cheat-sheet', 28)]:
        page = (ROOT / f'{name}.html').read_text(encoding='utf-8')
        grids = re.findall(r'<figure class="padgrid">(.*?)</figure>', page, re.S)
        assert len(grids) == n, f'{name}: {len(grids)} pad grids'
        for g in grids:
            pads = re.findall(r'<span[^>]*>([^<]+)</span>', re.search(r'<div class="pads" aria-hidden="true">(.*?)</div>', g, re.S).group(1))
            assert pads == ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'ENTER'], f'{name}: {pads}'
            assert re.search(r'<p class="pad-legend">.+</p>', g), f'{name}: every grid has its legend'


def test_plain_words_on_every_page():
    """Plan 6.7: never "just", "simply" or "easy" (and CONTRIBUTING: never "make sure"). Quotes keep their words."""
    found = []
    for page in sorted(ROOT.glob('*.html')):
        html = re.sub(r'<script.*?</script>|<style.*?</style>|<!--.*?-->', '', page.read_text(encoding='utf-8'), flags=re.S)
        text = re.sub(r'“[^”]*”', '', unescape(re.sub(r'<[^>]+>', ' ', html)))
        found += [f'{page.name}: …{text[max(0, m.start() - 40):m.end() + 20].strip()}…'
                  for m in re.finditer(r'\b(just|simply|easy|easily|easier|make sure)\b', text, re.I)]
    assert not found, 'Words the plan rules out:\n' + '\n'.join(found)


# Chapters rewritten to the glance budget (plan 5.3, P7). Each step: a title of at most 48 characters; Do at most 26
# words in at most 3 sentences (a risk step: Before you press, its consequence and Do together at most 40); Check at
# most 15 words; undo
# at most 12. Add a chapter here when it is rewritten.
STRUCTURED = ['sampling', 'perform', 'hiphop', 'tech-house', 'thodorakis-house', 'setup', 'first-beat', 'song']


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
    for sid, attrs, body in re.findall(r'<li data-step="([^"]+)"([^>]*)>(.*?)\n *</li>', page, re.S):   # not a nested </li>
        title = re.search(r'<h3 class="step-title">(.*?)</h3>', body, re.S)
        field = lambda c: ' '.join(re.findall(rf'<p class="{c}">(.*?)</p>', body, re.S))
        do, pre, check, undo = field('step-do'), field('preflight') + ' ' + field('step-consequence'), field('step-check'), field('step-undo')
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
    run_ids = ['beat-live-practice', 'beat-live-play-along', 'beat-live-record', 'beat-live-record-tap', 'beat-live-record-stop', 'beat-live-undo', 'beat-live-erase-note', 'beat-live-beat-clean']
    box = page.locator('li[data-step="beat-live-practice"] .skip-box')
    assert box.is_visible() and f'Skip these {len(run_ids)} steps' in box.text_content(), 'The first of a run of optional steps offers to skip them all'
    total = page.evaluate('() => CoachChapter.total()')
    box.locator('[data-skip]').click()
    rec = run.get('koii-coach-ch-first-beat')
    assert rec['skip'] == run_ids, f'The run is saved as skipped ({rec})'
    assert page.evaluate('() => CoachChapter.total()') == total - len(run_ids), 'Skipped steps stop counting'
    page.wait_for_function(STEP + " === 'beat-recap'")
    page.locator('#toast button', has_text='Undo').click()
    page.wait_for_function(STEP + " === 'beat-live-practice'")
    assert run.get('koii-coach-ch-first-beat')['skip'] == [], 'Undo brings the steps back'


@pytest.mark.browser
def test_part_checkpoint_not_quite(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'new'}})
    run.go('./setup.html#s-listen-headphones-volume')  # the last step of Part 1
    page.locator('#player-next').click()
    page.locator('#player-check').wait_for(state='visible')
    assert 'Part 1 done' in page.locator('#player-check h2').text_content()
    assert page.locator('#player-check .led-row .led').count() == page.locator('.steps > details').count(), 'One LED per part'
    page.locator('#player-check .pc-not').click()
    assert page.locator('#player-check .pc-fix').is_visible() and page.locator('#player-check .fix-card').count() >= 1, 'The fixes, as symptom cards'
    assert run.get('koii-coach-meta')['checkpoints'] == {'setup': {'part-1': 'not-yet'}}
    page.locator('#player-check [data-redo]').click()
    page.wait_for_function(STEP + " === 'power-batteries'")
    assert run.get('koii-coach-ch-setup')['done'] == ['listen-headphones-volume'], 'A checkpoint answer never changes ticks'
    # One card per symptom (plan 5.9), the symptom first; a fix that names a step offers to redo it.
    run.go('./hiphop.html#s-check-source-heard')   # the last step of Part 3
    page.locator('#player-next').click()
    page.locator('#player-check .pc-not').click()
    cards = page.locator('#player-check .fix-card')
    assert cards.count() == 2, [cards.nth(i).text_content() for i in range(cards.count())]
    assert page.locator('#player-check .fix-sym').first.text_content().startswith('Check the input') is False
    redo = page.locator('#player-check [data-redo-step="check-source-heard"]')
    assert redo.text_content().endswith('step 8'), redo.text_content()
    redo.click()
    page.wait_for_function(STEP + " === 'check-source-heard'")


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
    # Scene numbers to keep, as LCD chips: what the learner noted, "–" for the rest (plan 5.9).
    assert card.locator('.pd-notes .note-pair').all_text_contents() == ['DRUMS –', 'BEAT –']
    # Back up now opens Chapter 0's backup part in a sheet, read-only; Back closes it.
    card.locator('[data-backup]').click()
    sheet = page.locator('#player-backup')
    sheet.locator('li[data-step="backup-open-tool"]').wait_for()
    assert sheet.locator('.check').count() == 0, 'Nothing to tick in the sheet'
    page.go_back()
    sheet.wait_for(state='hidden')
    assert page.url.endswith('#done')
    page.evaluate("() => localStorage.setItem('koii-coach-notes', JSON.stringify({v: 1, values: {'project-6/DRUMS': '3'}}))")
    run.go('./first-beat.html#done')
    assert page.locator('#player-done .pd-notes .note-pair').first.text_content() == 'DRUMS 3'
    # Every chapter's done screen lists its new moves.
    for ch, moves in (('setup', 6), ('sampling', 7), ('perform', 8), ('hiphop', 7), ('tech-house', 7), ('thodorakis-house', 7)):
        run.go(f'./{ch}.html#all')
        page.evaluate("() => CoachChapter.ids().filter(id => !/recap/.test(id)).forEach(id => CoachChapter.setDone(id, true))")
        run.go(f'./{ch}.html#done')
        page.locator('#player-done').wait_for(state='visible')
        assert page.locator('#player-done .pd-moves li').count() == moves, f'{ch}: New moves, from its recap'


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
    # Closing the sheet goes back in history (it added an entry when it opened): let that land before navigating on.
    page.wait_for_function("() => location.hash === '#s-beat-load-kick' && !(history.state && history.state.coachDialog)")
    page.wait_for_timeout(100)
    # A help link inside the step opens the sheet at that topic, expanded (the next step holds the kick's fixes).
    run.go('./first-beat.html#s-beat-hear-kick')
    step = page.locator('li[data-step="beat-hear-kick"]')
    step.locator('.step-more summary', has_text='Not working?').click()
    step.locator('a[href="./help.html#a-pad-is-silent"]').click()
    topic = page.locator('#tools-panel-fixes details[data-topic="a-pad-is-silent"]')
    topic.wait_for()
    assert topic.evaluate('d => d.open') and page.url.endswith('#s-beat-hear-kick'), 'The topic opens in the sheet; the page stays'


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


@pytest.mark.browser
def test_larger_text_and_left_hand(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./first-beat.html#s-beat-load-kick')
    do = page.locator('li[data-step="beat-load-kick"] > .step-do').first
    size = lambda: do.evaluate('e => parseFloat(getComputedStyle(e).fontSize)')
    side = lambda: page.locator('#player-actions .pa-row').evaluate('e => getComputedStyle(e).flexDirection')
    default = size()
    assert side() == 'row', 'Done · Next starts on the right'
    run.go('./settings.html')
    page.locator('input[name="text"][value="larger"]').check()
    page.locator('input[name="hand"][value="left"]').check()
    prefs = run.get('koii-coach-prefs')
    assert (prefs['text'], prefs['hand'], prefs['setup']) == ('larger', 'left', 'ready'), f'Both choices are saved, the rest kept ({prefs})'
    run.go('./first-beat.html#s-beat-load-kick')
    assert size() == 30 and size() > default, f'Larger sets Do at 30px ({size()} against {default})'
    assert side() == 'row-reverse', 'On the left puts Done · Next first'
    run.go('./settings.html')
    page.locator('#reset-settings').click()
    assert page.locator('input[name="text"][value="default"]').is_checked() and page.locator('input[name="hand"][value="right"]').is_checked(), 'Reset settings puts both back'


@pytest.mark.browser
def test_rhythm_lab(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./lab.html')
    beat = page.locator('#beat')
    assert beat.get_attribute('role') == 'grid' and page.locator('#beat button').count() == 64, 'All 64 cells stay in one grid'
    visible = lambda: page.locator('#beat button:visible')
    assert page.locator('#lab-tabs').is_visible() and visible().count() == 16, 'A phone shows one sound at a time'
    assert visible().nth(6).get_attribute('aria-label') == 'Kick A1, step 7, position 1.2.3', 'Row 2, column 3 is 1.2.3'
    page.locator('#lab-tab-1').click()
    assert visible().first.get_attribute('data-r') == '1' and page.locator('#lab-tab-1').get_attribute('aria-selected') == 'true'
    # One tab stop; the arrow keys move between cells (Down is the next beat on a phone).
    assert page.locator('#beat button[tabindex="0"]').count() == 1
    first = visible().first
    first.focus()
    page.keyboard.press('ArrowRight')
    page.keyboard.press('ArrowDown')
    assert page.evaluate('() => document.activeElement.dataset.c') == '5', 'Right then Down lands on 1.2.2'
    page.keyboard.press('Space')
    assert page.evaluate('() => document.activeElement.getAttribute("aria-pressed")') == 'true'
    # Steppers: the buttons and the arrow keys.
    page.locator('.step-btn[data-k="bpm"][data-d="1"]').click()
    page.locator('#bpm-text').focus()
    page.keyboard.press('ArrowUp')
    assert page.locator('#bpm-text').get_attribute('aria-valuenow') == '92', 'Tempo goes up one at a time'
    page.keyboard.press('End')
    assert page.locator('#bpm-text').text_content() == '160' and page.locator('.step-btn[data-k="bpm"][data-d="1"]').is_disabled()
    # Wider: four rows of 16, no tabs.
    page.set_viewport_size({'width': 1024, 'height': 800})
    page.wait_for_function("() => document.querySelector('#beat').classList.contains('wide')")
    assert not page.locator('#lab-tabs').is_visible() and visible().count() == 64
    # A Chapter 1 step's target rhythm links here (plan 4.6) and opens its rows only: kick and snare.
    run.go('./first-beat.html#all')
    href = page.locator('li[data-step] figure.pattern[data-rows="2"] .pattern-lab a').first.get_attribute('href')
    assert href == './lab.html#recipe-2'
    run.go('./lab.html#recipe-2')
    on = page.evaluate("() => [0, 1, 2, 3].map(r => document.querySelectorAll(`#beat button[data-r='${r}'][aria-pressed='true']`).length)")
    assert on == [4, 2, 0, 0], f'Kick and snare of the recipe only ({on})'


@pytest.mark.browser
def test_device_panel_landscape_and_desktop(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    page.set_viewport_size({'width': 844, 'height': 390})
    run.go('./first-beat.html#s-beat-bass-trim')
    panel = page.locator('#player-device')
    panel.locator('.control.hot').first.wait_for()
    assert panel.is_visible() and panel.bounding_box()['x'] == 0, 'A short landscape screen puts the keys on the left'
    order = page.evaluate("() => [...document.querySelectorAll('#player-device .press-order kbd')].map(k => k.textContent)")
    assert order[:3] == ['B1', 'SHIFT', 'SOUND'], f'Only the Do line\'s keys, in press order, not the Before you press warning ({order})'
    # Every Do line of every step in Chapter 1 ends above the action bar.
    over = page.evaluate("""async () => {
      const out = [];
      for (const id of CoachChapter.ids()) {
        location.hash = '#s-' + id;
        await new Promise(r => setTimeout(r, 60));
        const li = document.querySelector('li.is-current'); window.scrollTo(0, 0);
        const dos = li.querySelectorAll(':scope > .step-do'), last = dos[dos.length - 1];
        const bar = document.querySelector('#player-actions .pa-row').getBoundingClientRect().top;
        if (last && last.getBoundingClientRect().bottom > bar) out.push(id);
      }
      return out;
    }""")
    assert over == [], f'Steps whose Do runs under Done · Next at 844×390: {over}'
    # The list view has no panel.
    run.go('./first-beat.html#all')
    assert not panel.is_visible()
    # Desktop: the panel is on the right, and a tapped key is explained.
    page.set_viewport_size({'width': 1280, 'height': 900})
    run.go('./first-beat.html#s-beat-load-kick')
    panel.locator('.control.hot').first.wait_for()
    assert panel.bounding_box()['x'] > 900
    panel.locator('.control[data-key="SOUND"]').click()
    assert 'SOUND' in panel.locator('.map-info').text_content()
    # Tools takes the right panel's place (plan 5.7): it never covers the step card.
    page.locator('#player-tools-btn').click()
    sheet = page.locator('#tools-sheet')
    sheet.wait_for(state='visible')
    card = page.locator('li.is-current').bounding_box()
    assert sheet.bounding_box()['x'] >= card['x'] + card['width'], 'The Tools sheet sits beside the card, not over it'
    # 1024–1199px has no right panel: the sheet docks, the rail steps aside and the page makes room for it; the page
    # still scrolls, so a long step's Check can come into view.
    page.keyboard.press('Escape')
    sheet.wait_for(state='hidden')
    page.set_viewport_size({'width': 1024, 'height': 768})
    run.go('./tech-house.html#s-add-open-hats')
    page.keyboard.press('t')
    sheet.wait_for(state='visible')
    card = page.locator('li.is-current').bounding_box()
    assert sheet.bounding_box()['x'] >= card['x'] + card['width'] - 1, 'At 1024px the docked sheet does not cover the card'
    assert card['width'] >= 500 and not page.locator('.rail').is_visible(), 'The card keeps its width'
    check = page.locator('li.is-current .step-check')
    page.mouse.move(300, 400)
    for _ in range(6):
        page.mouse.wheel(0, 200)
    page.wait_for_function("() => document.querySelector('li.is-current .step-check').getBoundingClientRect().bottom < document.querySelector('#player-actions').getBoundingClientRect().top")
    assert sheet.is_visible() and check.is_visible()
    page.keyboard.press('Escape')
    sheet.wait_for(state='hidden')
    assert page.locator('.rail').is_visible(), 'The rail is back when Tools closes'


@pytest.mark.browser
def test_start_screen_on_one_screen_and_list_banner(run):
    """Plan 5.2: a first visit shows the promise, the chips, "Before you start" rows and the parts; the long preamble
    waits in "About this chapter in full". Plan 5.10: All steps puts "You're on Part N, step X of M · Continue" in the
    first screen."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    for ch in ('setup', 'first-beat', 'song', 'sampling', 'perform', 'hiphop', 'tech-house', 'thodorakis-house'):
        run.go(f'./{ch}.html')
        assert page.locator('main > .promise').is_visible() and 3 <= page.locator('.needs-list li:visible').count() <= 5, ch
        intro = page.locator('main > p:not([class])').first
        assert not intro.is_visible(), f'{ch}: the long intro waits in "About this chapter in full"'
        more = page.locator('.player-more')
        more.locator('summary').click()
        assert more.locator('.inside p').first.is_visible()
    # One screen (decision 24): on a first visit, with the safety notes open (a short list; the notes in full wait in
    # "About this chapter in full"), the Parts heading is wholly above the action bar in every chapter at 390×844, and
    # at 360×740 in the chapters with no safety box, or in all once the box is closed. From 1024px the parts stand
    # beside the rest.
    def parts_on_screen(ch, rows=0, closed=False, inset=0, safety=False):
        run.go(f'./{ch}.html')
        if closed:   # as once the chapter has a ticked step
            page.evaluate("() => { const s = document.querySelector('.player-safety'); if (s) s.open = false; }")
        bar = page.locator('#player-actions').bounding_box()['y'] - inset
        last = page.locator('.pp-list li').nth(rows - 1) if rows else page.locator('#player-parts-title')
        box = last.bounding_box()
        fits = box['y'] + box['height'] <= bar
        if safety and page.locator('.player-safety .safety-short').count():
            notes = page.locator('.player-safety .safety-short li:not(.safety-more)').last.bounding_box()
            fits = fits and notes['y'] + notes['height'] <= bar
        return fits
    chapters = ('setup', 'first-beat', 'song', 'sampling', 'perform', 'hiphop', 'tech-house', 'thodorakis-house')
    for ch in chapters:   # also with an installed app's 34px safe-area inset
        assert parts_on_screen(ch, inset=34), f'{ch}: the Parts heading is on the first screen at 390×844'
    page.set_viewport_size({'width': 360, 'height': 740})
    for ch in ('first-beat', 'song', 'hiphop'):
        assert parts_on_screen(ch), f'{ch}: the Parts heading is on the first screen at 360×740'
    for ch in chapters:
        assert parts_on_screen(ch, closed=True), f'{ch}: with the safety box closed, the Parts heading fits at 360×740'
    # The warnings come before "Before you start" (decision 24): every line of the box is on the first screen.
    for ch in chapters:
        run.go(f'./{ch}.html')
        if not page.locator('.player-safety summary').count():
            continue
        bar = page.locator('#player-actions').bounding_box()['y']
        last = page.locator('.player-safety .inside > ul > li').last.bounding_box()
        assert last['y'] + last['height'] <= bar, f'{ch}: the safety notes are on the first screen at 360×740'
        assert page.evaluate("() => Boolean(document.querySelector('.player-safety').compareDocumentPosition(document.querySelector('main > .needs')) & Node.DOCUMENT_POSITION_FOLLOWING)"), ch
    # Beside the rail (which lists every part): the safety notes and the Parts heading on a laptop's first screen.
    for size in ({'width': 1024, 'height': 768}, {'width': 1280, 'height': 720}):
        page.set_viewport_size(size)
        for ch in chapters:
            assert parts_on_screen(ch, safety=True), f'{ch}: at {size} the safety notes and Parts are on the first screen'
        assert page.locator('.rail .rail-chapter, .rail').first.is_visible()
    page.set_viewport_size({'width': 1366, 'height': 768})
    for ch in chapters:
        assert parts_on_screen(ch, rows=3, safety=True), f'{ch}: from 1360px the parts list is beside the rest'
    page.set_viewport_size({'width': 390, 'height': 844})
    # The safety box names the actions its heading counts, with their keys.
    run.go('./sampling.html')
    assert page.locator('.player-safety').get_attribute('open') is not None and page.locator('.player-safety .safety-short li').count() == 3
    assert '1 action here' in page.locator('.player-safety summary').text_content()
    assert 'Cropping a sample' in page.locator('.player-safety .safety-short li').first.text_content()
    run.go('./perform.html')
    assert '2 actions here' in page.locator('.player-safety summary').text_content()
    assert 'ERASE + MAIN' in page.locator('.player-safety .safety-short li').first.text_content()
    run.go('./sampling.html')
    assert page.locator('.player-more .inside .notice.danger').count() == 1, 'The safety notice in full is under "About this chapter in full"'
    # All steps with progress: the banner is in the first screen, and Continue goes to the step.
    run.go('./sampling.html#all')
    page.evaluate("() => { CoachChapter.setDone('open-empty-project', true); CoachChapter.setDone('choose-mic-source', true); }")
    run.go('./sampling.html#all')
    banner = page.locator('.list-resume')
    banner.wait_for()
    assert banner.bounding_box()['y'] < 844 and 'step' in banner.text_content()
    banner.get_by_role('button', name='Continue').click()
    page.wait_for_function("() => document.activeElement && document.activeElement.closest('li[data-step]')")


@pytest.mark.browser
def test_notes_scene_numbers(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./first-beat.html#s-beat-performance')
    field = page.locator('li[data-step="beat-performance"] input[data-note-name="BEAT"]')
    field.fill('4x')
    assert field.input_value() == '4', 'Only digits'
    assert run.get('koii-coach-notes') == {'v': 1, 'values': {'project-6/BEAT': '4'}}, 'Kept per project'
    # Chapter 2 is in the same project: a step that names BEAT shows the number.
    run.go('./song.html#s-song-select-beat')
    recall = page.locator('li[data-step="song-select-beat"] .note-recall')
    assert recall.is_visible() and 'BEAT 4' in recall.text_content()
    # Another project does not see it: Chapter 6's notes are its own.
    run.go('./tech-house.html#s-commit-groove')
    assert page.locator('.note-recall').count() == 0
    # Get back in lists the notes after a break.
    page.evaluate("() => localStorage.setItem('koii-coach-ch-song', JSON.stringify({v: 1, done: ['song-find-beat'], last: 'song-find-beat', n: 1, at: new Date(Date.now() - 3 * 3600e3).toISOString()}))")
    run.go('./song.html')
    box = page.locator('.getback')
    box.wait_for()
    assert 'BEAT 4' in box.text_content(), 'Get back in shows your notes'


def test_os_badges_follow_settings_in_every_chapter(run):
    """Plan 7.2 and 8.1: every step that needs a newer OS says so in every chapter, following the OS chosen in Settings
    (koii-coach-v2.firmware): a warning for an older OS; for a new enough one, the step player's head tag only."""
    page = run.page
    base = {'schema': 4, 'step': 0, 'stepId': 'beat-empty-project', 'note': 0, 'song': 0, 'songId': 'song-find-beat', 'view': 'first',
            'done': [], 'finished': False, 'songFinished': False, 'lab': None}
    tagged = {}
    for fw in ('older', '2.5'):
        run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready', 'modes': {}}, 'koii-coach-v2': dict(base, firmware=fw)})
        for ch in ('song', 'sampling', 'perform', 'hiphop', 'tech-house', 'thodorakis-house'):
            run.go(f'./{ch}.html#all')
            n, warn, ok = page.evaluate("""() => { const s = [...document.querySelectorAll('li[data-os]')];
                return [s.length, s.filter(li => li.querySelector(':scope > .badge.warn')).length, s.filter(li => li.querySelector(':scope > .badge.ok')).length]; }""")
            tagged[ch] = n
            assert n > 0, f'{ch}: some steps need a newer OS'
            if fw == 'older':
                assert warn == n, f'{ch}: {warn} of {n} OS steps warn with an older OS chosen'
            else:
                assert ok == n, f'{ch}: {ok} of {n} OS steps say the chosen OS has it'
    # In the step player, the head carries the tag and the "has it" badge stays out of the way.
    run.go('./perform.html#s-sc-open')
    page.wait_for_function("() => (document.querySelector('li.is-current') || {dataset: {}}).dataset.step === 'sc-open'")
    assert page.locator('li.is-current .step-head .tag.os').text_content() == 'Needs OS 2.0+'
    assert not page.locator('li.is-current > .badge.ok').is_visible()
