drone-flight-recorder
===================

Control your Parrot AR.Drone with a Playstation 3 controller using Nathan Rajlich's ps3/drone code and record all control commands sent to the drone. When done playback that flight again and again.

Nathan's Repository
https://github.com/TooTallNate/node-drone-joystick

Recording
===================

node drone-joystick.js

Takeoff by pressing Triangle by default on the controller, that starts the recording processs.
Land by pressing X, after pressing X the flight is dumped to a file in the same directory named "flight-TIMESTAMP.json"

Playback
===================

Set your drone in the same starting position, then run: 

node drone-joystick.js -p <file.json>

The drone should automaticly start taking off and flying.

Note: The joysticks on the controller are disabled during playback, however the land/takeoff butttons will work for those emergancy situations.

Have fun!
