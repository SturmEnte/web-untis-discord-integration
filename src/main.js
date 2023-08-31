require("dotenv/config")();

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const WEBHOOK = process.env.WEBHOOK;

if (!USERNAME) {
	console.error("No username");
	process.exit();
}

if (!PASSWORD) {
	console.error("No password");
	process.exit();
}

if (!WEBHOOK) {
	console.error("No webhook");
	process.exit();
}
