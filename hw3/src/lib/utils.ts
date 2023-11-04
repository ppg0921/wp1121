import { faker } from "@faker-js/faker";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// this utility function is used to merge tailwind classes safely



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// generate a random avatar for a user
export function getAvatar(username?: string | null) {
  faker.seed(username ? getSeed(username) : 42069);
  return faker.internet.avatar();
}

// convert username to a number for consistent seeding
function getSeed(username: string) {
  const code = new TextEncoder().encode(username);
  return Array.from(code).reduce(
    (acc, curr, i) => (acc + curr * i) % 1_000_000,
    0,
  );
}

export function validateHandle(handle?: string | null) {
  if (!handle) return false;
  return /^[a-z0-9\\._-]{1,25}$/.test(handle);
}

export function validateUsername(username?: string | null) {
  if (!username) return false;
  return /^[a-zA-Z0-9 ]{1,50}$/.test(username);
}

export function validateDate(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) return false;
  if (startDate.length > 14 || startDate.length > 14) return false;
  if (/\d{4}-\d{2}-\d{2}-\d{2}/.test(startDate) === false || /\d{4}-\d{2}-\d{2}-\d{2}/.test(endDate) === false) return false;
  // console.log("startDate: ", startDate, "endDate: ", endDate);
  if (!dateChecker(startDate, endDate)) return false;
  return true;
}

function dateChecker(inputDate1: string, inputDate2: string) {
  let Date1 = [-1, -1, -1, -1];
  let Date2 = [-1, -1, -1, -1];
  // let dayNumbers = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // const year = parseInt(inputDate.substring(0, 4));
  // const month = parseInt(inputDate.substring(5, 7));
  // const date = parseInt(inputDate.substring(8, 10));
  // const hour = parseInt(inputDate.substring(11, 13));
  // if (year % 4 == 0 && (year % 100 !== 0 || year % 400 == 0))
  //   dayNumbers[2] = 29;
  // if (month > 12 || month < 1) {
  //   alert("month not valid");
  //   return false;
  // }
  // if (date > dayNumbers[month] || date < 1) {
  //   alert("date not valid");
  //   return false;
  // }
  // if (hour > 23 || hour < 0) {
  //   alert("hour not valid");
  //   return false;
  // }
  Date1 = dateStringIntoInt(inputDate1);
  Date2 = dateStringIntoInt(inputDate2);
  console.log(Date1);
  if (Date1[0] == -1 || Date1[0] == -1)
    return false;
  const date1 = new Date(Date1[0], Date1[1], Date1[2], Date1[3]);
  const date2 = new Date(Date2[0], Date2[1], Date2[2], Date2[3]);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = (diffTime / (1000 * 60 * 60 * 24));
  console.log(diffDays + " days");
  if (diffDays >= 7 || diffDays <= 0){
    alert("the activity should last between 1 hr and 7 days");
    return false;
  }
    
  return true;
}

function dateStringIntoInt(inputDate: string) {
  const dayNumbers = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const year = parseInt(inputDate.substring(0, 4));
  const month = parseInt(inputDate.substring(5, 7));
  const date = parseInt(inputDate.substring(8, 10));
  const hour = parseInt(inputDate.substring(11, 13));
  if (year % 4 == 0 && (year % 100 !== 0 || year % 400 == 0))
    dayNumbers[2] = 29;
  if (month > 12 || month < 1) {
    alert("month not valid");
    return [-1, -1, -1, -1];
    // return;
  }
  if (date > dayNumbers[month] || date < 1) {
    alert("date not valid");
    return [-1, -1, -1, -1];
    // return;
  }
  if (hour > 23 || hour < 0) {
    alert("hour not valid");
    return [-1, -1, -1, -1];
    // return;
  }
  // numResult = [year, month, date, hour];
  return [year, month, date, hour];
}




