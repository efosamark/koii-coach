# K.O. II Coach

An unofficial, beginner-friendly course for the teenage engineering EP-133 K.O. II. It is made to sit on your phone next to the device: each step says what to press, what you should see or hear, and what to check before you move on.

**Open the app:** https://efosamark.github.io/koii-coach/

This is a personal fork of [leonardovitolowork-hash/koii-coach](https://github.com/leonardovitolowork-hash/koii-coach), the original K.O. II Coach.

[![Test and deploy](https://github.com/efosamark/koii-coach/actions/workflows/deploy.yml/badge.svg)](https://github.com/efosamark/koii-coach/actions/workflows/deploy.yml)

> Unofficial. Not affiliated with or endorsed by teenage engineering. EP-133 and K.O. II are trademarks of teenage engineering.

## What's inside

The course is written for a K.O. II on **OS 2.5.1**, the newest release (3 July 2026), starting from a new unit.

| | Section | What you do there |
|---|---|---|
| 00 | Start here | Get a new unit ready: switch it on, read the screen and the button combos, update to OS 2.5.1, back it up with the official EP sample tool, choose an empty project and tour the factory sounds. |
| 01 | First beat | Build a short drum and bass loop one step at a time, with a helper that shows where each note goes. |
| 02 | Make it a song | Add a melody, make variations with scenes, and arrange them in the song list. |
| 03 | Learn | Short lessons on the main functions, to read any time. |
| 04 | Controls | Tap a control on the map to see what it does. |
| 05 | Rhythm lab | Try out drum patterns on a grid in the browser. |
| 06 | Help & reference | Search the troubleshooting answers, read the cheat sheet and glossary, set your OS version, and back up your progress. |
| 07 | Sample, chop & resample | Record with the built-in mic, build a drum kit from your voice, sample a phone over a cable or USB, then trim, reverse, chop and resample. |
| 08 | Play & perform | Play live: record with feel, KEYS basslines in a scale, note repeat and the arpeggiator, punch-in FX, fader moves, live scene changes, sidechain and recording your performance. |
| 09 | Full hip-hop beat | Rebuild the 01 beat in a fresh project, sample a short sung phrase from USB audio, a line source or the mic, and arrange 64 bars with a six-position song list. |
| 10 | Tech House | A 128 BPM track with four-on-the-floor drums, a bassline that ducks under the kick, your own vocal hook, two drops, a breakdown and a build: 112 bars in song mode. |
| 11 | House with your own vocal samples | A 4-minute, 128 BPM house track built around five short vocal samples you record or upload yourself: 32 song positions, 128 bars. |

**Suggested order:** 00, 01, 02, 07, 08, 09, 10, 11. Sections 03 to 06 are reference pages you can open whenever you need them. Each chapter page ends with links to the previous and next chapter in this order.

**Projects on the device:** a new K.O. II has factory sounds in projects 1–5, and projects 6–9 are empty. The course uses project 6 for chapters 01, 02 and 08, project 7 for 07, project 8 for 09, and project 9 as a scratch project in 00 and then for 10. That uses all four empty projects, so chapter 11 shows how to back up and reuse one.

**Before you start:** if your K.O. II runs an older OS, update it first (chapter 00 shows how). Some steps can erase or overwrite things on the device, and the app warns you at those steps. Never switch the K.O. II on while holding SHIFT + ERASE unless you really mean to format it: that erases all your work and the factory sounds, and the official guide says factory sounds can't be recovered. Back up with the official EP sample tool first. If the device ever behaves differently from the app, follow the [official guide](https://teenage.engineering/guides/ep-133) and [report the step](#report-a-wrong-instruction).

Other things to know:

- The practice sounds in the app are made by your browser. They are not the device's factory sounds.
- The control map is a diagram to help you find things, not an exact picture of the device.
- Rhythm and mix choices in the lessons are suggestions. Change them to taste.
- There is no hardware connection, account, analytics or tracking. Nothing is sent anywhere.

## Progress and privacy

Your progress is saved only in this browser on this device: your place in chapters 01 and 02, the lessons you marked, your Rhythm lab pattern and the ticked steps of chapters 00 and 07 to 11 (browser storage keys starting with `koii-coach`). Clearing your browser data erases it. It never changes anything on your EP-133. To move progress to another browser or keep a copy, use **Save progress file** in **06 Help & reference**. **Reset all progress** there asks before it clears anything.

## Offline and home screen

After the first complete visit, every page of the coach works without internet, and the footer of the main app says so ("Offline ready"). The service worker (`sw.js`) asks the network first so you get the latest lessons. If the network is offline, or has not answered within 3 seconds, the saved copy opens instead. Links to the official guide and other websites still need internet.

You can add the coach to your phone's home screen from the browser's share or menu button. It has proper icons for iPhone and Android.

## Report a wrong instruction

If a step doesn't match what your EP-133 does, please [open a "Wrong instruction" report](https://github.com/efosamark/koii-coach/issues/new?template=wrong-instruction.yml). Every page has the same link in its footer. The form asks for the page, the step, what the app says, what the device did, and your firmware version. You need a free GitHub account to send it. Reports from people with the device in front of them are the best way to keep the course correct.

## Accuracy

The instructions follow the [official EP-133 guide](https://teenage.engineering/guides/ep-133). They were last checked against it on **13 October 2026**, when the guide was marked "ver 2.5". The guide's [What's new](https://teenage.engineering/guides/ep-133/whats-new) page describes OS 2.0 to 2.5. OS 2.5.1 (3 July 2026) is listed only on the [official downloads page](https://teenage.engineering/downloads/ep-133), as a bug-fix release, so the course treats it as OS 2.5. The app's Help page shows the check date (from `courseInfo` in `course.js`), and [CHANGELOG.md](CHANGELOG.md) records it for each release. Steps in chapters 01 and 02 that need a newer OS than the one you choose in Help show a "Needs OS …+" badge.

Where the guide is silent or unclear, for example about what the display shows at a certain moment, the lesson says so and tells you to check your display instead of guessing. Not every step has been tried on a real device. If you find a difference, the official guide is right, and a report helps everyone.

## Testing

Every push to `main`, every pull request into `main` and every manual run start the **Test and deploy** workflow (`.github/workflows/deploy.yml`):

1. `.github/scripts/build_site.py` copies only the app files into `_site/` and checks them. It fails if a file is missing or looks like placeholder text. It also fails if a page links to a file that isn't there, if `sw.js` precaches a missing file (one missing file stops offline install), if a page isn't precached, or if the release version in `sw.js`, `course.js` and `CHANGELOG.md` differs.
2. `tests/test_smoke.py` (pytest and Playwright for Python) opens the `_site/` copy in Chromium on a local server, at desktop and 390 px phone width. It fails on any JavaScript error, console error or failed request. It checks that:
   - the main app loads with the "Start here" card, the right chapter numbers in the menu, the step and note helpers, the control map, the lessons and the Rhythm lab with its practice sounds;
   - Help search finds troubleshooting topics, and the OS picker changes the "Needs OS" badges;
   - your place in 02 Make it a song survives a reload, every hash route (`#first`, `#song`, `#manual`, `#controls`, `#lab`, `#help`) opens its view, and Reset asks before it clears anything;
   - the service worker installs, and the footer reports that every chapter is available offline;
   - at 390 px no view scrolls sideways, and Next brings the new step into view;
   - each chapter page (00 and 07 to 11) shows its chapter number, the footer report link and the right previous and next links (the test clicks them), keeps a ticked step after a reload, and doesn't scroll sideways.

**Not tested automatically:** real EP-133 hardware, how the sounds sound, Safari on iPhone, offline use on a real phone, the progress file dialogs, and the live site (the workflow leaves `LIVE_URL` empty; set it to test a deployed copy as well).

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

**Releasing a content change:** change `VERSION` in `sw.js` and `courseInfo.version` in `course.js` to today's date (add `.2`, `.3` and so on for another release on the same day), and add an entry to `CHANGELOG.md` with the same version as its heading; the build check fails if the three differ. Note the guide date and firmware version you checked against. A new page, script or stylesheet must also be added to `ASSETS` in `sw.js`, or the build check fails.

**Keeping tools up to date:** every action in the workflow is pinned to a full commit SHA, with the version in a comment. Dependabot (`.github/dependabot.yml`) opens a monthly pull request to update them. pytest and Playwright are pinned in `requirements-dev.txt`; update them by hand.

## Files

| File | What it is |
|---|---|
| `index.html` | The app: sections 01 to 06, navigation, progress and backup. |
| `course.js` | Lesson data for 01 to 06: steps, lessons, help topics, glossary, song map and `courseInfo` (version, check date and firmware). |
| `setup.html` | Chapter 00 Start here. |
| `sampling.html`, `perform.html` | Chapters 07 Sample, chop & resample and 08 Play & perform. |
| `hiphop.html`, `tech-house.html`, `thodorakis-house.html` | Chapters 09 Full hip-hop beat, 10 Tech House and 11 House with your own vocal samples. |
| `coach.css` | The one stylesheet for every page: colours, type, components, light and dark. |
| `site.js`, `shell.js` | The list of chapters and tools, and the shared app bar and menu built from it. |
| `icons.svg`, `fonts/` | Icons and the self-hosted IBM Plex Mono font for keys and display values (SIL Open Font License, see `fonts/OFL.txt`). |
| `chapter.js` | Checklist, progress and resume code for the chapter pages (00 and 07 to 11). |
| `sw.js` | Offline support (service worker). |
| `manifest.webmanifest`, `icon.svg`, `icons/` | Home-screen app name and icons. |
| `tests/test_smoke.py`, `tests/conftest.py`, `tests/support.py`, `pytest.ini` | Browser smoke test (pytest and Playwright for Python). |
| `requirements-dev.txt` | Test tools and their pinned versions. Never published. |
| `.github/` | Test-and-deploy workflow, site build and live-check scripts, issue form, Dependabot settings. |
| `CHANGELOG.md` | What changed in each release, and which guide version it was checked against. |
| `docs/overhaul-plan.md` | The plan for the UI and UX overhaul. |

## License

No license has been chosen yet. Until the author adds one, normal copyright applies: you can use the app and read the code here, but copying or republishing the code or lesson text needs the author's permission. Reports and suggestions through issues are welcome.

## Trademarks

This is an independent learning project. It is not affiliated with or endorsed by teenage engineering. EP-133 and K.O. II are trademarks of teenage engineering. No official device artwork, product photos or factory audio are included. The app icon is an original pad design.
