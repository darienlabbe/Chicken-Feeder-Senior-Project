# RP2040
As an introduction to the project, my advisor and I thought it best to start slow. So, rather than start with the raspberry pi 4B, I began this project with the Feather RP2040. It is a very small and simple chip and is able to help me figure out the basics before I start tackling the much more complicated and powerful raspberry pi. To prep the chip I had to learn how to soldier the header pins in order to connect it to a bread board so that I could easily make secure connections to the RP2040. In this directory, you can find the code that I used on the RP2040 to switch a relay open and closed. 

### Configuration
The current configuration to match this code exactly is that all of the availble connections had a header pin soldiered to it, and then the entire board was placed on a bread board. A connection from the 5V power output and the ground pin was connected to the relay in order to power the inductor inside. A connection to GPIO pin 12 was added in order to tell the relay to switch open or closed; this connection is of course relatively arbitrary and any of the other gpio pins on this board could have been used.