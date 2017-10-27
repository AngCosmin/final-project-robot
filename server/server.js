const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function (ws) {
    console.log('New connection!');

    ws.on('message', function (message) {
        console.log('received: %s', message);
    });

    ws.send(JSON.stringify({'status': 'success', 'message': 'something'}));
});