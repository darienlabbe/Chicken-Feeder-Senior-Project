import React, { useState } from "react";
import { generateDate, months } from "./calendar-logic";
import { GrFormNext, GrFormPrevious } from "react-icons/gr"
import cn from "./cn";
import dayjs from "dayjs";

function Calendar() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDate = dayjs();
  const [today, setToday] = useState(currentDate);
  const [selectDate, setSelectDate] = useState(currentDate);
  
  return (
    <div className="grid divide-y-2 gap-8 items-center justify-center">
      <div className="w-72 h-72">
        <div className="flex justify-between">
          <h1 className="font-semibold">{months[today.month()]}, {today.year()}</h1>
          <div className="flex items-center gap-10">
            <GrFormPrevious className="w-5 h-5 cursor-pointer" onClick={() =>{
              setToday(today.month(today.month() - 1));
            }}/>
            <h1 className="cursor-pointer" onClick={() =>{
              setToday(currentDate);
            }}>Today</h1>
            <GrFormNext className="w-5 h-5 cursor-pointer" onClick={() =>{
              setToday(today.month(today.month() + 1));
            }}/>
          </div>
        </div>
        <div className="grid grid-cols-7 text-gray-500">
          {days.map((day, index) => {
            return <h1 key={index} className="h-10 grid place-content-center text-sm">{day}</h1>
          })}
        </div>
        <div className="grid grid-cols-7">
          {generateDate(today.month(), today.year()).map(({currentMonth, date, today}, index) => {
            return (
              <div key={index} className="h-10 border-t grid place-content-center text-sm">
                <h1 className={cn(currentMonth?"" : "text-gray-400", today?"bg-red-600 text-white":"",
                selectDate.toDate().toDateString() === date.toDate().toDateString() ? "bg-black text-white" : "",
                "h-6 w-6 grid place-content-center rounded-full hover:bg-black hover:text-white transition-all cursor-pointer")}
                onClick={() => { setSelectDate(date) }} >{date.date()}</h1>
              </div>
            );
          })}
        </div>
        
      </div>
      <div className="w-72 h-72 text-sm pt-3">
        <h1 className="font-semibold pb-1 border-b">Scheduled Feedings for {selectDate.toDate().toDateString()}</h1>
        <p className="pt-2">No feedings scheduled today.</p>
      </div>
    </div>
  );
}

export default Calendar;
