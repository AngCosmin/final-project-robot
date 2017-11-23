import ConfigParser
# import RPi.GPIO as GPIO

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

            # Set GPIO mode
            GPIO.setmode(GPIO.BOARD)

            # Setup pins
            GPIO.setup(PIN_1_LEFT, GPIO.OUT)
            GPIO.setup(PIN_2_LEFT, GPIO.OUT)
            GPIO.setup(PIN_PWM_LEFT, GPIO.OUT)

            GPIO.setup(PIN_1_RIGHT, GPIO.OUT)
            GPIO.setup(PIN_2_RIGHT, GPIO.OUT)
            GPIO.setup(PIN_PWM_RIGHT, GPIO.OUT)

            self.PWM_left = GPIO.PWM(PIN_PWM_LEFT, 100)         
            self.PWM_right = GPIO.PWM(PIN_PWM_RIGHT, 100)
        except Exception as e:
            print e

    def move_left_motor(self, speed, forward = True):
        self.PWM_left.start(speed);

        if forward == True:
            print 'Moving forward with speed ' + str(speed) 
            GPIO.output(PIN_1_LEFT, False)
            GPIO.output(PIN_2_LEFT, True)
            GPIO.output(PIN_PWM_LEFT, True)
        else:
            print 'Moving backward with speed ' + str(speed) 
            GPIO.output(PIN_1_LEFT, True)
            GPIO.output(PIN_2_LEFT, False)
            GPIO.output(PIN_PWM_LEFT, True)            
