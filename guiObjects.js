class Knob {
  constructor(radius, locx, locy, lowNum, hiNum, defaultNum, notches) {
    this.x = locx;
    this.y = locy;
    this.lowNum = lowNum;
    this.hiNum = hiNum;
    this.notches = notches;
    this.rotateMe = map(defaultNum, lowNum, hiNum, 0, -280);
    this.currentRot = map(defaultNum, lowNum, hiNum, 0, -280);
    this.radius = radius;
    this.knobValue = defaultNum;
    this.displayValue = 0;
    this.isClickedOn = false;
    this.mouseOver = false;
    this.myY = mouseY;
    this.stroke = 0;
    this.spacing = 280 / (this.notches - 1);

    this.update = function () {
      push();

      translate(this.x, this.y);
      if (dist(this.x, this.y, mouseX, mouseY) < this.radius) {
        this.mouseOver = true;
      }
      else {
        this.mouseOver = false;
      }
      if (mouseIsPressed && this.isClickedOn) {
        this.rotateMe = this.currentRot + map(mouseY, this.myY, widthC, 0, heightC);

        if (this.rotateMe < -280) {
          this.rotateMe = -280;
        }

        if (this.rotateMe < 0 && this.rotateMe > 0 - this.spacing) { // first notch
          this.rotateMe = 0;
        }

        for (i = 1; i < this.notches; i++) {
          if (this.rotateMe < -this.spacing * (i - 1) - this.spacing / 2 && this.rotateMe > - this.spacing * (i) - this.spacing / 2) {
            this.rotateMe = floor(-this.spacing * i);
          }
        }

        if (this.rotateMe > 0) {
          this.rotateMe = 0;
        }


        this.knobValue = floor(map(this.rotateMe, -280, 0, hiNum, lowNum));
        //print(this.knobValue);
        //print(this.rotateMe);
        rotate(radians(-this.rotateMe)); // change degrees to radians
      }
      else {
        rotate(radians(-this.rotateMe));
      }
      if (!mouseIsPressed) {
        this.currentRot = this.rotateMe;
        this.isClickedOn = false;
      }

      // draw knob
      ellipseMode(RADIUS);
      strokeWeight(3);
      stroke(this.stroke);
      rotate(radians(-50));
      ellipse(0, 0, this.radius, this.radius);
      line(1 - this.radius, 0, 10 - this.radius, 0);
      pop(); // restore coordinate matrix
      rotate(0);
      textAlign(CENTER);

      // set the cursor
      if (this.mouseOver && !this.isClickedOn) {
        cursor('pointer'); /// THIS WORKS???
        this.stroke = 100;
      }
      else {
        this.stroke = 0;
      }
    }

    this.active = function () {
      if (this.mouseOver) {
        this.isClickedOn = true;
        this.myY = mouseY;
        cursor('pointer');
      }
      else {
        this.isClickedOn = false;
      }
    }

    this.inactive = function () {
      this.currentRot = this.rotateMe;
      this.isClickedOn = false;
      cursor('default');
    }
  }
}


class RadioBox {
  constructor(x, y, scaleDeg, accidental) {
    this.x = x + horizSpacingFactor * (scaleDeg - 1);
    this.y = y + radioOffset + vertSpacingFactor * accidental;
    this.scaleDeg = scaleDeg;
    this.alpha;
    this.stroke;
    this.accidentalValue = 0;
    this.selected;
  }

  show() {
    fill(220, 0, 220, this.alpha);
    stroke(this.stroke);
    strokeWeight(2);
    rect(this.x, this.y, radioSize, radioSize, radioRadius);
    stroke(0);
  }

  updateScale() {
    let natScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
    alterationArr[this.scaleDeg] = this.accidentalValue;

    for (let scaleDeg = 0; scaleDeg < alterationArr.length; scaleDeg++) {
      scaleKernelAfterAlteration[scaleDeg] = natScaleIntervals[scaleDeg] + alterationArr[scaleDeg];
    }
  }

  hover(x, y) {
    var inRadioXRange = x > this.x && x < this.x + radioSize;
    var inRadioYRange = y > this.y && y < this.y + radioSize;

    if (inRadioXRange && inRadioYRange && !this.selected) {
      this.stroke = 95;

    } else {
      this.stroke = 0;
      cursor(ARROW);
    }

    if (inRadioXRange && inRadioYRange && !this.selected) {
      cursor('pointer'); /// DOESN"T WORK????
      print('hover');
    }
  }

  clicked(x, y, column, selectedAccidental) {
    var inRadioXRange = x > this.x && x < this.x + radioSize;
    var inRadioYRange = y > this.y && y < this.y + radioSize;

    if (inRadioXRange && inRadioYRange) {
      this.alpha = 100;
      this.selected = true;

      for (accidental = 0; accidental < radioBoxColumns[column].length; accidental++) {
        if (accidental !== selectedAccidental) {
          radioBoxColumns[column][accidental].alpha = 50; // deselect other radio boxes in the same column
          radioBoxColumns[column][accidental].selected = false;
        }
      }

      if (selectedAccidental === 0) { // if sharp 
        this.accidentalValue = 1;
      } else if (selectedAccidental === 1) { // if natural
        this.accidentalValue = 0;
      } else {                        // if flat
        this.accidentalValue = -1;
      }

      this.updateScale();
    }
  }
}


class Slider {
  // to do:
  // get initial value to work for horizontal slider
  constructor(x, y, w, h, length, defaultVal, orientation) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.length = length;
    this.defaultVal = defaultVal
    this.orientation = orientation; // 'horizontal' or 'vertical'

    this.x2 = x + length;
    this.y2 = y + h / 2;
    this.handleX = x;
    this.handleY = y;
    this.dragging = false;
    this.hover = false;
    this.offset;
    this.stroke;
    this.sliderValue = defaultVal;
  }

  setOrientation() {
    if (this.orientation === 'vertical') { // defaults to horizontal
      //[this.w, this.h] = [this.h, this.w];
      this.x2 = this.x;
      this.y2 = this.y + this.length + this.w / 2;
      this.handleY = floor(map(this.defaultVal, this.y + this.length, this.y, 0, 100));
    } else {
      this.handleX = floor(map(this.defaultVal, this.x, this.x + this.length, 0, 100));
    }
  }

  determineValue() {
    if (this.orientation === 'vertical') {
      this.sliderValue = floor(map(this.handleY, this.y + this.length, this.y, 0, 100));
    } else {
      this.sliderValue = floor(map(this.handleX, this.x, this.x + this.length, 0, 100));
    }


  }

  determineHover() {
    let upperEdge = this.handleY;
    let lowerEdge = this.handleY + this.h;
    let rightEdge = this.handleX - this.w / 2;
    let leftEdge = this.handleX + this.w;

    if (this.orientation === 'vertical') {
      upperEdge = this.handleY;
      lowerEdge = this.handleY + this.h / 2;
      rightEdge = this.handleX - this.h / 2;
      leftEdge = this.handleX + this.h / 2;

    }

    if (mouseX > rightEdge && mouseX < leftEdge && mouseY > upperEdge && mouseY < lowerEdge) {
      this.hover = true;
    }
    else {
      this.hover = false;
    }
  }

  drawSliderHandle() {
    if (this.dragging) {
      if (this.orientation === 'vertical') { // handle extreemes for vert
        this.handleY = mouseY + this.offset;
        if (this.handleY <= this.y) {
          this.handleY = this.y;
        } else if (this.handleY >= this.y + this.length) {
          this.handleY = this.y + this.length;
        }

      } else {  // handle extreemes for horiz
        this.handleX = mouseX + this.offset;
        if (this.handleX < this.x) {
          this.handleX = this.x;
        } else if (this.handleX >= this.x + this.length) {
          this.handleX = this.x + this.length;
        }
      }
    }

    if (this.handleX < this.x) {
      this.handleX = this.x;
    }

    if (this.dragging || this.hover) {
      this.stroke = 100;
    } else {
      this.stroke = 0;
    }

    stroke(this.stroke);
    rectMode(CENTER);
    if (this.orientation === 'vertical') {
      rect(this.handleX, this.handleY + this.w / 2, this.h, this.w, 5);
    } else {
      rect(this.handleX, this.handleY + this.h / 2, this.w, this.h, 5);
    }
    rectMode(CORNER);
    stroke(0);
  }

  drawTrack() {
    if (this.orientation === 'vertical') {
      line(this.x, this.y + this.w / 2, this.x2, this.y2); // track
    } else {
      line(this.x, this.y + this.h / 2, this.x2, this.y2); // track
    }
  }

  update() {
    this.determineHover();
    this.drawTrack();
    this.drawSliderHandle();
    this.determineValue();

    if (this.dragging) {
      print(this.sliderValue);
    }
  }

  active() {
    if (this.hover) {
      this.dragging = true;
      if (this.orientation === 'vertical') {
        this.offset = this.handleY - mouseY;
      } else {
        this.offset = this.handleX - mouseX;

      }
    }
  }

  inactive() {
    this.dragging = false;
  }

}