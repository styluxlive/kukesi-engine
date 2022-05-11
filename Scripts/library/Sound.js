let actx = new AudioContext();
//The sound object
class Sound {
  constructor(source, loadHandler) {
    this.source = source;
    this.loadHandler = loadHandler;
    this.actx = actx;
    this.volumeNode = this.actx.createGain();
    this.panNode = this.actx.createStereoPanner();
    this.convolverNode = this.actx.createConvolver();
    this.delayNode = this.actx.createDelay();
    this.feedbackNode = this.actx.createGain();
    this.filterNode = this.actx.createBiquadFilter();
    //this.panNode.panningModel = "equalpower";
    this.soundNode = null;
    this.buffer = null;
    this.loop = false;
    this.playing = false;
    //Values For Pan And Volume Getters/Setters
    this.panValue = 0;
    this.volumeValue = 1;
    //Values To Track And Set Start And Pause Times
    this.startTime = 0;
    this.startOffset = 0;
    //The Playback Rate
    this.playbackRate = 1;
    this.randomPitch = true;
    //Reverb Parameters
    this.reverb = false;
    this.reverbImpulse = null;
    //Echo Parameters
    this.echo = false;
    this.delayValue = 0.3;
    this.feebackValue = 0.3;
    this.filterValue = 0;
    //Load The Sound
    this.load();   
  }
  load() {
    //Use xhr To Load The Sound File
    let xhr = new XMLHttpRequest();
    xhr.open("GET", this.source, true);
    xhr.responseType = "arraybuffer";
    xhr.addEventListener("load", () => {
      //Decode Sound And Store Reference To The Buffer 
      this.actx.decodeAudioData(
        xhr.response, 
        buffer => {
          this.buffer = buffer;
          this.hasLoaded = true;
          if (this.loadHandler) {
            this.loadHandler();
          }
        }, 
        error => {
          throw new Error("Audio Could Not Be Decoded: " + error);
        }
      );
    });
    //Send The Request To Load The File
    xhr.send();
  }
  play() {
    this.startTime = this.actx.currentTime;
    this.soundNode = this.actx.createBufferSource();
    this.soundNode.buffer = this.buffer;
    this.soundNode.connect(this.volumeNode);
    if (this.reverb === false) {
      this.volumeNode.connect(this.panNode);
    } 
    else {
      this.volumeNode.connect(this.convolverNode);
      this.convolverNode.connect(this.panNode);
      this.convolverNode.buffer = this.reverbImpulse;
    }
    this.panNode.connect(this.actx.destination);
    if (this.echo) {
      this.feedbackNode.gain.value = this.feebackValue;
      this.delayNode.delayTime.value = this.delayValue;
      this.filterNode.frequency.value = this.filterValue;
      this.delayNode.connect(this.feedbackNode);
      if (this.filterValue > 0) {
        this.feedbackNode.connect(this.filterNode);
        this.filterNode.connect(this.delayNode);
      } else {
        this.feedbackNode.connect(this.delayNode);
      }
      this.volumeNode.connect(this.delayNode);
      this.delayNode.connect(this.panNode);
    }
    this.soundNode.loop = this.loop;
    this.soundNode.playbackRate.value = this.playbackRate;
    this.soundNode.start(
      this.startTime, 
      this.startOffset % this.buffer.duration
    );
    this.playing = true;
  }
  setReverb(duration = 2, decay = 2, reverse = false) {
    this.reverbImpulse = impulseResponse(duration, decay, reverse);
    this.reverb = true;
  }
  setEcho(delayValue = 0.3, feedbackValue = 0.3, filterValue = 0) {
    this.delayValue = delayValue;
    this.feebackValue = feedbackValue;
    this.filterValue = filterValue;
    this.echo = true;
  }
  pause() {
    if (this.playing) {
      this.soundNode.stop(this.actx.currentTime);
      this.startOffset += this.actx.currentTime - this.startTime;
      this.playing = false;
    }
  }
  restart() {
    if (this.playing) {
      this.soundNode.stop(this.actx.currentTime);
    }
    this.startOffset = 0;
    this.startPoint = 0;
    this.endPoint = this.buffer.duration;
    this.play();
  }
  playFrom(value) {
    if (this.playing) {
      this.soundNode.stop(this.actx.currentTime);
    }
    this.startOffset = value;
    this.play();
  }
  playSection(start, end) {
    if (this.playing) {
      this.soundNode.stop(this.actx.currentTime);
    }
    if (this.startOffset === 0) this.startOffset = start;
    this.startTime = this.actx.currentTime;
    this.soundNode = this.actx.createBufferSource();
    this.soundNode.buffer = this.buffer;
    this.soundNode.connect(this.panNode);
    this.panNode.connect(this.volumeNode);
    this.volumeNode.connect(this.actx.destination);
    this.soundNode.loop = this.loop;
    this.soundNode.loopStart = start;
    this.soundNode.loopEnd = end;
    let duration = end - start;
    this.soundNode.start(
      this.startTime, 
      this.startOffset % this.buffer.duration,
      duration
    );
    this.playing = true;
  }
  get volume() {
    return this.volumeValue;
  }
  set volume(value) {
    this.volumeNode.gain.value = value;
    this.volumeValue = value;
  }
  get pan() {
    return this.panNode.pan.value;
  }
  set pan(value) {
    this.panNode.pan.value = value;
  }
}
//High Level Wrapper For Creating Sound
export function makeSound(source, loadHandler) {
  return new Sound(source, loadHandler);  
}
//The Sound Effect Object
export function soundEffect(
  frequencyValue, 
  attack = 0,
  decay = 1, 
  type = "sine", 
  volumeValue = 1,
  panValue = 0,
  wait = 0,
  pitchBendAmount = 0,
  reverse = false,
  randomValue = 0,
  dissonance = 0,
  echo = undefined,
  reverb = undefined ) {
      let oscillator = actx.createOscillator(),
          volume = actx.createGain(),
          pan = actx.createStereoPanner();
      oscillator.connect(volume);
      volume.connect(pan);
      pan.connect(actx.destination);
      volume.gain.value = volumeValue;
      pan.pan.value = panValue;
      oscillator.type = type;
      let frequency;
      let randomInt = (min, max) => {
          return Math.floor(Math.random() * (max - min+ 1)) + min;
      }
  if (randomValue > 0) {
    frequency = randomInt( frequencyValue - randomValue / 2, frequencyValue + randomValue / 2);
  } else {
    frequency = frequencyValue;
  }
  oscillator.frequency.value = frequency;
  if (attack > 0) fadeIn(volume);
  if (decay > 0) fadeOut(volume);
  if (pitchBendAmount > 0) pitchBend(oscillator);
  if (echo) addEcho(volume);
  if (reverb) addReverb(volume);  
  if (dissonance > 0) addDissonance();
  play(oscillator);
  //The helper functions:
  //Reverb
  function addReverb(volumeNode) {
    let convolver = actx.createConvolver();
    convolver.buffer = impulseResponse(reverb[0], reverb[1], reverb[2]);
    volumeNode.connect(convolver);
    convolver.connect(pan);
  }  
  //Echo
  function addEcho(volumeNode) {
    let feedback = actx.createGain(),
        delay = actx.createDelay(),
        filter = actx.createBiquadFilter();
    delay.delayTime.value = echo[0];
    feedback.gain.value = echo[1];
    if (echo[2]) filter.frequency.value = echo[2];
    delay.connect(feedback);
    if (echo[2]) {
      feedback.connect(filter);
      filter.connect(delay);
    } else {
      feedback.connect(delay);
    }
    volumeNode.connect(delay);
    delay.connect(pan);
  }
  function fadeIn(volumeNode) {
    volumeNode.gain.value = 0;
    volumeNode.gain.linearRampToValueAtTime(
      0, actx.currentTime + wait
    );
    volumeNode.gain.linearRampToValueAtTime(
      volumeValue, actx.currentTime + wait + attack
    );
  }
  function fadeOut(volumeNode) {
    volumeNode.gain.linearRampToValueAtTime(
      volumeValue, actx.currentTime + attack + wait
    );
    volumeNode.gain.linearRampToValueAtTime(
      0, actx.currentTime + wait + attack + decay
    );
  }
  function pitchBend(oscillatorNode) {
    let frequency = oscillatorNode.frequency.value;
    if (!reverse) {
      oscillatorNode.frequency.linearRampToValueAtTime( frequency, actx.currentTime + wait);
      oscillatorNode.frequency.linearRampToValueAtTime( frequency - pitchBendAmount, actx.currentTime + wait + attack + decay);
    }
    else {
      oscillatorNode.frequency.linearRampToValueAtTime( frequency, actx.currentTime + wait);
      oscillatorNode.frequency.linearRampToValueAtTime( frequency + pitchBendAmount, actx.currentTime + wait + attack + decay);
    }
  }
  function addDissonance() {
    let d1 = actx.createOscillator(),
        d2 = actx.createOscillator(),
        d1Volume = actx.createGain(),
        d2Volume = actx.createGain();
    //Set the volume to the `volumeValue`
    d1Volume.gain.value = volumeValue;
    d2Volume.gain.value = volumeValue;
    d1.connect(d1Volume);
    d1Volume.connect(actx.destination);
    d2.connect(d2Volume);
    d2Volume.connect(actx.destination);
    d1.type = "sawtooth";
    d2.type = "sawtooth";
    d1.frequency.value = frequency + dissonance;
    d2.frequency.value = frequency - dissonance;
    if (attack > 0) {
      fadeIn(d1Volume);
      fadeIn(d2Volume);
    }
    if (decay > 0) {
      fadeOut(d1Volume);
      fadeOut(d2Volume);
    }
    if (pitchBendAmount > 0) {
      pitchBend(d1);
      pitchBend(d2);
    }
    if (echo) {
      addEcho(d1Volume);
      addEcho(d2Volume);
    }
    if (reverb) {
      addReverb(d1Volume);
      addReverb(d2Volume);
    }
    play(d1);
    play(d2);
  }
  function play(oscillatorNode) {
    oscillatorNode.start(actx.currentTime + wait);
  }
}
function impulseResponse(duration = 2, decay = 2, reverse = false) {
  let length = actx.sampleRate * duration;
  let impulse = actx.createBuffer(2, length, actx.sampleRate);
  let left = impulse.getChannelData(0),
      right = impulse.getChannelData(1);
  for (let i = 0; i < length; i++){
    let n;
    if (reverse) {
      n = length - i;
    } else {
      n = i;
    }
    left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
  }
  return impulse;
}