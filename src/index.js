#!/usr/bin/env node
import { Argument, Command } from "commander";
import dayjs from "dayjs";
import { getCalendarNames, listCalendarNames, listCalendars } from "./calendar.js";
import { parseDate } from "./dates.js";
import { addEvents, listEvents } from "./events.js";
import { getTasklist, listTaskLists, listTasks } from "./tasks.js";
import { doesUserDataFileExist, writeUserDataFile } from "./utils.js";
let calNames, tasklistNames;
if (doesUserDataFileExist()) {
	calNames = await getCalendarNames();
	tasklistNames = await getTasklist();
}
const typeChoices = ["events", "calendars", "calendar-objects", "tasks", "task-lists"].concat(calNames).concat(tasklistNames);

const program = new Command();
program.name("google-calendar-cli").description("CLI for google calendar").version("0.0.1");

program
	.command("list")
	.alias("ls")
	.description("list google calendar events by default or calendars with ' -C ' flag or `list [calName]")
	.addArgument(new Argument("[calName]", "the calendar to list from").choices(typeChoices).default("primary"))
	.option("-n, --number <number>", "number of items to list", 10)
	.option("-C --calendar_objects", "list an array of calendar objects")
	.option("-c, --calendars", "list of your calendar names")
	.action(async (calName, options) => {
		// console.log(calName, options.number, options.calendars, options.calendar_objects);
		calName = calName.toLowerCase();
		if (calName === "calendars" || options.calendars) listCalendarNames();
		else if (calName === "tasks") listTasks();
		else if (calName === "task-lists") listTaskLists();
		else if (calName === "events") listEvents(options.number, "primary");
		else if (calName === "calendar-objects" || options.calendar_objects) listCalendars();
		else listEvents(options.number, calName);
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
		addEvents(calName, title, options.description, parseDate(options.start), parseDate(options.end));
	});

program
	.command("setup")
	.description("login to google calendar and retrieve calendar IDs")
	.action(() => {
		writeUserDataFile();
	});
program.parse(process.argv);
