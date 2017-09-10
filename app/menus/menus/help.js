const os = require('os');
const {app, shell} = require('electron');

module.exports = (commands, showAbout) => {
  const submenu = [
    {
      label: `${app.getName()} Website`,
      click() {
        shell.openExternal('https://hyper.is');
      }
    },
    {
      label: 'Report Issue',
      click() {
        const body = `
        <!-- Please succinctly describe your issue and steps to reproduce it. -->
        -
        ${app.getName()} ${app.getVersion()}
        Electron ${process.versions.electron}
        ${process.platform} ${process.arch} ${os.release()}`;

        shell.openExternal(`https://github.com/zeit/hyper/issues/new?body=${encodeURIComponent(body)}`);
      }
    }
  ];

  if (process.platform !== 'darwin') {
    submenu.push(
      {type: 'separator'},
      {
        role: 'about',
        click() {
          showAbout();
        }
      }
    );
  }

  return {
    role: 'help',
    submenu
  };
};
