# Koa-QPX
Google QPX API consumer written in Koa. It queries the API with flight parameters and returns up to 20 results.

# Requirements

A modern NodeJS installation is required for the Koa Library.

# Installation

npm install

# Configuration

the file service_config.json must be modified to use include a valid Google API Server Key. Replace XYZ1234 with your key for url string:
"https://www.googleapis.com/qpxExpress/v1/trips/search?key=XYZ1234"

# Running

node app.js

gulp server

or

gulp

*Gulp will require global install
# Usage

This library takes in GET query parameters, queries the API and returns a JSON object. This application uses JSONPath as a templating engine to define the request and response readers to consume a service.

## Input
* start_date
* return_date
* adult_passengers
* origin,
* destination
* max_stops
* max_price
* max_price_currency

Dates are strictly enforced using format YYYY-MM-DD HH:MM:SS. Formatting and data errors will result in an invalid input error.

## Output
```json
{
	"results": [
		{
			"total_price" : "string"
			, "departure_time" : "string"
			, "return_arrival_time" : "string"
			, "trips" : [
				{
					"total_duration" : "int"
					, "departure_time" : "string"
					, "arrival_time" : "string"
					, "total_connection_time" : "int"
					, "flights" : [
						{
							"duration" : "int"
							,"carrier" : "string"
							,"number" : "string"
							,"departure_time" : "string"
							,"arrival_time" : "string"
							, "origin_airport" : "string"
							, "destination_airport" : "string"
						}
					]
				}
			]
		}
	]
}
```

## Configuration of New Services

New services can be supported by adding to the file service_config.json

The service config file can be extended to include other services that are somewhat similarly organized like the Google QPX Express API. It's assumed the segments and flights are appropriately nested. Custom tags are used to help format data appropriately, for instance -DATE: allows to format input dates (strictly enforced YYYY-MM-DD HH:MM:SS), and reformats it to be compatible with Google QPX format (YYYY-MM-DD). The response uses JSONPath to map the response, while the request is a JSON object that mimics the request format that maps to the API input format.

A new object in the array, under services, will allow the application to randomly distribute the api query load between defined services.

For radically different API formats, a different JSON reader can be build similar to json-builder.js
