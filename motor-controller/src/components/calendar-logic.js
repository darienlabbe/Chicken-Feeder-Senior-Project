import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';

// For converting timezone
dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault("America/Los_Angeles");

// Generate the days in the 
export const generateDate = (month = dayjs.tz().month(), year = dayjs.tz().year()) => {
    // Get the first day and last day of the current month
    const firstDateOfMonth = dayjs.tz().year(year).month(month).startOf("month");
    const lastDateOfMonth = dayjs.tz().year(year).month(month).endOf("month");
    const arrayOfDate = [];

    // Generate prefix days
    for (let i = 0; i < firstDateOfMonth.day(); i++) {
        arrayOfDate.push({ currentMonth:false, date:firstDateOfMonth.day(i), });
    }

    // Generate current month
    for(let i = firstDateOfMonth.date(); i <= lastDateOfMonth.date(); i++) {
        arrayOfDate.push({ currentMonth:true, date:firstDateOfMonth.date(i), 
            today:firstDateOfMonth.date(i).toDate().toDateString() === dayjs.tz().toDate().toDateString(), });
    }

    // Generate sufix days
    const remaining = 42 - arrayOfDate.length;

    for(let i = lastDateOfMonth.date() + 1; i <= lastDateOfMonth.date() + remaining; i++) {
        arrayOfDate.push({ currentMonth:false, date:firstDateOfMonth.date(i), });
    }

    return arrayOfDate;
};

// Array of full string for each month 
export const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];