
import TimeAgo from "javascript-time-ago";
// Load locale-specific relative date/time formatting rules.
import en from "javascript-time-ago/locale/en";
var converter = require('byte-converter/lib/byte-converter').converterBase10;



export function fetch_api_download(id){

/*
	return fetch('http://localhost:3020/api/download?items='+id)   .then(response => response.blob())
	.then(blob => {
		var url = window.URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
	//	a.download = "filename.xlsx";
		a.click();                    
	});*/
};
	




export function fetch_getList(nodeId, folderID,query){
	console.log("Folder ID: " + folderID);
	console.log("Node ID: " + nodeId);
	console.log("Query: " + query);
	//return fetch('http://127.0.0.1:1880/ftp?remotePath=' +folderID)
	var url; 
if (query =="") {
	url = "http://127.0.0.1:1880/ftp?remotePath="+folderID+"&operation=list&repository="+nodeId;
}
else {
	url = "http://127.0.0.1:1880/ftp?remotePath=&operation=find&repository="+nodeId+"&query="+query;
}
console.log("URL" + url)

return fetch(url)
	.then(response => response.json())
	.then(responseData => {
	console.log(responseData);
TimeAgo.locale(en);
const timeAgo = new TimeAgo("en-US");
var len = responseData.items.length;
// console.log("Array len:"+len);
 var	i;
 var z = 0;
var	newData = { resultCount: responseData.items.length, parentFolderId: responseData.parent ,items: [] };
// get rid of the current directory - otherwise listed in search ...


//Loop through the source JSON and format it into the standard format

for (i = 0; i < len; i += 1) {
    console.log(responseData.items[i].id);
try{


	newData.items.push({
	
		id: responseData.items[i].id,
		rawItem: responseData.items[i],
		title: responseData.items[i].name,
		basename: responseData.items[i].name,
//		description: responseData[i].basename,
		target: "_blank",
//		open_url: webDavBaseURL + responseData[i].filename,

		highres: responseData.items[i].url,
		itemType: responseData.items[i].type,
		mediaType: responseData.items[i].mime,
//		author: responseData[i].filename,
//		source: responseData[i].filename,
//			thumbnail: webDavBaseURL + responseData[i].filename,
	
	meta:
	//	Math.round(converter(responseData[i].size, 'B', 'MB'),-2) +
	
		"&nbsp;&middot;&nbsp" +
		timeAgo.format(new Date(responseData.items[i].modifiedTime))
	

		
	});
}
catch(e)
{
	console.log("Error occoured fetching a value from JSON:" + e)
}
}


//	console.log(JSON.stringify(newData));

return newData;
})
.catch(error => console.warn(error));
	
}





export function fetch_getFile(filename){
	console.log("Download File: " + filename );
	let protocol = "ftp";
//	let repositoryId = 1;
	let searchpath = "";
	return fetch('./server/'+protocol+'/getFile?&repositoryId=' + repositoryId + "&path=" + searchpath)
//	return fetch('./server/ftp?query=' + filename )

	}

export function fetch_getRepositories() {
	return fetch('http://127.0.0.1:1880/flow/3c8c89ec.bdf5f6')
	
		.then(response => response.json())
		.then(responseData => {
			console.log(responseData);
			var	i;
			var len = responseData.nodes.length;
			var z = 0;
			var	newData = [];
// get rid of the current directory - otherwise listed in search ...


//Loop through the source JSON and format it into the standard format

		for (i = 0; i < len;i += 1) {
		//	console.log(responseData[i].id);
		

			try{
				if (responseData.nodes[i].type == "http in") {

					console.log(responseData.nodes[i].type);
			newData.push({
			key:	z,
			value:	z,
			nodeId : responseData.nodes[i].id,
			text : responseData.nodes[i].name,
			});

			z += 1;
		}
		}
			catch(ex){


			}
			}
			console.log(JSON.stringify(newData));
				return newData;
		
		});
	};



