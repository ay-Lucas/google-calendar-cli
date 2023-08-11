import chalk from "chalk";
import { createSpinner } from "nanospinner";
import { calendar, calendarNameToId } from "./calendar.js";
import { formatDate, getTimezone } from "./dates.js";
import { auth } from "./googleauth.js";
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
		});
		const events = res.data.items;
		// stops spinner
		spinner.success();
		console.log(chalk.green(calendarName) + ":");
		if (!events || events.length === 0) {
			console.log("No upcoming events found.");
			return;
		}
		// eslint-disable-next-line no-unused-vars
		events.map((event, i) => {
			const start = event.start.dateTime || event.start.date;
			// console.log(start);
			console.log(`${formatDate(start)} - ${event.summary}`);
		});
	} catch (error) {
		spinner.error();
		console.log(`list events API error ${error}`);
	}
}

export async function addEvents(summary, calendarName, description, timeStart, timeEnd) {
	const spinner = createSpinner().start();
	await calendar.events.insert({
		calendarId: await calendarNameToId(calendarName),
		auth: auth,
		requestBody: {
			summary: summary,
			description: description,
			start: {
				dateTime: timeStart,
				timeZone: getTimezone(),
			},
			end: {
				dateTime: timeEnd,
				timeZone: getTimezone(),
			},
		},
	});
	spinner.success();
}
