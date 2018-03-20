#!/usr/bin/env python

import time
import datetime
import math

from neopixel import *

LED_COUNT = 16      # Number of LED pixels.
LED_PIN = 13      # GPIO pin connected to the pixels (must support PWM!).
LED_FREQ_HZ = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA = 10       # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 100  # Set to 0 for darkest and 255 for brightest
LED_INVERT = False
LED_CHANNEL = 1 # set to '1' for GPIOs 13, 19, 41, 45, 53

strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)

def loading(color):
    while True:
        for i in range(0, strip.numPixels(), 1):
            for j in range(0, strip.numPixels(), 1):
                strip.setPixelColor(j, Color(0, 0, 0))

            if i == 0:
                strip.setPixelColor(16, Color(100, 0, 0))            
                strip.setPixelColor(15, Color(25, 0, 0))            
            else:
                strip.setPixelColor(i - 1, Color(100, 0, 0))
                strip.setPixelColor(i - 2, Color(25, 0, 0))
                
            strip.setPixelColor(i, Color(255, 0, 0))
            strip.show()        
            time.sleep(0.05)

def pulse(color):
    for j in range(0, strip.numPixels(), 1):
        strip.setPixelColor(j, color)
        strip.show()    

    while True:
        for i in range(0, 255, 1):
            strip.setBrightness(i)    
            strip.show()

        for i in range(255, 0, -1):
            strip.setBrightness(i)    
            strip.show()

def wheel(pos):
    """Generate rainbow colors across 0-255 positions."""
    if pos < 85:
        return Color(pos * 3, 255 - pos * 3, 0)
    elif pos < 170:
        pos -= 85
        return Color(255 - pos * 3, 0, pos * 3)
    else:
        pos -= 170
        return Color(0, pos * 3, 255 - pos * 3)

def rainbow_cycle(wait_ms=20, iterations=5):
    for j in range(256*iterations):
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, wheel((int(i * 256 / strip.numPixels()) + j) & 255))
        strip.show()
        time.sleep(wait_ms/1000.0)

if __name__ == '__main__':
    strip.begin()

    try:
        rainbow_cycle()
        # loading()
        pulse(Color(255, 100, 100))
    except KeyboardInterrupt:
        time.sleep(0.5)
        for j in range(0, strip.numPixels(), 1):
            strip.setPixelColor(j, Color(0, 0, 0))
            time.sleep(0.05)            
            strip.show()
