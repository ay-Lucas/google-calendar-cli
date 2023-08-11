#!/usr/bin/env node
import { Command } from "commander";
import dayjs from "dayjs";
import { listCalendars, writeCalendarIDFile } from "./calendar.js";
import { parseDate } from "./dates.js";
import { addEvents, listEvents } from "./events.js";
const program = new Command();
program.name("google-calendar-cli").description("CLI for google calendar").version("0.0.1");
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
	.command("list-events")
	.alias("le")
	.description("list events")
	.argument("[number]", "number of events to list", 10)
	.option("-c, --calendar <string>", "calendar name", "primary")
	.option("-t, --today", "list current day events")
	.option("-w, --week", "list events for the next week")
	.action((num, options) => {
		// const num = options.n !== undefined || options.n !== null ? options.n : 10;
		if (num === null || num === undefined) num = 10;
		console.log(num, options.calendar);
		listEvents(num, options.calendar);
	});
//TODO: ls command with event and calendar options
program
	.command("list-calendars")
	.alias("lc")
	.description("list calendars ID's")
	.action(() => {
		listCalendars();
	});

program
	.command("setup")
	.description("login to google calendar and retrieve calendar IDs")
	.action(() => {
		writeCalendarIDFile();
	});

program.parse(process.argv);
