# K.O. II Coach

An unofficial, beginner-friendly course for the teenage engineering EP-133 K.O. II. It is made to sit on your phone next to the device: each step says what to press, what you should see or hear, and what to check before you move on.

**Open the app:** https://leonardovitolowork-hash.github.io/koii-coach/

[![Test and deploy](https://github.com/leonardovitolowork-hash/koii-coach/actions/workflows/deploy.yml/badge.svg)](https://github.com/leonardovitolowork-hash/koii-coach/actions/workflows/deploy.yml)

> Unofficial. Not affiliated with or endorsed by teenage engineering. EP-133 and K.O. II are trademarks of teenage engineering.

## What's inside

| | Section | What you do there |
|---|---|---|
| 01 | First beat | Build a short drum beat one step at a time, with a helper that shows where each note goes. |
| 02 | Make it a song | Add more parts, make variations with scenes, and arrange them into a song. |
| 03 | Learn | Short lessons on the main functions, to read any time. |
| 04 | Controls | Tap a control on the map to see what it does. |
| 05 | Rhythm lab | Try out drum patterns on a grid in the browser. |
| 06 | Help & reference | Search the troubleshooting answers, look up words in the glossary, set your firmware version, and back up your progress. |
| 07 | Full hip-hop beat | A longer chapter that builds a complete old-school hip-hop track, including sampling. |
| 08 | Tech House | A longer chapter that builds a tech house track. |
| 09 | House with your own vocal samples | A house track built around five short vocal samples. The chapter was first written around the author's own samples, so you will need to record or load five of your own. |

**Suggested order:** 01, 02, 07, 08, 09. Sections 03 to 06 are reference pages you can open whenever you need them.

**Before you start:** practise in a project you don't mind changing. Some steps can erase or overwrite things on the device, and the app warns you at those steps. If the device ever behaves differently from the app, follow the [official guide](https://teenage.engineering/guides/ep-133) and [report the step](#report-a-wrong-instruction).

Other things to know:

- The practice sounds in the app are made by your browser. They are not the device's factory sounds.
- The control map is a diagram to help you find things, not an exact picture of the device.
- Rhythm and mix choices in the lessons are suggestions. Change them to taste.
- There is no hardware connection, account, analytics or tracking. Nothing is sent anywhere.

## Progress and privacy

Your progress is saved only in this browser on this device (browser storage keys starting with `koii-coach`). Clearing your browser data erases it. It never changes anything on your EP-133. To move progress to another browser or keep a copy, use the backup option in **06 Help & reference**.

## Offline and home screen

After the first visit, every page of the coach works without internet. The service worker (`sw.js`) asks the network first so you get the latest lessons. If the network is offline, or has not answered within 3 seconds, the saved copy opens instead. Links to the official guide and other websites still need internet.

You can add the coach to your phone's home screen from the browser's share or menu button. It has proper icons for iPhone and Android.

## Report a wrong instruction

If a step doesn't match what your EP-133 does, please [open a "Wrong instruction" report](https://github.com/leonardovitolowork-hash/koii-coach/issues/new?template=wrong-instruction.yml). Every page has the same link in its footer. The form asks for the page, the step, what the app says, what the device did, and your firmware version. You need a free GitHub account to send it. Reports from people with the device in front of them are the best way to keep the course correct.

## Accuracy

The instructions follow the [official EP-133 guide](https://teenage.engineering/guides/ep-133). They were last checked against it on **13 October 2026**, when the guide was marked "ver 2.5" and OS 2.5 was the newest release on its [What's new](https://teenage.engineering/guides/ep-133/whats-new) page. The app's Help page shows the same date (from `courseInfo` in `course.js`), and [CHANGELOG.md](CHANGELOG.md) records it for each release. Steps that depend on the firmware version are labelled in the app.

The instructions are checked against the guide, but not every step has been tried on a real device. If you find a difference, the official guide is right, and a report helps everyone.

## Testing

Every push and pull request runs the **Test and deploy** workflow (`.github/workflows/deploy.yml`):

1. `.github/scripts/build_site.py` copies only the app files into `_site/` and checks them. It fails if a file is missing or looks like placeholder text. It also fails if a page links to a file that isn't there, if `sw.js` precaches a missing file (one missing file stops offline install), or if a page isn't precached.
2. `node --check` checks the syntax of every script.
3. `tests/smoke.mjs` opens the `_site/` copy in Chromium on a local server and clicks through the app at desktop and 390 px phone width. See that file for the exact checks.

**Not tested automatically:** real EP-133 hardware, how the sounds sound, Safari on iPhone, and offline use on a real phone.

To run the same checks on your computer (Python 3 and Node.js 22):

```sh
python3 .github/scripts/build_site.py _site
npm install --no-save --no-package-lock playwright@1.64.0
npx playwright install chromium
python3 -m http.server 8080 --bind 127.0.0.1 --directory _site &
LOCAL_URL=http://127.0.0.1:8080/ node tests/smoke.mjs
```

Screenshots, traces and `artifacts/results.json` are written to `artifacts/`. In GitHub Actions they are attached to each run as the `coach-browser-evidence` artifact, and a short result appears in the run summary. Results are no longer committed to the repository.

## Deploying (for the repository owner)

A push to `main` goes live only after the tests pass:

1. **test** builds `_site/` and runs all the checks above.
2. **deploy** (`needs: test`) publishes exactly that tested `_site/` folder with `actions/upload-pages-artifact` and `actions/deploy-pages`. README, tests and `.github/` are not published.
3. **verify-live** then checks that the live site serves the same files. It runs after the deploy and only reports. A red result here means "look at the live site". It never blocks a fix from going out.

Pull requests run only the **test** job. If a test fails, nothing is deployed and the live site keeps the last good version.

**One-time settings (required):**

1. **Settings > Pages > Build and deployment > Source: GitHub Actions.** Until you change this, GitHub keeps publishing the whole `main` branch directly, with no test step.
2. **Protect `main`:** in Settings > Rules > Rulesets (or Settings > Branches), add a rule for `main` that requires the **test** status check to pass. No workflow pushes to `main` any more, so this won't block automation.
3. Optional: create a `wrong-instruction` label so reports from the form are tagged automatically. You can also set the repository's website to the app URL.

**Releasing a content change:** change `VERSION` in `sw.js` and `courseInfo` in `course.js` to today's date, and add an entry to `CHANGELOG.md`. Note the guide date and firmware version you checked against.

**Keeping tools up to date:** every action in the workflow is pinned to a full commit SHA, with the version in a comment. Dependabot (`.github/dependabot.yml`) opens a monthly pull request to update them. The Playwright version is pinned in `deploy.yml` (`PLAYWRIGHT_VERSION`); update it by hand.

## Files

| File | What it is |
|---|---|
| `index.html` | The app: sections 01 to 06, navigation, progress and backup. |
| `course.js` | Lesson data: steps, help topics, glossary, song map and `courseInfo` (version and check date). |
| `hiphop.html`, `tech-house.html`, `thodorakis-house.html` | Chapters 07, 08 and 09. |
| `chapter.css`, `chapter.js` | Shared styles and checklist code for chapters 07 to 09. |
| `sw.js` | Offline support (service worker). |
| `manifest.webmanifest`, `icon.svg`, `icons/` | Home-screen app name and icons. |
| `tests/smoke.mjs` | Browser smoke test. |
| `.github/` | Test-and-deploy workflow, site build and live-check scripts, issue form, Dependabot settings. |
| `CHANGELOG.md` | What changed in each release, and which guide version it was checked against. |

## License

No license has been chosen yet. Until the author adds one, normal copyright applies: you can use the app and read the code here, but copying or republishing the code or lesson text needs the author's permission. Reports and suggestions through issues are welcome.

## Trademarks

This is an independent learning project. It is not affiliated with or endorsed by teenage engineering. EP-133 and K.O. II are trademarks of teenage engineering. No official device artwork, product photos or factory audio are included. The app icon is an original pad design.
