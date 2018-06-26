const WebSocket = require('ws');

class RobotApp {
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
        else if (this.socket != null && this.socket.readyState == WebSocket.OPEN) {
            // Mobile app is still connected
            let now = parseInt(Date.now() / 1000)
            console.log('NOW: ' + now);
            this.socket.send(JSON.stringify({ 'event': 'ping', 'timestamp': now }));
            return true;
        }
    }

    setupNewConnection(socket) {
        this.socket = socket;
        this.pongReceivedTimestamp = null;
    }

    setPongReceivedTimestamp(timestamp) {
        this.pongReceivedTimestamp = timestamp;
    }
}

module.exports = RobotApp;
