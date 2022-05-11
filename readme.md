# Kukesi Engine 
A Multi Purpose Engine That I Use For My Game And Animating My Web Sites. It Help's Save A Lot Of Time Setting Up App Or Web Logic Everytime I Start A New Project.

# Custom Sound Effects Configurations
The `soundEffect` Function Generate Custom Sounds And Musical Notes From Scratch (Reverb Effect Requires The `impulseResponse` Function That Is Further Ahead). Here's A Model That Illustrates How To Use Along With Description Of The Parameters.

# Parameters Detailed Information
soundEffect(
* frequencyValue,     ` The Sound's Frequency Pitch In Hertz`
*   attack,           ` The Time, In Seconds, To Fade The Sound In`
*    decay,           ` The Time, In Seconds, To fade the sound out`
*    type,            ` Waveform Type: "sine", "triangle", "square", "sawtooth"`
*    volumeValue,     ` The Sound's Maximum Volume`
*    panValue,        ` The Speaker Pan. left: -1, middle: 0, right: 1`
*    wait,            ` The Time, In Seconds, To Wait Before Playing the Sound`
*    pitchBendAmount, ` The Number Of Hz In Which To Bend The Sound's Pitch down`
*    reverse,         ` If `reverse` Is `true` The Pitch Will Bend Up`
*    randomValue,     ` A Aange, In Hz, Within Which To Randomize The Pitch`
*    dissonance,      ` A value In Hz. Creates 2 Additional Dissonant Frequencies` 
*    echo,            ` An Array: [delayTime, feedbackTime, filterValue]`
*    reverb           ` An Array: [duration, decayRate, reverse?]`
);

#  Create A Laser Shooting Sound Example:
soundEffect(
*    1046.5,           ` Frequency`
*    0,                ` Attack`
*    0.3,              ` Decay`
*    "sawtooth",       ` Waveform`
*    1,                ` Volume`
*    -0.8,             ` Pan`
*    0,                ` Wait Before Playing`
*    1200,             ` Pitch Bend Amount`
*    false,            ` Reverse Bend`
*    0,                ` Random Pitch Range`
*    25,               ` Dissonance`
*    [0.2, 0.2, 2000], ` Echo: [delay, feedback, filter]`
*    undefined         ` Reverb: [duration, decay, reverse?]`
);