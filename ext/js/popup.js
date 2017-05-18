var test_params = {
	"init": {
				type: "raw",
				method: "get",
				url: "https://www.darice.com/store/search?s=perler&p=1&ps=60&o=0",
				next_action: "get_product_links",
				requires_session: true,
				session_params: {
					"login_url":"https://www.darice.com/account/logon",
					"login_method":"post",
					"username": ["EmailAddress","info@bhens.com"],
					"password": ["AccountPassword","sandaga1"],
					"requires_token":true,
					"token_url":"https://www.darice.com/",
					"token_re":String.raw`name=\"\_\_RequestVerificationToken\"\stype=\"hidden\"\svalue=\"([^\"]+)\"`,
					"token_name":"__RequestVerificationToken"
				},
				
   			},

   		"get_product_links":{
				type: "parse",
				regex: String.raw`\"boldLink\sproductLink\"\shref=\"([^\"]+)\"\>([^\<]+)\</a\>'`,
				output_format: "dict",
				iterate: true,
				key_indices: "product_id",
				
	   	}
};


chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	console.log(message);

});


$(document).ready(function(){
	bindElements();
	bindEvents();

	
	chrome.runtime.sendMessage({params: test_params});
	
	
});


function bindElements(){



}

function bindEvents(){


}

/*
pipeline


   scrape_params = {

	   	"init": {
				type: "raw",
				method: "get",
				url: ""
				next_action: "get_product_links"
				requires_session: true
				session_login: {
					"username":"ok"
					"password":"password"
				}
				
	   			},

	   	"get_product_links":{
				type: "parse",
				regex: r're.compile(r'\"boldLink\sproductLink\"\shref=\"([^\"]+)\"\>([^\<]+)\</a\>')'
				output_format: "dict",
				key_indices: "product_id",
				next_action: "get_product_data"
	   	}

	   	"get_product_data":{
				type: "raw",
				method: "get",
				url:""
				next_action: "parse_product_action"
	   	}

	   	"parse_product_data":{
				type: "parse",
				next_action: ""
	   	}


	}


*/