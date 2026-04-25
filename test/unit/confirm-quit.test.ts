// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import test from 'ava';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const proxyquire = require('proxyquire').noCallThru();

const loadModule = (dialogStub?: {showMessageBoxSync: (...args: any[]) => number}) =>
  proxyquire('../../app/utils/confirm-quit', {
    electron: {
      app: {
        getLastFocusedWindow: () => null
      },
      dialog: dialogStub ?? {
        showMessageBoxSync: () => 0
      }
    }
  });

const makeSession = (overrides: {pty?: any; ended?: boolean} = {}) => ({
  pty: 'pty' in overrides ? overrides.pty : {pid: 123},
  ended: overrides.ended ?? false
});

const makeWindow = (sessions: Array<ReturnType<typeof makeSession>>) => {
  const map = new Map<string, ReturnType<typeof makeSession>>();
  sessions.forEach((s, i) => map.set(`uid-${i}`, s));
  return {sessions: map} as any;
};

test('hasRunningProcess returns true when any session has a live pty', (t) => {
  const {hasRunningProcess} = loadModule();
  const win = makeWindow([makeSession()]);
  t.true(hasRunningProcess([win]));
});

test('hasRunningProcess returns false when sessions are ended', (t) => {
  const {hasRunningProcess} = loadModule();
  const win = makeWindow([makeSession({ended: true})]);
  t.false(hasRunningProcess([win]));
});

test('hasRunningProcess returns false when no windows', (t) => {
  const {hasRunningProcess} = loadModule();
  t.false(hasRunningProcess([]));
});

test('hasRunningProcess returns false when sessions have no pty', (t) => {
  const {hasRunningProcess} = loadModule();
  const win = makeWindow([makeSession({pty: null})]);
  t.false(hasRunningProcess([win]));
});

test("shouldAllowQuit allows quit when mode is 'never'", (t) => {
  const {shouldAllowQuit} = loadModule();
  let dialogCalls = 0;
  const allow = shouldAllowQuit('never', [makeWindow([makeSession()])], () => {
    dialogCalls += 1;
    return false;
  });
  t.true(allow);
  t.is(dialogCalls, 0);
});

test("shouldAllowQuit prompts when mode is 'always'", (t) => {
  const {shouldAllowQuit} = loadModule();
  let dialogCalls = 0;
  // No running sessions, but mode is 'always' so the dialog should still fire.
  const allow = shouldAllowQuit('always', [makeWindow([makeSession({ended: true})])], () => {
    dialogCalls += 1;
    return true;
  });
  t.true(allow);
  t.is(dialogCalls, 1);
});

test("shouldAllowQuit returns false when user cancels in 'always' mode", (t) => {
  const {shouldAllowQuit} = loadModule();
  const allow = shouldAllowQuit('always', [makeWindow([makeSession()])], () => false);
  t.false(allow);
});

test("shouldAllowQuit skips dialog in 'on-running-process' when nothing runs", (t) => {
  const {shouldAllowQuit} = loadModule();
  let dialogCalls = 0;
  const allow = shouldAllowQuit('on-running-process', [makeWindow([makeSession({ended: true})])], () => {
    dialogCalls += 1;
    return true;
  });
  t.true(allow);
  t.is(dialogCalls, 0);
});

test("shouldAllowQuit prompts in 'on-running-process' when something runs", (t) => {
  const {shouldAllowQuit} = loadModule();
  let dialogCalls = 0;
  const allow = shouldAllowQuit('on-running-process', [makeWindow([makeSession()])], () => {
    dialogCalls += 1;
    return true;
  });
  t.true(allow);
  t.is(dialogCalls, 1);
});

test('shouldAllowQuit falls back to default when mode is unknown', (t) => {
  const {shouldAllowQuit} = loadModule();
  let dialogCalls = 0;
  // Unknown mode + running process -> behaves like 'on-running-process'.
  const allow = shouldAllowQuit('bogus' as any, [makeWindow([makeSession()])], () => {
    dialogCalls += 1;
    return false;
  });
  t.false(allow);
  t.is(dialogCalls, 1);
});

test('showQuitConfirmDialog returns true when user picks Quit', (t) => {
  const {showQuitConfirmDialog} = loadModule({
    showMessageBoxSync: () => 1
  });
  t.true(showQuitConfirmDialog());
});

test('showQuitConfirmDialog returns false when user picks Cancel', (t) => {
  const {showQuitConfirmDialog} = loadModule({
    showMessageBoxSync: () => 0
  });
  t.false(showQuitConfirmDialog());
});
