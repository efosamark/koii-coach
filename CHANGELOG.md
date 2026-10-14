# Changelog

What changed in each release of K.O. II Coach. Versions are dates (`YYYY.MM.DD`, with `.2`, `.3` and so on for another release on the same day). The same value is used for `VERSION` in `sw.js` and `version` in `site.js` (`courseInfo.version` in `course.js` before 2026.10.14.2).

Each release records the date its instructions were checked against the [official EP-133 guide](https://teenage.engineering/guides/ep-133), and which firmware version the guide described then. If your device runs a newer OS and something differs, follow the official guide and [report the step](https://github.com/efosamark/koii-coach/issues/new?template=wrong-instruction.yml).

## 2026.10.14.22

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.14.19. **Written for:** OS 2.5.1. No button sequence changed.

Fixes from a second independent review of the overhaul.

**Wordings changed:**

- Chapter 4, "Delete the empty TRASH scene", Before you press: "Hold MAIN first: the number must still be TRASH." (was "…must be still TRASH.").
- Chapter 4, "Clear TRASH", No undo: "No undo: treat the cleared scene as gone for good." (was "No undo: this course does not rely on undo for a cleared or deleted scene."). "Clear TRASH" and "Delete the empty TRASH scene" (ERASE + MAIN) now carry the red tag "Erases the scene · no undo" (was "Deletes · no undo", the tag for deleting a sample); they still stay folded until "Yes, I have checked", and their safety link opens the scene entry.
- Chapter 4, checkpoint of Part 4 (punch-in FX and fader moves): "FX + pad 1 makes the beat stutter." (was "FX + 1 …").
- Chapter 4, "Choose it as your app’s input", Not working?: the owners' tools are named and linked: "…by “EP-133” in its name on a Mac ([ep-series-sysex](https://github.com/kmorrill/ep-series-sysex)) and “EP133” on Linux ([sound-arranger](https://github.com/geokkjer/sound-arranger))."
- Chapter 4, "Try a direct jump to a scene", Why: "owners show" now links the [owner's report](https://www.elektronauts.com/t/ep-133-tips-and-tricks/204124/152).
- Chapter 5, "Checkpoint: hear your source", Not working?: "Mic: this check is for a cable; with the mic, check that the MIC icon (“lit when the microphone is in use”) is on, and record a test word to hear it." (was "Mic: you may only hear yourself on playback."; the guide's display page describes the MIC icon).
- Chapter 2, checkpoint of Part 5 (build the song list), If it doesn’t: "hold SHIFT + − / +" is now one chord keycap (it read as SHIFT, then − / +).
- Chapter 2, "Set position 1 to INTRO" and "Add positions 3–6": the "Needs OS 2.0 or newer" badge for readers without JavaScript was missing (the step player already showed the tag).
- Every checkpoint and "If it doesn’t" paragraph shows its buttons as keycaps (about 50 paragraphs in Chapters 0, 1, 2, 4, 6 and 7; the words did not change). Where a "+" joins two buttons pressed together (ERASE + A2, ERASE + FADER + pad, MAIN + a number), it stays a plain "+", not the + button.
- Straight apostrophes in page text are now curly (“K.O. II’s”, “C’s”, “D1’s”, “Reset this chapter’s checklist” and others in Chapters 3, 4, 5 and the cheat sheet).

Also:

- **Screen wake:** after 15 minutes without a tap, the "Screen can sleep again" notice has a **Keep on** button that holds the screen on again (plan 5.3); the notice stays 10 seconds.
- **Letter shortcuts** no longer fire while a link, a button or a Why / Not working? disclosure has focus (plan 4.9), only from the page, the main area or the step's title.
- **Offline copy:** the first save shows its progress on the page as soon as it starts.
- **Search** shows the "Erases the scene" tag on those steps.
- **Build checks:** every step with `data-os` must carry its "Needs OS x or newer" badge for readers without JavaScript, and what `sw.js` saves for offline use must stay under 600 KB gzipped (plan 7.8; 282 KB today).
- **Tests:** existing learners skip the set-up question (ticks in Chapter 0 alone do not), Continue falls back to the last chapter for old records, old checklists of Chapters 5–7 carry over or say why not, schema 3 and an unknown firmware value, the Keep on button (fake clock), and shortcuts in links, buttons and disclosures.

## 2026.10.14.21

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.14.19; the wordings below reuse what the steps, the guide's pictures and the sources named in 2026.10.14.18–.19 already say. **Written for:** OS 2.5.1. No button sequence changed: new lines name a check before a press, its undo, or what to listen for.

Fixes from an independent review of the overhaul.

**Every risky press now has its check first and its undo after** (plan principle 2), and a test keeps it so:

- Before you press added: Ch1 "Optional: or erase a single note" (Only in your practice copy: hold MAIN and check it isn’t BEAT.); Ch2 "Make the intro: remove the bass" (Hold MAIN first: the number must be INTRO, not BEAT.); Ch3 "Erase the test note" (Press briefly: a long hold clears every note of the pad.), "Remix the count" (Stop first, and press briefly: a long hold clears every note of the pad.); Ch4 "Not happy? Undo, or erase while it plays" (Only in LIVE, your practice copy: hold MAIN to check.), "Copied BEAT? Clear its bass" (Hold MAIN first: the number must be BASSLINE, not BEAT.), "Copy BEAT as ROLL, clear the hats" (Clear only in the copy: after SHIFT + MAIN the number must change.), "Erase the pitch moves only" (Hold MAIN first: the number must be FXJAM.), "Delete the empty TRASH scene" (Hold MAIN first: the number must be still TRASH.); Ch5 "HOOK only: drop the bass" (Hold MAIN first: the number must be HOOK.), "Clear INTRO’s bass" (…INTRO.), "Clear the hats in BREAK" (Still in BREAK: hold MAIN to check the number.), "Clear the kicks, write one per bar" (…END.); Ch6 "A4: open hats instead of closed" (Press ERASE + A3 briefly: a long hold clears every closed hat.), "B2: the answer at 4.4.3" (Press ERASE + B1 briefly: a long hold clears the whole bassline.), "Clear the open hats, rim and tom" (…OUTRO.), "Clear INTRO’s bass" (…INTRO.), "Clear the bass and hats" (…BUILD.), "Clear the kick, clap and tom" (…BREAK.), "Remove the last kick" (…PEAK. Press briefly.); Ch7 "A4: open hats instead of closed" (as Ch6), "B1: a gap at the end of bar 4" (Press briefly: a long hold clears the whole bassline.).
- Undo added: "Wrong note? Press SHIFT + B at once, while the umbrella is lit." (Ch1 erase a single note; Ch3 erase test note, remix the count; Ch6 open hats, B2 answer, last kick; Ch7 open hats, bar-4 gap); "Wrong pad? …" (Ch4 clear the hats in LIVE); "Too much gone? Press SHIFT + B while the umbrella is lit." (Ch4 not happy); "Umbrella lit? SHIFT + B undoes it; otherwise record the move again." (Ch4 erase the pitch moves); No undo "No undo: a deleted scene cannot be brought back." (Ch4 delete TRASH).
- Check added: Ch1 erase a single note "Press PLAY: that one snare is gone, the rest plays on."; Ch3 optional crop "A1 sounds as before; the file now ends at your trim points."; Ch4 not happy "Only the hits you wanted are gone; the rest repeats.", clear hats in LIVE "Press PLAY: no hats, everything else plays. Stop.", copied BEAT "Press PLAY: drums only, no bass. Stop.", clear TRASH "Press PLAY: TRASH is silent. Stop."; Ch5 clear INTRO's bass "Press PLAY: drums only, no bass. Stop.", clear the snare in BREAK "Press PLAY: kicks and hats, no snare. Stop.", clear the hats in BREAK "Press PLAY: only the kicks are left. Stop."; Ch7 open hats "At 2.4.3 and 4.4.3 A4 lights and A3 does not.", bar-4 gap "At 4.4.3 B1 no longer lights."
- Do rewordings (same keys, same order): Ch2 "With − / + go to 1.1.1 and briefly press ERASE + B1, then the same at 1.3.1." (was "Use − / + until the display shows 1.1.1 and briefly press ERASE + B1. Go to 1.3.1 and briefly press ERASE + B1 again."); Ch4 "…Or, while it plays, hold ERASE + A2 as the unwanted hits sound." (was "To remove hits while the beat plays, hold ERASE and A2 while they sound; the guide calls this playback erase.", the name moved to Why: "The guide calls erasing while the beat plays “playback erase”."); Ch5 "Drop the bass from HOOK only: stopped, tap B, …" (was "…stopped, hold MAIN and check the number is HOOK, tap B, …", now Before you press).
- Risk tag removed (the step writes or plays; the erase is only a fix under Not working?): Ch3 "A4: place the reversed snare"; Ch5 "Checkpoint: the rebuilt beat", "Checkpoint: drums with the vocal", "Checkpoint: play RETURN and HOOK", "Listen to BREAK into RETURN"; Ch6 "Check the tom fill", "Optional: D1 at 4.1.1, four bars".

**The last hedges answered or marked:**

- Chapter 5, "Double C in INTRO": "The display shows Ln.4: C’s pattern is four bars long." (was "C goes from 2 to 4 bars: check the display."); "Make BREAK’s C eight bars": "…Disarm RECORD." with a new Check "The display shows Ln.8: C’s pattern is eight bars long." (was "…Disarm RECORD and check the display.").
- Chapter 6 reference, "Select a scene": "Hold MAIN + − / +. Or hold MAIN and type the scene number (OS 2.0+): a quick tap picks a scene, while keeping pad 1–9 held until P and the number show changes project" (was "…but MAIN + pad 1–9 is documented for changing project too, so check the display").
- Chapter 4, "Try a direct jump to a scene", Why: "…to change project. A quick tap switches scene; keeping the pad held until the display shows P and its number changes project, as the guide’s picture (P 1) and owners show." (was "…without explaining how the two are told apart.").
- Chapter 4, "Choose B and C to dip": its Check "You may already hear the bass and melody dip on every kick." is gone; the next step's Check covers the dip. "Set the metronome back (401)", Why: "…also come out quieter when you press softly." (was "…may also come out quieter if you press softly.").
- Chapter 4, "Switch KEYS off", Not working?: "Try MAIN, then tap A again: no source says this works either. Tell us what worked…" (was "Press MAIN and tap A again. Then tell us what worked…").
- Chapter 3, "Optional: try live chop", Why: "It doesn’t say what starts playback, and no owner report we found does, so treat this as an experiment." Its sources note adds: "One detail has no source yet, and its step says so: what starts playback in live chop."
- Troubleshooting and the cheat sheet now link the owners' report on undo, as Safety does.

**"Needs OS 2.x+"** now appears on every step that uses a newer OS feature the course names (song mode, sidechain, latch, scene numbers and cross-group chop from OS 2.0 and 2.0.1; USB audio, reverse, crop, arpeggio, key and scale, per-pad shift, pad copy and erasing one fader function from OS 2.5): 40 steps in Chapters 3–7. In the step player it is a tag beside "Optional" and "Clears notes"; the full badge shows only as a warning when Settings says your OS is older.

**Chapters 0 and 3–7 end with a recap** of the moves they taught, like Chapters 1 and 2: "Set-up done: your moves", "Your sampling moves", "Your performance moves", "Your hip-hop moves", "Your tech house moves" and "Your vocal house moves" (a step each, so those chapters have one more step). Their moves appear on the chapter's done screen and on the cheat sheet. If you had finished one of these chapters, it stays finished.

Also:

- **Checkpoints:** "Not quite" shows one card per symptom from the part's "If it doesn't" text, with a "Redo step N" button where the fix names a step.
- **Sources:** in the step player, a step without its own source shows its part's official-guide links.
- **Search** finds the cheat sheet's moves too, under a new "Cheat sheet" filter.
- **Page not found** works without JavaScript at any depth: it has a fixed `<base href="/koii-coach/">` (the script corrects it for other copies). The tests and CI now serve the site under `/koii-coach/`, as GitHub Pages does.
- **Offline copy:** the first save shows its progress ("Saving an offline copy: 40%"); one missing file still fails it as a whole, and leaves no half-filled cache.
- **Storage blocked:** the notice is an alert and adds "Install the coach (add it to your home screen: an installed site keeps its storage), or export a progress file in Settings once ticks save again."
- **Letter shortcuts** no longer fire while a radio button (Settings) has focus.
- **Icons:** the sprite drops its repeated stroke attributes (5.0 KB, budget 6 KB); `.icon` in the stylesheet already set them. The small icon beside a course count now gets the 2.5px stroke that rule asked for.
- **Budgets:** the build now enforces every size budget of plan §7.8, with decision 19's figures for CSS (17 KB), all JavaScript (68 KB) and one page's JavaScript (48 KB). Decisions 20–22 record the HTML schematic, the desktop rail and where provenance sits.
- **Tests:** `test_behaviour.py` (wake lock, the irreversible gate, shortcut exclusions, unticked and course-complete screens, storage blocked, failed offline install, Back closing the Tools sheet, exact Tab stops), `test_perf.py` (Done · Next ≤100 ms at 4× CPU, no layout shift on map and sheet taps), OS badges in every chapter, the recap migration, symptom cards, the 404 page without JavaScript, and a sturdier forced-colours check. The Tools sheet test no longer races the sheet's history entry.

## 2026.10.14.20

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.14.19 (no lesson text changed). **Written for:** OS 2.5.1.

Updates and addresses (plan 7.6 and 8.1). No lesson, step or saved-progress change.

- **"Coach updated · Reload".** When a new release takes over a page you have open, a notice offers to reload it, so the page and what it loads next come from the same release. It does not appear the first time the coach is saved for offline use.
- **One release at a time.** Every page now asks for its scripts and stylesheet with the release in the address (`player.js?v=2026.10.14.20`), so a page can no longer run with older copies that GitHub Pages lets browsers keep for 10 minutes after a release. Offline copies are unaffected: the service worker ignores the query.
- **Unknown addresses.** The "Page not found" page no longer makes five failed requests when the unknown address is several folders deep (the browser fetched its stylesheet and scripts from that folder before the page could point it at the site's root). It still works without JavaScript.
- **Tests.** `tests/test_urls.py`: every page typed in and offline, a `?query`, a step link and an out-of-date one, the old app's addresses, an unknown address three folders deep (online, with status 404 as on GitHub Pages, and offline) and its links; a new release under an open page (the notice, search in the old page, Reload). `tests/test_search.py`: "turntable", "time-stretch", "sidechain" and "vocal" find steps, "hat" never matches inside "that", search works offline and says so when the pages are not saved. The tests and CI now serve the site with `.github/scripts/serve.py`, which answers unknown addresses with `404.html` as GitHub Pages does.

## 2026.10.14.19

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2, and for the answers below on 14 October 2026: the guide's pages and pictures, its What's new notes, teenage engineering's factory-sound file, and owners' reports (the Elektronauts EP-133 threads and an [unofficial cheat sheet for OS 2.5](https://ep133.joeyh.org)), each labelled in the step. **Written for:** OS 2.5.1. No button sequence changed; one troubleshooting suggestion is new (marked below).

The last open questions, answered where a source exists. Two have no source anywhere we could find (the guide, owner-written manuals and cheat sheets, the Elektronauts and op-forums threads), and their steps now say exactly that: how KEYS mode ends, and how to remove a sidechain destination.

- **Mic: mono or stereo** (Chapter 3, Part 1): "To record a long sample, choose a source the guide marks as mono. The guide gives mic no mono or stereo label; an unofficial cheat sheet for OS 2.5 says the mic records mono, up to 40 seconds. The display’s MONO icon is “lit when a sample is mono”, so it shows which you got." (was "…choose a source the guide marks as mono; the guide doesn't say which the built-in mic counts as.").
- **Live chop** (Chapter 3, "Optional: try live chop", Why): "The guide’s picture shows Cho on the display and the first pad pressed at the very start of the sample. It doesn’t say what starts playback, so treat this as an experiment." (was "The guide doesn't say how playback starts or what the display shows, so treat this as an experiment.").
- **Time stretch off** (Chapter 3, "Stretch B1 to one bar", Why, added): "The mode can also be off: teenage engineering’s factory sounds are stored with "time.mode":"off". The stopwatch TIME icon “indicates if active sound has time stretch enabled”, so watch it as you turn X."
- **Input names** (Chapter 5, "Choose the input and level"): "Press − / + until the display shows your input: usb, in or mic. Play the song; turn X up until it’s strong, not harsh." (was "Press − / + to choose the input. Check your display. Play the song and turn X (input level) up until it is strong but not harsh."). Its Why now gives the guide's whole list: "mic; line in mono and stereo (in); resample mono and stereo (rsp); line in left or right only (L.IN, R.IN); USB mono and stereo (usb). in is the 3.5 mm input jack. X sets the input level." (was "The official list names them mic, in (line input) and usb, each with mono and stereo versions where offered.").
- **Punch-in FX** (Chapter 4, "Try the other punch-in FX", Why): "The guide doesn’t list every pad; the update notes name FX + 1 beat repeat and a tape-stop effect. Owner lists (unofficial cheat sheet, Elektronauts) agree on 2 tape stop, 4 low-pass, 5 high-pass, 6 effect send and 9 bit crush, and differ on the rest, so trust your ears." (was "The guide does not list what every pad does, so use your ears.").
- **The USB audio device's name** (Chapter 4, "Choose it as your app’s input", Not working?): "Look for a new USB audio device. The guide calls it “ko2”; owners’ tools find it by “EP-133” in its name on a Mac and “EP133” on Linux." (was "The guide does not say what name it shows, so look for a new USB audio device.").
- **Sidechain display:** a new Check in Chapter 4's "Open the sidechain settings" and Chapter 7's "Optional: open sidechain": "The display shows OUT, then S.Ch after +." (Chapter 7 had "The guide doesn’t show what the display says here, so check yours, and skip this step if it isn’t clear."). Chapter 4's "Shape the dip with X and Y" and Chapter 7's "Optional: shape the duck", Why: "The guide’s pictures show LEN on the display for the length and ShP for the shape."
- **Removing a sidechain destination** (Chapter 4, "Leave the settings and listen", Why): "The guide explains how to add sources and destinations but not how to remove them, and no owner report we found does. Holding SHIFT and pressing B or C again is the likeliest way, so listen to check. Sidechain belongs to this project, so your other projects never pump." (was "…but not how to remove them. Holding SHIFT and pressing B or C again may remove a destination, so listen to check.").
- **Leaving KEYS mode** (Chapter 4, "Switch KEYS off"): the note names the icon: "the piano icon, KEYS MODE (official icon map: …)" (was "the KEYS MODE icon (official icon map: …)"). Why: "The guide shows how to switch KEYS on but not off, and no owner report we found says either, so this step tries KEYS again. The piano icon and the pads tell you whether it worked." (was "The official guide shows how to switch KEYS on but not how to switch it off."). Not working?: "Piano icon still lit, or the pads still play one sound at many pitches? Press MAIN and tap A again. Then tell us what worked on your unit with the “This step doesn’t match my K.O. II” link, so this step can say it for sure." (was "If it is still lit, or the pads still play one sound at many pitches, check the guide's KEYS section."). **New, untested suggestion:** "Press MAIN and tap A again" has no source; it only presses keys that change nothing on their own. The second "Switch KEYS off" (Part 3) gets a Not working? that points to the first.
- **Undo goes back one change** (owners' report; the guide gives no number): Safety: "The guide doesn’t say how many changes undo goes back; owners report only one (“there is one stage of undo”), so undo before you change anything else." Troubleshooting, "I erased or changed the wrong thing": "undo works while the umbrella icon is lit, and owners report it goes back one change only." Cheat sheet: "…while the umbrella icon is lit; owners report it goes back one change only."
- Sources notes: Chapter 3: "Where the guide does not describe a detail, the step says so and names where the detail comes from instead, such as an unofficial cheat sheet." (was "…such as the exact display text for the mic source or how live chop starts, the step says so."). Chapter 4: "Where the guide is silent, the step says so and names its other source, such as an owner report. Two details have no source yet, and their steps say so: how KEYS mode ends and how to remove a sidechain destination." (was "Where the guide is silent, the step says so; examples are exact display text, how to switch KEYS off and how to remove a sidechain destination."). Chapter 6: "Where the guide doesn’t cover a detail, the step says so and names its source." (was "Where the guide is silent, the step says so: check your display.").

Every part now says what it is for and what you should have at its end:

- **Part goals** for every part of Chapters 1, 2, 5 and 6, and **part checkpoints** with an "If it doesn't" fix for every part of Chapters 1, 2 and 5 (Chapter 6 already had them). They repeat what the part's own steps and their Checks and Not working? say, with links to the step or help topic that has the details; nothing in them is a new instruction. The checkpoint card after each part now asks its question, and "Not quite" shows the fix.
- **Cheat sheet:** the song maps of Chapters 5 and 7, and Chapter 6's scenes and song list, are on the Cheat sheet too (copied unchanged from the chapters). Its headings: "Chapter 5 · Full hip-hop beat: moves and song map" (was "…: moves you will use"), "Chapter 6 · Tech house: destination, scenes and song list" (was "…: your destination"), "Chapter 7 · Vocal house: sound roles and song map" (was "…: sound roles").
- **Without JavaScript** every page reads, as before; the Rhythm lab now also shows the first-beat recipe's positions and the challenges, and says "The Rhythm lab needs JavaScript to show the grid and play it. The first-beat recipe is under “Copy it to your K.O. II”." (was "The Rhythm lab needs JavaScript.").

Faster pages:

- The published CSS and JavaScript lose their comments and indentation (`.github/scripts/minify.py`, standard library only; no renaming). A chapter page with its CSS and scripts went from about 100 KB to 66–76 KB gzipped, and Home and the tools from about 55 KB to 33–42 KB. The site check now fails above 60 KB gzipped for Home and the tools, and above 80 KB for a chapter page: the plan's 60 KB for chapter pages needs the player split into smaller scripts, which is left for later.

Saved progress (plan 8.6, the clean-up):

- For 8 weeks from this browser's first visit with this version (`since`, a new field in `koii-coach-meta`), nothing changes. After that, your place in Chapters 1 and 2 is no longer written back into `koii-coach-v2` (it keeps your OS choice, Learn marks, the placement helper and the Rhythm lab), and the old checklist keys of Chapters 5 to 7 are removed once their chapter has its own record. A progress file saved before that still loads, old keys and all.

Also: the site check fails on a same-page step link (`#s-<id>`) to a step that is not on the page; new tests for the clean-up and for reading every page with JavaScript off. CONTRIBUTING.md: where the guide is silent, look for owners' reports and label them, and say so when there is none. README: the offline fallback waits 1.5 seconds (it said 3).

## 2026.10.14.18

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2, and for the answers below on 14 October 2026 (the guide says "ver 2.5"; the newest OS on the downloads page is 2.5.1). **Written for:** OS 2.5.1. No button sequence changed.

Questions the course had left open, answered from the official guide, teenage engineering's own files and owners' reports:

- **Changing project shows P and the project number.** The guide's drawing of "change project" shows it, and owners say to keep the pad held until it appears; a quick MAIN + number switches scene instead (OS 2.0 and later). Chapter 1: "When it changes, it shows P 6: P and the project number." (was "Owners report the display briefly shows P 6; the official guide does not describe it, so trust the silent pads."). Chapter 6: "a quick press goes to that scene. Try step 1 again and keep pad 9 held until the display shows P 9, P and the project number." (was "the guide does not say how the device tells the two apart, so check your display and try step 1 again"). Chapters 0, 3, 5 and 7: "until the display shows P 6" (P 7, P 8, or P and the project's number) (was "check your display" or "check again").
- **Lock mode:** "Switch off, then on again without holding any button: that is the only way out of lock mode, as there is no unlock setting." (was "The official guide does not describe a separate unlock step.").
- **Which OS is installed:** "The K.O. II does not show its OS version on its own display: the update utility reads it and tells you whether your unit is up to date or which version is available, and the EP sample tool shows it too." (Troubleshooting; Chapter 0's Part 3 goal says the same) (was "The official guide does not describe a way to show the installed version on the device itself.").
- **Sound edit pages:** Chapter 7: "The six pages show as SND, TRI, ENV, TIM, MID and GRP: sound, trim, envelope, time, midi and mute group. Stop at TRI." (was "…so check your display").
- **Pattern length:** the display shows it as Ln and the bars. "The display shows Ln.2: C's pattern is two bars long." in Chapters 2, 4, 5 and 6 (was "The display shows the pattern length change from 1 to 2"), and "The display shows Ln.4: the pattern is four bars long." in Chapter 7 (was "Check your display: the pattern length should now be 4 bars.").
- **Claps:** Chapter 6: "Claps are with the percussion: in the factory library, 300 to 316 are claps." (was "the guide does not list claps separately, so … try the percussion range 300–399"), from teenage engineering's factory-sound file for the EP sample tool.

Steps that now fit the screen without scrolling, on every phone size the course is tested at:

- Six "Before you press" warnings are shorter, with the explanation moved to Why or a note: "Always press SHIFT + SOUND briefly: held, it saves your edits, and on the trim page it crops the file." (Chapter 3); "Never hold SHIFT + SOUND on this page: it crops the recording on disk for good." (Chapter 5, with "C2 (and later D1) play the same recording, so a crop would cut them too." under Why); "If 9 already holds work you want to keep, back it up first with the EP sample tool (Chapter 0, Part 4)." (Chapter 6, with the help link under Not working?); "Never hold SHIFT + ERASE while switching the unit on: that formats the drive." and "With the unit already switched on, press SHIFT + ERASE …" (Chapter 6, the same words, the first sentence joined to the press); "Don’t hold RECORD while you move the fader, or FX while you press a group button." (Chapter 7, with what each would do under Why).
- Chapter 4: "Open timing correct" and "A4: move the layer six ticks later" are two steps now (111 steps), with its warning on the second. Your ticks carry over.
- The Check comes before the placement helper and the target rhythm in Chapter 1, before the recap's moves in Chapters 1 and 2, and before the fields for your notes. On shorter phones (up to 760px tall) and with Larger text, the card is tighter and an optional run's skip offer sits after the step.

Also:

- **The control map is now a schematic of the unit's top**, drawn from teenage engineering's top-view photo: every key, pad and knob where it is, the ports, the battery lid, the speaker and mic, the display, VOLUME, the fader, and the small words above the pads that FADER picks. It is labelled as a schematic, not to scale and not an official drawing. The arrow keys move between controls as they sit on the unit. The keys panel and Tools › For this step use it too, and its display shows what yours should show in that step (TRK, 1.1.1 and so on).
- Accessibility: placed positions in Chapter 1's placement helper are now readable (they were dimmed below 4.5:1); "More below" is no longer a Tab stop, since it hides itself as you scroll.
- The site check now fails when a part's step numbering (`<ol start>`) does not follow on from the part before. New tests: the fold gate for every step and an accessibility suite (axe-core, keyboard-only part, 320×256, forced colours).

## 2026.10.14.17

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No instruction changed.

- New `CONTRIBUTING.md`: the step markup, the glance budget, risky presses, adding and splitting steps without losing anyone's ticks, releasing, and trying a change on the unit.
- Saved progress: when a chapter has more than one batch of split steps, they are now applied oldest first, whatever their order in `progress.js`. Every chapter has one batch so far, so nothing changes for anyone today; a second batch listed first would have been applied again on the next visit and could re-tick a part you had unticked.

## 2026.10.14.16

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No instruction changed.

- **Your notes.** Where a step asks you to write a scene or sample number down (DRUMS, INTRO, GROOVE, V1 to V5 and so on: 37 steps in Chapters 1 to 7), a small LCD-style field under the step keeps it in the coach too. Paper still works; the fields are optional. Later steps that name that scene or sample show "Your notes: GROOVE 5", and "Get back in" lists them after a break, in every chapter now, not only Chapter 4.
- Notes are kept per project, so Chapters 1, 2 and 4 (all in project 6) share theirs, and an INTRO in Chapter 6 is not the INTRO of Chapter 2. They are saved in this browser as `koii-coach-notes` (a new key), go into the progress file, and Reset all progress clears them with the rest (and its Undo brings them back).

## 2026.10.14.15

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No instruction changed.

- **A phone on its side** (at most 480px high): the left 40% of the screen shows the step's keys on the control map, lit and numbered in press order, with the list of presses below; the step fills the rest, with its moves at 20/28. On 641 of the 647 steps every move and Done · Next fit without scrolling; the other six have a long "Before you press" warning and need a short scroll. A skip offer for optional steps moves below the step there.
- **Desktop** (from 1200px): the same keys panel sits on the right of the step, and tapping a key explains it in a box under the map.
- The lit keys, here and in Tools › For this step, now come from the Do lines only. Before, the keys in a "Before you press" warning were lit too, so "Never hold SHIFT + SOUND on the trim page" showed SHIFT and SOUND as the first presses.
- The control map is a schematic, not the exact layout of the K.O. II; a drawing checked against the unit comes later.

## 2026.10.14.14

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No instruction changed.

The Rhythm lab, rebuilt for the phone. Your saved pattern carries over.

- On a phone, tabs pick one sound (Kick ●, Snare ■, Hat ▲, Bass ◆, each with its number of hits) and its bar shows as a 4×4 grid with a row for each beat, so the cell in row 2, column 3 is 1.2.3, as on the K.O. II's display. Cells are about 64px tall. On a wider screen the four sounds are rows of 16 cells, as before, now 44px.
- The grid sits right under Play. While it plays, a lime ring marks every cell of the step that is sounding, and an LCD beside Play shows its position.
- Tempo and volume are −/+ buttons with an LCD value (tempo one BPM at a time; hold to go faster), instead of sliders.
- With a keyboard the grid is one Tab stop: the arrow keys move between cells (Up and Down move a beat on a phone, a sound on a wider screen), Home and End go to the ends of a row, and Space adds or removes a hit. Tempo and volume take the arrow keys and Page Up and Down.

## 2026.10.14.13

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No instruction changed.

- Settings › While practising has two new choices. **Text size in the steps: Larger** sets each step's moves at 30/40 instead of 24/32 to 28/36 (and the Check and titles at 22/30), for reading at arm's length. **Done · Next button: On the left** puts the main button under your left thumb, with Tools and Back to its right. Both are saved in your settings (`koii-coach-prefs.text` and `.hand`, new fields: nothing that was there changes), and Reset settings puts them back.
- Offline: when the network has not answered within 1.5 seconds (was 3), a page opens from the offline copy, and the network answer still refreshes that copy for next time.

## 2026.10.14.12

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No button sequence changed: steps were split and their sentences moved; the few words that changed are listed.

Chapter 2 · Make it a song, rewritten for a glance, like every other chapter now (24 steps became 33). Your ticks, links and a place carried over from the old app all follow, as for Chapter 1. Thirteen steps that were already short stay as they were.

- Each step has a title, at most three moves and one short Check. The OS badge stays under the title of each song-list step, and the recap is two steps that both tick themselves on the chapter-complete screen.
- Changed wording: "Do its Part 4, “Add a bass”, first." (was "its two bass steps", now more); the scene check is "INTRO: drums only. BEAT: drums, bass. MELODY: drums, bass, melody. BREAK: melody, snare, hats." (was "drums and bass" and so on); "Choose INTRO for position 2." and "Do the same four more times: 3 BEAT, 4 BEAT, 5 MELODY, 6 MELODY." (was "Do this five times: 2 INTRO, …"), so adding position 2 is a step of its own; "Release SHIFT, step through with − / +: exactly 10 positions, matching the song map." (was "… in the order of the song map"); "… in that order; about 43 seconds, then it stops." (was "…, then it stops by itself"); the recap's Check is split between its two steps ("You changed one thing yourself." on the second), its first sentence reads "Make one change from memory, without reading this app." (was "Then make …: for example …"), and the example is a note; and "repeat the two steps before this one in INTRO" (was "the previous step").
- Chapters 6 and 7: the same fix for adding song positions. The first step is now "Add position 2: INTRO" and ends "Choose INTRO for position 2."; the next is "Add positions 3 to 12" with "Repeat for positions 3–4 GROOVE; …" in Chapter 6 (was "2 INTRO; 3–4 GROOVE; …") and "Positions 3 to 12" with "Set positions 3 and 4 to INTRO, …" in Chapter 7 (was "2–4"), so nobody adds position 2 twice.

## 2026.10.14.11

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No button sequence changed: steps were split and their sentences moved; the few words that changed are listed.

Chapter 1 · First beat, rewritten for a glance, like Chapters 0 and 3 to 7 (23 steps became 40). Your ticks, links and a place carried over from the old app all follow: the old position still maps to the same step, and progress.js lists the new page order.

- Each step has a title, at most three moves and one short Check. Seven steps that were already short stay as they were. The pattern figures, the placement helper, "Hear this recipe" and the recap's six moves stay with the step that uses them.
- The optional live recording is eight optional steps, still skipped together from its first step; erasing a single note is its own step, so the amber "Clears notes" tag sits only there. The recap is two steps, and both tick themselves on the chapter-complete screen.
- Changed wording: "A1 lights at all four positions, …" (was "at each of the four positions"); "The placement helper lists them one by one." and "“Hear this recipe” gives a rough reference." (both said "below", but now come after it); the drum beat's Check is "All three rows match the target rhythm above.", with the positions it replaces kept as a note; "You hear your extra snare while you tap it; it disappears when you stop tapping." (was ", and it disappears"); "The extra snare now repeats by itself near the end of every loop." (was "After you stop recording, the extra snare repeats …"); "do the optional scene-change step first", now a link (was "the optional step before this one"); and "so in the performance steps that follow you can pick the next scene a little early" (was "in the next step").

## 2026.10.14.10

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No button sequence changed: steps were split and their sentences moved; the few words that changed are listed.

Chapter 0 · Set up your K.O. II, rewritten for a glance, like Chapters 3 to 7 (36 steps became 53). Your ticks and links carry over.

- Each step has a title, at most three moves and one short Check; reasons and fixes are under "Why" and "Not working?".
- Warnings now stand before the press they guard: "Don't unplug the cable …" before installing the update, "Don't use its delete or restore features today." before saving the backup, the input socket before plugging in headphones, X and Y before SOUND, and "never format" before the alternatives. An erased library's fixes moved under "Not working?" of "Library complete? Move on", so most people tick one step there.
- Changed wording: "You should hear them from the built-in speaker." with "A new K.O. II comes with sounds in projects 1–5." under Why (was one sentence joined by "so"); "The MAIN icon is lit and the display shows a position such as 1.1.1." with "The three numbers are bar, beat and step." as a note (was "a position made of three numbers, such as 1.1.1 (bar, beat, step)"); "The SOUND icon lights and the display shows the sample number of the selected pad." (was "a number, the sample on the selected pad"); "Read the icon table below." (was "Then read …"); "The USB MIDI icon lights, and the utility finds your K.O. II." (was "the USB MIDI icon on the K.O. II lights"); and "(the tool itself suggests Chrome or Brave)" and ", and use − and + to hear a few neighbours each time" became their own sentences.

## 2026.10.14.9

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No button sequence changed: steps were split and their sentences moved; the few words that changed are listed.

Chapter 7 · Vocal house, rewritten for a glance, like Chapters 3 to 6 (79 steps became 106). Your ticks and links carry over.

- Each step has a title, at most three moves and one short Check; reasons and fixes are under "Why" and "Not working?".
- Choosing the project is three steps: choose, back up a project you reuse, open it. Clearing old patterns is its own step, after the one that listens, so the amber "Clears notes" tag sits only on the step that clears, and emptying D1 to D5 in a reused project 7 is a step of its own.
- Changed wording: "Is one of projects 6–9 still empty …" (was "one of them", whose list moved to Why); "go back to step 3" and, in the Part 1 recap, "after step 7" and "repeat step 3 before step 7" (were steps 1 and 4, before the split); "Only when you hear the reused project's own old music, and only after you have backed it up." now stands before the press, and "In project 7, that is your Chapter 3 voice kit or the bounced beat." is a note (both were one sentence with the press); "Wrong project? Press SHIFT + B at once while the umbrella is lit." with "Or restore your backup." as a note (was "Erased in the wrong project? …, or restore your backup."); "The Chapter 3 recordings stay in the sound library." (was "The 07 recordings", an old chapter number); "Load the vocals onto D1 to D5 by number, as for audio files above." (was "as in the step above"); "Write the number beside V1." (was "Write it"); and the asides in brackets after "will be", "tap its pad", "the source", "a metronome clicks" and "USB audio output" became their own sentences or notes.
- Chapter 0: "Go back to its part (Part 3 update, Part 4 backup, Part 5 project)." (was "its section (03 update, 04 backup, 05 project)"). The site check now also catches a zero-padded old number after "the" or "(".

## 2026.10.14.8

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No button sequence changed: steps were split and their sentences moved; the few words that changed are listed.

Chapter 6 · Tech house, rewritten for a glance, like Chapters 3 to 5 (61 steps became 108). Your ticks and links carry over.

- Each step has a title, at most three moves and one short Check; reasons and fixes are under "Why" and "Not working?".
- Where a step copied a scene and then cleared pads in it, the copy is now its own step, so the amber "Clears notes" tag sits only on the step that clears. Playing the sections by hand is three optional steps, ending with setting 410 again.
- Changed wording: "In SOUND with group A, tap pad 2." (was "Still in SOUND …"); "Tap pad 3, hold SOUND …" (was "Then tap pad 3 …"); the asides in brackets after "clap or snare", "Tap B", "turn X to oneshot" and "press SHIFT + A once" became their own sentences; the four extra drum sounds are listed as "A4: a short open hat (200–299)." and so on (was one sentence joined by semicolons); "The tom fill now plays by itself at the end of every four bars. It turns the phrase back to bar 1." (was "…, turning the phrase back"); "Kick on every beat, the bass bouncing, B2 answering at the end of bar 4." (was "You should pick out the kick on every beat, and the bass should bounce, with B2 answering …"); "PLAY gives kick, clap, rim, shaker, tom fill and hook, no bass or hats." (was "… and the hook, with no bass and no hats"); "About 3:30, then the song stops by itself at the end." with "28 positions × 4 bars = 112 bars: about 3 minutes 30 seconds at 128 BPM." under Why; "Set the bass B1/B2 under the kick, and the vocal C1 …" (was the end of the levels sentence); the low-end fix is three steps, with "Never hold SHIFT + SOUND on the trim page." (was "never hold SHIFT + SOUND there", in brackets) before the press; and "It plays from there through BREAK and BUILD into DROP A." (was "… and press PLAY to play from there …").

## 2026.10.14.7

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.13.2. **Written for:** OS 2.5.1. No button sequence changed: steps were split and their sentences moved; the few words that changed are listed.

Chapter 5 · Full hip-hop beat, rewritten for a glance, like Chapters 3 and 4 (61 steps became 109). Your ticks and links carry over.

- Each step has a title, at most three moves and one short Check; reasons and fixes are under "Why" and "Not working?".
- Where a step copied a scene and then cleared a pad in it, the copy is now its own step, so the amber "Clears notes" tag sits only on the step that clears. Playing live with scene changes on the bar is four optional steps, ending with setting 410 again.
- Changed wording: "Hold RECORD and tap pad 3 at every .1 and .3: 1.1.1, … and 1.4.3." (was "write pad 3 (hold RECORD, tap pad 3) at 1.1.1, … and 1.4.3: every .1 and .3"); "you hear it through the K.O. II" (was "you should hear it"); five Checks now start with what you hear, without "You should hear" ("The whole phrase, first word to last, then only the ANSWER word."; "Drums and bass under the phrase in bar 1, the answer in bar 2."; "Drums, bass (unless you dropped it), phrase and answer, every word clear."; "Your kick rhythm with two hats per bar, and no snare, bass or vocal."; "INTRO, VERSE, HOOK, BREAK, RETURN and END, about 2:51, then it stops." (was "about 2 minutes 51 seconds, and then it stops by itself")); "Wrong pad? Press SHIFT + B at once, while the umbrella is lit." (was "Cleared the wrong pad? …"); jumping to bar 2 and then to 2.3.1 are two steps, with "The display shows 2.1.1." as the first one's Check; "C goes from 2 to 4 bars: check the display." with the guide's words under Why (the same sentence, turned round); "(USB audio out)" became the note "That is USB audio out."; two steps that began "Then" now start with the action ("Go to 1.1.1 …", "Tap C, press FX …"), and "that is C's reverb send" moved to Why; the list of sections in the finished song moved to Why; and a fix that began "If it doesn't:" now starts with a capital letter.

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
