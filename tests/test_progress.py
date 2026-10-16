"""Saved progress carries over: the targeted check for changes that could lose a learner's place.

01 First beat and 02 Make it a song used to be views of the single-page app, which saved a position in
koii-coach-v2 instead of ticks. progress.js derives their chapter records from that position and writes every move back
(so reverting the release finds the learner where they are). Each case below seeds localStorage the way an older
release left it, opens pages, and checks ticks, the step to continue at and the old key.
Run after a build, like test_smoke.py:  python -m pytest tests/test_progress.py
"""
import json
import pathlib
from urllib.parse import urljoin

import pytest

from support import watch

pytestmark = pytest.mark.browser

# first-beat.html's steps in page order (progress.js ORDER), since Chapter 1 was rewritten to the step budget.
FIRST = ('beat-empty-project beat-open-project-6 beat-check-empty beat-tempo-grid beat-grid-16 beat-load-kick '
         'beat-hear-kick beat-load-snare beat-load-hat beat-hats-quieter beat-placement-move beat-kicks '
         'beat-snares beat-hats beat-listen-drums beat-balance beat-balance-levels beat-commit-drums '
         'beat-commit-copy beat-bass-sound beat-bass-load beat-bass-pulses beat-bass-trim beat-bass-trim-y '
         'beat-reverb beat-reverb-send beat-scene-sync beat-performance beat-perform-start beat-perform '
         'beat-live-practice beat-live-play-along beat-live-record beat-live-record-tap beat-live-record-stop '
         'beat-live-undo beat-live-erase-note beat-live-beat-clean beat-recap beat-recap-try').split()
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
            # A sheet closed just before removes its history entry with history.back(), a moment later; a goto started
            # before that lands is aborted by it. Wait until no sheet's entry is left.
            page.wait_for_function("() => !(history.state && history.state.coachDialog) || !!document.querySelector('dialog[open]')")
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
    hq = FIRST.index('beat-hats-quieter')
    assert rec['done'] == FIRST[:hq] and rec['cur'] == 'beat-hats-quieter' and rec['n'] == hq, f'Derived from the old position ({rec})'
    assert rec['derivedFrom'] == 'beat-hats-quieter'
    assert run.get('koii-coach-prefs')['setup'] == 'ready', 'A learner with progress is never sent back to 00'
    page = run.page
    assert 'Chapter 1' in page.locator('.continue .eyebrow').text_content()
    assert page.locator('#resume').get_attribute('href') == './first-beat.html#s-beat-hats-quieter'
    assert page.locator('#course-list li').nth(1).get_attribute('data-state') == 'doing'

    # The chapter opens at that step and says once how the ticks were made.
    run.go('./first-beat.html')
    page.wait_for_function("() => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step === 'beat-hats-quieter'")
    assert 'carried over' in page.locator('#progress-note').text_content()
    assert page.evaluate("() => document.querySelector('.appbar-meter .meter-fill').style.width") == f'{int(100 * hq / len(FIRST) + 0.5)}%', 'The app bar meter shows the steps before it as done'
    assert 'Step 10 of 10' in page.locator('#appbar .bar-sub').text_content(), 'The app bar says where you are in the part'
    page.locator('#player-next').click()
    old = run.get('koii-coach-v2')
    assert set(old) == V2_FIELDS, f'koii-coach-v2 keeps its twelve fields ({sorted(old)})'
    assert (old['step'], old['stepId'], old['finished']) == (6, 'beat-placement-move', False), f'The move is written back ({old})'
    assert (old['firmware'], old['done'], old['note']) == ('2', ['groups-and-scenes'], 3), 'The other fields stay'
    run.go('./first-beat.html')
    assert 'carried over' not in (page.locator('#progress-note').text_content() or ''), 'The notice shows once'
    assert run.get('koii-coach-ch-first-beat')['done'] == FIRST[:FIRST.index('beat-placement-move')], 'No second derivation from our own write'

    # An older copy of the site moves the old position on (or the release is reverted and re-deployed): derive again,
    # keeping every tick.
    page.evaluate("() => { const v = JSON.parse(localStorage.getItem('koii-coach-v2')); v.step = 10; v.stepId = 'beat-listen-drums'; localStorage.setItem('koii-coach-v2', JSON.stringify(v)); }")
    run.go('./index.html')
    rec = run.get('koii-coach-ch-first-beat')
    assert rec['done'] == FIRST[:FIRST.index('beat-listen-drums')] and rec['cur'] == 'beat-listen-drums', f'Derived again after the old key moved ({rec})'


def test_schema_2_and_finished_records(run):
    # Schema 2 (until 2026-10-12): 01's step and the Learn lessons were positions, and "not sure" was the default OS.
    run.seed({'koii-coach-v2': {'step': 18, 'note': 0, 'done': [0, 1], 'firmware': 'unknown', 'finished': False}})
    run.go('./learn.html')
    assert run.page.locator('#learn-count').text_content().startswith('2 of 19'), 'Lessons saved by position count as tried'
    rec = run.get('koii-coach-ch-first-beat')
    assert rec['cur'] == 'beat-recap' and rec['done'] == FIRST[:FIRST.index('beat-recap')], f'Schema 2 step 18 is the recap ({rec})'
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
    assert len(song['done']) == run.page.evaluate('() => CoachChapter.ids().length') and song['derivedFrom'] == 'song-recap:done', 'Every step is done'


def test_progress_file_round_trip(run, tmp_path):
    run.seed({'koii-coach-v2': v2(step=3, stepId='beat-load-snare', firmware='2'),
              'koii-coach-ch-sampling': {'v': 1, 'done': ['record-first-sample'], 'last': 'record-first-sample', 'n': 1},
              'koii-coach-prefs': {'v': 1, 'wake': 'off', 'setup': 'ready'}})
    run.go('./settings.html')
    # Save progress file downloads it (CoachProgress.saveFile, shared with the chapter-complete card).
    with run.page.expect_download() as download:
        run.page.locator('#export').click()
    assert download.value.suggested_filename.startswith('koii-coach-progress-') and download.value.suggested_filename.endswith('.json')
    file = json.loads(pathlib.Path(download.value.path()).read_text(encoding='utf-8'))
    assert file['app'] == 'koii-coach' and 'koii-coach-ch-first-beat' in file['data'], 'The file holds the derived record too'
    run.page.locator('#toast', has_text='Progress file saved').wait_for()
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


def test_the_first_tick_asks_to_keep_storage(run):
    """chapter.js asks the browser to keep the site's storage (navigator.storage.persist) on the first tick of a visit,
    once, and Save progress file asks too."""
    run.page.add_init_script("""Object.defineProperty(navigator, 'storage', {configurable: true, value: {
      persisted: () => Promise.resolve(false), persist: () => { window.__persist = (window.__persist || 0) + 1; return Promise.resolve(false); }}});""")
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./first-beat.html#all')
    count = lambda: run.page.evaluate('() => window.__persist || 0')
    assert count() == 0, 'Not before a tick'
    run.page.locator('li[data-step="beat-empty-project"] .check input').check()
    run.page.evaluate("() => CoachChapter.setDone('beat-open-project-6', true)")
    run.page.wait_for_function('() => window.__persist === 1')
    run.page.wait_for_timeout(200)
    assert count() == 1, 'Once per visit'
    run.go('./settings.html')
    with run.page.expect_download():
        run.page.locator('#export').click()
    assert count() == 1


def test_split_steps_keep_their_ticks(run):
    """A step split in a rewrite (Chapter 3, 2026.10.14.5): ticked before, every part is ticked after; a record made
    after the rewrite never ticks the other parts when the first is ticked."""
    page = run.page
    run.seed({'koii-coach-ch-sampling': {'v': 1, 'done': ['open-empty-project', 'set-tempo-grid'], 'last': 'set-tempo-grid', 'n': 2, 'cur': 'choose-mic-source'},
              'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./index.html')
    rec = run.get('koii-coach-ch-sampling')
    assert rec['done'] == ['open-empty-project', 'set-tempo-grid', 'check-empty-project', 'set-grid-16'] and rec['n'] == 4 and rec['m'] == 2, rec
    run.go('./sampling.html#all')
    assert page.locator('#progress-count').text_content().startswith('4 of 89'), page.locator('#progress-count').text_content()
    assert run.get('koii-coach-ch-sampling')['cur'] == 'choose-mic-source', 'The place to continue at stays'
    # A record made now starts at the current level.
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./sampling.html#all')
    page.evaluate("() => CoachChapter.setDone('open-empty-project', true)")
    run.go('./index.html')
    assert run.get('koii-coach-ch-sampling')['done'] == ['open-empty-project'], 'Ticking a first part never ticks the others'


def test_split_batches_apply_in_order_once(run):
    """Chapter 4's batches: v1 (the 2026.10.14.6 rewrite) split pad-shift-layer in two, v2 (2026.10.14.18) split its
    first part again, v3 (2026.10.14.21) added the recap, v4 (2026.10.14.25) split copying ROLL from clearing its hats.
    Each runs once, oldest first, and m ends at the newest."""
    seed = lambda rec: run.seed({'koii-coach-ch-perform': rec, 'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    seed({'v': 1, 'done': ['pad-shift-layer'], 'last': 'pad-shift-layer', 'n': 1})
    run.go('./index.html')
    rec = run.get('koii-coach-ch-perform')
    assert rec['done'] == ['pad-shift-layer', 'pad-shift-layer-play', 'pad-shift-layer-hold'] and rec['n'] == 3 and rec['m'] == 4, rec
    # Already at v1: only v2 runs.
    seed({'v': 1, 'done': ['pad-shift-layer', 'pad-shift-layer-play'], 'last': 'pad-shift-layer-play', 'n': 2, 'm': 1})
    run.go('./index.html')
    rec = run.get('koii-coach-ch-perform')
    assert rec['done'] == ['pad-shift-layer', 'pad-shift-layer-play', 'pad-shift-layer-hold'] and rec['m'] == 4, rec
    # v4: a learner who ticked "Copy BEAT as ROLL, clear the hats" has both new steps ticked.
    seed({'v': 1, 'done': ['repeat-copy'], 'last': 'repeat-copy', 'n': 1, 'm': 3})
    run.go('./index.html')
    rec = run.get('koii-coach-ch-perform')
    assert rec['done'] == ['repeat-copy', 'repeat-clear-hats'] and rec['m'] == 4, rec
    # At v2: a part unticked later stays unticked.
    seed({'v': 1, 'done': ['pad-shift-layer'], 'last': 'pad-shift-layer', 'n': 1, 'm': 2})
    run.go('./index.html')
    assert run.get('koii-coach-ch-perform')['done'] == ['pad-shift-layer'], 'Nothing runs twice'


def test_clean_up_after_eight_weeks(run, tmp_path):
    """Plan 8.6: for 8 weeks from the first visit with this storage (meta.since), 01/02 moves are written back into
    koii-coach-v2 and the old checklist keys stay. After that the write-back stops and a chapter's old keys are removed
    once its record exists; koii-coach-v2 keeps its other fields, and a progress file with old keys still loads."""
    page = run.page
    old_keys = {'koii-hiphop-vocal-checklist-v2': [0, 1], 'koii-tech-house-checklist-v1': [0]}
    run.seed({'koii-coach-v2': v2(step=5, stepId='beat-hats-quieter', firmware='2', done=['groups-and-scenes']),
              'koii-coach-prefs': {'v': 1, 'setup': 'ready'}, **old_keys})
    run.go('./hiphop.html')
    assert run.get('koii-coach-meta')['since'] and run.get('koii-hiphop-vocal-checklist-v2') == [0, 1], 'In the window the old key stays beside the new record'
    assert run.get('koii-coach-ch-hiphop')['done'][:2] == ['note-original-scene', 'copy-to-work-scene']

    # Nine weeks later.
    page.evaluate("() => { const m = JSON.parse(localStorage.getItem('koii-coach-meta')); m.since = new Date(Date.now() - 63 * 864e5).toISOString(); localStorage.setItem('koii-coach-meta', JSON.stringify(m)); }")
    run.go('./index.html')
    assert run.get('koii-hiphop-vocal-checklist-v2') is None, 'A migrated old key is removed'
    assert run.get('koii-tech-house-checklist-v1') == [0], 'An old key whose chapter has no record yet stays'
    run.go('./tech-house.html')
    run.go('./index.html')
    assert run.get('koii-coach-ch-tech-house') and run.get('koii-tech-house-checklist-v1') is None, 'Once its chapter has migrated it, it goes too'
    run.go('./first-beat.html')
    page.wait_for_function("() => (document.activeElement && document.activeElement.closest('li[data-step]') || {dataset: {}}).dataset.step === 'beat-hats-quieter'")
    page.locator('#player-next').click()
    old = run.get('koii-coach-v2')
    assert (old['step'], old['firmware'], old['done']) == (5, '2', ['groups-and-scenes']), f'No more write-back; the other fields stay ({old})'
    run.go('./first-beat.html')
    rec = run.get('koii-coach-ch-first-beat')
    assert rec['cur'] == 'beat-placement-move' and 'beat-hats-quieter' in rec['done'], f'Not derived again from the old position ({rec})'

    # A progress file saved before the clean-up still loads, old keys and all.
    file = {'app': 'koii-coach', 'version': 1, 'exported': '2026-10-14T12:00:00Z',
            'data': {'koii-hiphop-vocal-checklist-v2': json.dumps([0, 1, 2]), 'koii-coach-prefs': json.dumps({'v': 1, 'setup': 'ready'})}}
    path = tmp_path / 'old-progress.json'
    path.write_text(json.dumps(file), encoding='utf-8')
    run.go('./settings.html')
    page.once('dialog', lambda d: d.accept())
    page.locator('#import-file').set_input_files(str(path))
    page.locator('#toast', has_text='Progress loaded').wait_for()
    run.go('./hiphop.html')
    assert run.get('koii-coach-ch-hiphop')['done'][:3] == ['note-original-scene', 'copy-to-work-scene', 'group-a-two-bars'], 'The old file’s ticks arrive'


def test_a_finished_chapter_stays_finished_with_its_new_recap(run):
    """2026.10.14.21 added a recap step to Chapters 0 and 3-7. A learner who had finished one keeps it finished."""
    rec = {'v': 1, 'done': ['keep-samples'], 'last': 'keep-samples', 'n': 1, 'm': 1}
    run.seed({'koii-coach-ch-sampling': rec, 'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./index.html')
    assert run.get('koii-coach-ch-sampling')['done'] == ['keep-samples', 'sampling-recap'], 'The recap is ticked with the last step'
    # A record made now starts at the newest level, so ticking the last step later never ticks the recap.
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./sampling.html#all')
    run.page.evaluate("() => CoachChapter.setDone('keep-samples', true)")
    run.go('./index.html')
    assert run.get('koii-coach-ch-sampling')['done'] == ['keep-samples']
    # Chapter 7's batch was filed under Chapter 2 until 2026.10.15.3, so a finished Chapter 7 stayed at 106 of 107.
    rec = {'v': 1, 'done': ['backup-and-rights'], 'last': 'backup-and-rights', 'n': 1, 'm': 1}
    run.seed({'koii-coach-ch-vocal-house': rec, 'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./index.html')
    assert run.get('koii-coach-ch-vocal-house')['done'] == ['backup-and-rights', 'vocal-recap'], 'Chapter 7 gets its recap too'


def test_a_stale_cur_is_recomputed_on_load(run):
    """A record whose cur names a step that is no longer on the page (renamed since) has cur recomputed when the
    chapter loads, so Home's Continue link, built from it, never opens a dead step."""
    run.seed({'koii-coach-ch-sampling': {'v': 1, 'done': ['open-empty-project'], 'last': 'open-empty-project', 'n': 1, 'cur': 'gone-step', 'm': 2},
              'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})   # m: at the newest level, so no split batch ticks more
    run.go('./sampling.html')
    assert run.get('koii-coach-ch-sampling')['cur'] == 'check-empty-project', 'cur moves to the step after the last tick'
    run.go('./index.html')
    assert 'gone-step' not in run.page.content(), 'Home links the recomputed step'


def test_a_fresh_v2_keeps_cur(run):
    """A koii-coach-v2 at position 0 (a loaded progress file without one, written fresh by applyFile) carries nothing
    over to Chapter 1: the record's cur stays where it was instead of going back to the first step."""
    done = FIRST[:4]
    run.seed({'koii-coach-ch-first-beat': {'v': 1, 'done': done, 'last': done[-1], 'n': 4, 'cur': 'beat-grid-16', 'derivedFrom': 'beat-tempo-grid', 'm': 1},
              'koii-coach-v2': v2(), 'koii-coach-prefs': {'v': 1, 'setup': 'ready'}})
    run.go('./index.html')
    rec = run.get('koii-coach-ch-first-beat')
    assert rec['cur'] == 'beat-grid-16' and rec['done'] == done, rec


def test_existing_learners_skip_the_setup_question(run):
    """Plan 5.1: anyone with progress outside Chapter 0 is set to setup='ready' once (reason recorded); ticks in
    Chapter 0 alone are not enough."""
    run.seed({'koii-coach-ch-sampling': {'v': 1, 'done': ['open-empty-project'], 'last': 'open-empty-project', 'n': 1}})
    run.go('./index.html')
    assert run.get('koii-coach-prefs')['setup'] == 'ready' and run.get('koii-coach-meta')['setupReason'] == 'existing-progress'
    run.seed({'koii-coach-ch-setup': {'v': 1, 'done': ['power-batteries'], 'last': 'power-batteries', 'n': 1}})
    run.go('./index.html')
    assert (run.get('koii-coach-prefs') or {}).get('setup') is None, 'Chapter 0 ticks alone keep the question'


def test_continue_falls_back_to_the_last_chapter(run):
    """Records saved before "at" existed: Continue opens meta.lastChapter."""
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}, 'koii-coach-meta': {'v': 1, 'lastChapter': 'perform'},
              'koii-coach-ch-sampling': {'v': 1, 'done': ['open-empty-project'], 'last': 'open-empty-project', 'n': 1},
              'koii-coach-ch-perform': {'v': 1, 'done': ['live-copy'], 'last': 'live-copy', 'n': 1, 'm': 3}})
    run.go('./index.html')
    assert run.page.locator('#resume').get_attribute('href').startswith('./perform.html')


def test_old_checklists_carry_over_or_say_why_not(run):
    """The old checklist keys of Chapters 5-7 (list positions) become ticks; ticks on steps that no longer exist are
    dropped with a notice, as are ticks from the oldest key, which cannot be carried over."""
    page = run.page
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}, 'koii-thodorakis-club-checklist-v1': [1, 2]})
    run.go('./thodorakis-house.html#all')
    done = run.get('koii-coach-ch-vocal-house')['done']
    assert {'set-tempo-128', 'set-timing-16'} <= set(done), done
    assert not page.locator('#progress-note').is_visible(), 'Nothing was lost, so no notice'
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}, 'koii-thodorakis-club-checklist-v1': [0, 1]})
    run.go('./thodorakis-house.html#all')
    assert 'rewritten since you last ticked' in page.locator('#progress-note').text_content(), 'A tick on a step that changed is reported'
    run.seed({'koii-coach-prefs': {'v': 1, 'setup': 'ready'}, 'koii-thodorakis-checklist-v1': [0, 1, 2]})
    run.go('./thodorakis-house.html#all')
    assert 'could not be carried over' in page.locator('#progress-note').text_content()


def test_schema_3_and_unknown_firmware(run):
    """koii-coach-v2 schema 3 kept positions by id but allowed firmware 'unknown'; any other unknown value reads as
    OS 2.5, the course's default."""
    run.seed({'koii-coach-v2': v2(schema=3, step=99, stepId='beat-kicks', firmware='unknown')})
    run.go('./settings.html')
    old = run.page.evaluate('() => CoachProgress.v2()')
    assert old['stepId'] == 'beat-kicks' and old['firmware'] == '2.5', old
    assert run.get('koii-coach-ch-first-beat')['cur'] == 'beat-kicks', 'The place is found by its id, not its number'
    run.seed({'koii-coach-v2': v2(firmware='banana')})
    run.go('./settings.html')
    assert run.page.evaluate('() => CoachProgress.v2().firmware') == '2.5'
