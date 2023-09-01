import chalk from "chalk";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import fsPromise from "fs/promises";
import { createSpinner } from "nanospinner";
import { user_data_path } from "./calendar.js";
import { getTimezone, parseDate } from "./dates.js";
import { auth, google } from "./googleauth.js";
dayjs.extend(utc);
dayjs.extend(timezone);
const service = google.tasks({ version: "v1", auth });

export async function listTaskLists() {
	const service = google.tasks({ version: "v1", auth });
	const res = await service.tasklists.list({
		maxResults: 10,
	});
	const taskLists = res.data.items;
	if (taskLists && taskLists.length) {
		console.log("Google Task lists:");

		taskLists.forEach((taskList) => {
			console.log(taskList);
			console.log(`${taskList.title} (${taskList.id})`);
		});
	} else {
		console.log("No task lists found.");
	}
}

// async function getTaskListId(taskListName) {
// 	let id;
// 	const info = await fsPromise.readFile(user_data_path);
// 	const data = JSON.parse(info);
// 	// console.log(data);
// 	data.forEach((task) => {
// 		if (taskListName.toLowerCase() === task.title.toLowerCase()) {
// 			id = calendar.id;
// 			return;
// 		}
// 	});
// 	return id;
// }
export async function getTasklist() {
	try {
		const info = await fsPromise.readFile(user_data_path);
		const data = JSON.parse(info);
		const tasks = data.task_list;
		// console.log(tasks);
		return tasks;
	} catch (error) {
		console.log("failed to retrieve task list");
	}
}
async function taskListNameToId(taskListName) {
	try {
		const tasks = getTasklist();
		tasks.forEach((task) => {
			if (taskListName.toLowerCase() === task.title.toLowerCase()) {
				id = calendar.id;
				return;
			}
		});
		return id;
	} catch (error) {
		console.log("tasklist name to Id error");
	}
}

/**
 * TODO:
 * add task due date bounds
 **/
const formatDate = (str) => {
	let date = dayjs(str);
	date = date.tz("utc");
	if (date.get("h") === 0) {
		return date.format("M/D dddd");
	} else {
		return date.format("M/D ddd h:mm a");
	}
};
export async function listTasks(taskListName) {
	// if (taskListName === "" || !taskListName || typeof taskListName === "undefined") {
	// 	console.log("invalid tasklist name");
	// }
	let id;
	if (!taskListName) {
		id = await getTasklist();
		id = id[0].id;
	} else {
		id = await taskListNameToId(taskListName);
		console.log("22: " + id);
	}
	// if (!id || typeof taskListName !== "undefined") {
	// 	console.log("tasklist to id error");
	// }
	try {
		const res = await service.tasks.list({
			tasklist: id,
			maxResults: 10,
		});
		const tasks = res.data.items;
		if (tasks && tasks.length) {
			console.log("Google Tasks:\n");
			tasks.forEach((task) => {
				// console.log(task);
				// console.log(`${chalk.bgGrey(dayjs(task.due).format("D/M ddd h:mm a"))}`);
				console.log(`${chalk.bgGrey(formatDate(task.due))}`);
				console.log(`${chalk.green(task.title)}\n`);
			});
		} else {
			console.log("No task lists found.");
		}
	} catch (error) {
		console.log(`Error listing tasks: ${error}`);
	}
}
export async function addTask(title, dueDate) {
	const spinner = createSpinner().start();
	let date = parseDate(dueDate);
	const tasklist = await getTasklist();
	// console.log(listId);
	await service.tasks.insert({
		tasklist: tasklist[0].id,
		auth: auth,

		requestBody: {
			title: title,
			due: date,
		},
	});
	spinner.success();
	console.log(`Task successfully added\n------------------------\n${title} - ${formatDate(date)}`);
}
