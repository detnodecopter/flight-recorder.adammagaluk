#!/usr/bin/env node

/**
 * Module dependencies.
 */
var SDL = require('sdl');
var arDrone = require('ar-drone');
var program = require('commander');
var debug = require('debug')('drone-joystick');

var FlightRecorder = require('./FlightRecorder');
var recorder = new FlightRecorder();

/**
 * Setup command-line options.
 */
program
  .version(require('./package').version)
  .option('-i, --ip [val]', 'drone IP address or hostname to connect to (default: "192.168.1.1")', '192.168.1.1')
  .option('-c, --controls [mode]', 'controller configuration to use (default: "ps3")', 'ps3')
  .option('-p, --playback [file]', 'run in playback mode')
  .parse(process.argv);

/**
 * Attempt to load the requested config.
 */

var config = require('./config/' + program.controls);
console.log('Loaded %j config', program.controls);

/**
 * Create client connection to the AR.Drone.
 */

var client  = arDrone.createClient({ ip: program.ip });
console.log('Connecting to drone at %j', program.ip);

/**
 * Init SDL.
 * XXX: Meh, a VIDEO screen needs to be initialized in order for JOYSTICK events
 *      to come through... it would be nice if there was a way around this...
 */

SDL.init(SDL.INIT.VIDEO | SDL.INIT.JOYSTICK);
process.on('exit', function () { SDL.quit(); });

var screen = SDL.setVideoMode(320, 200, 0, 0);

var joys = [];
for (var i = 0, l = SDL.numJoysticks(); i < l; i++) {
  joys[i] = SDL.joystickOpen(i);
  debug('joystick ' + i + ': ' + SDL.joystickName( i ));
}
debug(joys);

// range of the "axis" events (+/-)
var range = Math.pow(2, 16) / 2;


if(program.playback != undefined){
  var FlightPlayback = require('./FlightPlayback');
  var playback = new FlightPlayback({
    file : program.playback
  });

  playback.run(function(func,val){
    client[func](val);
  }) 

}

SDL.events.on('event', function (event) {
  var data;
  var func;
  switch (event.type) {
    case 'JOYAXISMOTION':
      event.float = event.value / range;
      data = config.axis[event.axis];
      if (!data) return;
      
      // Only send controller axis events during recording
      if(program.playback == undefined){
        debug(event, data);
        func = data[event.float > 0 ? 1 : 0];
        client[func](Math.abs(event.float));
        recorder.add(func,Math.abs(event.float));
      }

      break;
    case 'JOYBUTTONDOWN':
      data = config.buttons[event.button];
      if (!data) return;
      func = data[0];

      if(program.playback == undefined) {
        if(event.button == 12){
          recorder.start();
          recorder.add(func);
        }else if(event.button == 14){
          recorder.add(func);
          recorder.end();
        }
      }

      debug(event, data);
      client[func]();
      break;
    case 'JOYBUTTONUP':
      // don't need to do anything...
      break;
  }
});
SDL.events.on('QUIT', function () { process.exit(0); }); // Window close
SDL.events.on('KEYDOWN', function (evt) {
  if (evt.sym === 99 && evt.mod === 64){process.exit(0); } // Control+C
  if (evt.sym === 27 && evt.mod === 0){ process.exit(0); }  // ESC
});
