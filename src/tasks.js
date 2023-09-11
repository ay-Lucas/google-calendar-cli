import chalk from "chalk";
import dayjs from "dayjs";
import fsPromise from "fs/promises";
import { createSpinner } from "nanospinner";
import { user_data_path } from "./calendar.js";
import { formatDate, getCurrentTime, parseDateTimeInput } from "./dates.js";
import { auth, google } from "./googleauth.js";
import { bubbleSort } from "./utils.js";
const service = google.tasks({ version: "v1", auth });
const taskList = await getTasklist();
const obj = await taskList[0];
export const taskList1Name = obj.title;
export const taskListNames = await getTaskListNames();
async function getTaskListNames() {
	const taskList = await getTasklist();
	let arr = [];
	taskList.forEach((task) => {
		arr.push(task.title.toLowerCase());
	});
	return arr;
}
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
		let id;
		const tasks = await getTasklist();
		tasks.forEach((task) => {
			if (taskListName.toLowerCase() === task.title.toLowerCase()) {
				id = task.id;
				return;
			}
		});
		return id;
	} catch (error) {
		console.log("tasklist name to Id error");
	}
}
async function getTasks(num, taskListId, includeCompleted) {
	const maxResults = 100;
	num = parseInt(num);
	if (typeof num !== "number" || num < 1 || isNaN(num)) num = maxResults;
	try {
		const res = await service.tasks.list({
			tasklist: taskListId,
			showCompleted: includeCompleted,
			showHidden: includeCompleted,
			showDeleted: false,
			maxResults: num,
		});
		return res.data.items;
	} catch (error) {
		throw new Error(`list tasks API error ${error}`);
	}
}
const handleFormat = (dueDate, title, index, id) => {
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
	console.log(`${id ? chalk.green(index) + " " : ""}${chalk.bgGray(title)}\n${chalk.cyan(formatDate(dueDate))}`);
	if (id) console.log(`Event ID: ${chalk.green(id)}`);
	console.log("----------------------------");
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
			await tasks.forEach((task, i) => {
				if (isDetailed) console.log(task);
				handleFormat(task.due, task.title, i, listId === true ? task.id : false);
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
async function postDeleteTask(taskId, taskListId) {
	service.tasks.delete({
		auth: auth,
		tasklist: taskListId,
		task: taskId,
	});
}
export async function deleteTask(taskIdArray, taskListName) {
	const spinner = createSpinner().start();
	const taskListId = await taskListNameToId(taskListName);
	const isIndexArray = taskIdArray.every((element) => !isNaN(parseInt(element)));
	if (isIndexArray) {
		const indexArray = await bubbleSort(taskIdArray);
		const temp = await getTasks(null, taskListId, false);
		const tasks = await sortTasks(temp);
		let arr = [];
		for (let i = 0; i < indexArray.length; i++) {
			if (indexArray[i] > indexArray.length - 1) {
				console.log(chalk.red(`${taskListName} event ${indexArray[i]} cannot be found`));
				throw new Error("An invalid index was provided");
			}
			arr.push(tasks[indexArray[i]].id);
		}
		taskIdArray = arr;
	}
	try {
		await taskIdArray.forEach((id) => {
			postDeleteTask(id, taskListId);
		});
		spinner.success();
		console.log(`\n${taskIdArray.length} Task${taskIdArray.length > 1 ? "s" : ""} successfully deleted\n----------------------------`);
	} catch (error) {
		console.log(`Error deleting task: ${error}`);
	}
}

export async function completeTasks(taskIdArray) {
	const spinner = createSpinner().start();
	const taskList = await getTasklist();
	const time = await getCurrentTime();
	try {
		await taskIdArray.forEach((id) => {
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
		console.log(`\n${taskIdArray.length} Task${taskIdArray.length > 1 ? "s" : ""} marked as complete\n----------------------------`);
	} catch (error) {
		console.log(`Error completing task: ${error}`);
	}
	spinner.success();
}
