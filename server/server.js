const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

var reactClient = null;
var carClient = null;

wss.on('connection', function (ws) {
    ws.on('message', function (object) {
        object = JSON.parse(object);
        console.log(object);

        var event = object.event;

        switch(event)
        {
            case 'connection':
                var client = object.client;

                if (client === 'App') {
                    reactClient = ws;
                }
                else if (client === 'Car') {
                    carClient = ws;
                }

                console.log('%s connected!', client);
                break;
            case 'move':
                carClient.send(JSON.stringify(object));
                break;
            case 'clear_pins':
                carClient.send(JSON.stringify(object));
                break;
        }


        // ws.send(JSON.stringify(object));
    });

    ws.on('close', function () {
        console.log('Disconnected');

        // delete clients[clientId];
    });
});