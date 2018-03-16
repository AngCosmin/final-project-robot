import ConfigParser
import time
import pigpio

class Servo:
    def __init__(self, pin):
        self.pin = pin
        self.pi = pigpio.pi()
        self.pi.set_mode(self.pin, pigpio.OUTPUT)

    def change(self, value):
        self.pi.set_servo_pulsewidth(self.pin, value)

    def clean(self):
        self.pi.stop()