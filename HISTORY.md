
0.7.0 / 2016-07-25
==================

  * use `uuid` instead of `uid2` for session ids [@albinekb]
  * fix support for `mapTermsDispatch` [@albinekb]
  * implement `extend-info` for the custom `plist` [@lordgiotto]
  * index: prevent double sesson exit (#380) [@timneutkens]
  * add decorateEnv to the extensions API (#370) [@ekmartin]
  * reorganize dir structure and implement `electron-builder` [@rauchg]
  * move to the last term with cmd+9 (#261) [@ekmartin]
  * make sure scrollbar shim doesn't capture clicks [@rauchg]
  * support default width/height of browser window (#257) [@tamagokun]
  * add ctrl+tab/ctrl+shift+tab for tab switching (#367) [@NickChristensen]
  * add `TERM_PROGRAM` and `TERM_PROGRAM_VERSION` env vars (#350) [@tootallnate]
  * bump `electron-prebuilt` (#359) [@freebroccolo]
  * add middle click to close tab functionality (#286) [@itswil]
  * adds plugin hook for decorating the electron browser options (#310) [@danprince]
  * add support for multiple cursor shapes (#352) [@rpunkfu]
  * add LANG env variable (#354) [@TooTallNate]
  * improved linux support (#341) [@c0b41]
  * auto-updater: stop notifying and being annoying [@rauchg]
  * fix quit problem (#343) [@c0b41, @timneutkens]
  * allow the `color` config to be an object (#193) [@mike-engel]
  * remove $ from terminal commands in README (#130) [@Tyriar]
  * configurable cursor opacity (#76) [@hharnisc]
  * implement post push and post install hooks (#328) [@freebroccolo]
  * update rounded header radius (#333) [@blakeembrey]
  * disable linux autoupdate (#338) [@c0b41]
  * specify bash to run command in for editor opening (#314) [@kyleholzinger]
  * update dependencies (#319) [@freeboccolo]
  * add .editorconfig file (#320) [@freebroccolo]
  * fix linter issues (#321) [@freebroccolo]
  * add window zoom menu item (#325) [@marcbachmann]
  * disable pinch zoom functionality (#326) [@marcbachmann]
  * fix prop update logic for fontSmoothing (#302) [@mike-engel]
  * allow opening of files in webview (#305) [@cuth]
  * modified Info.plist generation to enable folder drop onto dock icon (#307) [@lordgiotto]
  * fix installing plugins that use `node-gyp` (#291) [@dfrankland]
  * dynamically change the `font-smoothing` pref (#205) [@mike-engel]
  * add cursor actions (#217) [@marcbachmann]
  * override the buggy hexToRGB implementation in hterm. (#272) [@mauro-oto]
  * add reducer to set cwd (#271) [@hharnisc]
  * add homebrew cask install method (#273, #356) [@ZakariaRidouh, @arnif]
  * do not rely on bash-style comments for pref opening (#279) [@mfpierre]
  * add support for a `registry` configuration field (#211) [@developit]
  * expose 'getWindows' and 'createWindow' to plugins (#248) [@CWSpear]
  * make preference-opening work on all shells (#267) [@szhu]
  * remove unused state variable (#268) [@marcbachmann]
  * remove unnecessary comment referencing use of !important due to aphrodite" (#223) [@conorhastings]
  * close window when last tab is exited (#263) [@ekmartin]
  * bring focus to main window when clicking preferences (#235) [@leo]
  * remove unnecessary event listener teardown on Term unmount (#242) [@developit]
  * make CMD + K work for all commands, even tail (#215) [@marcbachmann]
  * fix some documentation typos. (#212) [@mauro-oto]
  * add an option for a non-login shell to be run (#192) [@mike-engel, @cuth]
  * hide scrollbar when webview is active (#209) [@marcbachmann]

0.6.0 / 2016-07-17
==================

  * notification style improvements and link to release notes upon updates [@rauchg]
  * make `npm install` work more reliably (#172) [@marcbachmann]
  * fixing problems with alt key and special characters like å, ö and ä. (#201) [@teemuteemu]
  * change the version of eslint-config-standard from 5.3.1 to 5.3.5 (#166) [@6thmonth]
  * fixed an issue where the app icon was not showing up in Linux (#126) [@code-haven]
  * fixed typo (#152) [@radarhere]
  * icon typo fixed in about dialog (#146) [@akashnimare]
  * add a copy of the MIT license (#160) [@calinou]
  * fix notification message (#111) [@montogeek]
  * improved installation method (#104) [@amilajack]
  * initial travis ci support (#107) [@amilajack]
  * menu improvements (#185) [@sindresorhus]
  * provide hooks to open a new tab to the same directory (#174) [@hharnisc]
  * fix hypersolar plugin example, it does not exist (#179) [@montogeek]
  * fix onWindow hook (#180) [@dfrankland]

0.5.0 / 2016-07-16
==================

  * plugins: improve error handling and introduce `getDecoratedConfig` [@rauchg]
  * index: notify renderer of plugins changes to reload config [@rauchg]
  * index: allow plugin authors to change electron window settings [@rauchg]
  * index: expose `config` and `plugins` to plugin authors in electron process [@rauchg]
  * app: preserve class names with uglification [@rauchg]
  * config: reload config upon `plugins change` due to decorati [@rauchg]
  * app: expose `plugins` and `config` to window [@rauchg]
  * allow plugin authors to override styles by ditching !important [@rauchg]

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
  * Jump to beginning of end at edges of tabs when moving sideways (#22) [@rauchg]
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
