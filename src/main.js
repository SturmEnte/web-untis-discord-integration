require("dotenv/config");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch").default;
const formData = require("form-data");
const fs = require("fs");
const path = require("path");

const USERNAME = process.env.UNTIS_USERNAME;
const PASSWORD = process.env.UNTIS_PASSWORD;
const TABLE_ID = process.env.UNTIS_TABLEID;
const SCHOOL_LOGIN_URL = process.env.SCHOOL_LOGIN_URL;
const WEBHOOK = process.env.WEBHOOK;
const CTIMES = JSON.parse(process.env.CTIMES);

if (!USERNAME) {
	console.error("No username");
	process.exit();
}

if (!PASSWORD) {
	console.error("No password");
	process.exit();
}

if (!TABLE_ID) {
	console.error("No table id");
	process.exit();
}

if (!SCHOOL_LOGIN_URL) {
	console.error("No school login url");
	process.exit();
}

if (!WEBHOOK) {
	console.error("No webhook");
	process.exit();
}

if (!CTIMES || CTIMES.length == 0) {
	console.error("No times");
	process.exit();
}

let times = new Map();

CTIMES.forEach((time) => {
	times.set(time, false);
});

setInterval(() => {
	const date = new Date();

	times.forEach((value, key) => {
		const split = key.split(":");
		if (date.getHours() != split[0] || date.getMinutes() != split[1]) {
			times.set(key, false);
			return;
		}

		if (value) return;

		times.set(key, true);
		sendSubstitutionPlan();
	});
}, 1000);

async function sendSubstitutionPlan() {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.goto(SCHOOL_LOGIN_URL);

	await page.type('[type="text"]', USERNAME);
	await page.type('[type="password"]', PASSWORD);
	await page.keyboard.press("Enter");

	const date = new Date();

	setTimeout(async () => {
		await page.goto(`https://borys.webuntis.com/WebUntis/api/public/printpreview/timetable?type=1&id=${TABLE_ID}&date=${date.yyyymmdd()}&formatId=1`);

		if (!fs.existsSync(path.join(__dirname, "../cache"))) fs.mkdirSync(path.join(__dirname, "../cache"));

		await page.screenshot({ path: "./cache/subplan.png", captureBeyondViewport: true, fullPage: true });

		const form = new formData();
		form.append("subplan.png", fs.createReadStream(path.join(__dirname, "../cache/subplan.png")));
		form.append("payload_json", JSON.stringify({ content: `**${date.ddmmyyyy()} ${date.hhmm()}**` }));

		fetch(WEBHOOK, { method: "POST", headers: form.getHeaders(), body: form }).then((res) => {
			if (res.status == 200) {
				console.log("success");
				return;
			}

			console.log("failure");
			res.json().then(console.log);
			fetch(WEBHOOK, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content: "Failed to send substitution plan",
				}),
			});
		});
	}, 5000);
}

Date.prototype.yyyymmdd = function () {
	var mm = this.getMonth() + 1;
	var dd = this.getDate();

	return [this.getFullYear(), (mm > 9 ? "" : "0") + mm, (dd > 9 ? "" : "0") + dd].join("");
};

Date.prototype.ddmmyyyy = function () {
	var mm = this.getMonth() + 1;
	var dd = this.getDate();

	return [(dd > 9 ? "" : "0") + dd, (mm > 9 ? "" : "0") + mm, this.getFullYear()].join(".");
};

Date.prototype.hhmm = function () {
	var mm = this.getMinutes();
	var hh = this.getHours();

	return [(hh > 9 ? "" : "0") + hh, (mm > 9 ? "" : "0") + mm].join(":");
};
