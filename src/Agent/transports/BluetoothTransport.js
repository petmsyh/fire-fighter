class BluetoothTransport {
  constructor({ deviceId, connector }) {
    this.deviceId = deviceId;
    this.connector = connector;
    this.connection = null;
    this.closeListeners = new Set();
    this.messageListeners = new Set();
  }

  async connect() {
    if (!this.connector || typeof this.connector.connect !== 'function') {
      throw new Error('Bluetooth connector is unavailable. Inject a BLE/Classic connector implementation.');
    }

    this.connection = await this.connector.connect({
      deviceId: this.deviceId,
      onClose: () => this.closeListeners.forEach((listener) => listener()),
      onMessage: (message) => this.messageListeners.forEach((listener) => listener(message)),
    });
  }

  async disconnect() {
    if (this.connection && typeof this.connection.disconnect === 'function') {
      await this.connection.disconnect();
    }
    this.connection = null;
  }

  async send(command) {
    if (!this.connection || typeof this.connection.send !== 'function') {
      throw new Error('Bluetooth is not connected.');
    }
    await this.connection.send(command);
  }

  onClose(listener) {
    this.closeListeners.add(listener);
    return () => this.closeListeners.delete(listener);
  }

  onMessage(listener) {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }
}

module.exports = { BluetoothTransport };
