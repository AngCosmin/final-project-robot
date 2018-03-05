class MobileApp {
    constructor(socket) {
        this.socket = socket;
        this.pongReceivedTimestamp = null;
    }

    checkConnection() {
        let timePassed = 0;

        if (this.pongReceivedTimestamp != null) {
            timePassed = Date.now() - this.pongReceivedTimestamp;
        }

        if (timePassed > 2000) {
            // Didn't received a response for 2 seconds => mobile app disconnected

            this.socket = null;
            return false;
        }
        else if (this.socket != null) {
            // Mobile app is still connected

            this.socket.send(JSON.stringify({'event': 'ping', 'timestamp': Date.now()}));
            return true;
        }
    }

    setupNewConnection(socket) {
        this.socket = socket;
        this.pongReceivedTimestamp = null;
    }

    setPongReceivedTimestamp (timestamp) {
        this.pongReceivedTimestamp = timestamp;
    }
}

module.exports = MobileApp;