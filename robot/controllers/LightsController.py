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

            print 'COUNT ' + str(LED_COUNT)
            print 'PIN ' + str(LED_PIN)
            print 'FREQ ' + str(LED_FREQ_HZ)
            print 'DMA ' + str(LED_DMA)
            print 'BRIGHTNESS ' + str(LED_BRIGHTNESS)
            print 'INVERT ' + str(LED_INVERT)
            print 'CHANNEL ' + str(LED_CHANNEL)

            self.strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
        except Exception as e:
            print e  

    def animation_loading(self):
        # print 'In animation loading'
        # for i in range(0, self.strip.numPixels(), 1):
        #     for j in range(0, self.strip.numPixels(), 1):
        #         self.strip.setPixelColor(j, Color(0, 0, 0))

        #     if i == 0:
        #         self.strip.setPixelColor(16, Color(100, 0, 0))            
        #         self.strip.setPixelColor(15, Color(25, 0, 0))            
        #     else:
        #         self.strip.setPixelColor(i - 1, Color(100, 0, 0))
        #         self.strip.setPixelColor(i - 2, Color(25, 0, 0))
                
        #     self.strip.setPixelColor(i, Color(255, 0, 0))
        #     self.strip.show()        
        #     sleep(0.05)

    def clean(self):
        print 'Cleaning up LEDs...'        
        
        sleep(0.5)
        for j in range(0, self.strip.numPixels(), 1):
            self.strip.setPixelColor(j, Color(0, 0, 0))
            sleep(0.05)            
            self.strip.show()  
        sleep(0.5)