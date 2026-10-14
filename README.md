# K.O. II Coach

An unofficial, beginner-friendly course for the teenage engineering EP-133 K.O. II. It is made to sit on your phone next to the device: each step says what to press, what you should see or hear, and what to check before you move on.

**Open the app:** https://efosamark.github.io/koii-coach/

This is a personal fork of [leonardovitolowork-hash/koii-coach](https://github.com/leonardovitolowork-hash/koii-coach), the original K.O. II Coach.

[![Test and deploy](https://github.com/efosamark/koii-coach/actions/workflows/deploy.yml/badge.svg)](https://github.com/efosamark/koii-coach/actions/workflows/deploy.yml)

> Unofficial. Not affiliated with or endorsed by teenage engineering. EP-133 and K.O. II are trademarks of teenage engineering.

## What's inside

The course is written for a K.O. II on **OS 2.5.1**, the newest release (3 July 2026), starting from a new unit.

| | Chapter | What you do there |
|---|---|---|
| 0 | Set up your K.O. II | Get a new unit ready: switch it on, read the screen and the button combos, update to OS 2.5.1, back it up with the official EP sample tool, choose an empty project and tour the factory sounds. |
| 1 | First beat | Build a short drum and bass loop one step at a time, with the target rhythm, a placement helper that walks you through each position, and the rhythm to listen to. |
| 2 | Make it a song | Add a melody, make variations with scenes, and arrange them in the song list. |
| 3 | Sample, chop & resample | Record with the built-in mic, build a drum kit from your voice, sample a phone over a cable or USB, then trim, reverse, chop and resample. |
| 4 | Play & perform | Play live: record with feel, KEYS basslines in a scale, note repeat and the arpeggiator, punch-in FX, fader moves, live scene changes, sidechain and recording your performance. |
| 5 | Full hip-hop beat | Rebuild the Chapter 1 beat in a fresh project, sample a short sung phrase from USB audio, a line source or the mic, and arrange 64 bars with a six-position song list. |
| 6 | Tech house | A 128 BPM track with four-on-the-floor drums, a bassline that ducks under the kick, your own vocal hook, two drops, a breakdown and a build: 112 bars in song mode. |
| 7 | Vocal house | A 4-minute, 128 BPM house track built around five short vocal samples you record or upload yourself: 32 song positions, 128 bars. |

**Suggested order:** 0 to 7. Until release 2026.10.14.4 the chapters were numbered 00, 01, 02 and 07 to 11; each renumbered chapter still shows its old number ("Formerly 07") for a while, and search finds it by that number. Files and saved progress did not change. Each chapter opens in the step player: one step at a time, large enough to read with the phone propped beside the K.O. II, with Done · Next under your thumb and Tools beside it (the step's keys on the control map, its fixes and its words). "All steps" shows the whole chapter as a list, for reading ahead or printing. Each chapter ends with a link to the next one in this order. With a keyboard: → or Enter for Done · Next, ← Back, T Tools, / search, M menu, ? the list (Settings can switch the letter keys off).

**Tools** you can open any time, from the menu or Home: **Learn** (short lessons on the main functions), **Control map** (tap a control to see what it does), **Rhythm lab** (try drum patterns on a grid in the browser), **Troubleshooting** (symptom-first answers, with their own search), **Glossary**, **Cheat sheet** (the moves and reference tables of every chapter, and the system settings), **Safety and erasing** (every action that erases or overwrites something, and its undo) and **Settings** (your OS version, keeping the screen on, larger step text, Done · Next on the left for left hands, your progress file). The search button in the app bar searches every step, lesson, help topic and word.

**Projects on the device:** a new K.O. II has factory sounds in projects 1–5, and projects 6–9 are empty. The course uses project 6 for Chapters 1, 2 and 4, project 7 for Chapter 3, project 8 for Chapter 5, and project 9 as a scratch project in Chapter 0 and then for Chapter 6. That uses all four empty projects, so chapter 11 shows how to back up and reuse one.

**Before you start:** if your K.O. II runs an older OS, update it first (Chapter 0 shows how). Some steps can erase or overwrite things on the device, and the app warns you at those steps. Never switch the K.O. II on while holding SHIFT + ERASE unless you really mean to format it: that erases all your work and the factory sounds, and the official guide says factory sounds can't be recovered. Back up with the official EP sample tool first. If the device ever behaves differently from the app, follow the [official guide](https://teenage.engineering/guides/ep-133) and [report the step](#report-a-wrong-instruction).

Other things to know:

- The practice sounds in the app are made by your browser. They are not the device's factory sounds.
- The control map is a diagram to help you find things, not an exact picture of the device.
- Rhythm and mix choices in the lessons are suggestions. Change them to taste.
- There is no hardware connection, account, analytics or tracking. Nothing is sent anywhere.

## Progress and privacy

Your progress is saved only in this browser on this device: the ticked steps and your place in every chapter, the lessons you marked, your Rhythm lab pattern and your settings (browser storage keys starting with `koii-coach`). Progress from older versions of the coach carries over, including your place in Chapters 1 and 2 from before they had their own pages. Clearing your browser data erases it. It never changes anything on your EP-133. To move progress to another browser or keep a copy, use **Save progress file** in **Settings**. **Reset all progress** there asks before it clears anything, and keeps your settings and OS choice.

## Offline and home screen

After the first complete visit, every page of the coach works without internet, and Home's footer says so ("Offline ready"). An address that isn't part of the coach shows a "Page not found" page with the course and the tools, online and offline. The service worker (`sw.js`) asks the network first so you get the latest lessons. If the network is offline, or has not answered within 3 seconds, the saved copy opens instead. Links to the official guide and other websites still need internet.

You can add the coach to your phone's home screen from the browser's share or menu button. It has proper icons for iPhone and Android.

## Report a wrong instruction

If a step doesn't match what your EP-133 does, please [open a "Wrong instruction" report](https://github.com/efosamark/koii-coach/issues/new?template=wrong-instruction.yml). Every page has the same link in its footer. The form asks for the page, the step, what the app says, what the device did, and your firmware version. You need a free GitHub account to send it. Reports from people with the device in front of them are the best way to keep the course correct.

## Accuracy

The instructions follow the [official EP-133 guide](https://teenage.engineering/guides/ep-133). They were last checked against it on **13 October 2026**, when the guide was marked "ver 2.5". The guide's [What's new](https://teenage.engineering/guides/ep-133/whats-new) page describes OS 2.0 to 2.5. OS 2.5.1 (3 July 2026) is listed only on the [official downloads page](https://teenage.engineering/downloads/ep-133), as a bug-fix release, so the course treats it as OS 2.5. Settings shows the check date (from `site.js`), and [CHANGELOG.md](CHANGELOG.md) records it for each release. Steps that need a newer OS than the one you choose in Settings show a "Needs OS …+" badge.

Where the guide is silent or unclear, for example about what the display shows at a certain moment, the lesson says so and tells you to check your display instead of guessing. Not every step has been tried on a real device. If you find a difference, the official guide is right, and a report helps everyone.

## Testing

Every push to `main`, every pull request into `main` and every manual run start the **Test and deploy** workflow (`.github/workflows/deploy.yml`):

1. `.github/scripts/build_site.py` copies only the app files into `_site/` and checks them. It fails if a file is missing or looks like placeholder text. It also fails if a page links to a file that isn't there, if `sw.js` precaches a missing file (one missing file stops offline install), if a page isn't precached, or if the release version in `sw.js`, `site.js` and `CHANGELOG.md` differs.
2. `tests/test_smoke.py` (pytest and Playwright for Python) opens the `_site/` copy in Chromium on a local server, at desktop and 390 px phone width. It fails on any JavaScript error, console error or failed request. It checks that:
   - Home shows the set-up question on a first visit (also after reloads) and a Continue card that opens the right step once you have progress, with the right chapter numbers in the menu;
   - Chapter 1 runs in the step player, writes your place back for older versions, and its placement helper and "Hear this recipe" work (moving on stops the sound);
   - every old address of the retired single-page app (`index.html#first`, `#song/<step>`, `#manual/<lesson>`, `#help/<topic>`, `#controls`, `#lab`, `#settings`) opens its new page, and any other hash opens Home;
   - every tool page loads; the control map explains a control and works with arrow keys; a lesson can be marked as tried and Back closes it; Troubleshooting search filters the topics; the OS choice in Settings changes the "Needs OS" badges; the Rhythm lab grid and its practice sounds work;
   - the service worker installs and Home reports that every page is available offline; Reset asks first, keeps your settings and can be undone;
   - each chapter page (Chapters 0 to 7) opens on its start screen, shows its chapter number, the footer report link and the right previous and next links (the test clicks them), keeps a ticked step after a reload, steps forward and back in the player, and doesn't scroll sideways at 390 px; search finds chapter steps (shown as a preview first) and help topics (opened in place).
3. `tests/test_progress.py` checks that saved progress carries over: a place in Chapter 1 saved by older versions (schema 2 and 4, finished or not) becomes ticks and the step to continue at, moves are written back to the old key, and a progress file loads with your settings kept.
4. `tests/test_player.py` checks that in every chapter a step's "Before you press" comes before the press and its undo and check after it, and, in the browser: skipping a run of optional steps (and undoing it), a part's checkpoint ("Not quite" and Redo, which never change a tick), the chapter-complete screen ticking the recap, the Tools sheet (keys in press order, every tab, T, a help link in a step), the menu's "This chapter" jump, the keyboard shortcuts with their off switch, and the Larger text and left-hand settings.

**Not tested automatically:** real EP-133 hardware, how the sounds sound, Safari on iPhone, offline use on a real phone, saving the progress file (loading one is tested), and the live site (the workflow leaves `LIVE_URL` empty; set it to test a deployed copy as well).

To run the same checks on your computer you only need Python 3 (no Node.js). On Windows, from the repository folder:

```sh
python .github/scripts/build_site.py _site
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements-dev.txt
.venv\Scripts\python -m pytest --browser-channel chrome
```

`--browser-channel chrome` uses the Google Chrome you already have. To use Playwright's own Chromium instead, run `.venv\Scripts\python -m playwright install chromium` once and leave the option out. On macOS or Linux, use `python3` and `.venv/bin/python`. The test serves `_site/` itself; set `LOCAL_URL` to test a copy that is already being served. Rebuild `_site/` after you change a file.

Screenshots, traces and `artifacts/results.json` are written to `artifacts/`. In GitHub Actions they are attached to each run as the `coach-browser-evidence` artifact, and a short result appears in the run summary. Results are no longer committed to the repository.

## Deploying (for the repository owner)

A push to `main` goes live only after the tests pass:

1. **test** builds `_site/` and runs all the checks above.
2. **deploy** (`needs: test`) publishes exactly that tested `_site/` folder with `actions/upload-pages-artifact` and `actions/deploy-pages`. README, tests and `.github/` are not published.
3. **verify-live** then checks that the live site serves the same files. It runs after the deploy and only reports. A red result here means "look at the live site". It never blocks a fix from going out.

Pull requests run only the **test** job. If a test fails, nothing is deployed and the live site keeps the last good version. To undo a release that went out, revert its commit on `main` and push; the workflow tests and deploys the reverted version.

**One-time settings (required):**

0. **In a fork:** open the **Actions** tab and enable workflows (GitHub turns them off in new forks), and turn on **Settings > General > Features > Issues** so the report links work.
1. **Settings > Pages > Build and deployment > Source: GitHub Actions.** Until you change this, GitHub keeps publishing the whole `main` branch directly, with no test step.
2. **Protect `main`:** in Settings > Rules > Rulesets (or Settings > Branches), add a rule for `main` that requires the **test** status check to pass. No workflow pushes to `main` any more, so this won't block automation.
3. Optional: create a `wrong-instruction` label so reports from the form are tagged automatically. You can also set the repository's website to the app URL.

**Releasing a content change:** change `VERSION` in `sw.js` and `version` in `site.js` to today's date (add `.2`, `.3` and so on for another release on the same day), and add an entry to `CHANGELOG.md` with the same version as its heading; the build check fails if the three differ. Note the guide date and firmware version you checked against. A new page, script or stylesheet must also be added to `ASSETS` in `sw.js`, or the build check fails.

**Keeping tools up to date:** every action in the workflow is pinned to a full commit SHA, with the version in a comment. Dependabot (`.github/dependabot.yml`) opens a monthly pull request to update them. pytest and Playwright are pinned in `requirements-dev.txt`; update them by hand.

## Files

| File | What it is |
|---|---|
| `index.html`, `home.js` | Home: the set-up question or Continue, the course, your device projects and the tools. Old addresses such as `index.html#first` are sent on to their pages from here. |
| `setup.html` | Chapter 0 · Set up your K.O. II. |
| `first-beat.html`, `song.html` | Chapters 1 · First beat and 2 · Make it a song. `first-beat.js` adds the target rhythm, the placement helper and "Hear this recipe". |
| `sampling.html`, `perform.html` | Chapters 3 · Sample, chop & resample and 4 · Play & perform. |
| `hiphop.html`, `tech-house.html`, `thodorakis-house.html` | Chapters 5 · Full hip-hop beat, 6 · Tech house and 7 · Vocal house. |
| `coach.css` | The one stylesheet for every page: colours, type, components, light and dark. |
| `learn.html`, `controls.html`, `lab.html`, `help.html`, `glossary.html`, `cheat-sheet.html`, `safety.html`, `settings.html`, `404.html` | The tools, Settings and the "Page not found" page. `tools.js`, `lab.js` and `settings.js` are their scripts; `audio.js` makes the practice sounds. |
| `site.js`, `shell.js` | The list of chapters and tools (and the release version), and the shared app bar and menu built from it. |
| `progress.js` | Saved progress shared by every page: carrying Chapters 1 and 2 over from older versions, the progress file and Reset. |
| `search.js`, `wake.js` | Search across every chapter and tool (works offline), and keeping the screen on while you practise. |
| `icons.svg`, `fonts/` | Icons and the self-hosted IBM Plex Mono font for keys and display values (SIL Open Font License, see `fonts/OFL.txt`). |
| `chapter.js`, `player.js`, `toolsheet.js` | Ticks, progress and resume for every chapter page, the step player on top of them, and the Tools sheet (the step's keys, fixes and words; the map, troubleshooting, glossary and cheat sheet). |
| `sw.js` | Offline support (service worker). |
| `manifest.webmanifest`, `icon.svg`, `icons/` | Home-screen app name and icons. |
| `tests/test_smoke.py`, `tests/test_progress.py`, `tests/test_player.py`, `tests/conftest.py`, `tests/support.py`, `pytest.ini` | Browser tests (pytest and Playwright for Python). |
| `requirements-dev.txt` | Test tools and their pinned versions. Never published. |
| `.github/` | Test-and-deploy workflow, site build and live-check scripts, issue form, Dependabot settings. |
| `CHANGELOG.md` | What changed in each release, and which guide version it was checked against. |
| `docs/overhaul-plan.md` | The plan for the UI and UX overhaul. |

## License

No license has been chosen yet. Until the author adds one, normal copyright applies: you can use the app and read the code here, but copying or republishing the code or lesson text needs the author's permission. Reports and suggestions through issues are welcome.

## Trademarks

This is an independent learning project. It is not affiliated with or endorsed by teenage engineering. EP-133 and K.O. II are trademarks of teenage engineering. No official device artwork, product photos or factory audio are included. The app icon is an original pad design.
