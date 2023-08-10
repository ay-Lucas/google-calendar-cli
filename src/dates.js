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
function validateTime(time) {
	let hour, minutes;
	let str;
	// split time into hours and minutes
	// if no minutes are given
	// console.log(time);
	if (time.indexOf(":") === -1) {
		if (time.endsWith("pm") || time.endsWith("p")) {
			str = time.endsWith("pm") ? "pm" : "p";
			hour = parseInt(time.split(str)[0]);
			hour = hour + 12 > 23 ? 0 : hour + 12;
		} else if (time.endsWith("am") || time.endsWith("a")) {
			str = time.endsWith("am") ? "am" : "a";
			hour = parseInt(time.split(str)[0]);
		}
		minutes = 0;
		console.log(hour, minutes);
		return [hour, minutes];
	}
	hour = parseHours(time); // Type === Number
	minutes = parseMinutes(time); // Type === String

	console.log(hour, minutes);
	minutes = minutes.toLowerCase();
	if (minutes.endsWith("pm") || minutes.endsWith("p")) {
		str = minutes.endsWith("pm") ? "pm" : "p";
		hour = hour + 12 > 23 ? 0 : hour + 12;
	} else if (minutes.endsWith("am") || minutes.endsWith("a")) {
		str = minutes.endsWith("am") ? "am" : "a";
	}

	minutes = parseInt(minutes.split(str, 1)[0]);
	return [hour, minutes];
}
export function parseDate(string) {
	let time, date, month, day, year, hour, minutes, formattedDate;
	// date delimited by '/' or '-'
	const isTimeStr = (str) => str.indexOf("/") === -1 && str.indexOf("-") === -1;

	if (string.indexOf(" ") === -1) return;
	// split date and time
	let split = string.split(" ");
	console.log(split);
	// remove whitespace
	split = split.map((element) => element.trim());
	// checks for empty indicies
	split = split.filter(isEmpty);
	console.log(split);
	if (split.length !== 2) {
		// console.log("");
		throw new Error("Argument must provide both Date and Time, separated by a space");
	}
	// index that has a colon ':' indicates a time.
	// reverses array if the first index does not contain a colon ':'
	let timeIndex = split.findIndex(isTimeStr);
	console.log(timeIndex);
	split = timeIndex > 0 ? split.reverse() : split;

	console.log(minutes);
	time = split[0];
	date = split[1];
	[hour, minutes] = validateTime(time);

	// split date into month and day and possibly year
	date = date.split("/");
	month = date[0];
	day = date[1];
	year = date.length > 2 ? date[2] : dayjs().year();
	// add full year if abbreviated
	year = year.length === 2 ? `20${year}` : year;
	console.log(year, month, day, hour, minutes);
	day = parseInt(day);
	month = parseInt(month) - 1;
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
