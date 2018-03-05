const WebSocket = require('ws');
const electron = require('electron');
const ip = require("ip");
const os = require('os');

const MobileApp = require('./MobileApp');
const UI = require('./UI');

var robotClient = null;
var lastMotorsSpeed = { left: 0, right: 0 };

const wss = new WebSocket.Server({ port: 3000 });
const { app } = electron;

let ui = null;
let mobileApp = new MobileApp();

app.on('ready', function () {
    ui = new UI();
});

wss.on('connection', function (socket) {        
    socket.on('message', function (object) {
        object = JSON.parse(object);
        // console.log(object);

        var event = object.event;
        switch (event) {
            case 'connection':
                let client = object.client;

                if (client === 'Mobile application') {
                    mobileApp.setupNewConnection(socket);
                    ui.sendToView('mobile-app:status', 'Connected');
                }
                else if (client === 'Car') {
                    robotClient = socket;
                }
                break;
            case 'move':
                sendMotorsSpeedToCar(object);
                break;
            case 'turn_motors':
                let status = object.status;
                sendMotorsStatusToCar(status);
                break;
            case 'pong':
                mobileApp.setPongReceivedTimestamp(object.timestamp);
                break;
        }
    });
});

// Send ping to mobile app to check if it is still on
setInterval(() => {
    ui.sendToView('server-ip', ip.address());    
    
    let isMobileAppConnected = mobileApp.checkConnection();

    if (!isMobileAppConnected) {
        ui.sendToView('mobile-app:status', 'Not connected');
    }
}, 1000);

function sendMotorsSpeedToCar(object) {
    // If the car is connected
    if (robotClient && robotClient.readyState == WebSocket.OPEN) {
        var motorsSpeed = _calculateMotorsSpeed(object);

        // Check if motors speed changed with at least 2 points
        if (Math.abs(lastMotorsSpeed.left - motorsSpeed.left) >= 2 || Math.abs(lastMotorsSpeed.right - motorsSpeed.right) >= 2) {
            lastMotorsSpeed.left = motorsSpeed.left;
            lastMotorsSpeed.right = motorsSpeed.right;

            robotClient.send(JSON.stringify({
                'event': 'move',
                'motorLeftSpeed': motorsSpeed.left,
                'motorRightSpeed': motorsSpeed.right,
                'direction': motorsSpeed.direction
            }));
        }
    }
    else {
        console.log('Robot not connected to the server!');
    }
}

function sendMotorsStatusToCar(status) {
    // If the car is connected
    if (robotClient && robotClient.readyState == WebSocket.OPEN) {
        robotClient.send(JSON.stringify({ 'event': 'turn_motors', 'status': status }));
    }
    else {
        console.log('Robot not connected to the server!');
    }
}

function _calculateMotorsSpeed(object) {
    // Get data from object
    let max_value = object.joystick_max_value;
    let x = object.joystick_x;
    let y = object.joystick_y;

    let speed_level = object.speed_level;

    // Calculate speed. 
    // Distance from (0, 0) to finger coords
    let speed = Math.sqrt(x * x + y * y);

    // Set first motors speed and direction
    let motorsSpeed = { left: speed, right: speed, direction: 'forward' };

    // Set speed sign for every motor based on joystick coords
    motorsSpeed = _setMotorsDirection(x, y, motorsSpeed);

    // Limit motors speed to 100 and -100 because of Raspberry PI PWM
    motorsSpeed = _limitMotors(motorsSpeed);

    // Scale motors speed using speed_level (slow, medium, fast)
    motorsSpeed = _scaleMotorsSpeed(speed_level, motorsSpeed, max_value);

    // Recalcultate speed after all the changes. 
    // This will set speed to 0 if it's below 10 and speed to 20 if it's above 10
    // Because Raspberry PI PWM can't rotate motors at speed < 20 because of this type of motors
    motorsSpeed = _recalculateSpeed(motorsSpeed);

    // To integer
    motorsSpeed.left = parseInt(motorsSpeed.left);
    motorsSpeed.right = parseInt(motorsSpeed.right);

    return motorsSpeed;
}

function _scaleMotorsSpeed(speed_level, motorsSpeed, max_value) {
    switch (speed_level) {
        case 'slow':
            motorsSpeed.left = motorsSpeed.left / max_value * 30;
            motorsSpeed.right = motorsSpeed.right / max_value * 30;
            break;
        case 'medium':
            motorsSpeed.left = motorsSpeed.left / max_value * 65;
            motorsSpeed.right = motorsSpeed.right / max_value * 65;
            break;
        case 'fast':
            motorsSpeed.left = motorsSpeed.left / max_value * 100;
            motorsSpeed.right = motorsSpeed.right / max_value * 100;
            break;
        default:
            break;
    }

    return motorsSpeed;
}

function _setMotorsDirection(joystick_x, joystick_y, motorsSpeed) {
    let speed = Math.sqrt(joystick_x * joystick_x + joystick_y * joystick_y);

    if (joystick_y < 0) {
        // DIRECTION FORWARD

        if (joystick_x > 0) {
            // RIGHT

            motorsSpeed.right -= joystick_x;
        }
        else {
            // LEFT

            motorsSpeed.left += joystick_x;
        }
    }
    else {
        // DIRECTION BACKWARD
        motorsSpeed.left = -speed;
        motorsSpeed.right = -speed;
        motorsSpeed.direction = 'backward';

        if (joystick_x > 0) {
            // RIGHT

            motorsSpeed.right += joystick_x;
        }
        else {
            // LEFT

            motorsSpeed.left -= joystick_x;
        }
    }

    return motorsSpeed;
}

function _limitMotors(motorsSpeed) {
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

    return motorsSpeed;
}

function _recalculateSpeed(motorsSpeed) {
    if (Math.abs(motorsSpeed.left) < 10) {
        motorsSpeed.left = 0;
    }

    if (Math.abs(motorsSpeed.right) < 10) {
        motorsSpeed.right = 0;
    }

    if (motorsSpeed.left > 0) {
        if (motorsSpeed.left < 20) {
            motorsSpeed.left = 20;
        }
    }
    else {
        if (motorsSpeed.left > 20) {
            motorsSpeed.left = -20;
        }
    }

    if (motorsSpeed.right > 0) {
        if (motorsSpeed.right < 20) {
            motorsSpeed.right = 20;
        }
    }
    else {
        if (motorsSpeed.right > 20) {
            motorsSpeed.right = -20;
        }
    }

    return motorsSpeed;
}