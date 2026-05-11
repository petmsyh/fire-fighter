const { DEFAULT_AGENT_CONFIG, mergeConfig } = require('./config');

class RobotCommandDispatcher {
  constructor(connectionManager, options = {}) {
    if (!connectionManager) {
      throw new Error('RobotCommandDispatcher requires a connection manager.');
    }

    const config = mergeConfig(DEFAULT_AGENT_CONFIG, options.config || {});

    this.connectionManager = connectionManager;
    this.commandMap = config.command.map;
    this.throttleMs = config.command.throttleMs;
    this.nowFn = options.nowFn || Date.now;
    this.lastDispatchTime = 0;
    this.lastAction = null;
  }

  async sendAction(action) {
    const command = this.commandMap[action];
    if (!command) {
      throw new Error(`Unknown robot action: ${action}`);
    }

    const now = this.nowFn();
    const isStop = action === 'STOP';

    if (!isStop && this.lastAction === action && now - this.lastDispatchTime < this.throttleMs) {
      return false;
    }

    this.lastDispatchTime = now;
    this.lastAction = action;

    await this.connectionManager.sendCommand(command);
    return true;
  }
}

module.exports = { RobotCommandDispatcher };
