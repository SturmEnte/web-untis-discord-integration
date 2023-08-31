require("dotenv/config");
const puppeteer = require("puppeteer");
const axios = require("axios");

const USERNAME = process.env.UNTIS_USERNAME;
const PASSWORD = process.env.UNTIS_PASSWORD;
const TABLE_ID = process.env.UNTIS_TABLEID;
const SCHOOL_LOGIN_URL = process.env.SCHOOL_LOGIN_URL;
const WEBHOOK = process.env.WEBHOOK;

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

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.goto(SCHOOL_LOGIN_URL);

	//await page.setViewport({ width: 2200, height: 800 });

	await page.screenshot({ path: "./test/test1.png" });

	await page.type('[type="text"]', USERNAME);
	await page.type('[type="password"]', PASSWORD);
	await page.keyboard.press("Enter");

	const date = new Date();

	setTimeout(async () => {
		await page.goto(`https://borys.webuntis.com/WebUntis/api/public/printpreview/timetable?type=1&id=${TABLE_ID}&date=${date.yyyymmdd()}&formatId=1`);

		await page.screenshot({ path: "./test/test3.png", captureBeyondViewport: true, fullPage: true });
	}, 5000);
})();

Date.prototype.yyyymmdd = function () {
	var mm = this.getMonth() + 1; // getMonth() is zero-based
	var dd = this.getDate();

	return [this.getFullYear(), (mm > 9 ? "" : "0") + mm, (dd > 9 ? "" : "0") + dd].join("");
};
