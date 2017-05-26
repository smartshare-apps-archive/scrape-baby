import json, time, markdown, requests, re

from itertools import izip

from flask import Blueprint, render_template, abort, current_app, session, request, Markup, redirect, url_for


request_endpoints = Blueprint('request_endpoints', __name__, template_folder='templates')		#blueprint definition



@request_endpoints.route('/init_scrape', methods=["POST"])
def scrape():
	scrape_params = request.form['scrape_params']
	scrape_params = json.loads(scrape_params)["params"]

	print "Scape params: ", scrape_params

	session, current_result, next_action = init_scrape(scrape_params)
	

	while(next_action):
		current_params = scrape_params.get(next_action, None)

		if current_params:
			action_type = current_params.get('type', None)

			if action_type:
				if action_type == "parse":
					print "Performing parse action..."
					previous_result = current_result
					current_result = parse_action(current_params, s=session, result_data=previous_result)
				elif action_type == "get":
					print "Performing request action..."
					previous_result = current_result
					current_result = get_action(current_params, s=session, result_data=previous_result)

			#print "Current action params: ", current_params
		
		next_action = current_params.get("next-action", None)

	print "Final results:", current_result
	print current_result
	return json.dumps(current_result)




def init_scrape(scrape_params):
	init_params = scrape_params.get('init', None)

	if init_params:
		s = None

		#if these scrapes require authentication, set up an authenticated session object 
		if(init_params["requires-session"] == "true"):
			s = create_session(init_params)
		else:
			s = requests.Session()

		if s:
			raw_data = get_action(init_params, s = s)
			next_action = init_params["next-action"]
			return (s, raw_data, next_action)




def get_action(step_params, s = None, result_data = None):
	print "step params: ", step_params

	if s:
		urls_in_result = step_params.get('urls-in-result', None)
		base_url = step_params.get('base-url','')
		
		if urls_in_result == "yes":
			url_dict = result_data[step_params["url-key"]]
			result = {}
			
			for url, key in url_dict.iteritems():

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
	print "Parse params: ", parse_params

	if type(result_data) == type({}):
		results = {}
		#print "RESULT DATA: ", result_data
		for key, raw_data in result_data.iteritems():
			#print "Current key: ", key
			operation = parse_params["regex-operation"]
			current_results = {}

			if operation == "iterate":
				for m in re.finditer(parse_params["regex"], result_data[key]):
					match_groups = m.groups()

					#print "Match groups: ", match_groups
					for match_key, match_value in pairwise(match_groups):
		 				current_results[match_key] = match_value

			
			results[key] = current_results

	else:
		results = {}

		operation = parse_params["regex-operation"]
		#match_descriptors = re_params["match_descriptors"]

		current_results = {}

		if operation == "iterate":
			for m in re.finditer(parse_params["regex"], result_data):
				match_groups = m.groups()
				print "Match groups:", match_groups
				if len(match_groups) < 2:
					current_results[parse_params["result-key"]] = m.group(1)

				else:
					for key, value in pairwise(match_groups):
	 					current_results[key] = value

		elif operation == "search":
			m = re.search(parse_params["regex"], result_data)
			match_groups = m.groups()
			if len(match_groups) < 2:
				current_results[parse_params["result-key"]] = m.group(1)

			else:
				for key, value in pairwise(match_groups):
 					current_results[key] = value


			
		results[parse_params["result-key"]] = current_results
	
	#print results
	return results





def create_session(session_params):
	#print "Creating a session with: ", session_params
	s = requests.Session()

	if session_params["session-login-requires-token"] == "true":
		token_url = session_params["session-login-token-url"]
		token_re = re.compile(session_params['session-login-token-regex'])

		r = s.get(token_url)
		token_matches = re.search(token_re, r.text)

		if token_matches:
			token = token_matches.group(1)
			#print "Got token: ", token
		
		login_payload = {
			session_params["session-login-username-id"]: session_params["session-login-username"],
			session_params["session-login-password-id"]: session_params["session-login-password"],
			session_params["session-login-token-name"]: token
		}

	else:
		login_payload = {
			session_params["session-login-username-id"]: session_params["session-login-username"],
			session_params["session-login-password-id"]: session_params["session-login-password"],
		}

	#encoded_payload = urllib.urlencode(login_payload)

	login_url = session_params["session-login-url"]
	login_method = session_params["session-login-method"]
	

	if login_method == "POST":
		r = s.post(login_url, data = login_payload)
		if r.status_code == 200:
			return s
			
		else:
			#print r.status_code
			return None
		

	elif login_method == "GET":
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