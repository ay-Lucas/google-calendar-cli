import { authenticate } from "@google-cloud/local-auth";
import fs from "fs/promises";
import { google } from "googleapis";
import path from "path";
import process from "process";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "desktop_client_credentials.json");

// Reads previously authorized credentials from the save file.

export async function loadSavedCredentialsIfExist() {
	try {
		const content = await fs.readFile(TOKEN_PATH);
		const credentials = JSON.parse(content);
		return google.auth.fromJSON(credentials);
	} catch (error) {
		console.log(`credential load error ${error}`);
		return null;
	}
}

// Serializes credentials to a file compatible with GoogleAUth.fromJSON.
export async function saveCredentials(client) {
	const content = await fs.readFile(CREDENTIALS_PATH);
	const keys = JSON.parse(content);
	const key = keys.installed || keys.web;
	const payload = JSON.stringify({
		type: "authorized_user",
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});
	await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
export async function authorize() {
	let client = await loadSavedCredentialsIfExist();
	if (client) {
		console.log("client === true");
		return client;
	}
	client = await authenticate({
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH,
	});
	if (client.credentials) {
		await saveCredentials(client);
	}
	return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 */
export async function listEvents(auth) {
	const calendar = google.calendar({ version: "v3", auth });
	const res = await calendar.events.list({
		calendarId: "primary",
		timeMin: new Date().toISOString(),
		maxResults: 10,
		singleEvents: true,
		orderBy: "startTime",
	});
	const events = res.data.items;
	if (!events || events.length === 0) {
		console.log("No upcoming events found.");
		return;
	}
	console.log("Upcoming 10 events:");
	// eslint-disable-next-line no-unused-vars
	events.map((event, i) => {
		const start = event.start.dateTime || event.start.date;
		console.log(`${start} - ${event.summary}`);
	});
}

export function reqest(event) {
	console.log("hm");
	if (event === "list") {
		authorize().then(listEvents).catch(console.error);
		console.log("list-event");
	} else if (event === "add-event") {
		console.log("add-event");
		// authorize().then(listEvents).catch(console.error);
	}
}
