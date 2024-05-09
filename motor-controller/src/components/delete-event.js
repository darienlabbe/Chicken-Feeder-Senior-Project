import React, { useState } from 'react';
import { AiOutlineCaretUp, AiOutlineCaretDown } from 'react-icons/ai';
import { FaMinus } from 'react-icons/fa6';
import cn from './cn';
import list from "./event-list.json"
import { io } from "socket.io-client";
import { Popover, PopoverHandler, PopoverContent, Button } from '@material-tailwind/react';
import Loading from './loading';

const socket = io("http://localhost:3001");

function DeleteEvent() {
    // States for changing inputs and different style changes
    const [isDropError, setDropError] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [dropValue, setDropValue] = useState("--select one--");
    const [idValue, setID] = useState(-1);
    const [isLoading, setLoading] = useState(false);

    socket.on("loading", () => { setLoading(true); });
    socket.on("done_loading", () => { setLoading(false); });

    // Function for submitting the data to the backend
    function onDelete () {
        // Check that a recurrence interval value was selected 
        if (dropValue !== "--select one--") {
            // Set to false since the if statement passed
            setDropError(false);

            // Send id to backend
            socket.emit("delete_feeding", idValue);
            
            // Reset input values
            setDropValue("--select one--");
            setID(-1);
        } else {
            console.log("ERROR: Input an entry to delete!")
            setDropError(true);
        }
    }

    // Function for changing the value of the recurrence interval dropdown
    function drop(item) {
        if (item.includes(".") && item.split(".")[2] !== undefined) {
            setDropValue((val) => val = item.split(".")[1] + "." + item.split(".")[2]);
            setIsOpen((prev) => !prev);
            setID(item.split(".")[0]);
        } else if (item.includes(".")) {
            setDropValue((val) => val = item.split(".")[1]);
            setIsOpen((prev) => !prev);
            setID(item.split(".")[0]);
        } else {
            setDropValue((val) => val = item);
            setIsOpen((prev) => !prev);
        }
    }
    
    return (
        <Popover 
            placement="bottom-end"
            animate={{
                mount: { scale: 0.85, x: 25, y: -10 },
                unmount: { scale: 0, x: 85, y: -105 },
            }}>
            {isLoading?(<Loading/>):""}
            <PopoverHandler>
                <Button className="bg-red-600 flex items-center p-2">
                    <FaMinus className="w-5 h-5"/>
                    <h1 className="p-1">Delete A Feeding</h1>
                </Button>
            </PopoverHandler>
            <PopoverContent>
                <div className="grid grid-cols-1">
                    <div className="p-1 border-b">
                        <div className="p-1">
                            <h1 className="font-bold">Select A Feeding to Delete:</h1>
                        </div>
                        <div className="relative flex p-1 h-12">
                            <button id="drop" onClick={() => setIsOpen((prev) => !prev)} className={cn(isDropError?"ring-red-500 border-red-500":"focus:ring-blue-500 focus:border-blue-500","text-gray-500 flex flex-row items-center justify-between px-4 bg-gray-50 border border-gray-300 rounded-lg w-72")}>{dropValue} {!isOpen ? (<AiOutlineCaretDown className="h-8"/>): (<AiOutlineCaretUp className="h-8"/>)}</button>
                            {isOpen && (<div className="bg-gray-50 border border-gray-300 absolute top-11 flex flex-col items-start rounded-lg p-2 w-72 z-40">
                                {list.map((item, i) => (
                                    <div className="flex w-full p-1 hover:font-bold cursor-pointer" key={i}>
                                        <button onClick={() => drop(item.id + ". " + item.st_day.split("-")[1] + "/" + item.st_day.split("T")[0].split("-")[2] + "/" + item.st_day.split("-")[0] + " at " + item.st_time.split(":")[0] + ":" + item.st_time.split(":")[1] + " for " + item.amt_feed + "sec")} className="text-gray-500">{item.st_day.split("-")[1] + "/" + item.st_day.split("T")[0].split("-")[2] + "/" + item.st_day.split("-")[0] + " at " + item.st_time.split(":")[0] + ":" + item.st_time.split(":")[1] + " for " + item.amt_feed + "sec"}</button>
                                    </div>
                                ))}
                            </div>)}
                        </div>
                    </div>
                    <div className="pt-3">
                        <Button onClick={() => onDelete()} className="bg-red-600">DELETE</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default DeleteEvent;
