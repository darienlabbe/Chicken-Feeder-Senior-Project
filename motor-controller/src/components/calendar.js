import React, { useState } from "react";
import { generateDate, months } from "./calendar-logic";
import { GrFormNext, GrFormPrevious } from "react-icons/gr"
import cn from "./cn";
import occur from "./occurrence-list.json"
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';

// For converting timezone
dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault("America/Los_Angeles");

function Calendar() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDate = dayjs.tz();
  const [today, setToday] = useState(currentDate);
  const [selectDate, setSelectDate] = useState(currentDate);
  
  // For correct date format for comparison
  var select_date = selectDate.toDate().getFullYear() + '-' + (selectDate.toDate().getMonth() + 1).toString().padStart(2, "0") + '-' + selectDate.toDate().getDate().toString().padStart(2, "0");
  
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
        {occur.some(item => item.run_date.split('T')[0] === select_date) ? 
          (<ul className="pt-2 px-5 list-disc">
            {occur.filter(item => item.run_date.split('T')[0] === select_date)
              .map((item) => (<li key={item.id}>Feeding at {
                item.run_time.split(':')[0] >= 13 ? item.run_time.split(':')[0] - 12 + ":" + item.run_time.split(':')[1] + "pm" :
                (item.run_time.split(':')[0] < 10 ? (item.run_time.split(':')[0] === "00" ? "12" : item.run_time.split(':')[0].split('0')[1]) : item.run_time.split(':')[0])
                + ":" + item.run_time.split(':')[1] + "am"} for {item.amt_feed} seconds</li>))
            }</ul>)
          : (<p className="pt-2">No feedings scheduled today.</p>)
        }
      </div>
    </div>
  );
}
// "Feeding at: " + occur[i].run_time + " for " + occur[i].amt_feed + " seconds"
export default Calendar;
