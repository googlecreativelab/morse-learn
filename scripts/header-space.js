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

class HeaderSpace {

  constructor(game) {
    this.game = game;
    this.parent = null;
    this.lettersProgress = [];
    this.letterCircles = [];
    this.headerGroup = this.game.add.group();
    this.headerGroup.position.y = -100;
    this.circlesGroup = this.game.add.group();
    this.circlesGroup.position.y = config.header.topPosition + 15;
  }

  updateProgressLights(score, letter) {
    this.saveLetters(score);

    // Loop through each learned letter and apply a little more opacity
    Object.keys(score).forEach((key) => {
      let currentAlpha = 0.3;

      if (score[key] && score[key] > 0 && score[key] <= (config.app.LEARNED_THRESHOLD * 2)) {
        switch(score[key]) {
          case 1:
            currentAlpha = 0.4;
            break;
          case 2:
            currentAlpha = 0.6;
            break;
          case 3:
            currentAlpha = 0.8;
            break;
          case 4:
            currentAlpha = 1;
            break;
          default:
            currentAlpha = 0.3;
        }

        setTimeout(() => {
          this.lettersProgress.filter(letter => letter.text.toLowerCase() === key)[0].alpha = currentAlpha;
        }, 500);
      }
    });

    // Do circle animation
    if (this.letterCircles[letter] && typeof letter !== 'undefined') {
      this.game.add.tween(this.letterCircles[letter].scale).to({ x: 1.5, y: 1.5 }, 200, Phaser.Easing.Linear.In, true, 500);
      this.game.add.tween(this.letterCircles[letter]).to({ alpha: 0 }, 300, Phaser.Easing.Linear.In, true, 700).onComplete.add(() => {
        this.game.add.tween(this.letterCircles[letter].scale).to({ x: 0, y: 0 }, 10, Phaser.Easing.Linear.In, true);
        this.game.add.tween(this.letterCircles[letter]).to({ alpha: 1 }, 10, Phaser.Easing.Linear.In, true, 10);
      });
    }
  }

  createLetters() {
    const spacing = this.parent.course.headerSpacing;
    const lettersToLearn = this.parent.course.lettersToLearn.slice(0);
    lettersToLearn.sort();

    for (let i = 0; i < lettersToLearn.length; i++) {
      const letter = this.game.add.text(i * (config.header.letterSize + spacing), 0, lettersToLearn[i].toUpperCase(), {
        align: 'center',
        boundsAlignH: 'center',
        boundsAlignV: 'middle'
      });
      letter.setTextBounds(0, 0, config.header.letterSize - 10, config.header.letterSize - 10);
      letter.font = config.typography.font;
      letter.fontWeight = 700;
      letter.fontSize = config.header.letterSize;
      letter.addColor('#fff', 0);
      letter.alpha = 0.2;

      let circle = this.game.add.graphics(0, 0);
      circle.lineStyle(2, 0xffffff, 1);
      circle.drawCircle(0, 0, 50);
      circle.position.x = i * (config.header.letterSize - 10);
      circle.scale.x = 0;
      circle.scale.y = 0;

      // Position individual letters
      if (i >= 13 && i < 22) {
        letter.position.x += 7;
        circle.position.x += 7;
      }

      if (i === 22) {
        letter.position.x += 15;
        circle.position.x += 15;
      } else if (i >= 23) {
        letter.position.x += 20;
        circle.position.x += 20;
      }

      this.headerGroup.add(letter);
      this.circlesGroup.add(circle);
      this.headerGroup.position.x = this.game.world.centerX - (this.headerGroup.width / 2);
      this.circlesGroup.position.x = this.game.world.centerX - (this.circlesGroup.width / 2);
      this.lettersProgress.push(letter);
      this.letterCircles.push(circle);
    }


    // Cta Button that links externally
    let ctaButton = this.game.add.button(this.game.world.centerX, 20, '', () => {
      this.clearProgress();
    });
    ctaButton.anchor.set(0.5, 0);
    ctaButton.width = this.headerGroup.width;
    ctaButton.height = this.headerGroup.height;
    ctaButton.alpha = 0;

    // Move button above all things
    this.buttonGroup = this.game.add.group();
    this.buttonGroup.add(ctaButton);
    this.game.world.bringToTop(this.buttonGroup);
    this.game.add.tween(this.headerGroup).to({ y: config.header.topPosition }, 800, Phaser.Easing.Exponential.Out, true, 400);
  }

  saveLetters(score) {
    if (typeof(Storage) !== 'undefined') {
      let key = this.parent.course.storageKey;
      localStorage.setItem(key, JSON.stringify(score));
    }
  }

  // Clear the current progress
  clearProgress() {
    if (typeof(Storage) !== 'undefined') {
      const confirm = window.confirm('Are you sure you want to clear your progress? This will restart your current game.');
      if (confirm) {
        localStorage.removeItem(this.parent.course.storageKey);
        localStorage.removeItem('intro');
        window.location.reload();
      }
    }
  }

  create() {
    this.createLetters();
  }
}

module.exports.HeaderSpace = HeaderSpace;
