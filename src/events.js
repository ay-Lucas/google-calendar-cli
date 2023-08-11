import fsPromise from "fs/promises";
import { google } from "googleapis";
import { createSpinner } from "nanospinner";
import path from "path";
import { fileURLToPath } from "url";
import { formatDate, getTimezone } from "./dates.js";
import { auth } from "./googleauth.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const calendar = google.calendar({ version: "v3", auth });
const CALINFO_PATH = path.join(__dirname, "calInfo.json");

async function calendarNameToId(calendarName) {
	return calendarName !== "primary" ? await getCalID(calendarName) : calendarName;
}
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
export async function listCalendars() {
	if (!auth) {
		return;
	}
	const spinner = createSpinner().start();
	// creates spinner in console
	try {
		const res = await calendar.calendarList.list({
			auth: auth,
		});
		const calendarList = res.data.items;
		spinner.success();
		// stops spinner
		if (!calendarList || calendarList.length === 0) {
			console.log("No calendar ID's found.");
			return;
		}
		// eslint-disable-next-line no-unused-vars
		calendarList.map((calID, i) => {
			console.log(calID);
		});
	} catch (error) {
		console.log(`Calendar list API error ${error}`);
	}
}
function doesCalInfoExist() {
	if (fs.existsSync(CALINFO_PATH)) {
		console.log("file already exists");
		return null;
	}
}
// summary is the google calendar name/title
async function getCalID(calendarName) {
	let id;
	const info = await fsPromise.readFile(CALINFO_PATH);
	const data = JSON.parse(info);
	// console.log(data);
	console.log("calendar name: " + calendarName);
	data.forEach((calendar) => {
		if (calendarName.toLowerCase() === calendar.summary.toLowerCase()) {
			id = calendar.id;
			return;
		}
	});
	console.log(id);
	return id;
}
// async function getCalendarData(calendarProperty) {
// 	const info = await fsPromise.readFile(CALINFO_PATH);
// 	const data = JSON.parse(info);
// 	// console.log(data);
// 	console.log("calendar name: " + calendarName);
// 	data.forEach((calendar) => {
// 		if (calendarName.toLowerCase() === calendar.summary.toLowerCase()) {
// 			id = calendar.id;
// 			return;
// 		}
// 	});
// }
export async function writeCalendarIDFile() {
	if (!auth || !doesCalInfoExist()) {
		return;
	}
	const spinner = createSpinner().start();
	// creates spinner in console
	try {
		const res = await calendar.calendarList.list({
			auth: auth,
		});
		const calendarList = res.data.items;
		fs.writeFile(CALINFO_PATH, JSON.stringify(calendarList), (err) => {
			if (err) throw new Error("calendar list id write error");
			console.log("calinfo.json done writing");
		});
		// eslint-disable-next-line no-unused-vars
		spinner.success();
	} catch (error) {
		console.log(`Calendar list API error ${error}`);
	}
}

// const calendarID = {
// 	summary: sum,
// 	description: desc,
// 	id: id,
// };
