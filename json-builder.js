var JSONPath = require('jsonpath-plus');
var moment = require('moment');

var public = {};

function getParameter(path, object){
	return JSONPath({wrap: false}, path, object);
}
function getParameters(path, object){
	return JSONPath({wrap: true}, path, object);
}


public.getResponse = function (results, service){
	var response = {results: []};
	var mapping = service.response_jsonmapping;
	var options = getParameters(mapping.base, results);

	//Loop through result set
	options.forEach(function(option){
		var trips = [];
		response.results.push({
			total_price : getParameter(mapping.total_price, option)
			, departure_time : getParameter(mapping.departure_time, option)
			//Return arrival time will not be returned if one way
			, return_arrival_time : getParameter(mapping.return_arrival_time, option) 
			, trips : trips
		});

		//Get trips, 2 trips for a round trip request, 1 otherwise
		var tripsMapping = mapping.trips;
		var optionTrips = getParameters(tripsMapping.base, option);
		optionTrips.forEach(function(trip){

			var flights = [];

			trips.push({
				total_duration : getParameter(tripsMapping.total_duration, trip)
				, departure_time : getParameter(tripsMapping.departure_time, trip)
				, arrival_time : getParameter(tripsMapping.arrival_time, trip)
				, flights : flights
			});

			//Get flights within the trip
			var flightMapping = mapping.trips.flights;
			flightOptions = getParameters(flightMapping.base, trip);
			flightOptions.forEach(function(flight){
				flights.push({
					duration : getParameter(flightMapping.duration, flight)
					, carrier : getParameter(flightMapping.carrier, flight)
					, flight_number : getParameter(flightMapping.flight_number, flight)
					, connection_time : getParameter(flightMapping.connection_time, flight)
					, departure_time : getParameter(flightMapping.departure_time, flight)
					, arrival_time : getParameter(flightMapping.arrival_time, flight)
					, origin_airport : getParameter(flightMapping.origin_airport, flight)
					, destination_airport : getParameter(flightMapping.destination_airport, flight)
				})
			});
		});
	});

	return response;
}


public.getServiceRequest = function (request, service)
{
	var mapping = service.request_jsonmapping;
	//Safely clone mapping
	var serviceRequest = JSON.parse(JSON.stringify(service.request_jsonmapping));

	buildObject(serviceRequest);

	function buildObject(inputObj){
		var properties = Object.keys(inputObj);


		properties.forEach(function(property){
			
			if(typeof inputObj[property] == "string" && inputObj[property].indexOf("$.") > -1){
				var mapPath = inputObj[property];
				var propertyValue = null;

				if(mapPath.indexOf("-INT") > -1){
					mapPath = mapPath.split('-')[0];
					propertyValue = parseInt(getParameter(mapPath, request));
				}
				else if(mapPath.indexOf("+") > -1){
					var mapPaths = mapPath.split('+');
					propertyValue = "";
					mapPaths.forEach(function(path){
						propertyValue += getParameter(path, request);
					});
				}
				else if(mapPath.indexOf("-DATE:") > -1){
					var mapPaths = mapPath.split("-DATE:");
					propertyValue = moment(getParameter(mapPaths[0], request),"YYYY-MM-DD HH:mm:ss").format(mapPaths[1]);
				}
				else {
					propertyValue = getParameter(mapPath, request)
				}


				inputObj[property] = propertyValue;
				
			}
			else if(typeof inputObj[property] == "string" && inputObj[property] == "#api_key"){
				inputObj[property] = service.api_key;
			}
			else if(typeof inputObj[property] == "object"){
				if(inputObj[property]._OPTIONALARRAYOBJECT != undefined && getParameter(inputObj[property]._OPTIONALARRAYOBJECT,request) == undefined){
					var index = inputObj.indexOf(inputObj[property]);
					if (index > -1) {
					    inputObj.splice(index, 1);
					}
				}
				else{
					if(inputObj[property]._OPTIONALARRAYOBJECT != undefined){
						delete inputObj[property]._OPTIONALARRAYOBJECT;
					}
					buildObject(inputObj[property]);
				}
			}
		});
	}
	return serviceRequest;
}

module.exports = public;