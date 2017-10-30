const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });
var clients = {};

wss.on('connection', function (ws, req) {
    console.log('New connection!');

    // Generate client unique ID
    var clientId = new Date().getUTCMilliseconds();
    clients[clientId] = ws;

    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({'status': 'success', 'message': 'We have a new connection! Welcome client ' + clientId}));
        }
    });

    ws.on('message', function (message) {
        console.log('received: %s', message);

        ws.send(JSON.stringify({'status': 'success', 'message': 'Your message was received. You said ' + message}));
    });

    ws.on('close', function () {
        console.log('Disconnected');

        delete clients[clientId];
    });
});