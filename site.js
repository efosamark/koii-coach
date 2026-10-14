'use strict';
/* The course registry: every chapter in guided order and every tool, in one place, for every page.
   shell.js builds the app bar, the menu sheet and the desktop rail from it, Home and Settings read it, and progress.js
   counts progress with it, so the chapter list is not copied into each page by hand. Plain script (no modules): it
   defines window.COACH_SITE. Load it first: site.js, progress.js, shell.js.
   The course is numbered 0-7 in teaching order (renumbered in release 2026.10.14.4; files, slugs and ids did not change).

   version       the release, the same value as VERSION in sw.js and the newest CHANGELOG.md heading (the build checks)
   guideChecked  the date the instructions were last checked against the official guide; firmware: the OS they are for

   Chapter fields:
     num      the number shown everywhere ("3")
     formerly the number it had before the renumber ("07"): a "Formerly 07" chip on its start screen, and search finds the
              chapter by it. Keep until at least mid-January 2027 (plan 8.6)
     title    the chapter's name in menus, the app bar, its <h1> and <title>
     oldTitle its name before the renumber, which search still finds
     short    a short label for tight spaces
     href     the chapter's page
     slug     the page's <body data-chapter>; its ticks are saved as {v:1,done:[ids],...} under 'koii-coach-ch-<slug>'
              (chapter.js owns that key; for 01 and 02 progress.js derives it from the old app's koii-coach-v2)
     legacy   an older checklist key (a plain array of positions) that chapter.js migrates on the first visit
     steps    how many steps it has, for the "x/N" counts. shell.js warns in the console ("shell.js: ...") when the
              page in front of it has a different number: update it here when steps are added or removed
     minutes  [shortest, longest] time to work through it
     made     what the learner has at the end, as the page's "You will make" line says it (Home's course-complete card)
              Keep it in step with that line. */
window.COACH_SITE={
  name:'K.O. II Coach',
  version:'2026.10.14.24',guideChecked:'2026-10-13',firmware:'OS 2.5.1',
  repo:'https://github.com/efosamark/koii-coach',
  report:'https://github.com/efosamark/koii-coach/issues/new?template=wrong-instruction.yml',
  chapters:[
    {num:'0',title:'Set up your K.O. II',short:'Set up',oldTitle:'Start here',href:'./setup.html',slug:'setup',steps:54,minutes:[45,60],made:'a K.O. II on OS 2.5.1, backed up on your computer, with an empty project chosen for the course and the factory sounds explored'},
    {num:'1',title:'First beat',short:'First beat',href:'./first-beat.html',slug:'first-beat',steps:40,minutes:[30,50],made:'a one-bar drum and bass loop at 90 BPM, kept as two scenes, DRUMS and BEAT, and a tiny performance with them'},
    {num:'2',title:'Make it a song',short:'Song',href:'./song.html',slug:'song',steps:33,minutes:[60,90],made:'a 16-bar song, about 43 seconds at 90 BPM, from four scenes in a 10-position song list'},
    {num:'3',formerly:'07',title:'Sample, chop & resample',short:'Sample',href:'./sampling.html',slug:'sampling',steps:89,minutes:[120,180],made:'a drum kit from your own voice, a reversed snare, a recording chopped into slices and your whole beat bounced onto one pad, in project 7'},
    {num:'4',formerly:'08',title:'Play & perform',short:'Perform',href:'./perform.html',slug:'perform',steps:112,minutes:[120,180],made:'a live performance of your own beat: played with feel, with a bassline in a scale, rolled hats, effects and live scene changes, and a recording of it'},
    {num:'5',formerly:'09',title:'Full hip-hop beat',short:'Hip-hop',href:'./hiphop.html',slug:'hiphop',legacy:'koii-hiphop-vocal-checklist-v2',steps:110,minutes:[120,180],made:'a 64-bar old-school hip-hop beat with a sung phrase you sampled, six scenes and a six-position song list, in project 8'},
    {num:'6',formerly:'10',title:'Tech house',short:'Tech house',href:'./tech-house.html',slug:'tech-house',legacy:'koii-tech-house-checklist-v1',steps:109,minutes:[120,180],made:'a tech-house track at 128 BPM, about 3:30 long, with two drops, a breakdown and a build: 28 song positions, 112 bars'},
    {num:'7',formerly:'11',title:'Vocal house',oldTitle:'House with your own vocal samples',short:'Vocal house',href:'./thodorakis-house.html',slug:'vocal-house',legacy:'koii-thodorakis-club-checklist-v1',steps:107,minutes:[120,180],made:'a 4-minute house track at 128 BPM built around five vocal samples of your own: 32 song positions, 128 bars'}
  ],
  // Tools are never numbered. icon is a symbol in icons.svg (without the "i-" prefix).
  tools:[
    {title:'Learn',href:'./learn.html',icon:'book'},
    {title:'Control map',href:'./controls.html',icon:'knob'},
    {title:'Rhythm lab',href:'./lab.html',icon:'grid'},
    {title:'Troubleshooting',href:'./help.html',icon:'help'},
    {title:'Glossary',href:'./glossary.html',icon:'info'},
    {title:'Cheat sheet',href:'./cheat-sheet.html',icon:'list'},
    {title:'Safety and erasing',short:'Safety',href:'./safety.html',icon:'warning'},
    {title:'Settings',href:'./settings.html',icon:'settings'}
  ]
};
