import ConfigParser

config = ConfigParser.RawConfigParser()

config.add_section('General')
config.set('General', 'motor_1_pin_1', '15')
config.set('General', 'motor_1_pin_2', '21')
config.set('General', 'motor_2_pin_1', '12')
config.set('General', 'motor_2_pin_2', '10')

# Writing our configuration file to 'example.cfg'
with open('example.cfg', 'wb') as configfile:
    config.write(configfile)