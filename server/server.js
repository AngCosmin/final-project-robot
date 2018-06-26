const WebSocket = require('ws');
const electron = require('electron');
const ip = require("ip");
const os = require('os');

const MobileApp = require('./controllers/MobileApp');
const RobotApp = require('./controllers/RobotApp');
const MotorsController = require('./controllers/MotorController');
const UI = require('./UI');

const wss = new WebSocket.Server({ port: 3000 });
const { app } = electron;

let ui = null;
let mobileApp = new MobileApp();
let robotApp = new RobotApp();
let motors = new MotorsController();

app.on('ready', function () {
    ui = new UI();

    // Send ping to mobile app to check if it is still on
    setInterval(() => {
        ui.sendToView('server-ip', ip.address());    
        
        let isMobileAppConnected = mobileApp.checkConnection();
        let isRobotConnected = robotApp.checkConnection();

        if (!isMobileAppConnected) {
            ui.sendToView('mobile-app:status', 'Not connected');
        }

        if (!isRobotConnected) {
            ui.sendToView('robot-app:status', 'Not connected');
        }
    }, 1000);
});0

wss.on('connection', function (socket) {        
    socket.on('message', function (object) {
        object = JSON.parse(object);
        console.log(object);

        let event = object.event;
        
        switch (event) {
            case 'connection':
                let client = object.client;

                if (client === 'Mobile application') {
                    mobileApp.setupNewConnection(socket);
                    ui.sendToView('mobile-app:status', 'Connected');
                }
                else if (client === 'Robot') {
                    robotApp.setupNewConnection(socket);
                    ui.sendToView('robot-app:status', 'Connected');
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
            case 'pong-robot':
                robotApp.setPongReceivedTimestamp(object.timestamp);
                break;
        }
    });
});