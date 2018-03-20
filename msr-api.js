var allMsrEvents = {};

function populateEvents() {
	$.ajax('https://api.motorsportreg.com/rest/calendars/organization/2090ED02-A19B-3A7B-C58CBD1982CDCC4E.json', {
		async: true,
		cache: false,
		dataType: 'json',
	}).done(
		function(json){
			allMsrEvents = json.response;
		}
	);
}

function populateRegistered(idOfHtmlField, msrEventGUID) {
	$.ajax('https://api.motorsportreg.com/rest/events/' + msrEventGUID + '/entrylist.json', {
		async: true,
		cache: false,
		dataType: 'json',
	}).done(
		function(json){
			$('#' + idOfHtmlField).html('Registration [' + json.response.recordset.total + ' registered]');
		}
	);
}

function populateRegisteredUsingJSONP(idOfHtmlField, msrEventGUID) {
	$.ajax('https://api.motorsportreg.com/rest/events/' + msrEventGUID + '/entrylist.jsonp', {
		async: true,
		cache: false,
		dataType: 'jsonp',
		jsonp: 'jsoncallback',
	}).done(
		function(json){
			$('#' + idOfHtmlField).html('Registration [' + json.response.recordset.total + ' registered]');
		}
	);
}
