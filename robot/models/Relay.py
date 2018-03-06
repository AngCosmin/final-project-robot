import RPi.GPIO as GPIO

class Relay:
    def __init__(self, pin):
        self.pin = pin
        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(self.pin, GPIO.OUT)
        
    def turn_on(self):
        GPIO.output(self.pin, GPIO.LOW)

    def turn_off(self):
        GPIO.output(self.pin, GPIO.HIGH)       