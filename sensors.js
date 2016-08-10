"use strict"

var
  temper= require( "temper1")

var
  sensors= [],
  deviceUpdateHandle,
  deviceUpdateDefaultInterval = 15*60*1000 // 15 minutes

/**
  Read all `sensors`.
*/
function read(){
	var readings= sensors.map(_run)
	return Promise.all(readings)
}

/**
  A `read` that also initializes & sets up device updating.
*/
function main(){
	if( sensors.length == 0){
		module.exports.refreshDevices()
	}
	module.exports.setupDeviceUpdate()
	return module.exports.read()
}

/**
  Update list of sensors. `sensors` becomes an array of promise generating functions.
*/
function refreshDevices(){
	sensors= temper.getDevices().map( _temperPromise)
	return sensors
}

/**
  Create a singleton interval that refreshes devices.
*/
function setupDeviceUpdate(){
	var deviceUpdate= module.exports.deviceUpdate
	if( deviceUpdate&& !module.exports.deviceUpdateHandle){
		if( isNaN(deviceUpdate)){
			deviceUpdate= deviceUpdateDefaultInterval
		}
		module.exports.deviceUpdateHandle= setInterval(refreshDevices, deviceUpdate)
	}
}

function _run( fn){
	return fn()
}

/**
  For a given `device`, produce a function returning a temperature promise.
*/
function _temperPromise( devicePath){
	// return a function
	return function(){
		// producing a promise
		return new Promise(function( res, rej){
			// of the `device` temperature
			temper.readTemperature( devicePath, function( err, temp){
				if( err){
					rej( err)
				}else{
					res({ temp: temp, path: devicePath})
				}
			})
		})
	}
}

module.exports= main
module.exports.read= read
module.exports.refreshDevices= refreshDevices
module.exports.setupDeviceUpdate= setupDeviceUpdate

module.exports.deviceUpdate= true
module.exports.deviceUpdateHandle= null
