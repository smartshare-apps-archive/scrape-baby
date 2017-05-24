var select_siteToConfigure;

var btn_setParameters;
var btn_startScrape;
var btn_gatherFields;

var input_siteParameters;
var input_siteToScrape;
var input_siteToTest;

var input_testURL;

var currentURL;

//https://www.darice.com/store/search?s=perler&p=1&ps=60&o=0

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	console.log(message);

});


$(document).ready(function(){

  chrome.tabs.getSelected(null, function(tab) {
  		bindElements();
		bindEvents();
		loadParameters();

        currentURL = tab.url;

        populateTargetFields();
    });
	
});


function bindElements(){
	btn_setParameters = $("#btn_setParameters");
	btn_startScrape = $("#btn_startScrape");
	btn_gatherFields = $("#btn_gatherFields");

	select_siteToConfigure = $("#select_siteToConfigure");

	input_siteParameters = $("#input_siteParameters");
	input_siteToScrape = $("#input_siteToScrape");
	input_testURL = $("#input_testURL");
	input_siteToTest = $("#input_siteToTest");
}


function bindEvents(){
	btn_setParameters.click(setParameters);
	btn_startScrape.click(initScrape);
	btn_gatherFields.click(gatherFields);

	select_siteToConfigure.change(loadParameters);
}



function initScrape(){
	var currentParams = null;
	//chrome.runtime.sendMessage({params: test_params_b});

}


function gatherFields(){
	var testURL = input_testURL.val();
	var currentParams = input_siteToTest.val();
	
	chrome.storage.sync.get(currentParams, function (obj) {
		var paramString = obj[currentParams];
	 	paramString = paramString.replace('param_url', "\"" + testURL + "\"");
	 	console.log(paramString);
	 	var paramObj = JSON.parse("{" + paramString + "}");
	 	console.log(paramObj); 
	});
}



function populateTargetFields(){
	//populate url to scrape
	input_siteToScrape.val(currentURL);


}



function setParameters(){
   var currentSite = select_siteToConfigure.val();
   var currentParams = input_siteParameters.val();

   var json_obj = {};
   json_obj[currentSite] = currentParams;


   chrome.storage.sync.set(json_obj, function() {
       console.log('Saved website scrape parameters.');
   });
}


function loadParameters(){
	var currentSite = select_siteToConfigure.val();
	
	chrome.storage.sync.get(currentSite, function (obj) {
	   input_siteParameters.val(obj[currentSite]);
	});
}



function getSavedSites(){
	chrome.storage.sync.get("stored_websites", function (obj) {
	    console.log(obj);
	});	
}


/*
 store json data for scrape
 how does output work/csv?
 send final results to csv

*/