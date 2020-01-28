// spacing and positioning
var widthC = 800;
var heightC = 650;

var radioSize = 20;
var horizSpacingFactor = 70; // space between each function's column
var vertSpacingFactor = 30; // space between boxes in same column
var radioOffset = 10; // Vertical offset to make room for the number on top
var nonTonicRadiosX = 200;
var nonTonicRadiosY = 100;
var voicingKnobX = 143;
var voicingKnobY = 300;
var voicingVertSpaceFactor = 70;
var filterADSRx = 480;
var filterADSRy = 280;
var volKnobX = filterADSRx + 187;
var ampADSRx = filterADSRx + 150;
var ADSRhorizSpacing = 25;

// gui objects
var radioBoxColumns = [];
var voicingKnobs = [];
var oscKnobs = [];
var volKnob;
var voiceVolSliders = [];
var filterADSR = [];
var ampADSR = [];

// program control variables
var alterationArr;
var scaleKernelAfterAlteration;
var scaleNotes = [];
var keyKnobVal;
var voicingKernel = [];
var chord = [];
var chordNotesNamed = []
var pressed;

// data
var noteNames = ["A", "A#/Bb", "B", "C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab"];
let freqsOctave1 = [110.00, 116.54, 123.47, 130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185.00, 196.00, 207.65];
let freqsOctave2 = [220.00, 233.08, 246.94, 261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30];
let freqsOctave3 = [440.00, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.25, 698.46, 739.99, 783.99, 830.61];
let freqsOctave4 = [880.00, 932.33, 987.77, 1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22];


function setup() {
  createCanvas(widthC, heightC);
  for (degree = 1; degree < 7; degree++) {
    let accidentalColumn = [];
    for (accidental = 0; accidental < 3; accidental++) {
      accidentalColumn[accidental] = new RadioBox(nonTonicRadiosX, nonTonicRadiosY, degree, accidental);
      accidentalColumn[accidental].stroke = 0;
      accidentalColumn[accidental].alpha = 50;
      if (accidental === 1) { // initialize natural radio boxes
        accidentalColumn[accidental].alpha = 100;
        accidentalColumn[accidental].selected = true;
      }
    }
    radioBoxColumns[degree] = accidentalColumn;
  }
  keyKnobVal = 3;
  alterationArr = [0, 0, 0, 0, 0, 0, 0];
  scaleKernelAfterAlteration = [0, 2, 4, 5, 7, 9, 11];
  updateScaleNoteNames();

  keyKnob = new Knob(20, nonTonicRadiosX - 60, nonTonicRadiosY + 50, 0, 11, 3, 12);

  for (i = 0; i < 4; i++) {
    voicingKnobs[i] = new Knob(28, voicingKnobX, voicingKnobY + voicingVertSpaceFactor * i, 0, 7, 7 - i * 2, 8);
    oscKnobs[i] = new Knob(15, voicingKnobX + 110, voicingKnobY + voicingVertSpaceFactor * i, 0, 3, 1, 4);
  }

  volKnob = new Knob(35, volKnobX, filterADSRy + 190, 0, 100, 50, 100);

  for (voice=0; voice < voicingKnobs.length; voice++) {
    voiceVolSliders[voice] = new Slider(voicingKnobX + 200, voicingKnobY + voicingVertSpaceFactor * voice - 10, 10, 20, 70, 75, 'horizontal');
  }

  for (i = 0; i < 4; i++) {
    filterADSR[i] = new Slider(filterADSRx + i*ADSRhorizSpacing, filterADSRy, 10, 20, 100, 50, 'vertical');
    ampADSR[i] = new Slider(ampADSRx + i*ADSRhorizSpacing, filterADSRy, 10, 20, 100, 40, 'vertical');
  }

}

function draw() {
  background(255);
  if (radioBoxColumns) {
    for (column = 1; column < radioBoxColumns.length; column++) {
      for (accidental = 0; accidental < 3; accidental++) {
        radioBoxColumns[column][accidental].show();
        radioBoxColumns[column][accidental].hover(mouseX, mouseY);
      }
    }
  }
  drawText();

  keyKnob.update()
  keyKnobVal = floor(keyKnob.knobValue);
  volKnob.update();


  for (knob = 0; knob < voicingKnobs.length; knob++) {
    voicingKnobs[knob].update();
    oscKnobs[knob].update();
    voiceVolSliders[knob].update();
    filterADSR[knob].update();
    ampADSR[knob].update();
  }

  updateChord();
  updateScaleNoteNames();
}


function keyPressed() {
  //ampEnv.play();  /// figure out the amp and filter env and eventually uncomment this
  userKey = parseInt(String.fromCharCode(keyCode));

  if (userKey >= 1 && userKey < 8) { // Play chord function by number key
    pressed = userKey;
    //startOscillators();
    //harmonicFunc = "Harmonic Function: " + romanNums[pressed-1];
    //initial = false;

  } else if (keyCode == 32) { // Stop sound with space
    //stopOscillators();

  } else { // Handle bad input
    //stopOscillators();
    //harmonicFunc = "Invalid key. Press 1-7";
  }
}


function mousePressed() {
  keyKnob.active();
  volKnob.active();
  for (knob = 0; knob < voicingKnobs.length; knob++) {
    voicingKnobs[knob].active();
    oscKnobs[knob].active();
    voiceVolSliders[knob].active();
    filterADSR[knob].active();
    ampADSR[knob].active();
  }
  for (column = 1; column < radioBoxColumns.length; column++) {
    for (accidental = 0; accidental < 3; accidental++) {
      radioBoxColumns[column][accidental].clicked(mouseX, mouseY, column, accidental);
    }
  }
}

function mouseReleased() {
  keyKnob.inactive();
  volKnob.inactive();
  for (knob = 0; knob < voicingKnobs.length; knob++) {
    voicingKnobs[knob].inactive();
    oscKnobs[knob].inactive();
    voiceVolSliders[knob].inactive();
    filterADSR[knob].inactive();
    ampADSR[knob].inactive();
  }
}

function updateChord() {
  for (knob = 0; knob < voicingKnobs.length; knob++) {
    let val = voicingKnobs[knob].knobValue;
    if (val < 1) {
      voicingKernel[knob] = ''; // note off
    } 
    voicingKernel[knob] = val - 1;
  }

  // Set voicing functions and named notes based on the voicing-kernel
  for (voice = 0; voice < voicingKernel.length; voice++) {
    if (voicingKernel[voice] < 0) { // if voice is turned off
      chord[voice] = '';
    } else {
      chord[voice] = (voicingKernel[voice] + (pressed - 1)) % 7;
    }
    chordNotesNamed[voice] = scaleNotes[chord[voice]];
  }


  //put this into a loop to set freqs (from ver1) 
  // oscB.freq(freqsOctave1[noteNames.indexOf(voicingNotes[0])]);
}

function getAccidental(position) {
  if (alterationArr[position] === 1) {
    return '#';
  } else if (alterationArr[position] === -1) {
    return ('b');
  } else {
    return '';
  }
}

function updateScaleNoteNames() {
  for (i = 0; i < alterationArr.length; i++) {
    scaleNotes[i] = noteNames[(scaleKernelAfterAlteration[i] + keyKnobVal) % 12];
  }
}

function drawText() {
  textAlign(LEFT);
  textSize(28);
  fill('orange')
  text("Modal Explorer", 25, 40);

  textAlign(CENTER);
  textSize(15);
  rotate(radians(270));
  text("- Scale -", -130, 40);
  text("- Voicing -", -390, 40);
  rotate(radians(90));

  for (i = 0; i < 7; i++) { // display function alterations and scale notes
    text(getAccidental(i) + (i + 1), nonTonicRadiosX + 10 + horizSpacingFactor * (i - 1), nonTonicRadiosY);
    text(scaleNotes[i], nonTonicRadiosX + 10 + horizSpacingFactor * (i - 1), nonTonicRadiosY + 115);
  }

  for (knob = 0; knob < voicingKnobs.length; knob++) { // display voicing function and osc selection
    let rawOscVal = oscKnobs[knob].knobValue;
    let rawVoicingVal = voicingKnobs[knob].knobValue;
    let voicingVal = interpretVoicingVal(rawVoicingVal);
    let oscVal = interpretOscVal(rawOscVal);
    let note = chordNotesNamed[knob];

    if (note) {
      note = chordNotesNamed[knob];
    } else {
      note = '';
    }

    text(note, voicingKnobX + 50, voicingKnobY + voicingVertSpaceFactor * knob)
    text(voicingVal, voicingKnobX - 60, voicingKnobY + voicingVertSpaceFactor * knob);
    text(oscVal, voicingKnobX + 160, voicingKnobY + voicingVertSpaceFactor * knob);
  }

  text('Output', volKnobX, filterADSRy + 245)
}

function interpretVoicingVal(voicingKnobValue) {
  let displayText;

  switch (floor(voicingKnobValue)) {
    case 0:
      displayText = '-';
      break;
    case 1:
      displayText = 'root';
      break;
    case 2:
      displayText = '2nd';
      break;
    case 3:
      displayText = '3rd';
      break;
    case 4:
      displayText = '4th';
      break;
    case 5:
      displayText = '5th';
      break;
    case 6:
      displayText = '6th';
      break;
    case 7:
      displayText = '7th';
      break;
    default:
      displayText = 'Loading';
  }
  return displayText;
}

function interpretOscVal(oscKnobValue) {
  let result;
  switch (oscKnobValue) {
    case 0:
      result = 'sine';
      break;
    case 1:
      result = 'triangle';
      break;
    case 2:
      result = 'square';
      break;
    case 3:
      result = 'sawtooth';
      break;
    default:
      displayText = 'Loading';
  }
  return result;
}






