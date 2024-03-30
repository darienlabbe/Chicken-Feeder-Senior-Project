var http = require('http').createServer(handler); // Require http server, and create server with function handler()
var fs = require('fs'); // Require filesystem module
var io = require('socket.io')(http, { cors: { origin: "*" } }); // Require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; // Include onoff to interact with the GPIO
var relay = new Gpio(536, 'out'); // Use GPIO pin 24 (labeled as pin 536) as output

// Initial value for the motor
var init_val = 0;

// Create Server at index.html
function handler (req, res) { 
  fs.readFile(__dirname + '/public/index.html', function(err, data) { // Read file index.html in public folder
    // If index.html not found
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); // Display 404 on error
      return res.end("404 Not Found");
    }
    // Otherwise, write HTML
    res.writeHead(200, {'Content-Type': 'text/html'}); 
    res.write(data); // Write data from index.html
    return res.end();
  });
}

// Listen to port 8080
http.listen(8080, function() {
  // Server has initialized and is viewable
  relay.writeSync(init_val);
  console.log('Server running on port 8080');
  console.log('GPIO24 = ' + init_val);
  console.log('-----------');
});

// WebSocket Connection
io.on('connection', function (socket) {
  console.log("Connection Made");
  io.emit("user connected");
  //allowEIO3: true; // False by default
  var relayval = 0; // For status control
  
  /* Instant Controls */
  socket.on('on-button', function(data) { // Get on button status from client
    relayval = data;
    if (relayval != relay.readSync()) { // Only change if status has changed
        relay.writeSync(relayval); // Turn motor on
        io.emit("on button ", data); // Send to all clients
    }
  });

  socket.on('off-button', function(data) { // Get off button status from client
    relayval = 0;
    relay.writeSync(relayval); // Turn motor off
    io.emit("off button ", data); // Send to all clients
  });

  socket.on('checkmark', function(data) { // Get checkbox status from client
    if (data) relayval = 1;
    else relayval = 0;
    relay.writeSync(relayval); // Turn motor on or off
    io.emit("checkmark ", data); // Send to all clients
  });

  /* Time Based Controls */
  // Sleep function
  const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  // Function that utilizes sleep before turning off the motor and removing the
  // top list item
  const wait_for_motor = async (amt) => {
    var convert_amt = amt * 1000; 
    console.log("Sleep for: ", convert_amt);
    await sleep(convert_amt);
    console.log("Sleep done");
    relay.writeSync(0);
    io.emit('rm_head');
  }

  // Feeding status from client
  socket.on('feeding', function(amt, time) {
    // Check if there was a time submitted
    if (time) {
      // Send to all clients
      io.emit('feeding', `Feed for ${amt} seconds at ${time}`);

      // Control the relay
      let d = new Date(); // Get current date
      let h = (d.getHours()<10?'0':'') + d.getHours(); // get current hour
      let m = (d.getMinutes()<10?'0':'') + d.getMinutes(); // get current minute
      let time_now = h + ':' + m; // The current time
      console.log("Time now: ", time_now);
      console.log("Specified time: ", time);
      
      // Wait until time for the current feeding
      while (time != time_now) {
        // Continue to update the time for the loop
        d = new Date();
        h = (d.getHours()<10?'0':'') + d.getHours();
        m = (d.getMinutes()<10?'0':'') + d.getMinutes();
        time_now = h + ':' + m;
      }

      // Turn on relay and then use wait function to turn it off
      relay.writeSync(1);
      wait_for_motor(amt);
    } 
    else {
      // Send to all clients
      io.emit('feeding', `Feed for ${amt} seconds now`);
      
      // Turn on relay and then use wait function to turn it off
      relay.writeSync(1);
      wait_for_motor(amt);
    } 
  });
});

process.on('SIGINT', function () { // On ctrl+c
  relay.writeSync(0); // Turn relay off
  relay.unexport(); // Unexport relay GPIO to free resources
  process.exit(); // Exit completely
});