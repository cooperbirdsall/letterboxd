import { writeJsonFile } from 'write-json-file';
import { movies } from './data/movies.js';
import { launch } from 'puppeteer';

//make the website think we are friends
const preparePageForTests = async (page) => {
	// Pass the User-Agent Test
	const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
	  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
	await page.setUserAgent(userAgent);
}

//get all of the reviews for the given movie
const getReviews = async (url) => {
	try {
		const browser = await launch({
			args: ['--no-sandbox'],
			headless: "new",
		});
		const page = await browser.newPage();
		await preparePageForTests(page);
		await page.goto(`${url}reviews/by/activity/`, {timeout: 0, waitUntil: "domcontentloaded"},);
		const data = await page.evaluate(() => {
			const reviews = [];
			const listItems = document.querySelectorAll("div.film-detail-content");
			for (const item of listItems) {
				//skip those that have to be expanded (too long)
				if (item.querySelector("div.collapsed-text") === null) {
					let review = "1";
					//review is a spoiler
					if (item.querySelector("div.hidden-spoilers") !== null) {
						review = item.querySelector("div.hidden-spoilers > p").innerText;
					} else {
						review = item.querySelector("div.body-text > p").innerText;
					}
					const rating = item.querySelector("span.rating");
					reviews.push({
						//there isn't always a rating!
						rating: rating !== null ? rating.innerText : "", 
						profileUrl: item.querySelector("a.context").getAttribute("href"),
						username: item.querySelector("strong").innerText,
						review: review,
					});
				}
			}
			return reviews;
		});
		await browser.close();
		return data;
	}
	catch (e) {
		console.log(e);
	}
}

function waitForMe(ms) { 
    return new Promise(resolve => { 
        setTimeout(() => { resolve('') }, ms); 
    }) 
} 

//loop through every movie in the list and make it an object (with reviews)
const makeFilms = async () => {
	const films = [];
	for (let i = 0; i < movies.length; i++) {
		console.log("starting", movies[i][1], `(${i})`);
		const info = movies[i][1];
		const reviews = await getReviews(movies[i][0]);
		films.push({
			title: info.slice(0, -12),
			year: info.slice(-10, -6),
			rating: info.slice(-4),
			reviews: reviews,
		});
		//don't overload their servers idk
		await waitForMe(Math.random() * (6000 - 4500 + 1) + 4500);
	}
	console.log("finishing up...")
	await waitForMe(5000);
	console.log("finished with ", films.length, " films");
	await writeJsonFile("films.json", films);
}

makeFilms();