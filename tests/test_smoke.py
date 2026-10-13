"""Browser smoke test for the built site (_site/). It replaced tests/smoke.mjs and runs the same checks.

Run it from the repository root once _site/ is built:
    python -m pytest tests/test_smoke.py --browser-channel chrome
Targets: "repository" (the site_url fixture) and, when LIVE_URL is set, "live-pages".
Writes ARTIFACTS_DIR/results.json as {note, results:[{target, status, error?, ...}]}, plus screenshots and traces.
"""
import json
import re
import traceback
from urllib.parse import urljoin, urlsplit

import pytest

from support import no_overflow, watch

pytestmark = pytest.mark.browser

NOTE = ('Tests exercise the UI, navigation, saved progress, the service worker and Web Audio scheduling in Chromium. '
        'They do not check sound quality, guide accuracy, real EP-133 hardware, Safari or offline use on a real phone.')

# Chapter pages in guided order: (file, <body data-chapter>, header number, previous link, next link).
CHAPTERS = [
    ('setup.html', 'setup', '00', None, './index.html#first'),
    ('sampling.html', 'sampling', '07', './index.html#song', './perform.html'),
    ('perform.html', 'perform', '08', './sampling.html', './hiphop.html'),
    ('hiphop.html', 'hiphop', '09', './perform.html', './tech-house.html'),
    ('tech-house.html', 'tech-house', '10', './hiphop.html', './thodorakis-house.html'),
    ('thodorakis-house.html', 'vocal-house', '11', './tech-house.html', None),
]
VIEWS = [('first', '#step-title'), ('song', '#song-title'), ('manual', '[data-lesson]'),
         ('controls', '[data-control]'), ('lab', '#beat'), ('help', '#search')]

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


def current_view(page):
    return page.locator('nav [data-view][aria-current="page"]').first.get_attribute('data-view')


def open_view(page, url, v):
    """Opens index.html#view as a fresh page load (as if typed into the address bar) and waits for that view."""
    page.goto('about:blank')
    page.goto(urljoin(url, './index.html#' + v), wait_until='networkidle')
    page.locator(f'nav [data-view="{v}"][aria-current="page"]').wait_for(state='attached')


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
        # --- Main app, desktop ---
        response = page.goto(url, wait_until='networkidle', timeout=45000)
        assert response and response.ok, f'Homepage returned HTTP {response.status if response else None}'
        assert_match(page.locator('h1').first.text_content(), r'first beat', re.I)
        assert page.locator('.card.start a[href="./setup.html"]').count() > 0, 'First visit shows the "Start here" card linking 00'
        for file, _, num, _, _ in CHAPTERS:
            assert page.locator(f'nav a[href="./{file}"] .num').first.text_content().strip() == num, f'Main navigation numbers {file} as {num}'
        result['checks'].append('Homepage, first-beat chapter, start card and chapter numbers in the navigation')
        page.screenshot(path=artifacts_dir / f'{name}-desktop.png', full_page=True)

        page.locator('#next').click()
        assert page.locator('[data-step="1"]').get_attribute('aria-current') == 'step'
        page.locator('#note-next').click()
        assert_match(page.locator('#placement').text_content(), r'1\.2\.3')
        result['checks'].append('Recipe navigation and exact note-position helper')

        page.locator('nav [data-view="controls"]').click()
        page.locator('[data-control="SAMPLE"]').first.click()
        assert_match(page.locator('#info').text_content(), r'capture|source|input', re.I)
        result['checks'].append('Clickable control explanations')

        page.locator('nav [data-view="manual"]').click()
        page.locator('[data-lesson="0"]').click()
        page.locator('#complete').click()
        result['checks'].append('Learn lesson can be marked as tried')

        page.locator('nav [data-view="help"]').click()
        page.locator('#search').fill('silent')
        page.locator('#results h2.sub', has_text='Troubleshooting').wait_for()
        assert page.locator('#results details').count() > 0, 'Help search "silent" lists a troubleshooting topic'
        page.locator('#search').fill('USB')
        assert page.locator('#results details').count() > 0, 'Help search "USB" lists a troubleshooting topic'
        result['checks'].append('Help search returns troubleshooting topics')

        # Firmware picker: a step that needs OS 2.0 shows a warning badge for an older OS and an OK badge for OS 2.5.
        os_step = page.evaluate('() => song.findIndex(s => s[7] && s[7].os)')
        assert os_step >= 0, 'course.js has a song step with a minimum OS'
        page.locator('#firmware').select_option('older')
        assert_match(page.locator('#version-note').text_content(), r'update first', re.I)
        page.locator('nav [data-view="song"]').click()
        page.locator(f'[data-song-step="{os_step}"]').click()
        assert page.locator(f'[data-song-step="{os_step}"]').get_attribute('aria-current') == 'step'
        assert_match(page.locator('.badge.warn').first.text_content(), r'Needs OS')
        page.locator('nav [data-view="help"]').click()
        page.locator('#firmware').select_option('2.5')
        page.locator('nav [data-view="song"]').click()
        assert page.locator('.badge.warn').count() == 0
        assert_match(page.locator('.badge.ok').first.text_content(), r'Needs OS')
        result['checks'].append('Firmware picker changes the "Needs OS" badge')

        # Song chapter: the current step survives a reload (the #song hash reopens the view).
        page.reload(wait_until='networkidle')
        assert current_view(page) == 'song'
        assert page.locator(f'[data-song-step="{os_step}"]').get_attribute('aria-current') == 'step'
        result['checks'].append('Song step and view survive reload')

        # Hash routes, typed into the address bar and changed in place.
        for v, sel in VIEWS:
            open_view(page, url, v)
            assert current_view(page) == v, f'#{v} opens the {v} view'
            assert page.locator(sel).count() > 0, f'#{v} renders {sel}'
        page.evaluate("() => { location.hash = '#lab'; }")
        page.wait_for_function("""() => document.querySelector('nav [data-view="lab"][aria-current="page"]')""")
        result['checks'].append('Hash routes #first #song #manual #controls #lab #help')

        page.locator('nav [data-view="lab"]').click()
        assert page.locator('#beat button').count() == 64
        page.locator('#clear').click()
        assert page.locator('#beat button.on').count() == 0
        page.locator('#recipe').click()
        assert page.locator('#beat button.on').count() == 16
        page.locator('#beat button').first.click()
        assert page.locator('#beat button.on').count() == 15
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
        page.locator('nav [data-view="first"]').click()
        navigation_starts = page.evaluate('() => window.__coachAudioStarts')
        page.wait_for_timeout(400)
        assert page.evaluate('() => window.__coachAudioStarts') == navigation_starts
        result['checks'].append('Web Audio starts; Stop and navigation stop scheduling new sounds')

        # Service worker: registers, and the footer reports the offline copy once every asset is cached.
        # Capped at 30 s: if one precached file is missing, install fails and .ready would never resolve.
        sw = page.evaluate("""() => 'serviceWorker' in navigator ? Promise.race([
            navigator.serviceWorker.ready.then(r => Boolean(r.active)),
            new Promise(resolve => setTimeout(() => resolve(false), 30000))]) : false""")
        assert sw, 'Service worker is active'
        page.wait_for_function("() => /Offline ready: the coach and all its chapters/.test(document.querySelector('#offline').textContent)", timeout=30000)
        result['checks'].append('Service worker registers and caches every chapter')

        # Reset all progress asks first: Cancel keeps progress, OK clears it.
        open_view(page, url, 'help')

        def saved():
            return page.evaluate("() => JSON.parse(localStorage.getItem('koii-coach-v2') || 'null')")

        assert saved()['song'] > 0, 'Song progress is saved before the reset test'
        asked = []

        def cancel(dialog):
            asked.append(dialog.message)
            dialog.dismiss()

        page.once('dialog', cancel)
        page.locator('#reset').click()
        assert_match(asked[0] if asked else '', r'Reset all')
        assert saved()['song'] > 0, 'Cancel keeps progress'
        page.once('dialog', lambda dialog: dialog.accept())
        page.locator('#reset').click()
        page.locator('#toast', has_text='reset').wait_for()
        after = saved()
        assert after['song'] == 0, 'OK resets progress'
        assert after['firmware'] == '2.5', 'Reset keeps the firmware choice'
        result['checks'].append('Reset all progress asks for confirmation')

        # --- Main app, 390 px phone ---
        page = phone.new_page()
        page.set_default_timeout(15000)
        watch(page, url, errors, bad_assets)
        for v, _ in VIEWS:
            open_view(page, url, v)
            no_overflow(page, f'index.html#{v} at 390 px')
        open_view(page, url, 'first')
        assert page.locator('#next').is_visible()
        assert page.locator('#note-next').is_visible()
        page.screenshot(path=artifacts_dir / f'{name}-mobile.png', full_page=True)
        # Next from the bottom of a long step brings the new step's title into view and focuses it.
        page.evaluate('() => window.scrollTo(0, document.documentElement.scrollHeight)')
        page.locator('#next').click()
        title = page.evaluate("""() => {
            const r = document.querySelector('#step-title').getBoundingClientRect();
            return {top: r.top, bottom: r.bottom, h: window.innerHeight, focused: document.activeElement && document.activeElement.id};
        }""")
        assert title['top'] >= 0 and title['bottom'] <= title['h'], \
            f"Next shows the new step title (top {round(title['top'])}px in a {title['h']}px window)"
        assert title['focused'] == 'step-title'
        result['checks'].append('Phone width: no horizontal scrolling in any view; Next scrolls the new step into view')

        # --- Chapter pages, 390 px phone ---
        for file, slug, num, prev, nxt in CHAPTERS:
            r = page.goto(absolute('./' + file), wait_until='networkidle')
            assert r and r.ok, f'{file} returned HTTP {r.status if r else None}'
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

            # Previous and next chapter links land on the right page (and the right view of the main app).
            for href in [h for h in (prev, nxt) if h]:
                page.goto(absolute('./' + file), wait_until='networkidle')
                page.locator(f'.chapters a[href="{href}"]').click()
                page.wait_for_url(absolute(href))
                page.wait_for_load_state('networkidle')
                fragment = urlsplit(absolute(href)).fragment
                if fragment:
                    assert current_view(page) == fragment, f'{file} → {href} opens the {fragment} view'
                else:
                    assert page.locator('header .eyebrow').count() > 0, f'{file} → {href} opens a chapter page'
        result['checks'].append('Chapter pages 00 and 07-11: load cleanly, report link, prev/next, ticks survive reload, no horizontal scrolling')

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
