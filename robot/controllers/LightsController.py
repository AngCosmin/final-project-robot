import ConfigParser
from neopixel import *
from time import sleep

class LightsController:
    def __init__(self):
        config = ConfigParser.RawConfigParser()

        try:
            config.read('./config.cfg')
            
            LED_COUNT = config.getint('Lights', 'LED_COUNT')            # Number of LED pixels
            LED_PIN = config.getint('Lights', 'LED_PIN')                # GPIO pin connected to the pixels (Must support PWM)
            LED_FREQ_HZ = 800000                                        # LED signal frequency in hertz (usually 800khz)
            LED_DMA = 10                                                # DMA channel to use for generating signal (try 10)
            LED_BRIGHTNESS = config.getint('Lights', 'LED_BRIGHTNESS')  # Set to 0 for darkest and 255 for brightest
            LED_INVERT = False
            LED_CHANNEL = config.getint('Lights', 'LED_CHANNEL')        # Set to '1' for GPIOs 13, 19, 41, 45, 53 

            self.strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
            self.strip.begin()
        except Exception as e:
            print e  

    def wheel(self, pos):
        if pos < 85:
            return Color(pos * 3, 255 - pos * 3, 0)
        elif pos < 170:
            pos -= 85
            return Color(255 - pos * 3, 0, pos * 3)
        else:
            pos -= 170
            return Color(0, pos * 3, 255 - pos * 3)

    def animation_rainbow(self, wait_ms=5):
        for j in range(256):
            for i in range(self.strip.numPixels()):
                self.strip.setPixelColor(i, self.wheel((int(i * 256 / self.strip.numPixels()) + j) & 255))
            self.strip.show()
            sleep(wait_ms/1000.0)

    def animation_loading_green(self):
        for i in range(0, self.strip.numPixels(), 1):
            for j in range(0, self.strip.numPixels(), 1):
                self.strip.setPixelColor(j, Color(0, 0, 0))

            if i - 1 == -1:
                self.strip.setPixelColor(15, Color(125, 0, 0))
            elif i - 1 == -2:
                self.strip.setPixelColor(14, Color(75, 0, 0))                
            elif i - 1 == -3:
                self.strip.setPixelColor(14, Color(20, 0, 0))                

            self.strip.setPixelColor(i, Color(255, 0, 0))
            self.strip.show()  
            sleep(0.05)   

    def animation_loading_blue(self):
        for i in range(0, self.strip.numPixels(), 1):
            for j in range(0, self.strip.numPixels(), 1):
                self.strip.setPixelColor(j, Color(0, 0, 0))

            if i - 1 == -1:
                self.strip.setPixelColor(15, Color(0, 125, 0))
            elif i - 1 == -2:
                self.strip.setPixelColor(14, Color(0, 75, 0))                
            elif i - 1 == -3:
                self.strip.setPixelColor(14, Color(0, 20, 0))                

            self.strip.setPixelColor(i, Color(0, 255, 0))
            self.strip.show()  
            sleep(0.05)     

    def clean(self):
        print 'Cleaning up LEDs...'        
        
        for j in range(0, self.strip.numPixels(), 1):
            self.strip.setPixelColor(j, Color(0, 0, 0))
            sleep(0.05)            
            self.strip.show()  