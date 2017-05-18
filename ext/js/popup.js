var test_params_a = {
		
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
   		//match_descriptors come in pairs in two
   		"get_product_links":{
			type: "parse",
			search_re_list: 
				[	
				{
					id: "product_links",
					exp: String.raw`\"boldLink\sproductLink\"\shref=\"([^\"]+)\"\>([^\<]+)\</a\>`,
					operation: "iterate",
					//match_descriptors: ["product_link","product_title"]
				}
				],
			next_action:"get_product_specs"
			
				
	   	},

	   	"get_product_specs": {
				type: "raw",
				method: "get",
				urls_in_result: "true",
				url_key: "product_links",
				url: null,
				base_url: "https://darice.com",
				next_action: "parse_product_specs"

   		},

   		"parse_product_specs":{
			type: "parse",
			search_re_list: 
				[	
				{
					id: "product_specs",
					associate_with_key: "true",
					exp: String.raw`\<div\sclass=\"specRow\"\>[^\<]+\<span\sclass=\"alignLeft\"\>[^A-Za-z0-9\$\.\-]+([A-Za-z0-9\$\s\.\-]+)[^\<]+\</span\>[^\<]+\<span\sclass=\"alignRight\"\>[^A-Za-z0-9\$\-\.]+([A-Za-z0-9\$\s\.\-]+)\</span\>`,
					operation: "iterate",
				}
				],
			next_action:null
	   	},

};

var test_params_b = {
		"init": {
				type: "raw",
				method: "get",
				url: "https://www.aliexpress.com/item/2014-Mens-Boy-Body-Compression-Base-Layer-Sleeveless-Sport-Vest-Thermal-Under-Top-Tees-Tank-Tops/1918374005.html?ws_ab_test=searchweb0_0,searchweb201602_2_10152_10065_10151_10130_10068_10136_10137_10157_10060_10138_10155_10062_10156_437_10154_10056_10055_10054_10059_303_100032_9872_100033_100031_10099_10103_10102_10096_10147_10052_10053_10050_10107_10142_10051_10084_10083_10080_10082_10081_10178_10110_519_10111_10112_10113_10114_10181_10183_10182_10185_10078_10079_10073_10123_142-9872,searchweb201603_1,ppcSwitch_7&btsid=a530e854-caa9-4608-88f4-d2cc28e1c5a2&algo_expid=433cdc7f-33e5-4419-b039-12b59cdb26b6-2&algo_pvid=433cdc7f-33e5-4419-b039-12b59cdb26b6",
				next_action: "first_action",
				requires_session: false
				
   			},

   		"first_action":{
			type: "parse",
			search_re_list: 
				[	
				{
					id: "product_price",
					exp: String.raw`\<span\sclass=\"p-symbol\"\>(US)\s\$\</span\>\<span\sid=\"j\-sku\-price\"\sclass=\"p\-price\"\>([^\<]+)`,
					operation: "search",
					//match_descriptors: ["product_link","product_title"]
				},

				{
					id: "product_title",
					exp: String.raw`\<span\sclass=\"p-symbol\"\>(US)\s\$\</span\>\<span\sid=\"j\-sku\-price\"\sclass=\"p\-price\"\>([^\<]+)`,
					operation: "search",
					//match_descriptors: ["product_link","product_title"]
				}
				],
	   	}
  
};



chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	console.log(message);

});


$(document).ready(function(){
	bindElements();
	bindEvents();

	
	chrome.runtime.sendMessage({params: test_params_b});
	
	
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