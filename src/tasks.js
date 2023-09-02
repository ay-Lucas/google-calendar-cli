import chalk from "chalk";
import fsPromise from "fs/promises";
import { createSpinner } from "nanospinner";
import { user_data_path } from "./calendar.js";
import { convertTimeZoneToUTC, formatDate, parseDateTimeInput } from "./dates.js";
import { auth, google } from "./googleauth.js";
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
export async function getTasklist() {
	try {
		const info = await fsPromise.readFile(user_data_path);
		const data = JSON.parse(info);
		const tasks = data.task_list;
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
const handleFormat = (dueDate, title) => {
	const dueDateInUTC = convertTimeZoneToUTC(dueDate);
	console.log(`${chalk.bgGrey(formatDate(dueDateInUTC))} \n${chalk.cyan(title)}\n`);
};
export async function listTasks(taskListName) {
	let id;
	if (!taskListName) {
		const taskList = await getTasklist();
		id = taskList[0].id;
	} else {
		id = await taskListNameToId(taskListName);
		console.log("22: " + id);
	}
	try {
		const res = await service.tasks.list({
			tasklist: id,
			showCompleted: false,
			showDeleted: false,
		});
		const tasks = res.data.items;
		if (tasks && tasks.length) {
			console.log(chalk.greenBright.bold("Google Tasks: ") + "\n");
			tasks.forEach((task) => {
				handleFormat(task.due, task.title);
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
	let date = parseDateTimeInput(dueDate);
	const taskList = await getTasklist();
	console.log("date: " + date);
	await service.tasks.insert({
		tasklist: taskList[0].id,
		auth: auth,

		requestBody: {
			title: title,
			due: date,
		},
	});
	spinner.success();
	console.log(`Task successfully added\n------------------------\n${title} - ${formatDate(date)}`);
}
