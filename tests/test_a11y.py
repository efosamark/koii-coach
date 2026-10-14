"""Accessibility (docs/overhaul-plan.md 8.1, test_a11y.py).

- axe-core (tests/vendor, MPL-2.0, test-only and sha256-pinned) on every kind of page and sheet, at phone and desktop
  width, in light and dark: no serious or critical WCAG 2.2 A/AA violation. The desktop pass is 1280×1200, tall enough
  that a chapter's docked action bar sits under the content instead of over it: at 900 a control that happens to end
  half under the bar counts as a small target (target-size) until you scroll, wherever the step's length puts it.
- Keyboard: from a step's title, Tab reaches Done · Next through the step's own controls, the part's note and the
  action bar only (test_behaviour.py checks the exact count);
  a whole part of Chapter 0 can be done with the keyboard alone, its checkpoint included.
- At 320×256 (400% zoom on a small laptop) the fixed chrome takes at most a quarter of the height, and a focused
  control in the step is never hidden under it (WCAG 2.4.11).
- Forced colours (Windows contrast themes): a lit key, a hit in the Rhythm lab, a ticked step and the meter keep a
  visible state. Screenshots go to the artifacts folder.
- Without JavaScript every page still reads: every step of every chapter is there to open, nothing scrolls sideways,
  the Rhythm lab shows the recipe to copy, and the 404 page three folders deep keeps its links and stylesheet.
Run after a build, like test_smoke.py:  python -m pytest tests/test_a11y.py
"""
import hashlib
import pathlib
from urllib.parse import urljoin

import pytest

from support import watch

pytestmark = pytest.mark.browser

AXE = pathlib.Path(__file__).resolve().parent / 'vendor' / 'axe-4.13.0.min.js'
AXE_SHA256 = 'c24f097bd2f451d4f933e8bc7d8d539f8672a2ebcb5cc9f9f3eec8ca9470a0c1'
TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
PAGES = ['index.html', 'setup.html', 'first-beat.html#s-beat-kicks', 'sampling.html#all', 'perform.html#s-scene-erase-delete',
         'hiphop.html#done', 'tech-house.html#s-outro-clear', 'learn.html', 'controls.html', 'lab.html', 'help.html',
         'glossary.html', 'cheat-sheet.html', 'safety.html', 'settings.html', '404.html']
STEP = "(document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step"


@pytest.fixture
def run(browser, site_url, artifacts_dir):
    context = browser.new_context(viewport={'width': 390, 'height': 844})
    page = context.new_page()
    page.set_default_timeout(15000)
    errors, bad = [], []
    watch(page, site_url, errors, bad)

    class Run:
        def __init__(self):
            self.page, self.artifacts = page, artifacts_dir

        def go(self, href):
            page.goto('about:blank')
            page.goto(urljoin(site_url, href), wait_until='networkidle')

        def seed(self, values):
            page.goto(urljoin(site_url, 'manifest.webmanifest'))
            page.evaluate('v => { localStorage.clear(); for (const [k, x] of Object.entries(v)) localStorage.setItem(k, JSON.stringify(x)); }', values)

        def get(self, key):
            return page.evaluate('k => JSON.parse(localStorage.getItem(k) || "null")', key)

        def axe(self, label):
            page.add_script_tag(content=AXE.read_text(encoding='utf-8'))
            found = page.evaluate("""tags => axe.run(document, {runOnly: {type: 'tag', values: tags}, resultTypes: ['violations']})
                .then(r => r.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
                  .map(v => v.id + ' (' + v.nodes.map(n => n.target.join(' ')).slice(0, 3).join(', ') + ')'))""", TAGS)
            return [f'{label}: {v}' for v in found]

    yield Run()
    context.close()
    assert errors == [], 'Browser JavaScript errors'
    assert bad == [], 'Failed app assets'


def test_axe_is_the_pinned_copy():
    assert hashlib.sha256(AXE.read_bytes()).hexdigest() == AXE_SHA256, 'tests/vendor/axe-4.13.0.min.js is not the pinned file'


@pytest.mark.parametrize('scheme', ['light', 'dark'])
def test_axe_on_every_page_and_sheet(run, scheme):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    page.emulate_media(color_scheme=scheme)
    found = []
    for width, height in ((390, 844), (1280, 1200)):
        page.set_viewport_size({'width': width, 'height': height})
        for href in PAGES:
            run.go(href)
            page.wait_for_timeout(200)
            found += run.axe(f'{scheme} {width} {href}')
    page.set_viewport_size({'width': 390, 'height': 844})
    run.go('./first-beat.html#s-beat-load-kick')
    page.locator('#player-tools-btn').click()
    page.locator('#tools-panel-step .press-order').wait_for()
    found += run.axe(f'{scheme} Tools sheet')
    page.keyboard.press('Escape')
    page.locator('#tools-sheet').wait_for(state='hidden')
    page.locator('.menu-btn').click()
    page.wait_for_timeout(300)
    found += run.axe(f'{scheme} menu')
    page.keyboard.press('Escape')
    page.wait_for_timeout(300)
    page.locator('body').click(position={'x': 5, 'y': 300})
    page.keyboard.press('/')
    page.keyboard.type('erase')
    page.wait_for_timeout(600)
    found += run.axe(f'{scheme} search')
    assert found == [], 'Serious or critical axe violations:\n' + '\n'.join(found)


def test_tab_from_a_step_reaches_done_next_without_stray_stops(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    for href, sid in (('./hiphop.html#s-drop-hook-bass', 'drop-hook-bass'), ('./first-beat.html#s-beat-kicks', 'beat-kicks')):
        run.go(href)
        page.locator(f'li[data-step="{sid}"] > .step-title').focus()
        stops = []
        for _ in range(40):
            page.keyboard.press('Tab')
            where = page.evaluate("""sid => { const e = document.activeElement;
              if (e.id === 'player-next') return 'next';
              if (e.closest('li[data-step="' + sid + '"]')) return 'step';
              if (e.closest('.part-about')) return 'part';
              if (e.id === 'player-back' || e.id === 'player-tools-btn' || e.classList.contains('pa-more')) return 'bar';
              return e.tagName + '.' + e.className + '#' + e.id; }""", sid)
            if where == 'next':
                break
            stops.append(where)
        else:
            pytest.fail(f'{sid}: Tab never reached Done · Next ({stops})')
        stray = [s for s in stops if s not in ('step', 'part', 'bar')]
        assert stray == [], f'{sid}: stray Tab stops between the step and Done · Next: {stray}'
        mine = page.evaluate("""sid => [...document.querySelectorAll('li[data-step="' + sid + '"] :is(a[href], button, input, select, textarea, summary, [tabindex="0"])')]
          .filter(e => e.offsetParent && !e.closest('[hidden]')).length""", sid)
        assert len(stops) <= mine + 3, f'{sid}: {len(stops)} Tab stops for {mine} controls in the step'


def test_a_whole_part_with_the_keyboard_only(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'new'}})
    run.go('./setup.html')
    part = page.evaluate("() => [...document.querySelectorAll('.steps > details')[0].querySelectorAll('li[data-step]')].map(li => li.dataset.step)")
    page.locator('#player-next').focus()
    page.keyboard.press('Enter')
    for sid in part:
        page.wait_for_function(STEP + f" === '{sid}'")
        page.keyboard.press('ArrowRight')
    page.locator('#player-check').wait_for(state='visible')
    assert page.evaluate('() => document.activeElement.id') == 'player-check', 'The checkpoint has focus'
    page.keyboard.press('ArrowRight')
    second = page.evaluate("() => document.querySelectorAll('.steps > details')[1].querySelector('li[data-step]').dataset.step")
    page.wait_for_function(STEP + f" === '{second}'")
    assert run.get('koii-coach-ch-setup')['done'] == part, 'Every step of Part 1 is ticked, in order'


def test_short_screen_chrome_and_focus_not_obscured(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    page.set_viewport_size({'width': 320, 'height': 256})
    run.go('./tech-house.html#s-outro-clear')
    fixed = page.evaluate("""() => [...document.querySelectorAll('body *')].filter(e => {
        const s = getComputedStyle(e); return (s.position === 'fixed' || s.position === 'sticky') && e.offsetParent !== null && s.visibility !== 'hidden'
          && !e.closest('dialog') && !e.closest('[hidden]'); })
      .map(e => e.getBoundingClientRect()).filter(r => r.height > 0 && r.top < innerHeight && r.bottom > 0)
      .reduce((h, r) => h + Math.min(r.bottom, innerHeight) - Math.max(r.top, 0), 0)""")
    assert fixed <= 256 * 0.25, f'Fixed chrome is {fixed}px of 256'
    page.locator('li[data-step="outro-clear"] > .step-title').focus()
    for _ in range(12):
        page.keyboard.press('Tab')
        if page.evaluate("() => document.activeElement.id === 'player-next'"):
            break
        hidden = page.evaluate("""() => { const e = document.activeElement, r = e.getBoundingClientRect();
          if (e.closest('.player-actions')) return false;
          const bar = document.querySelector('#player-actions').getBoundingClientRect();
          return r.bottom > bar.top + 1 && r.top < bar.bottom; }""")
        assert not hidden, 'A focused control is hidden under the action bar'


def test_forced_colours_keep_every_state(run):
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'},
              'koii-coach-ch-first-beat': {'v': 1, 'done': ['beat-empty-project'], 'last': 'beat-empty-project', 'n': 1}})
    page.emulate_media(forced_colors='active')
    page.set_viewport_size({'width': 1280, 'height': 900})
    run.go('./first-beat.html#s-beat-load-kick')
    page.locator('#player-device .control.hot').first.wait_for()
    outline = page.evaluate("() => getComputedStyle(document.querySelector('#player-device .control.hot')).outlineStyle")
    assert outline != 'none', 'A lit key keeps an outline'
    page.screenshot(path=run.artifacts / 'forced-colours-step.png')
    run.go('./first-beat.html#all')
    state = page.evaluate("""() => { const i = document.querySelector('li[data-step="beat-empty-project"] .check input'), m = document.querySelector('.meter-fill');
        const s = m && getComputedStyle(m);
        return {tick: Boolean(i && i.checked && getComputedStyle(i).appearance === 'auto'),
                meter: Boolean(s && s.forcedColorAdjust === 'none' && s.backgroundColor !== getComputedStyle(m.parentElement).backgroundColor && m.getBoundingClientRect().width > 0)}; }""")
    assert state == {'tick': True, 'meter': True}, f'The ticked step is a native checked box and the meter fill shows ({state})'
    page.screenshot(path=run.artifacts / 'forced-colours-list.png')
    run.go('./lab.html')
    hit = page.evaluate("() => { const b = document.querySelector('#beat button.on'); const s = getComputedStyle(b); return [s.backgroundColor, s.color]; }")
    assert hit[0] != hit[1], 'A hit in the lab is not invisible'
    page.screenshot(path=run.artifacts / 'forced-colours-lab.png')


NO_JS_PAGES = ['index.html', 'setup.html', 'first-beat.html', 'song.html', 'sampling.html', 'perform.html', 'hiphop.html', 'tech-house.html',
               'thodorakis-house.html', 'learn.html', 'controls.html', 'lab.html', 'help.html', 'glossary.html', 'cheat-sheet.html', 'safety.html',
               'settings.html', '404.html']


def test_every_page_reads_without_javascript(browser, site_url):
    context = browser.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 844})
    page = context.new_page()
    found = []
    for href in NO_JS_PAGES:
        page.goto(urljoin(site_url, href))
        r = page.evaluate("""() => {
          document.querySelectorAll('details').forEach(d => { d.open = true; });
          const shown = e => e.getClientRects().length > 0;
          const steps = [...document.querySelectorAll('li[data-step]')];
          return {text: (document.querySelector('main') || document.body).innerText.trim().length, steps: steps.length,
                  hidden: steps.filter(li => !shown(li) || !shown(li.querySelector('.step-do'))).map(li => li.dataset.step),
                  wide: document.documentElement.scrollWidth > innerWidth + 1,
                  search: (document.querySelector('#appbar a.static-search') || {}).href || '',
                  lab: document.querySelectorAll('#lab-positions samp').length};
        }""")
        if r['text'] < 300 or r['hidden'] or r['wide']:
            found.append(f"{href}: {r['text']} characters, hidden steps {r['hidden'][:5]}, sideways scroll {r['wide']}")
        if not r['search'].endswith('/help.html'):   # plan 5.8: without JS, Search is a link to Troubleshooting
            found.append(f"{href}: no Search link to help.html in the app bar ({r['search']!r})")
        if href == 'lab.html' and r['lab'] < 16:
            found.append('lab.html: the recipe positions are missing')
    # An unknown address three folders deep: the 404 page's links and stylesheet still work (its static <base>).
    page.goto(urljoin(site_url, 'a/b/c'))
    deep = page.evaluate("""() => ({home: document.querySelector('a.btn.primary').href, styled: getComputedStyle(document.querySelector('a.btn.primary')).display !== 'inline'})""")
    if deep != {'home': urljoin(site_url, 'index.html'), 'styled': True}:
        found.append(f'404 three folders deep: {deep}')
    context.close()
    assert found == [], 'Pages that do not read without JavaScript:\n' + '\n'.join(found)
