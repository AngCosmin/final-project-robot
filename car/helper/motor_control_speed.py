import time
import RPi.GPIO as GPIO

def forward(tf):
	GPIO.setmode(GPIO.BOARD)

	GPIO.setup(36, GPIO.OUT)
	GPIO.setup(38, GPIO.OUT)

	GPIO.setup(16, GPIO.OUT)
	GPIO.setup(18, GPIO.OUT)
	
	GPIO.setup(12, GPIO.OUT)
	GPIO.setup(40, GPIO.OUT)

	pwm_motor_1 = GPIO.PWM(12, 100)	
	pwm_motor_2 = GPIO.PWM(40, 100)	

	pwm_motor_1.start(20)
	pwm_motor_2.start(20)

	GPIO.output(36, False)
	GPIO.output(38, True)
	GPIO.output(40, True)

	GPIO.output(16, False)
	GPIO.output(18, True)
	GPIO.output(12, True)

	time.sleep(tf)

	# pwm.ChangeDutyCycle(30);
	# GPIO.output(11, False)
	# GPIO.output(13, True)
	# GPIO.output(7, True)
	# time.sleep(tf)
	GPIO.cleanup();

def reverse(tf):
	init()
	GPIO.output(11, True)
	GPIO.output(13, False)
	time.sleep(tf)
	GPIO.cleanup()

print 'forward'
forward(1)
# print 'backward'
# reverse(3)