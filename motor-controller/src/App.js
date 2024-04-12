import React from "react";
import Calendar from "./util/calendar";
import Menu from "./util/menu";

function App() { 
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-10 border-gray-200">
      <div className="flex items-center justify-center min-w-0 min-h-28 border-b-4">
        <h1 className="text-4xl font-bold text-gray-900">Motor Controller</h1>
      </div>
      <div className="grid justify-center">
        <Menu/>
      </div>
      <div>
        <Calendar/>
      </div>
    </div>
  );
}

export default App;