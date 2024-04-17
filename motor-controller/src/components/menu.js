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

function Menu() {
    const [isDisImm, setDisImm] = useState(false);
    const [isDisRep, setDisRep] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [dropValue, setDropValue] = useState("--select one--");

    function onSubmit () {
        if (dropValue !== "--select one--") {
            // Get values
            let start_day = document.getElementById('start_day').value;
            let start_time = document.getElementById('start_time').value;
            let end_day = document.getElementById('end_day').value;
            let end_time = document.getElementById('end_time').value;
            let amt = document.getElementById('amt').value;

            // Send information to backend
            socket.emit("recure_interval", dropValue);
            if (!isDisImm) {
                if (start_day !== "") socket.emit("start_day", start_day);
                if (start_time !== "") socket.emit("start_time", start_time);
            }
            
            if (!isDisRep) {
                if (end_day !== "") socket.emit("end_day", end_day);
                if (end_time !== "") socket.emit("end_time", end_time);
            }

            if (amt > 0) socket.emit("amt", amt);
        } else {
            console.log("ERROR: Input a recurrence interval!")
        }

        // Reset input values
        document.getElementById('start_day').value = "";
        document.getElementById('start_time').value = "";
        document.getElementById('end_day').value = "";
        document.getElementById('end_time').value = "";
        document.getElementById('amt').value = null;
        setDropValue("--select one--");
    }

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
                <Button className="bg-red-600 flex items-center p-3">
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
                            <button id="drop" onClick={() => setIsOpen((prev) => !prev)} className="text-gray-500 flex flex-row items-center justify-between px-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full">{dropValue} {!isOpen ? (<AiOutlineCaretDown className="h-8"/>): (<AiOutlineCaretUp className="h-8"/>)}</button>
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
                                <input id="start_day" disabled={isDisImm} type="date" min={new Date().toISOString().split("T")[0]} className={cn(isDisImm?"text-gray-300":"text-gray-500", "bg-gray-50 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full",)}/>
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
                                <input id="end_day" disabled={isDisRep} type="date" min={new Date().toISOString().split("T")[0]} className={cn(isDisRep?"text-gray-300":"text-gray-500", "bg-gray-50 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full",)}/>
                            </div>
                        </div>
                        <div>
                            <div className="p-2">
                                <h1 className="font-bold">Select End Time:</h1>
                            </div>
                            <div>
                                <input id="end_time" disabled={isDisRep} type="time" className={cn(isDisRep?"text-gray-300":"text-gray-500", "bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full",)}/>
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

export default Menu;
