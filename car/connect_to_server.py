import websocket
import thread
import time
import json
import sys
import tty
import termios

def readchar():
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(sys.stdin.fileno())
        ch = sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    if ch == '0x03':
        raise KeyboardInterrupt
    return ch

def readkey(getchar_fn=None):
    getchar = getchar_fn or readchar
    c1 = getchar()
    if ord(c1) != 0x1b:
        return c1
    c2 = getchar()
    if ord(c2) != 0x5b:
        return c1
    c3 = getchar()
    return ord(c3) - 65  # 0=Up, 1=Down, 2=Right, 3=Left arrows

def on_message(ws, message):
    try:
        messageJSON = json.loads(message)
        print("Server said: " + messageJSON['status'])
    except Exception as e:
        print (e)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    ws.send("Hello")

    while True:
        keyp = readkey()
        if keyp == 'w':
            ws.send('Forward')
        elif keyp == 's':
            ws.send('Backward')

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://localhost:3000")

    ws.on_message = on_message
    ws.on_open = on_open
    ws.on_error = on_error
    ws.on_close = on_close

    ws.run_forever()