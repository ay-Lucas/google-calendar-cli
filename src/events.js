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
};
export async function listEvents(num, calendarName, listId) {
	if (!auth) {
		return;
	}
	const spinner = createSpinner().start();

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
		spinner.success();
		if (!events || events.length === 0) {
			console.log("No upcoming events found.");
			return;
		}

		// eslint-disable-next-line no-unused-vars
		console.log(`${chalk.greenBright.bold(calendarName + " calendar:")}\n`);
		events.map((event, i) => {
			if (listId) console.log(`Task ID: ${chalk.green(event.id)}`);
			const start = event.start.dateTime || event.start.date;
			const end = event.end.dateTime || event.end.date;
			const summary = event.summary;
			handleFormat(start, end, summary);
		});
	} catch (error) {
		spinner.error();
		console.log(`list events API error ${error}`);
	}
}
export async function deleteEvent(calendarName, eventId) {
	try {
		await calendar.events.delete({
			auth: auth,
			calendarId: await calendarNameToId(calendarName),
			id: eventId,
		});
	} catch (error) {
		console.log(`Error deleting event: ${error}`);
	}
}
export async function addEvents(calendarName, title, description, timeStart, timeEnd) {
	const spinner = createSpinner().start();
	const start = parseDateTimeInput(timeStart);
	const end = parseDateTimeInput(timeEnd);
	await calendar.events.insert({
		calendarId: await calendarNameToId(calendarName),
		auth: auth,
		requestBody: {
			summary: title,
			description: description,
			start: {
				dateTime: start,
				// timeZone: getTimezone(),
			},
			end: {
				dateTime: end,
				// timeZone: getTimezone(),
			},
		},
	});
	spinner.success();
	console.log(`Event successfully added to ${chalk.greenBright(calendarName)} calendar\n------------------------\n`);
	handleFormat(start, end, title);
}
