import React, { useState } from 'react';
import cn from './cn';
import { 
    Popover,
    PopoverHandler,
    PopoverContent,
    Button,
    Checkbox,
    Typography
} from '@material-tailwind/react';

function Menu() {
    const [isDisImm, setDisImm] = useState(false);
    const [isDisRep, setDisRep] = useState(false);
    
    return (
        <Popover 
            placement="bottom"
            animate={{
            mount: { scale: 1, y: 0 },
            unmount: { scale: 0, y: 25 },
            }}>
            <PopoverHandler>
                <Button className="bg-red-600 flex items-center p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <h1 className="p-2">Add New Feeding</h1>
                </Button>
            </PopoverHandler>
            <PopoverContent>
                <div className="p-4 grid grid-cols-1">
                    <div className="p-4 border-b">
                        <div>
                            <Checkbox onClick={() => setDisImm(!isDisImm)} label={<Typography className="font-bold">Run Immediately</Typography>}/>
                        </div>
                        <div>
                            <Checkbox onClick={() => setDisRep(!isDisRep)} label={<Typography className="font-bold">Repetative Forever</Typography>}/>
                        </div>
                    </div>
                    <div className="p-4 border-b">
                        <div>
                            <div className="p-2">
                                <h1 className="font-bold">Select Start Day For Feeding:</h1>
                            </div>
                            <div className="flex p-1">
                                <input disabled={isDisImm} type="date" className={cn(isDisImm?"text-gray-300":"text-gray-500", "bg-gray-50 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full",)}/>
                            </div>
                        </div>
                        <div>
                            <div className="p-2">
                                <h1 className="font-bold">Select Start Time:</h1>
                            </div>
                            <div>
                                <input disabled={isDisImm} type="time" className={cn(isDisImm?"text-gray-300":"text-gray-500", "bg-gray-50 border border-gray-300  rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full",)}/>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-b">
                        <div>
                            <div className="p-2">
                                <h1 className="font-bold">Select End Day For Feeding:</h1>
                            </div>
                            <div className="flex p-1">
                                <input disabled={isDisRep} type="date" className={cn(isDisRep?"text-gray-300":"text-gray-500", "bg-gray-50 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full",)}/>
                            </div>
                        </div>
                        <div>
                            <div className="p-2">
                                <h1 className="font-bold">Select End Time:</h1>
                            </div>
                            <div>
                                <input disabled={isDisRep} type="time" id="time" className={cn(isDisRep?"text-gray-300":"text-gray-500", "bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full",)}/>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-b">
                        <div>
                            <div className="p-2">
                                <h1 className="font-bold">Select Amount Of Feed (Time):</h1>
                            </div>
                            <div className="flex p-1">
                                <input type="number" min={0} placeholder="0.0" className="text-gray-500 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"/>
                            </div>
                        </div>
                    </div>
                    <div className="pt-3">
                        <Button className="bg-red-600">Submit</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default Menu;
