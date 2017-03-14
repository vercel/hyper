const commands = {};

class CommandRegistry {
  register(cmds) {
    if (cmds) {
      for (const command in cmds) {
        if (command) {
          commands[command] = cmds[command];
        }
      }
    }
  }

  isCommands(cmd) {
    return commands[cmd] !== undefined;
  }

  exec(cmd, e) {
    commands[cmd](e);
  }
}

export default new CommandRegistry();
