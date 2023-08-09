import chalk from "chalk";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
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
export function parseDate(string) {
	let time, date, month, day, year, hour, minutes, formattedDate;
	if (string.indexOf(" ") !== -1) {
		if (string.indexOf(":") !== -1) {
			// split date and time
			time = string.split(" ")[0];
			date = string.split(" ")[1];
			// split hours and minutes
			hour = time.split(":")[0];
			minutes = time.split(":")[1];
			// split month and day
			month = date.split("/")[0];
			day = date.split("/")[1];
			// TODO: add year changing
			try {
				let possibleYear = date.split("/")[2];
				year = possibleYear !== undefined ? possibleYear : dayjs().year();
				year = year.length === 2 ? `20${year}` : year;
				// convert String to Number
				month = parseInt(month) - 1;
				day = parseInt(day);
				minutes = parseInt(minutes);
				hour = parseInt(hour);
			} catch (error) {
				console.log(`date parsing error ${error}`);
			}
			let d = new Date();
			formattedDate = dayjs(d);
			// 12 hour === h
			console.log(day);
			formattedDate = formattedDate.set("years", year).set("month", month).set("D", day).set("hours", hour).set("minute", minutes);
			console.log(formattedDate);
		}
	}
	console.log(formattedDate.toISOString());
	return formattedDate.toISOString();
}
