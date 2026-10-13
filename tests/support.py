"""Helpers shared by the browser tests: error watching and the sideways-scroll check."""
from urllib.parse import urlsplit


def origin(url):
    parts = urlsplit(url)
    return f'{parts.scheme}://{parts.netloc}'


def watch(page, base, errors, bad_assets):
    """Collect uncaught exceptions, console errors, chapter.js and shell.js warnings and failed same-origin requests."""
    site = origin(base)

    def on_console(message):
        if message.type == 'error' or (message.type == 'warning' and message.text.startswith(('chapter.js', 'shell.js'))):
            errors.append(f'{page.url}: console.{message.type}: {message.text}')

    def on_response(response):
        parts = urlsplit(response.url)
        if origin(response.url) == site and response.status >= 400 and parts.path != '/favicon.ico':
            bad_assets.append({'url': response.url, 'status': response.status})

    page.on('pageerror', lambda error: errors.append(f'{page.url}: {error}'))
    page.on('console', on_console)
    page.on('response', on_response)


def no_overflow(page, where):
    """Fail when the page scrolls sideways."""
    m = page.evaluate('() => ({sw: document.documentElement.scrollWidth, w: window.innerWidth})')
    assert m['sw'] <= m['w'], f"{where}: page is {m['sw']}px wide in a {m['w']}px window (horizontal scrolling)"
