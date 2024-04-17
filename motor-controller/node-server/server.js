import { Server } from "socket.io";
import { createServer } from "http";
import mysql from "mysql2";
import dotenv from 'dotenv';
dotenv.config();

// Create an instance of the http server to handle HTTP requests
const httpServer = createServer((req, res) => {
    // Set a response type of plain text for the response
    res.writeHead(200, {'Content-Type': 'text/plain'});
    
    // Send back a response and end the connection 
    con.connect(function(err) {
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

async function getTables() {
    const [avail_tables] = await db.query(`SHOW TABLES`);
    return avail_tables;
}

async function createEvent(start_day, start_time, end_day, end_time, amt) {
    const result = await db.query(`
        INSERT INTO events (st_day, st_time, end_day, end_time, amt_feed)
        VALUES (?, ?, ?, ?, ?)
        `, [start_day, start_time, end_day, end_time, amt]);
    return result;
}

const table = await getTables() 
console.log(table);

io.on("connection", (socket) => {
    // Send a message to client that a new user connected
    socket.emit("user connected", "A new user has connected");

    // Get input values
    socket.on("recure_interval", function(data) {
        console.log("Recurrence Interval: ", data);
    });

    socket.on("start_day", function(data) {
        console.log("start day: ", data);
    });

    socket.on("start_time", function(data) {
        console.log("start time: ", data);
    });

    socket.on("end_day", function(data) {
        console.log("end day: ", data);
    });

    socket.on("end_time", function(data) {
        console.log("end time: ", data);
    });

    socket.on("amt", function(data) {
        console.log("amount of feed: ", data);
    });
});

httpServer.listen(3001, () => {
    console.log("listening on port 3001");
});

