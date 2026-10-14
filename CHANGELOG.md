# Changelog

What changed in each release of K.O. II Coach. Versions are dates (`YYYY.MM.DD`, with `.2`, `.3` and so on for another release on the same day). The same value is used for `VERSION` in `sw.js` and `version` in `site.js` (`courseInfo.version` in `course.js` before 2026.10.14.2).

Each release records the date its instructions were checked against the [official EP-133 guide](https://teenage.engineering/guides/ep-133), and which firmware version the guide described then. If your device runs a newer OS and something differs, follow the official guide and [report the step](https://github.com/efosamark/koii-coach/issues/new?template=wrong-instruction.yml).

## 2026.10.14.26

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.14.23; the pad layout of the new pad plans is the control map’s (taken from teenage engineering’s top-view photo, decision 20). **Written for:** OS 2.5.1. No button sequence changed; one press dropped in 2026.10.14.25 is back (below).

Fixes from a sixth independent review of the overhaul.

**Back as it was:** Chapter 0, "Check project 6 is empty": "Tap A, then A1, A2 and A3 again, then tap B, C and D and try a few pads in each." In 2026.10.14.25 the pad renaming dropped its "Tap A" ("Tap A1, A2 and A3 again…"), which the changelog wrongly called the same presses; after choosing a project nothing shows that group A is still selected. Also missing from that entry: Chapter 0’s step title "Tap A, then A1, A2 and A3" (was "Tap A, then pads 1, 2 and 3").

**The start screen fits one screen** (plan 5.2). On a first visit at 390×844 the Parts heading now sits above the action bar in every chapter (526–749 px; at 360×740, 526–825 px), with the safety notes open:
- "You will make", the promise and "Before you start" are shorter (two lines, one-line rows; listed below), and the OS row joins the project row in Chapters 3 and 6.
- The chips are the plan’s: "2–3 h" (was "About 2–3 hours", which the eyebrow above already says), the project, the OS and "Formerly"; the chip with the chapter’s step and part count ("… steps in … parts") is gone (the parts list counts each part’s steps).
- The safety box: "1 action here can’t be undone" (was "… in this chapter cannot be undone"; "Safety: read this first", was "Safety: read this before you start"), two short points (Chapters 0, 3, 4, 6 and 7), and "More below the parts, and in Safety and erasing." The notices in full are under "About this chapter in full" (they were behind "The full safety notes"). Chapter 5, with no short list, shows its notice in the box as before; the line under it reads "Safety and erasing lists every action that erases something." (was "… erases something, and its undo.").

**Pad plans** (plan 5.2, 6.4 PadGrid): Chapters 1–7 show each group’s 12 pads as a mini grid laid out as on the unit (7 8 9 / 4 5 6 / 1 2 3 / . 0 ENTER), the used pads filled, with the roles in words under each grid ("A1 kick · A2 snare · A3 hat"). They sit in "Reference for this chapter" ("Your pad plan", a new card in Chapters 1, 2, 4, 5 and 6; in Chapter 3’s "Your pad plan" and Chapter 7’s "Sound roles") and on the cheat sheet ("Pad plan" in each chapter). Chapter 3’s group C says where its slices go as the chapter does: "slices fill the pads from the bottom left".

**Tools from 1024 px:** with no right panel (1024–1199 px, or a view without one), the Tools sheet docks on the right and the page makes room for it instead of covering the step card (plan 5.7). **T** opens Tools as soon as the page has loaded, also before the sheet’s script has (player.js registers it now).

**Offline:** a release’s offline copy only ever stores files of that release; a page of another release can no longer leave its scripts there under this release’s name (plan 7.6).

**Content:**
- Checks you can see or hear, the last of their kind: Chapter 0 "Step through the beat" ("The last number goes up by one with each press.", was "You are stepping through the beat."), and the steps listed below in Chapters 2, 3, 6 and 7, using the course’s icon table (SYSTEM, MAIN) and display readings (`Ln.4`).
- Do lines that are actions: Chapter 6 "A5 and A6: a rim and a shaker", "A7: a tom", "Optional: pick each next scene early"; Chapter 7 "Voice test" and "Optional: shape the duck".

**Docs:** the README explains the `?v=` release tags and the previous release’s offline copy; CONTRIBUTING’s Releasing section too.

**Tests:** every chapter’s Parts heading above the action bar on a first visit at 390×844; the full safety notice under "About this chapter in full"; the pad plans (12 pads in the unit’s order, a legend) on seven chapters and the cheat sheet; Tools docked beside the card at 1100 px.

**Step by step** ("was" gives the old text):

- **Chapter 0** (2 steps):
  - “Step through the beat”: Check: “The last number goes up by one with each press.” (was “You are stepping through the beat.”).
  - “Check every group is silent”: Do: “Tap A, then A1, A2 and A3 again, then tap B, C and D and try a few pads in each.” (was “Tap A1, A2 and A3 again, then tap B, C and D and try a few pads in each.”).
- **Chapter 2** (1 step):
  - “Make a copy for the breakdown”: Check: “Holding MAIN shows a new number. Press PLAY: it sounds like MELODY. Stop.” (was “You are in BREAK, and PLAY sounds exactly like MELODY. Stop.”).
- **Chapter 3** (2 steps):
  - “Set the grid to 16 steps”: Check: “The display showed 16, not 16T; the MAIN icon is lit again.” (was “This is the same 90 BPM, 16-step setup as Chapter 1.”).
  - “Set the rate back to hi (502)”: Check: “The SYSTEM icon goes out.” (was “You are back on 502.”).
- **Chapter 6** (6 steps):
  - “A5 and A6: a rim and a shaker”: Do: “Load A5 and A6 the same way: a dry rim or woodblock click on A5, a soft shaker on A6 (both 300–399, percussion).” (was “A5: a dry rim or woodblock click (try 300–399, percussion). A6: a soft shaker (300–399).”).
  - “A7: a tom”: Do: “Load A7 the same way: a short tom or percussion hit (300–399).” (was “A7: a short tom or percussion hit (300–399).”).
  - “Turn the rim down”: Check: “Tapping A5 gives a tiny, quiet click.” (was “A5 is now a tiny, quiet click.”).
  - “Make C four bars long”: Check: “The display shows Ln.4: C’s pattern is four bars long, still empty.” (was “C is now four bars long and still empty.”).
  - “Optional: pick each next scene early”: Do: “While a scene plays, hold MAIN and press − / + before its pattern ends to pick the next scene.” (was “Scene changes now wait for the end of the pattern, so you can pick the next scene early with hold MAIN + − / +.”).
  - “Optional: instant scene changes again (410)”: Check: “The SYSTEM icon goes out.” (was “Scene changes are instant again.”).
- **Chapter 7** (4 steps):
  - “Optional: shape the duck”: Do: “Turn X to set how long the duck lasts and Y its shape, then press MAIN.” (was “X sets how long the duck lasts, Y its shape. Press MAIN.”).
  - “INTRO: clear the bass and vocals”: Check: “Press PLAY: INTRO plays drums only, no bass or vocals. Stop.” (was “INTRO is now drums only: no bass, no vocals.”).
  - “Voice test”: Do: “Voice test: play the track again and listen to the D1 hook.” (was “Voice test: the D1 hook should be clear and stick in your head.”).
  - “Record one full pass”: Check: “Your app plays back the full 4-minute track.” (was “You have a recording of the full 4-minute track.”).

**Outside the steps** ("was" gives the old text; " · " separates list items):

- **Chapter 0**:
  - Promise: “Get your K.O. II ready: hear it, read its screen, update and back it up.” (was “Get your K.O. II ready: hear it, read its screen, update it and back it up.”)
  - You will make: “You will have: a K.O. II on OS 2.5.1, backed up, with your course project chosen.” (was “You will have: a K.O. II on OS 2.5.1, backed up on your computer, with an empty project chosen for the course and the factory sounds explored.”)
  - Before you start: “4 AAA batteries or a USB-C charger” · “Headphones or a speaker” · “A computer with Chrome, a data cable” · “Paper and a pencil” (was “Power: 4 AAA batteries, or USB-C and a 5 V, 1 A charger” · “Headphones or a speaker (the built-in speaker works to start)” · “A computer with Chrome and a USB-C cable that carries data” · “Paper and a pencil for project and scene numbers”)
  - Safety box: “Never hold SHIFT + ERASE as you switch on.” · “Nothing in Parts 1–7 erases music.” (was “Switch on with your hands off the buttons: SHIFT + ERASE held while switching on formats the drive, and MAIN starts lock mode.” · “SHIFT + ERASE with the K.O. II already on is safe: it opens system settings.” · “Nothing in Parts 1–7 erases music.”)
- **Chapter 1**:
  - You will make: “a one-bar drum and bass loop at 90 BPM, kept as DRUMS and BEAT.” (was “a one-bar drum and bass loop at 90 BPM, kept as two scenes, DRUMS and BEAT, and a tiny performance with them.”)
  - Before you start: “Your K.O. II, set up (Chapter 0)” · “Empty project 6” · “Paper and a pencil” (was “Your K.O. II, set up in Chapter 0” · “Empty project 6” · “Paper and a pencil for two scene numbers”)
- **Chapter 2**:
  - Promise: “Turn your beat into a 16-bar song with an intro, a melody and a breakdown.” (was “Turn your beat into a 16-bar song: an intro, a melody, a breakdown and a song list.”)
  - You will make: “a 16-bar song, about 43 seconds, from four scenes in a song list.” (was “a 16-bar song, about 43 seconds at 90 BPM, from four scenes in a 10-position song list.”)
  - Before you start: “Your Chapter 1 beat, in project 6” · “BEAT’s number on your paper” · “OS 2.0 or newer” (was “Your beat from Chapter 1, in project 6” · “BEAT’s scene number on your paper, and a pencil” · “OS 2.0 or newer for the song list”)
- **Chapter 3**:
  - Promise: “Record your own sounds, chop them and resample a beat.” (was “Record your own sounds, build a kit from them, chop a recording and resample a beat.”)
  - You will make: “a drum kit from your voice, chopped slices and a bounced beat.” (was “a drum kit from your own voice, a reversed snare, a recording chopped into slices and your whole beat bounced onto one pad, in project 7.”)
  - Before you start: “Empty project 7, OS 2.5 or newer” · “Headphones or a speaker” · “Optional: a phone and a cable” (was “OS 2.5 or newer” · “Empty project 7, and Chapters 1 and 2 done” · “Headphones or a speaker” · “For Part 3, optional: a phone with a 3.5 mm or USB-C cable”)
  - Safety box: “Never hold SHIFT + ERASE as you switch on.” · “Held, ERASE + SOUND deletes a sample.” (was “Press SHIFT + ERASE only with the K.O. II already on: held while switching on, it formats the drive.” · “Held, ERASE + SOUND deletes a sample and SHIFT + SOUND on the trim page crops one. Neither can be undone.” · “Back up first, and work in empty project 7.”)
- **Chapter 4**:
  - Promise: “Play the K.O. II live: feel, scales, rolls, effects and scene changes.” (was “Play the K.O. II live: feel, a bassline in a scale, rolls, effects and scene changes.”)
  - You will make: “a live performance of your own beat, and a recording of it.” (was “a live performance of your own beat: played with feel, with a bassline in a scale, rolled hats, effects and live scene changes, and a recording of it.”)
  - Before you start: “Project 6 from Chapters 1–2” · “Headphones or speakers” · “Paper and a pencil” · “Part 9: a USB-C or 3.5 mm cable” (was “Project 6 with your scenes and song list from Chapters 1–2” · “Headphones or speakers” · “Paper and a pencil for scene numbers” · “For Part 9: a USB-C cable, or a 3.5 mm cable to a recorder”)
  - Safety box: “Work only in practice copies.” · “Never use ERASE + SOUND: it deletes a sample.” (was “Work only in practice copies: every part starts by making one.” · “Never use ERASE + SOUND: it deletes a sample from the device.” · “Press SHIFT + ERASE only with the K.O. II already on: held while switching on, it formats the drive.”)
- **Chapter 5**:
  - You will make: “a 64-bar hip-hop beat around a phrase you sampled, in project 8.” (was “a 64-bar old-school hip-hop beat with a sung phrase you sampled, six scenes and a six-position song list, in project 8.”)
  - Before you start: “Empty project 8” · “Headphones or speakers” · “A phone and a cable, or the mic” · “Paper and a pencil” (was “Empty project 8” · “Headphones or speakers on the K.O. II’s output” · “One source: a phone over USB-C or 3.5 mm, or the built-in mic” · “Paper and a pencil for scene numbers”)
- **Chapter 6**:
  - Promise: “Build a tech-house track at 128 BPM with two drops and a breakdown.” (was “Build a 3½-minute tech-house track at 128 BPM, with two drops and a breakdown.”)
  - You will make: “a 3½-minute tech-house track: 28 song positions, 112 bars.” (was “a tech-house track at 128 BPM, about 3:30 long, with two drops, a breakdown and a build: 28 song positions, 112 bars.”)
  - Before you start: “Empty project 9, OS 2.0 or newer” · “Headphones or a speaker” · “Your voice, or a phone and a cable” · “Paper and a pen” (was “OS 2.0 or newer (OS 2.5 for a few optional steps)” · “Empty project 9” · “Headphones or a speaker” · “For the vocal hook: your voice, a phone over USB-C, or a line cable” · “Paper and a pen for scene numbers”)
  - Safety box: “Stop playback before you edit notes.” · “Never use ERASE + SOUND: it deletes a sample.” (was “Stop playback before every position-by-position edit.” · “Never use ERASE + SOUND: it deletes the sample from the device.” · “SHIFT + B undoes a cleared note or pad while the umbrella icon is lit.”)
- **Chapter 7**:
  - Promise: “Build a 4-minute house track around five vocal samples of your own.” (was “Build a 4-minute house track at 128 BPM around five vocal samples of your own.”)
  - You will make: “a 4-minute house track at 128 BPM: 32 song positions, 128 bars.” (was “a 4-minute house track at 128 BPM built around five vocal samples of your own: 32 song positions, 128 bars.”)
  - Before you start: “OS 2.5.1” · “Headphones or speakers” · “Five short vocal sounds” · “Paper and a pencil” (was “OS 2.5.1” · “Headphones or speakers” · “Five short vocal sounds: your voice, a phone or audio files” · “Paper and a pencil for project, scene and sample numbers”)
  - Safety box: “Never use ERASE + SOUND: it deletes a sample.” · “SHIFT + B undoes a cleared note.” (was “Never use ERASE + SOUND: held until SND blinks, it deletes the sample from the device.” · “SHIFT + B undoes a cleared note or pad while the umbrella icon is lit.”)
- **Pad plans**, new text: the cards’ heading "Your pad plan" (Chapters 1, 2, 4, 5 and 6) and the cheat sheet’s "Pad plan" (Chapters 1–7). Chapter 3’s group headings are now "A · your drum kit", "B · resampled bounces", "C · chopped slices", "D · raw recordings" (were "Group A · your drum kit" and so on), on the page and the cheat sheet; its group C legend adds "slices fill the pads from the bottom left". Each grid’s caption and legend, as on the page and the cheat sheet:
  - Chapter 1: A · drums: “A1 kick · A2 snare · A3 hat”; B · bass: “B1 bass”; C · not used yet: “Empty in Chapter 1”; D · not used yet: “Empty in Chapter 1”.
  - Chapter 2: A · drums: “A1 kick · A2 snare · A3 hat”; B · bass: “B1 bass”; C · melody: “C1 melody”; D · not used yet: “Empty in Chapter 2”.
  - Chapter 3: A · your drum kit: “A1 kick, A2 snare, A3 hat (Part 2), A4 reversed snare (Part 5)”; B · resampled bounces: “B1 your beat on one pad, B2 the same with a filter sweep (Part 7)”; C · chopped slices: “Your spoken count, cut into four slices (Part 6); slices fill the pads from the bottom left”; D · raw recordings: “D1 first sample (Part 1), D2 count and D3 phone (Part 3), D4 and D5 the quality test (Part 4)”.
  - Chapter 4: A · drums: “A1 kick · A2 snare · A3 hat · A4 a click layer”; B · bass: “B1 bass”; C · melody: “C1 melody · C2 the arpeggio sound”; D · not used: “Empty in Chapter 4”.
  - Chapter 5: A · drums: “A1 kick · A2 snare · A3 hats”; B · bass: “B1 bass”; C · vocal: “C1 the phrase · C2 the answer word”; D · twist: “D1 the repeated word”.
  - Chapter 6: A · drums: “A1 kick · A2 clap · A3 closed hat · A4 open hat · A5 rim · A6 shaker · A7 tom”; B · bass: “B1 bass · B2 the answer note”; C · vocal hook and synth stab: “C1 vocal hook · C2 synth stab”; D · optional riser: “D1 riser”.
  - Chapter 7: A · drums: “A1 kick · A2 clap · A3 closed hat · A4 open hat”; B · bass: “B1 bass”; C · stays empty: “Empty in Chapter 7”; D · your vocals: “D1 V1 hook · D2 V2 answer · D3 V3 chop · D4 V4 texture · D5 V5 phrase”.

## 2026.10.14.25

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.14.23 (its Play and record, Functions and What’s new pages, re-read from saved copies on 14 October 2026). **Written for:** OS 2.5.1. No button sequence changed: the copy steps below now name keys that were already pressed, and pads now carry their group.

Fixes from a fifth independent review of the overhaul.

**The chapter start screen fits about one screen** (plan 5.2). Under the title: a one-line promise, the chips, "You will make", and "Before you start" as three to five rows with icons. The safety notes open on a first visit as a short list, with "The full safety notes" one tap further and a link to Safety and erasing. Then the parts. The long introduction, "What you need" and the other notes wait in "About this chapter in full" under the parts, next to "Reference for this chapter" (which also moved below the parts, as the plan has it). All steps, print and pages without JavaScript still show the full text as written. On a phone, the parts now start at 660–820 px in Chapters 1, 2 and 5, and at 1,070–1,240 px while the safety notes are open (they were at 950–2,660).

**All steps** puts "You’re on Part N, step X of M" with a Continue button under the chapter title (plan 5.10), so you no longer scroll past the preamble to find your place.

**Desktop Tools** (plan 5.7): from 1,200 px wide, beside a step, the Tools sheet takes the right panel’s place instead of covering the step card. The right panel is 360 px wide, as the plan sets (it was 320).

**Faster chapter pages:** the Tools sheet and the keys panel (`toolsheet.js`) load once the page is idle, or at once when Tools is pressed first. Every chapter page is about 6 KB lighter (now 64–75 KB). Decision 19 records this, and the CSS budget goes from 17 to 18 KB for this release’s start screen, banner and panel.

**Offline across a release** (plan 7.6): the service worker keeps the previous release’s offline copy for one more release, and a script or stylesheet asked for with its release (`search.js?v=…`) comes from that release’s copy first. A page left open across an update still gets its own release’s search and scripts. Offline fallbacks use only the current release’s copy.

**Content:**
- **Pads by group** (plan 6.7): 84 pad keycaps and a few plain-text pad names in Chapters 0, 1, 5, 6 and 7 now carry their group ("tap B, hold ERASE + B1"; "A1, A2 and A3"; "SOUND: select A1", was "SOUND: select pad 1"; "B: select B1 in SOUND", was "B: select pad 1 in SOUND"). Same pads, same presses. "pad N" stays only where the group does not matter: choosing a project, punch-in effects and picking a sidechain source; CONTRIBUTING says so.
- **Copy steps name their keys** (Chapter 4): "Copy BEAT as FXJAM" and "Copy BEAT as EDIT" say "Hold MAIN, select BEAT, release and press SHIFT + MAIN", so the keys panel lights them.
- **Chapter 4, "Copy BEAT as ROLL, clear the hats" is two steps**, as CONTRIBUTING asks of a copy followed by a clear: "Copy BEAT as ROLL" (step 35, its old id) and "ROLL: clear the hats" (step 36, new), with "Before you press: Hold MAIN first: the number must be ROLL." and the risk tag on the clear only. The same presses, in the same order. If you had ticked the old step, both are ticked (migration v4), and Chapter 4 now has 113 steps.
- **Clearing four patterns** (Chapter 7, "Old music? Clear the old patterns"): the undo now says what it can do: "SHIFT + B restores only the last group; the backup has the rest." (was "Wrong project? Press SHIFT + B at once while the umbrella is lit.").
- **Checks you can see or hear:** five more, from the copy steps, "Check that BEAT plays" and the Chapter 5 source checkpoint; "Write down where your sounds live" (Chapter 3) is an info step.
- **Do lines that are actions:** Chapter 6 "Checkpoint: the finished track" and Chapter 7 "Contrast test".
- **Recap steps have no Check** (plan 5.4 f). The moves are unchanged.
- **Tags:** "System setting 511" is gone from Chapter 5’s "Checkpoint: hear your source" and "System setting 420" from Chapter 6’s "Checkpoint: play the song": neither step sets them (their Not working? text still gives the codes). Chapter 6 "Checkpoint: the finished track" plays the song list, so it says "Needs OS 2.0 or newer".
- **Why** is at most two sentences everywhere (plan 6.7): 21 were merged or trimmed, keeping every fact and quote; Chapter 4 "Leave the settings and listen" moved its note about removing a sidechain destination to Not working?.

**Missing from 2026.10.14.24:** search now says "Show all N troubleshooting topics" and "… in troubleshooting topics" (was "help topics").

**Docs:** plan §7.9 records `#complete` becoming one `button.complete` per lesson; decision 19 records the deferred Tools sheet and the CSS budget; CONTRIBUTING has the pad rule; the README says when the Tools sheet loads.

**Tests:** the start screen on every chapter (promise, rows, the preamble folded away, where the parts start), the All steps banner and its Continue, Tools beside the card on desktop, recap steps without a Check, and the upgrade test now changes search.js in the new release and checks the old page still gets its own. The axe pass lays the app bar and action bar in the page flow while it measures: whatever ends half under them counted as a small target until scrolled, wherever the content's length put it (the focus test covers what they may hide).

**New player wording:** "About this chapter in full", "The full safety notes", "Safety and erasing lists every action that erases something, and its undo.", "You’re on Part N, step X of M" with "Continue".

**Step by step** ("was" gives the old text):

- **Chapter 0** (8 steps):
  - “Tap A, then A1, A2 and A3”: Do: “Tap A (a short tap selects group A) and tap A1, A2 and A3.” (was “Tap A (a short tap selects group A) and tap pads 1, 2 and 3.”).
  - “Check every group is silent”: Do: “Tap A1, A2 and A3 again, then tap B, C and D and try a few pads in each.” (was “Tap A and pads 1, 2 and 3 again, then tap B, C and D and try a few pads in each.”).
  - “SOUND: select A1”: Do: “Press SOUND, tap A, then tap A1.” (was “Press SOUND, tap A, then tap pad 1.”).
  - “Browse the kicks”: Do: “Press + and tap A1. Repeat a few times.” (was “Press + and tap pad 1. Repeat a few times.”); Check: “The display shows the sample number and A1 plays a different sound each time.” (was “The display shows the sample number and pad 1 plays a different sound each time.”).
  - “Jump to the snares”: Do: “Jump straight to a category: hold SOUND, type 1, 0, 0 on the pads, release SOUND and tap A1.” (was “Jump straight to a category: hold SOUND, type 1, 0, 0 on the pads, release SOUND and tap pad 1.”).
  - “Mini kit: your favourite kick”: Do: “Mini project: still in SOUND with group A, tap A1 and browse to your favourite kick.” (was “Mini project: still in SOUND with group A, tap pad 1 and browse to your favourite kick.”).
  - “Pick a snare and a hi-hat”: Do: “Tap A2 and choose a snare, tap A3 and choose a hi-hat. Write the three numbers on your paper.” (was “Tap pad 2 and choose a snare, tap pad 3 and choose a hi-hat. Write the three numbers on your paper.”).
  - “Set-up done: your moves”: Check removed (was “You can find your way home, browse sounds and change a setting.”).
- **Chapter 1** (13 steps):
  - “Go home, and stop playback”: Why: “On a new K.O. II, projects 1–5 hold factory demos and projects 6–9 are completely empty, so working in project 6 keeps the demos safe and every note you hear later is one you placed. We will make a one-bar, 90 BPM drum loop, then add bass and a second section; no finger-drumming skill required.” (was “On a new K.O. II, projects 1–5 hold factory demos and projects 6–9 are completely empty. Working in project 6 keeps the demos safe, and every note you hear later is one you placed. We will make a one-bar, 90 BPM drum loop, then add bass and a second section. No finger-drumming skill required.”).
  - “Check that project 6 is silent”: Do: “Now tap A, then A1, A2 and A3, then press PLAY.” (was “Now tap A, tap pads 1, 2 and 3, then press PLAY.”).
  - “Set the grid to 16, quantized”: Why: “The recipe uses ordinary 4/4 and one-bar patterns with 16 steps per bar, four per beat. Quantize snaps live playing to the grid, which matters in the optional live practice at the end; interval and swing apply when you record, not to notes already written.” (was “The recipe uses ordinary 4/4 and one-bar patterns with 16 steps per bar, four per beat. Quantize snaps live playing to the grid; it matters when you record live in the optional practice at the end. Interval and swing apply when you record, not to notes already written.”).
  - “A1: load the kick”: Do: “Press SOUND, tap A, then tap A1. Hold SOUND, type 1 on the pads to load sample 001, and release SOUND.” (was “Press SOUND, tap A, then tap pad 1. Hold SOUND, type 1 on the pads to load sample 001, and release SOUND.”).
  - “Hear the kick”: Do: “Tap A1 to hear it (audition).” (was “Tap pad 1 to hear it (audition).”); Check: “A1 makes a low drum sound.” (was “Pad 1 makes a low drum sound.”).
  - “A2: load the snare”: Do: “Stay in SOUND. With group A selected, tap A2. Hold SOUND, type 1, 0, 0, release SOUND and tap A2.” (was “Stay in SOUND. With group A selected, tap pad 2. Hold SOUND, type 1, 0, 0, release SOUND and tap pad 2.”); Check: “A2 sounds sharper and brighter than the kick.” (was “Pad 2 sounds sharper and brighter than the kick.”).
  - “A3: load a closed hi-hat”: Do: “Still in SOUND with group A, tap A3. Hold SOUND, type 2, 0, 0, release SOUND and tap A3.” (was “Still in SOUND with group A, tap pad 3. Hold SOUND, type 2, 0, 0, release SOUND and tap pad 3.”); Check: “A3 makes a short, bright tick.” (was “Pad 3 makes a short, bright tick.”).
  - “Learn the placement move once”: Why: “This writes the kick at bar 1, beat 1, step 1 (1.1.1), and a lit pad means a note is written on this step. Tapping a pad without RECORD only auditions it; nothing is written.” (was “This writes the kick at bar 1, beat 1, step 1 (1.1.1). A lit pad means a note is written on this step. Tapping a pad without RECORD only auditions it; nothing is written.”).
  - “Place the eight hats”: Why: “These are the .1 and .3 of every beat: eighth notes, counted “1 and 2 and 3 and 4 and” (grid steps 1, 3, 5 … 15), while the other eight steps stay empty.” (was “These are the .1 and .3 of every beat: eighth notes, counted “1 and 2 and 3 and 4 and” (grid steps 1, 3, 5 … 15). The other eight steps stay empty.”).
  - “B: select B1 in SOUND”: Do: “Tap B (a short tap selects the group). Press SOUND and tap B1.” (was “Tap B (a short tap selects the group). Press SOUND and tap pad 1 (B1).”).
  - “Optional: make a practice copy”: Why: “So far you placed every note by hand; live recording is the faster way, playing pads while the loop runs. Practising first costs nothing.” (was “So far you placed every note by hand. Live recording is the faster way: you play pads while the loop runs. Practising first costs nothing.”).
  - “Optional: play along before recording”: Do: “Tap A. Press PLAY and, without touching RECORD, tap A2 (snare) once near the end of each loop, right before it starts again.” (was “Tap A. Press PLAY and, without touching RECORD, tap pad 2 (snare) once near the end of each loop, right before it starts again.”).
  - “Your first beat is done”: Check removed (was “You can build a drum beat, add bass, perform two sections and fix a mistake.”).
- **Chapter 2** (5 steps):
  - “Check that BEAT plays”: Check: “Drums and bass play, then stop.” (was “Playback is stopped and BEAT (drums + bass) is selected.”).
  - “Give the melody two bars”: Why: “This makes C’s pattern two bars long, while A and B stay one bar and repeat underneath. Extending adds empty space; it does not copy notes.” (was “This makes C’s pattern two bars long. A and B stay one bar and repeat underneath. Extending adds empty space; it does not copy notes.”).
  - “Plan the song: one position, one pass”: Why: “Each song position plays its scene once, for as long as the scene’s longest pattern, so to make a section longer you give it more positions. INTRO and BEAT last one bar; MELODY and BREAK last two, because C is two bars long.” (was “Each song position plays its scene once, for as long as the scene’s longest pattern. INTRO and BEAT last one bar; MELODY and BREAK last two, because C is two bars long. To make a section longer, give it more positions.”).
  - “Your song is ready to develop”: Check removed (was “Your song has an intro, main groove, melody, breakdown, melody return and ending.”).
  - “Make one change from memory”: Check removed (was “You changed one thing yourself.”).
- **Chapter 3** (6 steps):
  - “Set A2 to oneshot”: Why: “The guide names three play modes, so check the display as you turn: oneshot plays the whole sample, one at a time; key lets copies of the sample overlap (good for KEYS); legato continues from the same point when you change notes while holding. Y on this page is pan.” (was “The guide names the three play modes oneshot, key and legato, so check the display as you turn. Oneshot plays the whole sample, one at a time; key lets copies of the sample overlap (good for KEYS); legato continues from the same point when you change notes while holding. Y on this page is pan.”).
  - “Optional: try live chop”: Why: “The guide calls manual chopping live chop: in CHOP mode you “press a pad to CHOP… keep pressing pads as the sample plays”, the time between presses decides where each cut falls, and its picture shows Cho on the display and the first pad pressed at the very start of the sample. Neither the guide nor any owner report we found says what starts playback, so treat this as an experiment.” (was “Optional first look at manual chopping, which the guide calls live chop: in CHOP mode you “press a pad to CHOP… keep pressing pads as the sample plays”, and the time between presses decides where each cut falls. The guide’s picture shows Cho on the display and the first pad pressed at the very start of the sample. It doesn’t say what starts playback, and no owner report we found does, so treat this as an experiment.”).
  - “Choose the filter for group B”: Why: “This sets up an effect for group B: in FX the fader sets group B’s send. The guide lists delay, reverb, distortion, chorus, filter and compressor.” (was “This sets up an effect for group B. The guide lists delay, reverb, distortion, chorus, filter and compressor. In FX it sets group B’s send.”).
  - “Stretch B1 to one bar”: Why: “The guide: “if you choose 1 bar it stretches your sample to be 1 bar long.” The mode can also be off (teenage engineering’s factory sounds are stored with "time.mode":"off"), and the stopwatch TIME icon “indicates if active sound has time stretch enabled”, so watch it as you turn X.” (was “The guide: “if you choose 1 bar it stretches your sample to be 1 bar long.” The mode can also be off: teenage engineering’s factory sounds are stored with "time.mode":"off". The stopwatch TIME icon “indicates if active sound has time stretch enabled”, so watch it as you turn X.”).
  - “Write down where your sounds live”: now an info step (no Check); Check removed (was “You know where each of your sounds lives.”).
  - “Your sampling moves”: Check removed (was “You can record, edit, chop and resample a sound.”).
- **Chapter 4** (12 steps):
  - “Copy BEAT as a practice scene”: Check: “Holding MAIN shows a new number, not BEAT’s.” (was “You are now in the copy, not BEAT.”).
  - “Copy DRUMS as BASSLINE”: Check: “Holding MAIN shows a new number, the copy’s.” (was “You are now in the copy, not DRUMS.”).
  - “Copy BEAT as ROLL”: Before you press removed (was “Clear only in the copy: after SHIFT + MAIN the number must change.”); Consequence removed (was “Clears every note of A3 in ROLL.”); Do: “Hold MAIN, select BEAT, release and press SHIFT + MAIN: note the copy as ROLL.” (was “Make a practice copy of BEAT and write it as ROLL. Tap A. Stopped, hold ERASE + A3 until TRK blinks.”); Undo removed (was “Wrong pad? Press SHIFT + B at once, while the umbrella is lit.”); Check: “Holding MAIN shows a new number, not BEAT’s.” (was “Press PLAY: kick, snare and bass only.”); Note removed (was “Stop.”).
  - “ROLL: clear the hats”: Before you press added: “Hold MAIN first: the number must be ROLL.”; Consequence added: “Clears every note of A3 in ROLL.”; Do added: “Stopped, tap A and hold ERASE + A3 until TRK blinks.”; Undo added: “Wrong pad? Press SHIFT + B at once, while the umbrella is lit.”; Check added: “Press PLAY: kick, snare and bass only.”; Note added: “Stop.”.
  - “Copy BEAT as FXJAM”: Do: “Hold MAIN, select BEAT, release and press SHIFT + MAIN: note the copy as FXJAM. Press PLAY and leave it running.” (was “In project 6, make a practice copy of BEAT and write it as FXJAM. Press PLAY and leave it running.”).
  - “Try the other punch-in FX”: Why: “Punch-in FX respond to how hard you press and combine when you hold two pads; the guide doesn’t list every pad, and the update notes name FX + 1 beat repeat and a tape-stop effect. Owner lists (unofficial cheat sheet, Elektronauts) agree on 2 tape stop, 4 low-pass, 5 high-pass, 6 effect send and 9 bit crush, and differ on the rest, so trust your ears.” (was “Punch-in FX respond to how hard you press, and you can combine them by holding two pads. The guide doesn’t list every pad; the update notes name FX + 1 beat repeat and a tape-stop effect. Owner lists (unofficial cheat sheet, Elektronauts) agree on 2 tape stop, 4 low-pass, 5 high-pass, 6 effect send and 9 bit crush, and differ on the rest, so trust your ears.”).
  - “Copy BEAT as EDIT”: Do: “Hold MAIN, select BEAT, release and press SHIFT + MAIN: note the copy as EDIT. Tap A.” (was “In project 6, make a practice copy of BEAT and write it as EDIT. Tap A.”); Check: “Holding MAIN shows a new number, not BEAT’s.” (was “You are in EDIT, a copy with its own number.”).
  - “A4: move the layer six ticks later”: Why: “Each press shifts the whole layer, every A4 note, one tick later. A step is 24 ticks, so six ticks are a quarter step, about 40 ms at 90 BPM.” (was “Shift the whole layer a little later. Each press moves every A4 note one tick later. A step is 24 ticks, so six ticks are a quarter step, about 40 ms at 90 BPM.”).
  - “Try a direct jump to a scene”: Why: “The official guide says MAIN + numpad “can now always switch to any scene 1-99” (OS 2.0+), and that you hold MAIN and press pad 1–9 to change project. A quick tap switches scene; keeping the pad held until the display shows P and its number changes project, as the guide’s picture (P 1) and owners show.” (was “The official guide says MAIN + numpad “can now always switch to any scene 1-99” (OS 2.0+). It also says to hold MAIN and press pad 1–9 to change project. A quick tap switches scene; keeping the pad held until the display shows P and its number changes project, as the guide’s picture (P 1) and owners show.”).
  - “Play the longer song”: Why: “A song position lasts as long as the longest pattern in its scene, and position 10 still uses BREAK, so the ending stays short. The song is now 18 bars, about 48 seconds at 90 BPM, and it stops by itself at the end.” (was “Because a song position lasts as long as the longest pattern in its scene. Position 10 still uses BREAK, so the ending stays short. The song is now 18 bars, about 48 seconds at 90 BPM, and it stops by itself at the end.”).
  - “Leave the settings and listen”: Why: “Sidechain belongs to this project, so your other projects never pump. To soften it later, open sidechain again (SHIFT + FX, then +) and shorten X.” (was “To soften it later, open sidechain again (SHIFT + FX, then +) and shorten X. The guide explains how to add sources and destinations but not how to remove them, and no owner report we found does. Holding SHIFT and pressing B or C again is the likeliest way, so listen to check. Sidechain belongs to this project, so your other projects never pump.”); Not working? added: “Want B or C to stop dipping? The guide explains how to add sources and destinations but not how to remove them, and no owner report we found does; holding SHIFT and pressing B or C again is the likeliest way, so listen to check.”.
  - “Your performance moves”: Check removed (was “You can record live, play KEYS, repeat, add FX and pump the mix.”).
- **Chapter 5** (50 steps):
  - “Check that project 8 is empty”: Do: “Press PLAY. Stop, tap A, then A1, A2 and A3.” (was “Press PLAY. Stop, tap A, then tap pads 1, 2 and 3.”).
  - “A1: load the kick”: Do: “Press SOUND, tap A, then tap A1. Hold SOUND, type 1 on the pads and release SOUND: A1 loads sample 001.” (was “Press SOUND, tap A, then tap pad 1. Hold SOUND, type 1 on the pads and release SOUND: A1 loads sample 001.”).
  - “A2 and A3: load snare and hat”: Do: “Tap A2, hold SOUND, type 1, 0, 0 and release (sample 100). Tap A3, hold SOUND, type 2, 0, 0 and release (sample 200).” (was “Tap pad 2, hold SOUND, type 1, 0, 0 and release (sample 100). Tap pad 3, hold SOUND, type 2, 0, 0 and release (sample 200).”).
  - “Listen, and set the hat lower”: Do: “Tap A1, A2 and A3. With A3 selected, turn X down until the hat is clearly quieter than the kick.” (was “Tap pads 1, 2 and 3. With pad 3 selected, turn X down until the hat is clearly quieter than the kick.”).
  - “A1: write the four kicks”: Do: “Hold RECORD, tap A1, release. Use + to reach 1.2.3, 1.3.1 and 1.4.3 and write A1 the same way at each.” (was “Hold RECORD, tap pad 1, release. Use + to reach 1.2.3, 1.3.1 and 1.4.3 and write pad 1 the same way at each.”); Check: “A1 lights at all four positions.” (was “Pad 1 lights at all four positions.”).
  - “A3: write the hats”: Do: “Still stopped in group A, hold RECORD and tap A3 at every .1 and .3: 1.1.1, 1.1.3, 1.2.1, 1.2.3, 1.3.1, 1.3.3, 1.4.1 and 1.4.3.” (was “Still stopped in group A, hold RECORD and tap pad 3 at every .1 and .3: 1.1.1, 1.1.3, 1.2.1, 1.2.3, 1.3.1, 1.3.3, 1.4.1 and 1.4.3.”).
  - “Practise the snare on 2 and 4”: Do: “Practise first: press PLAY and, without touching RECORD, tap A2 on beats two and four (count 1, TWO, 3, FOUR).” (was “Practise first: press PLAY and, without touching RECORD, tap pad 2 on beats two and four (count 1, TWO, 3, FOUR).”).
  - “Play the snare on two and four”: Do: “After the four-beat count-in, tap A2 on two and four, then press RECORD: recording stops and the beat keeps playing.” (was “After the four-beat count-in, tap pad 2 on two and four, then press RECORD: recording stops and the beat keeps playing.”).
  - “Checkpoint: the rebuilt beat”: Do: “Checkpoint. Stopped, step to 1.2.1 and 1.4.1: A2 lights at both and nowhere else. Press PLAY.” (was “Checkpoint. Stopped, step to 1.2.1 and 1.4.1: pad 2 lights at both and nowhere else. Press PLAY.”); Not working?: “Press SHIFT + B (undo) while the umbrella is lit and record the snare again. Or remove a stray note with a brief ERASE + its pad at its position, then write A2 at 1.2.1 and 1.4.1 with RECORD held, as in Chapter 1 · First beat.” (was “Press SHIFT + B (undo) while the umbrella is lit and record the snare again. Or remove a stray note with a brief ERASE + its pad at its position, then write pad 2 at 1.2.1 and 1.4.1 with RECORD held, as in Chapter 1 · First beat.”).
  - “B1: load a bass”: Do: “Tap B. Press SOUND, tap B1, hold SOUND, type 4, 0, 0 and release: B1 loads sample 400 (factory bass sounds are stored at 400–499).” (was “Tap B. Press SOUND, tap pad 1, hold SOUND, type 4, 0, 0 and release: B1 loads sample 400 (factory bass sounds are stored at 400–499).”); Check: “Tap B1: one low bass note.” (was “Tap pad 1: one low bass note.”).
  - “B1: write two bass pulses”: Do: “Press MAIN. Stopped, with B selected, go to 1.1.1, hold RECORD, tap B1 and release. Do the same at 1.3.1.” (was “Press MAIN. Stopped, with B selected, go to 1.1.1, hold RECORD, tap pad 1 and release. Do the same at 1.3.1.”); Check: “B1 lights at both positions.” (was “Pad 1 lights at both positions.”).
  - “Optional: shift the snare later”: Do: “Hold A2 and press + three times, then release and press MAIN. Press PLAY.” (was “Hold pad 2 and press + three times, then release and press MAIN. Press PLAY.”); Not working?: “Too much? Open timing correct again and tap A2 once: a tap there snaps all its notes back to the grid.” (was “Too much? Open timing correct again and tap pad 2 once: a tap there snaps all its notes back to the grid.”).
  - “Checkpoint: HOOK sounds like VERSE”: Not working?: “No bass? Tap B and check that B1 lights at 1.1.1 and 1.3.1, and that B1 makes a sound in SOUND. The scene number did not change? Press SHIFT + MAIN once more and read the number again.” (was “No bass? Tap B and check that pad 1 lights at 1.1.1 and 1.3.1, and that pad 1 makes a sound in SOUND. The scene number did not change? Press SHIFT + MAIN once more and read the number again.”).
  - “Choose the input and level”: Why: “The official list: mic; line in mono and stereo (in, the 3.5 mm input jack); resample mono and stereo (rsp); line in left or right only (L.IN, R.IN); USB mono and stereo (usb). X sets the input level; mono is fine for a voice and allows samples up to 40 seconds on OS 2.5.” (was “The official list: mic; line in mono and stereo (in); resample mono and stereo (rsp); line in left or right only (L.IN, R.IN); USB mono and stereo (usb). in is the 3.5 mm input jack. X sets the input level. Mono is fine for a voice and allows samples up to 40 seconds on OS 2.5.”).
  - “Checkpoint: hear your source”: Check: “Cable: you hear the source as you turn X. Mic: the MIC icon lights.” (was “With a line input you hear it through the K.O. II as you turn X.”).
  - “C1: record the PHRASE”: Do: “Right BEFORE the first word, hold C1 and keep holding through the words; release right AFTER the last word.” (was “Right BEFORE the first word, hold pad 1 (C1) and keep holding through the words; release right AFTER the last word.”); Not working?: “Need both hands for the source? Hands-free sampling (OS 2.0 and later): hold SHIFT and press C1 right before the words, then press SAMPLE right after them.” (was “Need both hands for the source? Hands-free sampling (OS 2.0 and later): hold SHIFT and press pad 1 right before the words, then press SAMPLE right after them.”).
  - “Listen to C1”: Do: “Press MAIN, tap C and tap C1.” (was “Press MAIN, tap C and tap pad 1.”); Not working?: “Not happy? Press SAMPLE and record C1 again by holding it.” (was “Not happy? Press SAMPLE and record pad 1 again by holding it.”).
  - “Copy C1’s sound”: Do: “Press SOUND, tap C, then tap C1 to select it. Press SHIFT + C once to copy its sound.” (was “Press SOUND, tap C, then tap pad 1 to select C1. Press SHIFT + C once to copy its sound.”).
  - “Paste it onto C2”: Do: “Tap C2, then press SHIFT + D to paste.” (was “Tap pad 2, then press SHIFT + D to paste.”); Check: “Tap C2: it plays the same phrase.” (was “Tap pad 2: C2 plays the same phrase.”).
  - “C1: open the trim page”: Do: “Tap C1 to select it. Briefly press SHIFT + SOUND to open sound edit, then press − / + until the display shows the trim page (TRI).” (was “Tap pad 1 to select C1. Briefly press SHIFT + SOUND to open sound edit, then press − / + until the display shows the trim page (TRI).”).
  - “Trim the start of the PHRASE”: Do: “Turn X (start) a little at a time, tapping C1 between changes, until playback starts right before the first word.” (was “Turn X (start) a little at a time, tapping pad 1 between changes, until playback starts right before the first word.”).
  - “Trim the end of the PHRASE”: Do: “Stay on the trim page. Turn Y (length) down, tapping C1, until playback stops right after the LAST word.” (was “Stay on the trim page. Turn Y (length) down, tapping pad 1, until playback stops right after the LAST word.”).
  - “C2: open the trim page”: Do: “Press SOUND, tap C2, briefly press SHIFT + SOUND and go to the trim page again.” (was “Press SOUND, tap pad 2 (C2), briefly press SHIFT + SOUND and go to the trim page again.”).
  - “Trim C2 to the ANSWER”: Check: “Tap C1, then C2: phrase, then only the answer word.” (was “Tap pad 1, then pad 2: phrase, then only the answer word.”).
  - “C1: set oneshot”: Do: “Do the same for C1: press SOUND, tap C1, briefly press SHIFT + SOUND, find that page, turn X to oneshot.” (was “Do the same for C1: press SOUND, tap pad 1, briefly press SHIFT + SOUND, find that page, turn X to oneshot.”).
  - “Set the vocal volume”: Do: “Press MAIN, then SOUND. Set C1 and C2 so the words are clear but not louder than the snare. Press MAIN.” (was “Press MAIN, then SOUND. Set pads 1 and 2 so the words are clear but not louder than the snare. Press MAIN.”).
  - “Checkpoint: the trimmed pads”: Do: “Checkpoint. In MAIN tap C, then C1 and C2.” (was “Checkpoint. In MAIN tap C, then pads 1 and 2.”); Not working?: “A word is clipped? Back on the trim page, turn X down or Y up. The pad plays a different sound? You pressed − / + in SOUND instead of sound edit, which changes the pad’s sample: press − / + back until it plays your phrase again. Harsh or crackly? Record C1 again with a lower X in SAMPLE, then copy it to C2 again.” (was “A word is clipped? Back on the trim page, turn X down or Y up. The pad plays a different sound? You pressed − / + in SOUND instead of sound edit, which changes the pad’s sample: press − / + back until it plays your phrase again. Harsh or crackly? Record pad 1 again with a lower X in SAMPLE, then copy it to pad 2 again.”).
  - “C1: place the PHRASE at 1.1.1”: Do: “Stopped, in MAIN, tap C. Hold SHIFT and press − until the display shows 1.1.1. Hold RECORD, tap C1, release.” (was “Stopped, in MAIN, tap C. Hold SHIFT and press − until the display shows 1.1.1. Hold RECORD, tap pad 1, release.”).
  - “Check the phrase timing”: Not working?: “If the first word starts noticeably late, press SOUND, tap C, tap C1, briefly press SHIFT + SOUND, go to the trim page (TRI) and turn X a little at a time until playback starts right on the first word, then press MAIN. In plain SOUND, X is volume, not trim.” (was “If the first word starts noticeably late, press SOUND, tap C, tap pad 1, briefly press SHIFT + SOUND, go to the trim page (TRI) and turn X a little at a time until playback starts right on the first word, then press MAIN. In plain SOUND, X is volume, not trim.”).
  - “C2: place the ANSWER”: Do: “Hold RECORD, tap C2, release.” (was “Hold RECORD, tap pad 2, release.”).
  - “Check the vocal pattern”: Check: “Only two notes light, C1 at 1.1.1 and C2 at 2.3.1.” (was “Only two notes light, pad 1 at 1.1.1 and pad 2 at 2.3.1.”).
  - “Retune the bass if it clashes”: Do: “If it clashes, stop, press SOUND, tap B, tap B1 and turn Y (pitch) a little, then play again.” (was “If it clashes, stop, press SOUND, tap B, tap pad 1 and turn Y (pitch) a little, then play again.”).
  - “HOOK only: drop the bass”: Do: “Still clashing? Stopped, tap B, hold ERASE + B1 until TRK blinks, then release.” (was “Still clashing? Stopped, tap B, hold ERASE + pad 1 until TRK blinks, then release.”).
  - “Lower the hats if they cover the words”: Do: “Balance in SOUND, one pad at a time: tap A, tap A3 and lower X if the hats cover the words.” (was “Balance in SOUND, one pad at a time: tap A, tap pad 3 and lower X if the hats cover the words.”).
  - “Set the vocal pads”: Do: “Tap C and set C1 and C2 so the words come through clearly.” (was “Tap C and set pads 1 and 2 so the words come through clearly.”).
  - “Keep the bass below the kick”: Do: “Tap B, tap B1 and keep it below the kick.” (was “Tap B, tap pad 1 and keep it below the kick.”).
  - “Play VERSE”: Not working?: “VERSE lost its bass? You cleared it in the wrong scene: press SHIFT + B while the umbrella is lit, or write B1 again at 1.1.1 and 1.3.1 in VERSE’s group B. Words buried? Lower the hats and the bass in SOUND rather than raising the vocal.” (was “VERSE lost its bass? You cleared it in the wrong scene: press SHIFT + B while the umbrella is lit, or write pad 1 again at 1.1.1 and 1.3.1 in VERSE’s group B. Words buried? Lower the hats and the bass in SOUND rather than raising the vocal.”).
  - “Clear INTRO’s bass”: Do: “Stopped, tap B, hold ERASE + B1 until TRK blinks, then release: all of INTRO’s bass notes are gone in one move.” (was “Stopped, tap B, hold ERASE + pad 1 until TRK blinks, then release: all of INTRO’s bass notes are gone in one move.”).
  - “Clear the snare in BREAK”: Do: “In BREAK, stopped, tap A. Hold ERASE + A2 until TRK blinks, then release: every snare in BREAK is gone.” (was “In BREAK, stopped, tap A. Hold ERASE + pad 2 until TRK blinks, then release: every snare in BREAK is gone.”).
  - “Clear the hats in BREAK”: Do: “Still in group A, hold ERASE + A3 until TRK blinks to clear the hats.” (was “Still in group A, hold ERASE + pad 3 until TRK blinks to clear the hats.”).
  - “A3: two hats per bar”: Do: “Go to 1.1.1 and write A3 with RECORD held, and again at 1.3.1: two hats per bar, on beats 1 and 3.” (was “Go to 1.1.1 and write pad 3 with RECORD held, and again at 1.3.1: two hats per bar, on beats 1 and 3.”).
  - “Copy C1’s sound”: Do: “Make the twist sound from the same recording: press SOUND, tap C, tap C1 and press SHIFT + C once.” (was “Make the twist sound from the same recording: press SOUND, tap C, tap pad 1 and press SHIFT + C once.”).
  - “Paste it onto D1”: Do: “Tap D, tap D1 and press SHIFT + D.” (was “Tap D, tap pad 1 and press SHIFT + D.”); Check: “Tap D1: it plays your phrase.” (was “Tap pad 1: D1 plays your phrase.”).
  - “Optional: reverse the word”: Do: “Turn X until it shows rev, then tap D1. Press MAIN.” (was “Turn X until it shows rev, then tap pad 1. Press MAIN.”).
  - “D1: write the word twice”: Do: “Hold RECORD, tap D1, release. Press + twice to reach 2.4.3 and write D1 again.” (was “Hold RECORD, tap pad 1, release. Press + twice to reach 2.4.3 and write pad 1 again.”).
  - “Clear the kicks, write one per bar”: Do: “Stopped, tap A, hold ERASE + A1 until TRK blinks (all kicks gone), then go to 1.1.1 and write A1 with RECORD held.” (was “Stopped, tap A, hold ERASE + pad 1 until TRK blinks (all kicks gone), then go to 1.1.1 and write pad 1 with RECORD held.”).
  - “Checkpoint: play RETURN and HOOK”: Not working?: “The word also plays in HOOK? In HOOK, tap D and hold ERASE + D1 until TRK blinks. The two hits cut each other off? Shorten D1 a little more on the trim page, or remove the note at 2.4.3 with a brief ERASE + D1.” (was “The word also plays in HOOK? In HOOK, tap D and hold ERASE + pad 1 until TRK blinks. The two hits cut each other off? Shorten D1 a little more on the trim page, or remove the note at 2.4.3 with a brief ERASE + pad 1.”).
  - “Read the song map”: Why: “A song position plays its scene once, for as long as the scene’s longest pattern: A and B are one bar and repeat, so C decides how long each scene lasts. Doubling C makes a section longer and, in HOOK and RETURN, repeats the vocal too.” (was “A song position plays its scene once, for as long as the scene’s longest pattern. A and B are one bar and repeat, so C decides how long each scene lasts. Doubling C makes a section longer and, in HOOK and RETURN, repeats the vocal too.”).
  - “Listen to BREAK into RETURN”: Not working?: “If the repeated word distracts, stop, press MAIN, hold MAIN to select RETURN, tap D and hold ERASE + D1 until TRK blinks.” (was “If the repeated word distracts, stop, press MAIN, hold MAIN to select RETURN, tap D and hold ERASE + pad 1 until TRK blinks.”).
  - “Your hip-hop moves”: Check removed (was “You can sample a phrase, trim it and build a song from scenes.”).
- **Chapter 6** (14 steps):
  - “Open empty project 9”: Why: “The official guide says “hold main and one of the pads (1-9) to select an empty project”, and on a new unit projects 6–9 are empty. This course keeps project 6 for Chapters 1, 2 and 4 (First beat, Make it a song, Play & perform), 7 for Chapter 3 (Sample, chop & resample) and 8 for Chapter 5 (Full hip-hop beat); project 9, your scratch project in Chapter 0 · Set up your K.O. II, now becomes this track.” (was “The official guide says “hold main and one of the pads (1-9) to select an empty project”, and on a new unit projects 6–9 are empty. This course keeps project 6 for Chapters 1, 2 and 4 (First beat, Make it a song, Play & perform), 7 for Chapter 3 (Sample, chop & resample) and 8 for Chapter 5 (Full hip-hop beat). Project 9 was your scratch project in Chapter 0 · Set up your K.O. II and now becomes this track.”).
  - “Check that project 9 is empty”: Not working?: “A1, A2 and A3 may still play the kick, snare and hat you picked in the tour in Chapter 0; that is fine, because Part 2 puts new sounds on them. If music plays, you are not in an empty project. On OS 2.0+ MAIN + a number can also select a scene: a quick press goes to that scene. Try step 1 again and keep pad 9 held until the display shows P 9, P and the project number.” (was “Pads 1, 2 and 3 may still play the kick, snare and hat you picked in the tour in Chapter 0; that is fine, because Part 2 puts new sounds on them. If music plays, you are not in an empty project. On OS 2.0+ MAIN + a number can also select a scene: a quick press goes to that scene. Try step 1 again and keep pad 9 held until the display shows P 9, P and the project number.”).
  - “A1: load sound 001”: Do: “Press SOUND, tap A, then tap A1. Hold SOUND, type 1 on the pads and release: that loads sound 001. Tap A1 to hear it.” (was “Press SOUND, tap A, then tap pad 1. Hold SOUND, type 1 on the pads and release: that loads sound 001. Tap A1 to hear it.”).
  - “A2: choose a clap or snare”: Do: “In SOUND with group A, tap A2. Hold SOUND, type 1, 0, 0 and browse with − / + for a crisp, short clap or snare.” (was “In SOUND with group A, tap pad 2. Hold SOUND, type 1, 0, 0 and browse with − / + for a crisp, short clap or snare.”).
  - “A3: choose a closed hat”: Do: “Tap A3, hold SOUND, type 2, 0, 0 and choose a short closed hat (hi-hats: 200–299).” (was “Tap pad 3, hold SOUND, type 2, 0, 0 and choose a short closed hat (hi-hats: 200–299).”).
  - “B1: choose a bass”: Do: “Tap B, then B1. Hold SOUND, type 4, 0, 0 and browse 400–499 (bass) for a clean, short bass.” (was “Tap B, then pad 1. Hold SOUND, type 4, 0, 0 and browse 400–499 (bass) for a clean, short bass.”).
  - “Copy B1 onto B2”: Do: “Now copy it to B2: with B1 selected press SHIFT + C once, tap B2, then press SHIFT + D. Tap B2. Press MAIN.” (was “Now copy it to B2: with B1 selected press SHIFT + C once, tap pad 2, then press SHIFT + D. Tap B2. Press MAIN.”).
  - “C1: record your hook”: Not working?: “Need both hands, for example to start audio on your phone? Instead of holding C1, press SHIFT + C1 for hands-free sampling (OS 2.0+), then press SAMPLE to stop.” (was “Need both hands, for example to start audio on your phone? Instead of holding C1, press SHIFT + pad 1 for hands-free sampling (OS 2.0+), then press SAMPLE to stop.”).
  - “C1: select it in SOUND”: Do: “Press SOUND, tap C, then tap C1 to select it.” (was “Press SOUND, tap C, then tap pad 1 to select C1.”).
  - “DROP B: select C2”: Do: “In DROP B, press SOUND, tap C and tap C2.” (was “In DROP B, press SOUND, tap C and tap pad 2.”).
  - “Optional: copy C1’s sound”: Do: “Optional, OS 2.5 reverse: press SOUND, tap C, tap C1 and press SHIFT + C once to copy C1’s sound.” (was “Optional, OS 2.5 reverse: press SOUND, tap C, tap pad 1 and press SHIFT + C once to copy C1’s sound.”).
  - “Optional: paste it onto D1”: Do: “Tap D, tap D1 and press SHIFT + D to paste it.” (was “Tap D, tap pad 1 and press SHIFT + D to paste it.”).
  - “Checkpoint: the finished track”: “Needs OS 2.0 or newer”; Do: “In the song list, press SHIFT + PLAY and listen to the whole track.” (was “You are done when the whole track plays, kick and bass stay clear, the vocal appears only where it matters, and the two drops feel different.”); Check: “Kick and bass stay clear, the vocal sits where it matters, the drops differ.” (was “The whole track plays and stops by itself.”).
  - “Your tech house moves”: Check removed (was “You can build a loop, make it breathe and arrange a full track.”).
- **Chapter 7** (6 steps):
  - “Old music? Clear the old patterns”: Undo: “SHIFT + B restores only the last group; the backup has the rest.” (was “Wrong project? Press SHIFT + B at once while the umbrella is lit.”).
  - “Reused project 7? Empty D1 to D5”: Why: “In a reused project 7, D1 to D5 still hold your Chapter 3 recordings, so they won’t blink in SAMPLE, and hands-free sampling is not allowed on a pad that already holds a recording. The official how-to says setting a pad to “000” “will create an empty pad”.” (was “Reused project 7? Its D1 to D5 still hold your Chapter 3 recordings, so they won’t blink in SAMPLE, and hands-free sampling is not allowed on a pad that already holds a recording. The official how-to says setting a pad to “000” “will create an empty pad”.”).
  - “D1: record V1”: Do: “Get ready, then press and hold D1. Perform V1, and release right after the last word.” (was “Get ready, then press and hold pad D1 (pad 1, with D selected). Perform V1, and release right after the last word.”).
  - “Contrast test”: Do: “Contrast test: play BREAK, then switch to DROP A and PEAK (hold MAIN, − / +) and compare.” (was “Contrast test: BREAK should feel clearly emptier than the drops, and PEAK should feel like the biggest moment.”).
  - “Record one full pass”: Why: “Record one full pass before you change anything else: commit only copies scenes inside the K.O. II and doesn’t export audio. The guide: “usb audio out, to record sound directly into your DAW”.” (was “Record one full pass before you change anything else. Commit only copies scenes inside the K.O. II; it doesn’t export audio. The guide: “usb audio out, to record sound directly into your DAW”.”).
  - “Your vocal house moves”: Check removed (was “You can shape your vocals and grow one drop into a full track.”).

**Outside the steps** (the new start-screen text, the short safety lists, and the part checkpoints that name pads):

- first-beat.html: “Build your first beat: drums and a bass at 90 BPM, kept as two scenes.”
- first-beat.html: “Before you start  Your K.O. II, set up in Chapter 0 Empty project 6 Paper and a pencil for two scene numbers”
- hiphop.html: “Build a 64-bar hip-hop beat around a phrase you sample yourself.”
- hiphop.html: “Before you start  Empty project 8 Headphones or speakers on the K.O. II’s output One source: a phone over USB-C or 3.5 mm, or the built-in mic Paper and a pencil for scene numbers”
- hiphop.html: “If it doesn’t: a stray or missing snare? Press SHIFT + B while the umbrella is lit and record it again, or write A2 at 1.2.1 and 1.4.1 with RECORD held. Pads played sounds before you loaded any? See Check that project 8 is empty.” (was “If it doesn’t: a stray or missing snare? Press SHIFT + B while the umbrella is lit and record it again, or write pad 2 at 1.2.1 and 1.4.1 with RECORD held. Pads played sounds before you loaded any? See Check that project 8 is empty.”)
- hiphop.html: “If it doesn’t: no bass? Tap B and check that B1 lights at 1.1.1 and 1.3.1. The scene number did not change? Press SHIFT + MAIN once more and read the number again.” (was “If it doesn’t: no bass? Tap B and check that pad 1 lights at 1.1.1 and 1.3.1. The scene number did not change? Press SHIFT + MAIN once more and read the number again.”)
- hiphop.html: “If it doesn’t: VERSE lost its bass? Press SHIFT + B while the umbrella is lit, or write B1 again at 1.1.1 and 1.3.1 in VERSE’s group B. Words buried? Lower the hats and the bass in SOUND rather than raising the vocal.” (was “If it doesn’t: VERSE lost its bass? Press SHIFT + B while the umbrella is lit, or write pad 1 again at 1.1.1 and 1.3.1 in VERSE’s group B. Words buried? Lower the hats and the bass in SOUND rather than raising the vocal.”)
- perform.html: “Play the K.O. II live: feel, a bassline in a scale, rolls, effects and scene changes.”
- perform.html: “Before you start  Project 6 with your scenes and song list from Chapters 1–2 Headphones or speakers Paper and a pencil for scene numbers For Part 9: a USB-C cable, or a 3.5 mm cable to a recorder”
- perform.html: “Work only in practice copies: every part starts by making one. Never use ERASE + SOUND: it deletes a sample from the device. Press SHIFT + ERASE only with the K.O. II already on: held while switching on, it formats the drive.”
- sampling.html: “Record your own sounds, build a kit from them, chop a recording and resample a beat.”
- sampling.html: “Before you start  OS 2.5 or newer Empty project 7, and Chapters 1 and 2 done Headphones or a speaker For Part 3, optional: a phone with a 3.5 mm or USB-C cable    Press SHIFT + ERASE only with the K.O. II already on: held while switching on, it formats the drive. Held, ERASE + SOUND deletes a sample and SHIFT + SOUND on the trim page crops one. Neither can be undone. Back up first, and work in empty project 7.”
- setup.html: “Get your K.O. II ready: hear it, read its screen, update it and back it up.”
- setup.html: “Before you start  Power: 4 AAA batteries, or USB-C and a 5 V, 1 A charger Headphones or a speaker (the built-in speaker works to start) A computer with Chrome and a USB-C cable that carries data Paper and a pencil for project and scene numbers”
- setup.html: “Switch on with your hands off the buttons: SHIFT + ERASE held while switching on formats the drive, and MAIN starts lock mode. SHIFT + ERASE with the K.O. II already on is safe: it opens system settings. Nothing in Parts 1–7 erases music.”
- song.html: “Turn your beat into a 16-bar song: an intro, a melody, a breakdown and a song list.”
- song.html: “Before you start  Your beat from Chapter 1, in project 6 BEAT’s scene number on your paper, and a pencil OS 2.0 or newer for the song list”
- tech-house.html: “Build a 3½-minute tech-house track at 128 BPM, with two drops and a breakdown.”
- tech-house.html: “Before you start  OS 2.0 or newer (OS 2.5 for a few optional steps) Empty project 9 Headphones or a speaker For the vocal hook: your voice, a phone over USB-C, or a line cable Paper and a pen for scene numbers”
- tech-house.html: “Stop playback before every position-by-position edit. Never use ERASE + SOUND: it deletes the sample from the device. SHIFT + B undoes a cleared note or pad while the umbrella icon is lit.”
- thodorakis-house.html: “Build a 4-minute house track at 128 BPM around five vocal samples of your own.”
- thodorakis-house.html: “Before you start  OS 2.5.1 Headphones or speakers Five short vocal sounds: your voice, a phone or audio files Paper and a pencil for project, scene and sample numbers”
- thodorakis-house.html: “Never use ERASE + SOUND: held until SND blinks, it deletes the sample from the device. SHIFT + B undoes a cleared note or pad while the umbrella icon is lit.”

## 2026.10.14.24

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.14.23 (the guide’s icon map, through the course’s copy of it in Chapter 0, and its Functions and Effects pages). **Written for:** OS 2.5.1. No button sequence changed.

Fixes from a fourth independent review of the overhaul.

- **Checks that now say what you see or hear.** Thirteen Checks added in 2026.10.14.23 stated a setting or an intention instead of something you can see or hear. They now name a display reading or icon from the guide’s icon map (MAIN, SYSTEM, New pattern), the sample number SOUND shows, or what you hear. One said the wrong thing: after SHIFT + MAIN you are in the copy, so the display shows a new number, not BEAT’s.
- **Chapter 6, "Clear the kick, clap and tom"** names its press: "Hold ERASE + A1 until TRK blinks", so the Tools sheet and keys panel light ERASE too. Same presses as before.
- **Chapter 6, "A4: open hats instead of closed":** "At both, also briefly press…" (was "There, …"), and the Check covers both positions.
- **Chapter 5, "Turn down, then set up one source"** is a normal step again, with a Check: connecting USB or a cable happens on the K.O. II.
- **Search** uses the plan’s names: the filter chips read "Fixes" (was "Help") and "Words", and the groups are headed "Troubleshooting" (was "Help") and "Glossary" (was "Words").
- **Tests:** `test_search.py` checks the chip and group names.

**Step by step** ("was" gives the old text):

- **Chapter 0** (1 step):
  - “Turn the metronome on (400)”: Check: “The display showed on, not rec or cnt, when you pressed ENTER.” (was “Your choice is on, not rec or cnt.”).
- **Chapter 1** (1 step):
  - “Optional: make a practice copy”: Check: “Holding MAIN shows a new number, not BEAT’s.” (was “Holding MAIN, the display shows BEAT’s scene number.”).
- **Chapter 3** (2 steps):
  - “D2: start hands-free sampling”: Check: “Nothing records yet: the K.O. II waits for your voice.” (was “The K.O. II now holds D2 for you; your hands are free.”).
  - “Set the lo recording rate (500)”: Check: “The SYSTEM icon goes out.” (was “You are on 500: new recordings use the lo rate.”).
- **Chapter 4** (6 steps):
  - “Set quantize on the 16 grid”: Check: “The display showed 16; the MAIN icon is lit again.” (was “Recorded hits now snap to the 16-step grid.”).
  - “Switch to free time”: Check: “The MAIN icon is lit again.” (was “Recorded hits now keep your exact timing.”).
  - “Set a fast roll (32)”: Check: “The display showed 32; the MAIN icon is lit again.” (was “Note repeat now runs at 32 per bar.”).
  - “Open timing correct”: Check: “The display changes to timing correct; no note moves yet.” (was “Timing correct is open; no notes have moved yet.”).
  - “A1: make the kick the trigger”: Check: “MELODY plays on unchanged: nothing dips until you choose groups.” (was “A1 is now the sidechain trigger; MELODY plays on.”).
  - “Choose B and C to dip”: Check: “The drums play on undipped; X and Y set the dip next.” (was “Groups B and C are now set to dip on every kick.”).
- **Chapter 5** (1 step):
  - “Turn down, then set up one source”: no longer an info step (connecting USB or a cable is on the K.O. II); Check added: “USB lights the USB MIDI icon; a cable or the mic shows nothing yet.”.
- **Chapter 6** (5 steps):
  - “A4: open hats instead of closed”: Do: “Write A4 (open hat) at 2.4.3 and 4.4.3. At both, also briefly press ERASE + A3, so the open hat replaces the closed hat.” (was “Write A4 (open hat) at 2.4.3 and 4.4.3. There, also briefly press ERASE + A3, so the open hat replaces the closed hat.”); Check: “At 2.4.3 and 4.4.3 A4 lights and A3 does not.” (was “At 2.4.3 A4 lights and A3 does not.”).
  - “The stand-up test”: Check: “You hear a groove your body wants to move to.” (was “Your body wants to move: the groove works.”).
  - “DROP B: select C2”: Check: “The display shows C2’s sample number.” (was “C2 is now the selected pad in SOUND.”).
  - “Clear the kick, clap and tom”: Do: “Tap A. Hold ERASE + A1 until TRK blinks, then do the same with A2 and A7.” (was “Tap A and clear A1 (kick), A2 (clap) and A7 (tom) with the same TRK hold.”).
  - “Optional: a fresh D pattern in BUILD”: Check: “The New pattern icon lights as D gets an empty pattern.” (was “D has a fresh, empty pattern in BUILD only.”).
- **Chapter 7** (1 step):
  - “Quantize on, swing alone”: Check: “The MAIN icon is lit again.” (was “Notes you record now snap to the 16-step grid.”).

## 2026.10.14.23

**Checked against:** the official EP-133 guide on 13 October 2026, as for 2026.10.14.19; for this release its How to, System, What’s new, Modes, Play and record and Effects pages were re-read on 14 October 2026 (the facts used are named below). **Written for:** OS 2.5.1.

Fixes from a third independent review of the overhaul.

**Every step now says what to check** (plan 5.3 and 5.4 f): 362 steps that had none got a Check, a fact you see or hear afterwards, taken from the step itself, its part, the next step or the official guide; 40 Checks were reworded because they said "You should…" or gave an instruction instead of a fact. 26 steps that change nothing on the K.O. II (reading, writing on paper, work on a phone or computer) are now info steps without one. Each is listed under "Step by step" below.

**Every risk step says what it clears or deletes** (plan 5.4 a), in a line between Before you press and the Do lines, such as "Clears every note of A1 and B1 in this pattern." (32 steps). To keep Before you press, the consequence and the Do within 40 words, and on screen beside the keys panel with the phone on its side, words the consequence now says were taken out of some Do lines; no key, pad or display value changed in them.

**Two instructions changed, with their source** (they join the owner's device check):
- Chapter 3, "Listen, and set the level": in sample mode X is the input level for the next take, as the step before says, so turning it does nothing to a recording you have. Do: "Tap D1 to hear it. Too quiet or distorted? Turn X (input level) up or down, press SAMPLE and record D1 again." (was "Tap D1. Too quiet: turn X up. Crunchy or distorted: turn X down."). The guide: "you get a second chance by pressing sample again and retaking it".
- Chapter 5, "Check VERSE and HOOK are unchanged": the step now plays each scene, which it needs to let you hear them. Do: "Hold MAIN, select VERSE and release; press PLAY, then stop. Do the same with HOOK." (was "Hold MAIN and select VERSE: its bass is still there. Select HOOK: its vocal is still there.").

**Checked and kept:** "press MAIN" to leave system settings: the guide’s How to says "press (main) to return to main and exit the system settings". Chapter 7’s "Then press RECORD" to stop recording while the loop plays: the guide’s Play and record says "press (RECORD) to keep the beat going but stop recording".

**"Needs OS …"** now also marks every step in the song list (song mode, OS 2.0), Chapter 6’s second sidechain step (OS 2.0), hands-free sampling and resampling (OS 2.0), equal-length chop and the arpeggio set-up (OS 2.5), recording over USB audio (OS 2.5), and the two steps that erase a scene, whose CLR/DEL behaviour came with OS 2.0.1 (What’s new): 39 steps.

**Sources:** the 26 steps of Chapters 1 and 2 that had no "Official guide" line now name their page.

**Rhythm lab:** Chapter 1’s six target rhythms link to it: "Practise this away from the device in the Rhythm lab." The lab then opens with that step’s rows of the recipe (`lab.html#recipe-2`: kick and snare), without saving over your own grid.

**Chapter complete** (plan 5.9): "Scene numbers to keep" shows the chapter’s scenes (or samples) as LCD numbers, from your notes, with "–" for any you did not note here ("– is a number you did not note here: take it from your paper."). "Back up now" gets a "Show the backup steps" button: Chapter 0’s backup part opens in a sheet, read-only, offline too; Back closes it.

**Step player:**
- The last step of a part reads "Done · Checkpoint" (plan 6.4).
- When a risk step’s undo and Check are below the action bar, the cue reads "Undo and Check below" ("No undo and Check below" on an irreversible step) instead of "More below" (plan 5.4).
- The scene-erase steps get the red left edge of irreversible steps too.
- The delete gate’s note: "There is no undo. Check that you are on the right sound or scene before you press." (was "Make sure you are…").

**Without JavaScript** the app bar has a Search link to Troubleshooting, which lists every topic (plan 5.8).

**Home:** the Troubleshooting tile breaks at "Trouble-shooting" on a narrow phone instead of mid-word ("Troubleshootin / g"). "Not sure? Start with Chapter 0: nothing in Parts 1–7 erases music." (was "nothing in its first seven sections erases music").

**Plain words** (plan 6.7): "just", "simply", "easy" and "make sure" are gone from every page (42 places, listed below; "right before" for timing, "check that" for "make sure"), and a test keeps them out. Quotes from the guide keep their words.

**Docs:**
- Decision 23 in the plan: the search index is built in the browser from the saved pages (0.2 s on desktop, 1.1 s with the CPU slowed 4×) instead of a deploy-time file.
- README: the three details with no source (how KEYS mode ends, removing a sidechain destination, what starts playback in live chop) and the two guesses next to them now say they wait for the owner’s check on a device.
- CONTRIBUTING: every step has a Check unless it is an info step; risk steps have a consequence line, counted in their 40 words; the plain-words rule.

**Tests:**
- `test_player.py`: every step has a Check, every risk step its consequence in order, no page uses the ruled-out words, the chapter-complete numbers and backup sheet, the Rhythm lab link and `#recipe-2`.
- `test_behaviour.py`: "Confirm first", "Done · Checkpoint" and the risk cue.
- `test_a11y.py`: the Search link without JavaScript. The desktop axe pass is now 1280×1200: at 900 a control that happens to end half under the docked action bar counts as a small target until you scroll.

**Wordings added in 2026.10.14.21 and not listed then** (the recap steps and the cheat sheet):

- Chapter 0, "Set-up done: your moves" (setup-recap): Do "Read the six moves below, then try one from memory without reading this app."; Check "You can find your way home, browse sounds and change a setting."; moves:
  - “Home: press MAIN; PLAY starts and stops.”
  - “To the start: hold SHIFT and press − until the display shows 1.1.1.”
  - “Change project: hold MAIN, hold a pad 1–9 as well, then release both.”
  - “Browse sounds: SOUND, tap the pad, then − / + (SHIFT + + jumps ten). Hold SOUND and type a number to jump there.”
  - “System settings, with the unit already on: SHIFT + ERASE, three digits, ENTER, then MAIN.”
  - “Undo: SHIFT + B while the umbrella is lit.”
- Chapter 3, "Your sampling moves" (sampling-recap): Do "Read the seven moves below, then try one from memory without reading this app."; Check "You can record, edit, chop and resample a sound."; moves:
  - “Sample: tap the group, press SAMPLE, pick the source with − / +; X is the level, Y the threshold. Hold a pad to record.”
  - “Hands-free: hold SHIFT and press an empty pad; press SAMPLE to stop.”
  - “Sound edit: SOUND, tap the pad, briefly press SHIFT + SOUND; − / + steps through its pages.”
  - “Copy a sound: in SOUND, SHIFT + C; tap another pad, SHIFT + D.”
  - “Time page (tim): X chooses BPM, BAR or rev.”
  - “Chop: select the sample, tap the destination group, SHIFT + SAMPLE; hold the group button and − / + for EQU.”
  - “Resample: source rsp, hold SHIFT and press an empty pad, then PLAY.”
- Chapter 4, "Your performance moves" (perform-recap): Do "Read the eight moves below, then try one from memory without reading this app."; Check "You can record live, play KEYS, repeat, add FX and pump the mix."; moves:
  - “Record live: at 1.1.1 tap RECORD, press PLAY, play after the count-in, then press RECORD.”
  - “TIMING: X sets the grid, − quantize, + free time, Y swing.”
  - “KEYS: select a pad, press KEYS; hold it and turn X for the key, Y for the scale.”
  - “Note repeat: hold TIMING and a pad; in TIMING, SHIFT + the pad latches it.”
  - “Punch-in FX: while playing, hold FX and press a pad.”
  - “Copy a pad’s notes: hold it, SHIFT + C; hold another, SHIFT + D.”
  - “Next scene in time: hold MAIN, − / + before the change lands.”
  - “Sidechain: SHIFT + FX, +; hold a group button and press a pad for the source, SHIFT + a group to dip.”
- Chapter 5, "Your hip-hop moves" (hiphop-recap): Do "Read the seven moves below, then try one from memory without reading this app."; Check "You can sample a phrase, trim it and build a song from scenes."; moves:
  - “Sample: tap C, press SAMPLE, pick the input with − / +; X level, Y threshold; hold the pad.”
  - “Copy a sound: in SOUND, SHIFT + C; tap another pad, SHIFT + D.”
  - “Trim: briefly SHIFT + SOUND, − / + to the trim page; X start, Y length.”
  - “New section: SHIFT + MAIN, then hold MAIN and write the number down.”
  - “Clear a pad’s notes: stopped, hold ERASE + the pad until TRK blinks.”
  - “Double a pattern: arm RECORD, hold SHIFT and press +, then disarm.”
  - “Song list: hold MAIN and press ENTER; SHIFT + A adds a position, SHIFT + − / + picks its scene.”
- Chapter 6, "Your tech house moves" (tech-house-recap): Do "Read the seven moves below, then try one from memory without reading this app."; Check "You can build a loop, make it breathe and arrange a full track."; moves:
  - “Load by number: hold SOUND, type the number on the pads, release.”
  - “Double a pattern: arm RECORD, hold SHIFT and press +, then disarm.”
  - “A fresh pattern for a group: tap it, then SHIFT + A.”
  - “Sidechain: SHIFT + FX, +; hold a group button and press a pad for the source, SHIFT + a group to duck.”
  - “Sections: SHIFT + MAIN, then clear what you don’t need with ERASE + the pad until TRK blinks.”
  - “Reverb: tap the group, FX, − / + to reverb, raise the fader.”
  - “Song list: hold MAIN and press ENTER; SHIFT + A adds a position, SHIFT + − / + picks its scene.”
- Chapter 7, "Your vocal house moves" (vocal-recap): Do "Read the seven moves below, then try one from memory without reading this app."; Check "You can shape your vocals and grow one drop into a full track."; moves:
  - “Load a sample by number: SOUND, tap the pad, hold SOUND, type the number, release.”
  - “Trim: briefly SHIFT + SOUND, − / + to the trim page; X start, Y length.”
  - “Play to the end: on the sound page, turn X to oneshot.”
  - “Reverb on a group: tap it, FX, − / + to reverb, raise the fader.”
  - “Grow and strip: SHIFT + MAIN, then hold ERASE + the pad until TRK blinks to clear one sound.”
  - “Play it in: tap RECORD, press PLAY, play after the count-in.”
  - “Song list: hold MAIN and press ENTER; SHIFT + A adds a position, SHIFT + − / + picks its scene.”
- Cheat sheet headings: "Chapter 3 · Sample, chop & resample: moves and pad plan" (was "…: your pad plan"), "Chapter 4 · Play & perform: moves and section starts" (was "…: how every section starts"), and a new section "Chapter 0 · Set up your K.O. II: moves" with Chapter 0’s six moves above. Each chapter’s moves were added to its section too.

**Step by step: every wording changed in this release** (Check, consequence, Do and other lines; "was" gives the old text):

- **Chapter 0** (37 steps):
  - “Fit four AAA batteries”: Check added: “Each battery’s + and − match the marks.”.
  - “Find the battery icon”: Check added: “The battery icon is lit, not blinking.”.
  - “Tap pads 1, 2 and 3”: Check: “Each pad plays a sound through the built-in speaker.” (was “You should hear them from the built-in speaker.”).
  - “Optional: plug in headphones”: Before you press: “The input is a 3.5 mm socket on the top side too, so check that you chose the output.” (was “The input is a 3.5 mm socket on the top side too, so make sure you chose the output.”); Check added: “Pads play through them.”.
  - “Learn the four button words”: now an info step (no Check).
  - “Your first combination: SHIFT + −”: Check added: “The display shows 1.1.1 again.”.
  - “PLAY lights its icon”: Note: “If the project has no notes, it plays silence.” (was “If the project has no notes, it simply plays silence.”).
  - “Read the icon table”: now an info step (no Check).
  - “Open the update utility”: now an info step (no Check).
  - “Connect the K.O. II”: Check added: “The USB MIDI icon on the display lights.”.
  - “Read the result”: now an info step (no Check).
  - “Install the update”: Check added: “The utility says your K.O. II is up to date.”.
  - “Save a backup”: Check added: “The tool reports that the backup has finished.”.
  - “Find the backup file”: Check: “A new backup file is there.” (was “A new backup file should be there.”).
  - “Copy it to a second place”: Check added: “The backup file also appears in the second place.”.
  - “Open factory project 1”: Check added: “The display shows P 1 before you release.”.
  - “Open empty project 6”: Check added: “The display shows P 6 before you release.”.
  - “Write PROJECT 6 = COURSE”: now an info step (no Check).
  - “Open scratch project 9”: Check added: “The display shows P 9 before you release.”.
  - “SOUND: select pad 1”: Check added: “The SOUND icon lights; A1 is still silent.”.
  - “Jump ten at a time”: Check added: “The number jumps by ten, then by one.”.
  - “Try the other categories”: Check added: “A1 plays each kind of sound in turn.”.
  - “Mini kit: your favourite kick”: Check added: “A1 plays your favourite kick, numbered 1–99.”.
  - “Pick a snare and a hi-hat”: Check added: “A2 plays a snare and A3 a hi-hat.”.
  - “Play your mini kit”: Check added: “You hear kick, snare, hi-hat, then snare.”.
  - “Open the seq group”: Check added: “The display shows a setting inside seq.”.
  - “Turn the metronome on (400)”: Check added: “Your choice is on, not rec or cnt.”.
  - “The fast way: type 401”: Check added: “After MAIN, the SYSTEM icon goes out.”.
  - “Optional: the course picks”: Check added: “After MAIN, the SYSTEM icon goes out.”.
  - “Library complete? Move on”: now an info step (no Check).
  - “Error code? Look it up”: now an info step (no Check).
  - “Anything else: never format”: Check added: “The mistake is gone; your sounds are still there.”.
  - “Ready check: updated”: now an info step (no Check).
  - “Ready check: backed up”: now an info step (no Check).
  - “Ready check: project 6”: Check added: “Nothing plays in any group.”.
  - “Ready check: silence, and paper”: Check added: “Nothing plays while the PLAY icon is lit.”.
  - “Open Chapter 1”: now an info step (no Check).
- **Chapter 1** (27 steps):
  - “Go home, and stop playback”: Check added: “Nothing plays, and the display shows the current step.”; Source added: “Official guide: Get started”.
  - “Open empty project 6”: Check added: “The display changes to show P 6.”; Source added: “Official guide: Get started”.
  - “Set the tempo to 90 BPM”: Source added: “Official guide: Modes”.
  - “Set the grid to 16, quantized”: Check added: “In TIMING the display shows 16, not 16T.”.
  - “A1: load the kick”: Check added: “The display shows the sample number you typed.”; Source added: “Official guide: Modes”.
  - “Learn the placement move once”: Do: “Press MAIN and check that playback is stopped. Hold SHIFT and press − until the display shows 1.1.1. Hold RECORD, tap A1 once, then release RECORD.” (was “Press MAIN and make sure playback is stopped. Hold SHIFT and press − until the display shows 1.1.1. Hold RECORD, tap A1 once, then release RECORD.”); Rhythm lab link added: “Practise this away from the device in the Rhythm lab.”.
  - “Place all four kicks”: Rhythm lab link added: “Practise this away from the device in the Rhythm lab.”.
  - “Place the two snares”: Rhythm lab link added: “Practise this away from the device in the Rhythm lab.”.
  - “Place the eight hats”: Rhythm lab link added: “Practise this away from the device in the Rhythm lab.”.
  - “Listen to your finished drum beat”: Rhythm lab link added: “Practise this away from the device in the Rhythm lab.”.
  - “Tap the drums in SOUND”: Check added: “A1, A2 and A3 play kick, snare and hat in turn.”; Source added: “Official guide: Modes”.
  - “Tweak the balance, one sound at a time”: Check: “Kick and snare stand out clearly; the hats are the quietest part.” (was “Kick and snare are easy to pick out; the hats are supporting detail.”).
  - “Write down DRUMS”: Check added: “Nothing plays; while you hold MAIN, the display shows the scene number.”; Source added: “Official guide: Get started”.
  - “B: select pad 1 in SOUND”: Check added: “B1 makes no sound yet: no sample is loaded on it.”; Source added: “Official guide: Modes”.
  - “Place two bass pulses”: Do: “Press MAIN and check that playback is stopped, with group B selected. Hold RECORD + B1 at 1.1.1 and at 1.3.1 only.” (was “Press MAIN and make sure playback is stopped, with group B selected. Hold RECORD + B1 at 1.1.1 and at 1.3.1 only.”); Rhythm lab link added: “Practise this away from the device in the Rhythm lab.”.
  - “B1: open the trim page”: Check added: “Tapping B1 plays the bass, still untrimmed.”; Source added: “Official guide: Modes”.
  - “Optional: choose reverb for A”: Check added: “Your beat plays on while you choose reverb.”; Source added: “Official guide: Effects”.
  - “Optional: make scene changes wait for the bar”: Check added: “The display shows the current step again.”.
  - “Write down BEAT”: Check added: “Holding MAIN, the display shows a number different from DRUMS.”; Source added: “Official guide: Get started”.
  - “Keep BEAT safe, then start DRUMS”: Check added: “You hear drums only, with no bass.”; Source added: “Official guide: Get started”.
  - “Optional: make a practice copy”: Check added: “Holding MAIN, the display shows BEAT’s scene number.”; Source added: “Official guide: Get started”.
  - “Optional: play along before recording”: Do: “Tap A. Press PLAY and, without touching RECORD, tap pad 2 (snare) once near the end of each loop, right before it starts again.” (was “Tap A. Press PLAY and, without touching RECORD, tap pad 2 (snare) once near the end of each loop, just before it starts again.”).
  - “Optional: arm recording with a count-in”: Check added: “You hear a four-beat count-in before recording starts.”; Source added: “Official guide: Play and record”.
  - “Optional: tap the snare near each loop’s end”: Check added: “A2 plays the snare over the beat and metronome.”; Source added: “Official guide: Play and record”.
  - “Optional: keep it or undo it”: Source added: “Official guide: Play and record”.
  - “Optional: or erase a single note”: Consequence added: “Removes only the A2 note on this step.”; Source added: “Official guide: Play and record”.
  - “Your first beat is done”: Source added: “Official guide: Get started · Modes · Play and record”.
- **Chapter 2** (12 steps):
  - “Go home, and stop playback”: Check added: “Nothing plays: the K.O. II is stopped.”; Source added: “Official guide: Modes”.
  - “Select BEAT”: Check added: “The display shows BEAT’s scene number while you hold MAIN.”; Source added: “Official guide: Modes”.
  - “INTRO: select group B”: Do: “In INTRO, tap B once (do not hold it) to select group B. Press MAIN and check that playback is stopped.” (was “In INTRO, tap B once (do not hold it) to select group B. Press MAIN and make sure playback is stopped.”); Check added: “Nothing plays: INTRO is stopped, with group B selected.”; Source added: “Official guide: Modes”.
  - “Make the intro: remove the bass”: Consequence added: “Removes only the B1 notes on these two steps.”.
  - “MELODY: select C1”: Check added: “C1 plays its current sound, if it holds one.”; Source added: “Official guide: Modes”.
  - “Give the melody two bars”: Do: “Press MAIN and check that playback is stopped, with group C selected. Hold RECORD, press + once, then release both.” (was “Press MAIN and make sure playback is stopped, with group C selected. Hold RECORD, press + once, then release both.”); Why: “This makes C’s pattern two bars long. A and B stay one bar and repeat underneath. Extending adds empty space; it does not copy notes.” (was “This makes C’s pattern two bars long. A and B stay one bar and simply repeat underneath. Extending adds empty space; it does not copy notes.”).
  - “Make the breakdown: clear kick and bass”: Consequence added: “Clears every note of A1 and B1 in this pattern.”; Do: “Stopped, press MAIN and tap A. Hold ERASE + A1 until TRK blinks, then release. Tap B and do the same with B1.” (was “In BREAK, stopped, press MAIN and tap A. Hold ERASE + pad 1 (A1) until TRK blinks on the display, then release. Tap B and do the same with B1.”).
  - “Open the song list”: Check added: “The display shows the current song position.”; Source added: “Official guide: Modes”.
  - “Add position 2: INTRO”: Check added: “Position 2 holds INTRO, the same as position 1.”; Source added: “Official guide: Modes”.
  - “Start the song”: “Needs OS 2.0 or newer”; Check added: “The song plays from the start, beginning with INTRO.”; Source added: “Official guide: Modes”.
  - “A: add a little reverb”: Check added: “You hear a little reverb on the drums.”; Source added: “Official guide: Effects”.
  - “Your song is ready to develop”: Source added: “Official guide: Modes”.
- **Chapter 3** (50 steps):
  - “Open empty project 7”: Check added: “While you hold both, the display shows P 7.”.
  - “Set the tempo to 90 BPM”: Check added: “The display shows 90, the new tempo in BPM.”.
  - “Set the level and threshold”: Check added: “The pads keep blinking, still in sample mode.”.
  - “Listen, and set the level”: Do: “Tap D1 to hear it. Too quiet or distorted? Turn X (input level) up or down, press SAMPLE and record D1 again.” (was “Tap D1. Too quiet: turn X up. Crunchy or distorted: turn X down.”); Check: “D1 plays back your sound.” (was “You should hear your sound.”).
  - “Go to 1.1.1 with group D”: Check added: “The display shows 1.1.1.”.
  - “Erase the test note”: Consequence added: “Removes only that D1 note; the recording stays.”.
  - “Set up group A for sampling”: Check: “The display still shows mic as the source.” (was “Check that the microphone source is still selected (press − / + if not).”).
  - “Make the kick deeper”: Check added: “A1 plays your kick at a lower pitch.”.
  - “Go to 1.1.1 with group A”: Check added: “The display shows 1.1.1.”.
  - “Listen to your voice kit”: Check added: “Your voice kick, snare and hats play the Chapter 1 rhythm.”.
  - “Set up hands-free sampling”: Check added: “Empty pads blink and the display shows mic.”.
  - “D2: start hands-free sampling”: “Needs OS 2.0 or newer”; Check added: “The K.O. II now holds D2 for you; your hands are free.”.
  - “Connect your phone to the line input”: Check added: “The cable runs from the phone into INPUT.”.
  - “Set the phone’s volume to half”: now an info step (no Check).
  - “Choose what to sample”: now an info step (no Check).
  - “Select the line input”: Check added: “The display shows in; empty pads blink.”.
  - “D3: record the phone, hands-free”: “Needs OS 2.0 or newer”.
  - “Connect over USB audio (OS 2.5)”: Check added: “The K.O. II appears as an audio device.”.
  - “Choose the K.O. II as audio output”: Check added: “The phone or computer shows the K.O. II as its output.”.
  - “Optional: hear the phone while sampling”: Check added: “The SYSTEM icon goes out.”.
  - “Select USB as the source”: Check added: “The display shows usb; empty pads blink.”.
  - “Choose the mic again”: Check added: “Empty pads blink and the display shows mic.”.
  - “Set the lo recording rate (500)”: Check added: “You are on 500: new recordings use the lo rate.”.
  - “A2: open sound edit”: Check added: “A2 plays your snare as you select it.”.
  - “Trim the start of A2”: Check added: “A2 sounds the instant you tap it.”.
  - “Copy A2’s sound”: Check added: “A2 plays your snare as you select it.”.
  - “A4: open the time page”: Check added: “The display shows tim.”.
  - “Optional: set the kick’s crop points”: Check added: “A1 plays only the kick.”.
  - “Optional: crop the kick”: Consequence added: “Overwrites the kick’s file: only the part between your trim points is kept.”.
  - “Optional: try live chop”: Check added: “In CHOP the display shows Cho.”.
  - “Choose equal-length slices”: “Needs OS 2.5 or newer”; Check added: “The display shows EQU: equal-length slices.”.
  - “Chop into four slices”: Check added: “Back in MAIN, group C holds four slices of your count.”.
  - “Go to 1.1.1 with group C”: Check added: “The display shows 1.1.1.”.
  - “Remix the count”: Before you press: “Stopped, press briefly: a long hold clears every note of the pad.” (was “Stop first, and press briefly: a long hold clears every note of the pad.”); Consequence added: “Removes only the “three” note at 1.3.1.”; Do: “Go to 1.3.1, briefly press ERASE + the “three” pad, then hold RECORD and tap the “one” pad there. Press PLAY.” (was “Remix it: go to 1.3.1, briefly press ERASE + the “three” pad, then hold RECORD and tap the “one” pad there. Press PLAY.”).
  - “Stop, and select group B”: Check added: “Nothing plays, and group B is selected.”.
  - “Choose the resample source”: “Needs OS 2.0 or newer”.
  - “B1: resample one bar”: “Needs OS 2.0 or newer”.
  - “Commit a new scene: BOUNCE”: Check added: “The BOUNCE number is different from VOICE KIT.”.
  - “Choose the filter for group B”: Check added: “Your bounced beat plays from B1.”.
  - “Shape the sound with X”: Check added: “Left, the beat sounds muffled; right, it loses its low end.”.
  - “B2: get ready to resample”: “Needs OS 2.0 or newer”; Check added: “rsp shows; hands-free sampling waits for PLAY.”.
  - “Record a filter sweep”: Check added: “The beat opens up from muffled to bright.”.
  - “Set group B back to dry”: Check added: “The beat plays dry, with no filter.”.
  - “B1: open the time page”: Check added: “The display shows tim.”.
  - “Stretch B1 to one bar”: Check added: “The stopwatch TIME icon is now lit.”.
  - “Go back to 90 BPM”: Check added: “B1 slows down and stays in time.”.
  - “Optional: match a song’s tempo”: Check added: “The display shows the song’s tempo.”.
  - “Optional: play your stretched loop”: Check added: “B1 plays in time at the matched tempo.”.
  - “Optional: move the loop”: Check added: “The repeated piece moves, still in time.”.
  - “Optional: leave the loop”: Check added: “The loop ends and the full beat plays on.”.
- **Chapter 4** (96 steps):
  - “Copy BEAT as a practice scene”: Check added: “You are now in the copy, not BEAT.”.
  - “Name it LIVE and listen”: Check: “You hear the same drums and bass as BEAT.” (was “You should hear the same drums and bass as BEAT.”).
  - “Turn on pad velocity (301)”: Check added: “The SYSTEM icon goes out. Soft taps now play quietly.”.
  - “Play A2 softly, then firmly”: Check: “You hear a quiet snare, then a loud one.” (was “You should hear a quiet snare, then a loud one.”).
  - “Turn on the practice click (400)”: Check added: “The SYSTEM icon goes out. The click now plays with the beat.”.
  - “Set the click volume”: Check added: “The click gets louder or softer with Y.”.
  - “Clear the snare in LIVE”: Consequence added: “Clears every note of A2 in LIVE.”; Do: “Stopped, in MAIN with group A selected, hold ERASE + A2 until TRK blinks, then release.” (was “Remove the placed snare in LIVE: stopped, in MAIN with group A selected, hold ERASE + A2 until TRK blinks on the display, then release.”).
  - “Set quantize on the 16 grid”: Check added: “Recorded hits now snap to the 16-step grid.”.
  - “Practise the backbeat on A2”: Check added: “Your snare joins the beat on 2 and 4.”.
  - “Add soft ghost notes”: Do: “Then add one or two very soft taps right before beat 4. Practise until it feels steady, then stop.” (was “Then add one or two very soft taps just before beat 4. Practise until it feels steady, then stop.”); Check added: “The ghost notes sound much quieter than the backbeat.”.
  - “Get ready to record live”: Check added: “You hear a four-beat count-in, then recording starts.”.
  - “Record one bar of snare”: Check: “Your backbeat and ghost notes repeat by themselves, on the grid.” (was “You should hear your backbeat and ghost notes repeat by themselves, on the grid.”).
  - “Not happy? Undo, or erase while it plays”: Consequence added: “Erases only the A2 hits held through.”; Do: “Press SHIFT + B while the umbrella is lit and record again. Or, while it plays, hold ERASE + A2 as the unwanted hits sound.” (was “Not happy? Press SHIFT + B while the umbrella is lit and record again. Or, while it plays, hold ERASE + A2 as the unwanted hits sound.”).
  - “Fix a ghost note that is too loud”: Check added: “The ghost note on that step now plays quieter.”.
  - “Switch to free time”: Check added: “Recorded hits now keep your exact timing.”.
  - “Optional: clear the hats in LIVE”: Consequence added: “Clears every note of A3 in LIVE.”.
  - “Optional: record swung hats”: Check: “The hats lean into a shuffle.” (was “You should hear the hats lean into a shuffle.”).
  - “Set quantize back, without swing”: Check added: “The SWING icon goes out.”.
  - “Set the metronome back (401)”: Check added: “The SYSTEM icon goes out. The click now plays only while recording.”.
  - “Copy DRUMS as BASSLINE”: Check added: “You are now in the copy, not DRUMS.”.
  - “Name it, and listen”: Check added: “You hear drums only; no bass plays.”.
  - “Copied BEAT? Clear its bass”: Consequence added: “Clears every note of B1 in BASSLINE.”.
  - “Make group B two bars long”: Why: “A stays one bar long and repeats underneath.” (was “A stays one bar long and simply repeats underneath.”).
  - “Drop an octave”: Check added: “Each pad plays B1’s bass an octave lower.”.
  - “Choose a key”: Check added: “The display shows the key, changing as X turns.”.
  - “Choose the blues scale”: Check added: “The display shows BLU.”.
  - “Count along for two bars”: Check added: “The drums play under your count.”.
  - “Play a two-bar bassline”: Check: “You play the same two-bar line twice in a row.” (was “Repeat the same two-bar line until you can play it twice in a row.”).
  - “Record your bassline”: Check: “Your bassline repeats every two bars over the drums.” (was “You should hear your bassline repeat every two bars over the drums.”).
  - “Switch KEYS off”: Check: “You hear kick and snare, not one sound at different pitches.” (was “You should hear kick and snare, not one sound at different pitches.”).
  - “Copy BEAT as ROLL, clear the hats”: Consequence added: “Clears every note of A3 in ROLL.”; Do: “Make a practice copy of BEAT and write it as ROLL. Tap A. Stopped, hold ERASE + A3 until TRK blinks.” (was “In project 6, make a practice copy of BEAT and write it as ROLL. Tap A. Stopped, hold ERASE + A3 until TRK blinks to clear the hats.”).
  - “Set the repeat to eighth notes”: Check added: “Kick, snare and bass play, with no hats.”.
  - “Get ready to record the hats”: Check added: “You hear a four-beat count-in, then recording starts.”.
  - “Record one bar of repeated hats”: Check: “You hear steady eighth-note hats again, this time played by you.” (was “You should hear steady eighth-note hats again, this time played by you.”).
  - “Set a fast roll (32)”: Check added: “Note repeat now runs at 32 per bar.”.
  - “Record a roll on beat 4”: Do: “Tap RECORD and press PLAY. After the count-in, count the bar, and on beat 4 hold TIMING + A3 for that one beat only.” (was “Tap RECORD and press PLAY. After the count-in, count the bar, and on beat 4 hold TIMING + A3 for just that one beat.”); Check added: “The hat rolls fast through beat 4.”.
  - “Let go and stop recording”: Check: “You hear a fast “trrrr” leading into every new loop.” (was “You should hear a fast “trrrr” leading into every new loop.”).
  - “Set the grid back to 16”: Check added: “The grid is back to 16 steps per bar.”.
  - “Set the repeat to one per beat”: Check added: “The beat plays and the display shows 4.”.
  - “Latch the hat”: Check added: “The hat repeats once per beat, hands-free.”.
  - “Stop the latch and reset”: Check added: “The hat repeat stops, then playback stops.”.
  - “C2: select an unused pad”: Check added: “The SOUND icon lights; C2 plays its current sound, if any.”.
  - “Load a short melodic sound”: Check added: “The display shows a number in 500–599: melodic sounds.”.
  - “Find the play mode page”: Check added: “The display changes with each page.”.
  - “Set C2 to oneshot or legato”: Check added: “C2 now plays one note at a time.”.
  - “Switch on KEYS at the 16 grid”: “Needs OS 2.5 or newer”; Check added: “The piano icon lights and the beat plays.”.
  - “Play an arpeggio”: Check: “The notes play one at a time, in the order you pressed them.” (was “You should hear the notes one at a time, in the order you pressed them.”).
  - “Set quantize back”: Check added: “The grid is back to 16 steps, with quantize on.”.
  - “Switch KEYS off”: Check: “C1 plays your Chapter 2 melody sound at its normal pitch.” (was “It should play your Chapter 2 melody sound at its normal pitch.”).
  - “Copy BEAT as FXJAM”: Check added: “The copy plays the same beat as BEAT.”.
  - “Beat repeat: FX + pad 1”: Check: “The beat stutters, then carries on normally when you let go.” (was “You should hear the beat stutter, then carry on normally when you let go.”).
  - “Try the other punch-in FX”: Check added: “Each pad changes the beat differently while held.”.
  - “Read the fader labels”: Check added: “The labels include level, pitch and pan.”.
  - “Find normal pitch again”: Check added: “The drums sound normal again, then playback stops.”.
  - “Record a fader move”: Check: “You hear your move repeat by itself every loop.” (was “You should hear your move repeat by itself every loop.”).
  - “Erase the pitch moves only”: Consequence added: “Erases the recorded pitch moves only; the notes stay.”.
  - “Set the fader back to level”: Check added: “The fader controls drum volume again, not pitch.”.
  - “Copy BEAT as EDIT”: Check added: “You are in EDIT, a copy with its own number.”.
  - “A4: choose a free pad”: Check added: “The SOUND icon lights; A4 plays its current sound, if any.”.
  - “Load a short click on A4”: Check added: “The display shows a number in 300–399: percussion.”.
  - “Make it quieter than the kick”: Check added: “A4 now sounds quieter than the kick.”.
  - “Copy A1’s notes onto A4”: Check added: “A4 now has a note wherever A1 has one.”.
  - “Check the copied layer”: Check: “A4 lights there, like A1. Every kick now has the percussion stacked on top.” (was “A4 lights there, just like A1. Every kick now has the percussion stacked on top.”).
  - “Open timing correct”: Check added: “Timing correct is open; no notes have moved yet.”.
  - “A4: move the layer six ticks later”: Check added: “Every A4 note now sits six ticks later.”.
  - “Hear the flam”: Check: “The layer lands slightly after the kick, a thicker double hit called a flam.” (was “The layer now lands just after the kick, a thicker double hit called a flam.”).
  - “Free time, at 1.4.1”: Check added: “The display shows 1.4.1, and A2 lights there.”.
  - “Set quantize back and compare”: Check: “EDIT sounds thicker and slightly laid-back.” (was “EDIT should sound thicker and slightly laid-back.”).
  - “Make scene changes wait (412)”: Check added: “The SYSTEM icon goes out. Scene changes now wait for the pattern’s end.”.
  - “Write a running order”: now an info step (no Check).
  - “Play INTRO and count the passes”: Check added: “INTRO plays, repeating once per bar.”.
  - “Try a direct jump to a scene”: Check added: “The scene whose number you typed plays.”.
  - “Perform your running order”: Check added: “Each scene change lands at the end of a pattern.”.
  - “Copy a throwaway scene: TRASH”: Check added: “Holding MAIN shows the copy’s new number.”.
  - “Clear TRASH”: “Needs OS 2.0.1 or newer”; Before you press: “Only ever do this on a scene whose number you checked a moment ago.” (was “Only ever do this on a scene whose number you have just checked.”); Consequence added: “Clears everything in this scene.”.
  - “Delete the empty TRASH scene”: “Needs OS 2.0.1 or newer”; Consequence added: “Deletes the scene itself.”; Check: “DEL shows: the empty TRASH scene is deleted.” (was “Hold MAIN to see which scene you are in now.”).
  - “Optional: leave lock mode”: Check added: “The K.O. II starts without showing LOK.”.
  - “Set instant scene changes (410)”: Check added: “The SYSTEM icon goes out. Scene changes happen immediately again.”.
  - “Open the song list”: Check added: “The display shows the current song position.”.
  - “Put BREAK2 at position 7”: “Needs OS 2.0 or newer”; Check added: “Position 7 now holds BREAK2’s number.”.
  - “Play the longer song”: “Needs OS 2.0 or newer”.
  - “Make the song loop (421)”: Check added: “The SYSTEM icon goes out. Song loop is now on.”.
  - “Rehearse with the loop”: “Needs OS 2.0 or newer”; Check added: “After position 10 the song starts again.”.
  - “Switch the loop off (420)”: Check added: “The SYSTEM icon goes out. Song loop is now off.”.
  - “Optional: cut position 10”: “Needs OS 2.0 or newer”; Check added: “The song list now has 9 positions.”.
  - “Optional: insert it at position 1”: “Needs OS 2.0 or newer”; Check added: “BREAK now plays at or near the start.”.
  - “Play MELODY”: Check added: “MELODY plays: drums, bass and melody.”.
  - “A1: make the kick the trigger”: Check added: “A1 is now the sidechain trigger; MELODY plays on.”.
  - “Choose B and C to dip”: Check added: “Groups B and C are now set to dip on every kick.”.
  - “Leave the settings and listen”: Do: “Press MAIN to leave the settings, then stop. Play BEAT and INTRO too, and compare them.” (was “Press MAIN to leave the settings, then stop. Play BEAT and INTRO too, and listen for the pump there.”); Check added: “BEAT’s bass pumps too; INTRO, drums only, stays steady.”.
  - “Connect the K.O. II over USB-C”: Check added: “The USB MIDI icon lights, and a new USB audio device appears.”.
  - “Choose it as your app’s input”: “Needs OS 2.5 or newer”; Check added: “The app shows the K.O. II as its input.”.
  - “Set the recording level”: “Needs OS 2.0 or newer”; Check added: “The app’s meter peaks below the top.”.
  - “Record your performance”: “Needs OS 2.0 or newer”; Check added: “The song plays from the start while the app records.”.
  - “Stop the recording and listen”: Check added: “Your song plays back, with your live effects.”.
  - “No USB audio? Use the line output”: Check added: “The recorder’s level meter moves when the K.O. II plays.”.
- **Chapter 5** (81 steps):
  - “Open empty project 8”: Check added: “Project 8 opens: the display shows P 8.”.
  - “Check that project 8 is empty”: Check: “Nothing sounds: PLAY and the pads are silent.” (was “Nothing should sound. Silent too.”).
  - “A1: load the kick”: Check added: “The display shows the sample number for A1.”.
  - “A2 and A3: load snare and hat”: Check added: “The display shows sample numbers 100, then 200.”.
  - “Set the tempo to 90 BPM”: Check added: “The display shows 90: 90 BPM.”.
  - “Set the grid to 16, quantized”: Check added: “The MAIN icon is lit again.”.
  - “Go to 1.1.1 with group A”: Check added: “The display shows 1.1.1: the start of bar 1.”.
  - “Practise the snare on 2 and 4”: Check added: “Each tap plays a snare over the beat.”.
  - “Arm recording with a count-in”: Check added: “A four-beat count-in plays, then recording starts.”.
  - “Play the snare on two and four”: Check added: “Your snare now repeats by itself each loop.”.
  - “Checkpoint: the rebuilt beat”: Check: “You hear the Chapter 1 · First beat drums.” (was “You should hear the Chapter 1 · First beat drums.”).
  - “Optional: open timing correct”: Check added: “The display changes as timing correct opens.”.
  - “Name VERSE and commit”: Check added: “VERSE’s scene number is on your paper.”.
  - “Checkpoint: HOOK sounds like VERSE”: Check: “You hear the drums plus two bass pulses per bar, exactly like VERSE.” (was “You should hear the drums plus two bass pulses per bar, exactly like VERSE.”).
  - “Turn down, then set up one source”: now an info step (no Check).
  - “Find your PHRASE”: now an info step (no Check).
  - “Note where the PHRASE is”: now an info step (no Check).
  - “Pick your ANSWER word”: now an info step (no Check).
  - “C: open SAMPLE”: Check added: “The pads light up and blink: sample mode is on.”.
  - “Choose the input and level”: Check added: “The display names your input: usb, in or mic.”.
  - “Set the threshold low”: Check added: “The pads still blink, ready to record.”.
  - “Start the song before the PHRASE”: Check added: “The pads still blink while the song plays.”.
  - “C1: record the PHRASE”: Do: “Right BEFORE the first word, hold pad 1 (C1) and keep holding through the words; release right AFTER the last word.” (was “Just BEFORE the first word, hold pad 1 (C1) and keep holding through the words; release just AFTER the last word.”); Not working?: “Need both hands for the source? Hands-free sampling (OS 2.0 and later): hold SHIFT and press pad 1 right before the words, then press SAMPLE right after them.” (was “Need both hands for the source? Hands-free sampling (OS 2.0 and later): hold SHIFT and press pad 1 just before the words, then press SAMPLE right after them.”).
  - “Copy C1’s sound”: Check added: “Selecting C1 plays your phrase.”.
  - “C1: open the trim page”: Check added: “The display shows TRI: C1’s trim page.”.
  - “Trim the start of the PHRASE”: Do: “Turn X (start) a little at a time, tapping pad 1 between changes, until playback starts right before the first word.” (was “Turn X (start) a little at a time, tapping pad 1 between changes, until playback starts just before the first word.”); Check added: “C1 now starts right before the first word.”.
  - “Trim the end of the PHRASE”: Do: “Stay on the trim page. Turn Y (length) down, tapping pad 1, until playback stops right after the LAST word.” (was “Stay on the trim page. Turn Y (length) down, tapping pad 1, until playback stops just after the LAST word.”); Check: “Every word stays clear, and playback ends soon after the last one.” (was “Keep every word clear.”).
  - “C2: open the trim page”: Check added: “The display shows TRI again, for C2.”.
  - “C2: set oneshot”: Check added: “The display shows oneshot, not key or legato.”.
  - “C1: set oneshot”: Check added: “The display shows oneshot for C1 too.”.
  - “Set the vocal volume”: Check added: “The words sound clear, no louder than the snare.”.
  - “C1: place the PHRASE at 1.1.1”: Check added: “C1 lights at 1.1.1.”.
  - “Check the phrase timing”: Check: “The phrase starts right at the top of bar 1, with room after it.” (was “The phrase should start right at the top of bar 1, with room after it.”).
  - “Go to 2.3.1”: Check added: “The display shows 2.3.1.”.
  - “Listen to the bass with the words”: Check added: “Drums, bass, phrase and answer play together.”.
  - “Retune the bass if it clashes”: Check added: “B1 plays the bass at a new pitch.”.
  - “Nothing fits? Try another bass”: Check added: “The sample number changes with each press.”.
  - “HOOK only: drop the bass”: Consequence added: “Clears every note of B1 in HOOK.”; Do: “Still clashing? Stopped, tap B, hold ERASE + pad 1 until TRK blinks, then release.” (was “Still clashing? Drop the bass from HOOK only: stopped, tap B, hold ERASE + pad 1 until TRK blinks, then release.”).
  - “Lower the hats if they cover the words”: Check added: “The hats sit below the words.”.
  - “Set the vocal pads”: Do: “Tap C and set pads 1 and 2 so the words come through clearly.” (was “Tap C and set pads 1 and 2 so the words are easy to follow.”); Check added: “Every word of the phrase and answer is clear.”.
  - “Keep the bass below the kick”: Check added: “The kick stands out above the bass.”.
  - “Copy VERSE as INTRO”: Check added: “The new number differs from VERSE’s.”.
  - “Clear INTRO’s bass”: Consequence added: “Clears every note of B1 in INTRO.”.
  - “Check VERSE and HOOK are unchanged”: Do: “Hold MAIN, select VERSE and release; press PLAY, then stop. Do the same with HOOK.” (was “Hold MAIN and select VERSE: its bass is still there. Select HOOK: its vocal is still there.”); Check added: “VERSE still has its bass, and HOOK its vocal.”.
  - “Copy INTRO as BREAK”: Check added: “The new number differs from INTRO’s.”.
  - “Clear the snare in BREAK”: Consequence added: “Clears every note of A2 in BREAK.”.
  - “Clear the hats in BREAK”: Consequence added: “Clears every note of A3 in BREAK.”.
  - “A3: two hats per bar”: Check added: “A3 lights at 1.1.1 and 1.3.1 only.”.
  - “Copy HOOK as RETURN”: Check added: “HOOK plays its vocal; RETURN gets a new number.”.
  - “Copy C1’s sound”: Check added: “Selecting C1 plays your trimmed phrase.”.
  - “D1: open the trim page”: Check added: “The display shows TRI, now for D1.”.
  - “Trim D1 to one short word”: Check added: “D1 plays only one short word.”.
  - “Make D1 quieter”: Check added: “D1 now plays quieter, a small detail.”.
  - “Optional: open D1’s time page”: Check added: “The display shows tim.”.
  - “Go to 2.4.1 in RETURN”: Check added: “The display shows 2.4.1: bar 2, beat 4.”.
  - “Copy INTRO as END”: Check added: “The new number differs from INTRO’s.”.
  - “Clear the kicks, write one per bar”: Consequence added: “Clears every note of A1 in END.”.
  - “Checkpoint: play RETURN and HOOK”: Check added: “RETURN repeats the word twice; HOOK does not.”.
  - “Play END”: Check added: “One kick per bar, with snare and hats only.”.
  - “Read the song map”: now an info step (no Check).
  - “INTRO: select group C”: Check added: “The scene number matches INTRO on your paper.”.
  - “Do the same in END”: Check added: “The display shows Ln.4 in END too.”.
  - “Make VERSE, HOOK and RETURN 16 bars”: Check added: “Each press doubles the length shown, up to 16 bars.”.
  - “Open the song list”: Check added: “The display shows the current song position.”.
  - “Set position 1 to INTRO”: “Needs OS 2.0 or newer”; Check added: “Position 1 holds INTRO’s scene number.”.
  - “Add VERSE as position 2”: Check added: “Position 2 holds VERSE’s scene number.”.
  - “Checkpoint: play the song”: “Needs OS 2.0 or newer”.
  - “Play the song from the beginning”: “Needs OS 2.0 or newer”; Check added: “The song starts with INTRO: drums only.”.
  - “Listen to the balance”: Do: “Listen for kick and snare first, then the bass, then whether the words are clear.” (was “Listen for kick and snare first, then the bass, then whether the words are easy to understand.”); Check added: “Kick and snare stand out, and every word is clear.”.
  - “Optional: start the song”: “Needs OS 2.0 or newer”; Check added: “The song plays from the start, INTRO first.”.
  - “Optional: add reverb to the vocal”: Check added: “The vocal gains a light reverb tail.”.
  - “Listen to BREAK into RETURN”: “Needs OS 2.0 or newer”; Check: “After the bare break, the phrase, answer and repeated word sound bigger.” (was “The bare break should make the phrase, answer and repeated word feel bigger.”).
  - “Optional: scene changes wait for the bar (411)”: Check added: “The SYSTEM icon lights, then goes out after MAIN.”.
  - “Optional: start INTRO by hand”: Check added: “INTRO plays: drums only.”.
  - “Optional: pick each next scene in time”: Check added: “Each new scene starts at the bar’s end.”.
  - “Optional: instant scene changes again (410)”: Check added: “The SYSTEM icon lights, then goes out after MAIN.”.
  - “Connect a recorder”: “Needs OS 2.5 or newer”; Check added: “Your recording app lists the K.O. II as an input.”.
  - “Record the song”: “Needs OS 2.0 or newer”; Check added: “The song plays while your app records.”.
  - “Write down your scene numbers”: now an info step (no Check).
  - “Back up the project”: Check added: “A new backup file is on your computer.”.
  - “Checkpoint: the finished song”: “Needs OS 2.0 or newer”; Check: “You hear a finished beat of about 2:51.” (was “You should hear a finished beat of about 2:51.”).
- **Chapter 6** (85 steps):
  - “Open empty project 9”: Check added: “While both are held, the display shows P 9.”.
  - “Check that project 9 is empty”: Check: “You hear nothing: in an empty project the pads have no sounds yet.” (was “You should hear nothing. In an empty project the pads have no sounds yet.”).
  - “Set the grid to 16”: Check added: “The display shows 16.”.
  - “Choose quantize, no swing”: Check added: “The display shows a position such as 1.1.1 again.”.
  - “A1: load sound 001”: Check added: “A1 plays a kick, sound 001.”.
  - “Browse for a punchy kick”: Check added: “A1 plays a short, punchy kick.”.
  - “A2: choose a clap or snare”: Check added: “A2 plays a crisp, short clap or snare.”.
  - “A3: choose a closed hat”: Check added: “A3 plays a short closed hat.”.
  - “Turn the hat down”: Check added: “A3 sounds quieter than the kick and clap.”.
  - “A4: an open hat”: Check added: “A4 plays a short open hat.”.
  - “A5 and A6: a rim and a shaker”: Check added: “A5 clicks; A6 plays a soft shaker.”.
  - “B1: choose a bass”: Check added: “B1 plays a clean, short bass.”.
  - “Turn the bass down”: Check added: “B1 sounds quieter than the kick.”.
  - “Go to 1.1.1 with group A”: Do: “Press MAIN and check that playback is stopped. Tap A. Hold SHIFT and press − until the display shows 1.1.1.” (was “Press MAIN and make sure playback is stopped. Tap A. Hold SHIFT and press − until the display shows 1.1.1.”); Check added: “The display shows 1.1.1.”.
  - “A3: off-beat hats”: Check: “The kick feels steady and the hats sound smaller than the clap.” (was “The kick should feel steady and the hats smaller than the clap.”).
  - “A6: a shaker in bar 1”: Check added: “At 1.1.4 and 1.3.4 A6 lights.”.
  - “A3: two hat accents”: Check added: “A3 lights at 2.2.4 and 4.2.4.”.
  - “A4: open hats instead of closed”: Consequence added: “Removes only those two A3 notes.”; Do: “Write A4 (open hat) at 2.4.3 and 4.4.3. There, also briefly press ERASE + A3, so the open hat replaces the closed hat.” (was “Write A4 (open hat) at 2.4.3 and 4.4.3. At both positions also briefly press ERASE + A3, so the open hat replaces the closed hat instead of stacking on it.”).
  - “A5: rim clicks”: Check added: “A5 lights at all four positions.”.
  - “Turn the rim down”: Check added: “A5 is now a tiny, quiet click.”.
  - “Listen, then stop”: Check added: “Your tom hits play back at the end of bar 4.”.
  - “Optional: open timing correct”: Check added: “The display shows 16 for X.”.
  - “Optional: push the shaker later”: Check added: “The shaker now lands a touch later, for a looser groove.”.
  - “B1: bass in bar 1”: Check added: “B1 lights at all four positions.”.
  - “Double B to four bars”: Check added: “B doubles to four bars, its notes copied.”.
  - “B2: the answer at 4.4.3”: Consequence added: “Removes only the B1 note at 4.4.3.”.
  - “Open the sidechain page”: Check added: “The beat plays on while the sidechain page is open.”.
  - “Kick as source, bass as destination”: Check added: “The beat keeps playing while you set source and destination.”.
  - “Set the duck”: Check: “The bass dips under each kick and recovers before its next note.” (was “Stop adjusting when the bass dips under each kick and recovers before its next note.”).
  - “The stand-up test”: Check: “Your body wants to move: the groove works.” (was “If your body wants to move, continue.”).
  - “Write down GROOVE”: Check added: “While MAIN is held, the display shows the scene number.”.
  - “Choose the source”: Check added: “The display names the source, such as usb or in.”.
  - “Set the input level”: Check added: “The input level is strong but not distorted.”.
  - “Set the threshold low”: Check added: “The pads still blink; nothing records until you hold a pad.”.
  - “C1: record your hook”: Check added: “Recording stops as you release; C1 now holds your words.”.
  - “C1: select it in SOUND”: Check added: “C1 plays your hook as you select it.”.
  - “Open the trim page”: Check added: “Nothing is cropped yet: C1 still plays your whole recording.”.
  - “Trim the start”: Check added: “Tapping C1 starts right on the first word.”.
  - “Trim the end”: Do: “Turn Y (length) until it ends right after the last word.” (was “Turn Y (length) until it ends just after the last word.”); Check added: “C1 now stops right after your last word.”.
  - “C1: set oneshot”: Check added: “A single tap of C1 plays the whole trimmed phrase.”.
  - “Set the vocal level”: Check added: “C1 is clear but no louder than the clap.”.
  - “Check you are in DROP A”: Check added: “The display shows DROP A’s number from your paper.”.
  - “Commit, and name the copy DROP B”: Check added: “The new number differs from DROP A’s.”.
  - “DROP B: select C2”: Check added: “C2 is now the selected pad in SOUND.”.
  - “Choose a short synth stab”: Check added: “C2 plays a short, quiet synth stab.”.
  - “C2: write the answer”: Check added: “C2 lights at 2.3.3 and 4.3.3.”.
  - “Listen to DROP B”: Check added: “Drums, bass, the hook and the synth answer in bars 2 and 4.”.
  - “Copy GROOVE as OUTRO”: Check added: “The new number differs from GROOVE’s.”.
  - “Clear the open hats, rim and tom”: Consequence added: “Clears every note of A4, A5 and A7 in OUTRO.”; Do: “Tap A. Hold ERASE + A4 until TRK blinks, then release. Do the same with A5 and A7.” (was “Tap A. Hold ERASE + A4 until TRK blinks, then release: every open hat in this pattern is gone. Do the same with A5 (rim) and A7 (tom).”).
  - “Copy OUTRO as INTRO”: Check added: “The new number differs from OUTRO’s.”.
  - “Clear INTRO’s bass”: Consequence added: “Clears every note of B1 and B2 in INTRO.”.
  - “Copy DROP A as BUILD”: Check added: “The new number differs from DROP A’s.”.
  - “Clear the bass and hats”: Consequence added: “Clears the bass and both hats in BUILD.”; Do: “Tap B and clear B1 and B2 (hold ERASE + pad until TRK blinks). Tap A and clear A3 and A4 the same way.” (was “Tap B and clear B1 and B2 (hold ERASE + pad until TRK blinks). Tap A and clear A3 (closed hats) and A4 (open hats) the same way.”).
  - “A2: a clap roll in bar 4”: Check added: “Bar 4 ends with a roll of claps.”.
  - “Copy BUILD as BREAK”: Check added: “The new number differs from BUILD’s.”.
  - “Clear the kick, clap and tom”: Consequence added: “Clears every note of A1, A2 and A7 in BREAK.”; Check: “PLAY gives only the rim, shaker and your hook.” (was “PLAY gives just the rim, shaker and your hook.”).
  - “Copy DROP B as PEAK”: Check added: “The new number differs from DROP B’s.”.
  - “Remove the last kick”: Consequence added: “Removes only the A1 note at 4.4.1.”.
  - “Play DROP B”: Check added: “DROP B plays: the hook plus the synth answer.”.
  - “C: add a short reverb”: Check added: “The hook gains space; the words stay clear.”.
  - “Optional: copy C1’s sound”: Check added: “C1 plays your hook as you tap it.”.
  - “Optional: a fresh D pattern in BUILD”: Check added: “D has a fresh, empty pattern in BUILD only.”.
  - “Checkpoint: the sections in order”: Check: “Something new arrives with each scene.” (was “Something new should arrive each time.”).
  - “Check every scene is four bars”: Check: “Each one restarts after four bars (16 beats).” (was “It should restart after four bars (16 beats).”); Note: “Groups you never lengthened stay one bar and repeat underneath; that is fine.” (was “Groups you never lengthened stay one bar and simply repeat underneath; that is fine.”).
  - “Open the song list”: Check added: “The display shows the current song position.”.
  - “Set position 1 to INTRO”: “Needs OS 2.0 or newer”; Check added: “Song position 1 now holds INTRO’s scene.”.
  - “Add position 2: INTRO”: “Needs OS 2.0 or newer”; Check added: “Song position 2 now holds INTRO’s scene too.”.
  - “Add positions 13 to 28”: Check added: “The display shows song position 28; it holds OUTRO.”.
  - “Checkpoint: play the song”: “Needs OS 2.0 or newer”.
  - “List three things you dislike”: Check added: “The song stops by itself; your paper lists three dislikes.”.
  - “First fix: the drum levels”: Check added: “The kick is loudest, the clap slightly below it.”.
  - “Bass and vocal levels”: Check added: “The bass sits under the kick; the words are clear.”.
  - “Second fix: shorten the bass tail”: Check added: “B1 ends sooner and the low end clears.”.
  - “Or lengthen the sidechain duck”: “Needs OS 2.0 or newer”; Check added: “The bass ducks a little longer under each kick.”.
  - “If it feels empty or crowded”: Check added: “The shaker or rim is slightly louder in every scene.”.
  - “Third fix: your real speaker”: Check added: “On your speaker the kick leads and nothing distorts.”.
  - “Checkpoint: into the second drop”: “Needs OS 2.0 or newer”.
  - “Connect a recorder”: “Needs OS 2.5 or newer”; Check added: “The recording app shows K.O. II as its input.”.
  - “Record the song”: “Needs OS 2.0 or newer”; Check added: “The song plays from the start; the app records it.”.
  - “Write down your scene numbers”: now an info step (no Check).
  - “Back up your samples”: Check added: “A copy of your samples is on your computer.”.
  - “Optional: scenes wait for the pattern (412)”: Do: “With the unit on, press SHIFT + ERASE, type 4, 1, 2, press ENTER, then MAIN.” (was “With the unit already switched on, press SHIFT + ERASE (system settings), type 4, 1, 2, press ENTER, then press MAIN.”); Check added: “The SYSTEM icon goes out.”.
  - “Optional: pick each next scene early”: Check added: “The new scene starts when the current pattern ends.”.
  - “Optional: instant scene changes again (410)”: Check added: “Scene changes are instant again.”.
  - “Checkpoint: the finished track”: Check added: “The whole track plays and stops by itself.”.
- **Chapter 7** (91 steps):
  - “Choose a project for this chapter”: now an info step (no Check).
  - “Reusing one? Back it up first”: Check added: “A new backup file appears in your browser’s downloads.”.
  - “Open the project”: Check added: “While you hold both, the display shows P and the project’s number.”.
  - “Set the tempo to 128 BPM”: Check added: “The display shows 128 before you press MAIN.”.
  - “Set the grid to 16”: Check added: “The display shows 16: 16 steps per bar.”.
  - “Quantize on, swing alone”: Check added: “Notes you record now snap to the 16-step grid.”.
  - “Listen: is the project empty?”: Check added: “Nothing plays: the project is empty.”; Note: “Music? Press PLAY to stop and don’t erase anything yet: first check that you are in the project you chose. If you hear your Chapter 6 tech house track, your Chapter 5 hip-hop beat or your Chapter 1–2 beat, MAIN + the pad switched scene instead of project: go back to step 3.” (was “Music? Press PLAY to stop and don’t erase anything yet: first make sure you are in the project you chose. If you hear your Chapter 6 tech house track, your Chapter 5 hip-hop beat or your Chapter 1–2 beat, MAIN + the pad switched scene instead of project: go back to step 3.”).
  - “Old music? Clear the old patterns”: Before you press: “Only for the reused project’s own old music, and only after a backup.” (was “Only when you hear the reused project’s own old music, and only after you have backed it up.”); Consequence added: “Erases the current pattern of every group.”; Check: “PTN blinks for each group; PLAY now plays nothing.” (was “Press PLAY again: now you should hear nothing.”).
  - “Reused project 7? Empty D1 to D5”: Check added: “D1 to D5 are now empty and play nothing.”.
  - “Write the project and V1 to V5”: now an info step (no Check).
  - “Write the scene names”: now an info step (no Check).
  - “Plan your five vocals”: now an info step (no Check).
  - “Choose the source”: Check added: “The display shows your source: mic, in or usb.”.
  - “Set the input level”: Check added: “The lights keep blinking: you are still in SAMPLE.”.
  - “Set the threshold low”: Check added: “The lights still blink: nothing records until you hold a pad.”.
  - “D1: record V1”: Do: “Get ready, then press and hold pad D1 (pad 1, with D selected). Perform V1, and release right after the last word.” (was “Get ready, then press and hold pad D1 (pad 1, with D selected). Perform V1, and release just after the last word.”).
  - “Listen to D1”: Check added: “D1 plays V1, perhaps with a little silence around it.”.
  - “D2 to D5: record V2 to V5”: Check added: “D2 to D5 stop blinking and stay lit.”.
  - “Listen to D2 to D5”: Check added: “D2 to D5 play V2 to V5.”.
  - “Audio files? Transfer them”: Check added: “The tool shows your K.O. II, and each file gets a sample number.”.
  - “Load each file onto its pad”: Check added: “D1 to D5 now play V1 to V5.”.
  - “Vocals already on pads?”: now an info step (no Check).
  - “Read each number, then come back”: Check added: “The display shows each pad’s sample number.”.
  - “Load D1 to D5 by number”: Check added: “D1 to D5 play V1 to V5 in this project.”.
  - “Or copy a sound inside one project”: Check added: “The empty pad now plays the source pad’s sound.”.
  - “D1: open the trim page”: Check added: “The display shows TRI.”.
  - “Trim the start of V1”: Do: “Turn X (start) a little at a time, tapping D1 between turns, until playback begins right before the first sound. Don’t cut into the first word.” (was “Turn X (start) a little at a time, tapping D1 between turns, until playback begins just before the first sound. Don’t cut into the first word.”); Check added: “D1 now starts right on its first sound.”.
  - “Trim the end of V1”: Do: “Stay on trim. Turn Y (length) down until playback ends right after the last word. Press MAIN when it sounds right.” (was “Stay on trim. Turn Y (length) down until playback ends just after the last word. Press MAIN when it sounds right.”); Check added: “D1 stops right after the last word.”.
  - “Trim D2 to D5”: Check added: “Each D pad starts on its first sound and ends cleanly.”; Note: “V2: one word, about half a second. V3: one syllable or breath, about 0.2 seconds. V4: long and smooth. V5: the phrase only.” (was “V2: one word, about half a second. V3: one syllable or breath, about 0.2 seconds. V4: long and smooth. V5: just the phrase.”).
  - “D1: set oneshot”: Check added: “D1 now plays the whole vocal from one tap.”.
  - “D2 to D5: oneshot too”: Check added: “D2 to D5 each play the whole vocal from one tap.”.
  - “A1: load sample 001”: Check added: “A1 plays a factory kick.”.
  - “A2: a clap or snare”: Check added: “A2 plays a clap or snare.”.
  - “A3: a closed hat”: Check added: “A3 plays a short closed hat.”.
  - “A4: an open hat”: Check added: “A4 plays an open hat, quieter than the kick and clap.”.
  - “B1: choose a bass”: Check added: “B1 plays a short, round bass.”.
  - “Turn the bass down”: Check added: “B1 now sounds quieter than the kick.”.
  - “Play the kit”: Check added: “You hear kick, clap, closed hat, open hat and bass.”.
  - “Go to 1.1.1 with group A”: Do: “Press MAIN, tap A and check that playback is stopped. Hold SHIFT and press − until the display shows 1.1.1.” (was “Press MAIN, tap A and make sure playback is stopped. Hold SHIFT and press − until the display shows 1.1.1.”); Check added: “The display shows 1.1.1, the first step of the pattern.”.
  - “A1: a kick on every beat”: Check added: “A1 lights at each of the four positions.”.
  - “A2: claps on 2 and 4”: Check added: “A2 lights at 1.2.1 and 1.4.1.”.
  - “A3: off-beat hats”: Check added: “You hear boom, tss, clap, tss on repeat.”.
  - “A3: two hat accents”: Check added: “A3 lights at 2.2.4 and 4.2.4.”.
  - “A4: open hats instead of closed”: Consequence added: “Removes only those two A3 notes.”.
  - “Play the drum loop”: Check added: “Four bars repeat; open hats end bars 2 and 4.”.
  - “B1: off-beat bass in bar 1”: Check added: “B1 lights at all four positions.”.
  - “B1: a gap at the end of bar 4”: Consequence added: “Removes only the B1 note at 4.4.3.”.
  - “Checkpoint: drums and bass”: Check added: “The bass bounces between kicks, with a gap before the loop restarts.”.
  - “Optional: kick in, bass out”: Check added: “During playback, the bass now ducks at each kick.”.
  - “Optional: shape the duck”: Check added: “The display shows LEN as you turn X, ShP for Y.”.
  - “D1: the hook at 1.1.1”: Check added: “D1 lights at 1.1.1.”.
  - “D2: the answer at 3.2.3”: Check added: “D2 lights at 3.2.3.”.
  - “D3: two tiny chops”: Do: “Write D3 at 2.4.4 and 4.2.4: two tiny chops right before a beat.” (was “Write D3 at 2.4.4 and 4.2.4: two tiny chops just before a beat.”); Check added: “D3 lights at 2.4.4 and 4.2.4.”.
  - “D4: the texture under the hook”: Check added: “Hook and texture start bar 1, over the drums and bass.”.
  - “Balance the mix”: Check added: “Kick and bass lead; the hook is clear.”; Note: “The kick and bass are strongest, the clap a little under the kick and the hats low. D1 should be clear but under the kick, D2 a bit lower, D3 and D4 low.” (was “The kick and bass are strongest, the clap a little under the kick and the hats low. D1 should be easy to understand but under the kick, D2 a bit lower, D3 and D4 low.”).
  - “D: choose reverb”: Check added: “A little space opens around the vocals.”.
  - “Set the reverb”: Check added: “The vocals get a short tail; the bass stays dry.”.
  - “Checkpoint: listen to the drop”: Check added: “Steady kick, bouncing bass and a clear hook.”.
  - “Write down DROP A”: Check added: “While you hold MAIN, the display shows a scene number.”.
  - “D5: the second phrase in DROP B”: Check added: “D5 lights at 2.1.1.”.
  - “Commit, and name the copy PEAK”: Check added: “Holding MAIN shows a new number, not DROP B’s.”.
  - “D3 and D5: more for PEAK”: Check added: “D3 lights at 1.4.4 and 3.4.4, D5 at 4.1.1.”.
  - “Listen to DROP A, DROP B and PEAK”: Check added: “Each scene sounds fuller than the last; DROP A has no V5.”.
  - “Commit, and name the copy GROOVE”: Check added: “Holding MAIN shows a new number, not PEAK’s.”.
  - “GROOVE: clear D3, D4 and D5”: Consequence added: “Clears every note of D3, D4 and D5 in GROOVE.”; Do: “Tap D. Hold ERASE + D3 until TRK blinks, then release. Do the same with D4 and D5.” (was “In GROOVE, tap D. Hold ERASE + D3 until TRK blinks, then release. Do the same with D4 and D5.”).
  - “Commit, and name the copy INTRO”: Check added: “Holding MAIN shows a new number, not GROOVE’s.”.
  - “INTRO: clear the bass and vocals”: Consequence added: “Clears every note of B1, D1 and D2 in INTRO.”; Check: “INTRO is now drums only: no bass, no vocals.” (was “INTRO is now drums only, easy for a DJ to mix in.”).
  - “Listen to INTRO, GROOVE and PEAK”: Check added: “INTRO: drums only. GROOVE: drums, bass, hook, answer. PEAK: everything.”.
  - “Commit, and name the copy BREAK”: Check added: “Holding MAIN shows a new number, not INTRO’s.”.
  - “BREAK: clear the kick and clap”: Consequence added: “Clears every note of A1 and A2 in BREAK.”.
  - “D1 and D4: voice in BREAK”: Check added: “D1 and D4 light at 1.1.1, D4 again at 3.1.1.”.
  - “Commit, and name the copy BUILD”: Check added: “Holding MAIN shows a new number, not BREAK’s.”.
  - “Set the grid to 4”: Check added: “The display shows 4: one step per beat.”.
  - “Practise the kick on every beat”: Check added: “Each tap plays a kick over the hats; nothing records.”.
  - “Set the grid back to 16”: Check added: “The display shows 16 again: 16 steps per bar.”.
  - “A2: a clap roll in bar 4”: Check added: “A roll of four claps ends bar 4.”.
  - “Read the song map”: now an info step (no Check).
  - “Open the song list”: Check added: “The display shows the current song position.”.
  - “Set position 1 to INTRO”: “Needs OS 2.0 or newer”; Check added: “Position 1 now holds INTRO.”.
  - “Add position 2: INTRO”: “Needs OS 2.0 or newer”; Check added: “Position 2 now holds INTRO too.”.
  - “Positions 3 to 12”: Check added: “Twelve positions so far, matching the song map.”.
  - “Positions 13 to 24”: Check added: “24 positions so far, matching the song map.”.
  - “Positions 25 to 32”: Check added: “32 positions in all; the last four hold INTRO.”.
  - “Check all 32 positions”: “Needs OS 2.0 or newer”; Check added: “All 32 positions match the song map.”.
  - “Checkpoint: play the song”: “Needs OS 2.0 or newer”; Check added: “The sections play in order and stop after about 4:00.”.
  - “Dance test”: “Needs OS 2.0 or newer”; Check: “You want to move in DROP A, DROP B and PEAK.” (was “You should want to move in DROP A, DROP B and PEAK.”).
  - “Low-end test”: Check: “The kick and bass are still clear.” (was “The kick and bass should still be clear.”).
  - “Voice test”: Do: “Voice test: the D1 hook should be clear and stick in your head.” (was “Voice test: the D1 hook should be easy to remember and understand.”); Check added: “You understand every word of the D1 hook.”.
  - “Contrast test”: Check added: “BREAK is clearly emptier; PEAK is the biggest moment.”.
  - “Record one full pass”: “Needs OS 2.5 or newer”; Check added: “You have a recording of the full 4-minute track.”.
  - “Back up, and check the rights”: Check added: “A new backup file appears in your browser’s downloads.”.

**Outside the steps:**
- Checkpoints: Chapter 1, Part 3: "kick and snare stand out clearly" (was "are easy to pick out"); Chapter 7: "with a short gap right before the loop starts again" (was "just before"); "the hook is clear" (was "is easy to understand").
- Glossary: Audition "Tapping a pad only to hear it." (was "just to hear it"); Drop / build "the rising part right before it" (was "just before it"); Pickup "A note right before a main beat" (was "just before").
- Safety, erase a scene: "Only ever do this on a scene whose number you checked a moment ago" (was "you have just checked").
- Settings tables (Chapter 0 and the cheat sheet): "Brighter is clearer in daylight." (was "easier to see in daylight"); "which helps you count bars." (was "which makes counting bars easier.").

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
