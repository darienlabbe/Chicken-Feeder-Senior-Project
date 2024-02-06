# Imports
import board
import digitalio
import time

# Setup led access and output
#led = digitalio.DigitalInOut(board.LED)
#led.direction = digitalio.Direction.OUTPUT
pin = digitalio.DigitalInOut(board.D12)
pin.direction = digitalio.Direction.OUTPUT


# Variables for customized output
speed_of_led = 2.0
num_blinks = 8
i = 0
# Action loop
while True:
    # Output to REPL
    i = i+1
    print("Test " + str(i))
    
    pin.value = True
    time.sleep(speed_of_led)
    pin.value = False
    time.sleep(speed_of_led)