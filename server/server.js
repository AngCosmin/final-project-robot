const WebSocket = require('ws');
const electron = require('electron');
const ip = require("ip");
const os = require('os');

const MobileApp = require('./MobileApp');
const MotorsController = require('./controllers/MotorController');
const UI = require('./UI');

const wss = new WebSocket.Server({ port: 3000 });
const { app } = electron;

let ui = null;
let mobileApp = new MobileApp();
let motors = new MotorsController();

app.on('ready', function () {
    ui = new UI();
});

wss.on('connection', function (socket) {        
    socket.on('message', function (object) {
        object = JSON.parse(object);
        // console.log(object);

        let event = object.event;
        
        switch (event) {
            case 'connection':
                let client = object.client;

                if (client === 'Mobile application') {
                    mobileApp.setupNewConnection(socket);
                    ui.sendToView('mobile-app:status', 'Connected');
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