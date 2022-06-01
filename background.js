function downloadAdsDomains() {
	
	console.log('Initiating...');
	
	var ads = document.getElementsByClassName('uEierd');
	var ads_array = []

	for( i in ads ){
		if( ads.hasOwnProperty(i) ){
			ads_array.push([
				ads[i].getElementsByClassName('d8lRkd')[0].getElementsByTagName('span')[2].dataset.dtld
			]);
		}
	}

	let csvContent = "data:text/csv;charset=utf-8," + ads_array.map(e => e.join(",")).join("\n");

	var encodedUri = encodeURI(csvContent);
	var query = document.querySelector('input[name="q"').value.toLowerCase();
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", query+"-ads.csv");
	document.body.appendChild(link);

	link.click();


}

chrome.action.onClicked.addListener((tab) => {
	
	if(!tab.url.includes("chrome://")) {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: downloadAdsDomains
		});
	}

});