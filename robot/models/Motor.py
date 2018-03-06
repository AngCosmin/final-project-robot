import RPi.GPIO as GPIO
from time import sleep

class Motor:
    def __init__(self, pin1, pin2, pin_pwm):
        self.pin1 = pin1
        self.pin2 = pin2
        self.pin_pwm = pin_pwm

        GPIO.setmode(GPIO.BOARD)

        GPIO.setup(self.pin1, GPIO.OUT)
        GPIO.setup(self.pin2, GPIO.OUT)
        GPIO.setup(self.pin_pwm, GPIO.OUT) 

        self.pwm = GPIO.PWM(self.pin_pwm, 100)         
        self.pwm.start(0);
    
    def move(self, speed):
        if speed == 0:
            self.stop()
        else:
            self.pwm.ChangeDutyCycle(abs(speed))

            if speed < 0:
                self.activate('backward')
            else:
                self.activate('forward')  
        
    def activate(self, direction = 'forward'):
        if direction == 'forward':
            GPIO.output(self.pin1, False)
            GPIO.output(self.pin2, True)
        elif direction == 'backward':
            GPIO.output(self.pin1, True)
            GPIO.output(self.pin2, False)
            
        GPIO.output(self.pin_pwm, True) 

    def stop(self):
        GPIO.output(self.pin1, False)
        GPIO.output(self.pin2, False)
        GPIO.output(self.pin_pwm, False)

    def clean(self):
        GPIO.output(self.pin1, False)
        GPIO.output(self.pin2, False)
        GPIO.output(self.pin_pwm, False) 