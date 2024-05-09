import { Server } from "socket.io";
import { createServer } from "http";
import mysql from "mysql2";
import dotenv from 'dotenv';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as onoff from "onoff";
dotenv.config();

// For converting timezone
dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault("America/Los_Angeles");

// For Gpio control
const Gpio = onoff.Gpio;
var relay = new Gpio(536, 'out'); // Use GPIO pin 24 (labeled as pin 536) as output

// For watching for updates to the occurence json file
const json_file = fileURLToPath(import.meta.url);
const json_dir = path.dirname(json_file);
const occur_path = path.join(json_dir, "../src/components/occurrence-list.json");
var occur_list;

// Create an instance of the http server to handle HTTP requests
const httpServer = createServer((req, res) => {
    // Set a response type of plain text for the response
    res.writeHead(200, {'Content-Type': 'text/plain'});

    // Ensure the relay is off as an initial value for when the app first starts
    relay.writeSync(0);
    
    // Send back a response and end the connection 
    con.connect((err) => {
        if (err) throw err;
        res.end('Connected!');
    }); 
});

const io = new Server(httpServer, { cors: { origin: "*" }});

// Connect to database
const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

// Function to add a record to the events table 
async function createEvent(recure_interval, st_day, st_time, end_day, amt_feed) {
    // Add a new record to the event table
    const [result] = await db.query(`
        INSERT INTO events (recure_interval, st_day, st_time, end_day, amt_feed)
        VALUES (?, ?, ?, ?, ?)
        `, [recure_interval, st_day, st_time, end_day, amt_feed]);

    // Call to set the list of events file
    await updateEventList();

    return result;
}

// Function to add a record to the occurrences table
async function createOccurrence(id, run_date, run_time, amt_feed) {
    // Add a new record to the occurrences table
    const [result] = await db.query(`
        Insert INTO occurrences (id, run_date, run_time, amt_feed) 
        values (?, ?, ?, ?)
        `, [id, run_date, run_time, amt_feed]);
    return result;
}

// Function for updating the list of events
async function updateEventList () {
    // Get all of the records from the events table and turn it into json
    const [result] = await db.query(`SELECT * FROM events`);
    const new_result = JSON.stringify(result, null, 4); 

    fs.writeFile("../src/components/event-list.json", new_result, 'utf8', function (err) {
        if (err) return console.log(err);
    });

    return new_result;
}

// Function for updating the list of events
async function updateOccurList () {
    // Get all of the records from the occurrences table and turn it into json
    const [result] = await db.query(`SELECT * FROM occurrences`);
    const new_result = JSON.stringify(result, null, 4); 

    fs.writeFile("../src/components/occurrence-list.json", new_result, 'utf8', function (err) {
        if (err) return console.log(err);
    });

    return new_result;
}

// Function for deleting an event and corresponding occurrences
async function deleteEvent (id) {
    const [result] = await db.query(`
    DELETE events FROM events INNER JOIN occurrences on events.id = occurrences.id WHERE events.id = ?`
    , [id]);

    // Call to set the list of events and occurrences files
    await updateEventList();
    await updateOccurList();

    return result;
}

// Import the JSON file
async function importOccurList() {
    const json_str = await fs.promises.readFile(occur_path, 'utf-8');
    occur_list = JSON.parse(json_str);
    await checkForOccur();
}

// Watch for updates to the JSON file to ensure data is up to date 
fs.watch(occur_path, () => {
    console.log("JSON changed, reloading...");
    importOccurList().then(() => {
        console.log("JSON File reloaded");
    });
});



// Function to run immediatly when the backend is loaded but only once
async function checkForOccur() {
    const currentTime = new dayjs.tz();
    const today_date = new dayjs.tz().get('year') + "-" + (dayjs.tz().get('month') + 1).toString().padStart(2, '0') + "-" + dayjs.tz().get('date').toString().padStart(2, '0');

    occur_list.forEach((occur) => {
        if (today_date === occur.run_date.split('T')[0] && currentTime.get('hour').toString().padStart(2, '0') === occur.run_time.split(':')[0] && currentTime.get('minute').toString().padStart(2, '0') === occur.run_time.split(':')[1]) {
            // Trigger the relay
            console.log('Turn on the relay for', occur.amt_feed, 'secs');
	    const amt_mil = occur.amt_feed * 1000;
	    
	    // Turn the relay on
	    relay.writeSync(1);   

	    // Wait for the specified time
	    setTimeout(() => {
	        // Set the GPIO pin to '0' (low) after the specified time
	        relay.writeSync(0);
	    }, amt_mil);
        } else {
            console.log('Time match not found.', currentTime.get('minute').toString().padStart(2, '0'), occur.run_time.split(':')[1]);
        }
    });
}

// Function that runs every minute
async function runEveryCurrMin() {
    // Get the current time
    const now = new dayjs.tz();

    // Calculate the current number of milliseconds until the end of the next minute
    const sec = now.get('second');
    
    // Check if the current second is the start of a new minute
    if (sec === 0) {
	// Function to run every minute	
	await checkForOccur();
    }
}

await updateEventList();
await updateOccurList();
setInterval(runEveryCurrMin, 1000); // Run every second

io.on("connection", async (socket) => {
    // Send a message to client that a new user connected
    socket.emit("user connected", "A new user has connected");
    io.emit("user connected");
    var relayval = 0;	// For status control

    socket.on('relay-on', function(data) { // Get on button status from client
        relayval = data;
        if (relayval != relay.readSync()) { // Only change if status has changed
            relay.writeSync(relayval); // Turn motor on
            io.emit("The relay is on", data); // Send to all clients
            io.emit("motor-on");
        }
    });

    socket.on('relay-off', function(data) { // Get off button status from client
        relayval = 0;
    	relay.writeSync(relayval); // Turn motor off
        io.emit("The relay is off", data); // Send to all clients
        io.emit("motor-off");
    });

    // Get input values
    socket.on("new_feeding", async function(data) {
        // Get array data from frontend
        let run_imm = data[0];
        let repeat_f = data[1];
        let recure_interval = data[2];
        let st_day = data[3];
        let st_time = data[4];
        let e_day = data[5];
        let amount = parseFloat(data[6]).toFixed(5);
        let end_day = new dayjs.tz();
        let id = 0;

        // Create variables for later data input
	let now = dayjs.tz().get('year') + "-" + (dayjs.tz().get('month') + 1).toString().padStart(2, '0') + "-" + dayjs.tz().get('date').toString().padStart(2, '0');
        let future = (dayjs.tz().get('year') + 50) + "-" + (dayjs.tz().get('month') + 1).toString().padStart(2, '0') + "-" + dayjs.tz().get('date').toString().padStart(2, '0');
        let currentTime = dayjs.tz().get('hour').toString().padStart(2, '0') + ':' + dayjs.tz().get('minute').toString().padStart(2, '0') + ':' + dayjs.tz().get('second').toString().padStart(2, '0');
        
        // Change values for the two checkboxes 
        if (run_imm) {
            st_day = now;
            st_time = currentTime;
        }
        if (repeat_f) {
            e_day = future;
        }

        // Switch statement for each recurrence interval
        switch (recure_interval) {
            case "Run Once":
                // Set end_day to start_day for running once
                e_day = st_day;

                // Input event
                const insert_r1 = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                console.log(insert_r1);

                // Calculate and input occurrence(s)
                id = Object.values(insert_r1)[2];
                await createOccurrence(id, st_day, st_time, amount);
                await updateOccurList();
                break;
            case "Everyday":
                const insert_ed = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                //console.log(insert_ed);

                socket.emit("loading");

                // Calculate and input occurrence(s)
                id = Object.values(insert_ed)[2];
                end_day = new dayjs.tz(e_day);
                for (let i = new dayjs.tz(st_day); i <= end_day; i = i.add(1, 'day')) {
                    let new_date = i.tz().year().toString() + "-" + (i.tz().month() + 1).toString() + "-" + i.tz().date().toString();
                    await createOccurrence(id, new_date, st_time, amount);
                }
                
                // Call to set the list of occurrences file
                await updateOccurList();
                socket.emit("done_loading");
                break;
            case "Every Other Day":
                const insert_eod = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                //console.log(insert_eod);

                socket.emit("loading");

                // Calculate and input occurrence(s)
                id = Object.values(insert_eod)[2];
                end_day = new dayjs.tz(e_day);
                for (let i = new dayjs.tz(st_day); i <= end_day; i = i.add(2, 'day')) {
                    let new_date = i.tz().year().toString() + "-" + (i.tz().month() + 1).toString() + "-" + i.tz().date().toString();
                    await createOccurrence(id, new_date, st_time, amount);
                }
                
                // Call to set the list of occurrences file
                await updateOccurList();
                socket.emit("done_loading");
                break;
            case "Once Every Week":
                const insert_ew = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                //console.log(insert_ew);

                socket.emit("loading");

                // Calculate and input occurrence(s)
                id = Object.values(insert_ew)[2];
                end_day = new dayjs.tz(e_day);
                for (let i = new dayjs.tz(st_day); i <= end_day; i = i.add(1, 'week')) {
                    let new_date = i.tz().year().toString() + "-" + (i.tz().month() + 1).toString() + "-" + i.tz().date().toString();
                    await createOccurrence(id, new_date, st_time, amount);
                }
                
                // Call to set the list of occurrences file
                await updateOccurList();
                socket.emit("done_loading");
                break;
            case "Once Every Other Week":
                const insert_eow = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                //console.log(insert_eow);

                socket.emit("loading");
                
                // Calculate and input occurrence(s)
                id = Object.values(insert_eow)[2];
                end_day = new dayjs.tz(e_day);
                for (let i = new dayjs.tz(st_day); i <= end_day; i = i.add(2, 'week')) {
                    let new_date = i.tz().year().toString() + "-" + (i.tz().month() + 1).toString() + "-" + i.tz().date().toString();
                    await createOccurrence(id, new_date, st_time, amount);
                }

                // Call to set the list of occurrences file
                await updateOccurList();
                socket.emit("done_loading");
                break;
            case "Once Every Month":
                const insert_em = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                //console.log(insert_em);

                socket.emit("loading");

                // Calculate and input occurrence(s)
                id = Object.values(insert_em)[2];
                end_day = new dayjs.tz(e_day);
                for (let i = new dayjs.tz(st_day); i <= end_day; i = i.add(1, 'month')) {
                    let new_date = i.tz().year().toString() + "-" + (i.tz().month() + 1).toString() + "-" + i.tz().date().toString();
                    await createOccurrence(id, new_date, st_time, amount);
                }
                
                // Call to set the list of occurrences file
                await updateOccurList();
                socket.emit("done_loading");
                break;
            case "Once Every Other Month":
                const insert_eom = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                //console.log(insert_eom);

                socket.emit("loading");

                // Calculate and input occurrence(s)
                id = Object.values(insert_eom)[2];
                end_day = new dayjs.tz(e_day);
                for (let i = new dayjs.tz(st_day); i <= end_day; i = i.add(2, 'month')) {
                    let new_date = i.tz().year().toString() + "-" + (i.tz().month() + 1).toString() + "-" + i.tz().date().toString();
                    await createOccurrence(id, new_date, st_time, amount);
                }
                
                // Call to set the list of occurrences file
                await updateOccurList();
                socket.emit("done_loading");
                break;
            case "Once Every 6 Months":
                const insert_e6m = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                //console.log(insert_e6m);

                socket.emit("loading");

                // Calculate and input occurrence(s)
                id = Object.values(insert_e6m)[2];
                end_day = new dayjs.tz(e_day);
                for (let i = new dayjs.tz(st_day); i <= end_day; i = i.add(6, 'month')) {
                    let new_date = i.tz().year().toString() + "-" + (i.tz().month() + 1).toString() + "-" + i.tz().date().toString();
                    await createOccurrence(id, new_date, st_time, amount);
                }
                
                // Call to set the list of occurrences file
                await updateOccurList();
                socket.emit("done_loading");
                break;
            case "Once A Year":
                const insert_y = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                //console.log(insert_y);
                
                socket.emit("loading");
                
                // Calculate and input occurrence(s)
                id = Object.values(insert_y)[2];
                end_day = new dayjs.tz(e_day);
                for (let i = new dayjs.tz(st_day); i <= end_day; i = i.add(1, 'year')) {
                    let new_date = i.tz().year().toString() + "-" + (i.tz().month() + 1).toString() + "-" + i.tz().date().toString();
                    await createOccurrence(id, new_date, st_time, amount);
                }
                
                // Call to set the list of occurrences file
                await updateOccurList();
                socket.emit("done_loading");
                break;
        }    
    });

    // Function for recieveing the id to delete an event from frontend 
    socket.on("delete_feeding", async function(data) {
        console.log("Id to be deleted: ", data);
        socket.emit("loading");
        const del = await deleteEvent(data);
        socket.emit("done_loading");
        console.log(del);
    });
});

httpServer.listen(3001, () => {
    console.log("listening on port 3001");
});
