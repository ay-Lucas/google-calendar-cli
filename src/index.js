#!/usr/bin/env node
import chalk from "chalk";
import { Argument, Command } from "commander";
import dayjs from "dayjs";
import readline from "readline";
import { calendarNames, listCalendarNames, listCalendars } from "./calendar.js";
import { addEvents, deleteEvent, listEvents } from "./events.js";
import { addTask, completeTasks, deleteTask, listTaskLists, listTasks, taskList1Name, taskListNames } from "./tasks.js";
import { writeUserDataFile } from "./utils.js";
//TODO: list all events with `gcal list events` command

const getInputKeypress = async (msg) => {
	var keyPressed;
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	const prompt = async (query) => new Promise((resolve) => rl.question(query, resolve));
	process.stdin.on("keypress", async (str, key) => {
		rl.close();
		keyPressed = key;
	});
	await prompt(msg + "\n");
	return keyPressed;
};
const typeChoices = ["events", "calendars", "calendar-objects", "tasks", "task-lists", "primary"].concat(calendarNames).concat(taskListNames);
const delEventMsg = chalk.green("\nOR Press Enter to use the Primary/General Calendar");
const delTaskMsg = chalk.green("\nOR Press Enter to use the default Task List");

const program = new Command();

program.name("google-calendar-cli").description("CLI for google calendar").version("0.0.1");
program
	.command("list")
	.alias("ls")
	.description("list google calendar events by default or calendars with ' -C ' flag or `list [calName]")
	.addArgument(new Argument("[calName]", "the calendar to list from").choices(typeChoices).default("primary"))
	.option("-D, --detailed", "detailed list of tasks")
	.option("-id --id", "include item ID")
	.option("-n, --number <number>", "number of items to list", -1)
	.option("-C --calendar_objects", "list an array of calendar objects")
	.option("-c, --calendars", "list of your calendar names")
	.option("-A, show_completed", "include completed tasks")
	.action(async (calName, options) => {
		calName = calName.toLowerCase();
		if (calName === "calendars" || options.calendars) listCalendarNames();
		else if (calName === "tasks") {
			if (options.detailed) listTasks(null, true, false);
			else if (options.show_completed) listTasks(null, false, options.id, options.show_completed);
			else if (options.id) listTasks(null, false, true);
			else listTasks(null, false, false);
		} else if (calName === "task-lists" || calName === taskList1Name.toLowerCase()) listTaskLists();
		else if (calName === "events") {
			if (options.id) listEvents(options.number, "primary", true);
			else listEvents(options.number, "primary", false);
		} else if (calName === "calendar-objects" || options.calendar_objects) listCalendars();
		else if (typeChoices.includes(calName)) {
			if (options.id) listEvents(options.number, calName, true);
			else listEvents(options.number, calName, false);
		} else listEvents(options.number, calName, false);
	});
program
	.command("add")
	.alias("add-event")
	.description("add calendar event. Only the start date or start date time is required.")
	.addArgument(new Argument("[calName]", "the calendar to add an event to").default("primary"))
	.addArgument(new Argument("[title]", "event title name").default("none"))
	.option("-d, --description <string>", "the description content")
	.requiredOption(
		"-s, --start <string>",
		"event start time/date-time <M/D[/YY] [hh:mm]>. Date only will create an all-day event. Event length is set to 1 hour if a date-time is provided without an end time",
		dayjs(new Date()).add(1, "hours").toISOString()
	)
	.option("-e, --end <string>", "event end time")
	.action(async (calName, title, options) => {
		const calendar = calendarNames.find((name) => calName.toLowerCase() === name);
		if (calendar !== undefined) {
			calName = calendar;
		} else {
			title = calName;
			calName = "primary";
		}
		addEvents(calName, title, options.description, options.start, options.end);
	});
program
	.command("add-task")
	.description("Add Google Task to task list. Only dates are supported by Google Tasks API")
	.argument("[title]", "task title name")
	.requiredOption("-d, --due <string>", "event due date <M/D[/YY]>", dayjs(new Date()).add(1, "hours").toISOString())
	.action(async (title, options) => {
		addTask(title, options.due);
	});

program
	.command("setup")
	.description("login to google calendar and retrieve calendar IDs")
	.action(() => {
		writeUserDataFile();
	});
program
	.command("delete-task")
	.alias("dt")
	.description("Delete a task, must provide it's ID -- find it with `list tasks -id`. Separate IDs with a space to delete multiple tasks")
	.argument("<id>", "task ID(s)")
	.action(async () => {
		const args = process.argv.slice(3);
		const taskListNameIndex = args.findIndex((element) => taskListNames.includes(element.toLowerCase()));
		if (taskListNameIndex === -1) {
			console.log("Enter a Task List name (after the task ID or index) from the following list: ");
			taskListNames.forEach((name) => console.log("\u2022 " + chalk.cyan(name)));
			const keyPressed = await getInputKeypress(delTaskMsg);
			if (keyPressed.name !== "return") return;
			await deleteTask(args, taskList1Name);
		} else {
			const taskListName = args.splice(taskListNameIndex, 1);
			await deleteTask(args, taskListName[0]);
		}
	});
program
	.command("delete-event")
	.alias("de")
	.description("delete an event, must provide it's ID and calendar name")
	.argument("[id]", "Event ID (look up with 'list events -detailed')")
	.argument("[calendar]", "calendar name", "general")
	.action(async () => {
		const args = process.argv.slice(3);
		const calendarNameIndex = args.findIndex((element) => calendarNames.includes(element.toLowerCase()));
		if (calendarNameIndex === -1) {
			console.log("Enter a Calendar name (after the event ID or index) from the following list: ");
			calendarNames.forEach((name) => console.log("\u2022 " + chalk.cyan(name)));
			const keyPressed = await getInputKeypress(delEventMsg);
			if (keyPressed.name !== "return") return;
			await deleteEvent(args, "general");
		} else {
			const calName = args.splice(calendarNameIndex, 1);
			await deleteEvent(args, calName[0]);
		}
	});
program
	.command("complete")
	.alias("complete-task", "comp")
	.description("Complete a task, must provide it's ID -- find it with `list tasks -id`. Separate IDs with a space to complete multiple tasks")
	.argument("<id>", "task ID(s)")
	.option("-d, --date", "Date of task completion. Only use with one task at a time")
	.action(async (id, option) => {
		const ids = process.argv.slice(3);
		if (option.date) {
			if (ids.length > 1) {
				console.log("Completion Date can only used with one task at a time. Action aborted");
			}
			completeTasks(ids);
		}
		completeTasks(ids);
	});
program.parse(process.argv);
