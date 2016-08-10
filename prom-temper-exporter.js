#!/usr/bin/env node
"use strict"

var
  sensors= require( "./sensors"),
  memoizee= require( "memoizee"),
  metrics= require( "prom-pb-client"),
  server= require( "prom-pb-client/server")

var family= new metrics.MetricFamily( "temper_temp_c", "temperature sensor degress celsius", metrics.MetricType.GAUGE, [])

var temperMetric= memoizee( function( path){
	return new metrics.Metric(new metrics.LabelPair( "path", path), new metrics.Gauge( 0), null, null, null, null, null)
}, {
  maxAge: 1000,
  primitive: true
})

function factory(){
	var now= Date.now()
	return sensors().then(function( sensors){
		var metrics= sensors.map(function( sensor){
			var metric= temperMetric( sensor.path)
			metric.gauge.value= sensor.temp
			metric.timestamp_ms= now
			return metric
		})
		family.metric= metrics
		return family
	})
}

function main(){
	var opts= server({ factory: factory})
	console.log("server running on port "+ opts.port)
}

module.exports= factory
module.exports.factory= factory
module.exports.main= main

if( require.main=== module){
	module.exports.main()
}
