import {isIPv6} from 'net';

import parseUrl from 'parse-url';

import type {SSHDestination} from '../../typings/common';

// An `ssh://` URL can be handed to Hyper by any web page, document or mail
// client, and the destination it describes ends up being written into an
// interactive shell session. Every component is therefore treated as untrusted
// input and validated against a conservative allowlist: anything that is not
// unambiguously a user name, host or port is rejected instead of escaped, so
// that the generated command can never contain shell metacharacters.

// Host names as per RFC 1123. This also covers IPv4 literals.
const LABEL = '[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?';
const HOSTNAME = new RegExp(`^${LABEL}(?:\\.${LABEL})*\\.?$`);
const MAX_HOSTNAME_LENGTH = 253;

// SSH itself does not restrict user names, but accepting the characters that
// are portable across real-world systems is enough and keeps the command safe.
const USERNAME = /^[A-Za-z0-9._-]+$/;

const MAX_PORT = 65535;

const decode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    // Malformed percent-encoding.
    return null;
  }
};

const parseHost = (resource: string) => {
  // `parse-url` keeps the brackets of an IPv6 literal. They are dropped here:
  // `ssh` expects a bare address and brackets are glob characters in a shell.
  const ipv6 = resource.startsWith('[') && resource.endsWith(']') ? resource.slice(1, -1) : null;
  if (ipv6 !== null) {
    return isIPv6(ipv6) ? ipv6 : null;
  }

  if (resource.length > MAX_HOSTNAME_LENGTH || !HOSTNAME.test(resource)) {
    return null;
  }

  return resource;
};

const parseUser = (user: string) => {
  const decoded = decode(user);

  // A user name starting with `-` would be read by `ssh` as an option.
  if (decoded === null || decoded.startsWith('-') || !USERNAME.test(decoded)) {
    return null;
  }

  return decoded;
};

const parsePort = (port: string) => {
  if (!/^[0-9]{1,5}$/.test(port)) {
    return null;
  }

  const parsed = Number(port);

  return parsed >= 1 && parsed <= MAX_PORT ? parsed : null;
};

/**
 * Parse and validate an externally supplied `ssh://` URL.
 *
 * @param url URL received from the OS protocol handler.
 * @returns The destination to connect to, or `null` if the URL is malformed or
 * describes something that is not a plain ssh destination.
 */
export const parseSSHUrl = (url: string): SSHDestination | null => {
  let parsed;
  try {
    parsed = parseUrl(url);
  } catch {
    // `parse-url` throws on input it cannot make sense of.
    return null;
  }

  // Hyper only registers itself for `ssh://`, and the command it builds is an
  // `ssh` invocation, so no other scheme may be accepted here.
  if (parsed.protocol !== 'ssh') {
    return null;
  }

  const host = parseHost(parsed.resource);
  if (host === null) {
    return null;
  }

  const destination: SSHDestination = {host};

  if (parsed.user) {
    const user = parseUser(parsed.user);
    if (user === null) {
      return null;
    }
    destination.user = user;
  }

  if (parsed.port) {
    const port = parsePort(String(parsed.port));
    if (port === null) {
      return null;
    }
    destination.port = port;
  }

  return destination;
};
