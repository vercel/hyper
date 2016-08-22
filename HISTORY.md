
0.7.1 / 2016-07-26
==================

### Added
  * add a slight timeout to update the fontSmoothing pref (#407) [@mike-engel]

### Changed
  * session: suffix `UTF-8` to locale [@rauchg]
  * revert `--ignore-scripts` [@rauchg]
  * rpc server now extends `EventEmitter` (#406) [@jaywunder]

### Fixed
  * notifications: fix `(notes)` link [@rauchg]


0.7.0 / 2016-07-25
==================

### Added
  * implement `extend-info` for the custom `plist` [@lordgiotto]
  * add decorateEnv to the extensions API (#370) [@ekmartin]
  * add ctrl+tab/ctrl+shift+tab for tab switching (#367) [@NickChristensen]
  * add `TERM_PROGRAM` and `TERM_PROGRAM_VERSION` env vars (#350) [@tootallnate]
  * add middle click to close tab functionality (#286) [@itswil]
  * adds plugin hook for decorating the electron browser options (#310) [@danprince]
  * add support for multiple cursor shapes (#352) [@rpunkfu]
  * add LANG env variable (#354) [@TooTallNate]
  * implement post push and post install hooks (#328) [@freebroccolo]
  * add .editorconfig file (#320) [@freebroccolo]
  * add window zoom menu item (#325) [@marcbachmann]
  * add cursor actions (#217) [@marcbachmann]
  * add reducer to set cwd (#271) [@hharnisc]
  * add homebrew cask install method (#273, #356) [@ZakariaRidouh, @arnif]
  * add support for a `registry` configuration field (#211) [@developit]
  * add an option for a non-login shell to be run (#192) [@mike-engel, @cuth]
  * expose 'getWindows' and 'createWindow' to plugins (#248) [@CWSpear]

### Changed
  * use `uuid` instead of `uid2` for session ids [@albinekb]
  * reorganize dir structure and implement `electron-builder` [@rauchg]
  * move to the last term with cmd+9 (#261) [@ekmartin]
  * support default width/height of browser window (#257) [@tamagokun]
  * bump `electron-prebuilt` (#359) [@freebroccolo]
  * improved linux support (#341) [@c0b41]
  * auto-updater: stop notifying and being annoying [@rauchg]
  * allow the `color` config to be an object (#193) [@mike-engel]
  * configurable cursor opacity (#76) [@hharnisc]
  * update rounded header radius (#333) [@blakeembrey]
  * specify bash to run command in for editor opening (#314) [@kyleholzinger]
  * update dependencies (#319) [@freeboccolo]
  * disable pinch zoom functionality (#326) [@marcbachmann]
  * allow opening of files in webview (#305) [@cuth]
  * modified Info.plist generation to enable folder drop onto dock icon (#307) [@lordgiotto]
  * dynamically change the `font-smoothing` pref (#205) [@mike-engel]
  * override the buggy hexToRGB implementation in hterm. (#272) [@mauro-oto]
  * do not rely on bash-style comments for pref opening (#279) [@mfpierre]
  * close window when last tab is exited (#263) [@ekmartin]
  * bring focus to main window when clicking preferences (#235) [@leo]
  * hide scrollbar when webview is active (#209) [@marcbachmann]

### Removed
  * remove $ from terminal commands in README (#130) [@Tyriar]
  * disable linux autoupdate (#338) [@c0b41]
  * remove unused state variable (#268) [@marcbachmann]
  * remove unnecessary comment referencing use of !important due to aphrodite" (#223) [@conorhastings]
  * remove unnecessary event listener teardown on Term unmount (#242) [@developit]

### Fixed
  * fix support for `mapTermsDispatch` [@albinekb]
  * fix quit problem (#343) [@c0b41, @timneutkens]
  * fix linter issues (#321) [@freebroccolo]
  * fix prop update logic for fontSmoothing (#302) [@mike-engel]
  * fix installing plugins that use `node-gyp` (#291) [@dfrankland]
  * fix some documentation typos. (#212) [@mauro-oto]
  * index: prevent double sesson exit (#380) [@timneutkens]
  * make sure scrollbar shim doesn't capture clicks [@rauchg]
  * make preference-opening work on all shells (#267) [@szhu]
  * make CMD + K work for all commands, even tail (#215) [@marcbachmann]


0.6.0 / 2016-07-17
==================

### Added
  * add a copy of the MIT license (#160) [@calinou]
  * initial travis ci support (#107) [@amilajack]
  * provide hooks to open a new tab to the same directory (#174) [@hharnisc]

### Changed
  * notification style improvements and link to release notes upon updates [@rauchg]
  * change the version of eslint-config-standard from 5.3.1 to 5.3.5 (#166) [@6thmonth]
  * improved installation method (#104) [@amilajack]
  * menu improvements (#185) [@sindresorhus]

### Fixed
  * fixing problems with alt key and special characters like å, ö and ä. (#201) [@teemuteemu]
  * fixed an issue where the app icon was not showing up in Linux (#126) [@code-haven]
  * fixed typo (#152) [@radarhere]
  * fix notification message (#111) [@montogeek]
  * fix hypersolar plugin example, it does not exist (#179) [@montogeek]
  * fix onWindow hook (#180) [@dfrankland]
  * make `npm install` work more reliably (#172) [@marcbachmann]
  * icon typo fixed in about dialog (#146) [@akashnimare]


0.5.0 / 2016-07-16
==================

### Added
  * index: expose `config` and `plugins` to plugin authors in electron process [@rauchg]
  * app: expose `plugins` and `config` to window [@rauchg]

### Changed
  * plugins: improve error handling and introduce `getDecoratedConfig` [@rauchg]
  * index: notify renderer of plugins changes to reload config [@rauchg]
  * index: allow plugin authors to change electron window settings [@rauchg]
  * app: preserve class names with uglification [@rauchg]  
  * config: reload config upon `plugins change` due to decorati [@rauchg]
  * allow plugin authors to override styles by ditching !important [@rauchg]


0.4.5 / 2016-07-14
==================

### Changed
  * performance improvements for url matching [@rauchg]
  * improve repaint performance for writes to the term [@rauchg]

### Fixed
  * fix issue with perf degradation related to title polling [@rauchg]
  * fix resizing when only one axis changed [@rauchg]


0.4.4 / 2016-07-14
==================

### Changed
  * plugins: more graceful npm error


0.4.3 / 2016-07-14
==================

### Changed
  * terms: improve write performance

### Removed
  * remove unused import


0.4.2 / 2016-07-13
==================

### Fixed
  * fix close icon by copying static assets to build [@rauchg]


0.4.1 / 2016-07-13
==================

### Miscellaneous
  * noop bump to test updates


0.4.0 / 2016-07-13
==================

### Added
  * implement extensible redux actions system [@rauchg]
  * add support for config (~/.hyperterm.js) [@rauchg, @nfcampos]
  * add support for plugins (~/.hyperterm_modules) [@rauchg]
  * add close icon for tabs [@johanbrook]
  * add support for font size shortcuts [@jhaynie, @nfcampos]
  * add support for maximizing upon double click [@jhaynie]
  * add fallback fonts for linux and windows [@olliv]
  * add proper auto updates system [@matiastucci, @rauchg]

### Changed
  * improve menubar look [@leo, @rauchg]
  * beautiful default colors [@hharnisc, @dzannotti]
  * improve menu items [@rauchg, @sindresorhus]


0.3.1 / 2016-07-04
==================

### Added
  * implement most recent hterm with lots of bugfixes [@dbkaplun, @rauchg]


0.3.0 / 2016-07-04
==================

### Added
  * add static icon, move icons to static folder [@rauchg]
  * add cross-platform font family settings (#26) [@OlliV, @rauchg]
  * add standard behavior when you double click window (#32) [@jhaynie]

### Changed
  * revamp the menu to be a lot more standard (#38) [@rauchg]
  * move menu into its own file and refactor [@rauchg]
  * change font size with command shortcuts (#34) [@jhaynie]
  * implement a more reasonable update interval check frequency (#33) [@rauchg]

### Removed
  * remove `xterm.css` (no longer used, smaller build!) [@rauchg]


0.2.1 / 2016-07-03
==================

### Changed
  * improvements to update checker


0.2.0 / 2016-07-03
==================

### Added
  * Implement hterm (#28) [@rauchg]
  * Add fullscreen menu item (#1) [@rauchg, @montogeek]
  * Add support for cmd+shift+[|] [@rauchg]
  * Add dev build instructions to README (#3) [@rauchg]

### Changed
  * Jump to beginning of end at edges of tabs when moving sideways (#22) [@rauchg]
  * Make clear where to run `npm start` (#19) [@montogeek]
  * Improve README and scripts (#15) [@leo]
  * Make `ctrl+c` close <webview> instead of `cmd+w` (#2) [@rauchg]
  * Improve `zip` builds to not include nested directory [@rauchg]

### Fixed
  * Fix "Download" link being clickable when hidden (#7) [@rauchg]


0.1.0 / 2016-07-01
==================

### Added
  * initial release
