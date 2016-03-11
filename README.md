# Koa-QPX
Google QPX API consumer written in Koa. It queries the API with flight parameters and returns up to 20 results.

# Requirements

A modern NodeJS installation is required for the Koajs Library.

# Installation

npm install

# Running

gulp server
or
gulp

# Usage
This library takes in GET query parameters, queries the API and returns a JSON object.

## Configuration

the file service_config.json must be modified to use include a valid Google API Server Key. Replace XYZ1234 with your key for url string:
"https://www.googleapis.com/qpxExpress/v1/trips/search?key=XYZ1234"

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
