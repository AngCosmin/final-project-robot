const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

var reactClient = null;
var carClient = null;
var commandsHistory = [];

wss.on('connection', function (ws) {
    ws.on('message', function (object) {
        object = JSON.parse(object);
        console.log(object);

        var event = object.event;

        switch(event)
        {
            case 'connection':
                var client = object.client;

                if (client === 'React Native') {
                    reactClient = ws;
                }
                else if (client === 'Car') {
                    carClient = ws;
                }

                console.log('%s just connected!', client);
                break;
            case 'move':
                if (commandsHistory[commandsHistory.length - 1] == 'move') {
                    break;
                }

                carClient.send(JSON.stringify(object));
                commandsHistory.push('move');
                break;
            case 'stop':
                if (commandsHistory[commandsHistory.length - 1] == 'stop') {
                    break;
                }
                
                carClient.send(JSON.stringify(object));
                commandsHistory.push('stop');
                break;
            case 'curve':
                carClient.send(JSON.stringify(object));
                break;
            case 'message':
                console.log('Received: %s', object);
                break;
        }


        // ws.send(JSON.stringify({'status': 'success', 'message': 'Your message was received. You said ' + object}));
    });

    ws.on('close', function () {
        console.log('Disconnected');

        // delete clients[clientId];
    });
});