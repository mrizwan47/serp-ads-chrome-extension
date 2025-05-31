var scrape_and_append = document.getElementById('scrape_and_append');
var clear_csv = document.getElementById('clear_csv');
var download_csv = document.getElementById('download_csv');


chrome.storage.local.get('serp_ads_domains_list', function(items) {

	if( items['serp_ads_domains_list'] ){
		document.getElementById('total_count').innerHTML = items['serp_ads_domains_list'].length;
	}else{
		document.getElementById('total_count').innerHTML = 0;
	}

});

chrome.storage.onChanged.addListener(function(changes, namespace) {

	if( namespace == 'local' && changes.hasOwnProperty('serp_ads_domains_list') ){

		if( changes['serp_ads_domains_list'].hasOwnProperty('newValue') ){
			document.getElementById('total_count').innerHTML = changes['serp_ads_domains_list']['newValue'].length
		}else{
			document.getElementById('total_count').innerHTML = 0;
		}
		
	}

});



// Clear Data
clear_csv.addEventListener("click", async () => {
	
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	if(!tab.url.includes("chrome://")) {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: function(){
				chrome.storage.local.remove('serp_ads_domains_list', function() {
					console.log('Data cleared!');
				});
			}
		});
	}

});


// Scrape And Append
scrape_and_append.addEventListener("click", async () => {
	
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	if(!tab.url.includes("chrome://")) {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: function(){

				chrome.storage.local.get('serp_ads_domains_list', function(items) {

					if( items['serp_ads_domains_list'] ){
						ads_array = items['serp_ads_domains_list'];
					}else{
						ads_array = [];
					}
			
					// Get the search query value from the hidden input
					var query = document.querySelector('input[name="q"]').value;

					// Track domains we've already seen to avoid duplicates
					var seenDomains = new Set();
					
					var ads = document.getElementsByClassName('uEierd');
					for( i in ads ){
						if( ads.hasOwnProperty(i) ){
							try {
								// Get the domain
								var domain = ads[i].getElementsByClassName('d8lRkd')[0].getElementsByTagName('span')[7].dataset.dtld;
								
								// Skip if domain is undefined or already seen
								if (!domain || seenDomains.has(domain)) {
									continue;
								}
								
								// Add to seen domains set
								seenDomains.add(domain);
								
								// Add to results array
								ads_array.push([
									query, // Include the search query as the first column
									domain
								]);
							} catch (e) {
								// Skip this item if there's any error accessing the domain
								console.log('Error processing ad:', e);
							}
						}
					}
			
					chrome.storage.local.set({'serp_ads_domains_list': ads_array}, function() {
						console.log('Domains Saved!')
					});
			
				});

			}
		});
	}
	

});


// Download CSV
download_csv.addEventListener("click", async () => {
	
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	if(!tab.url.includes("chrome://")) {

		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: function(){

				chrome.storage.local.get('serp_ads_domains_list', function(items) {
	
					if( items['serp_ads_domains_list'] ){
						ads_array = items['serp_ads_domains_list'];
					}else{
						ads_array = [];
					}
			
					let csvContent = "data:text/csv;charset=utf-8," + ads_array.map(e => e.join(",")).join("\n");
			
					var encodedUri = encodeURI(csvContent);
					var query = document.querySelector('input[name="q"]').value.toLowerCase();
					var link = document.createElement("a");
					link.setAttribute("href", encodedUri);
					link.setAttribute("download", query+"-ads.csv");
					document.body.appendChild(link);
				
					link.click();
			
				});
	
			}
		});

	}

});