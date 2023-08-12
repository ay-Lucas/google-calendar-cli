#!/usr/bin/env node
import { Argument, Command, Option } from "commander";
import dayjs from "dayjs";
import { getCalendarNames, listCalendarNames, listCalendars, writeCalendarIDFile } from "./calendar.js";
import { parseDate } from "./dates.js";
import { addEvents, listEvents } from "./events.js";
const calNames = await getCalendarNames();
const typeChoices = ["events", "calendars", "calendar-names"].concat(calNames);

const program = new Command();
program.name("google-calendar-cli").description("CLI for google calendar").version("0.0.1");

program
	.command("list")
	.alias("ls")
	.description("list google calendar events by default or calendars with ' -c ' flag")
	.addArgument(new Argument("[calName]", "the calendar to list from").choices(typeChoices).default("primary"))
	.option("-n, --number <number>", "number of items to list", 10)
	.option("-c --calendar-names", "list all of your calendar names")
	.option("-C, --calendars", "list an array of calendar objects")
	.action(async (calName, options) => {
		console.log(calName, options.number, options.calendars, options.calendarnames);
		calName = calName.toLowerCase();
		if (calName === "calendars") listCalendars();
		else if (calName === "calendar-names") listCalendarNames();
		else if (calName === "events") listEvents(options.number, "primary");
		else if (options.calendars) listCalendars();
		else if (options.calendarnames) listCalendarNames();
		else listEvents(options.number, calName);
	});
program
	.command("add-event")
	.alias("ae")
	.description("Add calendar event")
	.argument("[string]", "event title string", "none")
	.requiredOption("-c, --calendar <string>", "calendar name", "primary")
	.option("-d, --description <string>", "the description content")
	.requiredOption("-s, --start <string>", "event start time", dayjs(new Date()).add(1, "hours").toISOString())
	.requiredOption("-e, --end <string>", "event end time", dayjs(new Date()).add(2, "hours").toISOString())
	.action((summary, options) => {
		console.log(summary, options.calendar, options.description, parseDate(options.start), parseDate(options.end));
		addEvents(summary, options.calendar, options.description, parseDate(options.start), parseDate(options.end));
	});

program
	.command("setup")
	.description("login to google calendar and retrieve calendar IDs")
	.action(() => {
		writeCalendarIDFile();
	});

program.parse(process.argv);
