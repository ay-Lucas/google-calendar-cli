#!/usr/bin/env node
import { Argument, Command } from "commander";
import dayjs from "dayjs";
import { getCalendarNames, listCalendarNames, listCalendars } from "./calendar.js";
import { addEvents, deleteEvent, listEvents } from "./events.js";
import { addTask, deleteTask, getTasklist, listTaskLists, listTasks } from "./tasks.js";
import { doesUserDataFileExist, isEmpty, writeUserDataFile } from "./utils.js";
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
		calName = calName.toLowerCase();
		// console.log(calName, options.number, options.calendars, options.calendar_objects);
		if (calName === "calendars" || options.calendars) listCalendarNames();
		else if (calName === "tasks") {
			if (options.detailed) listTasks(null, true, false);
			else if (options.id) listTasks(null, false, true);
			else listTasks(null, false, false);
		} else if (calName === "task-lists" || calName === tasklistNames.toLowerCase()) listTaskLists();
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
	.description("Add Google Task to task list. Only dates are supported by Google Tasks API")
	.argument("[title]", "task title name")
	.requiredOption("-d, --due <string>", "event due date <M/D[/YY]>", dayjs(new Date()).add(1, "hours").toISOString())
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
	.description("Delete a task, must provide it's ID -- find it with `list tasks -id`. Separate IDs with a space to delete multiple tasks")
	.argument("<id>", "task ID(s)")
	.action(async () => {
		const ids = process.argv.slice(3);
		deleteTask(ids);
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
