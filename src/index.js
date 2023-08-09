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

async function loadSavedCredentialsIfExist() {
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
async function saveCredentials(client) {
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
async function authorize() {
	let client = await loadSavedCredentialsIfExist();
	if (client) {
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
export const auth = await authorize();
// global credentials

// export async function reqest(type, num) {
// 	// let auth;
// 	// try {
// 	// 	auth = await authorize();
// 	// } catch (error) {
// 	// 	console.log(`event list request error ${error}`);
// 	// }
// 	console.log("hm");
// 	if (type === "list") {
// 		console.log("list-event");
// 	} else if (type === "add-event") {
// 		console.log("add-event");
// 		// authorize().then(listEvents).catch(console.error);
// 	}
// }
