import React, { useState } from 'react';
import { AiOutlineCaretUp, AiOutlineCaretDown } from 'react-icons/ai';
import cn from './cn';
import list from "./list.json"
import { io } from "socket.io-client";
import { 
    Popover,
    PopoverHandler,
    PopoverContent,
    Button,
    Checkbox,
    Typography
} from '@material-tailwind/react';

const socket = io("http://localhost:3001");

function AddEvent() {
    // States for changing inputs and different style changes
    const [isDisImm, setDisImm] = useState(false);
    const [isDisRep, setDisRep] = useState(false);
    const [isDateError, setDateError] = useState(false);
    const [isDropError, setDropError] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [dropValue, setDropValue] = useState("--select one--");

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
                let date1 = new Date(start_day);
                let date2 = new Date(end_day);
                if (date1 > date2) {
                    console.error("YOU MUST INPUT A START DATE THAT OCCURS BEFORE THE END DATE");
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
            console.log("ERROR: Input a recurrence interval!")
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
            placement="bottom"
            animate={{
            mount: { scale: 1, y: 0 },
            unmount: { scale: 0, y: 25 },
            }}>
            <PopoverHandler>
                <Button className="bg-red-600 flex items-center p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <h1 className="p-2">Add New Feeding</h1>
                </Button>
            </PopoverHandler>
            <PopoverContent>
                <div className="p-4 grid grid-cols-1">
                    <div className="p-4 border-b">
                        <div>
                            <Checkbox id="run_imm" onClick={() => setDisImm(!isDisImm)} label={<Typography className="font-bold">Run Immediately</Typography>}/>
                        </div>
                        <div>
                            <Checkbox id="repeat_f" onClick={() => setDisRep(!isDisRep)} label={<Typography className="font-bold">Repeat Forever</Typography>}/>
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
                                <input id="start_day" disabled={isDisImm} type="date" min={new Date().toISOString().split("T")[0]} className={cn(isDateError?"ring-red-500 border-red-500":"focus:ring-blue-500 focus:border-blue-500", isDisImm?"text-gray-300":"text-gray-500", "bg-gray-50 border-gray-300 rounded-lg w-full",)}/>
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
                                <input id="end_day" disabled={isDisRep} type="date" min={new Date().toISOString().split("T")[0]} className={cn(isDateError?"ring-red-500 border-red-500":"focus:ring-blue-500 focus:border-blue-500", isDisRep?"text-gray-300":"text-gray-500", "bg-gray-50 border-gray-300 rounded-lg w-full",)}/>
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
