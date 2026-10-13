'use strict';
/* The course registry: every chapter in guided order and every tool, in one place, for every page.
   shell.js builds the app bar, the menu sheet and the desktop rail from it, so the chapter list is no longer
   copied into each page by hand. Plain script (no modules): it defines window.COACH_SITE. Load it before shell.js.
   Chapter numbers stay as today (00, 01, 02, 07-11) until the course is renumbered.

   Chapter fields:
     num      the number shown everywhere ("07")
     title    the chapter's name in menus and the app bar (the same as its <title>)
     short    a short label for tight spaces
     href     the link from any page
     view     the hash view of index.html that holds it (01, 02 and the tools live there)
     slug     the chapter page's <body data-chapter>; its ticks are saved as {v:1,done:[ids],...}
              under 'koii-coach-ch-<slug>' (chapter.js owns that key; the shell only reads it)
     legacy   an older checklist key (a plain array of positions) that chapter.js migrates on the first visit
     steps    how many steps it has, for the "x/N" counts in the menu. shell.js warns in the console
              ("shell.js: ...") when the page in front of it has a different number: update it here when
              steps are added or removed
     minutes  [shortest, longest] time to work through it */
window.COACH_SITE={
  name:'K.O. II Coach',
  repo:'https://github.com/efosamark/koii-coach',
  report:'https://github.com/efosamark/koii-coach/issues/new?template=wrong-instruction.yml',
  chapters:[
    {num:'00',title:'Start here',short:'Start here',href:'./setup.html',slug:'setup',steps:36,minutes:[45,60]},
    {num:'01',title:'First beat',short:'First beat',href:'./index.html#first',view:'first',steps:22,minutes:[30,50]},
    {num:'02',title:'Make it a song',short:'Song',href:'./index.html#song',view:'song',steps:24,minutes:[60,90]},
    {num:'07',title:'Sample, chop & resample',short:'Sample',href:'./sampling.html',slug:'sampling',steps:57,minutes:[120,180]},
    {num:'08',title:'Play & perform',short:'Perform',href:'./perform.html',slug:'perform',steps:64,minutes:[120,180]},
    {num:'09',title:'Full hip-hop beat',short:'Hip-hop',href:'./hiphop.html',slug:'hiphop',legacy:'koii-hiphop-vocal-checklist-v2',steps:61,minutes:[120,180]},
    {num:'10',title:'Tech House',short:'Tech house',href:'./tech-house.html',slug:'tech-house',legacy:'koii-tech-house-checklist-v1',steps:61,minutes:[120,180]},
    {num:'11',title:'House with your own vocal samples',short:'Vocal house',href:'./thodorakis-house.html',slug:'vocal-house',legacy:'koii-thodorakis-club-checklist-v1',steps:79,minutes:[120,180]}
  ],
  // Tools are never numbered. icon is a symbol in icons.svg (without the "i-" prefix).
  tools:[
    {title:'Learn',href:'./index.html#manual',view:'manual',icon:'book'},
    {title:'Controls',href:'./index.html#controls',view:'controls',icon:'knob'},
    {title:'Rhythm lab',href:'./index.html#lab',view:'lab',icon:'grid'},
    {title:'Help & reference',short:'Help',href:'./index.html#help',view:'help',icon:'help'},
    {title:'Settings',href:'./index.html#settings',view:'settings',icon:'settings'}
  ]
};
