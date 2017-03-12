export default class CommandRegistry {
  constructor() {
    this.rgst = {};
  }

  register(command, action) {
    this.rgst[command] = action;
  }
}
