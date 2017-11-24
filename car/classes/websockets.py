import ConfigParser
import websocket
import thread
import json

class Websockets:
    ws = None

    def __init__(self):
        config = ConfigParser.RawConfigParser()

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
        print 'Connection is now closed!'

    def on_message(self, ws, message):
        try:
            message = json.loads(message)
            event = message['event'];
            
            if event == 'move':
                print ('Move ' + message['direction']) 
                direction = message['direction']

                # if direction == 'forward':
                #     GPIO.output(35, True)
                #     GPIO.output(37, False)
                # elif direction == 'backward':
                #     GPIO.output(35, False)
                #     GPIO.output(37, True)
            if event == 'curve':
                angle = _object['angle']

                print ('Curve angle ' + angle)
            if event == 'stop':
                print ('Stop')

                # GPIO.output(35, False)
                # GPIO.output(37, False)
        except Exception as e:
            print e


