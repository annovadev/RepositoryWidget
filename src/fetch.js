
import TimeAgo from "javascript-time-ago";
// Load locale-specific relative date/time formatting rules.
import en from "javascript-time-ago/locale/en";

var converter = require('byte-converter').converterBase10;
var AppSettings = require('./settings.json'); 
var createClient = require("webdav");
var proxyURL = "http://om24md:3000/fetch/";
var webDavBaseURL = 'http://openmedia24/testwebdavfolder/'  
var client = createClient(proxyURL+webDavBaseURL,    "administrator",    "Annova124");
 
export function getFileStream(filename){
//alert(filename);
//	window.open(webDavBaseURL+filename)
}

export function execute_fetch(searchpath, query, page) {
 if (query == ""){
	
return client.getDirectoryContents(searchpath)
 
        .then(responseData => {
			console.log(responseData);
		return buildStandardJSON(responseData,"");
	

		})
		
		.catch(error => console.warn(error));
}
else {
	return client.getSearchDirectoryContents(searchpath)
	
	.then(responseData => {
	//	console.log(responseData);
	var results = [];
	var searchField = "basename";
	var searchVal = query;
		for (var i=0 ; i < responseData.length ; i++){
		
			var regex = new RegExp(query);
			var matchesRegex = regex.test(responseData[i][searchField]);
			if (matchesRegex) {
				results.push(responseData[i]);
			}

			
   		
	}
	return buildStandardJSON(results,query);

	
	//	console.log(results);
	
})
}
}





function buildStandardJSON(responseData,query) {
	console.log(responseData);
	TimeAgo.locale(en);
	const timeAgo = new TimeAgo("en-US");
	var len = responseData.length;
 //  console.log("Array len:"+len);
	 var	i;
	 var z = 0;
	var	newData = { resultCount: responseData.length, items: [] };
	// get rid of the current directory - otherwise listed in search ...
	if (query == ""){
		z = 1;
	}
	

	//Loop through the source JSON and format it into the standard format

	for (i = z; i < len; i += 1) {
      console.log(responseData[i].filename);
	try{
		let absolutePath = responseData[i].filename;
		absolutePath = absolutePath.replace("../","");
		//console.log(absolutePath);

		newData.items.push({
			key: responseData[i].filename,
			rawItem: responseData[i].filename,
			title: responseData[i].basename,
			basename: responseData[i].basename,
	//		description: responseData[i].basename,
			target: "_blank",
			open_url: webDavBaseURL + responseData[i].filename,
			highres: webDavBaseURL + responseData[i].filename,
			itemType: responseData[i].type,
			mediaType: responseData[i].mime,
			author: responseData[i].filename,
			source: responseData[i].filename,
			thumbnail: webDavBaseURL + responseData[i].filename,
		
			meta:
	//		Math.round(converter(responseData[i].size, 'B', 'MB'),-2) +
			converter(responseData[i].size, 'B', 'MB')+
			"&nbsp;&middot;&nbsp" +
			timeAgo.format(new Date(responseData[i].lastmod))
		

		});
	}
		catch(e)
		{
		console.log("Error occoured fetching a value from JSON:" + e)
		}	
	

	}

	return newData;
}