const path = require('path');

// Valid Windows Subsystem for Linux shell executables
const WSL_SHELL_EXECUTABLES = [
  'bash.exe',
  'wsl.exe',
  'ubuntu.exe',
  'ubuntu1804.exe',
  'kali.exe',
  'debian.exe',
  'opensuse-42.exe',
  'sles-12.exe'
];

// Returns true if given shell executable is from WSL, false otherwise
function isWslShell(shell = '') {
  return WSL_SHELL_EXECUTABLES.indexOf(shell.split(path.sep).pop()) !== -1;
}

module.exports = {
  isWslShell
};
