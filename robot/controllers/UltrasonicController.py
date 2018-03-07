import ConfigParser
from models.Ultrasonic import Ultrasonic
from time import sleep

class UltrasonicController:
    def __init__(self):
        config = ConfigParser.RawConfigParser()

        try:
            config.read('./config.cfg')
            echo_pin = config.getint('SensorFront', 'echo')
            trig_pin = config.getint('SensorFront', 'trig')

            self.front = Ultrasonic(echo_pin, trig_pin)
        except Exception as e:
            print e  

    def measure(self):
        distance = self.front.measure()

        if distance < 1.5:
            return None
        if distance < 6:
            distance = 0
        if distance > 25:
            distance = 25

        print 'Distance: ' + str(distance)
        return distance

    def clean(self):
        print '[PINS] Cleaning up ultrasonic pins...'        
        self.front.clean()  
        sleep(0.5)