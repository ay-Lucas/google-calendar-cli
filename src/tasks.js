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

export async function listTasks() {
	const service = google.tasks({ version: "v1", auth });
	const res = await service.tasks.list({
		// tasklist: "MDMyOTA1OTM0MTU5NDAzODQxNjA6MDow",
		tasklist: "default",
		maxResults: 10,
	});
	const tasks = res.data.items;
	if (tasks && tasks.length) {
		console.log("Google Tasks:");
		tasks.forEach((task) => {
			console.log(task);
			// console.log(`${task.title} (${task.id})`);
		});
	} else {
		console.log("No task lists found.");
	}
}
