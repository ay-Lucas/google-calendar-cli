import chalk from "chalk";
import { createSpinner } from "nanospinner";
import { calendar, calendarNameToId } from "./calendar.js";
import { formatDate, formatTime, getDiffInDateTime, getTimezone, parseDateTimeInput } from "./dates.js";
import { auth } from "./googleauth.js";

const handleFormat = (start, end, summary) => {
	let time;
	let hourDifference = getDiffInDateTime(start, end);
	if (hourDifference === 24) {
		time = `${formatDate(start)}`;
	} else if (hourDifference < 5) {
		time = `${formatDate(start)} - ${formatTime(end)}`;
	} else {
		time = `${formatDate(start)} - ${formatDate(end)}`;
	}
	console.log(`${chalk.bgGrey(time)} \n${chalk.cyan(summary)}\n`);
	// console.log("----------------------------------");
};
export async function listEvents(num, calendarName) {
	if (!auth) {
		return;
	}
	const spinner = createSpinner().start(); // creates spinner in console

	try {
		const res = await calendar.events.list({
			calendarId: await calendarNameToId(calendarName),
			timeMin: new Date().toISOString(),
			maxResults: num,
			singleEvents: true,
			orderBy: "startTime",
			// timeMax:
		});
		const events = res.data.items;
		// stops spinner
		spinner.success();
		if (!events || events.length === 0) {
			console.log("No upcoming events found.");
			return;
		}

		// eslint-disable-next-line no-unused-vars
		console.log(chalk.greenBright.bold(calendarName) + ": " + "\n");
		events.map((event, i) => {
			const start = event.start.dateTime || event.start.date;
			const end = event.end.dateTime || event.end.date;
			const summary = event.summary;
			handleFormat(start, end, summary);
			// console.log(event);
		});
	} catch (error) {
		spinner.error();
		console.log(`list events API error ${error}`);
	}
}

export async function addEvents(calendarName, title, description, timeStart, timeEnd) {
	const spinner = createSpinner().start();
	await calendar.events.insert({
		calendarId: await calendarNameToId(calendarName),
		auth: auth,
		requestBody: {
			summary: title,
			description: description,
			start: {
				dateTime: parseDateTimeInput(timeStart),
				timeZone: getTimezone(),
			},
			end: {
				dateTime: parseDateTimeInput(timeEnd),
				timeZone: getTimezone(),
			},
		},
	});
	spinner.success();
	console.log(`Event successfully added\n------------------------\n${formatEventDateTime(timeStart, timeEnd)} - ${(calendarName, title)}`);
}
