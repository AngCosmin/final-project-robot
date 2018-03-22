import ConfigParser
import pigpio
from models.Servo import Servo
from time import sleep
from time import time
from random import choice
from random import uniform
from random import randint

class ServoController:
    def __init__(self):
        config = ConfigParser.RawConfigParser()

        try:
            config.read('./config.cfg')
            pin = config.getint('Servo', 'pin_GPIO')

            self.head = Servo(pin)
            self.servoValue = 1500
            self.head.change(1500)

            # The time when he did last action
            self.lastActiveTime = 0
            self.movingTime = None
            self.direction = 1500  
            self.lastDirection = 1500
        except Exception as e:
            print e

    def change(self, value):
        self.servoValue = value
        self.head.change(value)
    
    def compute(self, object_y):
        if abs(object_y) > 10:
            oldServoValue = self.servoValue
            self.servoValue = self.servoValue + object_y * 0.75

            if self.servoValue < 1000:
                self.servoValue = 1000
            elif self.servoValue > 2000:
                self.servoValue = 2000

            if oldServoValue != self.servoValue:
                self.head.change(self.servoValue)

    def randomly_activate(self):
        if time() - self.lastActiveTime > 3:
            # He stayed for 3 seconds

            if self.movingTime == None:
                self.movingTime = time() + 2

                # Choose a random direction to move
                self.direction = randint(1000, 2000)

                while abs(self.lastDirection - self.direction) < 300:
                    self.direction = randint(100, 2000)
            else:
                if self.movingTime - time() > 0:
                    print 'Move to ' + str(self.direction)
                    self.change(self.direction)							
                    self.lastDirection = self.direction
                else:
                    self.movingTime = None
                    self.lastActiveTime = time()

    def clean(self):
        print '[PINS] Cleaning up servo pins...'
        self.head.clean()
        sleep(0.2)
    