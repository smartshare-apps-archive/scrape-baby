console.log("run");


chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){

	if("params" in message){
		console.log("Heres a message");
		send_request(message);
	}

});



function send_request(params){
	var params = JSON.stringify(params)
	console.log("Sending");
	console.log(params);

	$.ajax({
	  method: "POST",
	  url: "http://localhost:5000/init_scrape",
	  dataType: "json",
	  traditional:true,
	  data: { scrape_params: params }
	})
	  .done(function(results) {
	  		console.log("Here is a result");
	  		console.log(results);
	  		sendToMain(results);
	  });
}



function sendToMain(results){
	chrome.runtime.sendMessage({msg: results});
}