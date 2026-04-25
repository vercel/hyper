import {app, dialog} from 'electron';
import type {BrowserWindow} from 'electron';

import type {configOptions} from '../../typings/config';

/**
 * Returns `true` if at least one session in any open window has a live `pty`
 * that has not been marked as ended. We treat that as "a running process".
 *
 * We intentionally avoid inspecting child process state via `ps`/native APIs
 * here because that would require a deeper shell integration. The presence
 * of a non-ended pty is a reasonable proxy: a fresh shell with nothing
 * running still counts (matches what the user generally expects: closing
 * Hyper means losing whatever they were doing).
 */
export function hasRunningProcess(windows: Iterable<BrowserWindow>): boolean {
  for (const win of windows) {
    const sessions = win?.sessions;
    if (!sessions || typeof sessions.values !== 'function') continue;
    for (const session of sessions.values()) {
      // `pty` is set on init and `ended` is flipped to true when the session exits.
      if (session && session.pty && !session.ended) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Shows the native confirm dialog. Returns `true` if the user chose to quit.
 * Extracted so tests can stub the dialog easily.
 */
export function showQuitConfirmDialog(parent?: BrowserWindow): boolean {
  const result = dialog.showMessageBoxSync(parent ?? (undefined as unknown as BrowserWindow), {
    type: 'question',
    buttons: ['Cancel', 'Quit'],
    defaultId: 0,
    cancelId: 0,
    title: 'Quit Hyper?',
    message: 'Are you sure you want to quit Hyper?',
    detail: 'There is at least one session with a running process. Quitting will terminate it.'
  });
  return result === 1;
}

export type ConfirmOnQuitMode = configOptions['confirmOnQuit'];

/**
 * Decide whether to allow the quit based on the current `confirmOnQuit` mode
 * and the state of open sessions. Returns `true` if quit should proceed.
 *
 * The dialog is only shown when needed; an unknown mode falls back to
 * `'on-running-process'` to preserve the documented default.
 */
export function shouldAllowQuit(
  mode: ConfirmOnQuitMode | undefined,
  windows: Iterable<BrowserWindow>,
  showDialog: (parent?: BrowserWindow) => boolean = showQuitConfirmDialog
): boolean {
  const effective: ConfirmOnQuitMode =
    mode === 'always' || mode === 'never' || mode === 'on-running-process' ? mode : 'on-running-process';

  if (effective === 'never') return true;
  if (effective === 'on-running-process' && !hasRunningProcess(windows)) return true;

  // `BrowserWindow.getFocusedWindow()` is read lazily so this module can be
  // imported in environments where electron isn't fully initialized (tests).
  const focused = app?.getLastFocusedWindow ? app.getLastFocusedWindow() ?? undefined : undefined;
  return showDialog(focused);
}
