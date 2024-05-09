import React, { useEffect } from "react";
import Calendar from "./components/calendar";
import AddEvent from "./components/add-event";
import DeleteEvent from "./components/delete-event";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function App() { 
  useEffect(() => {
    // Event listener
    socket.on('connect', () => {
      // Receive message from the server
      socket.on("user connected", (data) => {
        console.log("Server: ", data);
      });
    });

    return () => {
      // Remove event listener
      socket.off("connect");
    }
  }, []);
  
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-10 border-gray-200">
      <div className="flex items-center justify-center min-w-0 min-h-28 border-b-4">
        <h1 className="text-4xl font-bold text-gray-900">Motor Controller</h1>
      </div>
      <div className="flex justify-center">
        <div className="flex px-1">
          <AddEvent/> 
        </div>
        <div className="flex px-1">
          <DeleteEvent/> 
        </div>
      </div>
      <div>
        <Calendar/>
      </div>
    </div>
  );
}

export default App;