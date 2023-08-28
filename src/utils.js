import fs from "fs";
import { createSpinner } from "nanospinner";
import { calendar, user_data_path } from "./calendar.js";
import { auth, google } from "./googleauth.js";
export function doesUserDataFileExist() {
	return fs.existsSync(user_data_path);
}

export async function writeUserDataFile() {
	if (doesUserDataFileExist()) {
		console.log("user data file already exists\n Google Calendar CLI is already setup!");
		return;
	}
	console.log("saving user data..");
	const spinner = createSpinner().start();
	// creates spinner in console
	try {
		const service = google.tasks({ version: "v1", auth });

		const calRes = await calendar.calendarList.list({
			auth: auth,
		});
		const taskRes = await service.tasklists.list({
			maxResults: 10,
		});

		const taskList = taskRes.data.items;
		const calendarList = calRes.data.items;
		fs.writeFileSync(user_data_path, JSON.stringify({ calendar_list: calendarList, task_list: taskList }, null, 2), (err) => {
			if (err) throw new Error("user_data calendarList writing error");
		});
		spinner.success();
		console.log("Google Calendar CLI is ready!");
	} catch (error) {
		console.log(`Calendar list API error ${error}`);
	}
}
