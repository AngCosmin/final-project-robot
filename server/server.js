const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

var reactClient = null;
var carClient = null;
var lastMotorsSpeed = { left: -1, right: -1 };

wss.on('connection', function (ws) {
    ws.on('message', function (object) {
        object = JSON.parse(object);
        // console.log(object);

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
                sendMotorsSpeedToCar(object.speedSliderValue, object.steeringSliderValue);
                break;
            case 'clear_pins':
                if (carClient) {
                    carClient.send(JSON.stringify(object));
                }
                break;
        }
    });

    ws.on('close', function () {
        console.log('Disconnected');

        // delete clients[clientId];
    });
});

function sendMotorsSpeedToCar(speedSliderValue, steeringSliderValue)
{
    // If the car is connected
    if (carClient)
    {
        var motorsSpeed = calculateMotorsSpeed(speedSliderValue, steeringSliderValue);

        // If the speed changed from previous command
        if (motorsSpeed.left != lastMotorsSpeed.left || motorsSpeed.right != lastMotorsSpeed.right) 
        {
            console.log('left ' + motorsSpeed.left + ' right ' + motorsSpeed.right);
            carClient.send({ 'event': 'move', 'motorLeftSpeed': motorsSpeed.left, 'motorRightSpeed': motorsSpeed.right });
        }
    }
}

function calculateMotorsSpeed(speedSliderValue, steeringSliderValue)
{
    var motorsSpeed = { left: 0, right: 0 };

    // Turn left
    if (steeringSliderValue < 0) {
        if (speedSliderValue + steeringSliderValue < 20) {
            motorsSpeed.left = 20;
            motorsSpeed.right = 0;
        }
        else {
            motorsSpeed.left = speedSliderValue;
            motorsSpeed.right = speedSliderValue + steeringSliderValue;
        }
    }
    // Turn right
    else if (steeringSliderValue > 0) {
        if (speedSliderValue - steeringSliderValue < 20) {
            motorsSpeed.left = 0;
            motorsSpeed.right = 20;
        }
        else {
            motorsSpeed.left = speedSliderValue - steeringSliderValue;
            motorsSpeed.right = speedSliderValue;
        }
    }
    // Go straightforward
    else {
        motorsSpeed.left = speedSliderValue;
        motorsSpeed.right = speedSliderValue;
    }
        
    return motorsSpeed;
}