#!/usr/bin/env python3
"""Shrink the published CSS and JavaScript (plan 7.8, page weight). Standard library only.

It removes comments and indentation and nothing else: no renaming, no reordering, so the published code reads like
the source without its comments. build_site.py runs it on every .css and .js file in the site folder, except sw.js.

- css(): drops /* comments */, collapses whitespace and removes it around { } ; , > outside strings.
- js(): drops // and /* */ comments, line indentation and blank lines. Strings, template literals (with ${…} nested
  to any depth) and regular expressions are copied as they are, so a "//" inside a URL or a regex stays. A block
  comment that spans lines leaves a line break, so automatic semicolon insertion sees the same lines.

Usage: python3 .github/scripts/minify.py <file> prints the shrunk file, to compare by hand.
"""
import re
import sys

# A "/" after one of these starts a regular expression; after anything else it divides.
REGEX_AFTER = set('(,=:[!&|?{};+-*%<>~^') | {'', 'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete',
                                              'void', 'throw', 'instanceof', 'yield', 'await'}
WORD = re.compile(r'[A-Za-z0-9_$\\]+')


def css(src):
    parts, i, n = [], 0, len(src)
    code = []
    while i < n:
        c = src[i]
        if c in '"\'':
            j = i + 1
            while j < n and src[j] != c:
                j += 2 if src[j] == '\\' else 1
            parts.append(('code', ''.join(code)))
            parts.append(('str', src[i:j + 1]))
            code, i = [], j + 1
        elif src.startswith('/*', i):
            j = src.find('*/', i + 2)
            code.append(' ')
            i = n if j < 0 else j + 2
        else:
            code.append(c)
            i += 1
    parts.append(('code', ''.join(code)))
    out = []
    for kind, text in parts:
        if kind == 'code':
            text = re.sub(r'\s+', ' ', text)
            text = re.sub(r' ?([{};,>]) ?', r'\1', text)
        out.append(text)
    s = ''.join(out).replace(';}', '}')
    return s.strip() + '\n'


def js(src):
    out, i, n = [], 0, len(src)
    prev = ''          # the last token, for telling a regex from a division
    braces = [0]       # open { } in the code, per template literal level; ${ pushes a new level
    mode = ['code']

    def newline():
        while out and out[-1] in (' ', '\t'):
            out.pop()
        if out and out[-1] != '\n':
            out.append('\n')

    while i < n:
        c = src[i]
        if mode[-1] == 'tpl':
            if c == '\\':
                out.append(src[i:i + 2]); i += 2
            elif c == '`':
                out.append(c); i += 1; mode.pop(); prev = 'str'
            elif src.startswith('${', i):
                out.append('${'); i += 2; mode.append('code'); braces.append(0); prev = '{'
            else:
                out.append(c); i += 1
            continue
        # code
        if c == '\n':
            newline(); i += 1
            while i < n and src[i] in ' \t':
                i += 1
        elif c in ' \t\r':
            if out and out[-1] not in (' ', '\n'):
                out.append(' ')
            i += 1
        elif c in '"\'':
            j = i + 1
            while j < n and src[j] != c:
                j += 2 if src[j] == '\\' else 1
            out.append(src[i:j + 1]); i = j + 1; prev = 'str'
        elif c == '`':
            out.append(c); i += 1; mode.append('tpl')
        elif src.startswith('//', i):
            j = src.find('\n', i)
            i = n if j < 0 else j
        elif src.startswith('/*', i):
            j = src.find('*/', i + 2)
            j = n if j < 0 else j + 2
            if '\n' in src[i:j]:
                newline()
            elif out and out[-1] not in (' ', '\n'):
                out.append(' ')
            i = j
        elif c == '/' and prev in REGEX_AFTER:
            j, klass = i + 1, False
            while j < n and (src[j] != '/' or klass):
                if src[j] == '\\':
                    j += 1
                elif src[j] == '[':
                    klass = True
                elif src[j] == ']':
                    klass = False
                j += 1
            j += 1
            while j < n and src[j].isalpha():
                j += 1
            out.append(src[i:j]); i = j; prev = 'regex'
        elif c == '{':
            braces[-1] += 1; out.append(c); i += 1; prev = c
        elif c == '}':
            if braces[-1] == 0 and len(mode) > 1:
                out.append(c); i += 1; mode.pop(); braces.pop()
            else:
                braces[-1] -= 1; out.append(c); i += 1; prev = c
        else:
            m = WORD.match(src, i)
            if m:
                out.append(m.group(0)); i = m.end(); prev = m.group(0)
            else:
                out.append(c); i += 1; prev = c
    return ''.join(out).strip() + '\n'


if __name__ == '__main__':
    path = sys.argv[1]
    text = open(path, encoding='utf-8').read()
    sys.stdout.write(css(text) if path.endswith('.css') else js(text))
