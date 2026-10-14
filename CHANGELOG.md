# Changelog

What changed in each release of K.O. II Coach. Versions are dates (`YYYY.MM.DD`, with `.2`, `.3` and so on for another release on the same day). The same value is used for `VERSION` in `sw.js` and `version` in `site.js` (`courseInfo.version` in `course.js` before 2026.10.14.2).

Each release records the date its instructions were checked against the [official EP-133 guide](https://teenage.engineering/guides/ep-133), and which firmware version the guide described then. If your device runs a newer OS and something differs, follow the official guide and [report the step](https://github.com/efosamark/koii-coach/issues/new?template=wrong-instruction.yml).

## 2026.10.14.6

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No button sequence changed: steps were split and their sentences moved; the few words that changed are listed.

Chapter 4 · Play & perform, rewritten for a glance, like Chapter 3 (64 steps became 110). Your ticks and links carry over.

- Each step has a title, at most three moves and one short Check; reasons and fixes are under "Why" and "Not working?".
- Erasing a scene is now three steps, so the two presses that cannot be undone each ask "Yes, I have checked" first: copy a throwaway scene as TRASH, clear it, then delete it.
- Changed wording: "Wrong pad? Press SHIFT + B at once, while the umbrella is lit." (was "Cleared the wrong pad? …"); "You should hear your backbeat and ghost notes repeat …" (was "and the soft ghost notes"); "You should hear the notes one at a time …" (was "the notes play"); "The change lands at the end of the pattern, though you chose it early." (was "should happen exactly at the end of the pattern, even though"); "To go back to instant scene changes, press SHIFT + ERASE, type 4, 1, 0 …" then "Or keep 412 …" (the same sentence, turned round); "Aim for this:" became the Check itself; "Only notes from that scale play now …" (was "they now offer only notes from that scale"); and the asides in brackets after "pad 1", "not key", "if it is still armed" and the punch-in ideas while recording moved to Why or a note.

## 2026.10.14.5

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No button sequence changed: steps were split and their sentences moved; the few words that changed are listed.

Chapter 3 · Sample, chop & resample, rewritten for a glance (phase P7 of the overhaul).

- **Every step fits on a phone propped beside the K.O. II:** a short title, at most three moves (26 words) to do, and one short Check, with the reason and the fixes folded under "Why" and "Not working?". Long steps were split, so the chapter has 88 steps instead of 57.
- **Your progress carries over.** A split step keeps its address, and if you had ticked it, every part of it is ticked. Links to a step still open it.
- The few sentences that changed wording: "Write the number down as FIRST" (was "Write it down"); the examples of a kick sound, "such as a deep “dm” or “boom”", moved to Why; the parenthesis after `in`, `usb` and `EQU`, and after "press D3" (if D3 already holds a line-in sample, use the next empty pad), moved to Why or Not working?; "Hold RECORD and tap “one” at 1.1.1, “two” at 1.2.1 …" (was "the “one” pad at …"); "Check: the reversed snare swells and its loud end lands …" (was "swells up"); "Set up an effect for group B" and "To crop your kick" became the step titles. A Check that was cut in half at "K.O. II" in the resample step is whole again.
- Chapters 0 and 3 to 7 now load the shared progress code, as the others did: the "Needs OS" badges there follow the OS chosen in Settings, and the menu shows Continue.

### Repository

- `progress.js` keeps the split migrations (each record remembers the last one applied in a new field, `m`). The site build checks that every link to a step names a real step, and that every page loads `site.js`, `progress.js` and `shell.js` in order. `tests/test_player.py` checks the glance budget for the rewritten chapters, and `tests/test_progress.py` that split steps keep their ticks.

## 2026.10.14.4

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No button sequence changed: only chapter and part numbers and three chapter names.

The course is numbered in teaching order (phase P6 of the overhaul).

| Was | Now |
|---|---|
| 00 Start here | Chapter 0 · Set up your K.O. II |
| 01 First beat | Chapter 1 · First beat |
| 02 Make it a song | Chapter 2 · Make it a song |
| 07 Sample, chop & resample | Chapter 3 · Sample, chop & resample |
| 08 Play & perform | Chapter 4 · Play & perform |
| 09 Full hip-hop beat | Chapter 5 · Full hip-hop beat |
| 10 Tech House | Chapter 6 · Tech house |
| 11 House with your own vocal samples | Chapter 7 · Vocal house |

- Every page, link and cross-reference uses the new numbers: "Chapter 3", "Part 4" (parts were "section 04" in the text and "04 / Title" in the list), "Step 4 of 8". A chapter's name is the same in the menu, its heading and its page title; the old taglines ("Your first beat", "A full 128 BPM track", "House with your own vocal samples") are subtitles.
- **Nothing moves:** the files, links, step addresses and saved progress are unchanged, so bookmarks and old links still open the same chapter and step.
- Chapters 3 to 7 show "Formerly 07" (and so on) on their start screen, and search finds a chapter by its old number or name ("07", "start here"). These stay for at least three months.
- The site build now fails if a page names a chapter by its old number or name, or a part as "section 04".

## 2026.10.14.3

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No button sequence changed: the steps below were reordered, and the few sentences that are new are listed with the official sources they rest on. If your unit does something else, [report the step](https://github.com/efosamark/koii-coach/issues/new?template=wrong-instruction.yml).

The parts of the overhaul plan that phases 1 to 4 left out, filled in.

### Steps that can lose work: check first, undo after

- In 00 and 07 to 11, every step that clears, deletes or overwrites now reads in the same order as 01 and 02: **Before you press** (the check that keeps it safe), the press, then **how to undo it** (or "No undo"), then what you should hear or see, then any notes. The sentences were moved, not rewritten.
- New sentences, where a step had no undo or no check before the press:
  - "Cleared the wrong pad? Press SHIFT + B at once, while the umbrella is lit." after the ERASE + pad clears of 14 steps: 08 steps 12 and 20 (the KEYS and ROLL practice copies); 09 steps 32 (drop the bass from HOOK), 35 (INTRO), 38 and 39 (BREAK) and 46 (END); 10 steps 38, 39, 40 and 42 (OUTRO, INTRO, BUILD and BREAK); 11 steps 53, 55 and 58 (the clears in GROOVE, INTRO and BREAK). The official guide: SHIFT + B undoes, and "when an undo is possible the umbrella will light up" ([play and record](https://teenage.engineering/guides/ep-133/play-and-record)); its release notes count erasing notes among the actions that light it (OS 2.0.2: "After loading a project, erasing notes would not enable the undo umbrella", fixed; OS 2.5: "Undo icon now lights up when erasing notes with ERASE+GROUP while playing", [what's new](https://teenage.engineering/guides/ep-133/whats-new)). The guide does not say how many actions undo goes back, so the line says "at once": in a step that clears several pads, undo straight after the wrong one.
  - "Hold MAIN first: the number must be LIVE / BREAK / GROOVE / INTRO." (as 02 already says for BREAK) before 6 clears: 08 steps 4 and 10 (LIVE), 09 step 38 (BREAK), 11 steps 53, 55 and 58. Holding MAIN selects scenes 01–99 ([modes](https://teenage.engineering/guides/ep-133/modes)); the number is the one you wrote down for that scene.
  - "No undo: this course does not rely on undo for a cleared or deleted scene." in 08 step 46 (clear a throwaway scene). The guide describes ERASE + MAIN (CLR, or DEL for an empty scene that is not in the song) but not whether undo covers it.
- Every "Check: …" sentence in 00 and 07 is its own check line (with an ear or an eye), as in 01 and 02. 07 "Place the reversed snare" is tagged "Clears notes".
- Each chapter's start screen says what you will make. The reference cards (07's pad plan, 08's "How every section starts", 09's moves, 10's destination, 11's sound roles) fold into "Reference for this chapter".

### The player

- **The app bar says where you are:** the chapter over "Part 2 · Build a drum kit · Step 4 of 10", with the chapter's progress as a thin bar under it. The separate bar above the step is gone. Steps count within their part ("4 of 10").
- **Tools** sits beside Done · Next: the step's keys lit on the control map and numbered in the order you press them (a pad such as B1 lights group B and pad 1, as the steps say to press them), the troubleshooting topics the step links to (already open), the glossary words it uses and the moves you know; then the whole control map, Troubleshooting, the Glossary and the Cheat sheet, and a search field. A "see help" link in a step opens its topic there, and the first one or two beginner words in a step (BPM, quantize, scene…) have a dotted underline that opens the word.
- **The menu has a "This chapter" tab** with every part and step (ticked, skipped, where you continue), Player | All steps, Print and Restart; on a wide screen the chapter sits in the left column above the course. **⋮** in the app bar has the same actions plus "Report this step".
- **Optional steps can be skipped:** the first of a run of optional steps offers "Skip these 3 steps". Skipped steps stop counting towards the chapter (and Home), you can undo it from the toast, and ticking one later brings it back.
- **Checkpoints:** a row of lights shows the parts done. "Not quite" shows the fix and a "Redo this part" button; your answer is kept for you only and never changes a tick.
- **Chapter done** shows what you made, the new moves and Review steps; it ticks the recap once every other step is done. Steps left open are listed in the heading's place ("Chapter 08 · 3 steps not ticked yet"). Finishing the last open chapter lists all eight and what each one made.
- Coming back to a chapter says "Welcome back" and where you continue; in 08, after more than 30 minutes, "Get back in" repeats how every section starts. A step opened from the menu, a link or search shows "Back to step N" to return to your place. A chapter that needs a newer OS than the one in Settings says "Update first" on its start screen. "Reset this chapter's checklist" is now **Restart this chapter**, with Undo for 10 seconds.
- Focus lands on the step's title, which says "Step 4 of 10" to screen readers.

### Search, Home, Settings and the tools

- **Search** shows a step as a preview first, with "Go to this step", so searching never moves you; a troubleshooting answer opens in place.
- **Home:** the Continue card names the part and step it opens, with the project and OS; the chapter you continue is marked "You are here"; 00 reads "Skipped · do it any time" (or "Optional · set-up checks" when your progress carried over); when every chapter is done, Home lists what you made in each.
- **Settings:** "My unit is set up", keyboard shortcuts On / Off, Reset settings, and Retry and Install for the offline copy where they apply (also on Home).
- **Cheat sheet:** now holds every chapter's reference cards, with "Only chapters I've done". **Troubleshooting** has a row of its five groups. **Rhythm lab:** hits show their instrument (● kick, ■ snare, ▲ hat, ◆ bass).

### Repository

- New `toolsheet.js` (the Tools sheet) and `tests/test_player.py`. The glossary marks its beginner words (`data-beginner`), `site.js` records what each chapter makes (`made`), and the cheat sheet's chapter sections carry `data-chapter`.
- Saved data only gains fields: a chapter record's `skip` (optional steps you skipped), `koii-coach-prefs.keys`, and `koii-coach-meta.checkpoints`.

## 2026.10.14.2

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No button sequence changed. The changes to the text of 01 and 02 are listed below.

Every chapter runs in the step player, and the tools are pages of their own (phases 3 and 4 of the overhaul; phase 3 shipped earlier the same day without an entry here). The single-page app is gone. Your progress carries over, and old links still work.

### The step player

- **One step at a time.** Every chapter opens on a start screen (time, project, OS, parts and, where it matters, what can't be undone), then shows one step at a time, large enough to read with the phone propped beside the K.O. II. **Done · Next** sits under your thumb, with **Back** and **Steps** (the whole chapter, with your ticks, to jump anywhere). → and Enter also work.
- Each part ends with a checkpoint card, and the chapter with a "Chapter done" screen that lists any steps you haven't ticked.
- **All steps** shows the chapter as a list, for reading ahead or printing. Your choice is remembered per chapter.
- Steps that clear notes are tagged "Clears notes". A step that deletes or overwrites something with no undo stays folded until you confirm "Yes, I have checked". Steps that change a system setting say which code. Each of these tags links to the new Safety and erasing page.
- Every step has its own address, and a "This step doesn't match my K.O. II" link that fills in the report form for it.

### 01 and 02

- **01 First beat** and **02 Make it a song** are now chapter pages (`first-beat.html`, `song.html`) in the same player, in named parts: 01 has 6 and 02 has 6. Each step shows what to do first, then what you should hear or see, with "Why" and "Not working?" folded away and the official guide page it follows.
- **01: the bass is no longer optional.** Chapter 02 builds on it. "Optional: choose one bass sound" is now "Choose one bass sound", and four sentences that called it optional or offered to skip it were changed to match.
- **01: a new optional step, "Make scene changes wait for the bar"** (system setting 411). It used to be hidden in the "If stuck" text of "Turn the loop into a tiny performance"; the key sequence is unchanged. 01 now has 23 steps.
- **Warnings come before the press:** in 01 "Give the bass a shorter tail" the warning about holding SHIFT + SOUND on the trim page, and in 02 "Make the breakdown: clear kick and bass" the check that you are in BREAK, moved from "If stuck" to a "Before you press" box. The undo (SHIFT + B) now follows the press in that step and in "Make the intro: remove the bass".
- 01 shows the target rhythm in the steps that place notes, with a placement helper that walks you through that step's positions one at a time and "Hear this recipe" to play it. The recaps show their moves as a list, and 02's song map is part of the part that builds the song list.

### Tools, Home and links

- **The tools are pages:** Learn, Control map, Rhythm lab, Troubleshooting (symptom first, in five groups, with its own search), and three new ones: **Glossary** (106 words, A to Z), **Cheat sheet** (the moves of 01 and 02, the song map and the system settings the course uses) and **Safety and erasing** (every action that erases or overwrites something, how to avoid it, and its undo or "no undo"). Settings is a page too.
- **Home** is a page of its own and works without JavaScript. Links to the old app (`index.html#first`, `#song`, `#manual`, `#controls`, `#lab`, `#help/<topic>`, `#settings`, and links to one step or lesson) open the new pages.
- Search covers every chapter and tool page; a word opens its glossary entry.
- An address that isn't part of the coach shows a "Page not found" page with the course and the tools, online and offline.
- Settings: Reset all progress can be undone for 10 seconds, and a progress file that can't be loaded says so next to the button.

### Progress

- Your place in 01 and 02 becomes ticks: every step before your place is ticked, and you continue where you were. The chapter says so once, so you can untick a step you skipped. Moves in 01 and 02 are still written to the old key, so going back to an older version finds you where you are now.
- Your OS choice, the lessons you marked and your Rhythm lab pattern are kept where they were.

### Repository

- `course.js` and the app script in `index.html` were removed; their content is now in the pages. New scripts: `progress.js` (shared progress), `audio.js`, `first-beat.js`, `home.js`, `tools.js`, `lab.js` and `settings.js`. The release version moved from `course.js` to `site.js`.
- New test `tests/test_progress.py` checks that progress carries over from older versions and that a progress file loads.

## 2026.10.14

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2 (no lesson text changed). **Written for:** OS 2.5.1.

Home, search and Settings (phase 2 of the overhaul). Your progress carries over.

- **Home.** The coach now opens on a Home page. On a first visit it asks whether your K.O. II is new and sends you to 00 or 01. After that it shows one Continue button that opens the exact step you were on, the whole course with your progress, which device project each chapter uses, and the tools.
- **Search everything.** The search button in the app bar searches every step of every chapter, the lessons, the help topics and the glossary, and works offline.
- **Settings.** The OS choice, keeping the screen on, saving and loading your progress file and Reset all progress moved from Help to a new Settings page. Reset and loading a file now keep your settings.
- **Keep the screen on.** While you practise, the coach keeps your phone's screen awake (where the browser allows it), and lets it sleep again after 15 minutes without a tap. Use the sun button in the app bar or Settings to turn it off.
- **Links to one step.** Every step, lesson and help topic has its own link, so search results and "see help" mentions open exactly the right place. Phone Back returns from a lesson to the list.
- Chapter pages no longer delete the old checklist keys after copying them.

## 2026.10.13.4

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2 (no lesson text changed). **Written for:** OS 2.5.1.

A new look for every page (phase 1 of the overhaul). The lessons and button sequences are unchanged, and your progress carries over.

- **One design everywhere.** The main app and the chapter pages now share one stylesheet (`coach.css`), with one set of colours, six text sizes and the same buttons, cards and notices in light and dark mode. Orange now only marks a button to press on the K.O. II.
- **A compact header and one menu.** The 12-tile header is gone. Every page has the same slim app bar with a menu that lists the course in order with your progress, and the tools. On a computer the menu is a sidebar.
- **Keys and display values look like the device.** Buttons are keycaps and display values look like the screen, in a self-hosted mono font (IBM Plex Mono). Nothing is loaded from other websites.
- **Clearer warnings.** Every notice is marked as a tip, information, careful (can be undone) or danger (cannot be undone).
- **01 and 02 on a phone:** the row of tiny step dots is now "Step 8 of 22" with a list of steps to jump to. "Start again from step 1" asks first and can be undone. The target rhythm no longer looks like buttons.
- **Chapter pages:** the progress bar shows a meter, and the step to continue from is marked "You are here".

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
