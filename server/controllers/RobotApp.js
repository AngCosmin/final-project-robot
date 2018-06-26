const WebSocket = require('ws');

class RobotApp {
    constructor(socket) {
        this.socket = socket;
        this.pongReceivedTimestamp = null;
    }

    checkConnection() {
        let timePassed = 0;

        if (this.pongReceivedTimestamp != null) {
            // Calcaulate 'now' because there is a difference between python fuction for 
            // timestamp and javascript function
            let now = parseInt(Date.now() / 1000)
            timePassed = now - this.pongReceivedTimestamp;
        }

        if (timePassed > 2000) {
            // Didn't received a response for 2 seconds => mobile app disconnected

            this.socket = null;
            return false;
        }
        else if (this.socket != null && this.socket.readyState == WebSocket.OPEN) {
            // Mobile app is still connected

            // Calcaulate 'now' because there is a difference between python fuction for 
            // timestamp and javascript function
            let now = parseInt(Date.now() / 1000)

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
