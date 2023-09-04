#!/usr/bin/env node
import { Argument, Command } from "commander";
import dayjs from "dayjs";
import { getCalendarNames, listCalendarNames, listCalendars } from "./calendar.js";
import { addEvents, deleteEvent, listEvents } from "./events.js";
import { addTask, deleteTask, getTasklist, listTaskLists, listTasks } from "./tasks.js";
import { doesUserDataFileExist, writeUserDataFile } from "./utils.js";
let calNames, tasklistNames;
if (doesUserDataFileExist()) {
	calNames = await getCalendarNames();
	tasklistNames = await getTasklist();
	tasklistNames = tasklistNames[0].title;
}
const typeChoices = ["events", "calendars", "calendar-objects", "tasks", "task-lists", "primary"].concat(calNames).concat(tasklistNames);

const program = new Command();
program.name("google-calendar-cli").description("CLI for google calendar").version("0.0.1");

program
	.command("list")
	.alias("ls")
	.description("list google calendar events by default or calendars with ' -C ' flag or `list [calName]")
	.addArgument(new Argument("[calName]", "the calendar to list from").choices(typeChoices).default("primary"))
	.option("-D, --detailed", "detailed list of tasks")
	.option("-id --id", "include item ID")
	.option("-n, --number <number>", "number of items to list", 10)
	.option("-C --calendar_objects", "list an array of calendar objects")
	.option("-c, --calendars", "list of your calendar names")
	.action(async (calName, options) => {
		console.log(calName, options.number, options.calendars, options.calendar_objects);
		calName = calName.toLowerCase();
		if (calName === "calendars" || options.calendars) listCalendarNames();
		// tasks
		else if (calName === "tasks") {
			if (options.detailed) listTasks(null, true, false);
			else if (options.id) listTasks(null, false, true);
			else listTasks(null, false, false);
		} else if (calName === "task-lists") listTaskLists();
		else if (calName === "events") {
			if (calName === "events" && options.id) listEvents(options.number, "primary", true);
			else listEvents(options.number, "primary", false);
		} else if (calName === "calendar-objects" || options.calendar_objects) listCalendars();
		else if (calNames.includes(calName) && options.id) listEvents(options.number, calName, true);
		else listEvents(options.number, calName, false);
	});
program
	.command("add")
	.description("add calendar event")
	.addArgument(new Argument("[calName]", "the calendar to add an event to").default("primary"))
	.addArgument(new Argument("[title]", "event title name").default("none"))
	.option("-d, --description <string>", "the description content")
	.requiredOption("-s, --start <string>", "event start time", dayjs(new Date()).add(1, "hours").toISOString())
	.requiredOption("-e, --end <string>", "event end time", dayjs(new Date()).add(2, "hours").toISOString())
	.action(async (calName, title, options) => {
		calName = calName.toLowerCase();
		const calendar = calNames.find((name) => calName === name);
		// console.log(calName, title, options.description, parseDate(options.start), parseDate(options.end));
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
	.description("add Google task to task list")
	.argument("[title]", "task title name")
	.requiredOption("-d, --due <string>", "event due date", dayjs(new Date()).add(1, "hours").toISOString())
	.action(async (title, options) => {
		// console.log(title, options);
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
	.description("delete a task, must provide it's ID")
	.argument("[id]", "task ID (look up with 'list tasks -detailed')")
	.action(async (id) => {
		deleteTask(id);
	});
program
	.command("delete-event")
	.alias("de")
	.description("delete an event, must provide it's ID and calendar name")
	.argument("[id]", "Event ID (look up with 'list events -detailed')")
	.argument("[calendar]", "calendar name", "primary")
	// .requiredOption("-c, --calendar <string>", "calendar name", "primary")
	.action(async (id, calendar) => {
		deleteEvent(id, calendar);
	});
program.parse(process.argv);
