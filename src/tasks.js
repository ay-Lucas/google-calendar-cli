import chalk from "chalk";
import dayjs from "dayjs";
import fsPromise from "fs/promises";
import { createSpinner } from "nanospinner";
import { user_data_path } from "./calendar.js";
import { formatDate, parseDateTimeInput } from "./dates.js";
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
const handleFormat = (dueDate, title) => {
	console.log(`${chalk.bgGrey(formatDate(dueDate))} \n${chalk.cyan(title)}\n`);
};
export async function listTasks(taskListName, isDetailed, listId) {
	let id;
	if (!taskListName) {
		const taskList = await getTasklist();
		id = taskList[0].id;
	} else {
		id = await taskListNameToId(taskListName);
	}
	try {
		const res = await service.tasks.list({
			tasklist: id,
			showCompleted: false,
			showDeleted: false,
		});
		const tasks = await sortTasks(res.data.items);
		if (tasks && tasks.length) {
			console.log(chalk.greenBright.bold("Google Tasks: ") + "\n");
			tasks.forEach((task) => {
				if (isDetailed) console.log(task);
				if (listId) console.log(`Task ID: ${chalk.green(task.id)}`);
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
	const date = parseDateTimeInput(dueDate);
	const splitDate = date.split("T");
	const dateOnly = splitDate[0];
	const timeOnly = splitDate[1];
	if (timeOnly.substring(0, 2) !== "00") {
		console.log("Google Tasks API currently only supports a due date.\nThe task will be assigned the due date you provided.");
	}
	const taskList = await getTasklist();
	await service.tasks.insert({
		tasklist: taskList[0].id,
		auth: auth,

		requestBody: {
			title: title,
			due: date,
		},
	});
	spinner.success();
	console.log("Task successfully added\n------------------------");
	handleFormat(dateOnly, title);
}
function sortTasks(arr) {
	let temp;
	var swapped;
	for (let i = 0; i < arr.length - 1; i++) {
		swapped = false;
		for (let j = 0; j < arr.length - 1; j++) {
			if (dayjs(arr[j + 1].due).isBefore(dayjs(arr[j].due))) {
				temp = arr[j];
				arr[j] = arr[j + 1];
				arr[j + 1] = temp;
				swapped = true;
			}
		}
		if (swapped == false) break;
	}
	return arr;
}
export async function deleteTask(id) {
	// if (isEmpty(id)) return;
	const spinner = createSpinner().start();
	// let date = parseDateTimeInput(dueDate);
	const taskList = await getTasklist();
	try {
		await service.tasks.delete({
			auth: auth,
			tasklist: taskList[0].id,
			task: id,
		});
	} catch (error) {
		console.log(`Error deleting task: ${error}`);
	}
	spinner.success();
	console.log("Task successfully deleted\n------------------------");
}
