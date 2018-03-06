#!/usr/bin/env python

import RPi.GPIO as GPIO
import sys
import tty
import termios
from time import sleep

# Motor setups
Motor1B = 35
Motor1F = 37

Motor2B = 11
Motor2F = 13

def initialize():
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(Motor1F, GPIO.OUT)
    GPIO.setup(Motor1B, GPIO.OUT)
    GPIO.setup(Motor2F, GPIO.OUT)
    GPIO.setup(Motor2B, GPIO.OUT)

def forward():
    GPIO.output(Motor1F, True)
    GPIO.output(Motor1B, False)
    GPIO.output(Motor2F, True)
    GPIO.output(Motor2B, False)

def back():
    GPIO.output(Motor1F, False)
    GPIO.output(Motor1B, True)
    GPIO.output(Motor2F, False)
    GPIO.output(Motor2B, True)

def left():
    GPIO.output(Motor1F, True)
    GPIO.output(Motor1B, False)
    GPIO.output(Motor2F, False)
    GPIO.output(Motor2B, True)

def right():
    GPIO.output(Motor1F, False)
    GPIO.output(Motor1B, True)
    GPIO.output(Motor2F, True)
    GPIO.output(Motor2B, False)

def stop():
    GPIO.output(Motor1F, False)
    GPIO.output(Motor1B, False)
    GPIO.output(Motor2F, False)
    GPIO.output(Motor2B, False)

def cleanup():
    stop()
    sleep(1)
    GPIO.cleanup()

def readchar():
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(sys.stdin.fileno())
        ch = sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    if ch == '0x03':
        raise KeyboardInterrupt
    return ch

def readkey(getchar_fn=None):
    getchar = getchar_fn or readchar
    c1 = getchar()
    if ord(c1) != 0x1b:
        return c1
    c2 = getchar()
    if ord(c2) != 0x5b:
        return c1
    c3 = getchar()
    return ord(c3) - 65  # 0=Up, 1=Down, 2=Right, 3=Left arrows

try:
    initialize()

    while True:
        keyp = readkey()
        if keyp == 'w':
            back()
            print 'Forward'
        elif keyp == 's':
            forward()
            print 'Backward'
        elif keyp == 'd':
            right()
            print 'Spin Right'
        elif keyp == 'a':
            left()
            print 'Spin Left'
        elif keyp == ' ':
            stop()
            print 'Stop'
        elif keyp == 't':
            break;
            
except KeyboardInterrupt:
    cleanup()
finally:
    cleanup()