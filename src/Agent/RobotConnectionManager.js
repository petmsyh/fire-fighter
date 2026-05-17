const { DEFAULT_AGENT_CONFIG, mergeConfig } = require('./config');
const { WifiWebSocketTransport } = require('./transports/WifiWebSocketTransport');
const { BluetoothTransport } = require('./transports/BluetoothTransport');

class RobotConnectionManager {
  constructor(options = {}) {
    const config = mergeConfig(DEFAULT_AGENT_CONFIG, options.config || {});

    this.config = config;
    this.status = 'disconnected';
    this.error = null;
    this.messageListeners = new Set();
    this.statusListeners = new Set();
    this.transport = null;
    this.target = null;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.manualDisconnect = false;

    this.setTimeoutFn = options.setTimeoutFn || setTimeout;
    this.clearTimeoutFn = options.clearTimeoutFn || clearTimeout;

    this.wifiTransportFactory = options.wifiTransportFactory || ((connectionOptions = {}) => new WifiWebSocketTransport({
      url: connectionOptions.endpoint || this.config.connection.wifiUrl,
      WebSocketImpl: connectionOptions.WebSocketImpl,
    }));

    this.bluetoothTransportFactory = options.bluetoothTransportFactory || ((connectionOptions = {}) => new BluetoothTransport({
      deviceId: connectionOptions.deviceId || this.config.connection.bluetoothDeviceId,
      connector: connectionOptions.bluetoothConnector,
    }));
  }

  onStatusChange(listener) {
    this.statusListeners.add(listener);
    listener({ status: this.status, error: this.error, retries: this.reconnectAttempts });
    return () => this.statusListeners.delete(listener);
  }

  onMessage(listener) {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  async connect(options = {}) {
    const type = options.type || this.config.connection.defaultType;
    this.manualDisconnect = false;
    this.target = { ...options, type };

    this.#clearReconnectTimer();

    if (this.transport && typeof this.transport.disconnect === 'function') {
      await this.transport.disconnect();
    }

    this.#setStatus(options.isReconnect ? 'reconnecting' : 'connecting', null);

    try {
      const transport = type === 'bluetooth'
        ? this.bluetoothTransportFactory(options)
        : this.wifiTransportFactory(options);

      this.transport = transport;

      if (typeof transport.onClose === 'function') {
        transport.onClose(() => this.#handleUnexpectedDisconnect());
      }

      if (typeof transport.onMessage === 'function') {
        transport.onMessage((message) => {
          this.messageListeners.forEach((listener) => listener(message));
        });
      }

      await transport.connect(options);
      this.reconnectAttempts = 0;
      this.#setStatus('connected', null);
    } catch (error) {
      this.#setStatus('error', error);
      if (!this.manualDisconnect) {
        this.#scheduleReconnect();
      }
      throw error;
    }
  }

  async disconnect() {
    this.manualDisconnect = true;
    this.target = null;
    this.#clearReconnectTimer();
    this.reconnectAttempts = 0;

    if (this.transport && typeof this.transport.disconnect === 'function') {
      await this.transport.disconnect();
    }

    this.transport = null;
    this.#setStatus('disconnected', null);
  }

  async sendCommand(command) {
    if (this.status !== 'connected' || !this.transport) {
      throw new Error('Robot is not connected.');
    }

    await this.transport.send(command);
  }

  #setStatus(status, error) {
    this.status = status;
    this.error = error || null;
    this.statusListeners.forEach((listener) => {
      listener({ status, error: this.error, retries: this.reconnectAttempts });
    });
  }

  #handleUnexpectedDisconnect() {
    if (this.manualDisconnect) {
      return;
    }

    this.#setStatus('disconnected', null);
    this.#scheduleReconnect();
  }

  #scheduleReconnect() {
    if (!this.target) {
      return;
    }

    if (this.reconnectAttempts >= this.config.connection.maxReconnectAttempts) {
      this.#setStatus('error', new Error(`Maximum reconnect attempts (${this.config.connection.maxReconnectAttempts}) reached.`));
      return;
    }

    this.reconnectAttempts += 1;
    const delay = Math.floor(Math.min(
      this.config.connection.reconnectBaseDelayMs * (2 ** (this.reconnectAttempts - 1)),
      this.config.connection.reconnectMaxDelayMs,
    ));

    this.#setStatus('reconnecting', null);

    this.reconnectTimer = this.setTimeoutFn(async () => {
      try {
        await this.connect({ ...this.target, isReconnect: true });
      } catch (error) {
        this.#setStatus('error', error);
        this.#scheduleReconnect();
      }
    }, delay);
  }

  #clearReconnectTimer() {
    if (this.reconnectTimer) {
      this.clearTimeoutFn(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

module.exports = { RobotConnectionManager };
