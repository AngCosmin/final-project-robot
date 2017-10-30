import websocket
import thread
import time
import json
import sys
import tty
import termios

def on_message(ws, message):
    try:
        messageJSON = json.loads(message)
        print ("SERVER: " + messageJSON['status'] + " " + messageJSON['message'])
    except Exception as e:
        print (e)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    ws.send("Connected")
    # for i in range(0, 5):
    #     age = input("Your age? ")
    #     ws.send(str(age))
    while (True):
        command = raw_input("What do you want to do? ")
        ws.send(command)

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://localhost:3000")

    ws.on_message = on_message
    ws.on_open = on_open
    ws.on_error = on_error
    ws.on_close = on_close

    ws.run_forever()