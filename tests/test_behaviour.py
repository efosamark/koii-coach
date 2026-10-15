"""Player and shell behaviour the plan lists in 8.1 that the other files do not cover:

- the screen wake lock is asked for on the first Done · Next, let go with the sun button, and after 15 idle minutes
  let go with a "Keep on" toast (stubbed API, fake clock);
- a delete or overwrite step keeps its press folded until "Yes, I have checked" (the button reads "Confirm first");
- a part's last step reads "Done · Checkpoint"; a risk step's hidden undo and Check get their own cue;
- letter shortcuts never fire in a link, a button, a disclosure, a text field, an open dialog, a grid or a radiogroup,
  and do from the step's title;
- #done with steps left lists them and does not tick the recap; with every chapter done, the course is complete
  (chapter screen and Home);
- with storage blocked, the chapter says so as an alert and suggests installing or exporting;
- a service worker whose install fails says the offline copy is incomplete and offers Retry;
- phone Back closes the Tools sheet and keeps the step;
- Tab from a step's title to Done · Next stops exactly at the step's own controls plus the part note, Back and Tools.
Run after a build:  python -m pytest tests/test_behaviour.py
"""
import http.server
import pathlib
import shutil
import threading
from urllib.parse import urljoin

import pytest

import serve
from support import watch

pytestmark = pytest.mark.browser

SITE = pathlib.Path(__file__).resolve().parents[1] / '_site'
STEP = "(document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step"
WAKE = """(() => { window.__wake = {requests: 0, released: 0};
  const sentinel = () => { const s = {released: false, release() { if (!s.released) { s.released = true; window.__wake.released++; s.onrelease && s.onrelease(); } return Promise.resolve(); },
    addEventListener(t, f) { if (t === 'release') s.onrelease = f; }, removeEventListener() {} }; return s; };
  Object.defineProperty(navigator, 'wakeLock', {configurable: true, value: {request() { window.__wake.requests++; return Promise.resolve(sentinel()); }}}); })();"""


@pytest.fixture
def run(browser, site_url):
    context = browser.new_context(viewport={'width': 390, 'height': 844})
    page = context.new_page()
    page.set_default_timeout(15000)
    errors, bad = [], []
    watch(page, site_url, errors, bad)

    class Run:
        def __init__(self):
            self.page, self.context, self.errors = page, context, errors

        def go(self, href):
            # A sheet closed just before removes its history entry with history.back(), a moment later; a goto started
            # before that lands is aborted by it. Wait until no sheet's entry is left.
            page.wait_for_function("() => !(history.state && history.state.coachDialog) || !!document.querySelector('dialog[open]')")
            page.goto('about:blank')
            page.goto(urljoin(site_url, href), wait_until='networkidle')

        def seed(self, values):
            page.goto(urljoin(site_url, 'manifest.webmanifest'))
            page.evaluate('v => { localStorage.clear(); for (const [k, x] of Object.entries(v)) localStorage.setItem(k, JSON.stringify(x)); }', values)

        def get(self, key):
            return page.evaluate('k => JSON.parse(localStorage.getItem(k) || "null")', key)

    yield Run()
    context.close()
    assert errors == [], f'Browser JavaScript errors: {errors}'
    assert bad == [], f'Failed app assets: {bad}'


def test_wake_lock_on_first_done_and_off_with_the_sun(run):
    page = run.page
    page.add_init_script(WAKE)
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./setup.html#s-power-batteries')
    assert page.evaluate('() => window.__wake.requests') == 0, 'Nothing is held before the learner does anything'
    page.locator('#player-next').click()
    page.wait_for_function('() => window.__wake.requests === 1')
    sun = page.locator('#wake-toggle')
    page.wait_for_function("() => document.getElementById('wake-toggle').getAttribute('aria-pressed') === 'true'")
    sun.click()
    page.wait_for_function('() => window.__wake.released === 1')
    # 15 minutes without a tap: it lets go and offers to keep the screen on (plan 5.3).
    page.clock.install()
    run.go('./setup.html#s-power-batteries')
    page.locator('#player-next').click()
    page.wait_for_function('() => window.__wake.requests === 1')   # a new page: the stub counts from 0 again
    page.clock.run_for('15:05')
    toast = page.locator('#toast', has_text='Screen can sleep again')
    toast.wait_for(state='visible')
    toast.get_by_role('button', name='Keep on').click()
    page.wait_for_function('() => window.__wake.requests === 2')


def test_irreversible_step_stays_folded_until_checked(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./perform.html#s-scene-erase-delete')
    li = page.locator('li[data-step="scene-erase-delete"]')
    assert li.locator('.preflight').is_visible() and li.locator(':scope > .step-consequence').is_visible(), 'Before you press and what it erases show first'
    assert not li.locator(':scope > .step-do').is_visible(), 'The press waits for the confirmation'
    assert page.locator('#player-next .pa-label').text_content() == 'Confirm first'
    li.locator('.gate-btn').click()
    assert li.locator(':scope > .step-do').is_visible() and li.locator(':scope > .step-noundo').is_visible()


def test_labels_for_a_part_end_and_a_risk_step_below_the_fold(run):
    """Plan 6.4: the last step of a part reads "Done · Checkpoint". Plan 5.4: when a risk step's undo or Check is
    below the action bar, the cue says "Undo and Check below" ("No undo and Check below" for an irreversible step)."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./first-beat.html#s-beat-kicks')
    last = page.evaluate("() => { const li = document.querySelector('li.is-current'), ol = li.closest('ol'); return ol.lastElementChild.dataset.step; }")
    assert page.locator('#player-next .pa-label').text_content() == 'Done · Next'
    run.go(f'./first-beat.html#s-{last}')
    assert page.locator('#player-next .pa-label').text_content() == 'Done · Checkpoint'
    page.set_viewport_size({'width': 360, 'height': 640})
    for ch in ('first-beat', 'perform'):
        run.go(f'./{ch}.html#all')
        seen = page.evaluate("""async () => {
          const out = [];
          for (const li of document.querySelectorAll('li[data-risk]')) {
            location.hash = '#s-' + li.dataset.step;
            await new Promise(r => setTimeout(r, 150));
            const gate = li.querySelector('.gate-btn'); if (gate && gate.offsetParent) { gate.click(); await new Promise(r => setTimeout(r, 150)); }
            scrollTo(0, 0); await new Promise(r => setTimeout(r, 150));
            const after = [...li.querySelectorAll(':scope > .step-undo, :scope > .step-noundo, :scope > .step-check')].filter(e => e.offsetParent);
            const bar = document.querySelector('#player-actions .pa-row').getBoundingClientRect().top;
            const below = after.length && after[after.length - 1].getBoundingClientRect().bottom > bar + 8;
            const more = document.querySelector('.pa-more');
            out.push([li.dataset.step, below, more.hidden ? '' : more.textContent, Boolean(li.querySelector(':scope > .step-noundo'))]);
          }
          return out; }""")
        for sid, below, cue, noundo in seen:
            want = ('No undo and Check below' if noundo else 'Undo and Check below') if below else cue
            assert cue == want, f'{ch}/{sid}: cue {cue!r}, expected {want!r}'
        assert any(below for _, below, _, _ in seen) or ch == 'first-beat', f'{ch}: no risk step to test the cue on at 360×640'


def test_shortcuts_never_fire_in_excluded_contexts(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./perform.html#s-live-copy-listen')   # a step with a notes field
    sheet = page.locator('#tools-sheet')
    page.locator('li[data-step="live-copy-listen"] input').first.focus()
    page.keyboard.press('t')
    page.wait_for_timeout(200)
    assert not sheet.is_visible(), 'T in a text field types, it does not open Tools'
    page.locator('.menu-btn').click()
    page.wait_for_timeout(300)
    page.keyboard.press('t')
    page.wait_for_timeout(200)
    assert not sheet.is_visible(), 'No shortcut while a dialog is open'
    page.keyboard.press('Escape')
    run.go('./lab.html')
    page.locator('#beat button[tabindex="0"]').focus()
    page.keyboard.press('?')
    page.wait_for_timeout(200)
    assert page.evaluate("() => !document.querySelector('dialog[open]')"), '? in the grid is not a shortcut'
    run.go('./settings.html')
    page.locator('input[name="wake"]').first.focus()
    page.keyboard.press('?')
    page.wait_for_timeout(200)
    assert page.evaluate("() => !document.querySelector('dialog[open]')"), '? in a radiogroup is not a shortcut'
    # Links, buttons and disclosures keep their keys (plan: shortcuts fire only from the page, main or the step title).
    run.go('./first-beat.html#s-beat-kicks')
    for sel in ('#player-back', 'li.is-current a[href]', 'li.is-current summary'):
        page.locator(sel).first.focus()
        for key in ('t', 'm'):
            page.keyboard.press(key)
            page.wait_for_timeout(150)
            assert page.evaluate("() => !document.querySelector('dialog[open]')") and not sheet.is_visible(), f'{key} on {sel} is not a shortcut'
    page.locator('li.is-current > .step-title').focus()
    page.keyboard.press('t')
    sheet.wait_for(state='visible')


def test_done_with_steps_left_and_the_course_complete(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./song.html#all')
    page.evaluate("() => CoachChapter.ids().slice(0, 3).forEach(id => CoachChapter.setDone(id, true))")
    run.go('./song.html#done')
    card = page.locator('#player-done')
    card.wait_for(state='visible')
    assert 'not ticked yet' in card.locator('h2').text_content()
    assert card.locator('.pd-open a').count() == 8, 'The first eight steps left, as links'
    assert 'song-recap' not in run.get('koii-coach-ch-song')['done'], 'The recap is not ticked while steps are left'
    # Every chapter done: the last one shows the course, and Home says so.
    slugs = ['setup', 'first-beat', 'song', 'sampling', 'perform', 'hiphop', 'tech-house', 'thodorakis-house']
    for ch in slugs:
        run.go(f'./{ch}.html#all')
        page.evaluate("() => CoachChapter.ids().forEach(id => CoachChapter.setDone(id, true))")
    run.go('./thodorakis-house.html#done')
    course = page.locator('#player-done .pd-course')
    course.wait_for(state='visible')
    assert course.locator('.made-list li').count() == 8
    run.go('./index.html')
    assert page.locator('.continue.complete').is_visible(), 'Home shows the course as complete'


def test_storage_blocked_is_an_alert_with_a_way_out(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    page.add_init_script("Storage.prototype.setItem = function () { throw new DOMException('blocked', 'QuotaExceededError'); };")
    run.go('./first-beat.html#all')
    page.locator('li[data-step="beat-empty-project"] .check input').check()
    note = page.locator('#progress-note')
    note.wait_for(state='visible')
    assert note.get_attribute('role') == 'alert'
    assert 'not saving' in note.text_content() and 'Install the coach' in note.text_content() and 'progress file' in note.text_content()
    run.errors.clear()   # the blocked writes may log; that is the point of this test


def test_failed_offline_install_offers_retry(browser, tmp_path):
    site = tmp_path / 'site'
    shutil.copytree(SITE, site)
    (site / 'icons' / 'icon-512.png').unlink()   # one precached file missing: the install must fail as a whole
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), serve.handler(site))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    context = browser.new_context()
    page = context.new_page()
    try:
        page.goto(f'http://127.0.0.1:{server.server_address[1]}{serve.PREFIX}index.html', wait_until='networkidle')
        page.wait_for_function("() => /incomplete/i.test(document.querySelector('#offline').textContent)", timeout=30000)
        assert page.locator('#offline [data-retry], .offline-retry [data-retry]').first.is_visible()
        assert page.evaluate("() => caches.keys()") == [], 'No half-filled cache is left behind'
    finally:
        context.close()
        server.shutdown()
        server.server_close()


def test_back_closes_the_tools_sheet_and_keeps_the_step(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./first-beat.html#s-beat-load-kick')
    page.locator('#player-tools-btn').click()
    sheet = page.locator('#tools-sheet')
    sheet.wait_for(state='visible')
    page.go_back()
    sheet.wait_for(state='hidden')
    assert page.url.endswith('#s-beat-load-kick')
    assert page.evaluate("() => document.querySelector('li.is-current').dataset.step") == 'beat-load-kick'


@pytest.mark.parametrize('href,sid', [('./hiphop.html#s-drop-hook-bass', 'drop-hook-bass'), ('./first-beat.html#s-beat-kicks', 'beat-kicks'),
                                      ('./perform.html#s-sc-open', 'sc-open'), ('./sampling.html#s-record-kick', 'record-kick')])
def test_tab_stops_are_the_step_controls_plus_three(run, href, sid):
    """Plan 8.1: Tab presses from the step's h3 to Done · Next = the step's focusable controls + 3 (the part's note, Back
    and Tools). A link inside a closed Why or Not working? is not reachable, so it does not count."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go(href)
    title = page.locator(f'li[data-step="{sid}"] > .step-title')
    title.focus()
    controls = page.evaluate("""sid => { const li = document.querySelector('li[data-step="' + sid + '"]'), h = li.querySelector(':scope > .step-title');
        return [...li.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex="0"]')].filter(e =>
          (h.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING) && e.checkVisibility() && e.tabIndex >= 0 &&
          !(e.closest('details:not([open])') && e.closest('details:not([open])').querySelector('summary') !== e)).length; }""", sid)
    stops = []
    for _ in range(40):
        page.keyboard.press('Tab')
        where = page.evaluate("""sid => { const e = document.activeElement;
          if (e.id === 'player-next') return 'next';
          if (e.closest('li[data-step="' + sid + '"]')) return 'step';
          if (e.closest('.part-about')) return 'part';
          return e.id || e.className; }""", sid)
        if where == 'next':
            break
        stops.append(where)
    assert stops.count('step') == controls, f'{sid}: {stops} for {controls} controls'
    assert stops[controls:] == ['part', 'player-back', 'player-tools-btn'], f'{sid}: then the part note, Back and Tools ({stops})'
