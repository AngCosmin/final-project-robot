import ConfigParser
from models.Relay import Relay
from time import sleep

class RelayController:
    def __init__(self):
        config = ConfigParser.RawConfigParser()

        try:
            config.read('./config.cfg')
            pin = config.getint('Relay', 'pin')

            self.relay = Relay(pin)
        except Exception as e:
            print e  

    def start(self):
        self.relay.turn_on()
    
    def stop(self):
        self.relay.turn_off()

    def clean(self):
        print '[PINS] Cleaning up relay pins...'        
        self.relay.turn_off()   
        sleep(0.5)