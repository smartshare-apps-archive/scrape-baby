var select_siteToConfigure;

var btn_setParameters;
var btn_startScrape;
var btn_gatherFields;
var btn_saveInitParams;
var btn_editInitParams;
var btn_addSiteStep;

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

        currentURL = tab.url;

        populateTargetFields();
        populateSiteSteps();

    });

	/*
	chrome.storage.local.clear(function() {
	    var error = chrome.runtime.lastError;
	    if (error) {
	        console.error(error);
	    }
	});
	*/

});


function bindElements(){
	btn_startScrape = $("#btn_startScrape");
	btn_gatherFields = $("#btn_gatherFields");
	btn_saveInitParams = $("#btn_saveInitParams");
	btn_editInitParams = $("#btn_editInitParams");
	btn_addSiteStep = $("#btn_addSiteStep");

	select_siteToConfigure = $("#select_siteToConfigure");

	input_siteToScrape = $("#input_siteToScrape");
	input_testURL = $("#input_testURL");
	input_siteToTest = $("#input_siteToTest");
}


function bindEvents(){

	btn_startScrape.click(initScrape);
	btn_gatherFields.click(gatherFields);
	btn_saveInitParams.click(saveInitParams);
	btn_editInitParams.click(loadInitParams);

	btn_addSiteStep.click(addSiteStep);
	select_siteToConfigure.change(populateSiteSteps);
}



function initScrape(){
	var currentParams = null;
	//chrome.runtime.sendMessage({params: test_params_b});

}

function populateSiteSteps(){
	var currentSite = select_siteToConfigure.val();
	// get the saved parameters, so overwriting the values won't erase other steps in the parse list
	chrome.storage.local.get(currentSite, function(params) {
		
		if(currentSite in params){
			var saved_params = params[currentSite];
		}
		// otherwise, we must be creating a new config
		else{
			var saved_params = {};
		}

		$("#scrape_steps_cont").html("");

		for(stepID in saved_params){
			if (stepID != "init"){
			   var stepType = saved_params[stepID]["type"];

			  

			   var currentHTML = "<div class=\"input-group\" data-stepID=\"" + stepID + "\">";
			   currentHTML += "<span class=\"input-group-addon\">Step</span>";
			   currentHTML += "<input type=\"text\" class=\"form-control\" value=\"" + stepID + "\" readonly>";
			   currentHTML += "<span class=\"input-group-addon\">Type</span>";
			   currentHTML += "<input type=\"text\" class=\"form-control\" value=\"" + stepType + "\" readonly>";
			   currentHTML += "<span class=\"input-group-btn\">";
			   currentHTML += "<button type=\"button\" class=\"btn btn-primary\" data-toggle=\"modal\" data-target=\"#modal_initParams\"> Edit </button>";
			   currentHTML += "</span>";
			   currentHTML += "<span class=\"input-group-btn\">";
			   currentHTML += "<button type=\"button\" class=\"btn btn-danger\" data-toggle=\"modal\" data-target=\"#modal_initParams\"> Delete </button>";
			   currentHTML += "</span>";
			   currentHTML += "</div><br>";

		       $("#scrape_steps_cont").append(currentHTML);
			}
		}
	});


}
function addSiteStep(){
	var currentSite = select_siteToConfigure.val();
	// get the saved parameters, so overwriting the values won't erase other steps in the parse list
	chrome.storage.local.get(currentSite, function(params) {
		
		if(currentSite in params){
			var saved_params = params[currentSite];
		}
		// otherwise, we must be creating a new config
		else{
			var saved_params = {};
		}

		console.log(saved_params);
		
		var stepID = $("#input_newStepName").val();
		var stepType = $("#select_newStepType").val();

		if(stepID != "" && (!(stepID in saved_params))){
			saved_params[stepID] = {};
			saved_params[stepID]["type"] = stepType;
		}

 		chrome.storage.local.set({[currentSite]: saved_params}, function() {
	       console.log('Saved new step.');
	      
	       var currentHTML = "<div class=\"input-group\" data-stepID=\"" + stepID + "\">";
		   currentHTML += "<span class=\"input-group-addon\">Step</span>";
		   currentHTML += "<input type=\"text\" class=\"form-control\" value=\"" + stepID + "\" readonly>";
		   currentHTML += "<span class=\"input-group-addon\">Type</span>";
		   currentHTML += "<input type=\"text\" class=\"form-control\" value=\"" + stepType + "\" readonly>";
		   currentHTML += "<span class=\"input-group-btn\">";
		   currentHTML += "<button type=\"button\" class=\"btn btn-primary\" data-toggle=\"modal\" data-target=\"#modal_initParams\"> Edit </button>";
		   currentHTML += "</span>";
		   currentHTML += "<span class=\"input-group-btn\">";
		   currentHTML += "<button type=\"button\" class=\"btn btn-danger\" data-toggle=\"modal\" data-target=\"#modal_initParams\"> Delete </button>";
		   currentHTML += "</span>";
		   currentHTML += "</div><br>";

	       $("#scrape_steps_cont").append(currentHTML);
	   });

	});


}


function gatherFields(){
	var testURL = input_testURL.val();
	var currentParams = input_siteToTest.val();
	
	chrome.storage.local.get(currentParams, function (obj) {
		var paramString = obj[currentParams];

	});
}



function populateTargetFields(){
	//populate url to scrape
	input_siteToScrape.val(currentURL);


}


// save initialization parameters to local chrome storage
function saveInitParams(){
	var currentSite = select_siteToConfigure.val();

	// get the saved parameters, so overwriting the values won't erase other steps in the parse list
	chrome.storage.local.get(currentSite, function(params) {

		// if we have saved_params, store them in a temporary variable to make access cleaner
		if(currentSite in params){
			var saved_params = params[currentSite];
			saved_params["init"] = {};
		}
		// otherwise, we must be creating a new config
		else{
			var saved_params = {};
			saved_params["init"] = {};
		}
		
		//cycle through the init param inputs and set the values 
		$(".init-param").each(function(){

			var fieldID = $(this).attr('data-fieldID');
			var fieldValue = $(this).val();
			saved_params["init"][fieldID] = fieldValue;
		});

		// store the current sites initialization parameters
	   chrome.storage.local.set({[currentSite]: saved_params}, function() {
	       console.log('Saved website initialization parameters.');
	   });

   });

	
}


// loads the initialization modal with saved website configuration
function loadInitParams(){
	var currentSite = select_siteToConfigure.val();
	
	//get configuration for the current site
	chrome.storage.local.get(currentSite, function (params) {

		// check if this site has saved parameters
	   if(currentSite in params){
	   	var saved_params = params[currentSite];

	   }
	   //if it doesn't set that to null so the loop below will replace the contents of the modal with blanks
	   else{
	   	var saved_params = null;
	   }

	   //cycle through each init param input 
	   $(".init-param").each(function(){

	   	var fieldID = $(this).attr('data-fieldID');

	   	//check if saved_params exists
	   	if(saved_params){
	   	   	if("init" in saved_params){
	   	   		//if the current field is saved, get the saved value and populate the input with it
		   		if(fieldID in saved_params["init"]){
			   		var fieldValue = saved_params["init"][fieldID];
			   		$(this).val(fieldValue);
		   		}
	   		}	
	   	}

	   	// if there are no saved params, default to empty string
	   	else{
	   		$(this).val("");
	   	}
	


	   });

	});
}



