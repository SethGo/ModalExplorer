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
      } else if (this.isClickedOn) {
        cursor('grab')
      } else {
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

  hover(x, y) {
    var inRadioXRange = x > this.x && x < this.x + radioSize;
    var inRadioYRange = y > this.y && y < this.y + radioSize;

    if (inRadioXRange && inRadioYRange && !this.selected) {
      this.stroke = 150;
      cursor('pointer'); /// DOESN"T WORK???? (only works for very last box)
    } else {
      this.stroke = 0;
      cursor(ARROW);
    }

  }

  show() {
    fill(220, 0, 220, this.alpha);
    stroke(this.stroke);
    strokeWeight(2);
    rect(this.x, this.y, radioSize, radioSize, 4);
    stroke(0);
    this.hover(mouseX, mouseY);
  }

  updateScale() {
    let natScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
    alterationArr[this.scaleDeg] = this.accidentalValue;

    for (let scaleDeg = 0; scaleDeg < alterationArr.length; scaleDeg++) {
      scaleKernelAfterAlteration[scaleDeg] = natScaleIntervals[scaleDeg] + alterationArr[scaleDeg];
    }
  }



  clicked(x, y, column, selectedAccidental) {
    var inRadioXRange = x > this.x && x < this.x + radioSize;
    var inRadioYRange = y > this.y && y < this.y + radioSize;

    if (inRadioXRange && inRadioYRange) {
      this.alpha = 220;
      this.selected = true;

      for (accidental = 0; accidental < radioBoxColumns[column].length; accidental++) {
        if (accidental !== selectedAccidental) {
          radioBoxColumns[column][accidental].alpha = 80; // deselect other radio boxes in the same column
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
  constructor(x, y, sliderW, sliderH, length, defaultVal, orientation) {
    this.x = x;
    this.y = y;
    this.sliderW = sliderW;
    this.sliderH = sliderH;
    this.length = length;
    this.defaultVal = defaultVal
    this.orientation = orientation; // 'horizontal' or 'vertical', (else statments throughout the class will go to horizontal)

    this.x2 = x + length;
    this.y2 = y + sliderH / 2;
    this.handleX = x;
    this.handleY = y;
    this.dragging = false;
    this.hover = false;
    this.offset;
    this.stroke;
    this.sliderValue = defaultVal;
  }

  setDefault() {
    if (this.orientation === 'vertical') {
      this.handleY = floor(map(this.defaultVal, 0, 100, this.y + this.length, this.y));
    } else {
      this.handleX = floor(map(this.defaultVal, 0, 100, this.x, this.x + this.length));
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
    let lowerEdge = this.handleY + this.sliderH;
    let rightEdge = this.handleX - this.sliderW / 2;
    let leftEdge = this.handleX + this.sliderW;

    if (this.orientation === 'vertical') {
      upperEdge = this.handleY;
      lowerEdge = this.handleY + this.sliderH / 2;
      rightEdge = this.handleX - this.sliderH / 2;
      leftEdge = this.handleX + this.sliderH / 2;
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
        if (this.handleX >= this.x + this.length) {
          this.handleX = this.x + this.length;
        } else if (this.handleX < this.x) {
          this.handleX = this.x;
        }
      }
    }

    if (this.dragging || this.hover) {
      this.stroke = 100;
    } else {
      this.stroke = 0;
    }

    stroke(this.stroke);
    rectMode(CENTER);

    let tempW = this.sliderW;
    let tempH = this.sliderH;
    if (this.orientation === 'vertical') {
      [tempW, tempH] = [tempH, tempW];
    }

    rect(this.handleX, this.handleY + tempH / 2, tempW, tempH, 5);
    rectMode(CORNER);
    stroke(0);
  }

  drawTrack() {
    let tempW = this.sliderW;
    let tempH = this.sliderH;
    if (this.orientation === 'vertical') {
      [tempW, tempH] = [tempH, tempW];
    }
    line(this.x, this.y + tempH / 2, this.x2, this.y2); // track
  }

  update() {
    this.determineHover();
    this.drawTrack();
    this.drawSliderHandle();
    this.determineValue();

    if (frameCount < 20) {
      this.setDefault();
    }

    // if (this.dragging) {     // for testing...
    //   print(this.sliderValue);
    // }

    if (this.orientation === 'vertical') {
      this.x2 = this.x;
      this.y2 = this.y + this.length + this.sliderW / 2;
    }

    if (this.hover && !this.dragging) {
      cursor('pointer');
    } else if (this.dragging) {
      cursor('grab');
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

class XyController {
  constructor(x, y, size, defaultX, defaultY) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.defaultX = defaultX;
    this.defaultY = defaultY

    this.dotSize = 20;
    this.dotX = floor(map(defaultX, 0, 100, x, x + size));
    this.dotY = floor(map(defaultY, 0, 100, y, y + size));
    this.dragging = false;
    this.boxHover = false;
    this.dotHover = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.stroke;
    this.controllerXValue = defaultX;
    this.controllerYValue = defaultY;
  }

  determineValue() {
    let edge = this.dotSize / 4;
    this.controllerXValue = floor(map(this.dotX, this.x + this.size - edge, this.x + edge, 100, 0));
    this.controllerYValue = floor(map(this.dotY, this.y + this.size - edge, this.y + edge, 0, 100));
  }

  determineHover() {
    if (mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
      this.boxHover = true;
    } else {
      this.boxHover = false;
    }

    let d = dist(this.dotX, this.dotY, mouseX, mouseY);
    if (d < this.dotSize / 2) {
      this.dotHover = true;
    } else {
      this.dotHover = false;
    }
  }

  drawBox() {
    strokeWeight(3);
    fill(80);
    rect(this.x, this.y, this.size, this.size, 10);

    for (i = 0; i < 10; i++) {
      let spacingFactor = i * this.size / 10 + (this.size / 10) / 2;
      strokeWeight(.5);
      stroke(110);
      line(this.x + spacingFactor, this.y + 3, this.x + spacingFactor, this.y + this.size - 3);
      line(this.x + 3, this.y + spacingFactor, this.x + this.size - 3, this.y + spacingFactor);
    }
  }

  drawDot() {
    let blueVal = 255;
    if (this.dragging) {
      blueVal = 10;
      this.dotX = mouseX + this.offsetX;
      this.dotY = mouseY + this.offsetY;

      let edge = this.dotSize / 4;
      if (this.dotX >= this.x + this.size - edge) { // handle x extreemes
        this.dotX = this.x + this.size - edge;
      } else if (this.dotX <= this.x + edge) {
        this.dotX = this.x + edge;
      } 
      
      if (this.dotY >= this.y + this.size - edge) { // handle y extreemes
        this.dotY = this.y + this.size - edge;
      } else if (this.dotY <= this.y + edge) {
        this.dotY = this.y + edge;
      }
    }

    stroke(0);
    fill(50, 150, blueVal);
    ellipse(this.dotX, this.dotY, this.dotSize);
    ellipse(this.dotX, this.dotY, this.dotSize / 2); // inner circle
  }

  
  update() {
    this.determineHover();
    this.drawBox();
    this.drawDot();
    this.determineValue();

    if (this.dragging) {     // for testing...
      print(this.controllerXValue, this.controllerYValue);
    }

    if (this.dotHover && !this.dragging) {
      cursor('pointer');
    } else if (this.dragging) {
      noCursor();
    }
  }

  active() {
    if (this.dotHover) {
      this.dragging = true;
      this.offsetX = this.dotX - mouseX;
      this.offsetY = this.dotY - mouseY;
    }
  }

  inactive() {
    this.dragging = false;
  }
}