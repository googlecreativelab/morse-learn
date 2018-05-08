// Copyright 2018 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const config = require('./config');

class Word {

  constructor(game) {
    this.myLength = null;
    this.parent = null;
    this.currentLetterIndex = 0;
    this.game = game;
  }

  create(morseVisible, myWord) {
    this.myLetters = [];
    this.letterObjects = [];
    this.hints = [];
    this.pills = [];
    this.background = null;
    this.period = this.parent.parent.sounds.period;
    this.dash = this.parent.parent.sounds.dash;
    this.soundTimeout = null;

    for (let i = 0; i < this.myLength; i++) {
      this.myLetters.push(myWord[i])
    }
  }

  setPosition(startX) {
    let rect = this.game.add.graphics(0, 0);
    rect.beginFill(this.myColor);
    rect.drawRect(startX - config.app.wordBrickSize, 0, (config.app.wordBrickSize * this.myLetters.length) + (config.app.wordBrickSize * 2), 5000);
    rect.endFill();
    this.myStartX = startX;
    this.background = rect;

    // Move gameSpaceGroup to back
    this.parent.gameSpaceGroup.add(this.background);

    for (let i = 0; i < this.myLetters.length; i++) {
      let circle = this.game.add.graphics(0, 0);

      // Circle pill
      circle.beginFill(0x000000, 1);
      circle.drawCircle(0, 0, config.app.wordBrickSize);
      circle.position.x = startX + (i * config.app.wordBrickSize);
      circle.position.y = config.GLOBALS.worldCenter;
      circle.alpha = 0.4;
      circle.scale.x = 0;
      circle.scale.y = 0;

      circle.endFill();
      this.pills.push(circle);

      // Letter
      let letter = this.game.add.text(startX + (i * config.app.wordBrickSize), config.GLOBALS.worldCenter, this.myLetters[i].toUpperCase());
      letter.font = config.typography.font;
      letter.fontWeight = 600;
      letter.fontSize = config.app.wordLetterSize;
      letter.align = 'center';
      letter.anchor.set(0.5, 0.5);
      letter.alpha = 0.2;
      letter.morse = this.parent.parent.morseDictionary[this.myLetters[i]];
      letter.fill = '#000000';
      letter.hasMistake = false;
      this.letterObjects.push(letter);

      let hint = this.game.add.sprite(config.app.wordBrickSize, config.GLOBALS.worldCenter + 50, 'e');
      hint.loadTexture(this.myLetters[i]);
      hint.anchor.set(0.5, 0);
      hint.scale.set(config.hints.hintSize);
      hint.alpha = 0;

      // Hint Text
      let hintName = hint.frameName.substr(hint.frameName.lastIndexOf('/') + 1).split('.')[0];
      let hintText = this.game.add.text(config.app.wordBrickSize, config.GLOBALS.worldBottom - 10, hintName);
      hintText.font = config.typography.font;
      hintText.fontSize = config.hints.hintTextSize;
      hintText.fontWeight = 700;
      hintText.align = 'center';
      hintText.anchor.set(0.5, 0.5);
      hintText.addColor('#F1E4D4', 0);
      hintText.alpha = 0;
      const hintTextWidth = hintText.width / 2;

      // Just get width of first letter for underline
      let hintLetter = this.game.add.text(config.app.wordBrickSize, config.GLOBALS.worldBottom - 10, hintName[0]);
      hintLetter.visible = false;
      hintLetter.font = config.typography.font;
      hintLetter.fontSize = config.hints.hintTextSize;
      hintLetter.fontWeight = 700;

      let hintLine = this.game.add.graphics(0, 0);
      hintLine.beginFill(0xF1E4D4, 1);
      hintLine.drawRect(hintLetter.position.x - hintTextWidth, hintLetter.position.y + 20, hintLetter.width, 4);
      hintLine.anchor.set(0.5, 0.5);
      hintLine.alpha = 0;
      hintLine.endFill();

      this.hints.push({
        image: hint,
        text: hintText,
        underline: hintLine
      });
    }
  }

  shake(index) {
    this.game.add.tween(this.letterObjects[index]).to({ x: this.letterObjects[index].x - 20 }, 100, Phaser.Easing.Bounce.In, true).onComplete.add(() => {
      this.game.add.tween(this.letterObjects[index]).to({ x: this.letterObjects[index].x + 40 }, 100, Phaser.Easing.Bounce.In, true).onComplete.add(() => {
        this.game.add.tween(this.letterObjects[index]).to({ x: this.letterObjects[index].x - 20 }, 100, Phaser.Easing.Bounce.In, true);
      });
    });

    this.game.add.tween(this.pills[index]).to({ x: this.pills[index].x - 20 }, 100, Phaser.Easing.Bounce.In, true).onComplete.add(() => {
      this.game.add.tween(this.pills[index]).to({ x: this.pills[index].x + 40 }, 100, Phaser.Easing.Bounce.In, true).onComplete.add(() => {
        this.game.add.tween(this.pills[index]).to({ x: this.pills[index].x - 20 }, 100, Phaser.Easing.Bounce.In, true);
      });
    });
  }

  updateHint(textOnly) {
    if (this.hints.length !== 0) {
      setTimeout(() => {
        if (textOnly) {
          this.game.add.tween(this.hints[this.currentLetterIndex].text).to({ alpha: 1 }, 200, Phaser.Easing.Linear.In, true);
        } else {
          this.game.add.tween(this.hints[this.currentLetterIndex].image).to({ alpha: 1 }, 200, Phaser.Easing.Linear.In, true);
          this.game.add.tween(this.hints[this.currentLetterIndex].text).to({ alpha: 1 }, 200, Phaser.Easing.Linear.In, true);
          // Play the sounds when hint image shows
          this.playSounds(this.letterObjects[this.currentLetterIndex]);
        }

        this.game.add.tween(this.hints[this.currentLetterIndex].underline).to({ alpha: 1 }, 200, Phaser.Easing.Linear.In, true);
      }, ((!textOnly) ? config.animations.SLIDE_END_DELAY + 400 : 0));
    }
  }

  // Play individual dots/dash sound
  // Using 601ms for the delay between each sound because thats the dash duration
  // Which is the longest duration of the sounds
  playSounds(letter) {
    for (let i = 0; i < letter.morse.length; i++) {
      this.soundTimeout = setTimeout(() => {
        if (letter.morse[i] === '\u002D') {
          this.dash.play();
        } else if (letter.morse[i] === '\u002E') {
          this.period.play();
        }
      }, i * 601);
    }
  }

  setStyle(i) {
    this.applyHint(i);
    this.game.add.tween(this.letterObjects[i]).to({ alpha: 1 }, 200, Phaser.Easing.Linear.Out, true, config.animations.SLIDE_END_DELAY + 200);

    setTimeout(() => {
      this.letterObjects[i].addColor('#F1E4D4', 0);
    }, config.animations.SLIDE_END_DELAY + 200);
  }

  applyHint(i) {
    if (this.parent.letterScoreDict[this.myLetters[i]] < config.app.LEARNED_THRESHOLD) {
      this.game.add.tween(this.letterObjects[i]).to({ y: config.GLOBALS.worldTop }, 400, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_END_DELAY + 200);
      this.game.add.tween(this.pills[i]).to({ y: config.GLOBALS.worldTop }, 400, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_END_DELAY + 200);
    }
  }

  pushDown(i) {
    clearTimeout(this.soundTimeout);
    this.period.stop();
    this.dash.stop();

    this.game.add.tween(this.letterObjects[i]).to({ y: config.GLOBALS.worldCenter }, 200, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_START_DELAY);
    this.game.add.tween(this.pills[i]).to({ y: config.GLOBALS.worldCenter }, 200, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_START_DELAY);
    this.game.add.tween(this.hints[i].image).to({ y: config.GLOBALS.worldCenter, alpha: 0 }, 200, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_START_DELAY);
    this.game.add.tween(this.hints[i].text).to({ alpha: 0 }, 200, Phaser.Easing.Linear.In, true);
    this.game.add.tween(this.hints[i].underline).to({ alpha: 0 }, 200, Phaser.Easing.Linear.In, true);
  }
}

module.exports.Word = Word;
