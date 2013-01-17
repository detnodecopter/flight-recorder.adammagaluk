var fs = require('fs');

var FlightPlayback = function(options){
	this.data = [];
	this.startTime = 0;
	this.file = options.file;
	this.speedModifier = 1;

	this.lastDelta = 0;

	this.index = 0;

	if(this.file == undefined){
		throw new Error("options file not defined");
	}

	var _data = require('./'+this.file);
	if(_data.startTime != undefined){
		this.startTime = _data.startTime;
	}

	if(_data.data == undefined){
		throw new Error("No data found");
	}
	this.data = _data.data;
}

FlightPlayback.prototype.run = function(callback) {
	this.runNext(callback);
};

FlightPlayback.prototype.runNext = function(callback) {
	var point = this.data[this.index];

	if(point == undefined){
		return;
	}

	var self = this;
	setTimeout(function(){
		callback(point.func,point.val);
		self.index++
		self.lastDelta = point.deltaT;
		self.runNext(callback);
	},(point.deltaT-self.lastDelta)*self.speedModifier ) 
}




module.exports = FlightPlayback;