import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import objectSupport from "dayjs/plugin/objectSupport.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import { isEmpty } from "./utils.js";
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(objectSupport);
const isTimeStr = (str) => str.indexOf("/") === -1 && str.indexOf("-") === -1;
const dateRegEx = new RegExp(/^\d{4}(\/|-)(0[1-9]|1[012])(\/|-)(0[1-9]|[12][0-9]|3[01])$/);

export const formatDate = (str) => {
	const dateObj = dayjs(str);
	const hoursLeft = dateObj.get("hours");
	if (dateRegEx.test(str) || hoursLeft < 1) {
		return dateObj.format("M/D dddd");
	} else {
		return dateObj.format("M/D dddd h:mm A");
	}
};
export const convertTimeZoneToUTC = (date) => {
	let dateObj = dayjs(date);
	let utc = dateObj.tz("utc", true);
	return utc;
};
export const getDiffInDateTime = (dateTime1, dateTime2) => {
	return dayjs(dateTime2).diff(dayjs(dateTime1), "hours");
};
export function formatTime(string) {
	let formattedDate = dayjs(string);
	return formattedDate.format("LT");
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
	hour = parseHours(time);
	minutes = parseMinutes(time);

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
export function parseDateTimeInput(input) {
	let time, date, hour, minutes, formattedDate, split;

	let trimmedStr = input.trim();
	if (trimmedStr.indexOf(" ") !== -1) {
		split = trimmedStr.split(" ");
		split = split.map((element) => element.trim());
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
		} else if (split.length !== 2) {
			throw new Error("Argument must provide both Date and Time, separated by a space");
		}
		let timeIndex = split.findIndex(isTimeStr);
		split = timeIndex > 0 ? split.reverse() : split;
		time = split[0];
		[hour, minutes] = handleTime(time);
		// console.log(hour, minutes);

		date = parseDateOnly(split[1]);
		let dateStr = dayjs(date);
		dateStr = dateStr.tz(getTimezone());
		try {
			formattedDate = dateStr.set("hours", hour).set("minutes", minutes);
			formattedDate = formattedDate.format("YYYY-MM-DDTHH:mm:ssZ");
			console.log("formatted Date Time: " + formattedDate);
			return formattedDate;
		} catch (error) {
			console.log(`Daysjs date parsing error ${error}`);
		}
	} else {
		try {
			let date = parseDateOnly(trimmedStr);
			formattedDate = dayjs(date).format("YYYY-MM-DDTHH:mm:ssZ");
			// console.log("formatted Date: " + formattedDate);
			return formattedDate;
		} catch (error) {
			console.log(`Daysjs date parsing error ${error}`);
		}
	}
}
const parseDateOnly = (dateStr) => {
	// check for delimiters '-' '/'
	let delimiter;
	if (isTimeStr(dateStr)) return;
	if (dateStr.indexOf("/") !== -1) {
		delimiter = "/";
	} else if (dateStr.indexOf("-") !== -1) {
		delimiter = "-";
	} else {
		return;
	}
	try {
		let str = dateStr.split(delimiter);
		let year = str.length === 3 ? parseInt(str[2], 10) : dayjs().get("year");
		let month = parseInt(str[0], 10) - 1;
		let day = parseInt(str[1], 10);
		const date = new dayjs({ year: year, month: month, day: day });
		// console.log(`datestr: ${dateStr} str: ${str} month: ${month} day: ${day} year: ${year} date: ${date}`);
		// console.log("Date Only parse: " + date.format("YYYY-MM-DDTHH"));
		return date;
	} catch (error) {
		console.log(`Error in parseDateOnly: ${error}`);
	}
};
