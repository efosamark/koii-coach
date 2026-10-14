"""Saved progress carries over: the targeted check for changes that could lose a learner's place.

01 First beat and 02 Make it a song used to be views of the single-page app, which saved a position in
koii-coach-v2 instead of ticks. progress.js derives their chapter records from that position and writes every move back
(so reverting the release finds the learner where they are). Each case below seeds localStorage the way an older
release left it, opens pages, and checks ticks, the step to continue at and the old key.
Run after a build, like test_smoke.py:  python -m pytest tests/test_progress.py
"""
import json
from urllib.parse import urljoin

import pytest

from support import watch

pytestmark = pytest.mark.browser

FIRST = ('beat-empty-project beat-tempo-grid beat-load-kick beat-load-snare beat-load-hat beat-hats-quieter beat-placement-move '
         'beat-kicks beat-snares beat-hats beat-listen-drums beat-balance beat-commit-drums beat-bass-sound beat-bass-pulses '
         'beat-bass-trim beat-reverb beat-scene-sync beat-performance beat-live-practice beat-live-record beat-live-undo beat-recap').split()
V2_FIELDS = {'schema', 'step', 'stepId', 'note', 'song', 'songId', 'view', 'done', 'firmware', 'finished', 'songFinished', 'lab'}


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
            """Start from an empty browser that holds exactly these keys (as an older release left them)."""
            page.goto(urljoin(site_url, 'manifest.webmanifest'))  # same origin, runs no page script
            page.evaluate('v => { localStorage.clear(); for (const [k, x] of Object.entries(v)) localStorage.setItem(k, JSON.stringify(x)); }', values)

        def get(self, key):
            return page.evaluate('k => JSON.parse(localStorage.getItem(k) || "null")', key)

    yield Run()
    context.close()
    assert errors == [], 'Browser JavaScript errors'
    assert bad == [], 'Failed app assets'


def v2(**fields):
    base = {'schema': 4, 'step': 0, 'stepId': 'beat-empty-project', 'note': 0, 'song': 0, 'songId': 'song-find-beat', 'view': 'first',
            'done': [], 'firmware': '2.5', 'finished': False, 'songFinished': False, 'lab': None}
    base.update(fields)
    return base


def test_place_in_01_carries_over_and_moves_are_written_back(run):
    run.seed({'koii-coach-v2': v2(step=5, stepId='beat-hats-quieter', note=3, done=['groups-and-scenes'], firmware='2')})
    run.go('./index.html')
    rec = run.get('koii-coach-ch-first-beat')
    assert rec['done'] == FIRST[:5] and rec['cur'] == 'beat-hats-quieter' and rec['n'] == 5, f'Derived from the old position ({rec})'
    assert rec['derivedFrom'] == 'beat-hats-quieter'
    assert run.get('koii-coach-prefs')['setup'] == 'ready', 'A learner with progress is never sent back to 00'
    page = run.page
    assert 'Chapter 01' in page.locator('.continue .eyebrow').text_content()
    assert page.locator('#resume').get_attribute('href') == './first-beat.html#s-beat-hats-quieter'
    assert page.locator('#course-list li').nth(1).get_attribute('data-state') == 'doing'

    # The chapter opens at that step and says once how the ticks were made.
    run.go('./first-beat.html')
    page.wait_for_function("() => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step === 'beat-hats-quieter'")
    assert 'carried over' in page.locator('#progress-note').text_content()
    assert page.evaluate("() => document.querySelector('.appbar-meter .meter-fill').style.width") == '22%', 'The app bar meter shows 5 of 23'
    assert 'Step 6 of 6' in page.locator('#appbar .bar-sub').text_content(), 'The app bar says where you are in the part'
    page.locator('#player-next').click()
    old = run.get('koii-coach-v2')
    assert set(old) == V2_FIELDS, f'koii-coach-v2 keeps its twelve fields ({sorted(old)})'
    assert (old['step'], old['stepId'], old['finished']) == (6, 'beat-placement-move', False), f'The move is written back ({old})'
    assert (old['firmware'], old['done'], old['note']) == ('2', ['groups-and-scenes'], 3), 'The other fields stay'
    run.go('./first-beat.html')
    assert 'carried over' not in (page.locator('#progress-note').text_content() or ''), 'The notice shows once'
    assert run.get('koii-coach-ch-first-beat')['done'] == FIRST[:6], 'No second derivation from our own write'

    # An older copy of the site moves the old position on (or the release is reverted and re-deployed): derive again,
    # keeping every tick.
    page.evaluate("() => { const v = JSON.parse(localStorage.getItem('koii-coach-v2')); v.step = 10; v.stepId = 'beat-listen-drums'; localStorage.setItem('koii-coach-v2', JSON.stringify(v)); }")
    run.go('./index.html')
    rec = run.get('koii-coach-ch-first-beat')
    assert rec['done'] == FIRST[:10] and rec['cur'] == 'beat-listen-drums', f'Derived again after the old key moved ({rec})'


def test_schema_2_and_finished_records(run):
    # Schema 2 (until 2026-10-12): 01's step and the Learn lessons were positions, and "not sure" was the default OS.
    run.seed({'koii-coach-v2': {'step': 18, 'note': 0, 'done': [0, 1], 'firmware': 'unknown', 'finished': False}})
    run.go('./learn.html')
    assert run.page.locator('#learn-count').text_content().startswith('2 of 19'), 'Lessons saved by position count as tried'
    rec = run.get('koii-coach-ch-first-beat')
    assert rec['cur'] == 'beat-recap' and rec['done'] == FIRST[:-1], f'Schema 2 step 18 is the recap ({rec})'
    run.go('./settings.html')
    assert run.page.locator('#firmware').input_value() == '2.5', 'Schema 2 "not sure" becomes OS 2.5'

    # Both chapters finished in the old app: complete here, and each opens on its chapter-complete screen.
    run.seed({'koii-coach-v2': v2(step=21, stepId='beat-recap', song=23, songId='song-recap', finished=True, songFinished=True)})
    run.go('./index.html')
    states = [run.page.locator('#course-list li').nth(i).get_attribute('data-state') for i in (1, 2)]
    assert states == ['done', 'done'], f'01 and 02 show as done on Home ({states})'
    run.go('./song.html')
    assert run.page.evaluate('location.hash') == '#done' and run.page.locator('#player-done').is_visible()
    song = run.get('koii-coach-ch-song')
    assert len(song['done']) == 24 and song['derivedFrom'] == 'song-recap:done'


def test_progress_file_round_trip(run, tmp_path):
    run.seed({'koii-coach-v2': v2(step=3, stepId='beat-load-snare', firmware='2'),
              'koii-coach-ch-sampling': {'v': 1, 'done': ['record-first-sample'], 'last': 'record-first-sample', 'n': 1},
              'koii-coach-prefs': {'v': 1, 'wake': 'off', 'setup': 'ready'}})
    run.go('./settings.html')
    file = run.page.evaluate('() => CoachProgress.exportFile()')
    assert file['app'] == 'koii-coach' and 'koii-coach-ch-first-beat' in file['data'], 'The file holds the derived record too'
    path = tmp_path / 'koii-coach-progress.json'
    path.write_text(json.dumps(file), encoding='utf-8')
    # A different browser state: other progress, other settings, another OS choice.
    run.seed({'koii-coach-v2': v2(firmware='older'), 'koii-coach-prefs': {'v': 1, 'wake': 'auto'},
              'koii-coach-ch-perform': {'v': 1, 'done': ['x'], 'last': 'x', 'n': 1}})
    run.go('./settings.html')
    run.page.once('dialog', lambda d: d.accept())
    run.page.locator('#import-file').set_input_files(str(path))
    run.page.locator('#toast', has_text='Progress loaded').wait_for()
    assert run.get('koii-coach-ch-sampling')['done'] == ['record-first-sample'], 'Chapter ticks come from the file'
    assert run.get('koii-coach-ch-perform') is None, 'Progress that was here is replaced'
    assert run.get('koii-coach-ch-first-beat')['cur'] == 'beat-load-snare'
    assert run.get('koii-coach-v2')['firmware'] == 'older', 'This browser keeps its OS choice'
    assert run.get('koii-coach-prefs')['wake'] == 'auto', 'This browser keeps its settings'
