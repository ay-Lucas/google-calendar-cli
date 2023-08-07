import dotenv from "dotenv";
dotenv.config({});

import express from "express";
const app = express();

import dayjs from "dayjs";
import { google } from "googleapis";
import { v4 as uuid } from "uuid";
const calendar = google.calendar({
	version: "v3",
	auth: process.env.GOOGLE_CALENDAR_API_KEY,
});
const PORT = process.env.PORT || 3500;
const SERVER_URL = "http://localhost:" + PORT;
const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);

const scopes = ["https://www.googleapis.com/auth/calendar"];
app.get("/google", (req, res) => {
	const url = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: scopes,
	});

	res.redirect(url);
});

app.get("/oauth2callback", async (req, res) => {
	const code = req.query.code;
	const { tokens } = await oauth2Client.getToken(code);
	oauth2Client.setCredentials(tokens);
	res.send({ msg: "Successful login" });
});

app.get("/schedule_event", async (req, res) => {
	await calendar.events.insert({
		calendarId: "primary",
		auth: oauth2Client,
		requestBody: {
			summary: "test event",
			description: "pls work, oh plss work",
			start: {
				dateTime: dayjs(new Date()).add(1, "day").toISOString(),
				timeZone: "America/New_York",
			},
			end: {
				dateTime: dayjs(new Date()).add(2, "day").toISOString(),
				timeZone: "America/New_York",
			},
		},
	});
	res.send({ msg: "Done" });
});
app.listen(PORT, () => {
	console.log("Server started on part", PORT);
	console.log(`Click the link to login to your Google account: \t${SERVER_URL}/google`);
});
