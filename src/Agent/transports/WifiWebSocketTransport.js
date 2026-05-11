class WifiWebSocketTransport {
  constructor({ url, WebSocketImpl }) {
    this.url = url;
    this.WebSocketImpl = WebSocketImpl || globalThis.WebSocket;
    this.socket = null;
    this.closeListeners = new Set();
    this.messageListeners = new Set();
  }

  async connect() {
    if (!this.WebSocketImpl) {
      throw new Error('WebSocket support is unavailable. Provide WebSocketImpl or runtime support.');
    }

    await new Promise((resolve, reject) => {
      const socket = new this.WebSocketImpl(this.url);
      const onOpen = () => {
        socket.removeEventListener('error', onError);
        resolve();
      };
      const onError = () => {
        socket.removeEventListener('open', onOpen);
        reject(new Error('Failed to connect via Wi-Fi WebSocket.'));
      };

      socket.addEventListener('open', onOpen);
      socket.addEventListener('error', onError);
      socket.addEventListener('message', (event) => {
        this.messageListeners.forEach((listener) => listener(event.data));
      });
      socket.addEventListener('close', () => {
        this.closeListeners.forEach((listener) => listener());
      });
      this.socket = socket;
    });
  }

  async disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  async send(command) {
    const openState = this.WebSocketImpl && typeof this.WebSocketImpl.OPEN === 'number'
      ? this.WebSocketImpl.OPEN
      : 1;

    if (!this.socket || this.socket.readyState !== openState) {
      throw new Error('Wi-Fi socket is not connected.');
    }
    this.socket.send(command);
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

module.exports = { WifiWebSocketTransport };
