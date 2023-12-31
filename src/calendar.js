import chalk from "chalk";
import fsPromise from "fs/promises";
import { google } from "googleapis";
import { createSpinner } from "nanospinner";
import path from "path";
import { fileURLToPath } from "url";
import { auth } from "./googleauth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const user_data_path = path.join(__dirname, "user_data.json");
export const calendar = google.calendar({ version: "v3", auth });
export async function calendarNameToId(calendarName) {
	return calendarName !== "primary" ? await getCalID(calendarName) : calendarName;
}
export async function listCalendars() {
	if (!auth) {
		return;
	}
	const spinner = createSpinner().start();
	try {
		const res = await calendar.calendarList.list({
			auth: auth,
		});
		const calendarList = res.data.items;
		spinner.success();
		if (!calendarList || calendarList.length === 0) {
			console.log("No calendar ID's found.");
			return;
		}
		calendarList.map((calID, i) => {
			console.log(calID);
		});
	} catch (error) {
		console.log(`Calendar list API error ${error}`);
	}
}
async function getCalID(calendarName) {
	let id;
	const info = await fsPromise.readFile(user_data_path);
	const data = JSON.parse(info);
	const calendarNames = data.calendar_list;
	calendarNames.forEach((calendar) => {
		if (calendarName.toLowerCase() === calendar.summary.toLowerCase()) {
			id = calendar.id;
			return;
		}
	});
	return id;
}

async function getCalendarNames() {
	let arr = [];
	try {
		const info = await fsPromise.readFile(user_data_path);
		const data = JSON.parse(info);
		const calendarData = data.calendar_list;
		calendarData.forEach((calendar) => {
			arr.push(calendar.summary);
		});
	} catch (error) {
		console.log(error);
	}
	for (let i = 0; i < arr.length; i++) {
		arr[i] = arr[i].toLowerCase();
	}

	return arr;
}
export const calendarNames = await getCalendarNames();
export async function listCalendarNames() {
	const names = await getCalendarNames();
	console.log(`(${chalk.cyan(names.length)}) Calendar Names: \n`);
	names.forEach((calendar) => console.log(chalk.blueBright(`- ${calendar}`)));
}
