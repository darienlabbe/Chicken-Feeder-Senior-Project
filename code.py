# Code: Python Code for RP2040 GPIO Control
# Author: Darien L
# Date: 03/28/2024
# Description: This code can be used in a RP2040 chip to control a relay to 
#   switch on and off. The code currently utilizes GPIO pin 12 for control, 
#   however, this can be changed. The relay is a simple relay that requires a
#   5V and ground connection to power the inductor and a GPIO pin for switching
#   on or off. 

# Imports
import board        # For GPIO control
import digitalio    # For giving variables access to GPIO pins
import time         # For timing how long a switch will remain open or closed

# Setup pin access and set the pin to be an output signal (as opposed to input)
# If desired, change D12 to any other pin (ex. D13 for pin 13)
pin = digitalio.DigitalInOut(board.D12)     
pin.direction = digitalio.Direction.OUTPUT

# Variables for customized output
time_on = 4.0   # How many seconds the relay remains open
time_off = 2.0  # How many seconds the relay remains closed
num_rpts = 8    # Number of loops for the relay to turn on and then off

# Action loop
for i in range(num_rpts):
    # Output to REPL
    print("Test " + str(i))
    
    # Turn relay on and then wait. Then turn pin off and wait
    pin.value = True
    time.sleep(time_on)
    pin.value = False
    time.sleep(time_off)
