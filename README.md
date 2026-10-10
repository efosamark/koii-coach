# K.O. II Coach

Independent, beginner-friendly learning companion for the teenage engineering EP-133 K.O. II.

## Make a beat first

Chapter zero has 19 guided steps: 90 BPM, one bar in 4/4, A1 kick, A2 snare, A3 closed hat, optional B1 bass, mix adjustments and a two-section performance. Each step explains what to do, why, what to expect and what to check. A separate 16-note placement helper shows exact bar.beat.subdivision positions. Sound numbers 001/100/200/400 are starting candidates in factory categories, not guaranteed named samples in a changed library.

## Other features

14 manual topics, 22 control explanations with contextual highlights, an editable rhythm lab, 10 searchable help topics, glossary, manual firmware reminder and browser-local progress. Practice audio is synthesised, not factory audio. No dependencies, accounts, analytics, API keys or hardware connection.

## Run

Keep index.html, course.js and the other files together. Open index.html, or serve the folder over HTTPS/localhost for service-worker offline caching. Installation support varies by browser; the manifest supplies an SVG icon. External documentation always needs internet.

## GitHub Pages

In Settings > Pages choose Deploy from a branch, main and / (root), then Save. A successful deployment is required before the app is live; committing files does not enable Pages by itself.

## Accuracy and safety

Teaching text follows https://teenage.engineering/guides/ep-133 (checked 10 October 2026). Rhythm/mix choices are creative exercises. Use a disposable, already-selected project. Firmware-dependent features are labelled; project/scene numeric shortcuts vary, so the recipe avoids assuming a universal project selector. COMMIT creates a scene variation, not an external backup. ERASE + SOUND permanently deletes a sample. Holding SHIFT + SOUND on trim permanently crops its file on current firmware. Follow current official instructions if behaviour differs.

## Validation and limitations

Frontend and service-worker JavaScript passed Node.js syntax checks. Course data was checked separately. Real-browser layout, audio, offline caching and physical-device acceptance tests remain outstanding. Lab playback uses browser timers and is approximate. Clearing browser storage can erase progress; it never changes hardware music. The control map is conceptual, not an exact physical replica.

Not affiliated with teenage engineering. No official device artwork or factory audio is redistributed.
