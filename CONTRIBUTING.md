# Changing the course

How to add, change or split a step in K.O. II Coach, and release it. The chapters are plain HTML pages; there is no build step beyond the check in `.github/scripts/build_site.py`. Read the README's **Testing** and **Deploying** sections too.

## 1. Before you change an instruction

- **The official guide is the source.** Re-read the matching page of the [official EP-133 guide](https://teenage.engineering/guides/ep-133) and, for anything it does not cover, the [What's new](https://teenage.engineering/guides/ep-133/whats-new) and [downloads](https://teenage.engineering/downloads/ep-133) pages. Where the guide is silent, say so in the step ("check your display") instead of guessing.
- **Never change a button sequence without trying it on the unit** (see section 8). A rewording that keeps every key, pad and display value in the same order is a text change; anything else is an instruction change.
- **Keep every link and every saved tick working.** A step's `data-step` id is part of its address (`sampling.html#s-record-kick`) and of every learner's saved progress. Never rename or reuse an id. Never change the shape of an existing `koii-coach…` storage key: add fields, never remove or repurpose one.

## 2. Step markup

Each chapter page has `section.steps`, one `<details>` per part (its `summary` holds `h2.part-title` "Part 2 · Build a drum kit"), and one `ol` of steps per part. A step, in this order:

```html
<li data-step="record-kick" data-risk="erase">
  <h3 class="step-title">A1: record a kick</h3>
  <p class="preflight">Before the press: what must be true, or what not to press.</p>
  <p class="step-do">The moves, at most three sentences.</p>
  <p class="step-undo">Wrong pad? Press <kbd class="chord"><kbd class="key">SHIFT</kbd> + <kbd class="key">B</kbd></kbd> at once, while the umbrella is lit.</p>
  <p class="step-check"><span class="sr">Check: </span>What you hear or see.</p>
  <p class="step-note">A short visible note ("Stop.", a tip).</p>
  <div class="step-extras"><details class="step-more"><summary>Why</summary><p>…</p></details><details class="step-more"><summary>Not working?</summary><p>…</p></details></div>
  <p class="step-source">Official guide: <a href="https://teenage.engineering/guides/ep-133/sampling">Sampling</a></p>
</li>
```

Only `h3.step-title` and one `p.step-do` are required. Use `p.step-noundo` instead of `p.step-undo` when there is no undo.

**Inline markup**

| Thing | Markup |
|---|---|
| A button | `<kbd class="key">SOUND</kbd>` |
| A pad | `<kbd class="key pad">pad 3</kbd>`, or with its group `<kbd class="key pad">B1</kbd>` (group B, then pad 1) |
| Knob X or Y | `<kbd class="key knob">X</kbd>` |
| Two keys together | `<kbd class="chord"><kbd class="key">SHIFT</kbd> + <kbd class="key">B</kbd></kbd>` |
| What the display shows | `<samp class="lcd">1.2.3</samp>` |
| Another chapter | "Chapter 3 · Sample, chop & resample", and its parts as "Part 4". Never an old two-digit number ("07", "section 03"): the build check fails on it |
| A step on the same or another page | `<a href="./song.html#s-song-plan">…</a>`. The build check fails if the step does not exist |

Step numbers ("go back to step 3") change whenever a step before them is split. Prefer a link to the step, or its title, over a number.

**Step attributes**

| Attribute | Use |
|---|---|
| `data-risk="erase"` | The step clears notes that undo can bring back. An amber "Clears notes" tag; no gate. |
| `data-risk="delete"` or `"overwrite"` | Nothing can bring it back. A red tag, and the step stays folded until "Yes, I have checked". Add or update its entry on `safety.html`. |
| `data-optional` | The main path works without it. A run of optional steps in one part can be skipped together. Do not mark a step optional because it only applies to some learners (a reused project, an audio file): say the condition in its title instead. |
| `data-setting="411"` | The step sets a system setting; shows a "System setting 411" tag. |
| `data-os="2.0"` | Needs that OS or newer; the badge follows the OS chosen in Settings. Add `<p class="badge os-badge">Needs OS 2.0 or newer</p>` under the title as the fallback text. |
| `data-kind="recap"` | The chapter's recap; ticked by itself on the chapter-complete screen. Its `ul.step-moves` lists the moves learned. |
| `data-note="DRUMS"` | The step asks you to write a scene number down; it gets an optional field, kept per project. Several names: `"V1\|V2\|V3"`. Add `data-note-kind="sample"` for sample numbers. |
| `data-place="A1 1.1.1 1.2.3"` | Chapter 1 only: the placement helper's positions. |

## 3. The glance budget

Every step must be readable at arm's length, with the phone propped beside the K.O. II. `tests/test_player.py::test_glance_budget` checks every chapter:

- title at most **48 characters**;
- **Do** at most **26 words** in at most **3 sentences**; a risk step may use **40 words** for Before you press and Do together;
- **Check** at most **15 words**; **undo** at most **12**.

Words are counted as a reader would: punctuation alone is not a word, and a chord such as SHIFT + B counts as two words, not three. Notes, Why and Not working? are not counted, but keep them short: a note is still on screen.

When a step is over budget:

1. Move reasons to **Why** and fixes to **Not working?** ("If it doesn't: …" becomes the start of Not working?).
2. Make the Check say only what you hear or see, without "You should hear".
3. Split the step (section 5). Each part gets a title that says what it does ("A1: load the kick", "Copy GROOVE as OUTRO").

## 4. Risky presses

A press that clears, deletes or overwrites gets, in this order: **Before you press** (what must be true first: the right scene, a backup, playback stopped), the **Do** line with the press, then the **undo** straight after. The step test checks that order in every chapter.

When a step copies a scene and then clears something in it, make the copy its own step without `data-risk`, so the tag sits only on the step that clears.

Keys in **Before you press** are not lit on the control map (the Tools sheet, the keys panel), because a warning often names keys not to press. Put every key to press in the Do lines.

## 5. Adding, splitting and retiring steps

**Adding a step:** give it a new, unique id (lower case with hyphens) and update `steps` for its chapter in `site.js` (shell.js warns in the console when the count is wrong). For Chapters 1 and 2, also add the id at its place in `ORDER` in `progress.js` (chapter.js warns when `ORDER` differs from the page). Search, the menu and the player find the step by themselves.

**Splitting a step:** the first part keeps the old id; the other parts get new ids. Then add a migration batch, so a learner who had ticked the old step has every part ticked:

```js
// progress.js
const MIGRATIONS={
  sampling:[{v:1,split:{…}},   // shipped earlier: never edit it
            // 2026.11.02: record-kick split in two
            {v:2,split:{'record-kick':['record-kick','record-kick-listen']}}],
  …
};
```

Give the batch the next `v` for that chapter (batches are applied in `v` order, once per learner) and never edit a batch that has shipped. Then update `steps` in `site.js` (and `ORDER` for Chapters 1 and 2) and look for text that pointed at the old step by number. Tests that name step ids or count steps (`tests/test_player.py`, `test_progress.py`, `test_smoke.py`) may need the new id.

**Retiring a step:** remove it from the page and from `steps` in `site.js`. Leave its id out of use for good: old ticks of it stay in storage (so rolling back still works) but no longer count.

Never delete a legacy list (`LEGACY` in chapter.js, `SPA` and `V2_FIRST` in progress.js): they translate progress saved by older versions.

## 6. Releasing

1. Set the same new version in `VERSION` (`sw.js`), `version` (`site.js`) and a new `## version` heading at the top of `CHANGELOG.md`: today's date, with `.2`, `.3` for more releases that day. The build check fails if they differ.
2. In the changelog entry, give the guide date you checked against and the OS it described, say what a learner will notice, and list **every changed wording**, old and new, so a reviewer can check it against the guide.
3. A new page, script, stylesheet or font must go into `ASSETS` in `sw.js`, or offline install breaks and the build check fails.

## 7. Checking your change

```sh
python .github/scripts/build_site.py _site
python -m pytest
```

(See the README for setting up pytest and Playwright.) The build check covers broken links, missing files, step links, old chapter numbers and the version; the tests cover the step order, the budget, and the player, progress and tools in a real browser.

## 8. Trying it on the K.O. II

Automatic checks cannot press a pad. Before a release that changes an instruction:

1. Back up with the [EP sample tool](https://teenage.engineering/apps/ep-sample-tool) and work in an empty or practice project.
2. Walk every changed step on the unit, from the step before it, with the page open as a learner would use it. Do every risky step twice: once as written, once with its undo.
3. Check the display values (`samp.lcd`) against your display. Where they differ, the guide and the unit win: fix the step.
4. Note the OS version you walked it on in the changelog entry.

Learners report problems with the **Report a wrong instruction** form (`.github/ISSUE_TEMPLATE/wrong-instruction.yml`); each step's "This step doesn't match my K.O. II" link fills in the chapter and step for them.
