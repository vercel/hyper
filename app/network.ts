import fetch from 'electron-fetch';

/**
 * Quick online check with a short timeout.
 * Returns true if we can reach a URL within the timeout, false otherwise.
 */
export async function isOnline(timeoutMs = 3000): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Use a small, lightweight endpoint which returns 204 when reachable.
    const res = await fetch('https://www.google.com/generate_204', {signal: controller.signal});
    clearTimeout(timeout);
    return res && res.status >= 200 && res.status < 300;
  } catch (_err) {
    // Any error (including abort) counts as offline for our purposes.
    return false;
  }
}

export default isOnline;
