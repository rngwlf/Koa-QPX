var koa = require('koa')
	, serve = require('koa-static')
	, route = require('koa-route')
	, request = require('co-request')
	, moment = require('moment')
	, currencies = require('country-data').currencies
	, fs = require('fs');

var app = koa();

var jsonBuilder = {};
var serviceConfig = JSON.parse(fs.readFileSync('service_config.json','utf8'));
//Object containing potential JSON builders for 3rd party APIs
jsonBuilder['JSONPath-Template'] = require('./json-builder');

// DELETE
app.use(serve('sampledata/'));

app.use(route.get('/flights',flights));

//Randomly choose service from service_config to spreadout API calls
function getService(){
	function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min)) + min;
	}
	var servicesCount = serviceConfig.services.length;
	return serviceConfig.services[getRandomInt(0,servicesCount)];
}

function *flights(){
	if(validParameters(this.query)){
		var service = getService();
		var searchParameters = jsonBuilder[service.type].getServiceRequest(this.query, service);
		var serviceResponse = yield request({
						uri: service.url
						,method: "POST"
						, body : searchParameters
						, json: true});

		var results = serviceResponse.body;
		if(results.error == undefined){
			this.body = jsonBuilder[service.type].getResponse(results, service);
		}
		else{
			this.body = serviceResponse.body;
		}

	}
	else{
		this.body = {error: "invalid input"};
	}
	
}



function validParameters(parameters){
	var isValid = true;

	if(parameters.start_date == undefined ||
		parameters.adult_passengers == undefined ||
		parameters.origin == undefined ||
		parameters.destination == undefined ||
		parameters.max_stops == undefined ||
		parameters.max_price == undefined ||
		parameters.max_price_currency == undefined){

		isValid = false;
		console.log("missing parameter");
	}
	else{
		if(isNaN(parameters.adult_passengers)|| parseInt(parameters.adult_passengers) <= 0){
			isValid = false;
		}
		else if(isNaN(parameters.max_stops) || parseInt(parameters.max_stops) < 0){
			isValid = false;
		}
		else if(typeof parameters.origin != "string" || typeof parameters.destination != "string"){
			isValid = false;
		}
		else if(typeof parameters.max_price_currency != "string" || currencies[parameters.max_price_currency] == undefined){
			isValid = false;
		}
		else if(isNaN(parameters.max_price) || parseInt(parameters.max_price) <= 0){
			isValid = false;
		}
		else{
			parameters.adult_passengers = parseInt(parameters.adult_passengers);
			parameters.max_stops = parseInt(parameters.max_stops);
			parameters.max_price = parseInt(parameters.max_price);
		}


	}


	if(parameters.start_date != undefined && 
	   !moment(parameters.start_date, "YYYY-MM-DD HH:mm:ss",true).isValid()){
		isValid = false;
		console.log(parameters.start_date);
		console.log("start date error");
	}

	if(parameters.return_date != undefined && 
	   !moment(parameters.return_date, "YYYY-MM-DD HH:mm:ss", true).isValid()){
		isValid = false;
		console.log("return date error");
	}

	return isValid;
}


app.listen(3000);
