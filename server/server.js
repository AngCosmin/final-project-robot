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
                calculateMotorsSpeed(object);
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

function sendMotorsSpeedToCar(joystick_x, joystick_y)
{
    var motorsSpeed = calculateMotorsSpeed(joystick_x, joystick_y);

    // If the car is connected
    if (carClient)
    {
        var motorsSpeed = calculateMotorsSpeed(joystick_x, joystick_y);

        // If the speed changed from previous command
        if (motorsSpeed.left != lastMotorsSpeed.left || motorsSpeed.right != lastMotorsSpeed.right) 
        {
            console.log('left ' + motorsSpeed.left + ' right ' + motorsSpeed.right);
            carClient.send({ 'event': 'move', 'motorLeftSpeed': motorsSpeed.left, 'motorRightSpeed': motorsSpeed.right });
        }
    }
}

function calculateMotorsSpeed(object)
{
    // Get data from object
    let max_value = object.joystick_max_value;
    let x = object.joystick_x;
    let y = object.joystick_y;
    
    // Calculate speed. Distance from (0, 0) to finger coords
    let speed = Math.sqrt(x * x + y * y);
    
    // Set first motors speed
    let motorsSpeed = { left: speed, right: speed };

    if (y < 0) {
        // DIRECTION FORWARD

        if (x > 0) {
            // RIGHT

            motorsSpeed.right -= x;
        } 
        else {
            // LEFT

            motorsSpeed.left += x;
        }
    }
    else {
        // DIRECTION BACKWARD
        motorsSpeed.left = -speed;
        motorsSpeed.right = -speed;

        if (x > 0) {
            // RIGHT

            motorsSpeed.right += x;
        }
        else {
            // LEFT

            motorsSpeed.left -= x;
        }
    }

    if (motorsSpeed.left > 100) {
        motorsSpeed.left = 100;
    }
    else if (motorsSpeed.left < -100) {
        motorsSpeed.left = -100;
    }

    if (motorsSpeed.right > 100) {
        motorsSpeed.right = 100;
    }
    else if (motorsSpeed.right < -100) {
        motorsSpeed.right = -100;
    }

    if (Math.abs(motorsSpeed.left) < 7.5) {
        motorsSpeed.left = 0;
    }
    
    if (Math.abs(motorsSpeed.right) < 7.5) {
        motorsSpeed.right = 0;
    }

    if (motorsSpeed.left > 0) {
        if (motorsSpeed.left < 15) {
            motorsSpeed.left = 15;
        }
    }
    else {
        if (motorsSpeed.left > 15) {
            motorsSpeed.left = -15;
        }
    }

    if (motorsSpeed.right > 0) {
        if (motorsSpeed.right < 15) {
            motorsSpeed.right = 15;
        }
    }
    else {
        if (motorsSpeed.right > 15) {
            motorsSpeed.right = -15;
        }
    }

    // To integer
    motorsSpeed.left = parseInt(motorsSpeed.left);
    motorsSpeed.right = parseInt(motorsSpeed.right);

    console.log(motorsSpeed);
    
    // return motorsSpeed;
}