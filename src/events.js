import { google } from "googleapis";
import { createSpinner } from "nanospinner";
import { formatDate, getTimezone } from "./dates.js";
import { auth } from "./index.js";
const calendar = google.calendar({ version: "v3", auth });

export async function listEvents(num) {
	if (!auth) {
		return;
	}
	// console.log(`Upcoming ${num} events:`);
	const spinner = createSpinner().start();
	// creates spinner in console
	try {
		const res = await calendar.events.list({
			calendarId: "primary",
			timeMin: new Date().toISOString(),
			maxResults: num,
			singleEvents: true,
			orderBy: "startTime",
		});
		const events = res.data.items;
		spinner.success();
		// stops spinner
		// converts into check mark
		if (!events || events.length === 0) {
			console.log("No upcoming events found.");
			return;
		}
		// eslint-disable-next-line no-unused-vars
		events.map((event, i) => {
			const start = event.start.dateTime || event.start.date;
			console.log(`${formatDate(start)} - ${event.summary}`);
		});
	} catch (error) {
		console.log(`list events API error ${error}`);
	}
}

export async function addEvents(summary, description, timeStart, timeEnd) {
	const spinner = createSpinner().start();
	await calendar.events.insert({
		calendarId: "primary",
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
