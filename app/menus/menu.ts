import { app, dialog, Menu } from 'electron';
import type { BrowserWindow } from 'electron';
import { execCommand } from '../commands';
import { getConfig } from '../config';
import { icon } from '../config/paths';
import { getDecoratedKeymaps } from '../plugins';
import { getRendererTypes } from '../utils/renderer-utils';
import darwinMenu from './menus/darwin';
import editMenu from './menus/edit';
import helpMenu from './menus/help';
import shellMenu from './menus/shell';
import toolsMenu from './menus/tools';
import viewMenu from './menus/view';
import windowMenu from './menus/window';

const appName = app.name;
const appVersion = app.getVersion();
let menu_: Menu;

const showAbout = () => {
  const loadedPlugins = getLoadedPluginVersions();
  const pluginList = loadedPlugins.length === 0
    ? 'none'
    : loadedPlugins.map((plugin) => `\n  ${plugin.name} (${plugin.version})`).join('');

  const rendererCounts = Object.values(getRendererTypes()).reduce((acc, type) => {
    acc[type] = acc[type] ? acc[type] + 1 : 1;
    return acc;
  }, {});
  const renderers = Object.entries(rendererCounts)
    .map(([type, count]) => `${type}${count > 1 ? ` (${count})` : ''}`)
    .join(', ');

  void dialog.showMessageBox({
    title: `About ${appName}`,
    message: `${appName} ${appVersion} (${updateChannel})`,
    detail: `
      Renderers: ${renderers}
      Plugins: ${pluginList}

      Created by Guillermo Rauch
      Copyright © 2022 Vercel, Inc.`,
    buttons: [],
    icon: icon as any
  });
};

export const createMenu = (createWindow, getLoadedPluginVersions) => {
  const config = getConfig();
  const allCommandKeys = getDecoratedKeymaps();
  const commandKeys = Object.keys(allCommandKeys).reduce((result, command) => {
    result[command] = allCommandKeys[command][0];
    return result;
  }, {});

  let updateChannel = 'stable';
  if (config?.updateChannel && config.updateChannel === 'canary') {
    updateChannel = 'canary';
  }

  const menu = [
    ...(process.platform === 'darwin' ? [darwinMenu(commandKeys, execCommand, showAbout)] : []),
    shellMenu(
      commandKeys,
      execCommand,
      getConfig().profiles.map((p) => p.name)
    ),
    editMenu(commandKeys, execCommand),
    viewMenu(commandKeys, execCommand),
    toolsMenu(commandKeys, execCommand),
    windowMenu(commandKeys, execCommand),
    helpMenu(commandKeys, showAbout)
  ];

  return menu;
};

export const buildMenu = (template) => {
  menu_ = Menu.buildFromTemplate(template);
  return menu_;
};
