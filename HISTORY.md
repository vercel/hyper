
0.4.5 / 2016-07-14
==================

  * performance improvements for url matching [@rauchg]
  * improve repaint performance for writes to the term [@rauchg]
  * fix issue with perf degradation related to title polling [@rauchg]
  * fix resizing when only one axis changed [@rauchg]

0.4.4 / 2016-07-14
==================

  * plugins: more graceful npm error

0.4.3 / 2016-07-14
==================

  * terms: improve write performance
  * remove unused import

0.4.2 / 2016-07-13
==================

  * fix close icon by copying static assets to build [@rauchg]

0.4.1 / 2016-07-13
==================

  * noop bump to test updates

0.4.0 / 2016-07-13
==================

  * implement extensible redux actions system [@rauchg]
  * add support for config (~/.hyperterm.js) [@rauchg, @nfcampos]
  * add support for plugins (~/.hyperterm_modules) [@rauchg]
  * improve menubar look [@leo, @rauchg]
  * beautiful default colors [@hharnisc, @dzannotti]
  * add close icon for tabs [@johanbrook]
  * add support for font size shortcuts [@jhaynie, @nfcampos]
  * add support for maximizing upon double click [@jhaynie]
  * add fallback fonts for linux and windows [@olliv]
  * improve menu items [@rauchg, @sindresorhus]
  * add proper auto updates system [@matiastucci, @rauchg]

0.3.1 / 2016-07-04
==================

  * implement most recent hterm with lots of bugfixes [@dbkaplun, @rauchg]

0.3.0 / 2016-07-04
==================

  * revamp the menu to be a lot more standard (#38) [@rauchg]
  * move menu into its own file and refactor [@rauchg]
  * add static icon, move icons to static folder [@rauchg]
  * add cross-platform font family settings (#26) [@OlliV, @rauchg]
  * remove `xterm.css` (no longer used, smaller build!) [@rauchg]
  * change font size with command shortcuts (#34) [@jhaynie]
  * implement a more reasonable update interval check frequency (#33) [@rauchg]
  * add standard behavior when you double click window (#32) [@jhaynie]

0.2.1 / 2016-07-03
==================

  * improvements to update checker

0.2.0 / 2016-07-03
==================

  * Implement hterm (#28) [@rauchg]
  * Fix "Download" link being clickable when hidden (#7) [@rauchg]
  * Jump to begining of end at edges of tabs when moving sideways (#22) [@rauchg]
  * Make clear where to run `npm start` (#19) [@montogeek]
  * Add fullscreen menu item (#1) [@rauchg, @montogeek]
  * Improve README and scripts (#15) [@leo]
  * Add support for cmd+shift+[|] [@rauchg]
  * Add dev build instructions to README (#3) [@rauchg]
  * Make `ctrl+c` close <webview> instead of `cmd+w` (#2) [@rauchg]
  * Improve `zip` builds to not include nested directory [@rauchg]

0.1.0 / 2016-07-01
==================

  * initial release
