/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable indent */
import chalk from "chalk";
import { createSpinner } from "nanospinner";
import { calendar, calendarNameToId } from "./calendar.js";
import { addHour, formatDate, formatTime, getDiffInDateTime, parseDateTimeInput } from "./dates.js";
import { auth } from "./googleauth.js";
import { bubbleSort } from "./utils.js";
const handlePrint = (start, end, summary, i, id) => {
	let time;
	let hourDifference = getDiffInDateTime(start, end);
	if (hourDifference === 24 || hourDifference === 0) {
		time = `${formatDate(start)}`;
	} else if (hourDifference < 5) {
		time = `${formatDate(start)} - ${formatTime(end)}`;
	} else {
		time = `${formatDate(start)} - ${formatDate(end)}`;
	}

	console.log(`${typeof id === "string" ? chalk.green(i) + " " : ""}${chalk.bgGray(summary)}\n${chalk.cyan(time)}`);
	if (typeof id === "string") console.log(`Event ID: ${chalk.green(id)}`);
	console.log("----------------------------");
};
export async function listEvents(num, calendarName, doListId) {
	if (!auth) {
		return;
	}
	const calendarId = await calendarNameToId(calendarName);
	const spinner = createSpinner().start();
	const events = await getEvents(num, calendarId);
	spinner.success();

	console.log(`${chalk.greenBright.bold(calendarName + " calendar:")}\n`);
	events.map((event, i) => {
		// if (num > 1 && num !== 250) console.log(i);
		const start = event.start.dateTime || event.start.date;
		const end = event.end.dateTime || event.end.date;
		const summary = event.summary;
		handlePrint(start, end, summary, i, doListId === true ? event.id : false);
	});
}
export async function deleteEvent(eventIdArray, calendarName) {
	const spinner = createSpinner().start();
	const calendarId = await calendarNameToId(calendarName);
	// checks if array contains event indicies or event Ids
	const isIndexArray = eventIdArray.every((element) => !isNaN(parseInt(element)));
	if (isIndexArray) {
		const indexArray = await bubbleSort(eventIdArray);
		// console.log(indexArray);
		const events = await getEvents(null, calendarId);
		let arr = [];
		for (let i = 0; i < indexArray.length; i++) {
			if (indexArray[i] > events.length - 1) {
				console.log(chalk.red(`${calendarName} event ${indexArray[i]} cannot be found`));
				throw new Error("An invalid index was provided");
			}
			console.log(events.length);
			arr.push(events[indexArray[i]].id);
		}
		eventIdArray = arr;
	}
	try {
		await eventIdArray.forEach(async (id) => {
			await postDeleteEvent(id, calendarId);
		});
		console.log(`\n${eventIdArray.length} Event${eventIdArray.length > 1 ? "s" : ""} successfully deleted\n----------------------------`);
	} catch (error) {
		console.log(`Error deleting event: ${error}`);
		spinner.error();
	}
	spinner.success();
}
async function postDeleteEvent(id, calendarId) {
	calendar.events.delete({
		auth: auth,
		calendarId: calendarId,
		eventId: id,
	});
}
async function getEvents(num, calendarId) {
	const maxResults = 250;
	num = parseInt(num);
	if (typeof num !== "number" || num < 1 || isNaN(num)) num = maxResults;
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
