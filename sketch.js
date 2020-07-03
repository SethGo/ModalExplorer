// spacing and positioning
var widthC = 800;
var heightC = 575;

var radioSize = 20;
var horizSpacingFactor = 80; // space between each function's column
var vertSpacingFactor = 30; // space between boxes in same column
var radioOffset = 10; // Vertical offset to make room for the number on top
var nonTonicRadiosX = 180;
var nonTonicRadiosY = 100;
var voicingKnobX = 110;
var voicingKnobY = 310;
var voicingVertSpaceFactor = 70;
var filterADSRx = 510;
var filterADSRy = 290;
var volKnobX = filterADSRx + 187;
var volKnobY = filterADSRy + 195;
var ampADSRx = filterADSRx + 150;
var ADSRhorizSpacing = 28;
var xyControllerX = filterADSRx;
var xyControllerY = filterADSRy + 150;

// gui objects
var radioBoxColumns = [];
var voicingKnobs = [];
var oscKnobs = [];
var volKnob;
var voiceVolSliders = [];
var filterADSRSliders = [];
var ampADSRSliders = [];
var xyController;

// program control variables
var alterationArr = [0, 0, 0, 0, 0, 0, 0];
var scaleKernelAfterAlteration = [0, 2, 4, 5, 7, 9, 11];
var scaleNotes = [];
var rbAlterationArrMaster = [];
var keyKnobVal = 3;
var rbKnobVal = 0;
var voicingKernel = [];
var chord = [];
var chordNotesNamed = [];
var pressed;
var oscillators = [];
var ampADSRVars = [];
var filterADSRVars = [];
var filterEnv;
var LpFilter;
var ampEnv;
var ampEnvArr = [];
var glide = 0;
var fft;

// data
var noteNames = [
    "A",
    "A#/Bb",
    "B",
    "C",
    "C#/Db",
    "D",
    "D#/Eb",
    "E",
    "F",
    "F#/Gb",
    "G",
    "G#/Ab",
];
var basFreqs = [
    110.0,
    116.54,
    123.47,
    130.81,
    138.59,
    146.83,
    155.56,
    164.81,
    174.61,
    185.0,
    196.0,
    207.65,
];
var tenFreqs = [
    220.0,
    233.08,
    246.94,
    261.63,
    277.18,
    293.66,
    311.13,
    329.63,
    349.23,
    369.99,
    392.0,
    415.3,
];
var altFreqs = [
    440.0,
    466.16,
    493.88,
    523.25,
    554.37,
    587.33,
    622.25,
    659.25,
    698.46,
    739.99,
    783.99,
    830.61,
];
var sopFreqs = [
    880.0,
    932.33,
    987.77,
    1046.5,
    1108.73,
    1174.66,
    1244.51,
    1318.51,
    1396.91,
    1479.98,
    1567.98,
    1661.22,
];
var freqOctaves = [sopFreqs, altFreqs, tenFreqs, basFreqs];
var waveTypeArr = ["sine", "triangle", "square", "sawtooth"];
var intitialValuesFilterASDR = [0, 0, 80, 100]; //[10, 0, 60, 8];
var intitialValuesAmpASDR = [4, 29, 81, 52]; //[7, 22, 20, 9];

function setup() {
    var canvas = createCanvas(widthC, heightC);
    canvas.parent("sketch-holder");

    for (degree = 1; degree < 7; degree++) {
        let accidentalColumn = [];
        for (accidental = 0; accidental < 3; accidental++) {
            accidentalColumn[accidental] = new RadioBox(
                nonTonicRadiosX,
                nonTonicRadiosY,
                degree,
                accidental,
                (123, 234, 243)
            );
            accidentalColumn[accidental].stroke = 0;
            accidentalColumn[accidental].alpha = 80;
            if (accidental === 1) {
                // initialize natural radio boxes
                accidentalColumn[accidental].alpha = 220;
                accidentalColumn[accidental].selected = true;
            }
        }
        radioBoxColumns[degree] = accidentalColumn;
    }
    console.log('check1')
    keyKnob = new Knob(
        20,
        nonTonicRadiosX - 70,
        nonTonicRadiosY + 50,
        0,
        11,
        3,
        12
    );
    glideSlider = new Slider(
        widthC - 47.5,
        nonTonicRadiosY + 20,
        10,
        20,
        85,
        0,
        "vertical"
    );
    rbKnob = new Knob(20, widthC - 122, nonTonicRadiosY + 50, 0, 18, 0, 19);

    ampEnv = new p5.Envelope();
    filterEnv = new p5.Envelope();
    LpFilter = new p5.LowPass();

    for (i = 0; i < 4; i++) {
        voicingKnobs[i] = new Knob(
            30,
            voicingKnobX,
            voicingKnobY + voicingVertSpaceFactor * i,
            0,
            7,
            7 - i * 2,
            8
        );
        oscKnobs[i] = new Knob(
            22,
            voicingKnobX + 200,
            voicingKnobY + voicingVertSpaceFactor * i,
            0,
            3,
            i,
            4
        );
        voiceVolSliders[i] = new Slider(
            voicingKnobX + 250,
            voicingKnobY + voicingVertSpaceFactor * i - 10,
            10,
            20,
            70,
            75,
            "horizontal"
        );
        filterADSRSliders[i] = new Slider(
            filterADSRx + i * ADSRhorizSpacing,
            filterADSRy,
            10,
            20,
            75,
            intitialValuesFilterASDR[i],
            "vertical"
        );
        ampADSRSliders[i] = new Slider(
            ampADSRx + i * ADSRhorizSpacing,
            filterADSRy,
            10,
            20,
            75,
            intitialValuesAmpASDR[i],
            "vertical"
        );
        oscillators[i] = new p5.Oscillator(waveTypeArr[i]);
        oscillators[i].disconnect();
        oscillators[i].connect(LpFilter);
        ampEnvArr[i] = new p5.Envelope();
    }

    volKnob = new Knob(39, volKnobX, volKnobY, 0, 100, 40, 100);
    xyController = new XyController(xyControllerX, xyControllerY, 90, 50, 75);

    updateScaleNoteNames();

    fft = new p5.FFT();
    create18Modes();
}

function draw() {
    fill(5, 41, 66);
    strokeWeight(0);
    rect(0, 0, widthC, heightC, 25);

    if (radioBoxColumns) {
        for (column = 1; column < radioBoxColumns.length; column++) {
            for (accidental = 0; accidental < 3; accidental++) {
                radioBoxColumns[column][accidental].show();
            }
        }
    }

    keyKnob.update();
    rbKnob.update();
    keyKnobVal = floor(keyKnob.knobValue);
    rbKnobVal = floor(rbKnob.knobValue);
    glideSlider.update();
    volKnob.update();

    for (knob = 0; knob < voicingKnobs.length; knob++) {
        voicingKnobs[knob].update();
        oscKnobs[knob].update();
        voiceVolSliders[knob].update();
        filterADSRSliders[knob].update();
        ampADSRSliders[knob].update();
    }

    xyController.update();

    updateGlide();
    updateWaveType();
    updateEnvs();
    updateChord();
    if (rbKnobVal != 0) {
        updateRbStatus();
    }

    updateScaleNoteNames();
    updateVolumes();

    drawText();
    drawGUILines();

    updateFFTViz();
}

function updateRbStatus() {
    // Visualize
    let rbAltArr = rbAlterationArrMaster[rbKnobVal - 1];
    for (degree = 1; degree < 7; degree++) {
        if (rbAltArr[degree] == 0) {
            radioBoxColumns[degree][0].alpha = 80;
            radioBoxColumns[degree][1].alpha = 220;
            radioBoxColumns[degree][2].alpha = 80;
        } else if (rbAltArr[degree] == 1) {
            radioBoxColumns[degree][0].alpha = 220;
            radioBoxColumns[degree][1].alpha = 80;
            radioBoxColumns[degree][2].alpha = 80;
        } else { // if -1
            radioBoxColumns[degree][0].alpha = 80;
            radioBoxColumns[degree][1].alpha = 80;
            radioBoxColumns[degree][2].alpha = 220;
        }
    }

    let natScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
    for (let scaleDeg = 0; scaleDeg < rbAltArr.length; scaleDeg++) {
        scaleKernelAfterAlteration[scaleDeg] =
            natScaleIntervals[scaleDeg] + rbAltArr[scaleDeg];
    }
}

function create18Modes() {
    let seconds = [0, -1, 1];
    let fourths = [0, 1];
    let sixths = [0, -1, 1];
    index = 0;
    while (index < 18) {
        for (sx in sixths) {
            for (f in fourths) {
                for (s in seconds) {
                    rbAlterationArrMaster[index] = [0, seconds[s], 0, fourths[f], 0, sixths[sx], 0]; // the 18 modes
                    index += 1;
                }
            }
        }
    }
    // console.log(rbAlterationArrMaster, "initialized RB array");
}

function updateFFTViz() {
    let waveform = fft.waveform();
    noFill();
    beginShape();
    strokeWeight(4.8);
    stroke(123, 234, 243);
    for (let i = 0; i < waveform.length; i++) {
        let x = map(i, 0, waveform.length, 345, widthC - 20);
        let y = map(waveform[i], -1, 1, -54.6, 119.3);
        vertex(x, y);
    }
    endShape();
}

function updateGlide() {
    glide = map(glideSlider.sliderValue, 0, 100, 0, 1);
}

function drawGUILines() {
    let radius = 6;
    stroke(123, 234, 243);
    strokeWeight(6);
    fill(0, 0);

    // box around scales
    rect(10, nonTonicRadiosY - radioSize - 2, widthC - 20, 150, radius);

    // box around scale controls
    rect(60, nonTonicRadiosY - radioSize - 2, widthC - 220, 150, radius);

    // box around 'scale' label
    rect(10, nonTonicRadiosY - radioSize - 2, 50, 150, radius);

    // box around glide section
    rect(widthC - 85, nonTonicRadiosY - radioSize + 30, 75, 118, radius);

    // box around 'glide' title
    rect(widthC - 85, nonTonicRadiosY - radioSize - 2, 75, 32, radius);

    // box around RB section
    rect(widthC - 160, nonTonicRadiosY - radioSize + 30, 75, 118, radius);

    // box around 'RB Mode' title
    rect(widthC - 160, nonTonicRadiosY - radioSize - 2, 75, 32, radius);

    // box around voicings
    rect(10, voicingKnobY - 82, widthC - 20, 330, radius);

    // box around 'voicing' label
    rect(10, voicingKnobY - 82, 50, 330, radius);

    // box around voicingKnobs label
    rect(60, voicingKnobY - 50, 100, 298, radius);

    // box around 'inversion' label
    rect(60, voicingKnobY - 82, 100, 32, radius);

    // box around chord section
    rect(voicingKnobX + 50, voicingKnobY - 50, 100, 298, radius);

    // box around 'chord' title
    rect(voicingKnobX + 50, voicingKnobY - 82, 100, 32, radius);

    // box around osc section
    rect(voicingKnobX + 150, voicingKnobY - 50, 200, 298, radius);

    // box around 'Oscillators' title
    rect(voicingKnobX + 150, voicingKnobY - 82, 200, 32, radius);

    // box around env section
    rect(voicingKnobX + 350, voicingKnobY - 50, 330, 298, radius);

    // box around 'Envelopes' title
    rect(voicingKnobX + 350, voicingKnobY - 82, 330, 32, radius);

    // box around the whole thing
    rect(
        10,
        nonTonicRadiosY - radioSize - 2,
        widthC - 20,
        heightC - nonTonicRadiosY + 5,
        radius
    );
}

function updateWaveType() {
    for (i = 0; i < oscillators.length; i++) {
        oscillators[i].setType(waveTypeArr[oscKnobs[i].knobValue]);
    }
}

function updateVolumes() {
    let globalVol = volKnob.knobValue;
    for (i = 0; i < oscillators.length; i++) {
        let individualVolPct = voiceVolSliders[i].sliderValue / 100;
        let volMap = map(globalVol * individualVolPct, 0, 100, 0.0001, 0.2);
        ampEnvArr[i].setRange(volMap, 0.0);
    }
}

function keyPressed() {
    for (i = 0; i < oscillators.length; i++) {
        oscillators[i].stop();
    }

    userKey = parseInt(String.fromCharCode(keyCode));

    if (userKey >= 1 && userKey < 8) {
        // Play chord function by number key
        pressed = userKey;

        for (i = 0; i < oscillators.length; i++) {
            if (voicingKnobs[i].knobValue !== 0) {
                oscillators[i].start();
                ampEnvArr[i].triggerAttack(oscillators[i]);
                filterEnv.triggerAttack();
            }
        }
    } else {
        // Stop sound with any other key
        for (i = 0; i < oscillators.length; i++) {
            oscillators[i].stop();
        }
    }
}

function keyReleased() {
    for (i = 0; i < oscillators.length; i++) {
        ampEnvArr[i].triggerRelease(oscillators[i]);
        filterEnv.triggerRelease();
    }
}

function mousePressed() {
    keyKnob.active();
    rbKnob.active();
    volKnob.active();
    for (knob = 0; knob < voicingKnobs.length; knob++) {
        voicingKnobs[knob].active();
        oscKnobs[knob].active();
        voiceVolSliders[knob].active();
        filterADSRSliders[knob].active();
        ampADSRSliders[knob].active();
    }

    if (rbKnobVal == 0) {
        for (column = 1; column < radioBoxColumns.length; column++) {
            // try to find some way to redo this as .active() like the rest of the class functions here
            for (accidental = 0; accidental < 3; accidental++) {
                radioBoxColumns[column][accidental].clicked(
                    mouseX,
                    mouseY,
                    column,
                    accidental
                );
            }
        }
    }

    glideSlider.active();
    xyController.active();
}

function mouseReleased() {
    keyKnob.inactive();
    rbKnob.inactive();
    volKnob.inactive();
    for (knob = 0; knob < voicingKnobs.length; knob++) {
        voicingKnobs[knob].inactive();
        oscKnobs[knob].inactive();
        voiceVolSliders[knob].inactive();
        filterADSRSliders[knob].inactive();
        ampADSRSliders[knob].inactive();
    }
    glideSlider.inactive();
    xyController.inactive();
}

function updateEnvs() {
    let cutOff = map(xyController.controllerXValue, 0, 100, 200, 10000);
    let res = map(xyController.controllerYValue, 0, 100, 1, 25);
    let ADSRRatios = [60, 80, 100, 60];

    for (i = 0; i < ampADSRSliders.length; i++) {
        ampADSRVars[i] = ampADSRSliders[i].sliderValue / ADSRRatios[i];
        filterADSRVars[i] = filterADSRSliders[i].sliderValue / ADSRRatios[i];
    }

    for (i = 0; i < oscillators.length; i++) {
        ampEnvArr[i].setADSR(...ampADSRVars);
    }

    filterEnv.setADSR(...filterADSRVars);
    filterEnv.setRange(cutOff, 100);
    LpFilter.freq(filterEnv);
    LpFilter.res(res);

    for (i = 0; i < oscillators.length; i++) {
        oscillators[i].amp(ampEnvArr[i]);
    }
}

function updateChord() {
    for (i = 0; i < voicingKnobs.length; i++) {
        voicingKernel[i] = voicingKnobs[i].knobValue - 1;

        if (voicingKernel[i] < 0) {
            // if voice is turned off
            chord[i] = "";
            oscillators[i].stop();
        } else {
            chord[i] = (voicingKernel[i] + (pressed - 1)) % 7; // set chord
        }
        chordNotesNamed[i] = scaleNotes[chord[i]];
    }

    for (i = 0; i < oscillators.length; i++) {
        oscillators[i].freq(
            freqOctaves[i][noteNames.indexOf(chordNotesNamed[i])],
            glide
        ); // use note names from voicing array to get frequencies from freqOctaves array
    }
}

function getAccidental(position) {
    let altArr;
    if (rbKnobVal == 0) {
        altArr = alterationArr;
    } else {
        alterationArr = [0, 0, 0, 0, 0, 0, 0]
        altArr = rbAlterationArrMaster[rbKnobVal - 1];
    }
    // console.log(altArr);

    if (altArr[position] === 1) {
        return "#";
    } else if (altArr[position] === -1) {
        return "b";
    } else {
        return "";
    }
}

function updateScaleNoteNames() {
    for (i = 0; i < alterationArr.length; i++) {
        scaleNotes[i] =
            noteNames[(scaleKernelAfterAlteration[i] + keyKnobVal) % 12];
    }
}

function drawText() {
    textAlign(LEFT);
    textSize(45);
    textStyle(ITALIC);
    fill(123, 234, 243);
    text("Modal Explorer", 25, 55);

    textAlign(CENTER);
    textSize(16);
    rotate(radians(270)); // all sideways text from here to the next rotate() call
    textStyle(NORMAL);
    text("SCALE", -150, 40);
    text("VOICING", -390, 40);

    textSize(12);
    text("resonance", -475, 500);
    rotate(radians(90)); // rotate back to 0 degrees for normal text

    for (i = 0; i < 7; i++) { //TODO: Gotta pick up the sharps and flats
        // display function alterations and scale notes
        text(
            getAccidental(i) + (i + 1),
            nonTonicRadiosX + 10 + horizSpacingFactor * (i - 1),
            nonTonicRadiosY
        );
        // console.log('is this getting through');
        text(
            scaleNotes[i],
            nonTonicRadiosX + 10 + horizSpacingFactor * (i - 1),
            nonTonicRadiosY + 115
        );
    }

    for (knob = 0; knob < voicingKnobs.length; knob++) {
        // display voicing function and osc selection
        let rawOscVal = oscKnobs[knob].knobValue;
        let rawVoicingVal = voicingKnobs[knob].knobValue;
        let voicingVal = interpretVoicingVal(rawVoicingVal);
        let oscVal = interpretOscVal(rawOscVal);
        let note = chordNotesNamed[knob];

        if (note) {
            note = chordNotesNamed[knob];
        } else {
            note = "";
        }

        fill(123, 234, 243);
        textSize(16);
        text(
            note,
            voicingKnobX + 100,
            voicingKnobY + voicingVertSpaceFactor * knob
        );

        fill(5, 41, 66);
        textSize(12);
        text(
            voicingVal,
            voicingKnobX,
            voicingKnobY + 4 + voicingVertSpaceFactor * knob
        );
        text(
            oscVal,
            voicingKnobX + 200,
            voicingKnobY + 4 + voicingVertSpaceFactor * knob
        );
    }

    // Text for RB knob
    fill(123, 234, 243);
    let rbText = interpretRbVal(rbKnob.knobValue);
    text(rbText, widthC - 121, nonTonicRadiosY + 100);

    adsrLables = ["A", "D", "S", "R"];
    for (slider = 0; slider < ampADSRSliders.length; slider++) {
        fill(123, 234, 243);
        text(
            adsrLables[slider],
            filterADSRx + slider * ADSRhorizSpacing,
            filterADSRy + 100
        );
        text(
            adsrLables[slider],
            ampADSRx + slider * ADSRhorizSpacing,
            filterADSRy + 100
        );
    }
    textAlign(RIGHT);
    text("filter", filterADSRx + 2 * ADSRhorizSpacing, filterADSRy - 10);
    text("cutoff", xyControllerX + 63, xyControllerY - 10);
    text("amp", ampADSRx + 2 * ADSRhorizSpacing, filterADSRy - 10);

    textAlign(CENTER);
    text("RB MODE", widthC - 121, nonTonicRadiosY);
    text("GLIDE", widthC - 46, nonTonicRadiosY);
    text("INVERSION", voicingKnobX, voicingKnobY - 60);
    text("CHORD", voicingKnobX + 100, voicingKnobY - 60);
    text("OSCILLATORS", voicingKnobX + 250, voicingKnobY - 60);
    text("ENVELOPES", voicingKnobX + 515, voicingKnobY - 60);
    text("type", voicingKnobX + 200, filterADSRy - 10);
    text("mix", voicingKnobX + 285, filterADSRy - 10);
    text("output", volKnobX, xyControllerY - 10);
}

function interpretRbVal(rbKnobValue) {
    let options = [
        "off",
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
    ];
    let displayText = options[floor(rbKnobValue)];
    return displayText;
}

function interpretVoicingVal(voicingKnobValue) {
    let displayText;

    switch (floor(voicingKnobValue)) {
        case 0:
            displayText = "-";
            break;
        case 1:
            displayText = "root";
            break;
        case 2:
            displayText = "2nd";
            break;
        case 3:
            displayText = "3rd";
            break;
        case 4:
            displayText = "4th";
            break;
        case 5:
            displayText = "5th";
            break;
        case 6:
            displayText = "6th";
            break;
        case 7:
            displayText = "7th";
            break;
        default:
            displayText = "Loading";
    }
    return displayText;
}

function interpretOscVal(oscKnobValue) {
    let result;
    switch (oscKnobValue) {
        case 0:
            result = "sin";
            break;
        case 1:
            result = "tri";
            break;
        case 2:
            result = "sqr";
            break;
        case 3:
            result = "saw";
            break;
        default:
            displayText = "Loading";
    }
    return result;
}