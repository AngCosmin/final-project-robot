#!/usr/bin/env python

import ConfigParser
import websocket
import thread
import json
import sys
import cv2
import RPi.GPIO as GPIO
from imutils.video import VideoStream
from time import sleep
from time import time
from threading import Thread
from Queue import Queue
from controllers.MotorsController import MotorsController
from controllers.RelayController import RelayController
from controllers.UltrasonicController import UltrasonicController
from controllers.ServoController import ServoController
from controllers.LightsController import LightsController
from controllers.Camera import Camera

ws = None
ultrasonic_distance = 0
robot_mode = 'manual'
lights_mode = 'loading'

motors = MotorsController()
relay = RelayController()
ultrasonic = UltrasonicController()
servo = ServoController()
lights = LightsController()

def clean():
    motors.clean()
    relay.clean()
    servo.clean()
    ultrasonic.clean()
    camera.clean()
    lights.clean() 
    sleep(0.5)
    GPIO.cleanup()

def thread_calculate_ultrasonic_distance(thread_name):
    global ultrasonic_distance
    global motors

    while True:
        ultrasonic_distance = ultrasonic.measure()
        # print 'Distance is ' + ultrasonic_distance
        if ultrasonic_distance == 0:
            motors.stop();            
        sleep(0.05);

def thread_lights_changes(thread_name):
    global lights_mode

    while True:
        if lights_mode == 'ball_lost':
            lights.animation_loading(0, 255, 0)
        elif lights_mode == 'ball_found':
            print 'Animation rainbow'            
            lights.animation_rainbow()

def thread_robot_randomly_activate(thread_name):
    global robot_mode
    global servo

    while True:
        if robot_mode == 'autonomous':    
            servo.randomly_activate()


def thread_robot_autonomous(thread_name):
    global robot_mode
    global lights_mode

    try: 
        while True:
            if robot_mode == 'autonomous': 
                frame, mask, object_x, object_y = camera.compute()
                # ultrasonic.measure()
                print 'Object X: ' + str(object_x) + ' Object Y: ' + str(object_y)

                if object_x != sys.maxint and object_y != sys.maxint:
                    object_x = object_x - width / 2
                    object_y = object_y - height / 2
                    
                    lights_mode = 'ball_found'

                    # Activate motors
                    # motors.go_to_object(object_x)

                    # Activate servo
                    servo.compute(object_y)

                    # motors.lastActiveTime = time()
                    servo.lastActiveTime = time()
                # else:
                    lights_mode = 'ball_lost'
                    # motors.stop()
                    # motors.randomly_activate()

                # # show the frame
                # cv2.imshow("Frame", frame)    
                # cv2.imshow("Mask", mask)e
                
                # key = cv2.waitKey(1) & 0xFF

                # if key == ord("q"):
                #     clean()
                #     break		
            else:
                lights_mode = 'rainbow'
    except Exception:
        clean()
    
def on_open(ws):
    print 'Connection is now open!'
    ws.send(json.dumps({'event': 'connection', 'client': 'Robot'}));

def on_error(ws, error):
    print error

def on_close(ws):
    clean()
    print 'Connection is now closed!'

def on_message(ws, message):
    global robot_mode

    try:
        message = json.loads(message)
        event = message['event']
        
        if event == 'move':
            if robot_mode == 'manual':
                motorLeftSpeed = message['motorLeftSpeed']
                motorRightSpeed = message['motorRightSpeed']

                if ultrasonic_distance != None:
                    if ultrasonic_distance > 0:
                        motors.move_motors(motorLeftSpeed, motorRightSpeed)
                    else:
                        motors.stop();
                        if motorLeftSpeed < 0 and motorRightSpeed < 0:
                            motors.move_motors(motorLeftSpeed, motorRightSpeed)
                else:
                    motors.move_motors(motorLeftSpeed, motorRightSpeed)                                    
        elif event == 'turn_motors':
            if message['status'] == 'on':
                relay.start()
            else:
                relay.stop()
        elif event == 'robot_mode':
            print 'Changing mode to ' + message['mode']
            if message['mode'] == 'autonomous':
                robot_mode = 'autonomous'
            else:
                robot_mode = 'manual'
    except Exception as e:
        print e

def read_config():
    config = ConfigParser.RawConfigParser()

    try:
        config.read('./config.cfg') 

        server_ip = config.get('Websocket', 'server_ip')
        server_port = config.get('Websocket', 'server_port')

        width = config.getint('Image', 'width')
        height = config.getint('Image', 'height')

        colorLowerH = config.getint('ColorLower', 'H')
        colorLowerS = config.getint('ColorLower', 'S')
        colorLowerV = config.getint('ColorLower', 'V')

        colorUpperH = config.getint('ColorUpper', 'H')
        colorUpperS = config.getint('ColorUpper', 'S')
        colorUpperV = config.getint('ColorUpper', 'V')

        colorLower = (colorLowerH, colorLowerS, colorLowerV)
        colorUpper = (colorUpperH, colorUpperS, colorUpperV)

        return server_ip, server_port, width, height, colorLower, colorUpper
    except Exception as e:
        print e

if __name__ == "__main__":
    server_ip, server_port, width, height, colorLower, colorUpper = read_config()

    camera = Camera(colorLower, colorUpper, width)

    try:
        print 'Connecting to ' + server_ip + ':' + server_port + '...'

        thread.start_new_thread(thread_calculate_ultrasonic_distance, ('Distance', ))
        thread.start_new_thread(thread_robot_autonomous, ('Autonomous', ))        
        thread.start_new_thread(thread_lights_changes, ('Lights', ))        
        thread.start_new_thread(thread_robot_randomly_activate, ('RandomlyActivate', ))        

        websocket.enableTrace(True)
        ws = websocket.WebSocketApp('ws://' + server_ip + ':' + server_port)
        ws.on_open = on_open
        ws.on_message = on_message 
        ws.on_error = on_error 
        ws.on_close = on_close
        ws.run_forever()
    except Exception as e:
        motors.clean()
        relay.clean()
        print e