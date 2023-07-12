import {readFileSync} from 'fs';
import type Session from '../session';

export default function sessionHasRunningChildren(session: Session): boolean {
  if (process.platform == 'linux' && session.pty != null) {
    try {
      const childProcInfoPath = `/proc/${session.pty.pid}/task/${session.pty.pid}/children`;
      return readFileSync(childProcInfoPath, 'utf8').length >= 1;
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
}
