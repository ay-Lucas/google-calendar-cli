import fsPromise from "fs/promises";
import { user_data_path } from "./calendar.js";
import { auth, google } from "./googleauth.js";

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
		console.log(tasks);
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

export async function listTasks(taskListName) {
	// if (taskListName === "" || !taskListName || typeof taskListName === "undefined") {
	// 	console.log("invalid tasklist name");
	// }
	let id;
	if (!taskListName) {
		id = await getTasklist();
		console.log(id[0].id); //workeddddd
	} else {
		id = await taskListNameToId(taskListName);
	}
	// if (!id || typeof taskListName !== "undefined") {
	// 	console.log("tasklist to id error");
	// }
	const service = google.tasks({ version: "v1", auth });
	try {
		const res = await service.tasks.list({
			tasklist: id,
			maxResults: 10,
		});
		const tasks = res.data.items;
		if (tasks && tasks.length) {
			console.log("Google Tasks:");
			tasks.forEach((task) => {
				// console.log(task);
				console.log(`${task.title} (${task.id})`);
			});
		} else {
			console.log("No task lists found.");
		}
	} catch (error) {
		console.log(`Error listing tasks: ${error}`);
	}
}
