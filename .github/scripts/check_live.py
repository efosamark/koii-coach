#!/usr/bin/env python3
"""After a deploy, check that the live site serves exactly the files that were tested.

Usage: python3 .github/scripts/check_live.py _site https://example.github.io/koii-coach/

Report only: it runs after the deploy, so it can never block a fix from going live.
A failure turns the workflow run red so the owner gets the usual failed-run email.
Retries for a few minutes because GitHub Pages' CDN can take a moment to update.
"""
import hashlib, os, pathlib, sys, time, urllib.request

ATTEMPTS, WAIT = 12, 30


def main():
    site, base = pathlib.Path(sys.argv[1]), sys.argv[2].rstrip('/') + '/'
    tag = os.environ.get('GITHUB_SHA', 'local')[:12]
    pending = {p.relative_to(site).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
               for p in sorted(site.rglob('*')) if p.is_file()}
    total, problems = len(pending), {}
    for attempt in range(1, ATTEMPTS + 1):
        for rel in list(pending):
            url = f'{base}{rel}?live-check={tag}-{attempt}'  # unique query string skips CDN caches
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'koii-coach-live-check', 'Cache-Control': 'no-cache'})
                with urllib.request.urlopen(req, timeout=20) as r:
                    body = r.read()
            except Exception as e:  # noqa: BLE001 - report every kind of failure the same way
                problems[rel] = str(e)
                continue
            if hashlib.sha256(body).hexdigest() == pending[rel]:
                del pending[rel]
                problems.pop(rel, None)
            else:
                problems[rel] = 'content differs from the tested file'
        if not pending:
            msg = f'Live site serves all {total} tested files unchanged.'
            print(msg)
            summary(f'### Live site check\n\n{msg}\n')
            return
        print(f'Attempt {attempt}/{ATTEMPTS}: {len(pending)} file(s) not live yet: {", ".join(sorted(pending))}')
        if attempt < ATTEMPTS:
            time.sleep(WAIT)
    lines = [f'- `{rel}`: {problems.get(rel, "not checked")}' for rel in sorted(pending)]
    for line in lines:
        print(f'::error::{line[2:]}')
    summary('### Live site check\n\nThese files on the live site do not match the tested build:\n\n' + '\n'.join(lines) + '\n')
    sys.exit(1)


def summary(text):
    path = os.environ.get('GITHUB_STEP_SUMMARY')
    if path:
        with open(path, 'a', encoding='utf-8') as f:
            f.write(text)


if __name__ == '__main__':
    main()
