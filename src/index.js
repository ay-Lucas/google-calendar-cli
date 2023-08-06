import dotenv from "dotenv";
dotenv.config({});

import express from "express";
const app = express();

import { google } from "googleapis";
import { v4 as uuid } from "uuid";
const PORT = process.env.PORT || 3500;

const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);

const scopes = ["https://www.googleapis.com/auth/calendar"];

app.get("/google", (req, res) => {
	const url = oauth2Client.generateAuthUrl({
		// 'online' (default) or 'offline' (gets refresh_token)
		access_type: "offline",
		scope: scopes,
	});

	res.redirect(url);
});

app.get("/oauth2callback", async (req, res) => {
	const code = req.query.code;
	const { tokens } = await oauth2Client.getTokens(code);
	oauth2Client.setCredentials(tokens);
	res.send({ msg: "Successful login" });
	res.send("active");
});

app.get("/schedule_event", async (req, res) => {
	console.log(oauth2Client.credentials.access_token);
	await calendar.events.insert({
		calendarId: "primary",
		auth: oauth2Client,
		conferenceDataVersion: 1,
		requestBody: {
			summary: "test event",
			description: "pls work, oh plss work",
			start: {
				dateTime: new Date().toLocaleString([], {
					year: "numeric",
					month: "numeric",
					day: "numeric",
				}),
			},
			end: {
				dateTime: new Date().toLocaleString([], {
					year: "numeric",
					month: "numeric",
					day: "numeric",
				}),
			},
			conferenceData: {
				createRequest: {
					requestId: uuid(),
				},
			},
		},
	});
});
app.listen(PORT, () => {
	console.log("Server started on part", PORT);
	console.log(oauth2Client);
});
