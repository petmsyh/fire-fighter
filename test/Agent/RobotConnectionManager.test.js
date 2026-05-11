const test = require('node:test');
const assert = require('node:assert/strict');

const { RobotConnectionManager } = require('../../src/Agent/RobotConnectionManager');
const { RobotCommandDispatcher } = require('../../src/Agent/RobotCommandDispatcher');
const { LocalAuthService } = require('../../src/Agent/LocalAuthService');

function createFakeTransport() {
  let closeHandler;
  let messageHandler;

  return {
    connected: false,
    sent: [],
    async connect() {
      this.connected = true;
    },
    async disconnect() {
      this.connected = false;
    },
    async send(command) {
      this.sent.push(command);
    },
    onClose(handler) {
      closeHandler = handler;
    },
    onMessage(handler) {
      messageHandler = handler;
    },
    emitClose() {
      if (closeHandler) {
        closeHandler();
      }
    },
    emitMessage(message) {
      if (messageHandler) {
        messageHandler(message);
      }
    },
  };
}

test('connects and sends commands over selected transport', async () => {
  const transport = createFakeTransport();
  const manager = new RobotConnectionManager({
    wifiTransportFactory: () => transport,
  });

  await manager.connect({ type: 'wifi' });
  assert.equal(manager.status, 'connected');

  await manager.sendCommand('F');
  assert.deepEqual(transport.sent, ['F']);
});

test('auto reconnect uses backoff and stops at max retries', async () => {
  const timers = [];
  const manager = new RobotConnectionManager({
    config: {
      connection: {
        maxReconnectAttempts: 2,
        reconnectBaseDelayMs: 5,
        reconnectMaxDelayMs: 20,
      },
    },
    setTimeoutFn: (fn, delay) => {
      timers.push({ fn, delay });
      return timers.length;
    },
    clearTimeoutFn: () => {},
    wifiTransportFactory: () => {
      throw new Error('cannot connect');
    },
  });

  await assert.rejects(() => manager.connect({ type: 'wifi' }), /cannot connect/);
  assert.equal(manager.status, 'reconnecting');
  assert.equal(timers[0].delay, 5);

  await timers[0].fn();
  assert.equal(timers[1].delay, 10);

  await timers[1].fn();
  assert.equal(manager.status, 'error');
  assert.match(manager.error.message, /Maximum reconnect attempts reached/);
});

test('stop command bypasses throttle while repeated move command is throttled', async () => {
  const sent = [];
  const manager = {
    async sendCommand(command) {
      sent.push(command);
    },
  };

  let now = 1000;
  const dispatcher = new RobotCommandDispatcher(manager, {
    nowFn: () => now,
    config: {
      command: {
        throttleMs: 200,
      },
    },
  });

  assert.equal(await dispatcher.sendAction('FORWARD'), true);
  assert.equal(await dispatcher.sendAction('FORWARD'), false);
  assert.deepEqual(sent, ['F']);

  assert.equal(await dispatcher.sendAction('STOP'), true);
  assert.deepEqual(sent, ['F', 'S']);

  now += 300;
  assert.equal(await dispatcher.sendAction('FORWARD'), true);
  assert.deepEqual(sent, ['F', 'S', 'F']);
});

test('local auth validates and gates access', () => {
  const auth = new LocalAuthService();

  assert.equal(auth.isAuthenticated(), false);
  assert.equal(auth.login('a', '12').valid, false);
  assert.equal(auth.login('admin', 'badpass').valid, false);

  const result = auth.login('admin', 'firefighter');
  assert.equal(result.valid, true);
  assert.equal(auth.isAuthenticated(), true);

  auth.logout();
  assert.equal(auth.isAuthenticated(), false);
});
