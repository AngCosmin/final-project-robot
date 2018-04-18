const WebSocket = require('ws');
const ip = require("ip");
const os = require('os');

const MobileApp = require('./MobileApp');
const MotorsController = require('./controllers/MotorController');

const wss = new WebSocket.Server({ port: 3000 });

let mobileApp = new MobileApp();
let motors = new MotorsController();

setInterval(() => {
    let isMobileAppConnected = mobileApp.checkConnection();

    if (!isMobileAppConnected) {
        console.log('Mobile app not connected');
    }
}, 1000);

wss.on('connection', function (socket) {        
    socket.on('message', function (object) {
        object = JSON.parse(object);
        console.log(object);

        let event = object.event;
        
        switch (event) {
            case 'connection':
                let client = object.client;

                if (client === 'Mobile application') {
                    console.log('Mobile app connected');
                    mobileApp.setupNewConnection(socket);
                }
                else if (client === 'Robot') {
                    console.log('Robot is now connected');
                    motors.setupNewConnection(socket);
                }
                break;
            case 'move':
                motors.calculateAndSendSpeed(object.joystick_x, object.joystick_y);
                break;
            case 'turn_motors':
                motors.changeStatus(object.status);
                break;
            case 'change_mode':
                motors.changeMode(object.mode);
                break;
            case 'pong':
                mobileApp.setPongReceivedTimestamp(object.timestamp);
                break;
        }
    });
});