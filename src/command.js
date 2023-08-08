import { Command } from "commander";
import dayjs from "dayjs";
import { listEvents } from "./oldindex.js";
const program = new Command();
program.name("google-calendar-cli").description("CLI for google calendar").version("0.0.1");
program
	.command("add-event")
	.description("Add calendar event")
	.argument("[string]", "event title string", "none")
	.option("-ts, --time-start <string>", "event start time", dayjs(new Date()).add(1, "day").toISOString())
	.option("-te, --time-end <string>", "event end time", dayjs(new Date()).add(1.25, "day").toISOString())
	.option("-m, --message <string>", "event message")
	.action((string, options) => {
		console.log(string, "go work out your legs punk");
		console.log(options);
	});

program
	.command("list")
	.description("list events")
	.argument("[number]", "number of events to list", "10")
	.option("-t, --today", "list current day events")
	.option("-w, --week", "list events for the next week")
	.action(() => {
		listEvents();
	});
program.parse(process.argv);

// --------------------------------------------------
// program
// 	.name("connect")
// 	.argument("<server>", "connect to the specified server")
// 	.argument("[user]", "user account for connection", "guest")
// 	.description("Example program with argument descriptions")
// 	.action((server, user) => {
// 		console.log("server:", server);
// 		console.log("user:", user);
// 	});

// program.parse();
