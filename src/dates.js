import chalk from "chalk";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
const isEmpty = (index) => index !== "" && index !== " " && typeof index !== "undefined" && index;
export function formatDate(string) {
	let date, time, formattedDate;
	if (string.indexOf(":") !== -1) {
		let split = string.split(":", 1);
		date = dayjs(split[0]).format("ddd M/D");
		time = dayjs(split[1]).format("h:mm a");
		formattedDate = `${chalk.cyan(date)} ${chalk.green(time)}`;
		// formattedDate = chalk.cyan(date.format("ddd M/D h:mm a"));
	} else {
		let dayjsObj = dayjs(string);
		formattedDate = `${chalk.cyan(dayjsObj.format("ddd M/D"))}`;
	}
	return formattedDate;
}
export function formatTime(string) {
	let formattedDate = dayjs(string);
	return chalk.cyan(formattedDate.format("HH:MM"));
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
function validateTime(hour, minutes) {
	let str;
	console.log(hour, minutes);
	minutes = minutes.toLowerCase();
	if (minutes.endsWith("pm") || minutes.endsWith("p")) {
		str = minutes.endsWith("pm") ? "pm" : "p";
		hour = hour + 12;
	} else if (minutes.endsWith("am") || minutes.endsWith("a")) {
		str = minutes.endsWith("am") ? "am" : "a";
	}
	if (hour > 23) {
		hour = 0;
	}
	minutes = parseInt(minutes.split(str, 1)[0]);
	return [hour, minutes];
}
export function parseDate(string) {
	let time, date, month, day, year, hour, minutes, formattedDate;
	const isTimeStr = (str) => str.indexOf(":") !== -1;

	if (string.indexOf(" ") === -1 || string.indexOf(":") === -1) return;
	// split date and time
	let split = string.split(" ");
	console.log(split);
	// remove whitespace
	split = split.map((element) => element.trim());
	// checks for empty indicies
	split = split.filter(isEmpty);
	console.log(split);
	if (split.length === 2) {
		// index that has a colon ':' indicates a time.
		// reverses array if the first index does not contain a colon ':'
		let timeIndex = split.findIndex(isTimeStr);
		console.log(timeIndex);
		split = timeIndex > 0 ? split.reverse() : split;
	}
	time = split[0];
	hour = parseHours(time); // Type === Number
	minutes = parseMinutes(time); // Type === String
	console.log(minutes);
	[hour, minutes] = validateTime(hour, minutes);
	date = split[1];
	// split time into hours and minutes
	// minutes = time.split(":")[1];
	// split date into month and day and possibly year
	date = date.split("/");
	month = date[0];
	day = date[1];
	year = date.length > 2 ? date[2] : dayjs().year();
	// add full year if abbreviated
	year = year.length === 2 ? `20${year}` : year;
	console.log(year, month, day, hour, minutes);
	try {
		// convert String to Number
		minutes = parseInt(minutes);
		// hour = parseInt(hour);
		day = parseInt(day);
		month = parseInt(month) - 1;
	} catch (error) {
		console.log(`Integer parsing error ${error}`);
	}
	let d = new Date();
	formattedDate = dayjs(d);
	console.log(year, month, day, hour, minutes);
	try {
		formattedDate = formattedDate.set("years", year).set("month", month).set("D", day).set("hours", hour).set("minute", minutes);
		console.log(formattedDate);
		return formattedDate.toISOString();
	} catch (error) {
		console.log(`Daysjs date parsing error ${error}`);
	}
}
