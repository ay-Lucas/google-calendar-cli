import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
const isEmpty = (index) => index !== "" && index !== " " && typeof index !== "undefined" && index;
// export function formatEventDateTime(start, end) {
// 	let date, time, formattedDate;
// 	let last;
// 	let arr = [start, end];
// 	let formattedDates = [];
// 	const tz = "America/New_York";
// 	console.log(start, end);
// 	for (let i = 0; i < arr.length; i++) {
// 		let dateStr = dayjs(arr[i]).format("M/D dddd|h:mm a", tz);
// 		// let dateTime = dateStr.tz(tz);
// 		console.log(dateStr);
// 		let split = dateStr.split("|", 2);
// 		date = split[0];
// 		time = split[1];
// 		if (i === 0) {
// 			formattedDate = `${chalk.bgGrey(date)}\n ${chalk.green(time)}`;
// 		} else {
// 			formattedDate = `${chalk.green(time)}`;
// 		}
// 		if (last === time) {
// 			formattedDates = `${chalk.bgGrey(date)}`;
// 		} else {
// 			formattedDates.push(formattedDate);
// 			last = time;
// 		}
// 	}

// 	return typeof formattedDates === "object" ? formattedDates.join(" - ") : formattedDates;
// }
// export const getTime = (dateStr) => {
// 	let hours = dateStr.getHours();
// 	return dayjs(date).get("hours");
// };
export const formatDate = (str) => {
	let date = dayjs(str);
	date = date.tz("utc");
	// console.log(str);
	// console.log(getTimezone());
	if (date.get("h") === 0) {
		return date.format("M/D dddd");
	} else {
		return date.format("M/D dddd h:mm A");
	}
};
// returns difference in hours
export const getDiffInDateTime = (dateTime1, dateTime2) => {
	return dayjs(dateTime2).diff(dayjs(dateTime1), "hours");
};
export function formatTime(string) {
	let formattedDate = dayjs(string);
	return formattedDate.format("LT");
	// return chalk.cyan(formattedDate.format("hh:mm"));
}
export function getTimezone() {
	return dayjs.tz.guess();
}
function parseHours(time) {
	return parseInt(time.split(":", 1)[0]);
}
function parseMinutes(time) {
	return time.split(":")[1];
}
function checkAmPm(string) {
	string = string.toLowerCase();
	if (string.endsWith("pm") || string.endsWith("p")) {
		return "pm";
	} else if (string.endsWith("am") || string.endsWith("a")) {
		return "am";
	} else {
		return false;
	}
}
function parseAm(time) {
	let str = time.endsWith("am") ? "am" : "a";
	let h = parseInt(time.split(str)[0]);
	return h + 12 > 23 ? 0 : h + 12;
}
function parsePm(time) {
	let str = time.endsWith("pm") ? "pm" : "p";
	let h = parseInt(time.split(str)[0]);
	return h + 12 > 23 ? 0 : h + 12;
}
function handleNoMinutes(time) {
	let hour, minutes;
	time = time.toLowerCase();
	if (checkAmPm(time) === "pm") {
		hour = parsePm(time);
	} else if (checkAmPm(time) === "am") {
		hour = parseAm(time);
	}
	minutes = 0;
	return [hour, minutes];
}
function handleTime(time) {
	let hour, minutes, str;
	// if no minutes are given
	if (time.indexOf(":") === -1) {
		return handleNoMinutes(time);
	}
	hour = parseHours(time); // Type === Number
	minutes = parseMinutes(time); // Type === String

	minutes = minutes.toLowerCase();
	if (checkAmPm(minutes) === "pm") {
		str = minutes.endsWith("pm") ? "pm" : "p";
		hour = hour + 12 > 23 ? 0 : hour + 12;
	} else if (checkAmPm(minutes) === "am") {
		str = minutes.endsWith("am") ? "am" : "a";
	}
	minutes = parseInt(minutes.split(str, 1)[0]);
	return [hour, minutes];
}
/*
 * parses user inputted Date Times delimited by either '/' or '-'
 * and optionally 12 hour clock
 */
export function parseDateTimeInput(string) {
	let time, date, month, day, year, hour, minutes, formattedDate;
	// date delimited by '/' or '-'
	const isTimeStr = (str) => str.indexOf("/") === -1 && str.indexOf("-") === -1;

	if (string.indexOf(" ") === -1) return;
	// split date and time
	let split = string.split(" ");
	// remove whitespace
	split = split.map((element) => element.trim());
	// checks for empty indicies
	split = split.filter(isEmpty);
	if (split.length === 3) {
		let arr = [];
		if (checkAmPm(split[2]) === false && checkAmPm(split[1]) === false) return;
		let temp = split.findIndex((element) => checkAmPm(element) === "am" || checkAmPm(element) === "pm");
		// console.log(temp);
		for (let i = 0; i < split.length; i++) {
			if (i === temp) {
				continue;
			} else if (i === temp - 1) {
				arr.push(split[i].concat(split[temp]));
			} else {
				arr.push(split[i]);
			}
		}
		split = arr;
		// console.log(split);
	} else if (split.length !== 2) {
		throw new Error("Argument must provide both Date and Time, separated by a space");
	}
	// index that has a colon ':' indicates a time.
	// reverses array if the first index does not contain a colon ':'
	let timeIndex = split.findIndex(isTimeStr);
	split = timeIndex > 0 ? split.reverse() : split;
	time = split[0];
	date = split[1];
	[hour, minutes] = handleTime(time);

	// split date into month and day and possibly year
	date = date.split("/");
	month = date[0];
	day = date[1];
	year = date.length > 2 ? date[2] : dayjs().year();
	// add full year if abbreviated
	year = year.length === 2 ? `20${year}` : year;
	day = parseInt(day);
	month = parseInt(month) - 1;
	let d = new Date();
	formattedDate = dayjs(d);
	// console.log(year, month, day, hour, minutes);
	try {
		formattedDate = formattedDate.set("years", year).set("month", month).set("D", day).set("hours", hour).set("minute", minutes);
		return formattedDate.format("YYYY-MM-DDTHH:mm:ss[Z]");
	} catch (error) {
		console.log(`Daysjs date parsing error ${error}`);
	}
}
