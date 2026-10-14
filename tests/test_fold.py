"""The fold gate (docs/overhaul-plan.md 8.1): in the step player, without scrolling,

- at 390×844 and 360×740, less a 34px safe-area inset at the bottom: a standard step shows its Do lines and its Check
  above Done · Next; a risk step shows Before you press through its last Do line;
- at 844×390 (a phone on its side): every Do line of every step, beside the keys panel;
- with the Larger text setting at 390×844: at least 90% of the steps, as above.
Every step of every chapter is measured. Run after a build, like test_smoke.py:  python -m pytest tests/test_fold.py
"""
from urllib.parse import urljoin

import pytest

from support import watch

pytestmark = pytest.mark.browser

CHAPTERS = ['setup', 'first-beat', 'song', 'sampling', 'perform', 'hiphop', 'tech-house', 'thodorakis-house']
INSET = 34
MEASURE = """async ([portrait, inset]) => {
  const over = [];
  for (const id of CoachChapter.ids()) {
    location.hash = '#s-' + id;
    for (let i = 0; i < 60; i++) {
      const li = document.querySelector('li.is-current');
      if (li && li.dataset.step === id) break;
      await new Promise(r => setTimeout(r, 15));
    }
    await new Promise(r => setTimeout(r, 20));
    window.scrollTo(0, 0);
    const li = document.querySelector('li.is-current');
    const dos = [...li.querySelectorAll(':scope > .step-do')].filter(d => d.offsetParent);
    const check = li.querySelector(':scope > .step-check');
    const risk = /^(erase|delete|overwrite|erase-scene)$/.test(li.dataset.risk || '');
    const last = dos[dos.length - 1];
    const target = portrait && !risk && check && check.offsetParent ? check : last;
    const bar = document.querySelector('#player-actions .pa-row').getBoundingClientRect().top - inset;
    if (target && target.getBoundingClientRect().bottom > bar) over.push(id);
  }
  return [CoachChapter.ids().length, over];
}"""


def measure(browser, site_url, width, height, text='default'):
    context = browser.new_context(viewport={'width': width, 'height': height})
    page = context.new_page()
    page.set_default_timeout(20000)
    errors, bad = [], []
    watch(page, site_url, errors, bad)
    page.goto(urljoin(site_url, 'manifest.webmanifest'))
    page.evaluate("t => { localStorage.clear(); localStorage.setItem('koii-coach-prefs', JSON.stringify({v: 1, setup: 'ready', text: t})); }", text)
    total, over = 0, []
    for ch in CHAPTERS:
        page.goto(urljoin(site_url, f'{ch}.html#all'), wait_until='networkidle')
        n, ids = page.evaluate(MEASURE, [height > width, INSET if height > width else 0])
        total += n
        over += [f'{ch}#s-{i}' for i in ids]
    context.close()
    assert errors == [] and bad == [], f'Browser errors {errors} or failed assets {bad}'
    return total, over


@pytest.mark.parametrize('width,height', [(390, 844), (360, 740), (844, 390)])
def test_every_step_fits(browser, site_url, width, height):
    total, over = measure(browser, site_url, width, height)
    assert total > 600, 'Every chapter was measured'
    assert over == [], f'{len(over)} of {total} steps need scrolling at {width}×{height}: {over}'


def test_larger_text_fits_nine_in_ten(browser, site_url):
    total, over = measure(browser, site_url, 390, 844, 'larger')
    assert len(over) <= total * 0.1, f'{len(over)} of {total} steps need scrolling with Larger text: {over}'
