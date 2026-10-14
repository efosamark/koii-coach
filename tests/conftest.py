"""Shared fixtures for the Python browser tests in tests/.

The site under test is the built folder (_site/), never the repository files directly.
- LOCAL_URL: a server that serves _site/ (CI: .github/scripts/serve.py on http://127.0.0.1:8080/). Without it, the
  tests serve _site/ themselves on a free localhost port with the same handler (an unknown address gets 404.html, as on
  GitHub Pages), so `python -m pytest` is enough after a build.
- LIVE_URL: optional; adds the deployed site as a second smoke-test target.
- ARTIFACTS_DIR: where screenshots, traces and results.json go (default: artifacts).

Browsers come from pytest-playwright: `--browser-channel chrome` uses the installed Google Chrome,
otherwise run `python -m playwright install chromium` once.
"""
import http.server
import os
import pathlib
import sys
import threading

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = ROOT / '_site'
sys.path.insert(0, str(ROOT / '.github' / 'scripts'))
import serve  # noqa: E402  (the GitHub Pages-like server CI uses)


@pytest.fixture(scope='session')
def site_url():
    """Base URL of the built site, always ending in '/'."""
    url = os.environ.get('LOCAL_URL', '').strip()
    if url:
        yield url if url.endswith('/') else url + '/'
        return
    if not (SITE / 'index.html').is_file():
        pytest.exit('No _site/ folder. Build it first: python .github/scripts/build_site.py _site', returncode=2)
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), serve.handler(SITE))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f'http://127.0.0.1:{server.server_address[1]}/'
    finally:
        server.shutdown()
        server.server_close()


@pytest.fixture(scope='session')
def live_url():
    """The deployed site to smoke-test as well, or None when LIVE_URL is unset or empty."""
    url = os.environ.get('LIVE_URL', '').strip()
    return (url if url.endswith('/') else url + '/') if url else None


@pytest.fixture(scope='session')
def artifacts_dir():
    path = pathlib.Path(os.environ.get('ARTIFACTS_DIR', 'artifacts'))
    path.mkdir(parents=True, exist_ok=True)
    return path
