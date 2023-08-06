import dotenv from "dotenv";
dotenv.config({});

import express from "express";
const app = express();

import { google } from "googleapis";

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

app.get("/google/redirect", (req, res) => {
	res.send("active");
});

app.listen(PORT, () => {
	console.log("Server started on part", PORT);
});
