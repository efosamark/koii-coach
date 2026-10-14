"""Browser smoke test for the built site (_site/). It replaced tests/smoke.mjs and runs the same checks.

Run it from the repository root once _site/ is built:
    python -m pytest tests/test_smoke.py --browser-channel chrome
Targets: "repository" (the site_url fixture) and, when LIVE_URL is set, "live-pages".
Writes ARTIFACTS_DIR/results.json as {note, results:[{target, status, error?, ...}]}, plus screenshots and traces.
"""
import json
import re
import traceback
from urllib.parse import urljoin

import pytest

from support import no_overflow, watch

pytestmark = pytest.mark.browser

NOTE = ('Tests exercise the UI, navigation, saved progress, the service worker and Web Audio scheduling in Chromium. '
        'They do not check sound quality, guide accuracy, real EP-133 hardware, Safari or offline use on a real phone.')

# Chapter pages in guided order: (file, <body data-chapter>, header number, previous link, next link).
CHAPTERS = [
    ('setup.html', 'setup', '0', None, './first-beat.html'),
    ('first-beat.html', 'first-beat', '1', './setup.html', './song.html'),
    ('song.html', 'song', '2', './first-beat.html', './sampling.html'),
    ('sampling.html', 'sampling', '3', './song.html', './perform.html'),
    ('perform.html', 'perform', '4', './sampling.html', './hiphop.html'),
    ('hiphop.html', 'hiphop', '5', './perform.html', './tech-house.html'),
    ('tech-house.html', 'tech-house', '6', './hiphop.html', './thodorakis-house.html'),
    ('thodorakis-house.html', 'vocal-house', '7', './tech-house.html', None),
]
# Tool pages: (file, h1, a selector the page must have).
TOOLS = [('learn.html', 'Learn', '[data-lesson]'), ('controls.html', 'Control map', '[data-control]'), ('lab.html', 'Rhythm lab', '#beat button'),
         ('help.html', 'Troubleshooting', '#search'), ('glossary.html', 'Glossary', '.gloss .term'), ('cheat-sheet.html', 'Cheat sheet', '.moves'),
         ('safety.html', 'Safety and erasing', '#delete-sample'), ('settings.html', 'Settings', '#firmware'), ('404.html', 'Page not found', '.path a')]
# Old addresses of the single-page app: (hash on index.html, the page it opens now, a selector that must be there).
LEGACY = [('first', 'first-beat.html', 'body[data-chapter="first-beat"]'), ('song/song-plan', 'song.html#s-song-plan', 'li[data-step="song-plan"]:visible'),
          ('manual/groups-and-scenes', 'learn.html#groups-and-scenes', 'details#groups-and-scenes[open]'),
          ('help/a-pad-is-silent', 'help.html#a-pad-is-silent', 'details#a-pad-is-silent[open]'), ('controls', 'controls.html', '[data-control]'),
          ('lab', 'lab.html', '#beat'), ('settings', 'settings.html', '#firmware'), ('help', 'help.html', '#search')]

# Counts every sound the page schedules, so "playing" and "stopped" can be told apart without listening.
# Python passes init scripts as text, so the body is wrapped in a call.
AUDIO_PROBE = """(()=>{
      window.__coachAudioContexts=[];
      window.__coachAudioStarts=0;
      const Native=window.AudioContext||window.webkitAudioContext;
      if(Native)window.AudioContext=class extends Native{
        constructor(...args){super(...args);window.__coachAudioContexts.push(this);}
        createOscillator(){const n=super.createOscillator();const start=n.start.bind(n);n.start=(...args)=>{window.__coachAudioStarts++;return start(...args);};return n;}
        createBufferSource(){const n=super.createBufferSource();const start=n.start.bind(n);n.start=(...args)=>{window.__coachAudioStarts++;return start(...args);};return n;}
      };
})();"""


def assert_match(text, pattern, flags=0, message=None):
    """assert.match: the text must contain a match for the regular expression."""
    assert re.search(pattern, text or '', flags), message or f'The input did not match the regular expression {pattern!r}. Input: {text!r}'


def store(page, key):
    """A koii-coach* key from localStorage, parsed."""
    return page.evaluate('k => JSON.parse(localStorage.getItem(k) || "null")', key)


def fresh_goto(page, url):
    """A fresh page load, as if the address were typed in (a hash-only change would not reload)."""
    page.goto('about:blank')
    page.goto(url, wait_until='networkidle')


def describe(error):
    """Failure text for results.json: what failed on the first line (the run summary prints only that), then where."""
    what = ''.join(traceback.format_exception_only(type(error), error)).rstrip('\n')
    return what + '\n' + ''.join(traceback.format_tb(error.__traceback__))


def say(line):
    """print() that cannot crash the report on a console that cannot show a character in the message (the arrow, say)."""
    try:
        print(line)
    except UnicodeEncodeError:
        print(line.encode('ascii', 'backslashreplace').decode('ascii'))


def run_target(browser, artifacts_dir, name, url, results):
    """Every check for one target: the app on a desktop, then the app and the chapter pages on a 390 px phone."""
    def absolute(href):
        return urljoin(url, href)

    errors, bad_assets = [], []
    result = {'target': name, 'url': url, 'checks': [], 'pageErrors': errors, 'badAssets': bad_assets}
    results.append(result)
    desktop = browser.new_context(viewport={'width': 1280, 'height': 900})
    phone = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    desktop.tracing.start(screenshots=True, snapshots=True)
    phone.tracing.start(screenshots=True, snapshots=True)
    desktop.add_init_script(AUDIO_PROBE)
    page = desktop.new_page()
    page.set_default_timeout(15000)
    watch(page, url, errors, bad_assets)
    try:
        # --- Home, desktop ---
        response = page.goto(url, wait_until='networkidle', timeout=45000)
        assert response and response.ok, f'Homepage returned HTTP {response.status if response else None}'
        # "/" opens Home. First run is defined by what the learner has done, not by saved keys, so reloads keep the welcome.
        for reload in range(3):
            if reload:
                page.reload(wait_until='networkidle')
            assert_match(page.locator('#main h1').first.text_content(), r'K\.O\. II', message='Home opens with the welcome h1')
            assert page.locator('.card.start a[href="./setup.html"]').count() > 0, 'First visit shows the welcome card linking 00'
        for file, _, num, _, _ in CHAPTERS:
            assert page.locator(f'nav a[href="./{file}"] .num').first.text_content().strip() == num, f'Main navigation numbers {file} as {num}'
        result['checks'].append('Home: first-run welcome card (kept over reloads) and chapter numbers in the navigation')
        page.screenshot(path=artifacts_dir / f'{name}-desktop.png', full_page=True)

        # --- 01 First beat in the step player ---
        page.goto(absolute('./first-beat.html'), wait_until='networkidle')
        assert page.evaluate('() => document.documentElement.dataset.player') == 'start', '01 opens on its start screen'
        page.locator('#player-next').click()
        page.wait_for_function("() => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step === 'beat-empty-project'")
        assert_match(page.title(), r'^Go home, and stop playback · Step 1 of 10', message='The tab title names the step')
        # The old app's first step is three steps now: the old place moves on once all three are ticked.
        first = ['beat-empty-project', 'beat-open-project-6', 'beat-check-empty']
        for i, sid in enumerate(first):
            page.locator('#player-next').click()
            page.wait_for_function(f"() => (document.activeElement && document.activeElement.closest('li[data-step]') || {{dataset: {{}}}}).dataset.step === {(first[i + 1] if i + 1 < len(first) else 'beat-tempo-grid')!r}")
        assert store(page, 'koii-coach-ch-first-beat')['done'] == first, 'Done · Next ticks the 01 steps'
        v2 = store(page, 'koii-coach-v2')
        assert v2['step'] == 1 and v2['stepId'] == 'beat-tempo-grid' and v2['schema'] == 4, f'01 moves are written back to koii-coach-v2 ({v2})'
        result['checks'].append('01 First beat runs in the player; Done · Next ticks and writes the place back to koii-coach-v2')

        # The placement helper walks this step's positions only (1.1.1 was placed in the step before), and is saved.
        fresh_goto(page, absolute('./first-beat.html#s-beat-kicks'))
        assert_match(page.locator('#placement').text_content(), r'^1\.2\.3 · A1$', message='The helper starts at the first kick not placed yet')
        page.locator('#note-next').click()
        assert_match(page.locator('#placement').text_content(), r'^1\.3\.1 · A1$')
        assert store(page, 'koii-coach-v2')['note'] == 2, 'The helper position is saved as koii-coach-v2.note'
        result['checks'].append('Placement helper: the step\'s own positions, one at a time, saved')

        # "Hear this recipe" plays the target rhythm, and moving to the next step stops it.
        page.locator('li[data-step="beat-kicks"] .hear-btn').click()
        page.wait_for_function("() => window.__coachAudioContexts.some(c => c.state === 'running') && window.__coachAudioStarts > 0")
        page.locator('#player-next').click()
        page.locator('li[data-step="beat-snares"]').wait_for(state='visible')
        stopped = page.evaluate('() => window.__coachAudioStarts')
        page.wait_for_timeout(400)
        assert page.evaluate('() => window.__coachAudioStarts') == stopped, 'Done · Next stops the practice sound'
        result['checks'].append('Web Audio: "Hear this recipe" starts; the next step stops scheduling new sounds')

        # With progress, "/" shows Continue, and Continue opens 01 at the step to continue at.
        page.goto(url, wait_until='networkidle')
        assert page.locator('.card.start').count() == 0, 'Home drops the welcome card once 01 has progress'
        assert_match(page.locator('.continue .eyebrow').text_content(), r'Chapter 1\b')
        cur = store(page, 'koii-coach-ch-first-beat')['cur']
        assert page.locator('#resume').get_attribute('href') == './first-beat.html#s-' + cur, 'Continue links the step to continue at'
        page.locator('#resume').click()
        page.wait_for_function("id => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step === id", arg=cur)
        result['checks'].append('Home continues 01 at the saved step')

        # Old addresses of the single-page app open their new pages; any other hash is Home.
        for old, new, sel in LEGACY:
            fresh_goto(page, absolute('./index.html#' + old))
            # The player may add #s-<step> to a chapter's address once it opens, so a bare page only has to match its path.
            page.wait_for_url(absolute('./' + new) if '#' in new else lambda u, n=absolute('./' + new): u.split('#')[0] == n)
            assert page.locator(sel).count() > 0, f'index.html#{old} opens {new} ({sel})'
        fresh_goto(page, absolute('./index.html#help/a-pad-is-silent'))
        page.wait_for_url(absolute('./help.html#a-pad-is-silent'))
        page.wait_for_function("() => document.activeElement === document.querySelector('#a-pad-is-silent summary')")
        fresh_goto(page, absolute('./index.html#no-such-view'))
        assert page.evaluate('location.hash') == '' and page.locator('#resume').count() == 1, 'An unknown hash opens Home'
        result['checks'].append('Old routes #first #song/<step> #manual/<lesson> #help/<topic> #controls #lab #settings #help open their pages; '
                                'an unknown hash opens Home')

        # Every tool page has its h1 and its contents.
        for file, h1, sel in TOOLS:
            r = page.goto(absolute('./' + file), wait_until='networkidle')
            assert r and r.ok, f'{file} returned HTTP {r.status if r else None}'
            assert page.locator('#main h1').text_content().strip() == h1, f'{file} h1 is {h1}'
            assert page.locator(sel).count() > 0, f'{file} has {sel}'
        result['checks'].append('Tool pages: Learn, Control map, Rhythm lab, Troubleshooting, Glossary, Cheat sheet, Safety, Settings, 404')

        page.goto(absolute('./controls.html'), wait_until='networkidle')
        page.locator('[data-control="SAMPLE"]').click()
        assert_match(page.locator('#info').text_content(), r'capture|source|input', re.I)
        assert page.locator('[data-control="SAMPLE"]').get_attribute('aria-checked') == 'true'
        page.keyboard.press('ArrowRight')
        assert page.locator('[data-control="KEYS"]').get_attribute('aria-checked') == 'true', 'Arrow keys move through the controls'
        result['checks'].append('Control map: a tap explains the control; arrow keys move')

        page.goto(absolute('./learn.html'), wait_until='networkidle')
        lesson = page.locator('[data-lesson="0"]')
        lesson.locator('summary').click()
        assert page.evaluate('location.hash') == '#samples-notes-and-patterns', 'An opened lesson has its own address'
        lesson.locator('.complete').click()
        assert lesson.locator('.complete').get_attribute('aria-pressed') == 'true'
        assert 'samples-notes-and-patterns' in store(page, 'koii-coach-v2')['done'], 'A tried lesson is saved'
        page.go_back()  # opening a lesson added a history entry, so Back closes it again
        page.wait_for_function("() => !document.querySelector('[data-lesson=\"0\"]').open && location.hash === ''")
        result['checks'].append('Learn: a lesson can be marked as tried; Back closes the lesson')

        page.goto(absolute('./help.html'), wait_until='networkidle')
        page.locator('#search').fill('silent')
        page.locator('#results h2.sub:visible').first.wait_for()
        assert page.locator('#results details[data-topic]:visible').count() > 0, 'Help search "silent" lists a troubleshooting topic'
        assert page.locator('#results details[data-topic="my-taps-do-not-repeat"]').is_hidden(), 'Topics that do not match are hidden'
        page.locator('#search').fill('USB')
        assert page.locator('#results details[data-topic]:visible').count() > 0, 'Help search "USB" lists a troubleshooting topic'
        assert_match(page.evaluate('location.search'), r'q=USB', message='The query is in the address')
        result['checks'].append('Troubleshooting search filters the topics')

        # OS choice (Settings): a step that needs OS 2.0 shows a warning for an older OS and an OK badge for OS 2.5.
        page.goto(absolute('./settings.html'), wait_until='networkidle')
        page.locator('#firmware').select_option('older')
        assert_match(page.locator('#version-note').text_content(), r'update first', re.I)
        assert store(page, 'koii-coach-v2')['firmware'] == 'older'
        fresh_goto(page, absolute('./song.html#s-song-list-open'))
        assert_match(page.locator('li[data-step="song-list-open"] .badge.warn').text_content(), r'Needs OS 2\.0\+')
        page.goto(absolute('./settings.html'), wait_until='networkidle')
        page.locator('#firmware').select_option('2.5')
        fresh_goto(page, absolute('./song.html#s-song-list-open'))
        assert page.locator('.badge.warn').count() == 0
        assert_match(page.locator('li[data-step="song-list-open"] .badge.ok').text_content(), r'Needs OS')
        result['checks'].append('The OS choice in Settings changes the "Needs OS" badges')

        # 02: the step on screen survives a reload (the address holds it).
        page.locator('#player-next').click()
        page.reload(wait_until='networkidle')
        page.wait_for_function("() => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step === 'song-position-1'")
        result['checks'].append('A 02 step survives a reload')

        page.goto(absolute('./lab.html'), wait_until='networkidle')
        assert page.locator('#beat button').count() == 64
        page.locator('#clear').click()
        assert page.locator('#beat button.on').count() == 0
        page.locator('#recipe').click()
        assert page.locator('#beat button.on').count() == 16
        page.locator('#beat button').first.click()
        assert page.locator('#beat button.on').count() == 15
        assert len(store(page, 'koii-coach-v2')['lab'][0]) == 3, 'The lab pattern is saved'
        page.locator('#recipe').click()
        result['checks'].append('64-cell rhythm grid, clear/recipe and note toggles')
        page.locator('#audio-play').click()
        page.wait_for_function("() => window.__coachAudioContexts.some(c => c.state === 'running') && window.__coachAudioStarts > 0")
        page.locator('#audio-play').click()
        stopped_starts = page.evaluate('() => window.__coachAudioStarts')
        page.wait_for_timeout(400)
        assert page.evaluate('() => window.__coachAudioStarts') == stopped_starts
        page.locator('#audio-play').click()
        page.wait_for_function('old => window.__coachAudioStarts > old', arg=stopped_starts)
        page.locator('#audio-play').click()
        result['checks'].append('Web Audio in the lab starts and Stop stops scheduling new sounds')

        # Service worker: registers, and Home's footer reports the offline copy once every asset is cached.
        # Capped at 30 s: if one precached file is missing, install fails and .ready would never resolve.
        page.goto(url, wait_until='networkidle')
        sw = page.evaluate("""() => 'serviceWorker' in navigator ? Promise.race([
            navigator.serviceWorker.ready.then(r => Boolean(r.active)),
            new Promise(resolve => setTimeout(() => resolve(false), 30000))]) : false""")
        assert sw, 'Service worker is active'
        page.reload(wait_until='networkidle')
        page.wait_for_function("() => /Offline ready: the coach and all its chapters/.test(document.querySelector('#offline').textContent)", timeout=30000)
        result['checks'].append('Service worker registers and caches every page')

        # Reset all progress (in Settings) asks first: Cancel keeps progress, OK clears it but keeps the settings, Undo restores it.
        page.goto(absolute('./settings.html'), wait_until='networkidle')
        page.locator('input[name="wake"][value="off"]').check()  # a setting in koii-coach-prefs that Reset must keep
        before = store(page, 'koii-coach-ch-first-beat')
        assert before and before['done'], '01 has progress before the reset test'
        asked = []

        def cancel(dialog):
            asked.append(dialog.message)
            dialog.dismiss()

        page.once('dialog', cancel)
        page.locator('#reset').click()
        assert_match(asked[0] if asked else '', r'Reset all')
        assert store(page, 'koii-coach-ch-first-beat') == before, 'Cancel keeps progress'
        page.once('dialog', lambda dialog: dialog.accept())
        page.locator('#reset').click()
        page.locator('#toast', has_text='reset').wait_for()
        assert store(page, 'koii-coach-ch-first-beat') is None, 'OK resets progress'
        assert store(page, 'koii-coach-v2')['firmware'] == '2.5', 'Reset keeps the firmware choice'
        prefs = store(page, 'koii-coach-prefs')
        assert prefs and prefs.get('wake') == 'off' and prefs.get('setup') == 'ready', f'Reset keeps koii-coach-prefs (got {prefs})'
        page.locator('#toast button', has_text='Undo').click()
        assert store(page, 'koii-coach-ch-first-beat') == before, 'Undo brings the progress back'
        result['checks'].append('Reset all progress asks for confirmation, keeps the settings and can be undone')

        # --- 390 px phone ---
        page = phone.new_page()
        page.set_default_timeout(15000)
        watch(page, url, errors, bad_assets)
        page.goto(url, wait_until='networkidle')
        no_overflow(page, 'Home (first run) at 390 px')
        for file, _, _ in TOOLS:
            page.goto(absolute('./' + file), wait_until='networkidle')
            no_overflow(page, f'{file} at 390 px')
        page.goto(absolute('./first-beat.html#s-beat-hats'), wait_until='networkidle')
        assert page.locator('#note-next').is_visible() and page.locator('#player-next').is_visible()
        no_overflow(page, 'first-beat.html placement step at 390 px')
        page.screenshot(path=artifacts_dir / f'{name}-mobile.png', full_page=False)

        # --- Chapter pages, 390 px phone ---
        # Each page opens in the step player (player.js): a fresh visit shows the start screen, which hides the steps.
        # The list checks therefore run at <file>.html#all (All steps), the player checks at <file>.html#s-<first id>.
        for file, slug, num, prev, nxt in CHAPTERS:
            r = page.goto(absolute('./' + file), wait_until='networkidle')
            assert r and r.ok, f'{file} returned HTTP {r.status if r else None}'
            assert page.evaluate("() => document.documentElement.dataset.player") == 'start', f'{file}: a fresh visit opens the start screen'
            assert_match(page.locator('#player-next').text_content(), r'Start Part 1', message=f'{file}: the start screen offers Start Part 1')
            no_overflow(page, f'{file} start screen at 390 px')
            page.goto(absolute('./' + file + '#all'), wait_until='networkidle')
            assert page.evaluate('() => document.body.dataset.chapter') == slug
            assert_match(page.locator('header .eyebrow').text_content(), '^CHAPTER ' + num + ' /', message=f'{file} header says CHAPTER {num}')
            assert page.locator('.steps ol>li[data-step]').count() > 0, f'{file} has steps'
            assert page.locator('footer a[href*="wrong-instruction.yml"]').count() == 1, f'{file} footer has the report link'
            assert page.locator('footer', has_text='Not affiliated with or endorsed by teenage engineering').count() > 0, \
                f'{file} footer has the non-affiliation line'
            prev_link, next_link = page.locator('.chapters .prev'), page.locator('.chapters .next')
            assert (prev_link.get_attribute('href') if prev_link.count() else None) == prev, f'{file} previous link'
            assert (next_link.get_attribute('href') if next_link.count() else None) == nxt, f'{file} next link'
            no_overflow(page, f'{file} at 390 px')
            if file == 'setup.html':
                page.screenshot(path=artifacts_dir / f'{name}-chapter-mobile.png', full_page=False)

            # A ticked step survives a reload.
            page.evaluate("() => document.querySelectorAll('.steps details').forEach(d => { d.open = true; })")
            box = page.locator('.steps ol>li .check input').first
            step_id = page.locator('.steps ol>li').first.get_attribute('data-step')
            box.check()
            assert page.evaluate('k => JSON.parse(localStorage.getItem(k))', 'koii-coach-ch-' + slug)['done'] == [step_id]
            page.reload(wait_until='networkidle')
            assert page.locator('.steps ol>li .check input').first.is_checked(), f'{file}: tick survives reload'
            assert_match(page.locator('#progress-count').text_content(), r'^1 of \d+ done\Z')  # \Z: JS's $ does not allow a trailing newline
            page.locator('.steps ol>li .check input').first.uncheck()

            # The player: one step at a time. Done · Next ticks the step and shows the next one, Back returns, the
            # action bar is on screen and nothing scrolls sideways.
            first_id, second_id = (page.locator('.steps ol>li[data-step]').nth(i).get_attribute('data-step') for i in (0, 1))
            page.goto('about:blank')
            page.goto(absolute(f'./{file}#s-{first_id}'), wait_until='networkidle')
            first_li, second_li = page.locator(f'.steps li[data-step="{first_id}"]'), page.locator(f'.steps li[data-step="{second_id}"]')
            assert first_li.is_visible() and second_li.is_hidden(), f'{file}#s-{first_id} shows that step alone'
            assert page.evaluate("() => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step") == first_id, f'{file}: the step (or its title) is focused'
            bar = page.locator('#player-actions').bounding_box()
            assert page.locator('#player-actions').is_visible() and bar and bar['y'] + bar['height'] <= 844 + 1, f'{file}: action bar on screen ({bar})'
            no_overflow(page, f'{file} player at 390 px')
            if page.locator('.gate-btn:visible').count():  # a step that cannot be undone asks first
                page.locator('.gate-btn:visible').click()
            page.locator('#player-next').click()
            assert page.evaluate('k => JSON.parse(localStorage.getItem(k))', 'koii-coach-ch-' + slug)['done'] == [first_id], f'{file}: Done · Next ticks the step'
            assert second_li.is_visible() and first_li.is_hidden(), f'{file}: Done · Next shows step 2'
            assert page.evaluate('location.hash') == '#s-' + second_id, f'{file}: the address follows the step'
            page.locator('#player-back').click()
            assert first_li.is_visible() and second_li.is_hidden(), f'{file}: Back returns to step 1'
            assert_match(page.locator('#player-next').text_content(), r'^\s*Next\s*$', message=f'{file}: a ticked step reads Next')
            first_li.locator('.check input').uncheck()

            # Previous and next chapter links land on the right page.
            for href in [h for h in (prev, nxt) if h]:
                page.goto(absolute('./' + file), wait_until='networkidle')
                page.locator(f'.chapters a[href="{href}"]').click()
                page.wait_for_url(absolute(href))
                page.wait_for_load_state('networkidle')
                assert page.locator('header .eyebrow').count() > 0, f'{file} → {href} opens a chapter page'
        result['checks'].append('Chapter pages 00, 01, 02 and 07-11: start screen, list at #all (ticks survive reload), player at #s-<first id> '
                                '(Done · Next ticks and moves on, Back returns, action bar on screen), report link, prev/next, no horizontal scrolling')

        # A #s-<step id> link opens that step in the player and focuses it, below the sticky bars; in All steps it opens
        # the step's section in the list instead.
        page.goto('about:blank')
        page.goto(absolute('./perform.html#s-sc-open'), wait_until='networkidle')
        page.wait_for_function("() => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step === 'sc-open'")
        box = page.evaluate("""() => {const r = document.activeElement.closest('li[data-step]').getBoundingClientRect(), s = document.querySelector('#appbar').getBoundingClientRect();
            return {top: r.top, bar: s.bottom, h: innerHeight};}""")
        assert box['bar'] <= box['top'] < box['h'], f'perform.html#s-sc-open shows the step below the app bar ({box})'
        page.goto(absolute('./perform.html#all'), wait_until='networkidle')
        page.evaluate("() => { location.hash = '#s-sc-open'; }")  # a step link followed from the list opens the player
        page.wait_for_function("() => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step === 'sc-open' && document.documentElement.dataset.player === 'step'")
        # The chapter actions' (⋮) switch saves All steps for this chapter (read-modify-write: other settings stay).
        page.evaluate("() => localStorage.setItem('koii-coach-prefs', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('koii-coach-prefs') || '{}'), {v: 1, wake: 'auto'})))")
        page.locator('#chapter-actions-btn').click()
        page.locator('#chapter-actions [data-mode="all"]').click()
        page.wait_for_function("() => location.hash === '#all' && !document.documentElement.dataset.player")
        prefs = page.evaluate("() => JSON.parse(localStorage.getItem('koii-coach-prefs') || 'null')")
        assert prefs and prefs.get('modes', {}).get('perform') == 'all' and prefs.get('wake') == 'auto', f'All steps is saved per chapter, other settings kept ({prefs})'
        page.goto('about:blank')
        page.goto(absolute('./perform.html#s-sc-open'), wait_until='networkidle')
        page.wait_for_function("() => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step === 'sc-open'")
        box = page.evaluate("""() => {const r = document.activeElement.closest('li[data-step]').getBoundingClientRect(), s = document.querySelector('#progress').getBoundingClientRect();
            return {top: r.top, bar: s.bottom, h: innerHeight, player: document.documentElement.dataset.player || ''};}""")
        assert box['player'] == '' and box['bar'] <= box['top'] < box['h'], f'In All steps, #s-sc-open shows the step in the list below the bars ({box})'
        page.locator('main .player-modes [data-mode="player"]').click()
        assert page.evaluate("() => document.documentElement.dataset.player") in ('start', 'step'), 'The Player switch leaves the list'
        result['checks'].append('A #s-<step id> link opens and focuses that step (player, and the list in All steps); the mode is saved per chapter')

        # Site search (the app bar's overlay) finds a chapter step for "sidechain". The result opens a read-only preview
        # (searching never moves the learner); "Go to this step" then opens it.
        page.goto(url, wait_until='networkidle')
        page.locator('#appbar .search-btn').click()
        page.locator('#site-search').fill('sidechain')
        hit = page.locator('#site-results a.search-hit[href*=".html#s-"]').first
        hit.wait_for()
        href = hit.get_attribute('href')
        hit.click()
        page.locator('#site-results .search-preview').wait_for()
        assert page.url == url, 'A step result opens a preview, not the step'
        page.locator('#site-results .search-preview [data-back]').click()
        page.locator('#site-results a.search-hit[href*=".html#s-"]').first.wait_for()
        page.locator('#site-results a.search-hit[href*=".html#s-"]').first.click()
        page.locator(f'#site-results .search-preview a[href="{href}"]').click()
        page.wait_for_url(absolute(href))
        page.wait_for_function("id => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step === id", arg=href.split('#s-')[1])
        # The same search finds 01's steps by their titles, and help topics on help.html. In a chapter's step view on a
        # phone the app bar leaves search to the Tools sheet; "/" opens it from anywhere.
        page.keyboard.press('/')
        page.locator('#site-search').fill('snare')
        page.locator('#site-results a.search-hit[href^="./first-beat.html#s-"]').first.wait_for()
        page.locator('#site-search').fill('silent pad')
        topic = page.locator('#site-results details.search-topic[data-href="./help.html#a-pad-is-silent"]')
        topic.locator('summary').click()
        assert topic.evaluate('d => d.open') and topic.locator('a[href="./help.html#a-pad-is-silent"]').is_visible(), 'A help topic opens in place'
        page.keyboard.press('Escape')
        result['checks'].append('Search finds chapter steps ("sidechain", "snare" in 01) and help topics (opened in place); a step opens as a preview, then the step')

        # After ticks in a chapter, Home's Continue opens that chapter at the next step to do.
        page.goto(absolute('./sampling.html#all'), wait_until='networkidle')
        page.evaluate("() => document.querySelectorAll('.steps details').forEach(d => { d.open = true; })")
        for i in (0, 1):
            page.locator('.steps ol>li .check input').nth(i).check()
        next_step = page.locator('.steps ol>li').nth(2).get_attribute('data-step')
        page.goto(url, wait_until='networkidle')
        assert_match(page.locator('.continue .eyebrow').text_content(), r'Chapter 3\b')
        assert page.locator('#resume').get_attribute('href') == './sampling.html#s-' + next_step, 'Continue links the next step'
        page.locator('#resume').click()
        page.wait_for_url(absolute('./sampling.html#s-' + next_step))
        page.wait_for_function("id => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step === id", arg=next_step)
        result['checks'].append('Home continues a chapter page at the step after the last tick')

        assert errors == [], 'Browser JavaScript errors'
        assert bad_assets == [], 'Failed app assets'
        result['status'] = 'passed'
    except Exception as e:  # noqa: BLE001 - record every kind of failure the same way and keep the evidence
        result['status'] = 'failed'
        result['error'] = describe(e)
        try:
            page.screenshot(path=artifacts_dir / f'{name}-failure.png')
        except Exception:  # noqa: BLE001 - the page may be gone already
            pass
    finally:
        for context, label in ((desktop, 'desktop'), (phone, 'phone')):
            try:
                context.tracing.stop(path=artifacts_dir / f'{name}-{label}-trace.zip')
            except Exception:  # noqa: BLE001 - a missing trace must not hide the result
                pass
        desktop.close()
        phone.close()


def test_smoke(browser, site_url, live_url, artifacts_dir):
    targets = [('repository', site_url)]
    if live_url:
        targets.append(('live-pages', live_url))
    results = []
    try:
        for name, url in targets:
            run_target(browser, artifacts_dir, name, url, results)
    finally:
        # Written even when a check failed or the run stopped early, so there is always evidence to look at.
        note = NOTE + ('' if live_url else ' The live site was not tested (LIVE_URL empty).')
        text = json.dumps({'note': note, 'results': results}, sort_keys=True, indent=1, ensure_ascii=False) + '\n'
        (artifacts_dir / 'results.json').write_text(text, encoding='utf-8', newline='\n')
        for r in results:
            error = r.get('error')
            say(f"{r['target']}: {r.get('status')}" + (f" - {error.splitlines()[0]}" if error else ''))
    failed = [r for r in results if r.get('status') != 'passed']
    if failed:
        report = '\n'.join(f"{r['target']}: {r.get('error') or 'no result recorded'}" for r in failed)
        pytest.fail(f"{report}\nScreenshots, traces and results.json: {artifacts_dir}", pytrace=False)
