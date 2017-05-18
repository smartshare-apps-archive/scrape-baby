import json, time, markdown, requests, re

from flask import Blueprint, render_template, abort, current_app, session, request, Markup, redirect, url_for


request_endpoints = Blueprint('request_endpoints', __name__, template_folder='templates')		#blueprint definition



@request_endpoints.route('/init_scrape', methods=["POST"])
def scrape():
	scrape_params = request.form['scrape_params']
	scrape_params = json.loads(scrape_params)

	init_scrape(scrape_params["params"])

	return json.dumps(scrape_params)


def init_scrape(scrape_params):

	init_params = scrape_params.get('init', None)
	if init_params:
		s = None

		if(init_params["requires_session"]):
			s = create_session(init_params["session_params"])

		raw_data = get_action(init_params, s = s)


def get_action(step_params, s = None):
	if s:
		raw_data = s.get(step_params["url"])
		print raw_data.text
		



def parse_action(parse_params):
	pass


def create_session(session_params):

	s = requests.Session()

	if session_params["requires_token"]:
		token_url = session_params["token_url"]
		token_re = re.compile(session_params['token_re'])

		r = requests.get(token_url)
		token_matches = re.search(token_re, r.text)

		if token_matches:
			token = token_matches.group(1)
		
		login_payload = {
			session_params["username"][0]: session_params["username"][1],
			session_params["password"][0]: session_params["password"][1],
			session_params["token_name"]: token
		}

		print login_payload

		login_url = session_params["login_url"]
		login_method = session_params["login_method"]

		

		if login_method == "post":
			s.post(login_url, data = login_payload)

	return s



