import {release} from 'os';
import {app, shell, MenuItemConstructorOptions, dialog, clipboard} from 'electron';
import {getConfig, getPlugins} from '../../config';
const {arch, env, platform, versions} = process;
import {version} from '../../package.json';

export default (commands: Record<string, string>, showAbout: () => void): MenuItemConstructorOptions => {
  const submenu: MenuItemConstructorOptions[] = [
    {
      label: `${app.name} Website`,
      click() {
        shell.openExternal('https://hyper.is');
      }
    },
    {
      label: 'Report Issue',
      click(menuItem, focusedWindow) {
        const body = `<!--
  Hi there! Thank you for discovering and submitting an issue.
  Before you submit this; let's make sure of a few things.
  Please make sure the following boxes are ✅ if they are correct.
  If not, please try and fulfil these first.
-->
<!-- 👉 Checked checkbox should look like this: [x] -->
- [ ] Your Hyper.app version is **${version}**. Please verify your using the [latest](https://github.com/vercel/hyper/releases/latest) Hyper.app version
- [ ] I have searched the [issues](https://github.com/vercel/hyper/issues) of this repo and believe that this is not a duplicate
---
- **Any relevant information from devtools?** _(CMD+OPTION+I on macOS, CTRL+SHIFT+I elsewhere)_:
<!-- 👉 Replace with info if applicable, or N/A -->

- **Is the issue reproducible in vanilla Hyper.app?**
<!-- 👉 Replace with info if applicable, or Is Vanilla. (Vanilla means Hyper.app without any add-ons or extras. Straight out of the box.) -->

## Issue
<!-- 👉 Now feel free to write your issue, but please be descriptive! Thanks again 🙌 ❤️ -->





---
<!-- ~/.hyper.js config -->
- **${app.name} version**: ${env.TERM_PROGRAM_VERSION} "${app.getVersion()}"
- **OS ARCH VERSION:** ${platform} ${arch} ${release()}
- **Electron:** ${versions.electron}  **LANG:** ${env.LANG}
- **SHELL:** ${env.SHELL}   **TERM:** ${env.TERM}
<details><summary><strong>.hyper.js contents</strong></summary>

\`\`\`json
${JSON.stringify(getConfig(), null, 2)}
\`\`\`
</details>
<details><summary><strong>plugins</strong></summary>

\`\`\`json
${JSON.stringify(getPlugins(), null, 2)}
\`\`\`
</details>`;

        const issueURL = `https://github.com/vercel/hyper/issues/new?body=${encodeURIComponent(body)}`;
        const copyAndSend = () => {
          clipboard.writeText(body);
          shell.openExternal(
            `https://github.com/vercel/hyper/issues/new?body=${encodeURIComponent(
              '<!-- We have written the needed data into your clipboard because it was too large to send. ' +
                'Please paste. -->\n'
            )}`
          );
        };
        if (!focusedWindow) {
          copyAndSend();
        } else if (issueURL.length > 6144) {
          dialog
            .showMessageBox(focusedWindow, {
              message:
                'There is too much data to send to GitHub directly. The data will be copied to the clipboard, ' +
                'please paste it into the GitHub issue page that will open.',
              type: 'warning',
              buttons: ['OK', 'Cancel']
            })
            .then((result) => {
              if (result.response === 0) {
                copyAndSend();
              }
            });
        } else {
          shell.openExternal(issueURL);
        }
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
