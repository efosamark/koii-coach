"""The step player's newer parts, and the order of a risky step's text.

- Risk steps (static check of the HTML): the check that prevents loss comes before the press, the undo after it.
- Every step has a Check, except info and recap steps; a risk step names what it clears or deletes.
- Every Troubleshooting topic is linked from a chapter page.
- Skipping a run of optional steps, or a route (data-route): they stop counting, the player moves past them, the toast
  can undo it.
- A ticked data-once step shown again (Back, a menu jump, Redo Part N) says not to press again; Restart says what the
  K.O. II keeps.
- A part's checkpoint: the next part's size, the steps left and the switch-off line; "Not quite" shows the fix and is
  kept in koii-coach-meta.checkpoints (going on from it keeps it, the done screen offers the part again, a later Yes
  clears it); it never changes a tick.
- Chapter complete: arriving ticks the recap once everything else is done, and shows what you made and the new moves,
  the system settings left changed, Save your progress file, the chapters that open up and, after Chapter 7, Make your
  own track. The start screen says which chapters a chapter needs.
- The Tools sheet: the step's keys on the map in press order, its help topics, its part's fixes, the other tabs, T to
  open it, and a help link in a step opening it at that topic.
- Recall: a recap's "Label: answer" moves as closed rows; a data-recall step's presses behind "Show the presses".
- Get back in on Continue's #s-<cur> after a break: the part's Goal and the notes, never the last Check.
- The menu's "This chapter" tab jumps to a step without ticking it; keyboard shortcuts and their off switch.
- Target beats: every row has a sound of its own; data-late and data-pitch shift a pad's rows in time and pitch (the
  grid keeps them on their step); a "Hear the difference" pair plays one at a time. The Rhythm lab's Swing.
Run after a build, like test_smoke.py:  python -m pytest tests/test_player.py
"""
import json
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


def test_every_help_topic_is_linked_from_a_chapter():
    """Every Troubleshooting topic is linked from a step or a part on a chapter page, so Tools › Fixes offers it where
    the problem happens. The OS 2.5 overview is reference, reached from Learn and search."""
    topics = re.findall(r'<details[^>]*\bid="([^"]+)"', (ROOT / 'help.html').read_text(encoding='utf-8'))
    pages = ''.join((ROOT / f'{c}.html').read_text(encoding='utf-8') for c in CHAPTERS)
    linked = set(re.findall(r'help\.html#([\w-]+)"', pages))
    missing = [t for t in topics if t not in linked and t != 'where-are-the-new-os-2-5-features']
    assert len(topics) > 20 and not missing, 'Topics no chapter links to: ' + ', '.join(missing)


def test_plain_words_on_every_page():
    """Plan 6.7: never "just", "simply" or "easy" (and CONTRIBUTING: never "make sure"). Quotes keep their words."""
    found = []
    for page in sorted(ROOT.glob('*.html')):
        html = re.sub(r'<script.*?</script>|<style.*?</style>|<!--.*?-->', '', page.read_text(encoding='utf-8'), flags=re.S)
        text = re.sub(r'“[^”]*”', '', unescape(re.sub(r'<[^>]+>', ' ', html)))
        found += [f'{page.name}: …{text[max(0, m.start() - 40):m.end() + 20].strip()}…'
                  for m in re.finditer(r'\b(just|simply|easy|easily|easier|make sure)\b', text, re.I)]
    assert not found, 'Words the plan rules out:\n' + '\n'.join(found)


VOICE = re.compile(
    r'teaching (text|recipe)|\bour (teaching )?recipe\b|\bthe recipe\b|hardware (steps|instructions)|checked against|'
    r'checked on \d|creative suggestions|manufacturer presets|(this|the) (page|app|coach|browser) (cannot|can’t|can not) '
    r'(see|check|capture|operate)|the official guide says|official guide (says|describes|is silent)|where the guide|'
    r'\b(we|our|us)\b|'
    # Sources cited in the text: the step's Source link is the only citation on a page.
    r'\bowners(’|\')? (report|agree|differ|say|tools)|as owners report|elektronauts|reddit|unofficial cheat sheet|'
    r'as the pictures in|labelled drawing|the guide calls|uses the same words|(isn’t|is not|not) documented|'
    r'the likeliest way|last checked', re.I)
# Links to forums and owners' cheat sheets, which the text no longer cites.
FORUMS = re.compile(r'href="https?://(?:www\.)?(?:elektronauts\.com|reddit\.com|ep133\.joeyh\.org)', re.I)


def test_voice():
    """CONTRIBUTING §3 "Voice": pages talk about the music and the K.O. II, not about how the course was made."""
    found = []
    for page in sorted(ROOT.glob('*.html')):
        html = re.sub(r'<script.*?</script>|<style.*?</style>|<!--.*?-->', '', page.read_text(encoding='utf-8'), flags=re.S)
        text = re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', ' ', html)))
        found += [f'{page.name}: …{text[max(0, m.start() - 40):m.end() + 30].strip()}…' for m in VOICE.finditer(text)]
        found += [f'{page.name}: a link to {m.group(0)[6:]}' for m in FORUMS.finditer(html)]
    for script in sorted(ROOT.glob('*.js')):
        source = re.sub(r'/\*.*?\*/|^\s*//.*$', '', script.read_text(encoding='utf-8'), flags=re.S | re.M)
        for literal in re.findall(r"'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`", source):
            found += [f'{script.name}: {literal[:80]}' for m in VOICE.finditer(literal) if m.group(0).lower() not in ('us',)]
    assert not found, 'Process notes on a page (CONTRIBUTING §3 "Voice"):\n' + '\n'.join(found)


def test_home_made_matches_each_chapter():
    """Home's course-complete card lists site.js "made", which must say what each page's "You will make" line says."""
    site = (ROOT / 'site.js').read_text(encoding='utf-8')
    for href, made in re.findall(r"href:'\./([\w-]+\.html)'[^}]*?made:'((?:[^'\\]|\\.)*)'", site):
        line = re.search(r'<p class="makes">(.*?)</p>', (ROOT / href).read_text(encoding='utf-8'), re.S).group(1)
        line = re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', '', line))).strip()
        assert re.sub(r'^You will (make|have): ', '', line).rstrip('.') == made.replace("\\'", "'"), href


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
            # A sheet closed just before removes its history entry with history.back(), a moment later; a goto started
            # before that lands is aborted by it. Wait until no sheet's entry is left.
            page.wait_for_function("() => !(history.state && history.state.coachDialog) || !!document.querySelector('dialog[open]')")
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
def test_punctuation_stays_with_its_keycap(run):
    """No line starts with the comma or full stop after a keycap, chord or display chip: shell.js glues them."""
    find = r"""() => [...document.querySelectorAll('.key,.lcd,.chord')].filter(el => {
        const up = el.parentElement;
        if (!up || up.closest('.chord') || up.classList.contains('nobr')) return false;
        const t = el.nextSibling;
        return t && t.nodeType === 3 && /^[.,;:!?)\]…’”]/.test(t.nodeValue);
    }).map(el => el.closest('[data-step]') ? el.closest('[data-step]').dataset.step : el.textContent)"""
    for name in CHAPTERS + ['cheat-sheet', 'safety', 'glossary']:
        run.go(f'./{name}.html')
        assert run.page.evaluate(find) == [], f'{name}: punctuation not kept with its keycap'


@pytest.mark.browser
def test_report_by_email_only_when_an_address_is_set(run):
    """site.js reportEmail empty: GitHub only. Set: each step and "Report a wrong instruction" also offer "by email"."""
    run.go('./sampling.html#s-record-kick')
    page = run.page
    page.wait_for_function("() => document.documentElement.dataset.player === 'step'")
    assert not page.locator('#player-report-mail').is_visible()
    page.evaluate("() => { window.COACH_SITE.reportEmail = 'learner@example.org'; }")
    page.locator('#player-next').click()
    mail = page.locator('#player-report-mail')
    mail.wait_for(state='visible')
    href = mail.get_attribute('href')
    assert href.startswith('mailto:learner@example.org?subject=') and 'Chapter%203' in href and 'What%20my%20K.O.%20II%20did%20instead' in href
    run.go('./help.html')
    assert page.locator('#report + .report-mail').count() == 0, 'No email link while reportEmail is empty'


@pytest.mark.browser
def test_target_beats_match_their_text(run):
    """beat.js draws every figure.pattern from its own text list: one lit cell per written position, one 16-cell block
    per bar up to the highest bar written, and a Hear it button. Chapter 1 keeps its figures; Chapters 2, 3, 5, 6 and 7
    gain them. Every row's name picks its sound: none falls back to the rim click. In the player every cell of a beat
    is the same square."""
    count = r"""() => [...document.querySelectorAll('figure.pattern')].map(f => {
        const written = f.querySelectorAll('.pattern-text samp').length;
        const lit = f.querySelectorAll('.strip-cell.on').length;
        const bars = Math.max(...[...f.querySelectorAll('.pattern-text samp')].map(s => Number(s.textContent.split('.')[0])));
        const sizes = new Set([...f.querySelectorAll('.strip-cell')].map(c => { const r = c.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); }));
        return {written, lit, cells: f.querySelectorAll('.strip-cell').length / Math.max(1, f.querySelectorAll('.strip-name').length),
                blocks: f.querySelectorAll('.strip').length, bars, sizes: [...sizes], button: !!f.querySelector('.hear-btn')};
    })"""
    seen = 0
    for name in ['first-beat', 'song', 'sampling', 'hiphop', 'tech-house', 'thodorakis-house']:
        run.go(f'./{name}.html#all')
        figs = run.page.evaluate(count)
        assert figs, f'{name} has target beats'
        for f in figs:
            assert f['lit'] == f['written'] and f['cells'] == 16 and f['blocks'] == f['bars'] and f['button'], f'{name}: {f}'
        rim = run.page.evaluate("() => CoachBeat.figures.flatMap(f => f.rows).filter(r => r.voice === 'rim' && !/rim|click/i.test(r.name)).map(r => r.name)")
        assert rim == [], f'{name}: rows with no sound of their own play as rim: {rim}'
        seen += len(figs)
    assert seen >= 21 + 6, f'only {seen} target beats'
    run.go('./tech-house.html#s-bass-answer-b2')
    run.page.evaluate("() => { document.querySelector('li.is-current .step-hear').open = true; }")
    for f in run.page.evaluate(count):
        if f['sizes'] != ['0x0']:
            assert len(f['sizes']) == 1 and f['sizes'][0].split('x')[0] == f['sizes'][0].split('x')[1], f'cells differ: {f["sizes"]}'


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
    # Going forward never lands on a skipped step (Back and the menu still can): from the last step of Part 5,
    # Done · Next and the checkpoint's Yes pass the skipped run and land on the recap, which is where cur goes.
    page.evaluate('ids => CoachChapter.setSkipped(ids, true)', run_ids)
    run.go('./first-beat.html#s-beat-perform')
    page.locator('#player-next').click()
    page.locator('#player-check').wait_for(state='visible')
    assert run.get('koii-coach-ch-first-beat')['cur'] == 'beat-recap', 'cur passes the skipped run'
    page.locator('#player-next').click()
    page.wait_for_function(STEP + " === 'beat-recap'")


@pytest.mark.browser
def test_skip_a_route(run):
    """data-route (written by the content lane; set here on real steps before the player reads the page): consecutive
    steps with the same question are a run with its own skip box, untagged. Skipping one route lands on the other, and
    the chapter completes without it."""
    page = run.page
    line = ['line-connect', 'line-connect-volume', 'line-handsfree-record', 'line-select-input', 'line-record-d3']
    usb = ['usb-connect', 'usb-connect-output', 'usb-live-monitor', 'usb-handsfree-record', 'usb-record-d3']
    page.add_init_script("""document.addEventListener('readystatechange', () => {
      if (document.readyState !== 'interactive') return;
      const set = (ids, q) => ids.forEach(id => { const li = document.querySelector('li[data-step="' + id + '"]'); if (li) li.dataset.route = q; });
      set(%s, 'Using USB audio, not the line input?'); set(%s, 'Using the line input, not USB?'); });""" % (json.dumps(line), json.dumps(usb)))
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./sampling.html#s-line-connect')
    box = page.locator('li[data-step="line-connect"] .skip-box')
    assert box.locator('p').text_content() == 'Using USB audio, not the line input? You can skip these 5 steps.'
    assert box.locator('[data-skip]').text_content() == 'Skip these 5 steps'
    assert page.locator('li[data-step="line-connect"] .step-head .tag:not([hidden])').count() == 0, 'A route step is not tagged Optional'
    assert page.locator('li[data-step="usb-live-monitor"] .skip-box').count() == 1, 'An optional step inside a route keeps its own box'
    assert page.locator('li[data-step="usb-live-monitor"] .skip-box [data-skip]').text_content() == 'Skip this step'
    box.locator('[data-skip]').click()
    page.wait_for_function(STEP + " === 'usb-connect'")
    assert page.locator('li[data-step="usb-connect"] .skip-box p').text_content() == 'Using the line input, not USB? You can skip these 5 steps.'
    assert run.get('koii-coach-ch-sampling')['skip'] == line
    assert page.locator('#toast').text_content().startswith('5 steps skipped.')
    page.evaluate("ids => CoachChapter.ids().filter(id => !ids.includes(id) && !/recap/.test(id)).forEach(id => CoachChapter.setDone(id, true))", line)
    run.go('./sampling.html#done')
    card = page.locator('#player-done')
    assert card.locator('h2').text_content() == 'Chapter 3 done'
    assert '(5 steps skipped).' in card.text_content()
    # Chapter 4 Part 9: skipping the USB route lands on the line output, before the level and the take.
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./perform.html#s-rec-usb')
    page.locator('li[data-step="rec-usb"] .skip-box [data-skip]').click()
    page.wait_for_function(STEP + " === 'rec-line-out'")


@pytest.mark.browser
def test_hear_it_hands_over_between_two_beats(run):
    """audio.js: starting a second player stops the first without suspending the audio context under the new one,
    which showed as "Paused by your device" and silence on the second Hear it."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./first-beat.html#all')
    page.evaluate("() => document.querySelectorAll('.steps > details').forEach(d => { d.open = true; })")   # every part's figures in view
    status = page.locator('figure.pattern .strip-status')
    page.locator('figure.pattern .hear-btn').nth(0).click()
    page.wait_for_function("() => /Playing/.test(document.querySelectorAll('figure.pattern .strip-status')[0].textContent)")
    page.locator('figure.pattern .hear-btn').nth(1).click()
    page.wait_for_function("() => /Playing/.test(document.querySelectorAll('figure.pattern .strip-status')[1].textContent)")
    page.wait_for_timeout(800)   # a suspend's statechange lands a task later
    assert 'Playing' in status.nth(1).text_content() and 'Paused' not in status.nth(1).text_content(), status.nth(1).text_content()
    assert status.nth(0).text_content() == '' and 'Hear it' in page.locator('figure.pattern .hear-btn').nth(0).text_content(), 'The first player stopped'


# Every note audio.js makes, as the test sees it: [value, time] of each frequency set (gains stay under 20) and
# ['tone' or 'noise', time] of each sound started.
AUDIO_LOG = """(() => {
  const log = window.__audio = {freq: [], start: []};
  const set = AudioParam.prototype.setValueAtTime;
  AudioParam.prototype.setValueAtTime = function (v, t) { if (v >= 20) log.freq.push([v, t]); return set.call(this, v, t); };
  for (const [Node, kind] of [[OscillatorNode, 'tone'], [AudioBufferSourceNode, 'noise']]) {
    const start = Node.prototype.start;
    Node.prototype.start = function (t) { log.start.push([kind, t]); return start.apply(this, arguments); };
  }
})();"""
# A "Hear the difference" pair as the content lane writes it, put first in a real step's extras before beat.js reads the
# page (readyState "interactive" comes before the deferred scripts run).
HEAR_DIFFERENCE = """document.addEventListener('readystatechange', () => {
  const box = document.readyState === 'interactive' && document.querySelector('li[data-step="optional-lazy-snare-shift"] .step-extras');
  if (box) box.insertAdjacentHTML('afterbegin', `<details class="step-more step-hear" id="t-diff"><summary>Hear the difference</summary>
    <figure class="pattern" data-bpm="90"><figcaption>On the grid</figcaption><p class="pattern-text">Kick (A1): <samp class="lcd">1.1.1</samp><br>Snare (A2): <samp class="lcd">1.1.1</samp></p></figure>
    <figure class="pattern" data-bpm="90" data-late="A2:3" data-pitch="B1:+1; C1:-12"><figcaption>Snare 3 ticks late</figcaption><p class="pattern-text">Kick (A1): <samp class="lcd">1.1.1</samp><br>Snare (A2): <samp class="lcd">1.1.1</samp><br>Bass (B1): <samp class="lcd">1.1.1</samp><br>Bass answer (B2): <samp class="lcd">1.1.1</samp><br>Melody (C1): <samp class="lcd">1.1.1</samp><br>Synth stab (C2): <samp class="lcd">1.1.1</samp></p></figure></details>`);
});"""


@pytest.mark.browser
def test_hear_the_difference_late_pitch_and_melody(run):
    """beat.js and audio.js: data-late plays a pad's rows N ticks late (96 a beat) while the grid keeps them on their
    step, data-pitch transposes a pad's rows, "melody" and "synth stab" rows are the melody pluck (grid label Melody),
    and "Bass answer" sounds the same note as Bass. The two figures of a "Hear the difference" play one at a time."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    page.add_init_script(AUDIO_LOG)
    page.add_init_script(HEAR_DIFFERENCE)
    run.go('./hiphop.html#all')
    rows = page.evaluate("() => CoachBeat.figures.filter(f => f.fig.closest('#t-diff')).map(f => f.rows.map(r => [r.voice, r.late, r.pitch]))")
    assert rows == [[['kick', 0, 0], ['snare', 0, 0]],
                    [['kick', 0, 0], ['snare', 3, 0], ['bass', 0, 1], ['bass2', 0, 0], ['melody', 0, -12], ['melody', 0, 0]]], rows
    late = page.locator('#t-diff figure.pattern').nth(1)
    assert late.locator('.strip-name').all_text_contents() == ['Kick', 'Snare', 'Bass', 'Bass 2', 'Melody', 'Melody']
    assert late.locator('.strip-cell.on').evaluate_all('cs => cs.map(c => c.dataset.c)') == ['0'] * 6, 'The grid shows the late snare on its step'
    page.evaluate("() => { for (let d = document.querySelector('#t-diff'); d; d = d.parentElement.closest('details')) d.open = true; }")
    hear, status = page.locator('#t-diff .hear-btn'), page.locator('#t-diff .strip-status')
    hear.nth(0).click()
    page.wait_for_function("() => /Playing/.test(document.querySelectorAll('#t-diff .strip-status')[0].textContent)")
    hear.nth(1).click()
    page.wait_for_function("() => /Playing/.test(document.querySelectorAll('#t-diff .strip-status')[1].textContent)")
    assert status.nth(0).text_content() == '' and 'Hear it' in hear.nth(0).text_content(), 'One of the pair plays at a time'
    page.wait_for_function("() => window.__audio.freq.some(([v]) => Math.abs(v - 65.41 * 2 ** (1 / 12)) < .01)")
    log = page.evaluate('() => window.__audio')
    # The second figure's first bar: its transposed bass (unique to it) gives the time of 1.1.1.
    t0 = next(t for v, t in log['freq'] if abs(v - 65.41 * 2 ** (1 / 12)) < .01)
    at = sorted(round(v, 2) for v, t in log['freq'] if abs(t - t0) < 1e-6)
    want = sorted(round(f, 2) for f in [140, 65.41, 65.41 * 2 ** (1 / 12), 261.63 / 2, 261.63])
    assert at == want, f'kick, bass2 = bass, bass +1, melody -12, stab: {at}'
    noise = [t for kind, t in log['start'] if kind == 'noise' and t0 - 1e-6 < t < t0 + .1]
    assert noise and abs(noise[0] - t0 - 3 * 60 / 90 / 96) < 1e-4, f'The snare plays 3 ticks (20.8 ms at 90 BPM) late: {[n - t0 for n in noise]}'


@pytest.mark.browser
def test_part_checkpoint_not_quite(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'new'}})
    run.go('./setup.html#s-listen-headphones-volume')  # the last step of Part 1
    page.locator('#player-next').click()
    page.locator('#player-check').wait_for(state='visible')
    assert 'Part 1 done' in page.locator('#player-check h2').text_content()
    assert page.locator('#player-check .led-row .led').count() == page.locator('.steps > details').count(), 'One LED per part'
    # A place to stop: the next part's size, the steps left, and Chapter 0's own switch-off line, word for word.
    card = page.locator('#player-check').text_content()
    size, left, off = page.evaluate("""() => [document.querySelectorAll('.steps > details')[1].querySelectorAll('li[data-step]').length, CoachChapter.ids().length - 1,
        [...document.querySelectorAll('.steps > details > p')].find(p => p.textContent.startsWith('Switching off?')).textContent]""")
    assert f'Next: Part 2 · Read the screen and the button language · {size} steps' in card, card
    assert f'{left} steps left in this chapter' in card, card
    assert 'Your place is saved. ' + off in card, card
    label = page.locator('#player-next .pa-label')
    assert label.text_content() == 'Yes · Part 2: Read the screen and the button language'
    page.locator('#player-check .pc-not').click()
    assert page.locator('#player-check .pc-fix').is_visible() and page.locator('#player-check .fix-card').count() >= 1, 'The fixes, as symptom cards'
    assert run.get('koii-coach-meta')['checkpoints'] == {'setup': {'part-1': 'not-yet'}}
    # Going on with the fixes open is not a Yes: the button says so, and 'not-yet' stays.
    assert label.text_content() == 'Part 2: Read the screen and the button language'
    page.locator('#player-next').click()
    page.wait_for_function(STEP + " === 'button-language'")
    assert run.get('koii-coach-meta')['checkpoints'] == {'setup': {'part-1': 'not-yet'}}
    # The chapter's done screen offers that part again.
    run.go('./setup.html#done')
    again = page.locator('#player-done [data-redo-part]')
    assert 'Worth another go' in page.locator('#player-done').text_content() and again.count() == 1
    assert again.text_content() == 'Redo Part 1 from its first step'
    again.click()
    page.wait_for_function(STEP + " === 'power-batteries'")
    assert run.get('koii-coach-ch-setup')['cur'] == 'power-batteries'
    # A Yes on a later pass clears it.
    run.go('./setup.html#s-listen-headphones-volume')
    page.locator('#player-next').click()
    page.locator('#player-check').wait_for(state='visible')
    page.locator('#player-next').click()
    assert run.get('koii-coach-meta')['checkpoints'] == {'setup': {'part-1': 'yes'}}
    run.go('./setup.html#done')
    assert page.locator('#player-done [data-redo-part]').count() == 0
    run.go('./setup.html#s-listen-headphones-volume')
    page.locator('#player-next').click()
    page.locator('#player-check .pc-not').click()
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
    # A card's first letter is capitalised only when it is lower case: "You picked a scene" must not become "YOu".
    run.go('./first-beat.html#s-beat-hats-quieter')   # the last step of Part 1
    page.locator('#player-next').click()
    page.locator('#player-check .pc-not').click()
    texts = page.locator('#player-check .fix-card').all_text_contents()
    assert any('You picked a scene' in x for x in texts), texts
    assert not [x for x in texts if re.search(r'\b[A-Z]{2}[a-z]', x)], texts


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
def test_chapter_complete_settings_file_and_what_opens(run):
    """The done screen: the system settings the chapter left changed (per family the last code ticked, when it is not
    the default), Save your progress file, the chapters that open up now (site.js needs) and, after Chapter 7, Make
    your own track. The start screen names the chapters a chapter needs."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    tick_all = "() => CoachChapter.ids().filter(id => !/recap/.test(id)).forEach(id => CoachChapter.setDone(id, true))"

    def finish(ch):
        run.go(f'./{ch}.html#all')
        page.evaluate(tick_all)
        run.go(f'./{ch}.html#done')
        page.locator('#player-done').wait_for(state='visible')
        return page.locator('#player-done')

    card = finish('first-beat')
    still = card.locator('.pd-settings li')
    assert still.all_text_contents() == ['411 Make scene changes wait for the bar. Type 410 the same way to switch back.'], 'Named by its step, without "Optional:"'
    assert still.locator('a').get_attribute('href') == '#s-beat-scene-sync', 'A link to the step that set it'
    assert card.locator('.pd-settings').get_attribute('class') == 'notice info pd-settings', 'A reminder, not a warning'
    assert card.locator('.pd-also').count() == 0 and card.locator('a[href$="#own-track"]').count() == 0
    with page.expect_download() as download:
        card.locator('[data-save]').click()
    assert download.value.suggested_filename.startswith('koii-coach-progress-')
    assert json.loads(pathlib.Path(download.value.path()).read_text(encoding='utf-8'))['data']['koii-coach-ch-first-beat']
    page.locator('#toast', has_text='Progress file saved').wait_for()
    # The optional 411 skipped instead: nothing is left changed.
    page.evaluate("() => { CoachChapter.setDone('beat-scene-sync', false); CoachChapter.setSkipped(['beat-scene-sync'], true); }")
    run.go('./first-beat.html#done')
    assert page.locator('#player-done .pd-settings').count() == 0
    # After Chapter 2: Chapters 4, 5 and 6 open up beside the Next chapter (3).
    card = finish('song')
    assert card.locator('.pd-also a').all_text_contents() == ['Chapter 4 · Play & perform', 'Chapter 5 · Full hip-hop beat', 'Chapter 6 · Tech house']
    assert card.locator('.pd-also a').first.get_attribute('href') == './perform.html'
    assert finish('sampling').locator('.pd-also a').all_text_contents() == ['Chapter 7 · Vocal house']
    # Perform puts the click, the scenes and the loop back; pad velocity stays on, and says so.
    assert finish('perform').locator('.pd-settings li').all_text_contents() == ['301 Turn on pad velocity. Type 300 the same way to switch back.'], 'Without the code in its title'
    # The last chapter leads on to a track of your own, even before the whole course is done.
    card = finish('thodorakis-house')
    assert card.locator('a[href="./cheat-sheet.html#own-track"]').text_content() == 'Make your own track'
    assert card.locator('.pd-course').count() == 0
    # Start screens: what a chapter needs, by number, on the line of the Parts heading.
    for ch, chip in (('hiphop', ['Needs Chapters 1–2']), ('thodorakis-house', ['Needs Chapters 1–3']), ('song', [])):
        run.go(f'./{ch}.html#start')
        assert page.locator('.player-parts .chips li').all_text_contents() == chip, ch
        if chip:
            head, box = page.locator('#player-parts-title').bounding_box(), page.locator('.player-parts .chips').bounding_box()
            assert abs((head['y'] + head['height'] / 2) - (box['y'] + box['height'] / 2)) < 4, f'{ch}: beside the heading'


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
    # Fixes for this part: the part's "If it doesn't" as symptom cards, mid-part, without the checkpoint's Redo buttons.
    run.go('./sampling.html#s-record-first-sample')
    page.locator('#player-tools-btn').click()
    card = page.locator('#tools-panel-step .fix-card', has_text='still blinks?')
    card.wait_for()
    assert card.locator('.fix-sym').text_content() == 'D1 still blinks?' and 'Nothing was recorded' in card.text_content()
    assert page.locator('#tools-panel-step h3.sub', has_text='Fixes for this part').count() == 1
    assert page.locator('#tools-panel-step [data-redo-step]').count() == 0, 'No Redo buttons in the sheet'


@pytest.mark.browser
def test_tools_press_order_chords_hold_and_write(run):
    """Keys in press order: a chord is one item, with one number on all its keys on the map. It is marked HOLD only when
    the Do line says hold right before it (or "until" a display value right after it). "write <pad>" in a step whose Do
    lines have no RECORD keycap is HOLD RECORD + that pad."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    items = """() => [...document.querySelectorAll('#tools-panel-step .press-order > li')].map(li =>
      [...li.querySelectorAll('kbd.key')].map(k => (k.classList.contains('hold') ? 'HOLD ' : '') + k.textContent).join(' + '))"""
    lit = "() => Object.fromEntries([...document.querySelectorAll('#tools-panel-step .control.hot')].map(c => [c.dataset.key, c.querySelector('.order').textContent]))"

    def tools(href):
        run.go(href)
        page.locator('#player-tools-btn').click()
        page.locator('#tools-panel-step .press-order').wait_for()
        return page.evaluate(items), page.evaluate(lit)

    order, keys = tools('./song.html#s-song-break-clear')
    assert order == ['MAIN', 'A', 'HOLD ERASE + A1', 'B', 'B1'], order
    assert keys['ERASE'] == keys['PAD1'] == '3' and keys['A'] == '2' and keys['B'] == '4', f'One number for the chord ({keys})'
    chord = page.locator('#tools-panel-step .press-order > li').nth(2)
    assert chord.locator('kbd.chord').count() == 1 and chord.locator('.po-n').text_content() == '3'
    assert chord.locator('kbd.key.hold').evaluate("k => getComputedStyle(k, '::before').content") == '"HOLD"', 'HOLD is text, not colour'
    page.keyboard.press('Escape')
    # "Briefly press" is marked nothing.
    order, keys = tools('./first-beat.html#s-beat-bass-trim')
    assert order[:2] == ['B1', 'SHIFT + SOUND'] and keys['SHIFT'] == keys['SOUND'] == '2', order
    page.keyboard.press('Escape')
    # Writing a note: RECORD lights with the pad.
    order, keys = tools('./tech-house.html#s-add-open-hats')
    assert order == ['HOLD RECORD + A4', 'ERASE + A3'], order
    assert keys['RECORD'] == keys['A'] == keys['PAD4'] == '1' and keys['ERASE'] == keys['PAD3'] == '2', keys
    page.keyboard.press('Escape')
    order, keys = tools('./thodorakis-house.html#s-place-answer-d2')   # "Write D2, the answer.": the pad is glued to its comma
    assert order == ['SHIFT + +', '+', 'HOLD RECORD + D2'], order
    page.keyboard.press('Escape')
    # A step that names RECORD itself keeps its own order.
    order, keys = tools('./hiphop.html#s-place-repeat-write')
    assert order[:2] == ['RECORD', 'D1'] and 'RECORD + D1' not in ' '.join(order), order


@pytest.mark.browser
def test_tools_words_follow_data_match(run):
    """data-match on a glossary term (glossary.html, written by the content lane; here added to the fetched page) replaces
    the name in "Words in this step": Scale / key / octave stays out of the play-mode "not key" step and the jingled
    keys. A pattern the browser cannot compile falls back to the name."""
    page = run.page
    page.add_init_script("""(() => { const f = window.fetch; window.fetch = (u, o) => f(u, o).then(r => {
      const m = localStorage.getItem('test-match');
      if (m === null || !String(u).includes('glossary.html')) return r;
      return r.text().then(t => new Response(t.replace('id="term-scale-key-octave"', 'id="term-scale-key-octave" data-match="' + m + '"'), {headers: {'Content-Type': 'text/html'}}));
    }); })();""")
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    page.evaluate("m => localStorage.setItem('test-match', m)", r'\b(?:scales?|octaves?|(?:a|the|its|any)\s+key(?!\s+mode))\b')

    def words(href):
        run.go(href)
        page.locator('#player-tools-btn').click()
        page.locator('#tools-panel-step .tools-eyebrow').wait_for()
        found = page.evaluate("() => [...document.querySelectorAll('#tools-panel-step .tools-gloss .term')].map(t => t.dataset.term)")
        page.keyboard.press('Escape')
        page.wait_for_function("() => !document.querySelector('dialog[open]') && !(history.state && history.state.coachDialog)")
        return found

    for step in ('perform.html#s-arp-sound-mode', 'hiphop.html#s-oneshot-phrase-answer', 'sampling.html#s-quality-record-hi-keys', 'perform.html#s-keys-off'):
        assert 'term-scale-key-octave' not in words('./' + step), step
    for step in ('perform.html#s-keys-key-scale', 'perform.html#s-keys-octave'):
        assert 'term-scale-key-octave' in words('./' + step), step
    page.evaluate("() => localStorage.setItem('test-match', '(')")
    assert 'term-scale-key-octave' in words('./perform.html#s-arp-sound-mode'), 'An invalid pattern falls back to the name'


@pytest.mark.browser
def test_recap_asks_before_it_shows(run):
    """In the player a recap's "Label: answer" moves are closed rows: the label, then the answer once opened. Their keys
    stay out of sight until then; All steps and the done screen keep the list as written."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./first-beat.html#s-beat-recap')
    li = page.locator('li[data-step="beat-recap"]')
    rows = li.locator('.recall > li')
    assert rows.count() == 6 and not li.locator(':scope > .step-moves').is_visible()
    assert li.locator('.recall summary').all_text_contents() == ['Navigate', 'Write', 'Erase one note', 'Undo', 'Commit', 'Select a scene']
    assert li.locator('.recall details[open]').count() == 0
    lit = "() => [...document.querySelectorAll('li.is-current kbd.key')].filter(k => k.checkVisibility()).length"
    assert page.evaluate(lit) == 0, 'No key shows before a move is opened'
    row = rows.nth(4)
    row.locator('summary').click()
    assert row.locator('p').text_content() == 'SHIFT + MAIN.' and page.evaluate(lit) == 2
    page.locator('#player-tools-btn').click()
    page.locator('#tools-panel-step .tools-eyebrow').wait_for()
    assert page.locator('#tools-panel-step .press-order').count() == 0, 'The Tools sheet lights no recap move'
    page.keyboard.press('Escape')
    run.go('./first-beat.html#all')
    assert li.locator('.recall').evaluate('e => e.hidden') and not li.locator(':scope > .step-moves').evaluate('e => e.hidden')


@pytest.mark.browser
def test_recall_step_keeps_its_presses_behind_a_button(run):
    """data-recall (written by the content lane; here set on a real step before the player reads the page): the title and
    Check show, the Do lines wait behind "Show the presses", and their keys are unlit and out of the Tools sheet."""
    page = run.page
    page.add_init_script("""document.addEventListener('readystatechange', () => {
      if (document.readyState !== 'interactive') return;
      for (const id of ['write-kicks-four', 'drop-hook-bass']) { const li = document.querySelector('li[data-step="' + id + '"]'); if (li) li.dataset.recall = ''; } });""")
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./hiphop.html#s-write-kicks-four')
    li = page.locator('li[data-step="write-kicks-four"]')
    btn = li.locator('.recall-show button')
    assert btn.is_visible() and btn.text_content() == 'Show the presses' and btn.get_attribute('aria-expanded') == 'false'
    assert not li.locator(':scope > .step-do').is_visible() and li.locator(':scope > .step-check').is_visible()
    assert page.locator('#player-next .pa-label').text_content() == 'Done · Next' and page.locator('#player-next').get_attribute('aria-disabled') is None
    page.locator('#player-tools-btn').click()
    page.locator('#tools-panel-step .tools-eyebrow').wait_for()
    assert page.locator('#tools-panel-step .press-order').count() == 0, 'No keys in the Tools sheet before the presses show'
    page.keyboard.press('Escape')
    page.wait_for_function("() => !document.querySelector('dialog[open]') && !(history.state && history.state.coachDialog)")
    btn.click()
    assert li.locator(':scope > .step-do').is_visible() and btn.text_content() == 'Hide the presses' and btn.get_attribute('aria-expanded') == 'true'
    page.locator('#player-tools-btn').click()
    page.locator('#tools-panel-step .press-order').wait_for()
    page.keyboard.press('Escape')
    page.wait_for_function("() => !document.querySelector('dialog[open]') && !(history.state && history.state.coachDialog)")
    # Per visit: back on the step, the presses are folded again.
    page.locator('#player-next').click()
    page.locator('#player-back').click()
    page.wait_for_function(STEP + " === 'write-kicks-four'")
    assert btn.get_attribute('aria-expanded') == 'false' and not li.locator(':scope > .step-do').is_visible()
    # A risk step never folds; All steps shows everything.
    run.go('./hiphop.html#s-drop-hook-bass')
    risk = page.locator('li[data-step="drop-hook-bass"]')
    assert risk.get_attribute('data-risk') == 'erase' and risk.locator('.recall-show').count() == 0 and risk.locator(':scope > .step-do').first.is_visible()
    run.go('./hiphop.html#all')
    assert not li.locator(':scope > .step-do').evaluate('e => e.hidden') and li.locator('.recall-show').evaluate('e => e.hidden')
    assert 'is-folded' not in (li.get_attribute('class') or '')


ONCE = 'Done on your K.O. II already? Don’t press again: the Check below tells you it took.'


@pytest.mark.browser
def test_once_steps_say_so_when_shown_again(run):
    """data-once (written by the content lane; set here on two commit steps): a ticked once-step shown again by Back,
    a menu jump or Redo Part N says above its Do lines not to press again. Not before its tick, never in All steps.
    Restart says what the K.O. II keeps."""
    page = run.page
    page.add_init_script("""document.addEventListener('readystatechange', () => {
      if (document.readyState !== 'interactive') return;
      for (const id of ['live-copy', 'keys-copy']) { const li = document.querySelector('li[data-step="' + id + '"]'); if (li) li.dataset.once = ''; } });""")
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./perform.html#s-live-copy')
    li = page.locator('li[data-step="live-copy"]')
    note = li.locator('.once-note')
    assert not note.is_visible(), 'Not before its tick'
    page.locator('#player-next').click()
    page.wait_for_function(STEP + " === 'live-copy-listen'")
    page.locator('#player-back').click()
    page.wait_for_function(STEP + " === 'live-copy'")
    assert note.is_visible() and note.text_content() == ONCE
    assert note.evaluate("n => n.nextElementSibling.matches('.step-do')"), 'Right above the Do lines'
    # Redo Part 1 from the checkpoint starts at that step, which says so.
    run.go('./perform.html#s-live-restore-metronome')
    page.locator('#player-next').click()
    page.locator('#player-check .pc-not').click()
    page.locator('#player-check [data-redo]').click()
    page.wait_for_function(STEP + " === 'live-copy'")
    assert note.is_visible()
    # A menu jump to a once-step not ticked yet: no note. All steps: none.
    page.locator('.menu-btn').click()
    page.locator('#shell-menu .chapter-pane .ps-part').nth(1).locator('summary').click()
    page.locator('#shell-menu .chapter-pane [data-jump="keys-copy"]').click()
    page.wait_for_function(STEP + " === 'keys-copy'")
    assert not page.locator('li[data-step="keys-copy"] .once-note').is_visible()
    run.go('./perform.html#all')
    assert note.evaluate('n => n.hidden')
    # Restart: the K.O. II keeps what you made; project 6 holds three chapters.
    said = []
    page.once('dialog', lambda d: (said.append(d.message), d.dismiss()))
    page.evaluate("() => document.getElementById('reset').click()")
    assert 'Your K.O. II keeps what you made. Practise again in a fresh copy with SHIFT + MAIN, or back up first. Project 6 also holds your work from Chapters 1, 2 and 4.' in said[0], said
    assert 'nothing on your K.O. II changes' not in said[0]
    assert run.get('koii-coach-ch-perform')['done'], 'Cancel keeps the ticks'


@pytest.mark.browser
def test_get_back_in_on_continue(run):
    """Home's and the menu's Continue link to #s-<the step to continue at>: after more than 30 minutes that shows Get back
    in, with the part's Goal and your notes, never the last Check. Another step's link keeps the plain step."""
    page = run.page
    rec = lambda minutes: {'v': 1, 'done': ['song-find-beat'], 'last': 'song-find-beat', 'cur': 'song-select-beat', 'n': 1,
                           'at': page.evaluate('m => new Date(Date.now() - m * 60e3).toISOString()', minutes)}
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}, 'koii-coach-ch-song': rec(180), 'koii-coach-notes': {'v': 1, 'values': {'project-6/BEAT': '4'}}})
    run.go('./song.html#s-song-select-beat')
    box = page.locator('.getback')
    box.wait_for()
    text = box.text_content()
    goal = page.evaluate("() => document.querySelector('#make-the-intro > p').textContent")
    check = page.evaluate("() => document.querySelector('li[data-step=\"song-find-beat\"] > .step-check').textContent.replace('Check: ', '')")
    assert goal in text and 'BEAT 4' in text and check not in text, text
    assert page.locator('#toast').text_content().startswith('Welcome back.')
    # A link to another step (search, a link in a step) keeps today's view.
    run.go('./song.html#s-song-copy-intro')
    page.wait_for_function(STEP + " === 'song-copy-intro'")
    assert not box.is_visible()
    # A recent tick: no card.
    page.evaluate('r => localStorage.setItem("koii-coach-ch-song", JSON.stringify(r))', rec(5))
    run.go('./song.html#s-song-select-beat')
    page.wait_for_function(STEP + " === 'song-select-beat'")
    assert not box.is_visible()


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
def test_step_numbers_within_part(run):
    """Plan 4: "Part 2 · …", "Step 4 of 8": every number a learner reads counts within the part."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    page.set_viewport_size({'width': 1280, 'height': 800})
    run.go('./first-beat.html#s-beat-kicks')   # Part 2, step 2
    assert page.locator('li.is-current .step-num').text_content().strip() == '2 of 5'
    assert page.locator('.rail .ps-step[aria-current="step"] .ps-n').text_content() == '2', 'The rail counts within the part'
    assert page.locator('li.is-current label.check').text_content() == 'Mark step 2 done'
    page.locator('#player-tools-btn').click()
    page.locator('#tools-sheet').wait_for(state='visible')
    assert page.locator('#tools-sheet .tools-eyebrow').text_content().startswith('For Part 2, step 2:')
    page.keyboard.press('Escape')
    assert page.evaluate("() => [...document.querySelectorAll('.steps ol')].every(ol => ol.start === 1)"), 'Each part numbers from 1'
    page.set_viewport_size({'width': 390, 'height': 844})


@pytest.mark.browser
def test_renumbered_course(run):
    """The course reads Chapter 0-7 in teaching order; a renumbered chapter says what it was, and search still finds it."""
    page = run.page
    run.go('./sampling.html#start')
    assert page.locator('header .eyebrow').text_content().startswith('Chapter 3 · ')
    assert 'Formerly' not in page.locator('.player-chips').text_content(), 'A first-time learner never knew the old numbers'
    run.seed({'koii-coach-ch-first-beat': {'v': 1, 'done': ['beat-empty-project'], 'last': 'beat-empty-project', 'n': 1}})
    run.go('./sampling.html#start')
    assert 'Formerly 07' in page.locator('.player-chips').text_content(), 'A returning learner sees "Formerly 07"'
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
@pytest.mark.parametrize('name, face, bar_colour, status_colour', [
    ('minimal', 'Archivo Light', 'rgb(255, 255, 255)', '#FFFFFF'),
    ('spec', 'Saira Light', 'rgb(241, 241, 238)', '#F1F1EE'),
])
def test_looks(run, name, face, bar_colour, status_colour):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    look = lambda: page.evaluate('document.documentElement.dataset.look')
    graphite = lambda: page.locator('#appbar').evaluate('e => getComputedStyle(e).getPropertyValue("--surface-1").trim()')
    bar = lambda: page.locator('#appbar').evaluate('e => getComputedStyle(e).backgroundColor')
    status = lambda: page.locator('meta[name="theme-color"][media*="light"]').get_attribute('content')
    run.go('./first-beat.html')
    assert (look(), graphite(), status()) == ('studio', '#1B1B1A', '#1B1B1A'), 'Studio is the default: a graphite app bar and browser bar'
    run.go('./settings.html')
    page.locator(f'input[name="look"][value="{name}"]').check()
    prefs = run.get('koii-coach-prefs')
    assert look() == name and (prefs['look'], prefs['setup']) == (name, 'ready'), f'The choice applies at once and is saved, the rest kept ({prefs})'
    run.go('./first-beat.html')
    title = page.locator('main h1').first.evaluate('e => getComputedStyle(e).fontFamily')
    assert look() == name and face in title, f'Every page opens in the {name} look, with its title face ({title})'
    assert (bar(), status()) == (bar_colour, status_colour), f'Its app bar and browser bar take the page colour ({bar()}, {status()})'
    do = page.locator('main .steps li[data-step] > .step-do').first.evaluate('e => getComputedStyle(e).fontFamily')
    assert 'Archivo' not in do and 'Saira' not in do, 'Steps stay in Atkinson'
    if name == 'spec':
        assert page.locator('main > .page-head').get_attribute('data-num') == '01', 'The start screen carries the chapter number for its outlined numeral'
        assert page.locator('#player-parts-title').evaluate('e => getComputedStyle(e).textTransform') == 'uppercase', 'Section titles are spec labels'
        run.go('./index.html')
        assert page.locator('.home .card[data-os]').get_attribute('data-os') == page.evaluate('COACH_SITE.firmware'), 'Home names the OS for its starburst'
    run.go('./settings.html')
    page.locator('#reset-settings').click()
    assert page.locator('input[name="look"][value="studio"]').is_checked() and look() == 'studio', 'Reset settings puts Studio back'


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
def test_rhythm_lab_swing(run):
    """The lab's Swing checkbox plays every second step (1.1.2, 1.1.4 …) late, 8 ticks of 96, and the challenge
    "Hats on all 16 steps, then Swing on" lights once both are true. Swing is not saved."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    page.add_init_script(AUDIO_LOG)
    run.go('./lab.html')
    swing = page.get_by_role('checkbox', name='Swing')
    assert not swing.is_checked() and swing.get_attribute('aria-describedby') == 'swing-hint'
    assert page.locator('#swing-hint').text_content() == 'Swing pushes every second step late: 1.1.2, 1.1.4, 1.2.2 and so on.'
    goals = page.locator('#goals li')
    assert goals.nth(2).text_content() == 'Hats on all 16 steps, then Swing on' and goals.nth(2).get_attribute('data-state') == 'todo'
    page.locator('#clear').click()
    page.evaluate("() => document.querySelectorAll('#beat button[data-r=\"2\"]').forEach(b => b.click())")   # hats on all 16 steps
    assert [goals.nth(i).get_attribute('data-state') for i in (1, 2)] == ['done', 'todo']
    hats = lambda: page.evaluate("() => window.__audio.start.filter(([k]) => k === 'noise').map(([, t]) => t)")
    gaps = lambda ts: [round(b - a, 4) for a, b in zip(ts, ts[1:])]
    step = 60 / 90 / 4
    page.locator('#audio-play').click()
    page.wait_for_function("() => window.__audio.start.length >= 6")
    assert set(gaps(hats())[:5]) == {round(step, 4)}, f'Straight: every step the same length ({gaps(hats())})'
    swing.check()
    assert goals.nth(2).get_attribute('data-state') == 'done' and '(done)' in goals.nth(2).text_content()
    page.evaluate('() => { window.__audio.start.length = 0; }')
    page.wait_for_function("() => window.__audio.start.length >= 8")
    ts = hats()
    late = 8 * step / 24
    assert set(gaps(ts)[1:6]) == {round(step + late, 4), round(step - late, 4)}, f'Swung: long, short, long … ({gaps(ts)})'
    page.locator('#audio-play').click()
    run.go('./lab.html')
    assert not page.get_by_role('checkbox', name='Swing').is_checked(), 'Swing starts off on each visit'


@pytest.mark.browser
def test_device_panel_landscape_and_desktop(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    page.set_viewport_size({'width': 844, 'height': 390})
    run.go('./first-beat.html#s-beat-bass-trim')
    panel = page.locator('#player-device')
    panel.locator('.control.hot').first.wait_for()
    assert panel.is_visible() and panel.bounding_box()['x'] == 0, 'A short landscape screen puts the keys on the left'
    order = page.evaluate("() => [...document.querySelectorAll('#player-device .press-order > li > kbd')].map(k => k.textContent)")
    assert order[:2] == ['B1', 'SHIFT + SOUND'], f'Only the Do line\'s keys, in press order, not the Before you press warning ({order})'
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
    # The rail comes back on the dialog's close event, which the browser fires as a task after the sheet hides.
    page.locator('.rail').wait_for(state='visible', timeout=2000)
    assert page.locator('.rail').is_visible(), 'The rail is back when Tools closes'


@pytest.mark.browser
@pytest.mark.parametrize('look', ['studio', 'minimal', 'spec'])
def test_start_screen_on_one_screen_and_list_banner(run, look):
    """Plan 5.2: a first visit shows the promise, the chips, "Before you start" rows and the parts; the long preamble
    waits in "About this chapter in full". Plan 5.10: All steps puts "You're on Part N, step X of M · Continue" in the
    first screen. In every look (Settings › Look): their titles and labels must leave the first screen as it is."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready', 'look': look}})
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
    (koii-coach-v2.firmware): a warning for an older OS; for a new enough one, the step player's head tag only.
    The badges are honest: "your OS has it" only once an OS was chosen (koii-coach-prefs.osChosen, or a choice other
    than the default 2.5), and the warning promises no skip. "Newer than OS 2.5.1" ('newer') has every 2.5 feature."""
    page = run.page
    base = {'schema': 4, 'step': 0, 'stepId': 'beat-empty-project', 'note': 0, 'song': 0, 'songId': 'song-find-beat', 'view': 'first',
            'done': [], 'finished': False, 'songFinished': False, 'lab': None}
    tagged = {}
    first = "() => document.querySelector('li[data-step=\"song-list-open\"] > .badge').textContent"
    for fw, said in (('older', None), ('2.5', 'Needs OS 2.0+'), ('newer', 'Needs OS 2.0+ · your newer OS has it.')):
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
            if ch == 'song':
                text = page.evaluate(first)
                if said:
                    assert text == said, f'{fw}: {text!r}'
                else:
                    assert 'Update to the latest OS first' in text and 'skip' not in text, f'No skip promised without a skip: {text!r}'
    # Chosen in Settings: the badge names the OS. Reset settings keeps that it was chosen, as it keeps the choice.
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready', 'modes': {}}, 'koii-coach-v2': dict(base, firmware='2.5')})
    run.go('./settings.html')
    assert page.locator('#firmware').input_value() == '2.5' and page.locator('#firmware option').first.text_content() == 'Newer than OS 2.5.1'
    assert 'latest' not in page.locator('#firmware-card').text_content(), 'OS 2.5 is not called the latest for ever'
    page.locator('#firmware').select_option('newer')
    assert 'follow the official guide' in page.locator('#version-note').text_content()
    assert run.get('koii-coach-v2')['firmware'] == 'newer' and run.get('koii-coach-prefs')['osChosen'] is True
    page.locator('#firmware').select_option('2.5')
    page.locator('#reset-settings').click()
    assert run.get('koii-coach-prefs') == {'v': 1, 'osChosen': True}, run.get('koii-coach-prefs')
    run.go('./song.html#all')
    assert page.evaluate(first) == 'Needs OS 2.0+ · your OS 2.5.x has it.'
    # In the step player, the head carries the tag and the "has it" badge stays out of the way.
    run.go('./perform.html#s-sc-open')
    page.wait_for_function("() => (document.querySelector('li.is-current') || {dataset: {}}).dataset.step === 'sc-open'")
    assert page.locator('li.is-current .step-head .tag.os').text_content() == 'Needs OS 2.0+'
    assert not page.locator('li.is-current > .badge.ok').is_visible()
