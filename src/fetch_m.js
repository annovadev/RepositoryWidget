import TimeAgo from "javascript-time-ago";
// Load locale-specific relative date/time formatting rules.
import en from "javascript-time-ago/locale/en";
var AppSettings = require('./settings.json'); 

export function execute_fetch(query, page) {
	var tokenpromise = new Promise(function(resolve, reject) {
	
		var user = AppSettings.fetch.username;
		var password = AppSettings.fetch.password;
		var loginURL = AppSettings.fetch.url;
		var tok = user + ":" + password;
		var hash = btoa(tok);
		var today = new Date();

		if (
			localStorage.getItem("medox_access_token") === null ||
			localStorage.getItem("medox_access_token_expiry_date") < today.getTime()
		) {
			fetch(loginURL, {
				method: "GET",
				headers: {
					Authorization: "Basic " + hash,
					Accept: "application/json"
				}
			})
				.then(response => response.json())
				.then(data => {
					localStorage.setItem("medox_access_token", data.access_token);
					var expiryDateTimeMS = today.getTime() + data.expires_in * 1000;
					localStorage.setItem(
						"medox_access_token_expiry_date",
						expiryDateTimeMS
					);
					console.log(data.access_token);
					resolve(data.access_token);
				})
				.catch(error => console.warn(error));
		} else {
			resolve(localStorage.getItem("medox_access_token"));
		}
	});

	//one we have a valid token, we actually execute the fetch
	return tokenpromise.then(function(token) {
        //console.log(token);
      
		var searchURL =
			"https://demo.medox.scisys.de:8443/dira6/api/v10/search/contentItems";

		return fetch(searchURL, {
			method: "POST",
			headers: {
				Authorization: "Bearer " + token,
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				query: {
					bool: {
						must: [{ index: { meta: query + " " } }],
						filter: [{ term: { status: "valid" } }]
					}
				},
				from: 1,
				size: 20,
				sort: [{ modTime: { order: "desc" } }]
			})
		})
			.then(response => response.json())
			.then(responseData => {
		//		console.log(responseData);

				TimeAgo.locale(en);
				const timeAgo = new TimeAgo("en-US");

				var len = responseData.contentItems.length,
					//newData = { resultCount: responseData.count, items: [] },
					newData = { resultCount: responseData.count, items: [] },
					i;
		//		console.log(len);

				//Loop through the source JSON and format it into the standard format
				for (i = 0; i < len; i += 1) {
					newData.items.push({
						id: responseData.contentItems[i]._id,
						key: responseData.contentItems[i]._id,
						rawItem: responseData.contentItems[i],
						title: responseData.contentItems[i].mainTitle,
						open_url: "https://demo.medox.scisys.de:8443/",
						description:
							"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",

						target: "_blank",
						iconName: responseData.contentItems[i].hasOwnProperty("images")
							? "image"
							: responseData.contentItems[i].hasOwnProperty("videos")
								? "film"
								: "volume up",
						iconColor: responseData.contentItems[i].hasOwnProperty("images")
							? "green"
							: responseData.contentItems[i].hasOwnProperty("videos")
								? "blue"
								: "red",
						mediaType: responseData.contentItems[i].hasOwnProperty("images")
							? "image"
							: responseData.contentItems[i].hasOwnProperty("videos")
								? "video"
								: "audio",

						thumbnail: responseData.contentItems[i].hasOwnProperty("images")
							? responseData.contentItems[i].images[0].variants[0].url
							: responseData.contentItems[i].hasOwnProperty("videos")
								? "https://react.semantic-ui.com/assets/images/image-16by9.png"
								: null,
						highres: responseData.contentItems[i].hasOwnProperty("images")
							? responseData.contentItems[i].images[0].variants[0].url
							: responseData.contentItems[i].hasOwnProperty("videos")
								? responseData.contentItems[i].videos[0].variants[0].url
								: responseData.contentItems[i].audios[0].variants[1].url,

						dragAndDropString:
							"<mos><mosID>DIRA.DEMO.AUDIO.MOS</mosID>" +
							"<objID>" +
							responseData.contentItems[i]._id +
							"</objID>" +
							"<objSlug>" +
							responseData.contentItems[i].mainTitle +
							"</objSlug>" +
							"<objTB>48000</objTB> <objDur>497664</objDur>" +
							"<mosAbstract>" +
							responseData.contentItems[i].mainType.displayName +
							"</mosAbstract></mos>",

						meta:
							responseData.contentItems[i].mainType.displayName +
							"&nbsp;&middot;&nbsp" +
							responseData.contentItems[i].creaUser +
							"&nbsp;&middot;&nbsp" +
							timeAgo.format(new Date(responseData.contentItems[i].creaTime))
					});
				}
				//console.log(JSON.stringify(newData));
				return newData;
			})
			.catch(error => console.warn(error));
	});
}
