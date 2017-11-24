import ConfigParser
# import RPi.GPIO as GPIO
import time

class Motors:
    def __init__(self):
        # Get motors pins from config file
        config = ConfigParser.RawConfigParser()

        try:
            config.read('./config.cfg')

            self.PIN_1_LEFT = config.getint('MotorLeft', 'pin_1') 
            self.PIN_2_LEFT = config.getint('MotorLeft', 'pin_2')
            self.PIN_PWM_LEFT = config.getint('MotorLeft', 'pin_pwm')

            self.PIN_1_RIGHT = config.getint('MotorRight', 'pin_1')
            self.PIN_2_RIGHT = config.getint('MotorRight', 'pin_2')
            self.PIN_PWM_RIGHT = config.getint('MotorRight', 'pin_pwm')

            # # Set GPIO mode
            # GPIO.setmode(GPIO.BOARD)

            # # Setup pins
            # GPIO.setup(self.PIN_1_LEFT, GPIO.OUT)
            # GPIO.setup(self.PIN_2_LEFT, GPIO.OUT)
            # GPIO.setup(self.PIN_PWM_LEFT, GPIO.OUT)

            # GPIO.setup(self.PIN_1_RIGHT, GPIO.OUT)
            # GPIO.setup(self.PIN_2_RIGHT, GPIO.OUT)
            # GPIO.setup(self.PIN_PWM_RIGHT, GPIO.OUT)

            # self.PWM_left = GPIO.PWM(self.PIN_PWM_LEFT, 100)         
            # self.PWM_right = GPIO.PWM(self.PIN_PWM_RIGHT, 100)

            # self.PWM_left.start(0);
            # self.PWM_right.start(0);            
        except Exception as e:
            print e

    def move_left_motor(self, speed, forward = True):
        print 'Moving motor left with speed ' + str(speed)  
        # if forward == True:
        #     GPIO.output(self.PIN_1_LEFT, True)
        #     GPIO.output(self.PIN_2_LEFT, False)
        #     GPIO.output(self.PIN_PWM_LEFT, True) 
        # else:
        #     GPIO.output(self.PIN_1_LEFT, False)
        #     GPIO.output(self.PIN_2_LEFT, True)
        #     GPIO.output(self.PIN_PWM_LEFT, True)

    def move_right_motor(self, speed, forward = True):
        print 'Moving motor right with speed ' + str(speed)
        # if forward == True:
        #     GPIO.output(self.PIN_1_RIGHT, True)
        #     GPIO.output(self.PIN_2_RIGHT, False)
        #     GPIO.output(self.PIN_PWM_RIGHT, True) 
        # else:
        #     GPIO.output(self.PIN_1_RIGHT, False)
        #     GPIO.output(self.PIN_2_RIGHT, True)
        #     GPIO.output(self.PIN_PWM_RIGHT, True)
