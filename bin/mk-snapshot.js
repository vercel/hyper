const childProcess = require('child_process');
const vm = require('vm');
const path = require('path');
const fs = require('fs');
const electronLink = require('electron-link');
const {mkdirp} = require('fs-extra');

const excludedModules = {};

const crossArchDirs = ['clang_x86_v8_arm', 'clang_x64_v8_arm64', 'win_clang_x64'];

async function main() {
  const baseDirPath = path.resolve(__dirname, '..');

  console.log('Creating a linked script..');
  const result = await electronLink({
    baseDirPath: baseDirPath,
    mainPath: `${__dirname}/snapshot-libs.js`,
    cachePath: `${baseDirPath}/cache`,
    // eslint-disable-next-line no-prototype-builtins
    shouldExcludeModule: (modulePath) => excludedModules.hasOwnProperty(modulePath)
  });

  const snapshotScriptPath = `${baseDirPath}/cache/snapshot-libs.js`;
  fs.writeFileSync(snapshotScriptPath, result.snapshotScript);

  // Verify if we will be able to use this in `mksnapshot`
  vm.runInNewContext(result.snapshotScript, undefined, {filename: snapshotScriptPath, displayErrors: true});

  const outputBlobPath = `${baseDirPath}/cache/${process.env.npm_config_arch}`;
  await mkdirp(outputBlobPath);

  if (process.platform !== 'darwin') {
    const mksnapshotBinPath = `${baseDirPath}/node_modules/electron-mksnapshot/bin`;
    const matchingDirs = crossArchDirs.map((dir) => `${mksnapshotBinPath}/${dir}`).filter((dir) => fs.existsSync(dir));
    for (const dir of matchingDirs) {
      if (fs.existsSync(`${mksnapshotBinPath}/gen/v8/embedded.S`)) {
        await mkdirp(`${dir}/gen/v8`);
        fs.copyFileSync(`${mksnapshotBinPath}/gen/v8/embedded.S`, `${dir}/gen/v8/embedded.S`);
      }
    }
  }

  console.log(`Generating startup blob in "${outputBlobPath}"`);
  const isWindows = process.platform === 'win32';
  const mksnapshotPath = path.resolve(
    __dirname,
    '..',
    'node_modules',
    '.bin',
    'mksnapshot' + (isWindows ? '.cmd' : '')
  );
  // Node >= 18.20.2 / 20.12.2 / 21.7.0 refuses to spawn .cmd and .bat files
  // without `shell` (CVE-2024-27980), which makes execFileSync fail with
  // EINVAL. On Windows, go through the shell and quote the arguments here.
  const quote = (arg) => (isWindows ? `"${arg}"` : arg);
  childProcess.execFileSync(
    quote(mksnapshotPath),
    [snapshotScriptPath, '--output_dir', outputBlobPath].map(quote),
    isWindows ? {shell: true} : {}
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
