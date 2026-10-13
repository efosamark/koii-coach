# Changelog

What changed in each release of K.O. II Coach. Versions are dates (`YYYY.MM.DD`, with `.2`, `.3` and so on for another release on the same day). The same value is used for `VERSION` in `sw.js` and `courseInfo.version` in `course.js`.

Each release records the date its instructions were checked against the [official EP-133 guide](https://teenage.engineering/guides/ep-133), and which firmware version the guide described then. If your device runs a newer OS and something differs, follow the official guide and [report the step](https://github.com/efosamark/koii-coach/issues/new?template=wrong-instruction.yml).

## 2026.10.13.3

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2 (no lesson changed). **Written for:** OS 2.5.1.

No lesson, page or saved progress changes in this release. It prepares for the planned overhaul (phase 0 in [docs/overhaul-plan.md](docs/overhaul-plan.md)):

- The 14 Learn lessons whose ids were worked out from their titles now store the same ids in `course.js`, so renaming a lesson can never clear its "Tried on the device" mark.
- The browser smoke test is now written in Python (pytest and Playwright for Python) and runs the same checks, so it also runs on a computer without Node.js. The service worker check now gives up after 30 seconds instead of hanging when the offline install fails.
- The build fails if `VERSION` in `sw.js`, `courseInfo.version` in `course.js` and the newest heading here disagree.

## 2026.10.13.2

**Checked against:** the official EP-133 guide on 13 October 2026 (guide marked "ver 2.5"; its What's new page describes OS 2.0 to 2.5). **Written for:** OS 2.5.1 (3 July 2026, listed on the official downloads page as a bug-fix release of OS 2.5).

This is the first versioned release. Version 2026.10.13 was a test build on the review branch and was never published.

### Chapters and numbering

The course now has a guided order: 00 Start here → 01 First beat → 02 Make it a song → 07 Sample, chop & resample → 08 Play & perform → 09 Full hip-hop beat → 10 Tech House → 11 House with your own vocal samples. 03 Learn, 04 Controls, 05 Rhythm lab and 06 Help & reference are tools you can open any time. The menu, chapter headers, page titles, footers, lessons and help use these numbers everywhere. Earlier numbers: the hip-hop chapter was 07, Tech House 08 and the vocal house chapter 09.

- **New: 00 Start here** (`setup.html`, 36 steps). Gets a new unit ready: power on, the screen and button combos, updating to OS 2.5.1 with the official update utility, a backup with the official EP sample tool, choosing an empty project, a tour of the factory sound library, useful system settings, and what to do when something is wrong.
- **01 First beat** (22 steps) starts in empty project 6, selects groups with a tap, teaches undo and the TRK erase early, and adds optional live-recording practice with a count-in.
- **02 Make it a song** (24 steps) uses one commit convention for scenes, builds the melody from the full beat and ends with a 10-position, 16-bar song list. Its song map is now part of the app. The last step leads on to 07.
- **New: 07 Sample, chop & resample** (`sampling.html`, 57 steps): the built-in mic, a drum kit from your voice, sampling a phone over a cable or USB (OS 2.5), recording quality, trim and reverse in SOUND EDIT, equal-length chop, resampling, and time-stretch to fit a loop to any tempo.
- **New: 08 Play & perform** (`perform.html`, 64 steps): live recording with feel, KEYS basslines with key and scale (OS 2.5), note repeat and the arpeggiator, punch-in FX, editing by pad, live scene changes, deeper song mode, sidechain, and recording your performance over USB.
- **09 Full hip-hop beat** (61 steps, was 50) was rebuilt. It starts in a fresh project (8) and rebuilds the 01 beat there, so your 02 song stays untouched. It samples a short sung phrase from USB audio, a line source or the mic (no turntable needed). It now uses TRK erases, a snare recorded live with a count-in, scene sync (system settings 411/412), a per-pad time shift and sample reverse.
- **10 Tech House** (61 steps, was 48) now has two different drops, holds ERASE + pad to clear a whole pad, sidechains the bass, records a tom live with a count-in, records the vocal hook from the mic or USB, adds an optional reversed riser, and shows the patterns and scenes as tables. It uses project 9, the scratch project from 00.
- **11 House with your own vocal samples** (79 steps, was 61) works with five vocal samples of your own (V1–V5 on group D), recorded or uploaded in section 02, instead of the author's. It arranges 32 song positions: 128 bars, exactly 4:00. A new unit has only four empty projects and the earlier chapters use all of them, so this chapter shows how to back up and reuse one.
- **Projects:** 6 for 01, 02 and 08; 7 for 07; 8 for 09; 9 as a scratch project in 00 and then for 10; 11 reuses one after a backup. Every chapter says which project it uses.
- **Checked against the official guide:** every chapter section links to the official guide pages it relies on and ends with a checkpoint and an "If it doesn't" hint. Where the guide is silent or unclear, the text says so and tells you to check your display.
- **Safety:** switching on while holding SHIFT + ERASE formats the drive, and the official guide says factory sounds can't be recovered. The course never presents it as a reset. It warns wherever it comes up and recommends a backup with the EP sample tool first.

### App

- On a first visit, a "New K.O. II? Start here" card points to 00. The menu shows all twelve sections, and a "Your path" card shows how far you are in each chapter.
- Help search finds the troubleshooting topics again (24 topics), with a cheat sheet built from the 01 and 02 recaps and a 106-word glossary. Learn has 19 lessons; some link to the chapter that teaches them in full.
- The OS picker in Help defaults to OS 2.5.x. Choosing an older OS shows a "Needs OS …+" badge on the steps that need a newer one, with the way to update.
- Each view has its own address (`#first`, `#song`, `#manual`, `#controls`, `#lab`, `#help`), so the phone's Back button returns to the previous view and the chapter pages can link to a view.
- On a phone, Next and Previous show the top of the new step.
- Your place in 01 and 02 is saved, as are the steps you tick in 00 and 07 to 11. Chapter pages show "Continue at step …", a tally per section, a print button and a reset for that chapter. Progress from earlier versions carries over where the step still exists; ticks on rewritten steps are cleared, and the chapter page says so once.
- Progress can be saved to a file and loaded again. Resetting all progress asks you to confirm first.
- Practice sounds handle the iPhone silent switch, and the app no longer claims to be playing when nothing can be heard.
- Better contrast, a dark mode and larger small text.
- The main app's footer has the non-affiliation notice, a "Report a wrong instruction" link filled in with the current step, and the offline status. Every chapter page's footer has the notice, the report link and links to the previous and next chapters.

### Offline and install

- Home-screen icons for iPhone (180 px apple-touch-icon) and Android (192 px and 512 px, plus a 512 px maskable icon). The manifest now has an `id`, a description and the PNG icons.
- The service worker precaches every page (including the new 00, 07 and 08), the shared chapter files, the manifest and all icons. A weak connection falls back to the saved copy after 3 seconds instead of waiting. Offline links with a query string (such as `hiphop.html?utm_source=x`) open the saved page.
- The cache name carries the release version (`koii-coach-2026.10.13.2`).

### Repository and deployment

- One **Test and deploy** workflow replaces the old smoke-test workflow. The site goes live only after its tests pass, and only the app files are published. Pull requests are tested too. The owner needs to set **Settings > Pages > Source** to **GitHub Actions**; see the README.
- The browser smoke test (`tests/smoke.mjs`) was rewritten for the new app and covers every chapter page. The README lists what it checks. It no longer tests the live site unless `LIVE_URL` is set.
- Removed six one-off repair and publish workflows that could still push to `main` and publish an incomplete site: `icon-source-fix`, `phone-icon`, `repair`, `tech-house`, `tech-house-repair` and `vocal-update`.
- Test results are no longer committed to the repository. They are attached to each workflow run instead, and the three old `.github/*-results.json` files were removed.
- Every action is pinned to a full commit SHA, with Dependabot updates. Playwright is pinned to an exact version.
- Added a "Wrong instruction" issue form, this changelog, a `.gitignore` for local test output, and a rewritten README with the trademark and license status.
- Removed `icons/logo-source.webp.b64`. It was a corrupt, unused image that was also served publicly.

## Before 2026.10.13.2

These releases had no version numbers and no recorded guide-check date. Summary from the git history:

- **12 October 2026:** added the Tech House chapter (then numbered 08, now 10) and a house track built on vocal samples (then 09, now 11).
- **11 October 2026:** added "Make it a song" and the full hip-hop chapter (then 07, now 09), which went through several revisions (including artist-vocal sampling). The live site briefly showed placeholder text instead of the app, and was restored. A home-screen icon was attempted but never shipped.
- **10 October 2026:** first version: the first-beat course, lessons, controls map, rhythm lab, help, offline support and a browser smoke test.
