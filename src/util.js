import chalk from "chalk";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);

export function formatDate(string) {
	let date, time, formattedDate;
	if (string.indexOf(":") !== -1) {
		let split = string.split(":", 1);
		date = dayjs(split[0]).format("ddd M/D");
		time = dayjs(split[1]).format("h:mm a");
		formattedDate = `${chalk.cyan(date)} ${chalk.green(time)}`;
		// formattedDate = chalk.cyan(date.format("ddd M/D h:mm a"));
	} else {
		let dayjsObj = dayjs(string);
		formattedDate = `${chalk.cyan(dayjsObj.format("ddd M/D"))}`;
	}
	return formattedDate;
}

// export function formatTime(string) {
// 	// let date = new Date(string);
// 	// console.log(date);
// 	let formattedDate = dayjs(string);
// 	// console.log(formattedDate);
// 	return chalk.cyan(formattedDate.format("HH:MM"));
// }
