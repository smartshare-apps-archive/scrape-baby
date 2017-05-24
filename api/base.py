import json, time, markdown, requests, re

from itertools import izip

from flask import Blueprint, render_template, abort, current_app, session, request, Markup, redirect, url_for


request_endpoints = Blueprint('request_endpoints', __name__, template_folder='templates')		#blueprint definition



@request_endpoints.route('/init_scrape', methods=["POST"])
def scrape():
	scrape_params = request.form['scrape_params']
	scrape_params = json.loads(scrape_params)["params"]

	session, current_result, next_action = init_scrape(scrape_params)
	

	while(next_action):
		print "Now moving to: ", next_action
		current_params = scrape_params.get(next_action, None)

		if current_params:
			action_type = current_params.get('type', None)

			if action_type:
				if action_type == "parse":
					print "Performing parse action..."
					previous_result = current_result
					current_result = parse_action(current_params, s=session, result_data=previous_result)
				elif action_type == "raw":
					#print "Performing request action..."
					previous_result = current_result
					current_result = get_action(current_params, s=session, result_data=previous_result)

			#print "Current action params: ", current_params
		
		next_action = current_params.get("next_action", None)

	print current_result
	return json.dumps(current_result)





def init_scrape(scrape_params):
	init_params = scrape_params.get('init', None)

	if init_params:
		s = None

		#if these scrapes require authentication, set up an authenticated session object 
		if(init_params["requires_session"]):
			s = create_session(init_params["session_params"])
		else:
			s = requests.Session()

		if s:
			raw_data = get_action(init_params, s = s)
			next_action = init_params["next_action"]
			return (s, raw_data, next_action)



def get_action(step_params, s = None, result_data = None):
	
	if s:
		urls_in_result = step_params.get('urls_in_result', None)
		
		if urls_in_result:
			url_dict = result_data[step_params["url_key"]]
			result = {}
			
			for url, key in url_dict.iteritems():
				base_url = step_params.get("base_url", '')
				url = base_url + url

				print "Requesting: ", url 
				
				r = s.get(url)
				response_text = r.text.encode('utf-8')
				result[key] = response_text

			return result
		else:
			r = s.get(step_params["url"])
			response_text = r.text.encode('utf-8')
			
		return response_text
	else:
		return False



def parse_action(parse_params, s=None, result_data = None):
	
	search_re_list = parse_params["search_re_list"]

	if type(result_data) == type({}):
		results = {}
		for key, raw_data in result_data.iteritems():
			re_params = 

			associate_with_key = re_params.get("associate_with_key", None)

			operation = re_params["operation"]
			current_results = {}

			if operation == "iterate":
				for m in re.finditer(re_params["exp"], result_data[key]):
					match_groups = m.groups()

					for match_key, match_value in pairwise(match_groups):
		 				current_results[match_key] = match_value

			if associate_with_key:
				results[key] = current_results

	else:
		results = {}

		for re_params in search_re_list:
			operation = re_params["operation"]
			#match_descriptors = re_params["match_descriptors"]

			current_results = {}

			if operation == "iterate":
				for m in re.finditer(re_params["exp"], result_data):
					match_groups = m.groups()

					if len(match_groups) < 2:
						current_results[re_params["id"]] = m.group(1)

					else:
						for key, value in pairwise(match_groups):
		 					current_results[key] = value

			elif operation == "search":
				m = re.search(re_params["exp"], result_data)
				match_groups = m.groups()
				if len(match_groups) < 2:
					current_results[re_params["id"]] = m.group(1)

				else:
					for key, value in pairwise(match_groups):
	 					current_results[key] = value


			
			results[re_params["id"]] = current_results
	
	return results





def create_session(session_params):

	s = requests.Session()

	if session_params["requires_token"]:
		token_url = session_params["token_url"]
		token_re = re.compile(session_params['token_re'])

		r = s.get(token_url)
		token_matches = re.search(token_re, r.text)

		if token_matches:
			token = token_matches.group(1)
		
		login_payload = {
			session_params["username"][0]: session_params["username"][1],
			session_params["password"][0]: session_params["password"][1],
			session_params["token_name"]: token
		}

	else:
		login_payload = {
			session_params["username"][0]: session_params["username"][1],
			session_params["password"][0]: session_params["password"][1],
		}

	#encoded_payload = urllib.urlencode(login_payload)

	login_url = session_params["login_url"]
	login_method = session_params["login_method"]
	

	if login_method == "post":
		r = s.post(login_url, data = login_payload)
		if r.status_code == 200:
			return s
			
		else:
			print r.status_code
			return None
		

	elif login_method == "get":
		r = s.get(login_url, data = login_payload)
		
		if r.status_code == 200:
			return s
		else:
			return None


	return None



def pairwise(iterable):
    "s -> (s0, s1), (s2, s3), (s4, s5), ..."
    a = iter(iterable)
    return izip(a, a)