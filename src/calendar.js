import fsPromise from "fs/promises";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import { auth } from "./googleauth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CALINFO_PATH = path.join(__dirname, "calInfo.json");
export const calendar = google.calendar({ version: "v3", auth });

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

export async function calendarNameToId(calendarName) {
	return calendarName !== "primary" ? await getCalID(calendarName) : calendarName;
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
function doesCalInfoExist() {
	if (fs.existsSync(CALINFO_PATH)) {
		console.log("file already exists");
		return null;
	}
}
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
