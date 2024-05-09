import React, { useState } from 'react';
import { AiOutlineCaretUp, AiOutlineCaretDown } from 'react-icons/ai';
import { FaPlus } from 'react-icons/fa6';
import cn from './cn';
import list from "./list.json"
import { io } from "socket.io-client";
import { 
    Popover,
    PopoverHandler,
    PopoverContent,
    Button
} from '@material-tailwind/react';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
import Loading from "./loading";

// For converting timezone
dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault("America/Los_Angeles");

const socket = io("http://localhost:3001");

function AddEvent() {
    // States for changing inputs and different style changes
    const [isDisImm, setDisImm] = useState(false);
    const [isDisRep, setDisRep] = useState(false);
    const [isDateError, setDateError] = useState(false);
    const [isDropError, setDropError] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [dropValue, setDropValue] = useState("--select one--");
    const [isLoading, setLoading] = useState(false);

    socket.on("loading", () => { setLoading(true); });
    socket.on("done_loading", () => { setLoading(false); });

    const currentDate = dayjs.tz().get('year') + '-' + (dayjs.tz().get('month') + 1).toString().padStart(2, '0') + '-' + dayjs.tz().get('date').toString().padStart(2, '0');

    // Function for submitting the data to the backend
    function onSubmit () {
        // Check that a recurrence interval value was selected 
        if (dropValue !== "--select one--") {
            setDropError(false);

            // Get values from the inputs
            let start_day = document.getElementById('start_day').value;
            let start_time = document.getElementById('start_time').value;
            let end_day = document.getElementById('end_day').value;
            let amt = document.getElementById('amt').value;
            
            // Array of data to be sent to backend
            let all_data = [isDisImm, isDisRep, dropValue, "", "", "", ""];

            // Check to determine if the end date occurs before the start date
            if (start_day !== "" && end_day !== "") {
                let date1 = dayjs.tz().set('year', start_day.split('-')[0]).set('month', start_day.split('-')[1] - 1).set('date', start_day.split('-')[2]);
                let date2 = dayjs.tz().set('year', end_day.split('-')[0]).set('month', end_day.split('-')[1] - 1).set('date', end_day.split('-')[2]);
                if (date1 > date2) {
                    console.error("ERROR: You must input a start date that occurs before the end date!");
                    setDateError(true);
                    return;
                } 
            }
            
            // Add data to array
            if (!isDisImm) {
                if (start_day !== "") all_data[3] = start_day;
                if (start_time !== "") all_data[4] = start_time;
            }
            if (!isDisRep && end_day !== "") {
                all_data[5] = end_day;
            }
            if (amt > 0) all_data[6] = amt;
            
            // Send information to backend
            socket.emit("new_feeding", all_data);
            
            // Reset input values
            document.getElementById('start_day').value = "";
            document.getElementById('start_time').value = "";
            document.getElementById('end_day').value = "";
            document.getElementById('amt').value = null;
            setDropValue("--select one--");
            setDateError(false);
        } else {
            console.error("ERROR: Input a recurrence interval!")
            setDropError(true);
            setDateError(false);
        }
    }

    // Function for changing the value of the recurrence interval dropdown
    function drop(item) {
        setDropValue((val) => val = item);
        setIsOpen((prev) => !prev);
    }
    
    return (
        <Popover 
            placement="bottom-start"
            animate={{
                mount: { scale: 0.80, x: -30, y: -75 },
                unmount: { scale: 0, x: -70, y: -385 },
            }}>
            {isLoading?(<Loading/>):""}
            <PopoverHandler>
                <Button onClick={() => setDisImm(false)} className="bg-red-600 flex items-center p-2">
                    <FaPlus className="w-5 h-5 "/>
                    <h1 className="p-1">Add New Feeding</h1>
                </Button>
            </PopoverHandler>
            <PopoverContent>
                <div className="px-3 grid grid-cols-1">
                    <div className="p-4 border-b grid grid-cols-1">
                        <div className="relative flex px-4 items-center">
                            <input type="checkbox" id="run_imm" checked={isDisImm} className="flex rounded p-2 checked:bg-red-700" onChange={() => setDisImm(!isDisImm)}/> 
                            <label className="flex text-gray-700 text-lg font-bold px-4">Run Immediately</label>
                        </div>
                        <div className="relative flex px-4 pt-2 items-center">
                            <input type="checkbox" id="repeat_f" checked={isDisRep} className="flex rounded p-2 checked:bg-red-700" onChange={() => setDisRep(!isDisRep)}/> 
                            <label className="flex text-gray-700 text-lg font-bold px-4">Repeat Forever</label>
                        </div>
                    </div>
                    <div className="p-4 border-b">
                        <div className="p-2">
                            <h1 className="font-bold">Select Recurrence Interval:</h1>
                        </div>
                        <div className="relative flex p-1 h-12">
                            <button id="drop" onClick={() => setIsOpen((prev) => !prev)} className={cn(isDropError?"ring-red-500 border-red-500":"focus:ring-blue-500 focus:border-blue-500","text-gray-500 flex flex-row items-center justify-between px-4 bg-gray-50 border border-gray-300 rounded-lg w-full")}>{dropValue} {!isOpen ? (<AiOutlineCaretDown className="h-8"/>): (<AiOutlineCaretUp className="h-8"/>)}</button>
                            {isOpen && (<div className="bg-gray-50 border border-gray-300 absolute top-11 flex flex-col items-start rounded-lg p-2 w-full">
                                {list.map((item, i) => (
                                    <div className="flex w-full p-1 hover:font-bold cursor-pointer" key={i}>
                                        <button onClick={() => drop(item.value)} className="text-gray-500">{item.value}</button>
                                    </div>
                                ))}
                            </div>)}
                        </div>
                    </div>
                    <div className="p-4 border-b">
                        <div>
                            <div className="p-2">
                                <h1 className="font-bold">Select Start Day For Feeding:</h1>
                            </div>
                            <div className="flex p-1">
                                <input id="start_day" disabled={isDisImm} type="date" min={currentDate} className={cn(isDateError?"ring-red-500 border-red-500":"focus:ring-blue-500 focus:border-blue-500", isDisImm?"text-gray-300":"text-gray-500", "bg-gray-50 border-gray-300 rounded-lg w-full",)}/>
                            </div>
                        </div>
                        <div>
                            <div className="p-2">
                                <h1 className="font-bold">Select Start Time:</h1>
                            </div>
                            <div>
                                <input id="start_time" disabled={isDisImm} type="time" className={cn(isDisImm?"text-gray-300":"text-gray-500", "bg-gray-50 border border-gray-300  rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full",)}/>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-b">
                        <div>
                            <div className="p-2">
                                <h1 className="font-bold">Select End Day For Feeding:</h1>
                            </div>
                            <div className="flex p-1">
                                <input id="end_day" disabled={isDisRep} type="date" min={currentDate} className={cn(isDateError?"ring-red-500 border-red-500":"focus:ring-blue-500 focus:border-blue-500", isDisRep?"text-gray-300":"text-gray-500", "bg-gray-50 border-gray-300 rounded-lg w-full",)}/>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-b">
                        <div>
                            <div className="p-2">
                                <h1 className="font-bold">Select Amount Of Feed (Time):</h1>
                            </div>
                            <div className="flex p-1">
                                <input id="amt" type="number" min={0} placeholder="0.0" className="text-gray-500 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"/>
                            </div>
                        </div>
                    </div>
                    <div className="pt-3">
                        <Button onClick={() => onSubmit()} className="bg-red-600">Submit</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default AddEvent;
