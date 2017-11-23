from time import sleep
from classes.motors import Motors

if __name__ == "__main__":
    motors = Motors()
    motors.move_left_motor(10, False)