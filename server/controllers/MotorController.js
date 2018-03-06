const WebSocket = require('ws');
const Motor = require('../models/Motor');

class MotorController {
    constructor(socket) {
        this.left = new Motor();
        this.right = new Motor();
    }

    setupNewConnection(socket) {
        this.robot = socket;
    }

    calculateSpeed(joystick_x, joystick_y) {
        let speed = Math.sqrt(joystick_x * joystick_x + joystick_y * joystick_y);

        if (joystick_y < 0) {
            // DIRECTION FORWARD

            this.left.speed = speed;
            this.right.speed = speed;
    
            if (joystick_x > 0) {
                this.right.speed -= joystick_x; // RIGHT
            }
            else {
                this.left.speed += joystick_x; // LEFT
            }
        }
        else {
            // DIRECTION BACKWARD
            
            this.left.speed = -speed;
            this.right.speed = -speed;

            if (joystick_x > 0) {
                this.right.speed += joystick_x; // RIGHT
            }
            else {
                this.left.speed -= joystick_x; // LEFT
            }
        }

        // Limit motors to 100
        this.left.speed = this.left.speed > 100 ? 100 : this.left.speed;
        this.left.speed = this.left.speed < -100 ? -100 : this.left.speed;
        this.right.speed = this.right.speed > 100 ? 100 : this.right.speed;
        this.right.speed = this.right.speed < -100 ? -100 : this.right.speed;

        // Adjust motors speed (min speed = 15)
        this.left.speed = this.left.speed > -15 && this.left.speed < -5 ? -15 : this.left.speed;
        this.left.speed = this.left.speed > -5 && this.left.speed < 5 ? 0 : this.left.speed;
        this.left.speed = this.left.speed > 5 && this.left.speed < 15 ? 15 : this.left.speed;

        this.right.speed = this.right.speed > -15 && this.right.speed < -5 ? -15 : this.right.speed;
        this.right.speed = this.right.speed > -5 && this.right.speed < 5 ? 0 : this.right.speed;
        this.right.speed = this.right.speed > 5 && this.right.speed < 15 ? 15 : this.right.speed;

        // Parse integer
        this.left.speed = parseInt(this.left.speed);
        this.right.speed = parseInt(this.right.speed);
    }

    sendSpeed() {
        if (this.robot != null && this.robot.readyState == WebSocket.OPEN) {
            this.robot.send(JSON.stringify({
                'event': 'move',
                'motorLeftSpeed': this.left.speed,
                'motorRightSpeed': this.right.speed,
            }));
        }
        else {
            console.log('Robot not connected to the server!');
        }
    }

    calculateAndSendSpeed(joystick_x, joystick_y) {
        this.calculateSpeed(joystick_x, joystick_y);
        this.sendSpeed();
    }

    changeStatus(status) {
        if (this.robot != null && this.robot.readyState == WebSocket.OPEN) {
            this.robot.send(JSON.stringify({ 'event': 'turn_motors', 'status': status }));
        }
        else {
            console.log('Robot not connected to the server!');
        }
    }
}

module.exports = MotorController;