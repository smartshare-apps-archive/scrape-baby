import json, time, markdown, requests, re

from flask import Blueprint, render_template, abort, current_app, session, request, Markup, redirect, url_for


request_endpoints = Blueprint('request_endpoints', __name__, template_folder='templates')		#blueprint definition



@request_endpoints.route('/init_scrape', methods=["POST"])
def scrape():
	scrape_params = request.form['scrape_params']
	scrape_params = json.loads(scrape_params)["params"]

	session, result, next_action = init_scrape(scrape_params)
	

	while(next_action):
		current_params = scrape_params.get(next_action, None)

		if current_params:
			action_type = current_params.get('type', None)

			if action_type:
				if action_type == "parse":
					print "Performing parse action..."
					result = parse_action(current_params, session)
				elif action_type == "raw":
					print "Performing request action..."
					result = get_action(current_params, session)

			print "Current action params: ", current_params
		
		next_action = current_params.get("next_action", None)

	return json.dumps(scrape_params)




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



def get_action(step_params, s = None):
	if s:
		r = s.get(step_params["url"])
		response_text = r.text.encode('utf-8')
		return response_text
	else:
		return False



def parse_action(parse_params, s = None):
	pass


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
	print login_payload

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



