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

	GPIO.output(36, False)
	GPIO.output(38, False)
	GPIO.output(40, False)

	GPIO.output(16, False)
	GPIO.output(18, False)
	GPIO.output(12, False)

	pwm_motor_1.ChangeDutyCycle(50);
	pwm_motor_2.ChangeDutyCycle(50);

	GPIO.output(36, False)
	GPIO.output(38, True)
	GPIO.output(40, True)

	GPIO.output(16, False)
	GPIO.output(18, True)
	GPIO.output(12, True)
	
	time.sleep(tf)
	GPIO.cleanup();

print 'forward'
forward(1)