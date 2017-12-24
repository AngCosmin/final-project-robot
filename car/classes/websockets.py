import ConfigParser
import websocket
import thread
import json
from motors import Motors

class Websockets:
    ws = None

    def __init__(self):
        config = ConfigParser.RawConfigParser()

        self.motors = Motors()

        try:
            config.read('./config.cfg')

            server_ip = config.get('Websocket', 'server_ip')
            server_port = config.get('Websocket', 'server_port')

            print 'Connecting to ' + server_ip + ':' + server_port + '...'

            websocket.enableTrace(True)
            ws = websocket.WebSocketApp('ws://' + server_ip + ':' + server_port)

            ws.on_open = self.on_open
            ws.on_message = self.on_message
            ws.on_error = self.on_error
            ws.on_close = self.on_close

            ws.run_forever()
        except Exception as e:
            print e

    def on_open(self, ws):
        print 'Connection is now open!'
        ws.send(json.dumps({'event': 'connection', 'client': 'Car'}));

    def on_error(self, ws, error):
        print error

    def on_close(self, ws):
        self.motors.cleanup_pins()
        print 'Connection is now closed!'

    def on_message(self, ws, message):
        try:
            message = json.loads(message)
            event = message['event'];
            
            if event == 'move':
                motorLeftSpeed = message['motorLeftSpeed']
                motorRightSpeed = message['motorRightSpeed']

                self.motors.move_motors(motorLeftSpeed, motorRightSpeed);
            elif event == 'turn_motors':
                self.motors.toggleMotors(message['status'])
        except Exception as e:
            print e


