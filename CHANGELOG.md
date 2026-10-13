# Changelog

What changed in each release of K.O. II Coach. Versions are dates (`YYYY.MM.DD`). The same value is used for `VERSION` in `sw.js` and `courseInfo.version` in `course.js`.

Each release records the date its instructions were checked against the [official EP-133 guide](https://teenage.engineering/guides/ep-133), and which firmware version the guide described then. If your device runs a newer OS and something differs, follow the official guide and [report the step](https://github.com/leonardovitolowork-hash/koii-coach/issues/new?template=wrong-instruction.yml).

## 2026.10.13

**Checked against:** the official EP-133 guide on 13 October 2026 (guide marked "ver 2.5"; newest release on its What's new page: OS 2.5).

### Course content

- Hardware steps in chapters 02, 07, 08 and 09 were corrected against the official guide, including scenes and COMMIT, selecting a group, trimming samples, and erasing a pad's notes.
- Chapter numbering is now the same everywhere: 01 First beat, 02 Make it a song, 03 Learn, 04 Controls, 05 Rhythm lab, 06 Help & reference, 07 Full hip-hop beat, 08 Tech House, 09 House with your own vocal samples.
- Chapter 09 now works with your own vocal samples instead of the author's.
- Steps that depend on firmware show the OS version they need.

### App

- Help search shows the troubleshooting topics again.
- On a phone, Next and Back now show the top of the new step.
- Your place in "Make it a song" and in chapters 07 to 09 is saved. Progress from earlier versions carries over.
- Progress can be exported and imported. Resetting progress asks you to confirm first.
- The firmware picker in Help now has a visible effect.
- All nine sections are visible in the menu.
- Practice sounds handle the iPhone silent switch, and the app no longer claims to be playing when nothing can be heard.
- Better contrast, a dark mode, and larger small text.
- Every page has a footer with the non-affiliation notice, a "Report a wrong instruction" link, and links to the previous and next chapters.

### Offline and install

- Home-screen icons for iPhone (180 px apple-touch-icon) and Android (192 px and 512 px, plus a 512 px maskable icon). The manifest now has an `id`, a description and the PNG icons.
- The service worker precaches every page, the shared chapter files, the manifest and all icons. A weak connection now falls back to the saved copy after 3 seconds instead of waiting. Offline links with a query string (such as `hiphop.html?utm_source=x`) open the saved page.
- The cache name now carries the release version (`koii-coach-2026.10.13`).

### Repository and deployment

- One **Test and deploy** workflow replaces the old smoke-test workflow. The site goes live only after its tests pass, and only the app files are published. Pull requests are tested too. The owner needs to set **Settings > Pages > Source** to **GitHub Actions**; see the README.
- Removed six one-off repair and publish workflows that could still push to `main` and publish an incomplete site: `icon-source-fix`, `phone-icon`, `repair`, `tech-house`, `tech-house-repair` and `vocal-update`.
- Test results are no longer committed to the repository. They are attached to each workflow run instead, and the three old `.github/*-results.json` files were removed.
- Every action is pinned to a full commit SHA, with Dependabot updates. Playwright is pinned to an exact version.
- Added a "Wrong instruction" issue form, this changelog and a rewritten README with the trademark and license status.
- Removed `icons/logo-source.webp.b64`. It was a corrupt, unused image that was also served publicly.

## Before 2026.10.13

These releases had no version numbers and no recorded guide-check date. Summary from the git history:

- **12 October 2026:** added chapter 08 (Tech House) and chapter 09 (house track built on vocal samples).
- **11 October 2026:** added "Make it a song" and the full hip-hop chapter, which went through several revisions (including artist-vocal sampling). The live site briefly showed placeholder text instead of the app, and was restored. A home-screen icon was attempted but never shipped.
- **10 October 2026:** first version: the first-beat course, lessons, controls map, rhythm lab, help, offline support and a browser smoke test.
