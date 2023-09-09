import chalk from "chalk";
import dayjs from "dayjs";
import fsPromise from "fs/promises";
import { createSpinner } from "nanospinner";
import { user_data_path } from "./calendar.js";
import { formatDate, getCurrentTime, parseDateTimeInput } from "./dates.js";
import { auth, google } from "./googleauth.js";
const service = google.tasks({ version: "v1", auth });
const taskList = await getTasklist();
const obj = await taskList[0];
export const taskList1Name = obj.title;
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
	// console.log(dueDate);
	if (typeof dueDate === "string") {
		if (dueDate.includes("T")) {
			const dateTimeArr = dueDate.split("T");
			const time = dateTimeArr[1];
			const date = dateTimeArr[0];
			if (time.substring(0, 5) === "00:00") {
				dueDate = date;
			}
		}
	}
	console.log(`${chalk.bgGrey(formatDate(dueDate))} \n${chalk.cyan(title)}`);
};
export async function listTasks(taskListName, isDetailed, listId, includeCompleted) {
	if (typeof includeCompleted !== "boolean") includeCompleted = false;
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
			showCompleted: includeCompleted,
			showHidden: includeCompleted,
			showDeleted: false,
		});
		const tasks = await sortTasks(res.data.items);
		if (tasks && tasks.length) {
			console.log(chalk.greenBright.bold("Google Tasks: ") + "\n");
			// const uncompletedTasks = await tasks.filter((task) => task.status === "completed");
			await tasks.forEach((task) => {
				if (isDetailed) console.log(task);
				// console.log(task.due);
				// console.log(task);

				handleFormat(task.due, task.title);
				if (listId) console.log(`Task ID: ${chalk.green(task.id)}`);
				console.log("----------------------------");
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
export async function deleteTask(idArray) {
	const spinner = createSpinner().start();
	const taskList = await getTasklist();
	try {
		idArray.forEach((id) => {
			service.tasks.delete({
				auth: auth,
				tasklist: taskList[0].id,
				task: id,
			});
		});
		console.log(`\n${idArray.length} Task${idArray.length > 1 ? "s" : ""} successfully deleted\n----------------------------`);
	} catch (error) {
		console.log(`Error deleting task: ${error}`);
	}
	spinner.success();
}
export async function completeTasks(idArray) {
	const spinner = createSpinner().start();
	const taskList = await getTasklist();
	const time = await getCurrentTime();
	try {
		await idArray.forEach((id) => {
			service.tasks.update({
				auth: auth,
				tasklist: taskList[0].id,
				task: id,
				requestBody: {
					id: id,
					completed: time,
					status: "completed",
					hidden: true,
				},
			});
		});
		console.log(`\n${idArray.length} Task${idArray.length > 1 ? "s" : ""} marked as complete\n----------------------------`);
	} catch (error) {
		console.log(`Error completing task: ${error}`);
	}
	spinner.success();
}
