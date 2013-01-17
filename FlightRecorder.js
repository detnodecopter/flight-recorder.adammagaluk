var fs = require('fs');

var FlightRecorder = function(options){
	this.startTime = 0;
	this.endTime = 0;
	this.flightData = [];
}

FlightRecorder.prototype.start = function() {
	this.startTime = new Date();
	console.log("Started at " + this.startTime);
};

FlightRecorder.prototype.end = function() {
	
	if(this.startTime == 0)
		return;

	this.endTime = new Date();
	var self = this;
	console.log("Ended at " + this.endTime);
	var stream = fs.createWriteStream("flight-"+self.startTime.getTime()+".json");
    stream.once('open', function(fd) {
    	var data = JSON.stringify({startTime : self.startTime.getTime(),data : self.flightData});
        stream.write(data);
    });
};

FlightRecorder.prototype.add = function(func,val) {
	if(this.startTime != 0){
		var deltaT = new Date() - this.startTime;
		this.flightData.push({deltaT : deltaT, func : func, val : val});
	}
};


module.exports = FlightRecorder;