# K.O. II Coach: overhaul plan

Owner: efosamark · Status: final plan for decision (revised after review) · Date: 13 October 2026 · Base: the repo at `f6f619f`

> **Scope note (13 October 2026): this is a personal project.** The plan below was written with production-level process. Keep its product design (sections 3–6) and its compatibility rules, and skip the process:
>
> - **Tests:** one browser smoke test, `tests/test_smoke.py`, grown as features land, plus a targeted check when a change could lose saved progress. No golden files, key-sequence lock, `ids.lock`, storage-fixture matrix, URL inventory, visual regression, axe gate, three-viewport fold test, contrast matrix or styleguide gate.
> - **Releases:** no tags and no rollback input; undo a bad release by reverting the commit and pushing. No parallel test suites, hash-locked requirements or Dependabot for pip.
> - **Accuracy:** read the diff of any button sequence you change, and try risky steps on the unit. No `reviewed` records or `primary_path` lists.
> - **Compatibility rules still apply:** keep every URL and hash route working, never change the shape of an existing `koii-coach*` storage key (migrations only add), keep offline working and keep no analytics. Drop the timed coexistence windows.
> - **Phases:** P0 is done in this lighter form (Python smoke test, explicit Learn lesson ids, the version check). Then P1 one look; P2 only if copying things by hand starts to hurt; P3 shell, Home and search; P4–P5 the step player for every chapter; rewrite long steps as you go (P7). P6 renumbering and P8 polish are optional. The day estimates below assume all the skipped process, so the real effort is much lower.

---

## 1. Summary

**What is wrong.** K.O. II Coach is two products joined by a "← Back to K.O. II Coach" link. One is a single-page app for chapters 01–02 and four tools. The other is six hand-written checklist pages that hold 358 of the course's 404 steps (89%). Each has its own tokens, header, buttons, progress model and step design. Neither works for the actual use case, a phone propped 40–60 cm from the unit. On a phone the first instruction starts 1.4 screens down and "Next" is 2.8 screens down. 64% of the text on the first view is 13px. 248 of 358 chapter steps are paragraphs of more than 40 words, and only 66 contain an explicit "Check:" line. Destructive presses look like any other step, and some put the safety check after the action.

**What changes.** One product with one shell, one design system and one Step component, generated from one content model:

- **Home is a course map** with a single "Continue: Chapter 3 · Step 4 of 8" card. For a new learner, Chapter 0 stays the default first step until it is done or the learner chooses to skip it. Learners who already have progress are never sent back to it.
- **Every chapter runs in one step player.** One step fills the screen. Do lines are 24px with orange keycaps, the Check is a dark LCD-style readout, Why / Not working? / Source are folded away, and a fixed 56px "Done · Next" sits under the thumb. The screen stays awake. A one-tap "All steps" view keeps the whole chapter readable and printable.
- **Steps that can lose work have a fixed order**: check first, then the press, then the undo. Each one is rewritten into that order when its chapter converts. Irreversible presses are gated.
- **Tools** (Control map, Troubleshooting, Glossary, Cheat sheet, Learn, Rhythm lab, Safety) are unnumbered. They open as a sheet over the current step, so looking something up never loses your place. One offline search covers everything.
- **The course is renumbered 0–7 in teaching order** once every cross-reference is generated rather than typed.

**How it ships.** The plan takes proposal A's learner experience and runs it on proposal C's strangler sequence. Nine phases, each deployed on its own behind a stricter test net:

1. P0: tests in Python, so the owner needs no Node, plus a rehearsed rollback.
2. P1: one look.
3. P2: one build from TOML.
4. P3: shell, home and search.
5. P4: the player for chapters 0 and 07–11, with Chapter 0 and every risk step rewritten.
6. P5: retire the single-page app.
7. P6: renumber.
8. P7: rewrite chapters 07–11.
9. P8: device schematic and polish.

**What stays.** Every URL and hash route, every `koii-coach*` storage key and its data, offline-first, no accounts or analytics, readable without JavaScript, and the accuracy of every button sequence. A key-sequence lock, frozen ids and an on-device walk-through enforce these. Every release is tagged and can be rolled back by redeploying its tag.

**Cost.** The phases sum to 84–108 focused days. Plan on about 95–115 with contingency for review loops and device re-walks, plus 25–35 hours of the owner's time on the unit. The first visible improvement ships after 11–14 focused days, and a rewritten Chapter 0 in the new player after 35–45. At 3 focused days a week, the whole plan takes about 32–38 calendar weeks (decision 18).

---

## 2. Diagnosis

Fifteen problems, grouped by theme, most damaging first. Screenshots are in `scratchpad/shots/` (`m` = 390×844, `d` = 1280×900). Numbers marked *(verified)* were re-measured or re-read in the code for this plan; the rest come from the six audits.

### A. It is two products

**D1. Two shells and two design systems.** The app (index.html) and the chapter pages (chapter.css + chapter.js) have separate tokens, headers, cards, buttons, notices, progress and step designs.
- The same token name has different values: `--soft` is `#e2e8d8` in index.html:4 but `#edf3e0` in chapter.css:2 *(verified)*.
- Dark `--btn` flips to `#c2410c`, so "Reset this chapter's checklist" becomes the brightest button on the page (chapter.css:3 *(verified)*, m-dark-ch07-footer.png).
- The app header is 260px with a 12-tile grid; the chapter header is 98px with only a back link. Compare m-light-app-first-fold.png with m-light-ch07-sampling-fold.png.
- Following the guided order 00→01→02→07 crosses between the two designs three times.

**D2. There is no home, and the start card vanishes.** `setView(VIEWS.includes(h0)?h0:state.view)` reopens the last view, so "/", which is also the PWA start_url, can land on Help *(verified)*. The only prompt for Chapter 00 depends on `newcomer=raw===null&&!ourKeys().length`. `setView()` calls `save()` on every load, so the card is gone after one reload *(verified)*. No page lists the chapters, their durations or the device-project plan.

**D3. The numbering contradicts the course.** The menu reads 00, 01, 02, 03 Learn, 04 Controls, 05 Rhythm lab, 06 Help, 07…11, but the guided order is 00→01→02→07. The prose holds 77 typed "chapter NN" and 34 "section NN" references *(verified grep, six chapter pages plus course.js)*, plus bare forms such as "7 for 07" and "your 07 voice kit". "Section 07" and "chapter 07" look identical, and chapter 07 also uses project 7.

### B. The step, the core unit, fails at arm's length

**D4. Most steps are walls of text with no check.**
- Median words per step: 47 (00), 56 (07), 58.5 (08), 60 (09), 57 (10), 32 (11).
- 248 of 358 chapter steps are over 40 words and 123 are over 60. The longest is 288 words (thodorakis-house.html `check-or-clear-patterns`).
- A "Check:" line appears in 66 of 358 steps; perform, hiphop and thodorakis-house have none *(all verified)*.
- The README promises "what to press, what you should see or hear, and what to check". That is true for 46 steps.

**D5. On a phone the step loop is spread over five screens.**
- Measured at 390×844 on `#first`: Press / do this at y=1217, `#next` at 2403, the device map at 2573, the target grid at 3948, the placement helper at 4555.
- Step cards are 948–1511px tall. After tapping Next, the next Next was visible without scrolling on 2 of 21 arrivals.
- The placement helper has its own competing "next" button.
- Chapter pages put the first step 1.9–3.8 screens down, behind 299–555 words of preamble.

**D6. Type is too small, has no scale, and lines run too long.** 17 rendered font sizes (metrics.json). 13px makes up 149 of 231 text nodes on m-app-first, including the display value the learner must match (`.key{font:13px…}`). The main instruction is 16px, the same as body copy. Lines run 115–201 characters per line at 1280px.

**D7. Controls and readouts have no visual vocabulary, and the chips mislead.** `<kbd>` appears 0 times in any page. `<code>` appears 0 / 0 / 14 / 0 / 103 / 55 times across setup / sampling / perform / hiphop / tech-house / thodorakis-house *(verified)*. The 01/02 chips are an unordered set that disagrees with the text. Step "A2: load the snare" lists SOUND, A, PAD2, PAD1, PAD0, MINUS, PLUS *(verified, course.js:15)*. There are no diagrams; the device map is a generic grid labelled "Conceptual".

**D8. Destructive presses look routine, and some put the check after the press.**
- In `song-break-clear` (course.js:51 *(verified)*) the Press field says "Hold ERASE + pad 1 (A1) until TRK blinks". The precondition "Hold MAIN first: the number must be BREAK" sits in the last field, If stuck.
- One `.notice` style serves both "formats the drive" and "instructions are checked against the guide".
- 58 chapter steps match destructive patterns *(verified)*:
  - 19 hold-until clears (18 TRK, 1 PTN).
  - 18 SHIFT + SOUND, many of which only open SOUND EDIT.
  - 17 SHIFT + ERASE, mostly routine system settings such as metronome 400.
  - 4 others, including one scene erase (ERASE + MAIN, perform `scene-erase`).
- No step tells the learner to hold ERASE + SOUND until SND. That permanent sample delete appears only in notices, tables and the Learn and Help text *(verified)*.
- A regex alone cannot tell a crop from a settings menu, so every risk tag needs a human decision.

### C. Navigation, progress and place

**D9. Navigation is heavy, flat and scrolls away.** The 12 equal tiles take 260px (31%) of the phone's first screen. They are not sticky, and the course chapters are visually weaker than the tools (1.21:1 fill vs a 2.97:1 outline). Chapter pages have no menu, no search and no route to Help or the tools.

**D10. Progress, resume and chapter boundaries are fragmented and unsafe.**
- There are five progress visuals and three models: position in 01/02, ticks in 00/07–11, ticks per lesson in Learn.
- In 01/02, "done" means "before the cursor". One tap on a 24×28px dot marks 19 steps green. "Start again from step 1" resets with one tap and no undo.
- "Continue at step N" sits 2–3.6 screens down, and nothing scrolls to it.
- Prev/next chapter links appear only in the footer, 6–13 screens down. Finishing a chapter gets no acknowledgement.
- Reset and Import remove every `koii-coach*` key except the firmware choice *(verified, `resetAll`/`importProgress`)*.

**D11. URLs, history, titles and structure are invisible to people and assistive technology.**
- Steps have no URLs. `openLesson` uses `history.replaceState(null,'','#manual')` *(verified)*, so phone Back skips the lesson list. `document.title` appears 0 times in index.html and chapter.js *(verified)*: all six views share one title.
- A view change moves no focus. It takes 42 Tabs to reach Next.
- Chapter section titles are `<summary>` text, not headings. The sticky progress bar hides focused checkboxes (WCAG 2.4.11).

**D12. Search and Help are a junk drawer.** Search covers only the 24 help topics, 19 lessons and 106 glossary terms. It ignores all 358 chapter steps ("turntable", "time-stretch" and "sidechain" return nothing). It matches substrings: "hat" hits "that" and "what". The Help view also holds the OS setting, a cheat sheet covering only 01/02, the glossary, the destructive "Reset all progress" and the sources, over 6.8 phone screens. Help topics have no URL of their own: chapter pages can only link to bare `./index.html#help` *(verified, 5 links)*.

### D. Practising at the device

**D13. The device side is ignored.** `wakeLock` appears 0 times *(verified)*, so a propped phone locks mid-step. In landscape, the 1,043px "sticky" device panel cannot stick in a 390px viewport. Rhythm lab cells are 29×34px, each bar is split into two halves, and the sliders are 16px tall. Tapping the control map shifts the buttons by up to 72px under the finger. The read-only target grid is 64 disabled buttons that look exactly like the editable ones.

### E. Colour and access

**D14. Colour carries no meaning, dark mode is flat, and forced colours erase state.**
- Orange means about seven things: CTA, eyebrow, current step, used control, hit, warning and link.
- Dark surfaces sit 1.04–1.12:1 apart, while the lime progress bar glares at 14.38:1.
- Dark-mode state fills fail WCAG 1.4.11: beat on 2.66:1, bass on 2.36:1, hot control 2.73:1.
- In forced-colours mode the progress dots, the target rhythm and "used in this step" disappear completely, because they are `::before` or background-only.

### F. The architecture makes every fix twice as expensive

**D15. Everything is copied by hand, and the safety net needs Node.**
- index.html carries 10.6 KB of inline CSS and 47 KB of inline JS, re-rendering all of `<main>` on every Next.
- course.js stores content as positional tuples (`s[0]…s[7]`), and 14 lesson ids derive from titles.
- The chapter list is copied in 7+ places. The host `efosamark` is hard-coded 30 times across the HTML *(verified)*.
- The sw.js precache list and VERSION are typed by hand (`TIMEOUT=3000`, 17 assets *(verified)*). build_site.py only copies `*.html`, `*.js`, `*.css`, the manifest and icons, and only checks the precache for `.html`/`.js`/`.css` *(verified)*.
- `tests/smoke.mjs` hard-codes today's numbering and DOM, and runs only on CI's Node 22. The owner's machine has Python 3.12.10 and no Node *(verified)*.
- Rollback is impossible today. The Pages artifact is kept for 1 day, and `deploy-pages` deploys only the artifact from its own run.

**Strengths to keep.** These are not rescue jobs:
- Text contrast already passes AA (lowest 4.50:1).
- Stable step ids with frozen migration tables. The ids are unique within each chapter, but 20 repeat across hiphop, tech-house and vocal house *(verified)*, so course-wide references are namespaced `<chapter>/<step>`.
- A solid offline service worker: all-or-nothing install, status message protocol.
- A test-gated deploy with a live hash check.
- Chapter pages that work without JS.
- The pre-filled "Report a wrong instruction" link.
- Careful, guide-checked content.
- The 01/02 step anatomy (Do / Why / Hear / If stuck), which becomes the model for everything.

---

## 3. Vision and design principles

**Vision.** The coach behaves like a patient studio teacher standing next to the unit. It shows one thing to do at a size you can read from 50 cm, then tells you exactly what you should see or hear. It warns you before anything is lost. It always remembers where you were.

These seven principles decide future arguments. When two conflict, the earlier one wins.

1. **The words are load-bearing.** Structure, layout and styling can change freely. A button sequence or OS claim changes only through the key-sequence lock, a dated `reviewed` record and an on-device walk-through on OS 2.5.1. A wrong press is the worst bug this product can have.
2. **Safety before action.** A check that prevents loss always appears above the press. Irreversible presses (delete a sample, crop or overwrite a file, erase a scene until its undo is proven) are gated. The undo, or an explicit "No undo", follows the press immediately. Red means irreversible and nothing else.
3. **Pass the glance test.** On a 360×740 phone, after a 34px safe-area allowance, a standard step's Do, its Check and the Next button fit between the app bar and the action bar without scrolling. On a risk step, the preflight and every Do move fit. Do lines are at least 24px, and nothing instructional or interactive is below 14px. If a step does not fit, the step is too long: split it, do not shrink it.
4. **Orange means "press this on the hardware".** Each colour has one meaning: orange = a physical control to press now, ink = the on-screen action, lime = done / you are here, amber = careful but recoverable, red = irreversible. There is never orange text and never more than one primary button per view.
5. **Never lose the learner's place.** Progress is stored as step ids, never as a position. Every step has a URL. Lookups (troubleshooting, glossary, control map, search) open over the step, and Back closes them. Reset always asks first, keeps your settings and can be undone for 10 seconds.
6. **One of everything.** One shell, one token file, one component library, one Step component, one progress module, one search and one build. If a pattern exists twice, delete one of them. Nothing that a manifest can generate is typed by hand.
7. **Ship small and keep everything working.** Every phase deploys on its own. Old URLs, storage keys, offline install and no-JS reading survive every release. Every release is tagged, and redeploying the previous tag rolls it back without losing a tick.

---

## 4. Information architecture

### 4.1 Sitemap (end state)

Seventeen flat pages, plus a 404 page and generated data files. All are precached.

```
Home ............................. index.html  (= "/" = PWA start_url "./")
Course (guided order; display numbers after P6)
  0  Set up your K.O. II ......... setup.html              storage slug: setup
  1  First beat .................. first-beat.html  (new)  storage slug: first-beat
  2  Make it a song .............. song.html        (new)  storage slug: song
  3  Sample, chop & resample ..... sampling.html           storage slug: sampling
  4  Play & perform .............. perform.html            storage slug: perform
  5  Full hip-hop beat ........... hiphop.html             storage slug: hiphop
  6  Tech house .................. tech-house.html         storage slug: tech-house
  7  Vocal house ................. thodorakis-house.html   storage slug: vocal-house
     each chapter: start screen -> parts -> steps -> part checkpoint -> chapter complete
Tools (never numbered)
  Control map .................... controls.html
  Troubleshooting ................ help.html
  Glossary ....................... glossary.html
  Cheat sheet .................... cheat-sheet.html   (moves + quick-reference cards from all 8 chapters)
  Learn .......................... learn.html         (the 19 explainers, formerly "The friendly manual")
  Rhythm lab ..................... lab.html
  Safety and erasing ............. safety.html        (every erase/delete/overwrite/format action, how to avoid it, its undo)
Settings ......................... settings.html      (OS version, practice options, progress backup/restore/reset, offline and install, about)
Not found ........................ 404.html           (shell, search, course list, legacy-path mapper; <base href> from base_url)
Data (precached, not pages) ...... search-index.<hash>.json, assets/*.<hash>.*
```

There is no separate chapter overview page and no lesson layer. B's 75 lesson pages and track navigation are rejected. A chapter's start screen is its overview.

### 4.2 Names and numbering

- **One canonical name per destination,** used for the menu label, the `<h1>`, `document.title` and the file. The old taglines become subtitles. For example, h1 "Learn", subtitle "Short explainers of how the K.O. II thinks".
- **Course: Chapter 0–7 in teaching order** (decision 1). The tools lose their numbers in P3. The course numbers flip in P6, once every cross-reference in prose is a generated `{ch:…}` token. For at least 90 days afterwards, each chapter start screen shows a "Formerly 07" chip, and search maps "07" to Chapter 3. Until P6, the course keeps showing 00, 01, 02, 07–11, but as one labelled "Course" list with no tools in between.
- **Inside a chapter:** "Part 2 · Build a drum kit" (named and numbered, never lettered, because A–D are the pad groups) and "Step 4 of 8". The step number is within the part. The chapter meter reads "23 of 57 done".
- **Number forms never collide:**

  | Form | Example |
  |---|---|
  | Chapter | Chapter 3 |
  | Part | Part 2 |
  | Step | Step 4 of 8 |
  | Device project | Project 7 (an LCD-style chip) |
  | Pad | A1 (group A, pad 1; the single naming used in text, keycaps and the device map) |
  | Display position | `1.2.3` (always an LCD chip) |
  | Settings code | `401` (always an LCD chip with the label "System setting") |

- **Chapter 11's visible name** becomes "Vocal house" everywhere. The file stays `thodorakis-house.html` and the slug stays `vocal-house` (decision 2).

### 4.3 URL scheme

| Destination | URL | Behaviour |
|---|---|---|
| Home | `./` and `./index.html` | Always Home; never redirects to a remembered view |
| Chapter | `<file>.html` | No progress: start screen. In progress: the player at `cur`. Complete: `#done` (§5.13) |
| Chapter start screen | `<file>.html#start` | Also reachable from the menu sheet ("About this chapter") |
| Part | `<file>.html#<part-id>` | Existing part ids are kept. `sampling.html#make-your-own-kit` is the only one linked today |
| Legacy wrapper ids | `#setup`, `#sampling`, `#perform`, `#tutorial` (hiphop), `#tech-house`, `#thodorakis` | Today these are the `<section class="steps">` wrappers, not parts. They are kept as aliases of the bare chapter URL and listed in `urls.json` |
| Step | `<file>.html#s-<step-id>` | `<step-id>` is today's `data-step` / `options.id`. It is unique within its chapter and frozen in `ids.lock` as `<chapter-id>/<step-id>`. A retired id maps through `migrations.toml`. An unknown id opens the start screen with a toast |
| All steps | `<file>.html#all` | List mode; also used for print |
| Chapter complete | `<file>.html#done` | |
| Tool items | `controls.html#<control-id>`, `help.html#<topic-id>`, `glossary.html#<term-id>`, `learn.html#<lesson-id>`, `cheat-sheet.html#<chapter-id>`, `safety.html#<risk-id>` | `#id` opens and focuses that item |
| Search | the overlay on every page; `help.html?q=` without JS | The query is reflected for sharing |

There are no `/chapter/...` path URLs. GitHub Pages cannot redirect, and directory URLs add trailing-slash and service-worker cache-key failure modes for no learner benefit. The build fails if a fragment collides within a page or an internal `#fragment` link does not resolve.

### 4.4 Old URLs and hash routes

| Old | New | When and how |
|---|---|---|
| `index.html` (no hash) | Home | P3. A "home" view inside the app; static from P5b |
| `index.html#first` | `first-beat.html` | P5b. A 6-line inline script, first in `<head>`, runs `location.replace` before paint. Until then `#first` is still the app view |
| `#song` | `song.html` | P5b, same mechanism |
| `#manual` | `learn.html` | P5b |
| `#controls` | `controls.html` | P5b |
| `#lab` | `lab.html` | P5b |
| `#help` (including the 5 bare `./index.html#help` links on chapter pages) | `help.html` | P5b |
| `index.html#help/<topic-id>` (new in P3) | `help.html#<topic-id>` | P3: the old app opens and focuses that topic. P5b: the shim maps it |
| Any other hash on index.html | Home | P3 (today an unknown hash silently opens the last view) |
| `setup.html`, `sampling.html`, `perform.html`, `hiphop.html`, `tech-house.html`, `thodorakis-house.html` | Same files | Never move. Part and wrapper ids stay (§4.3) |
| "see help “…”" text links and `data-help` links | `index.html#help/<topic-id>` from P3, `help.html#<topic-id>` from P5b (a sheet when inside a step) | Generated from `{help:id}` tokens. The build fails on a dangling topic |
| `koii-coach-v2.view` | Ignored | P3 |
| Unknown path, at any depth | `404.html` (precached; search, course list, legacy mapper) | P5a. GitHub Pages serves it at any depth (`/koii-coach/a/b/c`), so it uses `<base href>` set to base_url's path (`/koii-coach/`). The SW serves the same file offline |
| Manifest `id`, `start_url`, `scope` (`./`) | Unchanged | Never. Installs neither break nor duplicate |

`tests/golden/urls.json` (P0) lists every row, including the six wrapper ids and a 3-level-deep unknown path, with the h1 or text it must land on. It runs online and offline in every phase.

### 4.5 Navigation

**Phone, under 600px. There is no bottom tab bar** (the player owns the bottom of the screen).

- **App bar, 56px, sticky, surface-1 with a bottom border.**
  - Home and tool pages: `[≡]` menu · wordmark (links Home) · `[Search]`.
  - Chapter pages: `[≡]` · a two-line title ("3 · Sample, chop & resample" over "Part 2 · Build a drum kit · Step 4 of 8"; 15/600 over 14/400, truncated) · `[Screen on]` · `[⋮]` chapter actions.
  - Every icon button is 44×44 with an `aria-label`. A 4px chapter meter sits under the chapter app bar. The separate 40px "part strip" from proposal C is rejected; the part label folds into the bar.
  - On short viewports (`max-height:480px`) the bar is 40px and static (§5.5).
- **Action bar, player only.** 72px plus `env(safe-area-inset-bottom)`, fixed, elevation e2; a single 48px row on short viewports. Contents: `[‹ Back]` 56×56 (icon over a 14px label) · `[Tools]` 56×56 (icon over a label) · `[Done · Next →]` primary, filling the rest of the width at 56px.
- **Menu sheet (≡).** A bottom sheet with two tabs.
  - "This chapter" (on chapter pages): `#progress-count`, a meter, parts as rows with tallies, and the current part expanded into 48px step rows with ✓ / ● / ○ / ⊘ states.
  - "Course": a Continue row; the 8 chapters with LED state, number, title and x/N; then Tools, Settings, an "Available offline ✓" chip and Install.
- **Chapter actions (⋮):** About this chapter (#start) · All steps (#all) · Print all steps (#print) · Report this step · Restart this chapter (danger outline, confirm plus 10s undo, `#reset`).

**Desktop (≥1024px).** A 64px app bar: wordmark · a chapter switcher ("Chapter 3 · Sample ▾", which opens a popover with Course and Tools groups and per-chapter progress) · a search field (`/` focuses it) · Tools · Settings. On chapter pages:

- ≥1200px: a 240px sticky contents rail on the left (parts, tallies, the current step marked "You are here"); a centre step column capped at 65ch with the action bar docked under the card; and a 360px sticky right panel holding the device strip, the expected display and the step's companions. Tools replaces the right panel instead of covering the card.
- 1024–1199px: no left rail ("Contents" sits in the menu).

**Tablet (600–1023px).** The phone layout in a 680px column. The right panel becomes a sheet.

**Semantics.** `<nav aria-label="Course"><ol>` in guided order and `<nav aria-label="Tools"><ul>`, in the same place on every page. Troubleshooting is reachable the same way from every page (WCAG 3.2.6). `aria-current="page"` marks the current destination.

### 4.6 Where the tools live

- **The Tools sheet, one tap from every step.** On phones it opens over the step. It always opens on **"For this step"**: this step's keys lit on the control map in press order, its troubleshooting topics already expanded, its glossary terms and the moves learned so far. A step with no topics or terms (most stage-1 steps) falls back to the Troubleshooting groups.
- Below that sit tabs for Control map · Troubleshooting · Glossary · Cheat sheet, plus rows for Learn, Rhythm lab and Safety.
- Every tool also exists as a standalone page for deep links, no-JS use and sharing.
- `{help:id}` links inside a step open the sheet at that topic, expanded. A glossary term gets a dotted underline at its first use in a step, but only for terms flagged `beginner = true`, and at most 2 per step. It opens the Glossary tab at that term.
- Each chapter's quick-reference cards (moves, pad plan, settings used, song map) appear on its start screen under "Reference for this chapter" and are compiled into the Cheat sheet. The Cheat sheet can filter to "chapters I've done".
- Every danger and caution tag links to `safety.html#<risk-id>`.
- The Rhythm lab is linked from the 01/02 steps that have a target rhythm as "Practise this away from the device".

### 4.7 Search

- **The index** is built at deploy time into `search-index.<hash>.json` (budget ≤50 KB gzipped) and precached. It covers every step (title, Do, Check, keys), part, checkpoint, troubleshooting topic, glossary term, Learn lesson, cheat-sheet move and safety entry. Each entry has a namespaced id (`sampling/record-snare`) and its deep link.
- **Matching:**
  - Word boundaries, with a prefix match on the last word, so "hat" finds "hats" and "hi-hat" but not "that".
  - Case and diacritics folded, and plural and -ing forms folded.
  - Synonyms from `content/tools/synonyms.toml` (hi-hat/hihat/hat, sidechain/side-chain/pump, hip-hop/hiphop, vocal/voice, bpm/tempo).
  - For at least 90 days after P6, the legacy chapter numbers match too.
- **Ranking:** exact title phrase, then title words, then keycap tokens (ERASE), then Do/Check, then body.
- **Results** are grouped (Steps · Troubleshooting · Learn · Glossary · Cheat sheet), with a breadcrumb such as "Chapter 3 · Part 7 · Step 2".
- **A step result opens as a read-only preview inside the sheet.** "Go to this step" is the secondary action. If the learner does go there, a "Back to Ch 5 · Step 4" pill appears in the app bar. Searching never moves the learner.

### 4.8 History, titles and focus

- **Moving between steps uses `replaceState(#s-<id>)`.** The address bar always holds a shareable step link, reload resumes on the same step, and one Back press leaves the chapter instead of walking back through 79 steps. The on-screen Back button is the "previous step" control.
- **Opening a sheet, lesson or topic pushes a history entry,** so phone Back closes it first. Scroll position and focus are restored per entry.
- **Titles:** `document.title` is "<Step title> · Step 4 of 8 · Sample, chop & resample · K.O. II Coach" in the player and "<Page name> · K.O. II Coach" elsewhere. The build checks that titles are unique and that each page has exactly one `<h1>`.
- **Focus:**
  - On a step change, focus moves to the new step's `<h3>` (`tabindex=-1`), whose accessible name includes "Step 4 of 8".
  - On a page or view change, it moves to the `<h1>`.
  - When a sheet closes, it returns to the control that opened it.

---

## 5. Key screens

The wireframes show phone portrait at 390×844, in the end state with Chapter 0–7 numbering. Heights are in CSS px.

### 5.1 Home and course map (`index.html`)

**Purpose.** Answer "where am I, what is next and how far have I got" in one glance, and resume in one tap.

**First run** is defined by what the learner has done, never by whether any key exists. The old app writes `koii-coach-v2` on every load, and P3 writes prefs and meta, so key existence stops meaning anything after one reload. It is first run when all of these hold:
- `prefs.setup` is unset.
- No `koii-coach-ch-*` record has ticks.
- `koii-coach-v2` is at its defaults (step 0, song 0, not finished, no Learn lessons marked).

```
+------------------------------------------+
| [=]  K.O. II / COACH             [Search]|  56  app bar (wordmark: mono 600 16)
+------------------------------------------+
|  WELCOME                                 |  cap 14 mono, ink-2
|  Learn the K.O. II with it               |  h1 30/36 800
|  in your hands.                          |
|  8 chapters · about 12-18 hours ·        |  body 17/26
|  works offline · no account              |
|                                          |
|  Is your K.O. II new or untouched?       |  h2 24/30
|  +------------------------------------+  |
|  | Yes: set it up with me (Chapter 0) |  |  56 primary  -> setup.html
|  +------------------------------------+  |
|  +------------------------------------+  |
|  | It's set up: start Chapter 1       |  |  48 secondary -> first-beat.html
|  +------------------------------------+  |
|  Not sure? Start with Chapter 0: nothing |  ghost link, 17
|  in its first seven parts erases music.  |
|  - - - - - - - - - - - - - - - - - - - - |  fold (844)
|  Course                                  |
|  ( ) 0  Set up your K.O. II   45-60 min  |  76px rows, titles only
|  ( ) 1  First beat            30-50 min  |
|  ...                                     |
+------------------------------------------+
```

The card keeps the class `.card.start` and links `./setup.html`, which is a smoke-test contract. The wording comes from proposal B. Proposal A's "or not on OS 2.5.1 yet?" is dropped because it assumes the beginner knows their OS version. The escape line quotes setup.html's own claim ("Nothing in sections 01–07 erases music"). "It's set up" stores `prefs.setup='ready'`. Chapter 0 stays first on the map, marked "Skipped · do it any time", and Settings can revert the choice.

**Existing learners (a one-time migration in P3).** setup.html first shipped in 2026.10.13.2, so almost nobody has ticked it. The boot sets `prefs.setup='ready'` and records `setupReason:'existing-progress'` in `koii-coach-meta` when either of these holds:
- `koii-coach-v2` shows progress (step > 0, song > 0, `finished` or `songFinished`).
- Any chapter other than setup has ticks.

Chapter 0 then shows on the map as "Optional · set-up checks". The "never inferred" rule applies only to brand-new learners.

**Returning:**

```
+------------------------------------------+
| [=]  K.O. II / COACH             [Search]|  56
+------------------------------------------+
|  CONTINUE · CHAPTER 3                    |  cap 14
|  Sample, chop & resample                 |  h2 24
|  Part 2 · Build a drum kit               |  17 ink
|  Step 4 of 8 · Record the snare          |  17 ink-2
|  [========------------]  23 of 57 done   |  8px meter (lime fill on surface-3)
|  [Project 7] [OS 2.5+]                   |  LCD-style chips
|  +------------------------------------+  |
|  |           Continue  ->             |  |  56 primary (#resume)
|  +------------------------------------+  |
|                                          |
|  Course · about 12-18 h · 3 of 8 done    |  h2 24
|  [*] 0  Set up your K.O. II   36/36 DONE |  LED filled + text "DONE"
|  [*] 1  First beat            22/22 DONE |
|  [*] 2  Make it a song        24/24 DONE |
|  [o] 3  Sample, chop & resample          |  lime 4px rule + "You are here"
|         23/57 · Project 7 · 2-3 h        |
|  [ ] 4  Play & perform  Project 6 · 2-3 h|
|  [ ] 5  Full hip-hop beat ...            |
|  - - - - - - - - - - - - - - - - - - - - |  fold
|  Your device projects                    |  6: Ch 1, 2, 4 · 7: Ch 3 · 8: Ch 5 ·
|                                          |  9: Ch 0 (scratch), 6 · Ch 7 reuses one
|  Tools                                   |  2-col grid of 96px tiles
|  [Control map]      [Troubleshooting]    |
|  [Cheat sheet]      [Glossary]           |
|  [Learn]            [Rhythm lab]         |
|  Safety and erasing ->                   |
|  Offline ready ✓ · Written for OS 2.5.1  |  #offline (wording kept)
|  Report a wrong instruction · Not        |  footer contract
|  affiliated with ... teenage engineering |
+------------------------------------------+
```

**Continue target rule:**

1. Chapter 0, while `prefs.setup` is unset or `'new'` and Chapter 0 is not complete.
2. Otherwise, the unfinished chapter with the latest `at`, opened at its `cur` step (or the first unticked step after `last`).
   - Records written before P3's chapter.js patch have no `at`. For those, use `meta.lastChapter`, then the first chapter in guided order that has ticks or a 01/02 position but is not complete.
   - Until P5b, 01/02 progress is read from `koii-coach-v2` (position).
3. Otherwise, the next chapter in guided order that has not been started.
4. When all eight are complete, a course-complete card replaces Continue (§5.9).

Each chapter row is a link whose accessible name includes its state ("Chapter 3, Sample, chop & resample, in progress, 23 of 57 steps"). After migration, a one-time line on the card reads: "We carried your progress over: 23 of 57 in Chapter 3."

**Desktop 1280.** A 1120px container. The left column (640px) holds the Continue or Welcome card and the course list. The right column (420px) holds device projects, Tools tiles, and an offline / install / backup card. Both cards sit above the fold.

**Without JS.** The static course list and links work, and the card reads "New K.O. II? Start with Chapter 0".

### 5.2 Chapter start screen (the chapter overview)

**Purpose.** Replace 300–555 words of preamble with one screen: what you'll make, what you need, which project to use, what can erase data, and how the chapter is built.

```
+------------------------------------------+
| [=] 3 · Sample, chop & resample  [sun][:]|  56
+------------------------------------------+
|  CHAPTER 3 / ABOUT 2-3 HOURS             |  header .eyebrow (contract, generated; the page's only one)
|  Sample, chop & resample                 |  h1 30
|  Record your voice, build a kit from it, |  promise <= 2 lines, 17
|  chop and resample.                      |
|  [2-3 h] [Project 7] [OS 2.5+] [Formerly 07]
|  You will make: a drum kit from mouth    |  one line + icon
|  sounds and a resampled loop.            |
|  Before you start                        |  h2 20
|   (cable) USB-C data cable               |  3-5 icon rows
|   (proj)  Empty project 7                |
|   (ear)   Headphones or a speaker        |
|  +-[!] 2 actions here cannot be undone -+|  danger notice, open on 1st visit
|  | Deleting a sample (ERASE + SOUND)    ||  then a 1-line strip
|  | Cropping a sample (hold SHIFT+SOUND) ||  links safety.html
|  +--------------------------------------+|
|  Parts                                   |  h2
|   1 Record your first sample   7 steps   |  48px rows, tally ring
|   2 Build a drum kit           8 steps   |
|   ...                                    |
+------------------------------------------+
| [        Start Part 1  ->              ] |  72 fixed bar, one primary
+------------------------------------------+
```

- **Behaviour.** The start screen shows when the chapter has no progress, at `#start`, or from "About this chapter". When the chapter has progress, opening the file goes straight to the player at `cur`, with a one-line toast: "Welcome back: step 3 is done". A completed chapter opens on `#done`. One-time notices (§5.13) appear here.
- **OS chip.** It turns to caution with an "Update first" link when the Settings OS is older than the chapter's `min_os`.
- **Reference for this chapter.** A collapsed section below the parts holds the pad plan (four mini 3×4 pad grids for groups A–D), the song map table, the moves and the settings used.
- **Desktop.** Two columns: the start content (640px) on the left; the parts list and pad plan (420px) on the right.
- **Re-entry.** Where a chapter defines verified re-entry text (today only perform.html's "How every section starts"), a "Get back in" card appears before the resume step when the last activity is more than 30 minutes old. Other chapters gain it only through the P7 review on the device.

### 5.3 Step player: standard step

**Purpose.** The core loop: read it at arm's length, do it, check it, go to the next step, with no scrolling.

The example is real content: `beat-load-snare`, rewritten to the step budget.

```
+------------------------------------------+
| [=] 1 · First beat               [sun][:]|  56: title 15/600; sub 14 ink-2
|     Part 1 · Load your kit · Step 4 of 6 |
|======------------------------------------|  4px chapter meter
|  STEP 4 OF 6                     ( v )   |  .step-pos mono 14 · 48px tick (label.check input)
|  A2: load the snare                      |  h3 20/28 600
|                                          |
|  1  Stay in [SOUND]. With [A] selected,  |  Do 24/32; hot keycaps (orange fill,
|     tap [A2].                            |  mono 600 19)
|  2  [HOLD SOUND], type [1][0][0],        |
|     release [SOUND].                     |
|  3  Tap [A2].                            |
|  --------------------------------------  |
|  (ear) CHECK · YOU HEAR                  |  cap 14 mono
|  Pad 2 sounds sharper and brighter       |  20/28
|  than the kick.                          |
|                                          |
|  [Why] [Not working?] [Source]           |  44px disclosure chips
|                                          |
+------------------------------------------+  y≈771
| [ < ]   [ # ]   [   Done · Next  ->    ] |  72 + safe area, e2
|  Back   Tools                            |  labels 14 under icons
+------------------------------------------+
```

**Layout budget.** The app bar and meter take 60px. The action bar takes 72px plus the safe area, which is up to 34px. At 360×740, the smallest gated viewport, the card must end by y=634. I mocked the card at these sizes (`agents/editor/fold2.py`, including the 48px tick row):
- A step at the old budget (40-word Do, 25-word Check) ended at y=749.
- A step at the budget below ends at y=613.

So the budget is set by that viewport: **Do ≤26 words in ≤3 moves, Check ≤15 words, title ≤48 characters.** The example above (22 words) fits. Risk steps have their own budget (§5.4). The fold test (§8.1) enforces both.

**Done · Next:**

1. Adds the step id to `done` and sets `cur`, `last` and `at`.
2. Swaps the card (200ms).
3. Runs `replaceState(#s-<next>)` and updates `document.title`.
4. Focuses the new `<h3>`.

It always goes to the **next step in order**, never "the next unticked step", which would skip steps without warning. On a step that is already ticked, it reads "Next →". The tick unticks a step. Back never unticks. `cur` changes only on Done · Next and Back. Jumping from the menu, search or a link marks nothing done and does not move `cur` (§5.13).

**Ends of parts and chapters.** The last step of a part opens the part checkpoint (§5.9). From a part's first step, Back goes to the previous part's last step. From the chapter's first step, it goes to the start screen.

**Keyboard:**
- → and Enter = Done · Next, ← = Back, Esc closes a sheet. Letter shortcuts T (Tools), M (menu), / (search) and ? (shortcut list) are on by default, with an off switch in Settings (WCAG 2.1.4).
- Step shortcuts fire only when focus is on `<body>`, `<main>` or the current step's h3. They never fire in these cases:
  - Focus is inside an `a`, `button`, `summary`, `input`, `select` or `textarea`.
  - Focus is inside `[role=tablist|radiogroup|grid|listbox|dialog]`.
  - A `<dialog>` is open.

  This way, Enter on a link, a disclosure or the tick never advances the step as well, and → stays free for tabs, the control map, the lab grid and search results.

**Focus order.** The DOM order is the reading order: the step content (heading, tag, tick, Do with any in-step links, Check, disclosures), then the action bar. Putting the action bar first would make screen readers read "Back, Tools, Done · Next" before the instruction (WCAG 1.3.2 and 2.4.3).
- Tab presses from the h3 to Done · Next equal the step's own focusable items plus 3 (Back, Tools, Done · Next). A plain step has 4 (tick, Why, Not working?, Source), so that is 7 presses. The test asserts this formula, so no stray stop can slip in.
- The fast path is Enter or → from the h3, which is where focus lands after every step change.
- The risk tag is a step's only link to safety.html; Source does not repeat it.

**Screen wake lock:**
- Requested on the first Done tap in a session and re-acquired on `visibilitychange`.
- Released on `pagehide` or after 15 minutes without a tap, with the toast "Screen can sleep again · Keep on".
- The sun icon carries a lime LED dot while it is held. The toggle is hidden where the API is missing.

**Gestures.** There is no swipe-to-advance, because a propped phone gets brushed.

**Optional groups.** The step shows an OPTIONAL tag and a "Skip these 3 steps" button that states the consequence ("Chapter 2 starts from your bass; skip only if…"). Skipped ids go into `skip[]` and are excluded from M in "N of M done".

### 5.4 Step variants

Variants are chosen by data, never by the author's layout.

**Risk-step budget** (variants a and b): preflight + consequence + Do ≤40 words in ≤3 moves, and undo ≤12 words.
- The fold gate covers the preflight through the last Do move.
- When the undo and Check fall below the action bar, an "Undo and Check below ↓" cue sits just above it.
- Measured at 360×740, `song-break-clear` below ends its Do at y=546 and its Check at 647, against a limit of 634.

**(a) Recoverable erase** (`risk.kind = "erase"`): a brief ERASE + pad note erase, holding ERASE + pad until TRK blinks, or holding ERASE + group until PTN blinks. The SHIFT + B undo is verified on the device for each. The renderer fixes the order, and there is no blocking gate. The example is real content, `song-break-clear`, with the precondition moved from If stuck to the top:

```
+------------------------------------------+
| [=] 2 · Make it a song           [sun][:]|
|     Part 4 · Breakdown · Step 2 of 3     |
|==============================------------|
|  STEP 2 OF 3   [CLEARS TRACKS]   ( v )   |  amber tag (caution), links safety.html
|  Clear kick and bass in BREAK            |
| +-(!) BEFORE YOU PRESS ----------------+ |  caution surface, 1.5px caution line
| | Hold [MAIN]: the display shows your  | |  20/28
| | BREAK scene number.                  | |
| +--------------------------------------+ |
|  Clears every note of A1 and B1 in this  |  consequence line, 17 ink
|  pattern.                                |
|  1  Stopped, press [MAIN] and tap [A].   |  Do 24/32
|  2  [HOLD ERASE]+[A1] until  TRK  blinks,|  HOLD prefix on keycap; TRK = LCD chip
|     then release.                        |
|  3  Tap [B] and do the same with [B1].   |
|  (undo) UNDO  [SHIFT]+[B] while the      |  surface-2 + undo icon (reassurance,
|  umbrella is lit.                        |  not red)
|  (ear) CHECK · YOU HEAR                  |
|  Press [PLAY]: melody, snare and hats,   |
|  no kick, no bass. Stop.                 |
+------------------------------------------+
| [ < ]   [ # ]   [   Done · Next  ->    ] |
+------------------------------------------+
```

**(b) Irreversible** (`risk.kind = "delete" | "overwrite"`):
- `delete`: holding ERASE + SOUND until SND blinks deletes a sample. Holding ERASE + MAIN for two seconds erases a scene (DEL or CLR); it stays `delete` unless the P4 device walk shows that SHIFT + B restores it.
- `overwrite`: holding SHIFT + SOUND on the trim page crops the sample and overwrites the file.

How the step renders:
- A red DELETES A SAMPLE / ERASES THE SCENE / OVERWRITES THE FILE tag and a 4px danger rule on the card's left edge.
- The **Before you press** block has a 48px confirm button ("Yes, the display shows the sample I want to delete"). Until it is confirmed, the Do list is collapsed to one line, "Confirm the check above first". It is not shown dimmed, because dimmed text is unreadable and gets read anyway. The main button reads "Confirm first" with a dashed outline.
- After confirmation the gate collapses to a 32px chip ("✓ Checked") and the moves appear, followed by "NO UNDO · This deletes the file from the unit" and the Check.
- The confirmation is per visit and never stored.

The gate guards the press on the device. It does not block Next after the fact, which is why proposal B's "disable Next until confirmed" is rejected.

**(c) System setting** (SHIFT + ERASE, type a code, ENTER). Not a risk. A neutral "SYSTEM SETTING `400`" tag with an info icon. No colour alarm and no gate: the course itself states "None of the codes in the table erases music" (setup.html).

**(d) Format at power-on.** Never a step. It appears only in safety cards: the chapter start screen and safety.html.

**(e) Placement** (01/02 steps with `widgets.place`). Under the Do moves sits a **position runner**, listing only this step's notes:

```
|  1  In stopped [MAIN] with [A], use      |
|     [-] / [+] to reach each position.    |
|  2  At each one, [HOLD RECORD]+[A1].     |
|   1.1.1 ✓   [ 1.2.3 ]   1.3.1   1.4.3    |  current: 28px LCD chip, orange outline
|  +------------------------------------+  |
|  |      Placed · next position        |  |  48 secondary (#note-next)
|  +------------------------------------+  |
|  Target rhythm      1   2   3   4        |  read-only <table>: ink squares = hits,
|  Kick  ■ · · · | · · ■ · | ■ · · · | · · ■ · |  outlined = empty; caption + text list
|  (ear) CHECK · YOU SEE                   |
|  A1 lights at each of the four positions.|
```

- The runner never runs on into the next instrument, which the current helper does. `#placement` keeps a short live text such as "1.2.3 · A1".
- Finishing the runner pulses Done · Next once. It does not auto-advance.
- The pattern strip has no button chrome. It renders only on steps that have rhythm content, and it has a visually hidden list such as "Kick: 1.1.1, 1.2.3, 1.3.1, 1.4.3".
- "Hear it" (a disclosure chip) plays the synthesised target with today's Web Audio scheduler. Playback stops on Next, on navigation and when the page is hidden.
- The runner and pattern strip sit below the Check in the fold calculation; the gate is Do + Check.

**(f) Info, recap and checkpoint steps** (`kind = "info" | "recap" | "checkpoint"`). Info and recap have no Check. A recap's moves feed the Cheat sheet and the chapter-complete screen. A `checkpoint` step is a tickable checkpoint that already exists as a step: hiphop has 10, such as `check-rebuilt-beat`. It keeps its id, counts in N of M and renders with the checkpoint styling.

**(g) Stage-1 legacy step** (`text` instead of `do`, used until a chapter is rewritten, **and only for steps with no confirmed risk**).
- The original prose is shown verbatim at 20/30, with keycap and LCD markup on unambiguous tokens only. Any inline "Check:" sentence is split into the Check block.
- Prose is not auto-split into numbered moves, because that would turn provenance quotes and conditionals into actions.
- Stage-1 steps are exempt from the fold gate. The card scrolls under the fixed bar with a "more below" fade.
- Every hand-confirmed erase, delete or overwrite step in 07–11 is rewritten into structured do/check with the preflight first when its chapter converts in P4. That is about 20–30 steps, including 11's 288-word `check-or-clear-patterns`, where "hold ERASE and A until PTN blinks" sits mid-paragraph. Each rewrite goes through the accuracy guard and a device walk. A preflight box above unchanged prose would leave the destructive press buried.

### 5.5 Player on short viewports and on desktop

- **Short viewports** (`(max-height:480px)`, which covers landscape phones and 400% zoom at about 320×256): the app bar is 40px and static, so it scrolls away, and the action bar becomes a single 48px row. Fixed chrome stays at or below 25% of the height.
  - Before P8: the card fills the width at a 65ch measure. The gate is the first Do move plus Done · Next. At 844×390, a step at the budget ends its first move at y=192 and its full Do at 336, against a limit of 342.
  - From P8: the left 40% holds the device strip scaled to `max-height: calc(100dvh - 40px)`, with this step's keys lit and numbered in press order. The right 60% holds the card with Do at 20/28. The gate is every Do move plus Next; the Check may follow below with the cue.
- **Desktop ≥1200px:** the three columns from §4.5. Do is 28/36, body text is capped at 65ch, and the action bar is docked under the card with shortcut hints ("→ Done & next · ← Back · T Tools").
  - Tapping a control in the device panel shows its meaning in a fixed-height (168px) info area. Nothing shifts, and nothing calls `scrollIntoView`.

### 5.6 Menu sheet (≡)

```
+------------------------------------------+
|                 ----                     |  drag handle; sheet top radius 20
|  [This chapter]  [Course]          [x]   |  44px segmented tabs
|  23 of 57 done  [========-----------]    |  #progress-count
|  Part 1 · Record your first sample  7/7 v|  h3 rows with tallies
|  Part 2 · Build a drum kit          3/8 ^|
|    v 1  Name the pads                    |  48px step rows
|    v 2  Record a kick                    |
|    v 3  Record a hat                     |
|    * 4  Record the snare   You are here  |  aria-current="step"
|    o 5  Level the kit                    |
|    ...                                   |
|  Part 3 · Sample your phone         0/7 v|
|  ------------------------------------    |
|  All steps · Print all steps             |
|  [ Restart this chapter ]                |  danger outline; confirm + 10s Undo toast
+------------------------------------------+
```

- **Course tab:** a Continue row, then the 8 chapters with LED state (ring = not started, half = in progress, filled lime with ✓ and "DONE" = done) and x/N, then Tools (unnumbered rows with icons), Settings, "Available offline ✓" (with "Saving offline copy 64%" while installing; the existing `koii-coach-status` message already returns `cached`/`total`) and Install (`beforeinstallprompt`, or a one-line iOS share-sheet hint).
- **Behaviour:** a native `<dialog>`, with the page behind it inert. It pushes a history entry, so Back, Esc, a scrim tap or the close button all close it. Focus returns to ≡.

### 5.7 Tools sheet and tool pages

```
+------------------------------------------+
|                 ----                     |
|  [Search the coach .............] [x]    |  48px search field
|  [For this step] [Map] [Fixes] [Words]   |  44px tabs (scroll horizontally)
|  [Cheat sheet]                           |
|  FOR THIS STEP                           |
|  +- Control map (schematic) ----------+  |  this step's keys lit, numbered 1,2,3
|  |   [1 SOUND]   [2 A]   [3 A2]       |  |  in press order
|  +------------------------------------+  |
|  Fixes for this step                     |
|  > A pad is silent                    v  |  expanded <details><summary><h3>
|    ...                                   |
|  Words in this step                      |
|  Audition · Sample number                |
|  Moves you know (from your chapters)     |
|  ------------------------------------    |
|  Learn · Rhythm lab · Safety and erasing |
+------------------------------------------+
```

- **Phone:** a bottom sheet at 88dvh. **Desktop:** it replaces the 360px right panel.
- **While a query is present,** results replace the tab content, grouped as in §4.7.
- **Tool pages** share the same app bar. The h1 is the menu label. One search field (the overlay), then content as `<h2>` groups with anchors:
  - **Troubleshooting:** symptom-first `<details><summary><h2>` topics in groups (No sound · Timing and notes · Projects and scenes · Storage and backup · Errors).
  - **Glossary:** a `<dl>` with a sticky 48px A–Z row.
  - **Cheat sheet:** per-chapter keycap tables with a print layout.
  - **Learn:** 19 cards with short accessible names (title only, description in `aria-describedby`) and a "Tried on the device" toggle (`#complete`).
  - **Safety and erasing:** every risk, how to avoid it, and its undo or "No undo".
- **Desktop:** a 65ch column plus a sticky on-page index.
- Opening a topic or lesson pushes history; `#id` opens and focuses it.

### 5.8 Search and help

- **Phone:** a full-height sheet with a 56px autofocus field and type-filter chips (All · Steps · Fixes · Learn · Words).
  - Results are 56px rows: the title with matched words highlighted, a breadcrumb, and a one-line snippet showing keycaps.
  - The exception is troubleshooting results. They stay expandable `<details>` under `h2.sub` group headings, so the answer is readable in place, and this keeps a test contract.
  - Arrow keys move through results, Enter opens, Esc or Back closes.
- **Ids.** Until P5b, index.html also holds the old Help view's `#search` and `#results`. The overlay therefore uses `#site-search` / `#site-results` on every page until then, and takes over `#search` / `#results` on help.html in P5b.
- **Empty state:** suggestions ("silent pad", "undo", "chop", "sidechain", "song list"). **No result:** synonyms tried, plus a Troubleshooting link.
- **Desktop:** a 640px dropdown under the app-bar field.
- **Without JS:** the Search icon is a link to `help.html`, which carries the full topic list.

### 5.9 Part checkpoint, chapter complete, course complete

- **Part checkpoint** (a full card in the player):
  - Eyebrow "PART 2 DONE · CHECKPOINT". The question is the part's existing checkpoint text at 24/32.
  - A 56px primary "Yes · Part 3: <title>" and a 56px secondary "Not quite".
  - "Not quite" reveals one symptom card per `fix` (the symptom at 17/600, the fix with keycaps, a "Redo step 4" link). These come from today's "If it doesn't" text, split by symptom.
  - A row of LED dots shows parts done.
  - The answer is stored in `koii-coach-meta.checkpoints` only for analytics-free self-review; it never changes ticks.
  - Parts without checkpoint text (all of hiphop and tech-house today) show a plain "Part 2 done · Next part" card until P7 writes one.
- **Chapter complete** (`#done`):
  - h1 "Chapter 2 done". "You made" (from the content, e.g. "a 16-bar song, about 43 s at 90 BPM"). Scene numbers to write down, as LCD chips. "New moves" (added to the Cheat sheet).
  - A "Back up now" card that opens Chapter 0's backup part in a sheet.
  - A 56px primary "Next: Chapter 3 · Sample, chop & resample" and a secondary "Back to course".
  - The footer keeps `.chapters .prev/.next` (rel=prev/next, guided order).
  - Arriving here auto-ticks the chapter's recap step **only when every other non-skipped step is done**. Then the Home tile turns DONE, and a 16-LED row lights over 600ms (static under reduced motion). With steps unticked, the screen reads "Chapter 2 · 3 steps not ticked yet" and lists them as links.
- **Course complete:** after Chapter 7, the same screen lists all eight chapters, what was made in each, and links to the Cheat sheet. It also replaces the Continue card on Home.

### 5.10 All steps (list mode), print and no-JS

- **Toggle.** A "Player | All steps" segmented control in ⋮ and in the menu sheet, remembered per chapter in `prefs.modes`. The default is Player on every device (decision 7). Because the player only hides the `<li>` elements not in view, list mode costs almost nothing.
- **List mode:**
  - Parts are `<section id="<part-id>"><details open><summary><h2>`. Completed parts collapse automatically.
  - Every step uses the same Step component, stacked, with its 48px tick (`.steps ol>li .check input`).
  - The resume step carries a visible "You are here" badge and `aria-current="step"`. A resume banner ("You're on Part 3, step 31 of 61 · Continue") appears in the first viewport.
  - `html{scroll-padding-top:72px;scroll-padding-bottom:calc(72px + env(safe-area-inset-bottom) + 16px)}`, so focus is never hidden under bars.
- **Print:** opens every part and hides the shell, ticks and bars.
- **Without JS:** every page is complete semantic HTML with all steps numbered and all parts expanded. The ticks and player are JS-only, as today.

### 5.11 Control map and Rhythm lab

- **Control map** (`controls.html`, and the "Map" tab of the sheet):
  - Before P8: today's control set, restyled, with the explanation (`#info`) moved into a fixed-height panel *below* the buttons with internal scroll. Tapping then never shifts anything, and `scrollIntoView` is removed.
  - From P8: an original line-art schematic in the unit's relative layout (display, knobs X/Y, fader, function keys, groups A–D, 12 pads), labelled "Schematic · not to scale · not an official drawing", fitted to at most 60dvh on a phone.
  - Controls form a `role=radiogroup` with roving tabindex (`[data-control]` kept). Selection is an inset fill and focus is an outer ring, so the two never look alike.
- **Rhythm lab** (`lab.html`):
  - Until P8: today's lab with styled controls and bigger hit glyphs.
  - From P8, phone portrait: instrument tabs (Kick ● · Snare ■ · Hat ▲ · Bass ◆, 48px). One 4×4 grid per instrument: rows = beats 1–4 and columns = sixteenths, so cell (2,3) is `1.2.3`, matching the display. Cells are about 76×64px. A 28px LCD beat counter.
  - Transport: Play/Stop 56px (`#audio-play`), BPM and volume as 48px −/+ steppers with LCD values, `#recipe` and `#clear`.
  - Landscape and desktop: a 4×16 grid with 44px cells.
  - `#beat` keeps all 64 buttons with `aria-pressed` as `role=grid` (arrow keys, Space to toggle). The playhead is a full-column lime outline. Hits use ink plus a glyph, never orange.

### 5.12 Settings and 404

- **Settings** (`settings.html`) is a set of cards:
  - **Your K.O. II:** `#firmware` (older / 2.0 / 2.5) and `#version-note`. Changing it updates every `.badge.ok/.badge.warn` across all chapters. "My unit is set up" (`prefs.setup`).
  - **While practising:** Keep screen on (Auto / Off), Keyboard shortcuts (On / Off), and from P8 Text size (Default / Larger).
  - **Progress:** an overall summary, Export and Import, and Reset all progress (danger outline; confirm; keeps the firmware choice and every preference; 10s Undo). A separate, quieter "Reset settings" link clears `koii-coach-prefs`.
  - **Offline and install:** the `#offline` sentence "Offline ready: the coach and all its chapters…" (kept for the test), version, guide-checked date, Install. "Offline copy incomplete · Retry" when the SW install failed.
  - **About:** sources, OS 2.5.1, the unofficial / non-affiliation line, privacy ("No accounts, no analytics, progress stays in this browser").
  - Errors (import failed, storage blocked) appear inline under the control as `role=alert` and persist until dismissed. If storage is blocked, the notice suggests installing or exporting, because WebKit can evict storage for sites that are not installed. Toasts (`#toast`, `role=status`) are only for confirmations.
- **404:** the full shell, h1 "Page not found", search, and the Course and Tools lists. All URLs resolve through `<base href>` (§4.4). It is precached, and it is the service worker's fallback for unknown navigations (§7.6).

### 5.13 Edge states

Each row has a storage or URL fixture in `test_progress.py` or `test_player.py`.

| State | Rule and copy |
|---|---|
| Reopening a completed chapter | Opens on `#done` with "Review steps" (list mode) and "Restart this chapter" |
| `#done` reached with steps unticked (Done · Next or a deep link) | "3 steps not ticked yet" with links; the recap is not auto-ticked; Home shows "in progress" |
| All 8 chapters complete | The course-complete card replaces Continue |
| Storage blocked | A persistent InlineAlert under the app bar in player and list mode, keeping today's `#progress-note` wording, plus "Export or install" |
| One-time notices ("This chapter was rewritten…", 01/02 "the old dots counted position") | Read from `koii-coach-meta.notices`; shown once on the start screen, or as a dismissible banner above the resume step |
| Search offline before the index is cached | "Search needs the offline copy · Open the Troubleshooting list" |
| SW install failed | The menu and Settings show "Offline copy incomplete · Retry" instead of "Available offline ✓" |
| "For this step" has no topics or terms | Falls back to the Troubleshooting groups and the Control map |
| Deep link to a retired or unknown `#s-` id | Retired: mapped through `migrations.toml`. Unknown: start screen plus the toast "That step link is out of date" |
| Menu jump, search "Go to this step" or deep link | URL and title change; `cur` does not; a "Back to step N" pill appears. Only Done · Next and Back move `cur` and Home's Continue |

---

## 6. Design system

**Concept.** Studio hardware, drawn as a schematic, not a replica. The olive/ink base palette stays, with one meaning per colour. There are two functional primitives, the **keycap** and the **LCD chip**, and everything else is quiet. No teenage engineering typefaces, colourways, photos, faceplate artwork or pixel icons.

### 6.1 Typography

- **Families.**
  - UI: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`, with `font: inherit` on every form control (this fixes the Arial fallback in chapter inputs).
  - Mono, for keycaps, LCD chips, eyebrows, step numbers and the wordmark: **IBM Plex Mono SemiBold 600** (SIL OFL), self-hosted as a Latin subset including `− + × · ✓ → ↻`. About 15 KB woff2, `font-display: swap`, precached. Fallback: `ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace`.
  - The font ships in P1 so the existing key chips gain the vocabulary immediately. Deferring it to the end, as proposal C did, is rejected.
- **Six sizes**, fluid between 390 and 1280px via `clamp()`. This replaces 17.

  | Token | Phone → desktop (size/line-height) | Use |
  |---|---|---|
  | `--t-cap` | 14/20 | Eyebrows (mono 600, uppercase, +0.06em), captions, meta, badges. **The floor for anything instructional or interactive.** |
  | `--t-body` | 17/26 → 18/28 | Body, disclosure text, tables (tables never drop below 14) |
  | `--t-check` | 20/28 | Check text, step titles (h3), sheet titles, stage-1 prose, Do on short viewports from P8 |
  | `--t-do` | 24/32 → 28/36 | Do moves. The P8 "Larger" setting gives 30/40 |
  | `--t-h2` | 24/30 → 28/34 | Section headings, Continue card title |
  | `--t-h1` | 30/36 → 42/48 | Page title |

- **Mono sizes:** keycap 0.8em (about 19px in Do lines, 14px in body); inline LCD chip 0.85em; LCD readout 28px (Check, runner); lab counter 28px.
- **Weights:** 400, 600 and 800 only (mono 600 only). No negative tracking.
- **Measure:** `p, li, dd { max-width: 65ch }`; Do lines run about 20–30 characters on a 360px phone.
- **Why these sizes.** On a 390px-wide phone, 1 CSS px ≈ 0.166 mm. A 24px Do line has an x-height of about 2.1 mm, roughly 14 arcmin at 50 cm, which is comfortable reading. 17px body text (about 10 arcmin) is used only in disclosures you lean in to read.

### 6.2 Colour tokens

Every ratio below was computed (WCAG 2.x) for this plan. Targets: text ≥ 4.5:1, UI components and state ≥ 3:1, surface steps ≥ 1.14:1 plus a border.

| Role | Token | Light | Dark | Measured (light / dark) |
|---|---|---|---|---|
| Page | `--bg` | `#EEF0E7` | `#060908` | — |
| Card, sheet, bars | `--surface-1` | `#FFFEF8` | `#161E19` | vs bg 1.14 / 1.17 |
| Insets, disclosures, info | `--surface-2` | `#F4F5EC` | `#232E27` | vs s1 1.09 / 1.21 |
| Device body, meter track, empty cells, pressed | `--surface-3` | `#E1E5D6` | `#34413A` | vs s2 1.17 / 1.32 |
| Decorative divider | `--line` | `#CBD3C2` | `#3E4F45` | on s1 1.52 / 1.95 |
| Control outlines, quiet keycaps, secondary borders, ticks, cells | `--line-strong` | `#76846F` | `#80948A` | on s1 3.92 / 5.28; on s3 3.09 / 3.32 |
| Text | `--ink` | `#18251E` | `#E8EEE0` | on s1 15.72 / 14.38; on s3 12.39 / 9.03 |
| Muted text | `--ink-2` | `#4F5C4D` | `#AAB6A4` | on s1 7.00 / 8.05; on s3 5.51 / 5.06 |
| **Screen action** (one per view) | `--primary` / `--on-primary` | `#18251E` / `#FFFFFF` | `#E8EEE0` / `#060908` | 15.88 / 16.89 |
| **Hardware control to press** (only use) | `--key` / `--on-key` | `#C2410C` / `#FFFFFF` | `#FF8A5C` / `#1A0E08` | 5.18 / 8.14; key vs s1 5.13 / 7.33; vs s3 4.04 / 4.61 |
| Keycap bottom edge (decorative) | `--key-edge` | `#8A2E08` | `#C2561F` | — |
| Display readout | `--lcd-bg` / `--lcd-ink` | `#1A2420` / `#E4F5CF` | `#050806` / `#E4F5CF` (+1px line-strong border) | 13.86 / 17.49 |
| **Done / you are here**, text and ticks | `--done-ink` | `#3F6212` | `#B9D67A` | on s1 7.00 / 10.51 |
| Done fill (tags, LED) | `--done-fill` / `--on-done` | `#D8EF9A` / `#18251E` | `#A8C46A` / `#060908` | 12.66 / 10.25 |
| Meter fill, "here" ring, playhead | `--here` | `#4D7C0F` | `#A8C46A` | vs s3 track 3.89 / 5.49; vs s1 4.94 / 8.73 |
| **Irreversible only** | `--danger` | `#B0172F` | `#FF7D8E` | on s1 6.91 / 6.95 |
| | `--danger-surface` | `#FDECEE` | `#2E1418` | danger on it 6.12 / 6.98; ink on it 13.92 / 14.43 |
| **Careful, recoverable** | `--caution-ink` | `#7A4B00` | `#F2C46D` | on caution surface 6.70 / 9.64 |
| | `--caution-surface` / `--caution-line` | `#FFF3D1` / `#A86A12` | `#2A2214` / `#C9962E` | line on s1 4.39 / 6.39 |
| Info note | `--info-ink` / `--info-surface` | `#2F4A5C` / `#EAF0F2` | `#A9C3D6` / `#1B262D` | 8.09 / 8.42 |
| Focus ring (keyboard only) | `--focus` | `#1F6FD1` | `#7FB2FF` | on s1 4.89 / 7.87; on bg 4.29 / 8.99 |

**Rules:**
- **Orange appears only** as a filled keycap in Do lines and as a lit control on the device. Everywhere else keycaps are quiet (surface-1 fill, line-strong border, ink text). Links are ink with a 1.5px underline at a 3px offset. Eyebrows are ink-2.
- **Danger and key are separated by hue (351° vs 17°) and by shape.** Danger is always a stripe, an icon and a label; key is always a keycap.
- **Dark mode:** the primary button inverts and becomes the brightest object on screen, so the action draws the eye, not a status counter. The 14:1 lime bar is gone. Every token is redefined in dark: today `--accent`, `--lime`, `--head` and `--bass` are not.
- **Theme selection:** dark tokens apply under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`. There is no manual switch in this overhaul (out of scope); the hooks exist for tests.
- **Theme metadata:** every page gets two `theme-color` metas, `#FFFEF8` and `#161E19` (today the chapter pages have one, `#18251e`). Manifest `theme_color` becomes `#FFFEF8` and `background_color` stays `#EEF0E7`. `icon.svg` is recoloured from the untokenised `#e55630` to `--key` on `--ink`.
- **Rhythm and pattern state:** hits are an ink fill plus an instrument glyph (≥12:1 on cells); empty cells are line-strong outlines. Colour alone never carries state.
- **Forced colours (`@media (forced-colors: active)`):**
  - Lit keys and lit cells get a 3px `Highlight` outline plus their order-badge number.
  - The current step gets a 3px `Highlight` outline.
  - Done shows ✓ in `CanvasText`.
  - Danger shows a `CanvasText` border, its icon and its label.
  - Meters are bordered boxes made of real elements, never `::before` backgrounds.

### 6.3 Spacing, radii, elevation, breakpoints

- **Spacing, on a 4px base:** `--sp-1 4 · --sp-2 8 · --sp-3 12 · --sp-4 16 · --sp-5 24 · --sp-6 32 · --sp-7 48 · --sp-8 64`. Gutters are 16 (phone), 24 (tablet) and 32 (desktop). The container is 1180px.
- **Radii:** `--r-chip 6` (keycaps, LCD, tags), `--r-control 12` (buttons, inputs, tiles, notices), `--r-card 20` (cards, sheet tops). `999px` is used only for LEDs, meters and ticks.
- **Elevation:**
  - e0: a 1px `--line` border.
  - e1 (cards): the border plus `0 1px 2px rgb(24 37 30/.06)`.
  - e2 (app bar, action bar): the border plus `0 ±8px 24px rgb(24 37 30/.08)`, or `rgb(0 0 0/.5)` in dark.
  - e3 (sheets): `0 -16px 48px rgb(0 0 0/.24)` over a scrim of `rgb(6 9 8/.5)`, or `.7` in dark.
  - In dark mode, elevation also steps the surface (s1 → s2).
- **Bars never hide content:** `html { scroll-padding-top: 72px; scroll-padding-bottom: calc(72px + env(safe-area-inset-bottom) + 16px) }`. Under `(max-height:480px)` the app bar is static and the action bar a 48px row, so fixed chrome stays ≤25% of the viewport at 400% zoom (about 320×256), and the bottom padding drops to 48px + inset + 16px.
- **Breakpoints:** phone under 600px; tablet 600–1023px; desktop 1024px and up (three columns at 1200px and up); short viewport `(max-height:480px)` (landscape phones, high zoom).

### 6.4 Components

Every component has default, hover, pressed (translateY 1px, 120ms), focus-visible (3px `--focus` ring with a 2px surface-coloured gap) and disabled states unless noted.

| Component | Variants | Notes and states |
|---|---|---|
| **AppBar** | home (wordmark, Search) · chapter (≡, two-line title, Screen on, ⋮) · desktop (wordmark, chapter switcher, search field, Tools, Settings) · short (40px, static) | 56px / 64px desktop; sticky; e2 once scrolled |
| **ActionBar** | player: Back · Tools · Done · Next; start: one primary; short: one 48px row | Done states: "Done · Next" / "Next" (already done) / "Done · Checkpoint" / "Confirm first" (dashed, blocked). Always after the step content in DOM order |
| **Button** | primary (filled `--primary`) · secondary (1.5px `--line-strong` outline) · ghost (text + underline) · danger (outline `--danger`, **never filled**) | 48px default, 56px in bars and CTAs, radius 12, weight 600; at most one primary per view; disabled = dashed outline + ink-2 + a reason, never an opacity fade |
| **IconButton** | 44 / 56 | Always `aria-label`; desktop tooltip; labelled in the action bar |
| **Keycap** `<kbd class="key" data-k>` | kinds: function (MAIN, SOUND…) · pad (A1) · digit (7) · group (A–D) · knob (X/Y, round, ↻/↺) · fader (pill); modifiers: chord (`+`), HOLD (tab above the cap), hold-until (HOLD … until LCD chip), type (digit sequence), turn | **hot** (orange, only in Do lines and on the device) · **quiet** (everywhere else); 2px bottom edge |
| **LCD chip** `<samp class="lcd">` | inline · readout (28px) · runner (done: dim ✓ / current: orange outline / upcoming: small) | Mono 600; `--lcd-bg`/`--lcd-ink` |
| **StepCard** | standard · erase (preflight first, consequence, undo) · irreversible (gate) · placement (runner + pattern strip) · optional (skip group) · info · recap · checkpoint · stage-1 | States: current, done (✓ tick filled), skipped (⊘), You are here (list mode badge + `aria-current="step"`). Head is a `<div class="step-head">` with `.step-pos`, never a `<header>` |
| **Tick** `label.check > input` | 48px circle; done = `--done-fill` + ✓ | Accessible name "Mark step 4 done: <title>" (not "I tried step 12"); `aria-describedby` = step title |
| **Badge / Tag** | OPTIONAL · NEEDS OS 2.5 (`.badge.ok` / `.badge.warn`) · CLEARS TRACKS (caution) · DELETES A SAMPLE / ERASES THE SCENE / OVERWRITES THE FILE (danger) · SYSTEM SETTING (info) · DONE | 14px mono; always text, never colour-only |
| **Notice** | tip (bulb) · info (i) · caution (triangle, "Careful") · danger (erase icon, a heading naming the consequence, e.g. "Erases every sound on the unit") | 4px stripe; danger only for irreversible actions; danger and caution link to safety.html |
| **Sheet** | menu · tools · search · step preview | Native `<dialog>`; bottom sheet on phone at 88dvh; side panel 440px on desktop; pushes history; focus trap; inert background |
| **Tabs / Segmented** | 44px | Roving tabindex, arrow keys |
| **Disclosure** | Why · Not working? · Source · Hear it · Device | ≥44px summary; an SVG chevron rotates 90° in 240ms; the default ▶ marker is removed |
| **Progress** | ChapterMeter (8px bar + "N of M done") · PartPips (LED dots) · CourseRow (not started / in progress + ring / done) · ContinueCard · WelcomeCard · CourseCompleteCard | Meter fill `--here` on `--surface-3` |
| **PatternStrip** | read-only `<table>` | Beat groups separated by 4px; caption; text summary |
| **PositionRunner** | — | Bounded to the step's notes |
| **DeviceStrip / Schematic** | idle · lit with an order badge · selected (inset fill) · focused (outer ring) | `role=radiogroup`; selection ≠ focus |
| **Stepper** | −/+ 48px around an LCD value | Lab tempo and volume |
| **Switch** | 48×28 in a 48px row | Settings |
| **SearchField + Results** | overlay · inline | 48px; grouped results (troubleshooting as `<details>`); preview |
| **Toast** | confirmation (+ optional Undo) | `role=status`, 5s (10s with Undo) |
| **InlineAlert** | error · storage blocked | `role=alert`, persistent, next to the control (under the app bar in the player) |
| **Table** | responsive (stacks into labelled rows under 600px) | Song map, settings codes |
| **PadGrid** | mini 3×4 per group | Pad plans |
| **Checkpoint / CompleteScreen** | part checkpoint · chapter complete · course complete | §5.9 |
| **Range** (lab, until P8) | custom 8px track, 28px thumb, ink accent | `aria-valuetext` ("72%", "120 BPM"); constant name |

### 6.5 Motion

- 120ms: press feedback and tick.
- 200ms: step swap. The outgoing card fades and moves −12px on x; the incoming card enters from +12px.
- 240ms: disclosure height and chevron.
- 280ms: sheet slide.
- 600ms: LED fill on checkpoint and complete screens, 40ms stagger.
- Easing: `cubic-bezier(.2,.8,.2,1)`.
- `prefers-reduced-motion: reduce` makes every duration 0, removes all translation and leaves LEDs static.
- No autoplay, no parallax, no confetti, nothing animated on scroll.

### 6.6 Icons and imagery

- **One inline SVG sprite** (about 6 KB): a 24px grid, 2px stroke, round caps and joins, `currentColor`. About 28 symbols:
  - Navigation: menu, close, search, chevron, back, next, more, home, settings.
  - Actions and state: check, undo, play, stop, print, install, offline, sun (screen on).
  - Senses and media: eye, ear, headphones, mic, usb.
  - Notices and controls: tip, info, warning, erase, hold, knob-turn, external.
- Every step block and notice tone has its icon.
- Unicode glyph arrows and the default `<summary>` markers leave the UI.
- External links get visually hidden text "(opens in a new tab)".
- **The device schematic (P8)** is original line art in the same stroke style, with each control an element carrying `data-k`. It is labelled "Schematic · not to scale". It ships only after the owner checks every control's relative position on the unit and the trade-dress checklist passes.

### 6.7 Voice and microcopy

- **Grammar:** second person, imperative, present tense, British spelling as today ("practise", "synthesised"). One action per Do line, starting with a verb.
- **Controls** are written exactly as printed on the unit, always as keycaps. Pads are always group plus number (A1). Display values are always LCD chips.
- **Checks** state an observable fact: "You hear…", "The display shows `1.1.1`", "A1 lights…". Why is at most 2 sentences.
- **Provenance** ("the official guide says…", "owners report…") moves into Source.
- **Danger and caution copy** gives, in order: the consequence ("Clears every note of A1 and B1 in this pattern"), the check ("Hold MAIN: the display shows your BREAK scene number"), then the undo or "No undo".
- **Numbers always carry their noun:** Chapter 3, Part 2, Step 4 of 8, Project 7, pad A1, setting `401`.
- **Never** "just", "simply" or "easy". No taglines as H1s. No jokes near warnings.
- **Fixed wording:** button labels say what happens ("Done · Next", "Start Part 1", "Restart this chapter"). The per-step report link reads "This step doesn't match my K.O. II". The footer keeps "Report a wrong instruction" and "Not affiliated with or endorsed by teenage engineering".

### 6.8 Enforcement

- `src/css/tokens.css` is the only file allowed to contain hex colours. The build fails on any hex value elsewhere and on raw px in component CSS other than 0, 1, 1.5, 2 and 3px borders.
- A **token contrast matrix** (about 40 declared pairs, both themes) runs in the build: text ≥4.5:1, UI ≥3:1.
- A dev-only `/styleguide.html` (not linked, `noindex`, excluded from the deployed site) renders every component in light, dark and forced-colours at 390 and 1280px. **"axe 0 violations on the styleguide"** is the P1 exit gate, before pages adopt components.

---

## 7. Technical architecture

### 7.1 Stack and build decision

**Decision:**
- **Build:** a Python 3.12 **standard-library-only** generator (`tomllib`, `html`, `json`, `hashlib`, `gzip`, `http.server`).
- **Content:** TOML.
- **Components:** Python functions that return escaped HTML.
- **Runtime:** native ES modules with no framework or bundler.
- **Tests:** pytest, pytest-playwright and Playwright for Python, locked with hashes (§7.3).

**Reasons:**
1. The owner's machine has Python 3.12.10 with `tomllib` and no Node *(verified)*. Building and previewing then need no virtual environment at all: `python tools/build.py --serve`. Only the tests need one.
2. CI already runs Python before the tests, and `build_site.py` is already a standard-library validator, so the generator grows out of a working pipeline instead of replacing it.
3. TOML quotes every string. The content has thousands of "Check: …" colons that YAML would misparse, and `'''…'''` blocks keep long stage-1 prose editable.
4. ES modules plus static HTML keep the site working without JS and avoid a dependency tree.

**Rejected:**
- YAML + Jinja2 (A, B): nicer templates, but a virtual environment just to build, plus YAML pitfalls.
- Astro, 11ty or Vite: Node.
- No-build vanilla: the copy-paste registries would remain.

**TOML caveat.** Inline tables cannot span lines in TOML 1.0. Long `check` or `risk` values therefore use sub-tables (`[part.step.risk]`), which TOML attaches to the most recent `[[part.step]]`.

**Determinism.** The build writes no timestamps, writes JSON with sorted keys and walks files in sorted order. Two clean builds of one commit must be byte-identical, because verify-live rebuilds and hash-compares every file.

### 7.2 Content model

**`content/course.toml`** is the single registry. It generates the nav, prev/next links, eyebrows, heads, the README table snippet, sw.js and the test expectations.

```toml
[site]
base_url = "https://efosamark.github.io/koii-coach/"   # its path (/koii-coach/) is 404.html's <base href>
repo = "efosamark/koii-coach"
issue_template = "wrong-instruction.yml"
guide_base = "https://teenage.engineering/guides/ep-133/"

[release]
version = "2026.11.03"          # single source: sw.js VERSION, footer; build fails if != newest CHANGELOG heading
guide_checked = 2026-10-13
firmware = "OS 2.5.1"

[[chapter]]
id = "sampling"                 # = storage slug koii-coach-ch-sampling (frozen)
file = "sampling.html"          # public URL (frozen)
wrapper_id = "sampling"         # legacy <section class="steps"> id, kept as an alias
number = 3                      # display only; flips in P6
legacy_number = "07"            # "Formerly 07" chip + search alias for at least 90 days
title = "Sample, chop & resample"
short = "Sample"
minutes = [120, 180]
project = 7
min_os = "2.5"
engine = "steps"                # "passthrough" = still the hand-written page (P2-P4)
structured = false              # true once rewritten: content lint warnings become errors

[[tool]]
id = "help"
file = "help.html"
title = "Troubleshooting"
legacy_route = "index.html#help"
```

**`content/chapters/<id>.toml`** follows one schema for every chapter, including 01 and 02:

| Field | Required | Meaning |
|---|---|---|
| `summary`, `makes` | yes | Start-screen promise and "You will make" |
| `needs[]` | yes | Before you start rows (`{icon, text}`) |
| `safety[]` | — | Ids from `tools/safety.toml` shown on the start screen |
| `reentry` | — | Verified "Get back in" text (perform only until P7) |
| `reference[]` | — | `{type = "padplan"\|"songmap"\|"moves"\|"settings"\|"table", …}` |
| `[[part]]` `id`, `title`, `guides[]` | yes | `id` = anchor; existing ids kept |
| `[[part]]` `goal` | when `structured = true` | hiphop and tech-house have no "Goal:" lines today; P7 writes them under review |
| `[part.checkpoint]` `ask`, `[[part.checkpoint.fix]]` `{if, then, redo?}` | when `structured = true` | From today's Checkpoint / "If it doesn't" text |
| `[[part.step]]` `id` | yes | Frozen; unique within the chapter; recorded in `ids.lock` as `<chapter-id>/<step-id>` |
| `title` | yes | ≤48 characters (two lines at 360px) |
| `kind` | — | `step` (default) · `info` · `recap` · `checkpoint` (a tickable checkpoint step, counted in N of M; hiphop has 10) |
| `text` **or** `do[]` | yes | `text` = stage-1 verbatim prose; `do` = 1–3 moves, ≤26 words in total |
| `check` `{sense = "see"\|"hear", text, lcd?}` | with `do`, unless `kind = info` | ≤15 words |
| `why`, `stuck[]`, `source {guide, quote?, note?}` | — | Disclosures |
| `help[]` | — | Topic ids (never titles) |
| `os` | — | `"2.0"` \| `"2.5"`; required when the text mentions "OS 2." |
| `optional {group, consequence, required_by[]}` | — | `required_by` is linted: an optional step that a later chapter needs fails the build. The 20 chapter steps that begin with "Optional" are tagged at P4 conversion |
| `risk {kind, scope, preflight, undo \| no_undo = true}` | when a destructive pattern matches and a human confirms it | `kind`: `erase` (TRK/PTN clears, brief note erase; recoverable), `delete` (ERASE + SOUND; scene erase until shown recoverable), `overwrite` (crop); the last two are gated. preflight + consequence + `do` ≤40 words; undo ≤12. A step with `risk` must use `do`, never `text` |
| `setting` | — | e.g. `"400"`: renders the neutral SYSTEM SETTING tag |
| `widgets {place, pattern_rows}` | — | 01/02 runner and pattern strip |
| `carry[]` | — | Old ids merged into this step after a split |
| `primary_path[]` | with `do` | The ordered key tokens of the presses the learner must make, confirmed at conversion (§7.5) |
| `reviewed {on, guide, by, method, note}` | when the accuracy guard flags a change, and for every authored preflight or undo | `method = "device"` or `"guide-only"`. Guide-only shows "Checked against the guide; not re-walked on a factory-fresh unit" in Source |

**`content/tools/`** holds:
- `help.toml` (24 topics).
- `glossary.toml` (106 terms, with `beginner = true` flags).
- `learn.toml` (19 lessons; the 14 slug-derived ids are frozen explicitly).
- `controls.toml` (32 controls: id, label, kind, meaning per mode, schematic position from P8).
- `safety.toml` and `synonyms.toml`.

**`content/ids.lock`** lists every id ever published, in namespaces: `<chapter-id>/<step-id>`, `lesson/<id>`, `topic/<id>`, `term/<id>`. **`content/migrations.toml`** holds `split = {old = [new…]}` and `retired = {old = "reason"}` with the same namespaced keys. Storage, `data-step` and `#s-<id>` keep the bare id, because they are per page.

**Inline grammar.** These are the only markup forms allowed; the build validates and resolves them:
- `[MAIN]` tap · `[SHIFT+ERASE]` chord · `[HOLD SOUND]` hold · `[A1]` pad · `[A]` group · `[type 1 0 0]` digits on the pads · `[turn X down]` knob.
- `` `1.1.1` `` LCD readout · `**bold**`.
- References: `{ch:sampling}`, `{part:sampling/make-your-own-kit}`, `{step:song/song-break-clear}`, `{help:pad-silent}`, `{term:audition}`, `{guide:play-and-record}`, `{safety:delete-sample}`.

Key names are whitelisted from `controls.toml`, and an unknown key or a dangling reference fails the build. From P6, references render as names and links ("Chapter 3 · Build a drum kit"), so renumbering never touches prose. Until P6 they render as the legacy text they replaced (`{ch:sampling|07}` renders "07"), so stage-1 parity holds. The device highlights for a step are derived from its Do keycaps **in order**, so they can never disagree with the text, as today's chip bag does.

**Example step:** `song-break-clear` (course.js:51), rewritten. The precondition moves from If stuck to `preflight`, and the button sequence is unchanged.

```toml
[[part]]
id = "song-breakdown"
title = "Make the breakdown"
goal = "BREAK plays melody, snare and hats, with no kick and no bass."
guides = ["play-and-record"]

[[part.step]]
id = "song-break-clear"                      # frozen (ids.lock: song/song-break-clear)
title = "Clear kick and bass in BREAK"
do = [
  "Stopped, press [MAIN] and tap [A].",
  "[HOLD ERASE+A1] until `TRK` blinks, then release.",
  "Tap [B] and do the same with [B1].",
]
primary_path = ["MAIN", "A", "ERASE+A1", "B", "ERASE+B1"]
why = "A breakdown takes the heavy parts away so they hit harder when they return. Holding ERASE + a pad until TRK blinks clears every note of that pad in this pattern in one move."
stuck = [
  "A brief [ERASE] press clears one step only; it is the long hold that clears the whole track.",
]
help = ["erased-wrong-thing"]
source = { guide = "play-and-record" }
reviewed = { on = 2026-12-01, guide = "play-and-record", by = "owner", method = "device", note = "Precondition moved before the action; key order unchanged" }

[part.step.check]
sense = "hear"
text = "Press [PLAY]: melody, snare and hats, but no kick and no bass. Stop."

[part.step.risk]
kind = "erase"                                # recoverable: no gate, preflight shown first
scope = "Every note of A1 and B1 in this pattern"
preflight = "Hold [MAIN]: the display shows your BREAK scene number."
undo = "[SHIFT+B] while the umbrella icon is lit."
```

### 7.3 File layout

```
content/      course.toml · chapters/{setup,first-beat,song,sampling,perform,hiphop,tech-house,vocal-house}.toml
              tools/{help,glossary,learn,controls,safety,synonyms}.toml · ids.lock · migrations.toml
src/css/      tokens.css · base.css · components.css · player.css · layouts.css · forced-colors.css · print.css
              legacy-app.css   (adapter for the SPA's classes; P1 -> deleted in P5b)
src/js/       app.js (boot: migrations, SW, update toast) · progress.js · shell.js (bars, sheets, history, titles)
              player.js · list.js · search.js · report.js · wake.js · offline.js · home.js · settings.js
              placement.js · pattern.js · audio.js (today's scheduler, ported) · lab.js · device.js · learn.js
src/svg/      icons.svg · device.svg (P8)
src/fonts/    IBMPlexMono-SemiBold.subset.woff2 · OFL.txt
src/legacy/   index.html, setup.html … (hand-written pages, moved here in P2; build injects head/footer;
              each deleted as its chapter or view converts)
src/static/   manifest.webmanifest · icon.svg · icons/*.png
src/sw.template.js
tools/        build.py (build | --serve [--watch] | --check)
              koii/{content,markup,render,pages,searchindex,swgen,validate,lint,accuracy,contrast}.py
              convert/{coursejs_to_toml,chapter_html_to_toml,snapshot}.py   (one-off; deleted after P5b)
tests/        conftest.py · test_smoke.py · test_progress.py · test_urls.py · test_offline.py · test_player.py
              test_fold.py · test_search.py · test_content.py · test_a11y.py · test_visual.py
              fixtures/storage/*.json · golden/{content,urls}.json · visual/baseline/*.png · vendor/axe.min.js (sha256-pinned)
.github/scripts/build_site.py   (5-line wrapper -> tools/build.py, so docs, check_live.py and old tags keep working)
.github/scripts/check_live.py   (unchanged)
requirements-dev.in             (pytest, pytest-playwright, playwright, pillow)
requirements-dev.txt            (pip-compile --generate-hashes output: every transitive dependency,
                                 e.g. greenlet and pyee, pinned with hashes; installed with --require-hashes)
```

The output in `_site/` stays flat: the 17 pages plus `404.html`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `icons/*`, `search-index.<hash8>.json` and `assets/<name>.<hash8>.(css|js|svg|woff2)`. Generated HTML is never committed; Pages deploys the tested `_site` artifact, as today.

### 7.4 Renderer and runtime

**Renderer** (`tools/koii/render.py`). Each component is a function returning escaped HTML (`html.escape` on all text, then the markup pass). There are partials for the head (title, description, og:*, canonical from `base_url`, two theme-colors, manifest, icons), the app bar, sheets and the footer. The step markup:

```html
<li class="step" data-step="song-break-clear" id="s-song-break-clear" data-risk="erase">
  <article aria-labelledby="t-song-break-clear">
    <div class="step-head">
      <p class="step-pos">Step 2 of 3</p>
      <h3 id="t-song-break-clear" tabindex="-1"><span class="vh">Step 2 of 3: </span>Clear kick and bass in BREAK</h3>
      <a class="tag tag-caution" href="safety.html#erase-track">Clears tracks</a>
      <!-- label.check > input injected by list.js/player.js -->
    </div>
    <section class="preflight">…</section>
    <p class="consequence">…</p>
    <ol class="do"><li>Stopped, press <kbd class="key hot" data-k="MAIN">MAIN</kbd> …</li>…</ol>
    <p class="undo">…</p>
    <section class="check" data-sense="hear">…</section>
    <details class="why"><summary>Why</summary>…</details>
    <details class="stuck"><summary>Not working?</summary>…</details>
    <details class="source"><summary>Source</summary>… <a class="report" href="…">This step doesn't match my K.O. II</a></details>
  </article>
</li>
```

- **Headings:** chapter `<h1>`, part `<h2>` inside `<summary>`, step `<h3>`, with the step blocks labelled.
- **The step head is a `<div>`, and its position line is `.step-pos`.** That leaves exactly one `header .eyebrow` per chapter page, the strict-mode smoke contract, and the build checks it.
- **Per-step report link:** pre-fills the issue template fields `page`, `step` (namespaced id), `app-says` (Do + Check text), `firmware` and `guide`. The field ids are unchanged.

**Runtime:**
- Each page's HTML loads `assets/app.<hash>.js` and its own page module directly, with `modulepreload` for every import. There is **no lazy `import()`** of code, so a tab left open across a deploy never asks for a module that no longer exists. The search index is the only lazy fetch, and §7.6 keeps the previous release's copy. app.js runs the progress migrations, registers the service worker and shows the update toast.
- **player.js** only toggles `hidden` on the existing `<li>` elements and updates the step region. Nothing re-renders `<main>`, so there is no scroll jump and the device, sheet and audio state persist.
- **Accepted temporary state.** From P3 to P5b, three runtimes coexist: the SPA script, chapter.js / player.js, and progress.js. That is 42–54 focused days, about 14–18 weeks at 3 days a week. Four measures make it safe:
  - progress.js writes only through idempotent, guarded migrations.
  - In P3, the still hand-maintained chapter.js and old app are patched (§7.7, §9 P3).
  - Each id on index.html has one owner: the overlay uses `#site-search` / `#site-results`, and the shell reuses the app's `#toast` and `#offline`.
  - The new 01/02 pages are published unlinked until the flip.

### 7.5 Accuracy guard

The guard combines proposal C's ordered lock with proposal A's completeness check. It runs on every build against `tests/golden/content.json`, which P0 captures from today's rendered DOM, keyed by namespaced id.

**Golden covers every content block that holds key tokens:**
- Steps.
- Checkpoints and "If it doesn't" text.
- Notices, tables and reference cards (pad plans, settings tables).
- perform's "How every section starts".
- The 32 control explanations.
- Lessons, topics and terms.

The checks:

1. **Stage-1 parity.** For `text` steps, the rendered plain text must equal golden, character for character, apart from whitespace and the markup layer. Reference tokens render as the legacy text until P6, so they pass.
2. **Ordered key lock.** For rewritten steps, the ordered key tokens of `preflight + do` must equal the step's `primary_path`: the presses the learner must make, with conditionals ("if it doesn't…") and alternatives ("or tap…") excluded. The converter proposes `primary_path` from golden's action text (01/02: the Press field; chapters: the prose), and the owner confirms it in the conversion PR. Comparing against the whole prose would flag nearly every rewrite and turn review into a rubber stamp.
3. **Completeness.** The multiset of all key, digit and LCD tokens across every field of a block, conditionals included, must equal golden's. Text that moves is compared against its source block: symptom cards split from "If it doesn't", re-toned notices, and pad plans and tables moved to reference or the Cheat sheet.
4. **Splits.** A step split into several is compared as the concatenation of its parts in order (`carry[]` links them).
5. **Any difference** requires a `reviewed = {on, guide, by, method, note}` record. CI prints an old-vs-new diff per flagged block to the job summary. **Every authored risk preflight or undo requires `reviewed` with `method = "device"`,** even when no token changed.

A chapter is marked `structured = true` only after the owner's on-device walk-through on OS 2.5.1.

### 7.6 Service worker and offline

`sw.js` is generated from `src/sw.template.js` from P2. Before that it is edited by hand.

**Generated (P2):**
- `VERSION` comes from `course.toml`. The build fails if it differs from the newest CHANGELOG heading or the footer value.
- `ASSETS` is every file in `_site` except `sw.js`, about 40 files, so a forgotten precache entry is impossible.

**Kept exactly:**
- Path `./sw.js`, scope `./`, the `koii-coach-` cache prefix and old-cache cleanup.
- All-or-nothing install with `cache:'reload'`, then `skipWaiting` and `clients.claim`.
- Keys that ignore `?query` and `#hash`.
- The `{type:'koii-coach-status'}` message, which already returns `cached`/`total` and now drives the "Saving offline copy 64%" meter.
- Same-origin GET only.
- No third-party requests (the build fails on any `http(s)` `src` or stylesheet).

**Changed:**
- **P1 (by hand, before the generator exists):**
  - The `ASSETS` list gains `tokens.css`, `components.css`, `forced-colors.css`, `legacy-app.css`, `fonts/IBMPlexMono-SemiBold.subset.woff2` and the sprite, and loses `chapter.css`.
  - `VERSION` and `courseInfo.version` are bumped, with a CHANGELOG entry.
  - `build_site.py` `INCLUDE` gains `fonts/*.woff2`, and its precache check also covers `.woff2` and `.svg`. Today a missing font would pass silently and offline pages would lose the keycap face.
- **P2:**
  - CSS, JS, SVG, font and search-index files get content-hashed names, so GitHub Pages' 10-minute HTTP cache can never pair new HTML with stale CSS or JS.
  - Hashed files are served **cache-first**: they are immutable, and today's handler hands a network 404 straight to the page.
  - On activate, the new SW copies the previous cache's hashed entries into the new cache before deleting the old cache, and keeps them for one release (N−1). A phone left open for hours across a deploy still finds its modules and search index.
  - On `controllerchange`, a "Coach updated · Reload" toast appears.
  - The upgrade test covers this: open on release N, deploy N+1, then open search and play audio in the old tab.
- **P5a:**
  - The navigation fallback for an uncached URL becomes the cached `404.html` instead of a silent `index.html`. It carries the legacy mapper, search and the course list, and resolves through `<base href>` at any depth.
  - `./` and `./index.html` stay precached.
- **P8:**
  - HTML stays network-first, with the timeout cut from 3000 to 1500ms.
  - The 800ms timeout from proposal A is rejected.

**Wake lock and install** are local browser APIs. The font is self-hosted. Nothing calls home.

### 7.7 Progress migration

**Rules:**
- Existing key shapes never change.
- New data goes into new keys, all prefixed `koii-coach`, so the existing prefix-based export, import and reset cover them.
- Migrations are idempotent, run at boot on **every** page, and only create a target that is absent. **An existing `koii-coach-ch-*` record always wins over a legacy key.**
- **From P3, no code deletes a legacy key** until the P8 cleanup release. Today's chapter.js already removes a legacy key as soon as it migrates it (`if(save())legacy.forEach(k=>localStorage.removeItem(k))` *(verified)*). The P3 patch removes that line. Keys removed before P3 are already folded into their `ch-*` records.
- **One-time notices** go through `koii-coach-meta.notices` as `{chapter, text}`, whichever module migrated first. Without this, a migration run from Home would leave chapter.js nothing to report, and the dropped ticks would vanish unexplained. The patched chapter.js, and later the player, shows each notice once.
- **`koii-coach-prefs` holds settings, not progress.** Reset and Import keep it, along with the firmware choice.

| Old key and shape | New | Rule |
|---|---|---|
| `koii-coach-v2` `{schema:4, step, stepId, note, song, songId, view, done[lessonIds], firmware, finished, songFinished, lab}` | **Unchanged, permanently** the home of `firmware`, `lab`, `done` (Learn lessons) and `note` | `load()` rebuilds from `fresh()` and drops unknown fields *(verified)*, so **no new field ever goes into this key**. Settings writes `firmware` by read-modify-write of all 12 fields. Schema 2/3 migrations (`V2_FIRST`, `V2_LESSONS`) move verbatim into progress.js |
| `koii-coach-v2.stepId` / `step` / `finished` | `koii-coach-ch-first-beat` `{v:1, done, last, n, cur, at, derivedFrom}` | See "The 01/02 records" below the table |
| `koii-coach-v2.songId` / `song` / `songFinished` | `koii-coach-ch-song` | Same rule |
| (dual-write) | `koii-coach-v2` `step`, `stepId`, `song`, `songId`, `finished`, `songFinished`, `view:'first'` | Written on every 01/02 tick and move from P5b until the P8 cleanup release, and for at least 8 weeks. Each write also updates `derivedFrom`, so rolling back to the old app restores the exact position and re-derivation never loops |
| `koii-coach-ch-<slug>` `{v:1, done, last, n}` for setup, sampling, perform, hiphop, tech-house, vocal-house | Same key, same `v:1`, plus optional `cur` (current step id), `at` (ISO time), `skip[]` | chapter.js resets any record whose `v !== 1` and `store()` writes the whole object back *(verified)*. So `v` is never bumped, and old cached pages keep the new fields. From P3 the patched chapter.js writes `at` and `cur` (its resume target) on every tick |
| `koii-hiphop-vocal-checklist-v2` (position array) | `koii-coach-ch-hiphop` | Frozen id list from chapter.js `LEGACY.hiphop` (moved verbatim); ticks on ids that no longer exist add today's "This chapter was rewritten…" note to `meta.notices` |
| `koii-hiphop-checklist-v1` | — | Note only (today's behaviour) |
| `koii-tech-house-checklist-v1` | `koii-coach-ch-tech-house` | Frozen list `LEGACY['tech-house']` |
| `koii-thodorakis-club-checklist-v1` | `koii-coach-ch-vocal-house` | Frozen list `LEGACY['vocal-house']` |
| `koii-thodorakis-checklist-v1`, `koii-thodorakis-voice-checklist-v1` | — | Note only |
| — | `koii-coach-prefs` `{v:1, setup: null\|'new'\|'ready', wake:'auto'\|'off', keys:true, text:'default', modes:{}}` | New in P3. Settings: kept by Reset and Import; cleared only by "Reset settings" |
| — | `koii-coach-meta` `{v:1, notices:[], lastChapter, setupReason, checkpoints:{}}` | New in P3. `lastChapter` is written on every chapter-page and 01/02-view visit; `setupReason:'existing-progress'` records the one-time setup migration (§5.1) |
| — | `koii-coach-notes` `{v:1, values:{}}` | P8: scene and sample numbers typed in LCD-style inputs, shown in preflights and Get back in |
| Split or retired step ids | via `migrations.toml` | `done(old)` ⇒ `done(every new)`; `cur`/`last` pointing at an old id ⇒ the first new step; `#old` and `#s-old` fragments ⇒ the first new step; orphan ids stay in storage (rollback-safe) but are not counted |

**The 01/02 records.** For at least one release, the old app's `#first`/`#song` and the new `first-beat.html`/`song.html` are both live, and only the old app moves `koii-coach-v2`. These rules stop the two from drifting apart:
- P5a publishes the two new pages unlinked. They are not on Home, in the menu or in search, so only the owner's walk-through reaches them.
- From P5b, the record is derived on first load. It is derived again whenever `koii-coach-v2`'s `stepId` or `finished` differs from the record's `derivedFrom`, for example after a move in the old app or after a rollback.
- Derivation sets `done` to the union of the existing ticks and every 01 step id before `stepId` (all of them if `finished`), and `cur` to `stepId`.
- A one-time notice says the old dots counted position, so untick anything you skipped.

**Export and import:**
- The format `{app:'koii-coach', version:1, exported, data:{key: jsonString}}` and the file name `koii-coach-progress-YYYY-MM-DD.json` are unchanged.
- Import accepts old and new files, replaces the progress keys and then runs every migration.
- It keeps this browser's prefs and firmware choice. A file's prefs apply only when this browser has none.

**Reset all progress:**
- It confirms, then clears every `koii-coach*` key except prefs, plus the legacy keys.
- It keeps the firmware choice and prefs, and offers a 10s in-memory Undo.
- P3 patches the old app's `resetAll`/`importProgress` to the same behaviour. A rollback to `v1-final` still has the old behaviour. That is accepted, because prefs take seconds to set again.

### 7.8 Performance budget

Performance is not the problem today: 45 KB gzipped and a 19ms re-render. The budgets stop it becoming one. The build enforces them.

| Item | Budget |
|---|---|
| HTML per page (gzipped) | ≤35 KB (Chapter 7, 79 steps, is the largest) |
| CSS total | ≤16 KB gz |
| JS total, all modules | ≤30 KB gz; ≤25 KB executed on any page |
| Mono font | ≤18 KB |
| Icon sprite | ≤6 KB; device.svg ≤12 KB |
| Search index | ≤50 KB gz |
| Per page, excluding the font and search index | ≤60 KB gz (as built in 2026.10.14.19: Home and tools 33–42 KB; chapter pages 66–76 KB, checked at ≤80 KB until the player is split) |
| Precache total | ≤600 KB gz, about 40 files (plus the N−1 hashed carry-over) |
| Done · Next → next step painted | ≤100ms at 4× CPU throttle |
| Layout shift on a control-map or sheet tap | CLS 0 |

### 7.9 DOM contracts

**Kept** (same selector and meaning):
- Chapter pages: `body[data-chapter]`, `.steps ol>li[data-step]`, `.steps ol>li .check input`, `#progress-count` ("N of M done"), `#resume`, `#reset`, `#print`, `.chapters .prev/.next` (guided order).
- `header .eyebrow` (`^CHAPTER N /`, generated): exactly one per page, because steps use `.step-pos` in a `<div>`.
- Footer: `footer a[href*="wrong-instruction.yml"]`, the non-affiliation line, the `#offline` wording.
- 01/02 and tools: `#toast`, `#next`, `#previous`, `#note-next`, `#placement`, `[data-control]`, `#info`, `[data-lesson]`, `#complete`.
- Help and settings: `#search` and `#results`, on index.html#help until P5b and help.html after, with troubleshooting results as `<details>` under `h2.sub`. Also `#firmware`, `#version-note` and `.badge.ok/.warn`.
- Lab: `#beat` (64 buttons, `.on`, `aria-pressed`), `#recipe`, `#clear`, `#audio-play`.
- Home: `.card.start a[href="./setup.html"]`, shown for first run as defined in §5.1.

**Changed deliberately**, each in the same PR as its markup:
- `nav [data-view]` and hash views: gone in P5b, re-asserted as legacy-route redirects.
- `#step-title` focus: re-asserted as focus on `[aria-current=step] h3`.
- `nav a .num` and the eyebrow numbers: generated from `course.toml` (they change in P6).
- The SPA's dot index `[data-step]` (`index.html:71`), which clashes with chapter step ids, and which the old app binds wherever it appears (`$$('[data-step]').forEach(b=>b.onclick=()=>moveStep(…))` *(verified)*). P1 renames it to `data-dot`, together with its test line, so no shell element can trigger `moveStep(NaN)`. It is removed with the dots in P5b.
- The smoke chapter loop, from P4: in player mode a fresh visit shows the start screen, which hides every `<li>`. The loop therefore runs twice, at `<file>.html#all` (list mode) and at `<file>.html#s-<first id>` (player).
- On index.html from P3 to P5b, the shell overlay uses `#site-search` / `#site-results`, and the shell reuses the existing `#toast` and `#offline`. No id appears twice.

---

## 8. Testing and release

### 8.1 Tests (`tests/smoke.mjs` → pytest)

**P0** ports `smoke.mjs` line for line to `tests/test_smoke.py`. It keeps the same 1280×900 and 390×844 contexts, the same audio init-script instrumentation, the same `artifacts/results.json` shape and the same screenshots and traces. **Both suites run on the same commit and both must be green** before `smoke.mjs`, `setup-node` and the npm step are removed.
- Python Playwright is pinned to the same version as CI's `PLAYWRIGHT_VERSION` (1.64.0, if it is on PyPI; P0 checks, and the local scratch venv has 1.63.0).
- pytest-playwright provides `--browser-channel chrome`, so locally the tests use the installed Chrome and no browser download is needed.

The suite grows by phase:

| Test file | What it proves | From |
|---|---|---|
| `test_smoke.py` | Today's contracts; expectations (numbers, prev/next, slugs, eyebrows) generated from `course.toml` from P2; chapter loop in list and player mode from P4 | P0 |
| `test_progress.py` | Every storage fixture (v2 schema 2/3/4, finished/songFinished, firmware older/unknown, all six `ch` records, all six legacy keys, a v1 export file) shows the expected ticks and resume target on Home, in the menu and in the chapter. Also: export/import round trip; reset confirm and undo; **first run survives two reloads, and one setup tick turns it into Continue**; existing progress ⇒ `setup='ready'`; records without `at` resolve Continue through `lastChapter`; legacy keys survive a Home visit and the rewritten-chapter notice still appears; Reset and Import keep prefs (shortcuts off stays off); advancing in the old app after P5a gives first-beat.html the same position; the §5.13 states. **Rollback:** deploy tag `v1-final` against the migrated storage and assert identical ticks and positions | P0 → every phase |
| `test_urls.py` | Every row of `golden/urls.json` lands on the right h1/text, typed in, followed from links, and offline; includes the six wrapper ids, `#help/<topic-id>` and unknown `#s-` ids | P0 |
| `test_offline.py` | SW installs; `#offline` sentence; offline navigation to every page, three legacy hashes, a stub and 404 (including a 3-level-deep unknown path, online and offline); the font and sprite precached (P1); **old-SW → new-SW upgrade without a blank or mixed-version page, and an old tab still loads its hashed files after a deploy** | P0 (upgrade tests P2) |
| `test_content.py` | Schema, namespaced `ids.lock` (unique within each chapter), references, the accuracy guard (§7.5), risk lint (destructive pattern ⇒ confirmed `risk` or explicit `risk_reviewed = false-positive`; a `risk` step uses `do`), budget lint (warning until `structured`), bare chapter-number lint (from P4), one h1, one `header .eyebrow`, unique titles, internal `#fragment` links resolve | P2 |
| `test_player.py` | Done · Next goes to the next step **in order** and focuses the step h3; `replaceState` fragment and title; resume after reload; `cur` moves only on Done · Next and Back; Back closes a sheet with scroll and step kept; keyboard shortcuts, the off switch and **each excluded focus context** (links, buttons, summary, form fields, tabs, radiogroup, grid, listbox, open dialog); wake lock requested and released (stubbed); the irreversible gate collapses Do until confirmed; optional skip and M; `#done` with unticked steps does not auto-tick the recap; OS badges driven by `#firmware` in every chapter | P4 |
| `test_fold.py` | **At 390×844 and 360×740, minus a 34px safe-area inset:** standard steps show Do, Check and Done · Next; risk steps show the preflight through the last Do move, plus the cue when the Check is below. **At 844×390:** the first Do move and Done · Next (every Do move from P8). Applies to 100% of `do` steps; stage-1 steps are exempt; ≥90% at the P8 "Larger" size | P4 |
| `test_search.py` | "turntable", "time-stretch", "sidechain", "vocal" hit chapter steps; "hat" does not match "that"; legacy "07" alias (≥90 days after P6); works offline, and says so when the index is not cached; a step result opens a preview, not a navigation | P3 |
| `test_a11y.py` | Vendored axe (sha256-pinned, test-only) on every template in light and dark: no serious or critical violations. Forced-colours screenshots of meter, ticks, pattern and lit controls. **Tab presses from step h3 to Done · Next = the step's focusables + 3**, with no stray stops. **At 320×256:** fixed chrome ≤25% of the height, and no focused element obscured (2.4.11). Lab grid and control map keyboard models | P1 → P8 |
| `test_visual.py` | Screenshot comparison (§8.4) | P1 |

### 8.2 `build_site.py` → `tools/build.py`

`.github/scripts/build_site.py` becomes a 5-line wrapper (`python3 .github/scripts/build_site.py _site` keeps working).

**Kept checks:** required files, size floors (generated legacy stubs exempted by name), manifest JSON and icons, every local `href`/`src` resolves, head has manifest, apple-touch-icon, description and theme-color, precache completeness (now true by construction, but still verified for every file type).

**Added checks:**
- TOML schema; namespaced `ids.lock` (unique within a chapter; a removed id without a `migrations.toml` entry fails).
- References and keycap names resolve; fragments resolve; legacy wrapper ids present.
- Risk lint; budget lint; accuracy guard; bare chapter-number lint (`\b(00|01|02|07|08|09|10|11)\b` in prose must be a token or on a reviewed allowlist, from P4).
- Hex and raw-px lint; token contrast matrix.
- VERSION = `course.toml` = newest CHANGELOG heading.
- Two theme-color metas per page; exactly one `header .eyebrow` per chapter page; no third-party runtime URLs.
- Per-page and precache weight budgets; search index covers every step id.
- Deterministic output: a second build into a temp folder must match byte for byte.

### 8.3 `deploy.yml`

**Precondition, checked once in P0:** Settings → Pages → Source is "GitHub Actions". The README warns that otherwise `main` is published raw, and P2's move of the sources into `src/` would then take the site down.

The test job becomes:
1. `actions/setup-python` (SHA-pinned), Python 3.12.
2. `pip install --require-hashes -r requirements-dev.txt`.
3. Cache `~/.cache/ms-playwright`, then `python -m playwright install --with-deps chromium`.
4. `python tools/build.py _site`.
5. Serve `_site` on 127.0.0.1:8080.
6. `python -m pytest`.
7. Write the run summary in Python (same text format as today).
8. Upload `artifacts/`.
9. **On pull requests, also upload `_site.zip`**, so the owner can preview any PR locally with `python -m http.server`.

The other jobs:
- `setup-node`, `npm install playwright`, `node --check` and the Node summary script are removed after the P0 parallel run. A JS syntax error now surfaces as a `pageerror` failure.
- The deploy job is unchanged.
- **verify-live** also runs `actions/setup-python` with the same pin, because it rebuilds `_site` and hash-compares it with the live site.
- **Rollback input.** `workflow_dispatch` gains an input `ref`, a release tag. With it, the workflow checks out that tag, runs that tag's own `build_site.py`, deploys, and runs verify-live against the same tag. Browser tests are skipped for a tag: it passed them when it shipped, and old tags need Node.
- Dependabot gains a `pip` ecosystem entry next to `github-actions`.

### 8.4 Visual regression

`test_visual.py` takes screenshots of the styleguide and of Home, a chapter start screen, a standard, erase, irreversible and placement step, the menu and Tools sheets, search, a tool page, Settings and 404. Viewports: 390×844, 360×740, 844×390 and 1280×900. Modes: light, dark and forced-colours (emulated). About 60 images.

- Baselines are generated **in CI on Linux Chrome** (fonts differ on Windows) and committed under `tests/visual/baseline/`.
- A diff above 0.2% of pixels fails, with the diff images in the artifact.
- Baselines are refreshed with a `workflow_dispatch` input (`update_visual: true`) that uploads new baselines for the owner to commit.
- Locally, the visual test is skipped unless `--visual` is passed.

### 8.5 Manual device checklist (before each release from P4)

- [ ] **Unit preparation:** before each walk, back up projects 6–9 with the official EP sample tool and clear the ones the chapter uses; restore afterwards.
- [ ] iPhone Safari and the installed home-screen app; Android Chrome and the installed app (both themes).
- [ ] Phone propped about 50 cm away: every step of the changed chapter is readable without picking the phone up; Done · Next is reachable by thumb; no structured step needs scrolling in portrait; in landscape the first move and Next are visible.
- [ ] The screen stays on through a 10-minute step; it releases after 15 idle minutes; the toggle works.
- [ ] Phone Back closes sheets, then leaves the chapter with the step saved; Continue on Home lands on that step.
- [ ] Airplane mode after one full visit: Home, a chapter, a tool page, search and 404 all open.
- [ ] Old install updated in place: progress carried over, no duplicate app icon, no blank page; a tab left open across the deploy shows the update toast and still searches.
- [ ] Every risk step of the changed chapter walked **on the K.O. II on OS 2.5.1** (preflight true, keys correct, undo works where claimed).
- [ ] Set-up steps the owner's used unit cannot reproduce (factory demos in projects 1–5, the OS update flow) are marked `method = "guide-only"` with the visible note, not claimed as walked.
- [ ] TalkBack or VoiceOver: complete one part (heading navigation, step position announced, sheets announce and return focus).
- [ ] Keyboard only on desktop: complete one part; shortcuts off switch works.
- [ ] Print all steps (desktop Chrome): all parts open, no shell.
- [ ] Windows High Contrast: lit keys, current step and done state visible.

### 8.6 Release and rollback

- Before P1, the current site is tagged `v1-final`, and P0 rehearses a rollback to it once.
- **Every PR that deploys follows the release checklist:**
  - Bump VERSION: in sw.js and `courseInfo.version` by hand until P2, then in `course.toml`.
  - Add a CHANGELOG entry and update the guide-checked date.
  - After the deploy, tag `v<VERSION>`.
- Every phase merges to `main` and deploys. There are no long-lived branches, and content fixes always go to the one live source:
  - **Before a chapter converts,** edits go to its HTML.
  - **During its conversion PR** (1–2 days), the converter re-runs from `main` before merge, and the parity test catches drift.
  - **After conversion,** edits go to TOML.
- **Rollback** means running the workflow with the previous tag as `ref` (§8.3). Pages artifacts expire after a day and cannot be redeployed, so rollback rebuilds from the tag. The kept key shapes, the dual-write and the kept legacy keys make it lossless, as `test_progress.py` proves.
- **Transition windows are time-based,** and each is stated only here:
  - The "Formerly 07" chip and the "07" search alias: at least 90 days after P6.
  - The 01/02 dual-write: at least 8 weeks after P5b, and until the P8 cleanup release, whichever is later.
  - Legacy keys: kept until that same cleanup release.

---

## 9. Roadmap

The skeleton is proposal C's strangler sequence. The learner-critical work from proposal A is pulled forward:
- The mono keycap and LCD vocabulary ships in P1.
- Chapter 0 and every risk step are rewritten in P4.
- The renumber comes in P6 rather than last.
- The editorial rewrite comes in P7 rather than after the polish.

**Every phase is independently shippable.** Sizes are focused working days for one owner with AI help. Owner device time is listed separately.

### P0 · Safety net, baseline and rollback — S/M, 4–5 days

- **Deliverables:**
  - `test_smoke.py` (line-for-line port) running alongside `smoke.mjs` on one commit.
  - `requirements-dev.in` plus `requirements-dev.txt` (from `pip-compile --generate-hashes`, transitive dependencies included), with pytest-playwright.
  - A README section "Run the tests on Windows".
  - `golden/content.json`: every content block with key tokens (§7.5), including 404 steps, checkpoints, "If it doesn't", notices, tables, reference cards and the 32 control explanations, plus 19 lessons, 24 topics and 106 terms. It maps each namespaced id to normalised text and ordered key tokens.
  - `golden/urls.json`, including the six wrapper ids.
  - `fixtures/storage/*` captured by driving today's site.
  - Namespaced `ids.lock`.
  - The 14 slug-derived lesson ids written explicitly into `course.js` `manual[i][4].id` (same values).
  - A version-sync check in `build_site.py`, and the release checklist (§8.6).
  - The `workflow_dispatch` `ref` rollback input.
  - Confirm that the Pages source is "GitHub Actions".
  - Tag `v1-final` and rehearse a rollback to it.
- **Exit:**
  - Both suites green in CI and on the owner's machine (Python only), and the goldens reproducible.
  - **Behaviour-identical**: the `lessonIds` array and every saved key are equal; only course.js, VERSION and CHANGELOG differ.
  - The rollback rehearsed, and Node removed.

### P1 · One look everywhere — M, 7–9 days

- **Deliverables:**
  - `tokens.css`, `components.css` and `forced-colors.css` loaded on every page, plus the dev-only styleguide; the inline `<style>` in index.html and `chapter.css` deleted; `legacy-app.css` maps the SPA's classes onto the tokens.
  - Plex Mono for the existing key chips, eyebrows and display text.
  - About 25 chapter notices hand-tagged tip/info/caution/danger. Reset and Print restyled as danger-outline and secondary.
  - **Release plumbing by hand** (no generator yet), as listed under P1 in §7.6: the sw.js `ASSETS` list and VERSION, `courseInfo.version` and CHANGELOG, and the `build_site.py` `INCLUDE` and precache-check changes.
  - **Phone:**
    - The 12-tile nav collapses into a 56px bar with a "Chapters" disclosure (`data-view` and `.num` kept inside).
    - Progress dots become a non-interactive "Step 8 of 22" meter under 600px. A "Steps" disclosure of 48px rows that call `moveStep` (current step marked, no done marks) keeps a way to jump. The dot attribute becomes `data-dot`.
    - "Start again" gets confirm plus undo.
  - Sticky chapter bar: e2 elevation, `scroll-padding` with the safe area, static at `max-height:480px`.
  - The read-only target grid is styled as non-interactive; dark state fills reach ≥3:1; 65ch measure; styled ranges, checkboxes and chevrons; icon sprite; two theme-color metas.
- **Exit:**
  - Every P0 test passes, with only the dot selector renamed in the same PR.
  - The contrast matrix passes in both themes.
  - No instructional text under 14px in `<main>` at 390px, and the phone header ≤56px.
  - Forced-colours screenshots show dots, hits and hot controls, and axe reports 0 violations on the styleguide.
  - The offline test passes with the font and sprite precached.
  - The owner signs off the screenshot matrix.

### P2 · One source of truth, one build — M, 6–8 days

- **Precondition:** the Pages source is "GitHub Actions" (checked in P0).
- **Deliverables:**
  - `tools/build.py` (`--serve`, `--watch`, `--check`); `build_site.py` wrapper; deterministic output (§7.1).
  - `course.toml`; 01/02 and tool content converted to TOML, with the build emitting `course.js` in exactly today's tuple shape. This is about 1 day of throwaway that ends the double editing now.
  - Legacy pages moved to `src/legacy/` with generated head and footer regions (prev/next, report link, legal line, version, `#offline`), so the 30 hard-coded hosts are gone.
  - Generated `sw.js`; hashed asset names served cache-first with the N−1 carry-forward; the "Coach updated · Reload" toast; no lazy `import()`; the upgrade tests; the `ids.lock` check; the reference resolver; the lint scaffold.
- **Exit:**
  - The generated `course.js` evaluates to JSON identical to P1's for every global.
  - The normalised DOM of every page equals P1's, apart from head order and hashed names.
  - Two clean builds are byte-identical.
  - Deploy and `check_live.py` pass with the pinned Python.
  - The old-tab-across-deploy test passes.
  - The owner previews with one command.

### P3 · One shell, Home, search, Settings — L, 11–14 days

- **Deliverables:**
  - App bar, menu sheet (Course with LED states and x/N; unnumbered Tools; Settings; offline meter; Install) and footer on every page.
  - `progress.js` running all migrations on every page, with first run defined by content, the one-time existing-progress migration and the Continue fallback for records without `at` (§5.1).
  - **Home** as the default view of index.html (Welcome / Continue, course list, device projects, Tools tiles); unknown hashes go Home.
  - `koii-coach-prefs` and `koii-coach-meta`; `document.title` per view and lesson; focus to h1; `pushState` for lessons and topics with scroll restore.
  - **Patches to code that is still hand-maintained:**
    - chapter.js writes `at` and `cur` on every tick (`v:1` kept) and writes `meta.lastChapter`. It stops deleting legacy keys and shows `meta.notices`.
    - The old app writes `meta.lastChapter` on 01/02 visits, keeps prefs in `resetAll`/`importProgress` and routes `#help/<topic-id>` to that topic.
  - One owner per id on index.html (§7.9).
  - `search-index.json` (built from TOML plus the parsed legacy chapter HTML) and the search overlay with previews.
  - `settings.html` (OS, Keep screen on, shortcuts, progress, offline, about); wake lock on chapter pages and the 01/02 views.
  - Every "see help “…”" in chapter prose linked to `index.html#help/<topic-id>`.
- **Exit:**
  - `/` tests are updated in the same PR: h1 is Home, and `.card.start` shows for first-run learners.
  - Fresh profile, reload twice: Welcome still shows. Tick one setup step: Continue appears.
  - Existing-progress fixtures land on their own chapter, not Chapter 0.
  - Legacy keys survive a Home visit, and the notice appears on the chapter page.
  - Reset keeps shortcuts off.
  - Every storage fixture shows correct x/N on Home and in the menu.
  - Search tests pass, and Back from a lesson returns to the list.
  - axe is clean on the shell in both themes.

### P4 · One step engine for Chapter 0 and 07–11 — L, 18–24 days, 7 PRs, plus about 6.5 h owner device time

- **Deliverables:**
  - **P4a (setup, verbatim):**
    - `chapter_html_to_toml.py`; the renderer; `player.js` and `list.js` replacing chapter.js on that page (same key and record, plus `cur`/`at`/`skip`).
    - Start screen; action bar; menu "This chapter"; Tools sheet "For this step"; part checkpoints; chapter complete; All steps toggle; per-step report links.
    - h2 parts and h3 steps (step head without `<header>`); `#s-` anchors.
    - Short-viewport layout; the §5.13 states; smoke chapter loop in both modes.
  - **P4b (setup, rewritten):**
    - All 36 steps to `do`/`check` within the step budget, with risk tags confirmed by hand. `structured = true`.
    - Owner walk-through on the unit, about 1.5 h plus preparation and restore.
    - Steps the used unit cannot reproduce are marked `guide-only`.
  - **P4c–g:** sampling, perform (with its verified "Get back in"), hiphop, tech-house, thodorakis-house, in that order.
    - Stage-1 verbatim prose inside the Step component for steps with no risk. Inline "Check:" sentences split out. Unambiguous keycap and LCD markup; single letters and digits listed for manual review.
    - **All destructive-pattern matches hand-classified at conversion** (erase / delete / overwrite / setting / false positive), using the §5.4 taxonomy.
    - **Every confirmed risk step** (about 20–30 across 07–11) **rewritten to structured do/check with the preflight first**, under the accuracy guard. Each chapter gets a device walk of about 1 h from a prepared backup state.
    - hiphop's 10 tickable checkpoint steps become `kind = "checkpoint"`, keeping their ids. Goals and part checkpoints stay optional until P7. The 20 "Optional" steps are tagged with optional groups.
    - Typed chapter and section references become tokens that render as the legacy text until P6. The converter lists every bare two-digit chapter mention for manual tokenising, and the lint holds the line from here on.
    - The six wrapper ids are kept as aliases.
  - Until each PR lands, the other chapter pages pass through with the P3 shell.
- **Exit, per chapter:**
  - Rendered-text parity for stage-1 steps.
  - The key lock passes against the confirmed `primary_path` for every rewritten step, with `reviewed` records (`method = "device"` for risk text).
  - `ids.lock` unchanged, and every storage fixture for that chapter shows the same ticks and resume target.
  - No-JS shows every step numbered.
  - The returning learner's resume step has its first Do move in the first viewport.
  - axe clean; the Tab formula holds; the fold test passes for every `do` step.
  - For 00: the owner completes Chapter 0 with the phone propped beside the unit, without scrolling on any step and without the screen locking.

### P5 · Retire the single-page app — L, 13–16 days

- **P5a (publish unlinked, alongside the SPA):**
  - `first-beat.html` and `song.html` from TOML, reachable by URL but not linked from Home, the menu or search:
    - Fields reordered Do → Check → Why → Not working → Source.
    - Instructions moved out of Hear and If stuck.
    - Recaps as `kind = recap`.
    - Optional procedures hidden in If stuck promoted to optional steps.
    - 01 grouped into named parts, and 02 into its six existing section groups.
  - The bass decision (decision 3) implemented with `required_by`. The known out-of-order safety cases fixed: 01 #16 trim crop, 02 #16 `song-break-clear`.
  - Position runner, pattern strip and Hear it.
  - The 01/02 record derivation with `derivedFrom` (§7.7), exercised by the owner's walk-through only.
  - `learn.html`, `controls.html` (fixed-height `#info`, no `scrollIntoView`, radiogroup), `lab.html` (port), `help.html`, `glossary.html`, `cheat-sheet.html` (from every chapter's recap and reference blocks), `safety.html`, and `404.html` with `<base href>`.
  - Owner walk-through of 01/02, about 2.5 h.
- **P5b (flip, one release later):**
  - The index.html head shim for the six hashes and `#help/<topic-id>`; index.html becomes static Home; Home, the menu and search switch to the new pages.
  - The 01/02 records derive on first load, and the dual-write starts.
  - `course.js`, the 47 KB inline script and `legacy-app.css` deleted.
  - Tests regenerated.
- **Exit:**
  - `test_urls.py` passes typed, followed and offline, including 404 three levels deep.
  - v2 schema 2/3/4 fixtures show the same 01/02 position. A move in the old app after P5a gives first-beat.html the same position.
  - Reverting P5b on a test branch restores the exact old position.
  - All 8 chapters and every tool readable without JS.
  - Every page ≤60 KB gzipped.
  - The fold test passes for 100% of 01/02 steps at 390×844 and 360×740 (with the inset).

### P6 · Renumber in teaching order — S, 1–2 days (if decision 1 = yes)

- **Deliverables:**
  - `number` values in `course.toml` → 0–7, so the reference tokens now render names.
  - "Formerly 07" chips and the search alias (§8.6 window).
  - The `wrong-instruction.yml` examples ("00 Start here", "06 Help & reference") and the README table updated.
  - A CHANGELOG note. Tests regenerate.
- **Exit:** the bare-number lint reports nothing outside its allowlist; URL and storage tests unchanged and green.

### P7 · Rewrite chapters 07–11 for the glance budget — L, 16–20 days + 12–15 h owner device time

- **Deliverables:** one PR and one release per chapter, in order sampling → perform → hiphop → tech-house → vocal house.
  - Each remaining stage-1 step becomes `do`/`check`/`why`/`stuck`/`source`, at most 3 moves and one Check. The risk steps were already done in P4.
  - About 60–90 splits of long steps (123 are over 60 words today), each with `carry[]` and a `migrations.toml` entry.
  - Part goals and checkpoints are written under review where missing (all of hiphop and tech-house). Checkpoints become symptom cards. "Get back in" blocks are added where the owner verifies them on the unit. Pad plans and quick references move into the Cheat sheet.
  - Each chapter's `guide_checked` is updated after re-reading the official guide.
- **Exit, per chapter:**
  - Lint errors 0 and `structured = true`.
  - Key lock clean, or every difference reviewed.
  - The fold test passes for 100% of steps.
  - Migration fixtures show the same "N of M done" after splits.
  - Every risk step re-walked on the unit.

### P8 · Device schematic, landscape, practice widgets, handover — M/L, 8–10 days

Independent of content, so it can interleave with P7 releases.

- **Deliverables:**
  - `device.svg`: original line art, positions checked by the owner (about 1 h), trade-dress checklist.
  - Lit controls numbered in press order and the expected LCD readout.
  - Landscape two-column player and the desktop right panel.
  - Lab rebuild (4×4 per instrument, steppers, `role=grid`, column playhead).
  - `koii-coach-notes` inputs, the "Larger" text size and a left-handed action-bar option.
  - The HTML network timeout cut to 1500ms (§7.6).
  - Cleanup release, within the §8.6 windows: stop the `koii-coach-v2` dual-write and remove the already-migrated legacy keys. Old export files still import.
  - `CONTRIBUTING.md`: markup, budgets, risk tags, primary paths, splitting with migrations, device verification.
- **Exit:**
  - The owner confirms every control position.
  - At 844×390, every structured step shows all its Do moves, Next and the lit device without scrolling.
  - Forced-colours screenshots show lit keys, cells and done.
  - A full part completed keyboard-only and with a screen reader.
  - The owner adds, splits and publishes a step without help.

**Timeline at a glance** (focused days, before contingency):

| Phase | Cumulative days | What learners see |
|---|---|---|
| P0 | 4–5 | No visible change |
| P1 | 11–14 | One look, a 56px header, safe colours |
| P2 | 17–22 | Updates announce themselves ("Coach updated · Reload") |
| P3 | 28–36 | Home with Continue, search over everything, Settings |
| P4b | 35–45 | Chapter 0 rewritten in the new player |
| P4 complete | 46–60 | Every chapter page in the player; every risk step in safe order |
| P5b | 59–76 | The SPA is gone; 01/02 are on the engine |
| P6 | 60–78 | Teaching-order numbers |
| P7 | 76–98 | Every step meets the glance budget |
| P8 | 84–108 | Schematic, landscape and the rebuilt lab |

**Totals.**
- The phases sum to 84–108 focused days. Plan on **about 95–115** with a 10–15% contingency for review loops and device re-walks.
- **Owner device time is 25–35 hours:**
  - P4: about 6.5 h.
  - P5a: about 2.5 h.
  - P7: 12–15 h.
  - P8: about 1 h.
  - Backup, clear and restore around each walk: about 4–6 h.
  - Re-walks after splits.
- **Windows**, at the owner's pace (decision 18; the figures below assume 3 focused days a week):
  - The three-runtime coexistence (P3 to P5b) lasts 42–54 focused days, about 14–18 weeks.
  - Each chapter stays stage-1, for steps with no risk only, for about 26–38 focused days, about 9–13 weeks, between its P4 conversion and its P7 release.

---

## 10. Risks and mitigations

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| **A rewrite changes a button sequence or OS claim** | Medium / severe | The accuracy guard over every content block (§7.5: ordered lock against a confirmed primary path + completeness + split concatenation); dated `reviewed` records, device-checked for every risk text; CI diff in the job summary; owner walk-through on OS 2.5.1 before `structured = true`; per-step "This step doesn't match my K.O. II" link; one chapter per release |
| **A migration loses or inflates ticks** | Low / severe | Fixtures captured from today's site, run in every phase; existing records win; `koii-coach-v2` and `v:1` shapes never change; chapter.js stops deleting legacy keys in P3; first run defined by content; existing learners migrated to `setup='ready'`; P5a pages unlinked, with `derivedFrom` re-derivation; dual-write for the §8.6 window; the `v1-final` rollback test; one-time notices through `meta` |
| 01/02 position-to-ticks migration inherits false "done" from mis-tapped dots | Medium / low | Accepted, and stated in the one-time note; ticks are now individually untickable |
| **Offline install breaks** (one missing file fails all-or-nothing) | Low / high | Hand-maintained ASSETS and an extended precache check in P1; ASSETS generated from the output from P2; `test_offline.py` plus the upgrade tests |
| **A tab left open across a deploy asks for files that no longer exist** (the main use case: a propped phone, open for hours) | Medium / medium | No lazy `import()`; hashed files cache-first with the N−1 carry-forward from P2; the update toast from P2; the old-tab test |
| GitHub Pages' 10-minute cache pairs new HTML with stale CSS or JS | Medium / medium | Content-hashed asset names from P2 |
| **Shared links and bookmarks break** | Low / medium | Every file name kept; the hash shim; part and wrapper ids kept; `#help/<topic-id>` mapped; 404 with `<base href>` at any depth; URL inventory tested online and offline |
| **A bad release cannot be undone** | Low / high | Every release tagged; the `ref` rollback input rebuilds a tag; rehearsed in P0 |
| Three runtimes coexist during P3–P5b and drift | Medium / medium | One progress module; the P3 patches to chapter.js and the old app; one owner per id; P5a published unlinked; P5 split into a publish step and a flip step. The window is 42–54 focused days, stated honestly rather than time-boxed |
| Converter mis-parses chapter prose (hiphop uses checkpoint `<li>` steps, hiphop and tech-house have no goal lines, 20 ids repeat across chapters) | Medium / medium | Rendered-text parity test; `kind = "checkpoint"`; goals optional until `structured`; ids namespaced per chapter; conservative keycap markup (unambiguous names only; single letters and digits reviewed); per-chapter PRs |
| Risk regex over- or under-matches (SHIFT + SOUND opens SOUND EDIT; settings use SHIFT + ERASE) | High / medium | Every match hand-classified at conversion; `false-positive` is an explicit value; the irreversible gate only on `delete`/`overwrite`. That is about 6 steps by proposal A's count, mostly crops (no step tells the learner to press ERASE + SOUND, which appears only in warnings), plus the scene erase until its undo is verified |
| Over-gating teaches click-through | Medium / medium | The gate applies only to irreversible presses; recoverable erases get ordering, not a gate; settings get a neutral tag |
| Stage-1 prose steps in 07–11 overflow the fold until P7 | Certain / medium | Accepted for about 26–38 focused days per chapter, and only for steps with no risk. The card scrolls under the fixed bar with a "more below" fade; keycaps and the Check split apply anyway; Chapter 0, 01/02 and every risk step are rewritten first |
| The tighter step budget raises the step count from 404 to about 480–520, so there are more taps | Certain / low | ≤3 moves per step keeps each tap meaningful; recap steps; All steps mode for reading ahead |
| **Effort overruns again** | Medium / medium | Ranges re-estimated with contingency; the owner sets the weekly pace (decision 18); after P4 the product is unified, and every later phase is optional and incremental |
| Renumbering confuses returning learners and forum posts | Medium / low | Unchanged files and slugs; "Formerly 07" chips and the search alias for at least 90 days; generated cross-references; owner veto (decision 1) costs nothing, since numbers live only in `course.toml` |
| iOS quirks (`<dialog>`, `100dvh`, safe areas; wake lock in installed web apps was unreliable before iOS 18.4) | Medium / medium | Feature detection; the toggle hidden when unsupported; the 34px safe-area allowance in the fold test; real-device checks before each release |
| Schematic is wrong about positions or drifts toward trade dress | Medium / high | Original line art; owner verification on the unit; the trade-dress checklist; "Schematic · not to scale" label; today's map stays until all checks pass |
| One maintainer runs out of time mid-way | Medium / medium | After P4 the product is already unified, and every later phase is optional and incremental; P7 ships chapter by chapter |
| Python and Playwright drift from the Node behaviour | Low / low | The P0 parallel run on one commit before Node is removed |
| Shortcuts conflict with links, widgets or assistive tech | Low / medium | Step shortcuts fire only from body, main or the step h3; never inside controls, composite widgets or open dialogs; letters can be switched off |
| New dev dependencies (pytest, pytest-playwright, playwright, pillow) | Low / low | Test-only, every transitive dependency hash-locked with pip-compile, `--require-hashes`, Dependabot pip; nothing reaches the published site; the build itself has none |

---

## 11. Decisions the owner needs to make

Each has a recommended default. If you say nothing, the default applies.

| # | Decision | Recommended default |
|---|---|---|
| 1 | Renumber the course in teaching order on screen | **Yes: Chapter 0–7, flipped in P6** once all references are tokens; files and slugs unchanged; "Formerly 07" for at least 90 days |
| 2 | Rename `thodorakis-house.html` | **No: keep the file as canonical** and call the chapter "Vocal house" everywhere visible. A `vocal-house.html` alias can come later if wanted |
| 3 | Chapter 1's "optional" bass (steps 14–16), which Chapter 2 requires | **Make it required** in 01, and add `required_by` lint so this cannot recur |
| 4 | Content format | **TOML + standard-library build** (no virtual environment to build). Alternative: YAML + Jinja2 (nicer templates, adds pinned dependencies) |
| 5 | What gets a blocking confirm gate | **Only irreversible presses** (delete a sample, crop or overwrite, and the scene erase until a device walk proves SHIFT + B restores it). Track and pattern clears get the fixed order (check first, undo after) without a gate. Settings get a neutral tag |
| 6 | Screen wake lock | **On automatically after the first Done tap**, with a 15-minute idle release and a toggle |
| 7 | Default chapter presentation | **Player on every device**, with "All steps" one tap away and remembered per chapter |
| 8 | Mono typeface for keycaps and LCD | **IBM Plex Mono SemiBold** (OFL, about 15 KB subset). Alternative: JetBrains Mono |
| 9 | Letter keyboard shortcuts | **On, with an off switch in Settings** |
| 10 | Tools set | **Keep Learn and Rhythm lab as tools**, alongside Control map, Troubleshooting, Glossary, Cheat sheet and Safety |
| 11 | Destination names | **"Set up your K.O. II"** (not "Start here"), **"Troubleshooting"** (not "Help & reference"), **"Learn"** (not "The friendly manual"), **"Control map"**, **"Cheat sheet"**, group label **"Tools"** |
| 12 | Editorial order | **00 and every risk step in P4, then 01/02 in P5a, then 07 → 08 → 09 → 10 → 11 in P7**, each with a fresh read of the official guide |
| 13 | Device verification capacity | **The owner, about 25–35 hours across phases**, including backup and restore around each walk. A second tester with a unit on OS 2.5.1, ideally a factory-fresh one for Chapter 0, would halve P7's calendar time and remove the guide-only set-up steps |
| 14 | Who draws the schematic | **AI-drafted SVG from the owner's own measurements and photos (photos never shipped), verified by the owner**; ship only after verification |
| 15 | Visual-regression baselines | **Committed, generated in CI on Linux**, refreshed through a workflow input |
| 16 | When to remove the dual-write and legacy keys | **At least 8 weeks after P5b, and not before the P8 cleanup release** |
| 17 | Store learners' scene and sample numbers | **Yes, in P8** (`koii-coach-notes`), with paper still working. Alternative: paper only |
| 18 | Working pace | **Plan at 3 focused days a week** (about 32–38 calendar weeks in total). State the real figure, and the calendar windows in §9 are re-derived from it |

---

## 12. Out of scope

- Accounts, sync, analytics or telemetry of any kind; anything that needs a server.
- New chapters or new teaching content beyond restructuring, splitting and verifying existing steps (part goals and checkpoints written in P7 under review are the only exception).
- Path-based URLs (`/course/<ch>/<lesson>/`), B's 75 lesson pages, per-chapter print pages and tracks as a navigation layer (tracks may appear only as a visual grouping on the course map later).
- A bottom tab bar on hub pages.
- A manual theme switch (the system preference only; the hooks exist).
- Manifest shortcuts, "recently opened" lists, recent searches, and public styleguide, about or search pages.
- Swipe-to-advance, auto-advance and gamification beyond the completion screens (no streaks, no confetti).
- Translations and localisation.
- Any device connection (WebMIDI, WebUSB) or detection of the OS version (the guide documents no way to show it on the unit).
- Factory K.O. II samples in the browser: practice audio stays synthesised.
- A framework, bundler or Node toolchain.
- A performance project beyond the build-enforced budgets.
- Any teenage engineering typefaces, photos, faceplate artwork or colourways.

---

## 13. Traceability

### 13.1 Critical and major findings

| Finding | Sev. | Resolved in | How |
|---|---|---|---|
| visual-two-systems | crit | §6.8, §7.3 · P1 | One `tokens.css` + `components.css` on every page; inline styles and `chapter.css` deleted; hex lint |
| visual-step-anatomy | crit | §5.3–5.4, §6.4 · P4, P5a, P7 | One Step component: 24px Do with keycaps, Check block with LCD, folded disclosures, 48px tick; `li[data-step]` and `.check input` kept |
| visual-type-scale | major | §6.1 · P1, P4 | 6 sizes, 3 weights, 14px floor, 24px Do |
| visual-measure | major | §6.1, §5.5 · P1 | 65ch cap; desktop width goes to rails, not lines |
| visual-orange-overload | major | §6.2, principle 4 · P1 | One meaning per colour; orange = hardware only; no orange text |
| visual-danger-undifferentiated | major | §6.4 Notice, §5.4 · P1, P4 | Four notice tones; red = irreversible only; Reset = danger outline; scroll-padding under bars |
| visual-dark-flat | major | §6.2 · P1 | Dark ramp 1.17 / 1.21 / 1.32 + 1.95 borders; every token re-tuned; lime glare gone; dark theme-color |
| visual-header-nav | major | §4.5 · P1, P3 | 56px app bar; menu sheet with Course vs Tools |
| visual-progress | major | §6.4 Progress, §5.1, §5.6 · P1, P3, P4 | One language: chapter meter, part pips, course rows, Continue card |
| visual-no-imagery | major | §5.4, §5.11, §6.6 · P5a, P8 | Pattern strip, pad-grid diagrams, then the original schematic with lit controls and the expected readout |
| visual-keycaps | major | §6.4 Keycap / LCD, §7.2 grammar · P1, P4, P5a | Mono font in P1; `<kbd class=key>` / `<samp class=lcd>` markup in every converted chapter |
| visual-buttons | major | §6.4 Button · P1 | One set (primary, secondary, ghost, danger), ≥48px, one radius, one primary per view, dashed disabled |
| ia-two-shells | crit | §4.5, §7.4 · P3, P5b | One shell on every page; SPA retired |
| ia-no-home | crit | §5.1 · P3 | Home with Continue, chapters, durations, project plan; `/` never restores a view |
| ia-numbering-order | crit | §4.2 · P3, P6 | Tools unnumbered in P3; Chapter 0–7 in P6 |
| ia-numbering-collisions | major | §4.2, §7.2 references · P4, P5a, P6 | Named parts, never lettered; one form per number; generated cross-reference links; bare-number lint |
| ia-nav-flat-heavy | major | §4.5 · P1, P3 | Sticky 56px bar, grouped menu sheet, search one tap away |
| ia-landing-fold | major | §5.1, §5.3 · P3, P4 | One primary per view; step Do in the first viewport; the no-op "Start from step 1" removed |
| ia-start-card-one-shot | major | §5.1 · P3 | First run defined by progress content, not key existence; Chapter 0 stays the Continue target until done or `prefs.setup='ready'`; existing learners migrated to `ready` once |
| ia-progress-fragmented | major | §5.1, §5.6, §7.7 · P3, P4, P5a | One id-based model; x/N everywhere; every entry deep-links to the resume step |
| ia-resume-buried | major | §5.2, §5.10 · P3, P4 | Continue opens the player at `cur` (with a fallback for older records); resume banner in list mode; prerequisites collapsed |
| ia-chapter-no-toc | major | §5.2, §5.6, §7.4 · P4 | Parts list on the start screen and in the menu; h2 parts; `#part` and `#s-step` anchors; wrapper ids kept |
| ia-prevnext-buried | major | §5.9, §4.5 · P4 | Chapter complete screen with Next CTA; course complete; rel=prev/next kept |
| ia-urls-deeplinks | major | §4.3, §4.8 · P3, P4, P5 | Step, part, lesson and topic URLs (`#help/<topic-id>` from P3); unique titles. **Partly by design:** flat files plus fragments, not path URLs (no redirects on Pages) |
| ia-back-button | major | §4.8 · P3, P4 | pushState for lessons, topics and sheets; Back closes the sheet first |
| ia-search-scope | major | §4.7 · P3 | Offline index over every step, topic, term, lesson and move; word-boundary matching; deep links |
| ia-help-junk-drawer | major | §4.1, §5.12 · P3, P5a | Settings page; separate Troubleshooting, Glossary, all-chapter Cheat sheet, Safety |
| flow-two-products | crit | §5.3, §7.4 · P4, P5 | One data-driven player for all 8 chapters |
| flow-wall-steps | crit | §7.2 budgets, §7.5 · P4b, P5a, P7 | ≤3 moves, ≤26 words, one ≤15-word Check, sized to the 360×740 fold; lint becomes strict per chapter |
| flow-destructive-buried | crit | §5.4, principle 2 · P4, P5a | Every hand-confirmed risk step rewritten to structured do/check, preflight first, at its chapter's P4 conversion (not left as stage-1 prose); irreversible gate; taxonomy corrected (SND = delete; scene erase added); known cases fixed (01 #16 and 02 #16 in P5a, 11 `check-or-clear-patterns` in P4g) |
| flow-next-offscreen | major | §5.3 · P4, P5a | Fixed 56px Done · Next in the thumb zone; arrow-key shortcuts |
| flow-companions-far | major | §5.4 (e) · P5a | Runner, pattern strip and device highlight inside the step; the second "next" removed |
| flow-glanceability | major | §6.1 · P1, P4 | 24px Do, 20px Check, 28px LCD readouts |
| flow-no-wakelock | major | §5.3 · P3, P4 | Wake lock with toggle, re-acquire and idle release |
| flow-key-chips | major | §6.4, §7.2 · P4, P5a | Ordered keycaps derived from Do; one pad naming (A1); hold, chord and type modifiers |
| flow-field-order | major | §7.2, §6.7 · P5a, P4b, P7 | Do → Check → Why / Not working / Source; every required press in Do; recaps as their own kind |
| flow-resume | major | §5.1, §7.7 · P3 | Continue card as the PWA start screen; opens at `cur`; `at`/`cur` written by chapter.js from P3 |
| flow-progress-model | major | §7.7, §5.6 · P1, P5a | Ticks by id everywhere; no position-as-done; restart behind confirm and undo |
| flow-optional-misleading | major | §5.3, §7.2 `optional.required_by` · P4, P5a | Skip with stated consequence; bass made required (decision 3); the 20 "Optional" chapter steps tagged in P4 |
| flow-completion | major | §5.9 · P4 | Part checkpoints with symptom fixes; chapter and course complete screens; no false "done" with steps unticked |
| flow-chapter-preamble | major | §5.2 · P4 | One-screen start with Before you start; safety summary shown once and recalled on risk steps |
| flow-chapter-movement | major | §4.5, §4.6 · P3, P4 | Course vs Tools; persistent chapter bar; Tools and Troubleshooting as a sheet over the step |
| mobile-step-loop-scattered | crit | §5.3–5.4 · P4, P5a | One-screen step deck; companions inline; fixed action bar |
| mobile-progress-dots-and-restart | major | §5.6, §5.3 · P1, P5a | P1: non-interactive meter plus a "Steps" disclosure of 48px rows (`data-dot` rename); menu step rows later; restart confirm and undo |
| mobile-nav-header | major | §4.5 · P1, P3 | Shared 56px bar and menu sheet on every page |
| mobile-controls-map-jumps | major | §5.11 · P5a, P8 | Fixed-height info panel, no `scrollIntoView`; P8 relative-position schematic. **Partly by design:** not a to-scale silhouette, to stay clear of trade dress |
| mobile-readonly-grid-looks-tappable | major | §5.4 (e) · P1, P5a | Styled as non-interactive in P1; a read-only `<table>` with no button chrome in P5a |
| mobile-lab-grid-ergonomics | major | §5.11 · P8 | 4×4 per instrument, about 76×64px cells, column playhead, steppers |
| mobile-landscape | major | §5.5 · P4, P8 | Short-viewport layout (static 40px bar, 48px action row) and a first-move gate in P4; device and card split in P8 |
| mobile-chapter-pages | major | §5.2–5.3 · P4 | The same player; ticking advances; Continue first |
| mobile-no-wake-lock | major | §5.3 · P3, P4 | As flow-no-wakelock |
| mobile-back-loses-place | major | §4.8 · P3, P4 | pushState plus scroll restore; lookups as sheets |
| mobile-glanceability | major | §6.1, §6.4 LCD · P1, P4 | 28px display-style tokens for positions, pads and BPM |
| a11y-spa-route-silent | major | §4.8 · P3, P5b | Per-view and per-step titles; focus to h1 or h3; static pages after P5b |
| a11y-keyboard-tab-burden | major | §5.3, §8.1 · P4, P5a, P8 | DOM order = reading order; Tab presses from h3 to Done · Next = step focusables + 3, asserted with no stray stops; Enter/→ from the h3; dots removed; radiogroup control map; `role=grid` lab |
| a11y-forced-colors-state-loss | major | §6.2 forced colours · P1 | `@media (forced-colors)` rules; real elements; outlines plus glyphs |
| a11y-dark-state-contrast | major | §6.2 · P1 | Dark state fills ≥3:1 (key on s3 4.61, meter 5.49); glyph cues |
| a11y-headings-structure | major | §7.4 · P4, P5a | h2 inside summary for parts; h3 steps; labelled step blocks; one h1 first |
| a11y-focus-obscured-sticky-bar | major | §6.3 · P1, P4 | `scroll-padding` including the safe area; static app bar and 48px action row under `max-height:480px`, so fixed chrome ≤25% at 400% zoom; tested at 320×256 |
| a11y-step-player-sr | major | §5.3, §5.4 (e) · P4, P5a | Position in the heading; live regions cut to one short line; pattern as a table plus a text list; keycaps in lists |
| a11y-history-and-urls | major | §4.8 · P4, P5 | Every step and lesson has a URL; lessons and sheets push history. **By design:** steps use `replaceState`, so Back leaves the chapter instead of walking back through 79 steps |
| arch-two-products | crit | §7.1, §7.4 · P2–P5 | One schema, one renderer, one runtime |
| arch-step-schema | crit | §7.2 · P4, P5a, P7 | Named required fields; lint from warnings to errors per chapter |
| arch-registries | major | §7.2 `course.toml`, references · P2 | Nav, prev/next, eyebrows, sw.js and tests generated; references resolved |
| arch-js-only-content | major | §7.4, §5.10 · P5 | Every chapter and tool is static HTML; JS only enhances |
| arch-tuple-data | major | §7.2 · P2, P5b | TOML named fields; explicit lesson and topic ids; `course.js` gone in P5b |
| arch-monolith-renderer | major | §7.4 · P4, P5b | ES modules; step-region updates only |
| arch-two-css | major | §6.8 · P1 | One token and component set |
| arch-progress-model | major | §7.7 · P3, P5a | One progress module; settings separated from progress; firmware badges and optional handling in every chapter |
| arch-report-anchors | major | §7.4 · P4, P5a | Pre-filled per-step report; part and step anchors; h2 parts |
| arch-search-scope | major | §4.7 · P3 | Build-time index over all content |
| arch-tests-contract | major | §8.1, §8.3 · P0 | Python pytest port, parallel run, manifest-generated expectations; dot attribute renamed in P1; strict-locator contracts preserved |

### 13.2 Minor findings

| Finding | Resolved in | How (or why not) |
|---|---|---|
| visual-no-scales | §6.3 · P1 | 4px spacing, 3 radii, 3 weights; raw-px lint |
| visual-native-controls | §6.4 · P1 | Styled range, tick toggles, SVG chevrons, `font: inherit` |
| visual-brand | §6.1, §6.6 · P1, P8 | Plex Mono identity, keycap and LCD vocabulary, LED states, original schematic; no TE trade dress |
| visual-iconography | §6.6 · P1 | 24px `currentColor` sprite; glyph arrows removed |
| ia-tools-overlap | §4.6 · P3, P5a | Control map as a step-aware sheet; Learn ↔ chapter cross-links; Rhythm lab linked from 01/02 |
| ia-labels-mismatch | §4.2 · P3 | One canonical name per destination; taglines become subtitles |
| flow-checkpoint-inconsistency | §5.9 · P4, P7 | One checkpoint component with symptom cards; checkpoint steps as `kind = "checkpoint"` |
| flow-onboarding-friction | §5.1 · P3 | One-question welcome; no dead button |
| mobile-tap-target-triage | §6.4 · P1 | Fix the real offenders (dots, lab cells, sliders, back link, stacked guide links); inline prose links left as they are |
| mobile-offline-install-invisible | §5.6, §5.12 · P3 | Offline chip and saving meter; "Offline copy incomplete · Retry"; Install entry plus an iOS hint |
| mobile-sw-network-timeout | §7.6 · P2, P8 | Hashed assets cache-first from P2; HTML timeout 1500ms in P8 |
| mobile-perf-not-the-problem | §7.8 | No performance project; budgets plus step-region updates only |
| a11y-no-js-core-missing | §5.10 · P5 | Static 01/02 and tools; no contradictory "Loading…" |
| a11y-zoom-reflow-header | §4.5, §6.3 · P1 | Compact bar; static under `max-height:480px`; no mid-word breaks; nothing hidden by orientation |
| a11y-touch-targets-minimum | §6.4 · P1, P4 | ≥44px everywhere, 56px for primary actions |
| a11y-widget-semantics | §5.11, §6.4 · P5a, P8 | Radiogroup; selection ≠ focus; short lesson names; `aria-valuetext` |
| a11y-ephemeral-errors | §5.12 · P3 | InlineAlert `role=alert`, persistent; toasts only for confirmations |
| a11y-continue-marker-and-checks | §5.10, §6.4 Tick · P4 | Visible "You are here" plus `aria-current="step"`; tick names include the step title; focus ring on light surfaces only |
| a11y-nav-semantics-help | §4.5 · P3 | Two labelled lists; Troubleshooting reachable the same way everywhere; "(opens in a new tab)" text |
| arch-sw-manual | §7.6 · P1, P2 | Hand-checked precache for every file type in P1; generated ASSETS and VERSION from P2 |
| arch-head-duplication | §7.4 · P2 | Generated heads and footers; host in one config |
| arch-legacy-names | §4.2 · decision 2 | **Partly:** the visible name is unified as "Vocal house"; the file stays `thodorakis-house.html` for URL stability; an alias is optional later |

### 13.3 Grafted and rejected ideas from the judges

**Grafted:**
- B's welcome wording.
- B and C's erase / overwrite risk taxonomy with a caution tier.
- C's ordered key lock (combined with A's split rule, and run against a confirmed primary path).
- C's All steps toggle.
- C's hashed assets and SW upgrade test.
- C's P5a/P5b sequencing.
- B's Safety page, styleguide gate, keyboard Tab test, `v1-final` rollback test, offline saving meter, glossary underline, `required_by`, PR `_site.zip` and storage-blocked notice.
- B and C's 404.
- C's per-step report label and fragment check.
- A's migrations semantics, fold test at three viewports, no swipe, 15-minute wake-lock release, "For this step" Tools sheet, search preview, "Formerly 07" chip, budgeted device time, and the "complete Chapter 1 propped up" exit gate (extended to Chapter 0 and every rewritten chapter).

**Rejected:**
- B's 75 lesson pages, directory URLs, tab bar and track navigation; B's disabled-Next gate.
- A's red SYSTEM SETTINGS tag and gates on routine entries; A's 10-day big-bang Release 1; A's sentence-splitting of legacy prose into moves; A's unverified "Get back in" text; A's 800ms timeout without hashing.
- C's "next unticked step"; C's 21px Do and 40px part strip; C's late renumber, late rewrite and late mono typeface.
- Deleting `smoke.mjs` in the same PR as its port.
- Unremovable letter shortcuts.
- The "Mine is ready / not on OS 2.5.1" question that assumes the learner knows their OS version.

---

## Appendix: Review notes

I re-checked every factual claim in the critique against the repo before applying it. All of these hold:
- 20 step ids shared across hiphop, tech-house and vocal house.
- chapter.js deletes legacy keys after migrating them.
- `setView()` calls `save()` on every load.
- The strict `header .eyebrow`, `#results details` and `h2.sub` "Troubleshooting" assertions in smoke.mjs.
- `resetAll` and `importProgress` wipe every `koii-coach*` key except firmware.
- The `[data-step]` → `moveStep` binding.
- build_site.py's INCLUDE list and its `.html`/`.js`/`.css`-only precache check; `./chapter.css` in sw.js ASSETS.
- verify-live using the runner's system `python3`.
- The six wrapper ids.
- 0 "Goal:" lines in hiphop and tech-house, 10 `check-*` steps in hiphop, and 20 "Optional" steps.
- The 5 bare `./index.html#help` links.
- The issue-template examples.
- setup.html first shipping in 2026.10.13.2.

I also re-ran `agents/completeness/fold_mock.py` and got the same overflows. All other critique items were applied as written. These were changed or partly declined:

1. **Tab budget.** The critique's "in-step links + 5" undercounts. The tick, three disclosure summaries, Back and Tools all come before Done · Next, so the formula is "the step's focusables + 3" (7 on a plain step), asserted exactly rather than as a ceiling.
2. **Risk-step fold.** The critique counted risk text against the standard Do budget and also let the Check fall below the fold. These conflict. I gave risk steps their own 40-word budget (preflight + consequence + Do) and gated the preflight through the last Do move. My own mock (`agents/editor/fold2.py`) confirms both budgets: standard at 613/634 and risk Do at 546/634 at 360×740, and the landscape first move at 192/342.
3. **Lazy loading.** Of the two options offered, I chose cache-first hashed files with an N−1 carry-forward and no lazy `import()`, rather than loading every module and the search index at boot. Under network-first HTML, boot-loading the index would cost a fetch on every page.
4. **P5a split-brain.** I chose option (a), unlinked pages, and added a union merge on re-derivation so ticks made on the new page are never overwritten.
5. **Rollback.** Browser tests are not re-run for a tag, because `v1-final` needs Node. The rollback runs the tag's own `build_site.py`. Raising `retention-days` is unnecessary once rollback rebuilds from a tag.
6. **Estimates.** The critique's phase ranges sum to about 82–104 days, not its quoted 95–115. With the scope added here, the phases sum to 84–108. I kept 95–115 as the figure with contingency and stated both.
7. **SND.** Confirmed, and sharper than the critique said: no chapter step contains "until SND" at all. D8's "19" is 18 TRK plus 1 PTN.
8. **Scene erase.** Its undo is unverified, so it is gated as `delete` until the P4 device walk shows otherwise.
9. **A v1-final rollback still wipes prefs on Reset.** A tag cannot be patched, so this is accepted as minor.
10. **Part-checkpoint answers** moved from prefs to meta, so Reset clears them while keeping settings. This is a consequence of separating prefs from progress.
