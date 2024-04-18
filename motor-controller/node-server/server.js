import { Server } from "socket.io";
import { createServer } from "http";
import mysql from "mysql2";
import dotenv from 'dotenv';
import dayjs from "dayjs";
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

// Function to add a record to the events table 
async function createEvent(recure_interval, st_day, st_time, end_day, amt_feed) {
    const [result] = await db.query(`
        INSERT INTO events (recure_interval, st_day, st_time, end_day, amt_feed)
        VALUES (?, ?, ?, ?, ?)
        `, [recure_interval, st_day, st_time, end_day, amt_feed]);
    return result;
}

// Function to add a record to the occurences table
async function createOccurence(id, run_date, run_time, amt_feed) {
    const [result] = await db.query(`
        Insert INTO occurences (id, run_date, run_time, amt_feed) 
        values (?, ?, ?, ?)
        `, [id, run_date, run_time, amt_feed]);
    return result;
}

io.on("connection", (socket) => {
    // Send a message to client that a new user connected
    socket.emit("user connected", "A new user has connected");
    
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
        let end_day = new dayjs();
        let id = 0;

        // Create variables for later data input
        let today = new dayjs().toISOString().split('T')[0];
        let future = new dayjs().year(2100).toISOString().split('T')[0];
        let h = new dayjs().hour();
        let m = new dayjs().minute();
        let currentTime = h.toString() + ':' + m.toString();

        // Change values for the two checkboxes
        if (run_imm) {
            st_day = today;
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

                // Calculate and input occurence(s)
                id = Object.values(insert_r1)[2];
                console.log("id: ", id);
                const insert_o_r1 = await createOccurence(id, st_day, st_time, amount);
                console.log(insert_o_r1);
                break;
            case "Everyday":
                const insert_ed = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                console.log(insert_ed);

                // Calculate and input occurence(s)
                id = Object.values(insert_ed)[2];
                end_day = new dayjs(e_day);
                for (let i = new dayjs(st_day); i <= end_day; i = i.add(1, 'day')) {
                    let new_date = i.toISOString().split('T')[0];
                    const insert_o_ed = await createOccurence(id, new_date, st_time, amount);
                    console.log(insert_o_ed);
                }
                break;
            case "Every Other Day":
                const insert_eod = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                console.log(insert_eod);

                // Calculate and input occurence(s)
                id = Object.values(insert_eod)[2];
                end_day = new dayjs(e_day);
                for (let i = new dayjs(st_day); i <= end_day; i = i.add(2, 'day')) {
                    let new_date = i.toISOString().split('T')[0];
                    const insert_o_eod = await createOccurence(id, new_date, st_time, amount);
                    console.log(insert_o_eod);
                }
                break;
            case "Once Every Week":
                const insert_ew = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                console.log(insert_ew);

                // Calculate and input occurence(s)
                id = Object.values(insert_ew)[2];
                end_day = new dayjs(e_day);
                for (let i = new dayjs(st_day); i <= end_day; i = i.add(1, 'week')) {
                    let new_date = i.toISOString().split('T')[0];
                    const insert_o_ew = await createOccurence(id, new_date, st_time, amount);
                    console.log(insert_o_ew);
                }
                break;
            case "Once Every Other Week":
                const insert_eow = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                console.log(insert_eow);
                
                // Calculate and input occurence(s)
                id = Object.values(insert_eow)[2];
                end_day = new dayjs(e_day);
                for (let i = new dayjs(st_day); i <= end_day; i = i.add(2, 'week')) {
                    let new_date = i.toISOString().split('T')[0];
                    const insert_o_eow = await createOccurence(id, new_date, st_time, amount);
                    console.log(insert_o_eow);
                }
                break;
            case "Once Every Month":
                const insert_em = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                console.log(insert_em);

                // Calculate and input occurence(s)
                id = Object.values(insert_em)[2];
                end_day = new dayjs(e_day);
                for (let i = new dayjs(st_day); i <= end_day; i = i.add(1, 'month')) {
                    let new_date = i.toISOString().split('T')[0];
                    const insert_o_em = await createOccurence(id, new_date, st_time, amount);
                    console.log(insert_o_em);
                }
                break;
            case "Once Every Other Month":
                const insert_eom = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                console.log(insert_eom);

                // Calculate and input occurence(s)
                id = Object.values(insert_eom)[2];
                end_day = new dayjs(e_day);
                for (let i = new dayjs(st_day); i <= end_day; i = i.add(2, 'month')) {
                    let new_date = i.toISOString().split('T')[0];
                    const insert_o_eom = await createOccurence(id, new_date, st_time, amount);
                    console.log(insert_o_eom);
                }
                break;
            case "Once Every 6 Months":
                const insert_e6m = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                console.log(insert_e6m);
                
                // Calculate and input occurence(s)
                id = Object.values(insert_e6m)[2];
                end_day = new dayjs(e_day);
                for (let i = new dayjs(st_day); i <= end_day; i = i.add(6, 'month')) {
                    let new_date = i.toISOString().split('T')[0];
                    const insert_o_e6m = await createOccurence(id, new_date, st_time, amount);
                    console.log(insert_o_e6m);
                }
                break;
            case "Once A Year":
                const insert_y = await createEvent(recure_interval, st_day, st_time, e_day, amount);
                console.log(insert_y);

                // Calculate and input occurence(s)
                id = Object.values(insert_y)[2];
                end_day = new dayjs(e_day);
                for (let i = new dayjs(st_day); i <= end_day; i = i.add(1, 'year')) {
                    let new_date = i.toISOString().split('T')[0];
                    const insert_o_y = await createOccurence(id, new_date, st_time, amount);
                    console.log(insert_o_y);
                }
                break;
        }    
    });
});

httpServer.listen(3001, () => {
    console.log("listening on port 3001");
});

