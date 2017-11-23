import websocket
import thread
from time import sleep
import json
import sys
import tty
import termios
# import RPi.GPIO as GPIO

def on_message(ws, _object):
    try:
        _object = json.loads(_object)
        _event = _object['event'];
        
        if _event == 'move':
            print ('Move ' + _object['direction']) 
            direction = _object['direction']

            # if direction == 'forward':
            #     GPIO.output(35, True)
            #     GPIO.output(37, False)
            # elif direction == 'backward':
            #     GPIO.output(35, False)
            #     GPIO.output(37, True)
        if _event == 'curve':
            angle = _object['angle']

            print ('Curve angle ' + angle)
        if _event == 'stop':
            print ('Stop')

            # GPIO.output(35, False)
            # GPIO.output(37, False)
    except Exception as e:
        print (e)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### Stopping... ###")
    # GPIO.output(35, False)
    # GPIO.output(37, False)
    sleep(1)
    # GPIO.cleanup()
    print("### Stopped ###")    

def on_open(ws):
    ws.send(json.dumps({'event': 'connection', 'client': 'Car'}));

if __name__ == "__main__":
    # GPIO.setmode(GPIO.BOARD)
    # GPIO.setup(35, GPIO.OUT)
    # GPIO.setup(37, GPIO.OUT)

    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://192.168.43.139:3000")

    ws.on_message = on_message
    ws.on_open = on_open
    ws.on_error = on_error
    ws.on_close = on_close

    ws.run_forever()
