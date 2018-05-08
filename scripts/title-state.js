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
import { morseToEnglish } from './morse-dictionary';

class TitleState {

  constructor(game) {
    this.lettersToLearn = morseToEnglish;
    this.letterScoreDict = {};
    this.hasStarted = false;
    this.game = game;

    // If on touch device, wait for tap to focus input since autofocus will not work
    // Also prevent game from restarting on touch start event
    if (config.GLOBALS.isTouch && !this.hasStarted) {
      this.game.touchEvent = (e) => {
        // Prevent starting if target is not canvas
        if (e.target.localName === 'canvas') {
          document.getElementById('input').focus();
          this.start();
          this.hasStarted = true;
        }
      };

      window.addEventListener('touchstart', this.game.touchEvent);
    }

    // Only start if not desktop and not iOS
    if (!this.game.device.desktop) {
      this.game.downEvent = () => {
        document.getElementById('input').focus();
        this.start();
        this.hasStarted = true;
      };

      document.addEventListener('textInput', this.game.downEvent);
    }

  }

  init(params) {
    // Check if game should restart if resetting progress
    if (params && params.reset) {
      this.hasStarted = false;
      document.getElementById('button').style.display = 'block';
      this.game.state.restart();
    }
  }

  create() {
    this.createShapes();
    this.createTitles();

    this.loadLetters().then((loaded) => {
      if (loaded) {
        this.letterScoreDict = loaded;
      } else {
        Object.keys(this.lettersToLearn).forEach((key) => {
          this.letterScoreDict[this.lettersToLearn[key]] = 0;
        });
      }
    });
  }

  // Load letters from localStorage if it exists
  loadLetters() {
    return new Promise((resolve) => {
      if (typeof(Storage) !== 'undefined') {
        if (localStorage.savedLetters) {
          const saved = JSON.parse(localStorage.getItem('savedLetters'));
          resolve(saved);
        } else {
          resolve(false);
        }
      }
    });
  }

  // Creates starting fill background
  createShapes() {
    let rect = this.game.add.graphics(0, 0);
    rect.beginFill(0xef4136, 1);
    rect.drawRect(0, 0, this.game.world.width, this.game.world.height, 5000);
    rect.endFill();

    let circle = this.game.add.graphics(0, 0);
    circle.beginFill(0x000000, 1);
    circle.drawCircle(0, 0, (!this.game.device.desktop ? config.title.mainFontSize * 3.5 : config.title.mainFontSize * 2.5));
    circle.alpha = 0.4;
    circle.anchor.set(0.5, 0.5);
    circle.position.x = this.game.world.centerX;
    circle.position.y = this.game.world.centerY + (!this.game.device.desktop ? config.title.titleOffset : config.title.titleOffset * 0.7);
    circle.scale.x = 0;
    circle.scale.y = 0;
    circle.endFill();

    // Intro animation for circle
    this.game.add.tween(circle.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true, 300);
  }

  // Draws all the titles
  createTitles() {
    const titleText = 'Morse\nTyping\nTrainer';
    let title = this.game.add.text(this.game.world.centerX, this.game.world.centerY + (!this.game.device.desktop ? config.title.titleOffset : config.title.titleOffset * 0.7), titleText, {
      align: 'center'
    });
    title.lineSpacing = -40;
    title.fill = '#F1E4D4';
    title.fontSize = !this.game.device.desktop ? config.title.mainFontSize : config.title.mainFontSize * 0.7;
    title.anchor.setTo(0.5);
    title.font = config.typography.font;

    // Only show start button on mobile/tablet
    if (!this.game.device.desktop && this.game.device.android) {
      const startText = ((config.GLOBALS.isTouch) ? 'Tap to Start' : 'Press any button to Start');
      let startButton = this.game.add.text(this.game.world.centerX, this.game.world.centerY + config.title.startButtonOffset, startText, {
        align: 'center'
      });
      startButton.fontSize = config.title.startButtonSize;
      startButton.fill = '#F1E4D4';
      startButton.anchor.setTo(0.5);
      startButton.font = config.typography.font;

      // Reating animation for start button
      const startButtonTween = this.game.add.tween(startButton).to({ alpha: 0.4 }, 600, 'Linear', true, 0, -1);
      startButtonTween.yoyo(true, 0);
    }

    // Show fallback messag if desktop/iOS
    let ctaText;
    if (!this.game.device.desktop && this.game.device.android) {
      ctaText = 'Works with Gboard Beta\nGet setup here';
    } else {
      ctaText = 'Sorry, this experiment is for\nMorse on Gboard and is only\navailable on Android at this time.\n\nLearn more and get the source code';
    }

    let cta = this.game.add.text(this.game.world.centerX, this.game.world.centerY + (!this.game.device.desktop ? config.title.ctaOffset : config.title.ctaOffset * 0.7), ctaText, {
      align: 'center'
    });
    cta.fontSize = !this.game.device.desktop ? config.title.ctaFontSize : config.title.ctaFontSize * 0.7;
    cta.lineSpacing = -5;
    cta.alpha = 0.4;
    cta.fill = '#000000';
    cta.anchor.setTo(0.5, 0);
    cta.font = config.typography.font;

    // Cta Button that links externally
    let ctaButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY + (!this.game.device.desktop ? config.title.ctaOffset : config.title.ctaOffset * 0.7), '', () => {
      // Reset game so touch event doesnt click through
      this.game.state.restart();
      this.hasStarted = false;
      document.getElementById('button').style.display = 'block';

      if (this.game.device.android) {
        // Android get keyboard link
        window.open('https://support.google.com/accessibility/android/answer/9011881', '_self');
      } else {
        // iOS get source code link
        window.open('http://morse.withgoogle.com/', '_self');
      }
    });
    ctaButton.anchor.set(0.5, 0);
    ctaButton.width = cta.width;
    ctaButton.height = cta.height;
    ctaButton.alpha = 0;

    // Move button above all things
    this.buttonGroup = this.game.add.group();
    this.buttonGroup.add(ctaButton);
    this.game.world.bringToTop(this.buttonGroup);

    // Underline for links
    let underline = this.game.add.graphics(0, 0);
    underline.beginFill(0x000000, 1);
    underline.drawRect(cta.position.x - (this.game.device.android ? 150 : cta.width / 2), cta.position.y + (cta.height - 13), (!this.game.device.android ? cta.width : (cta.width / 2) + 50), 3);
    underline.alpha = 0.3;
    underline.endFill();
  }

  // Check if intro has been watched, if so, skip
  checkWatchedIntro() {
    return new Promise((resolve) => {
      if (typeof(Storage) !== 'undefined') {
        if (localStorage.intro) {
          const saved = localStorage.getItem('intro');
          resolve(saved);
        } else {
          resolve(false);
        }
      }
    });
  }

  start() {
    // Prevent game from restarting on user input
    if (!this.hasStarted) {
      // Check whether we should play video or not
      this.checkWatchedIntro().then((intro) => {
        document.getElementById('button').style.display = 'none';
        this.game.state.start((intro || (this.game.device.iOS) ? 'game' : 'intro'), true, false, this.letterScoreDict);
      });
    }
  }
}

module.exports.TitleState = TitleState;
