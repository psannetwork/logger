class WebSocketClient {
    constructor() {
        this.ws = null;
        this.clientId = null;
        this.onMessageCallback = null;
    }

    init(clientId) {
        this.clientId = clientId;
        this.ws = new WebSocket(`ws://localhost:4732`);

        this.ws.onopen = () => {
            this.send({ id: this.clientId });
            console.log(`Connected as ${this.clientId}`);
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (this.onMessageCallback) {
                this.onMessageCallback(data);
            }
            this.handleIncomingMessage(data);
        };

        this.ws.onclose = () => {
            console.log(`Disconnected from the server`);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    sendMessage(toId, type, message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.send({ to: toId, type, message });
        } else {
            console.warn('WebSocket is not open. Message not sent.');
        }
    }

    send(data) {
        this.ws.send(JSON.stringify(data));
    }

    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    handleIncomingMessage(data) {
        if (data.type === 'offlineNotification') {
            console.warn(data.message);
        } else {
            console.log('Received message:', data);
        }
    }
}

// Export an instance of WebSocketClient for use in other modules
window.websocketClient = new WebSocketClient();
