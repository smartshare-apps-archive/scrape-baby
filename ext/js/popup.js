var select_siteToConfigure;

var btn_startScrape;
var btn_gatherFields;

var btn_saveInitParams;
var btn_editInitParams;

var btn_addSiteStep;

var btn_saveParseParams;
var btn_saveGetParams;

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
	
	btn_saveGetParams = $("#btn_saveGetParams");
	btn_saveParseParams = $("#btn_saveParseParams");

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

			   var currentHTML = "<div class=\"input-group site-step\" data-stepID=\"" + stepID + "\">";
			   currentHTML += "<input type=\"text\" class=\"form-control\" value=\"" + stepID + "\" readonly>";
			   currentHTML += "<span class=\"input-group-addon\">Type</span>";
			   currentHTML += "<input type=\"text\" class=\"form-control\" value=\"" + stepType + "\" readonly>";
			   currentHTML += "<span class=\"input-group-btn\">";
		   	   currentHTML += "<button type=\"button\" class=\"btn btn-primary edit-site-step\" data-toggle=\"modal\" data-target=\"#modal_edit_" + stepType + "\" data-stepType=\"" + stepType + "\" data-stepID=\"" + stepID + "\"> Edit </button>";
			   currentHTML += "</span>";
			   currentHTML += "<span class=\"input-group-btn\">";
		   	   currentHTML += "<button type=\"button\" class=\"btn btn-danger delete-site-step\" data-stepID=\"" + stepID + "\"> Delete </button>";
			   currentHTML += "</span>";
			   currentHTML += "</div>";

		       $("#scrape_steps_cont").append(currentHTML);
			}
		}


		$(".delete-site-step").each(function(){
			var stepID = $(this).attr('data-stepID');

			$(this).unbind();
			$(this).click({stepID: stepID}, deleteSiteStep);
		});

		$(".edit-site-step").each(function(){
			var stepID = $(this).attr('data-stepID');
			var stepType = $(this).attr('data-stepType');

			$(this).unbind();
			
			if(stepType == "parse"){
				$(this).click({stepID: stepID}, loadParseParams);
			}
			else if(stepType == "get"){
				$(this).click({stepID: stepID}, loadGetParams);

			}

		});
	});


}



function deleteSiteStep(event){
	var stepID = event.data.stepID;
	var currentSite = select_siteToConfigure.val();
	
	chrome.storage.local.get(currentSite, function(params) {

		if(currentSite in params){
			var saved_params = params[currentSite];
		}
		// otherwise, we must be creating a new config
		else{
			var saved_params = {};
		}

		if(stepID in saved_params){
			delete saved_params[stepID];
		}
		

 		chrome.storage.local.set({[currentSite]: saved_params}, function() {
 			var selectorString = '[data-stepID="' + stepID + '"]';
 			var stepContainer = $(".site-step" + selectorString);
 			stepContainer.remove();
 		});

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
	      
	       var currentHTML = "<div class=\"input-group site-step\" data-stepID=\"" + stepID + "\">";
		   currentHTML += "<input type=\"text\" class=\"form-control\" value=\"" + stepID + "\" readonly>";
		   currentHTML += "<span class=\"input-group-addon\">Type</span>";
		   currentHTML += "<input type=\"text\" class=\"form-control\" value=\"" + stepType + "\" readonly>";
		   currentHTML += "<span class=\"input-group-btn\">";
		   currentHTML += "<button type=\"button\" class=\"btn btn-primary edit-site-step\" data-toggle=\"modal\" data-target=\"#modal_edit_" + stepType + "\" data-stepType=\"" + stepType + "\" data-stepID=\"" + stepID + "\"> Edit </button>";
		   currentHTML += "</span>";
		   currentHTML += "<span class=\"input-group-btn\">";
		   currentHTML += "<button type=\"button\" class=\"btn btn-danger delete-site-step\" data-stepID=\"" + stepID + "\"> Delete </button>";
		   currentHTML += "</span>";
		   currentHTML += "</div>";

	       $("#scrape_steps_cont").append(currentHTML);

	       $(".delete-site-step").each(function(){
			var stepID = $(this).attr('data-stepID');

			$(this).unbind();
			$(this).click({stepID: stepID}, deleteSiteStep);
		});

	       $(".edit-site-step").each(function(){
				var stepID = $(this).attr('data-stepID');
				var stepType = $(this).attr('data-stepType');

				$(this).unbind();
				if(stepType == "parse"){
					$(this).click({stepID: stepID}, loadParseParams);
				}
				else if(stepType == "get"){
					$(this).click({stepID: stepID}, loadGetParams);

				}
			});

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



function saveParseParams(event){
	var currentSite = select_siteToConfigure.val();
	var currentStep = event.data.stepID;
	console.log("Saving " + currentStep);

	// get the saved parameters, so overwriting the values won't erase other steps in the parse list
	chrome.storage.local.get(currentSite, function(params) {

		console.log(params);

		// if we have saved_params, store them in a temporary variable to make access cleaner
		if(currentSite in params){
			var saved_params = params[currentSite];
			var tempType = saved_params[currentStep]["type"];

			console.log("type:" + tempType);
			
			saved_params[currentStep] = {
										"type": tempType
										};
		}
		
		// otherwise, we must be creating a new config
		else{
			var saved_params = {};
			saved_params[currentStep] = {};
		}
		
		//cycle through the init param inputs and set the values 
		$(".parse-param").each(function(){

			var fieldID = $(this).attr('data-fieldID');
			var fieldValue = $(this).val();

			console.log(fieldID);
			saved_params[currentStep][fieldID] = fieldValue;
		});

		
		console.log(saved_params);
		// store the current sites initialization parameters
	   chrome.storage.local.set({[currentSite]: saved_params}, function() {
	       console.log('Saved website initialization parameters.');
	   });

   });
}



// loads the initialization modal with saved website configuration

function loadParseParams(event){
	console.log("Loading " + event.data.stepID);
	
	var currentSite = select_siteToConfigure.val();
	var currentStep = event.data.stepID;

	//get configuration for the current site
	chrome.storage.local.get(currentSite, function (params) {

		// check if this site has saved parameters
	   if(currentSite in params){
	   	var saved_params = params[currentSite];
	   }
	   //if it doesn't set that to null so the loop below will replace the contents of the modal with blanks
	   else {
	   	var saved_params = null;
	   }

	   //cycle through each init param input 
	   $(".parse-param").each(function(){

	   	var fieldID = $(this).attr('data-fieldID');

	   	//check if saved_params exists
	   	if(saved_params){
	   	   	if(currentStep in saved_params){
	   	   		//if the current field is saved, get the saved value and populate the input with it
		   		if(fieldID in saved_params[currentStep]){
			   		var fieldValue = saved_params[currentStep][fieldID];
			   		$(this).val(fieldValue);
		   		}
	   		}	
	   	}

	   	// if there are no saved params, default to empty string
	   	else{
	   		$(this).val("");
	   	}
		
	   });

	   btn_saveParseParams.unbind();
	   btn_saveParseParams.click({stepID: currentStep}, saveParseParams);
	});
}



// loads the initialization modal with saved website configuration

function loadGetParams(event){
	console.log("Loading " + event.data.stepID);
	
	var currentSite = select_siteToConfigure.val();
	var currentStep = event.data.stepID;

	//get configuration for the current site
	chrome.storage.local.get(currentSite, function (params) {

		// check if this site has saved parameters
	   if(currentSite in params){
	   	var saved_params = params[currentSite];
	   }
	   //if it doesn't set that to null so the loop below will replace the contents of the modal with blanks
	   else {
	   	var saved_params = null;
	   }

	   //cycle through each init param input 
	   $(".get-param").each(function(){

	   	var fieldID = $(this).attr('data-fieldID');

	   	//check if saved_params exists
	   	if(saved_params){
	   	   	if(currentStep in saved_params){
	   	   		//if the current field is saved, get the saved value and populate the input with it
		   		if(fieldID in saved_params[currentStep]){
			   		var fieldValue = saved_params[currentStep][fieldID];
			   		$(this).val(fieldValue);
		   		}
	   		}	
	   	}

	   	// if there are no saved params, default to empty string
	   	else{
	   		$(this).val("");
	   	}
		
	   });

	   btn_saveGetParams.unbind();
	   btn_saveGetParams.click({stepID: currentStep}, saveGetParams);
	});
}






function saveGetParams(event){
	var currentSite = select_siteToConfigure.val();
	var currentStep = event.data.stepID;
	console.log("Saving " + currentStep);

	// get the saved parameters, so overwriting the values won't erase other steps in the parse list
	chrome.storage.local.get(currentSite, function(params) {

		console.log(params);

		// if we have saved_params, store them in a temporary variable to make access cleaner
		if(currentSite in params){
			var saved_params = params[currentSite];
			var tempType = saved_params[currentStep]["type"];

			console.log("type:" + tempType);
			
			saved_params[currentStep] = {
										"type": tempType
										};
		}
		
		// otherwise, we must be creating a new config
		else{
			var saved_params = {};
			saved_params[currentStep] = {};
		}
		
		//cycle through the init param inputs and set the values 
		$(".get-param").each(function(){

			var fieldID = $(this).attr('data-fieldID');
			var fieldValue = $(this).val();

			console.log(fieldID);
			saved_params[currentStep][fieldID] = fieldValue;
		});

		
		console.log(saved_params);
		// store the current sites initialization parameters
	   chrome.storage.local.set({[currentSite]: saved_params}, function() {
	       console.log('Saved website initialization parameters.');
	   });

   });
}

