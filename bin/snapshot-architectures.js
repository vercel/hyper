const {execFileSync} = require('child_process');
const path = require('path');

// macOS archives now contain native tools; use a native runner for each architecture.
const architectures = process.platform === 'darwin' ? [process.arch] : ['x64', 'arm64'];
for (const arch of architectures) {
  const env = {...process.env, npm_config_arch: arch};
  for (const script of ['download-mksnapshot.js', 'mk-snapshot.js', 'cp-snapshot.js']) {
    execFileSync(process.execPath, [path.join(__dirname, script)], {env, stdio: 'inherit'});
  }
}
