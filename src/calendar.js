import chalk from "chalk";
import fs from "fs";
import fsPromise from "fs/promises";
import { google } from "googleapis";
import { createSpinner } from "nanospinner";
import path from "path";
import { fileURLToPath } from "url";
import { auth } from "./googleauth.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const user_data = path.join(__dirname, "user_data.json");

export const calendar = google.calendar({ version: "v3", auth });

export async function calendarNameToId(calendarName) {
	return calendarName !== "primary" ? await getCalID(calendarName) : calendarName;
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
// checks if user_data.json exists
export function doesUserDataFileExist() {
	return fs.existsSync(user_data);
}

export async function writeCalendarIDFile() {
	if (doesUserDataFileExist()) {
		console.log("user data file already exists\n Google Calendar CLI is already setup!");
		return;
	}
	console.log("saving user data..");
	const spinner = createSpinner().start();
	// creates spinner in console
	try {
		const res = await calendar.calendarList.list({
			auth: auth,
		});
		const calendarList = res.data.items;
		fs.writeFile(user_data, JSON.stringify(calendarList), (err) => {
			if (err) throw new Error("calendar list id write error");
			console.log("Google Calendar CLI is ready!");
		});
		// eslint-disable-next-line no-unused-vars
		spinner.success();
	} catch (error) {
		console.log(`Calendar list API error ${error}`);
	}
}
// function checkUserData() {
// 	let exists;
// 	if (fs.existsSync(user_data)) {
// 		console.log("file exists");
// 		exists = true;
// 	} else {
// 		exists = false;
// 	}
// 	return exists;
// 	// console.log(`user_data file does not exist ${error}`);
// }

async function getCalID(calendarName) {
	let id;
	const info = await fsPromise.readFile(user_data);
	const data = JSON.parse(info);
	// console.log(data);
	data.forEach((calendar) => {
		if (calendarName.toLowerCase() === calendar.summary.toLowerCase()) {
			id = calendar.id;
			return;
		}
	});
	return id;
}

export async function getCalendarNames() {
	let arr = [];
	try {
		const info = await fsPromise.readFile(user_data);
		const calendarData = JSON.parse(info);
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
export async function listCalendarNames() {
	const names = await getCalendarNames();
	console.log(`(${chalk.cyan(names.length)}) Calendar Names: \n`);
	names.forEach((calendar) => console.log(chalk.blueBright(`- ${calendar}`)));
}
