import ConfigParser
import websocket
import thread
import json
from time import sleep
from threading import Thread
from Queue import Queue
from controllers.MotorsController import MotorsController
from controllers.RelayController import RelayController
from controllers.UltrasonicController import UltrasonicController

ws = None
ultrasonic_distance = 0

motors = MotorsController()
relay = RelayController()
ultrasonic = UltrasonicController()

def thread_calculate_ultrasonic_distance(thread_name):
    global ultrasonic_distance
    global motors

    while True:
        ultrasonic_distance = ultrasonic.measure()
        if ultrasonic_distance == 0:
            motors.stop();            
        sleep(0.5);

def on_open(ws):
    print 'Connection is now open!'
    ws.send(json.dumps({'event': 'connection', 'client': 'Robot'}));

def on_error(ws, error):
    print error

def on_close(ws):
    motors.clean();
    print 'Connection is now closed!'

def on_message(ws, message):
    try:
        message = json.loads(message)
        event = message['event']
        
        if event == 'move':
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
    except Exception as e:
        print e

if __name__ == "__main__":
    config = ConfigParser.RawConfigParser()

    try:
        config.read('./config.cfg')

        server_ip = config.get('Websocket', 'server_ip')
        server_port = config.get('Websocket', 'server_port')

        print 'Connecting to ' + server_ip + ':' + server_port + '...'

        thread.start_new_thread(thread_calculate_ultrasonic_distance, ('Thread-1', ))

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
        sleep(1)
        print e