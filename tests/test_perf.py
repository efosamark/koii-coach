"""Performance budgets of docs/overhaul-plan.md 7.8 that a browser can measure:

- Done · Next → the next step painted in at most 100 ms with the CPU slowed 4× (Chrome DevTools throttling), the
  median of eight steps;
- no layout shift (CLS 0) when tapping controls on the control map, or tabs and controls in the Tools sheet.
Page weight is checked by the build (.github/scripts/build_site.py). Run after a build:  python -m pytest tests/test_perf.py
"""
from urllib.parse import urljoin

import pytest

from support import watch

pytestmark = pytest.mark.browser

CLS = """() => { window.__cls = 0; new PerformanceObserver(list => { for (const e of list.getEntries()) window.__cls += e.value; })
  .observe({type: 'layout-shift', buffered: false}); }"""


@pytest.fixture
def page(browser, site_url):
    context = browser.new_context(viewport={'width': 390, 'height': 844})
    page = context.new_page()
    page.set_default_timeout(20000)
    errors, bad = [], []
    watch(page, site_url, errors, bad)
    page.goto(urljoin(site_url, 'manifest.webmanifest'))
    page.evaluate("() => { localStorage.clear(); localStorage.setItem('koii-coach-prefs', JSON.stringify({v: 1, setup: 'ready'})); }")
    page.go = lambda href: page.goto(urljoin(site_url, href), wait_until='networkidle')
    yield page
    context.close()
    assert errors == [] and bad == [], f'Browser errors {errors} or failed assets {bad}'


def test_done_next_paints_the_next_step_within_100ms(page):
    page.go('./first-beat.html#s-beat-empty-project')   # Part 1 has ten steps, so eight presses stay inside it
    cdp = page.context.new_cdp_session(page)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    times = page.evaluate("""async () => {
      const out = [];
      for (let i = 0; i < 8; i++) {
        const before = document.querySelector('li.is-current').dataset.step, t0 = performance.now();
        document.getElementById('player-next').click();
        await new Promise(done => { const f = () => { const c = document.querySelector('li.is-current');
          if (c && c.dataset.step !== before) requestAnimationFrame(() => done()); else requestAnimationFrame(f); }; f(); });
        out.push(performance.now() - t0);
        await new Promise(r => setTimeout(r, 100));
      }
      return out; }""")
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    median = sorted(times)[len(times) // 2]
    assert median <= 100, f'Done · Next to the next step painted: median {median:.0f} ms at 4× CPU ({[round(t) for t in times]})'


def test_no_layout_shift_on_control_map_and_sheet_taps(page):
    page.go('./controls.html')
    page.evaluate(CLS)
    controls = page.locator('.schem-keys .control')
    for i in (0, 5, 12, 20, 27):
        controls.nth(i).click()
        page.wait_for_timeout(120)
    assert page.evaluate('() => window.__cls') == 0, 'Tapping controls on the map moves nothing'
    page.go('./first-beat.html#s-beat-load-kick')
    page.locator('#player-tools-btn').click()
    page.locator('#tools-panel-step .press-order').wait_for()
    page.evaluate(CLS)
    for tab in ('map', 'fixes', 'words', 'cheat', 'step'):
        page.locator(f'#tools-tab-{tab}').click()
        page.wait_for_timeout(150)
    page.locator('#tools-tab-map').click()
    page.locator('#tools-panel-map .control').nth(3).click()
    page.wait_for_timeout(150)
    assert page.evaluate('() => window.__cls') == 0, 'Tabs and controls in the Tools sheet move nothing'
