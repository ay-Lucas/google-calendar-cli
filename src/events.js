/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable indent */
import chalk from "chalk";
import { createSpinner } from "nanospinner";
import { calendar, calendarNameToId } from "./calendar.js";
import { addHour, formatDate, formatTime, getDiffInDateTime, parseDateTimeInput } from "./dates.js";
import { auth } from "./googleauth.js";

const handlePrint = (start, end, summary) => {
	let time;
	let hourDifference = getDiffInDateTime(start, end);
	if (hourDifference === 24 || hourDifference === 0) {
		time = `${formatDate(start)}`;
	} else if (hourDifference < 5) {
		time = `${formatDate(start)} - ${formatTime(end)}`;
	} else {
		time = `${formatDate(start)} - ${formatDate(end)}`;
	}
	console.log(`${chalk.bgGrey(time)} \n${chalk.cyan(summary)}\n`);
};
// export async function listEvents(num, calendarName, doListId) {
// 	if (!auth) {
// 		return;
// 	}
// 	const maxResults = 250;
// 	num = parseInt(num);
// 	if (typeof num !== "number" || num < 1 || isNaN(num)) num = maxResults;
// 	const spinner = createSpinner().start();

// 	const events = getEvents(num, calendarName);
// 	try {
// 		const res = await calendar.events.list({
// 			calendarId: await calendarNameToId(calendarName),
// 			timeMin: new Date().toISOString(),
// 			maxResults: num,
// 			singleEvents: true,
// 			orderBy: "startTime",
// 			// timeMax:
// 		});
// 		const events = res.data.items;
// 		spinner.success();
// 		if (!events || events.length === 0) {
// 			console.log("No upcoming events found.");
// 			return;
// 		}

// 		// eslint-disable-next-line no-unused-vars
// 		console.log(`${chalk.greenBright.bold(calendarName + " calendar:")}\n`);
// 		events.map((event, i) => {
// 			if (doListId) console.log(`Event ID: ${chalk.green(event.id)}`);
// 			if (num > 1 && num !== 250) console.log(i);
// 			const start = event.start.dateTime || event.start.date;
// 			const end = event.end.dateTime || event.end.date;
// 			const summary = event.summary;
// 			handlePrint(start, end, summary);
// 		});
// 	} catch (error) {
// 		spinner.error();
// 		console.log(`list events API error ${error}`);
// 	}
// }
export async function listEvents(num, calendarName, doListId) {
	if (!auth) {
		return;
	}

	const maxResults = 250;
	num = parseInt(num);
	if (typeof num !== "number" || num < 1 || isNaN(num)) num = maxResults;

	const calendarId = await calendarNameToId(calendarName);
	const spinner = createSpinner().start();
	const events = await getEvents(num, calendarId);
	spinner.success();

	console.log(`${chalk.greenBright.bold(calendarName + " calendar:")}\n`);
	events.map((event, i) => {
		if (doListId) console.log(`Event ID: ${chalk.green(event.id)}`);
		if (num > 1 && num !== 250) console.log(i);
		const start = event.start.dateTime || event.start.date;
		const end = event.end.dateTime || event.end.date;
		const summary = event.summary;
		handlePrint(start, end, summary);
	});
}
export async function deleteEvent(eventId, calendarName) {
	const spinner = createSpinner().start();
	const calendarId = await calendarNameToId(calendarName);
	try {
		eventId.forEach((id) => {
			calendar.events.delete({
				auth: auth,
				calendarId: calendarId,
				eventId: id,
			});
		});
	} catch (error) {
		console.log(`Error deleting event: ${error}`);
		spinner.error();
	}
	console.log(`\n${eventId.length} Event${eventId.length > 1 ? "s" : ""} successfully deleted\n----------------------------`);
	spinner.success();
}
// export function deleteEventsWithNumber(numArray, calendarName){
// 	const
// }
async function getEvents(num, calendarId) {
	try {
		const res = await calendar.events.list({
			calendarId: calendarId,
			timeMin: new Date().toISOString(),
			maxResults: num,
			singleEvents: true,
			orderBy: "startTime",
		});
		return res.data.items;
	} catch (error) {
		throw new Error(`list events API error ${error}`);
	}
}
export async function addEvents(calendarName, title, description, timeStart, timeEnd) {
	const spinner = createSpinner().start();
	const start = parseDateTimeInput(timeStart);
	const dateTimeArr = start.split("T");
	const date = dateTimeArr[0];
	const time = dateTimeArr[1];
	const isEventAllDay = time.substring(0, 2) === "00" && typeof timeEnd === "undefined";
	let end;
	if (isEventAllDay) {
		end = parseDateTimeInput(timeStart);
	} else if (typeof timeEnd === "undefined") {
		end = parseDateTimeInput(timeStart);
		end = addHour(end);
	} else {
		end = parseDateTimeInput(timeEnd);
	}
	// console.log(`start: ${start}, ${end}, ${date}`);
	const requestBody = isEventAllDay
		? {
				summary: title,
				description: description,
				start: {
					date: date,
				},
				end: {
					date: date,
				},
		  }
		: // Timed Event Request
		  {
				summary: title,
				description: description,
				start: {
					dateTime: start,
				},
				end: {
					dateTime: end,
				},
		  };
	await calendar.events.insert({
		calendarId: await calendarNameToId(calendarName),
		auth: auth,
		requestBody: requestBody,
	});
	spinner.success();
	console.log(`Event successfully added to ${chalk.greenBright(calendarName)} calendar\n------------------------\n`);
	handlePrint(start, end, title);
}
