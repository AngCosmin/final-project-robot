import ConfigParser
import RPi.GPIO as GPIO
from models.Motor import Motor
from time import sleep
from time import time
from random import choice
from random import uniform
from random import randint

class MotorsController:
    def __init__(self):
        config = ConfigParser.RawConfigParser()

        try:
            config.read('./config.cfg')

            PIN_1_LEFT = config.getint('MotorLeft', 'pin_1') 
            PIN_2_LEFT = config.getint('MotorLeft', 'pin_2')
            PIN_PWM_LEFT = config.getint('MotorLeft', 'pin_pwm')

            PIN_1_RIGHT = config.getint('MotorRight', 'pin_1')
            PIN_2_RIGHT = config.getint('MotorRight', 'pin_2')
            PIN_PWM_RIGHT = config.getint('MotorRight', 'pin_pwm')

            # Get width of the image for function go_to_object
            # self.image_width = config.getint('Image', 'width')            
            
            self.left = Motor(PIN_1_LEFT, PIN_2_LEFT, PIN_PWM_LEFT)
            self.right = Motor(PIN_1_RIGHT, PIN_2_RIGHT, PIN_PWM_RIGHT)  

            # The time when he did last action
            self.lastActiveTime = time()
            self.movingTime = None
            self.direction = None       
        except Exception as e:
            print e

    def stop(self):
        self.left.stop()
        self.right.stop()

    def move_motors(self, left_speed, right_speed):
        self.left.move(left_speed)
        self.right.move(right_speed)   

    def go_to_object(self, object_x):
        if object_x > 15:
        	# Object on the right side of the image

        	object_position_percentage = object_x / (self.image_width / 2) * 100

        	if object_position_percentage <= 50:
        		if object_position_percentage < 10:
        			object_position_percentage = 10

        		self.move_motors(object_position_percentage * 2, 0)	
        	else:
        		if object_position_percentage - 50 < 10:
        			object_position_percentage = 50 + 10

        		self.move_motors(100, -(object_position_percentage - 50) * 2)	
        elif object_x < -15:
            # Object on the left side of the image

        	object_position_percentage = -object_x / (self.image_width / 2) * 100

        	if object_position_percentage <= 50:
        		if object_position_percentage < 10:
        			object_position_percentage = 10

        		self.move_motors(0, object_position_percentage * 2)	
        	else:
        		if object_position_percentage - 50 < 10:
        			object_position_percentage = 50 + 10
                    
        		self.move_motors(-(object_position_percentage - 50) * 2, 100)
        else:
        	self.move_motors(100, 100)   

    def randomly_activate(self):
        if time() - self.lastActiveTime > 10:
            # He stayed for 10 seconds

            if self.movingTime == None:
                # How much time to move ( 2 sec )
                self.movingTime = time() + uniform(1, 3)
                
                # Choose a random direction to move
                self.direction = choice(['left', 'right'])
            else:
                if self.movingTime - time() > 0:
                    if self.direction == 'left':
                        self.move_motors(-randint(30, 100), randint(30, 100))
                    else:
                        self.move_motors(randint(30, 100), -randint(30, 100))							
                else:
                    self.movingTime = None
                    self.lastActiveTime = time()
        else:
            self.stop()

    def clean(self):
        print '[PINS] Cleaning up motors pins...'
        self.left.clean()
        self.right.clean()
        sleep(0.5)