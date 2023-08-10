import { Command } from "commander";
import dayjs from "dayjs";
import { parseDate } from "./dates.js";
import { addEvents, listCalendars, listEvents } from "./events.js";
const program = new Command();
program.name("google-calendar-cli").description("CLI for google calendar").version("0.0.1");
program
	.command("add-event")
	.alias("ae")
	.description("Add calendar event")
	.argument("[string]", "event title string", "none")
	.requiredOption("-id, --calendarid <string>", "calendar ID", "primary")
	.option("-d, --description <string>", "the description content")
	.requiredOption("-s, --start <string>", "event start time", dayjs(new Date()).add(1, "hours").toISOString())
	.requiredOption("-e, --end <string>", "event end time", dayjs(new Date()).add(2, "hours").toISOString())
	.action((summary, options) => {
		console.log(summary, options.calendarid, options.description, parseDate(options.start), parseDate(options.end));
		addEvents(summary, options.calendarid, options.description, parseDate(options.start), parseDate(options.end));
	});

program
	.command("list-events")
	.alias("le")
	.description("list events")
	.argument("[number]", "number of events to list", "10")
	.option("-t, --today", "list current day events")
	.option("-w, --week", "list events for the next week")
	.action((number) => {
		const num = number !== undefined || number !== null ? number : 10;
		listEvents(num);
	});

program
	.command("list-calendars")
	.alias("lc")
	.description("list calendars ID's")
	.action(() => {
		listCalendars();
	});
program.parse(process.argv);
