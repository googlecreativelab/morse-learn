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
    this.have_audio = true;
    this.have_speech_assistive = true;
    function clearEventHandlers () {
      window.removeEventListener('click', startClickEvent)
      document.removeEventListener('inputEvent', inputEvent)
      audioToggle.removeEventListener('click', onSoundToggle, true);
      speechToggle.removeEventListener('click', onSpeechToggle, true);
      inpelm.removeEventListener('blur', onInputBlur, false);
    }
    let doStart = () => {
      clearEventHandlers()
      document.getElementById('input').focus();
      document.querySelector('.tl-btn-group').style.display = 'none';
      this.game.have_audio = this.have_audio;
      this.game.have_speech_assistive = this.have_speech_assistive;
      this.start();
      this.hasStarted = true;
    }
    let startClickEvent = (e) => {
      // Prevent starting if target is not canvas
      if (e.target.localName === 'canvas') {
        doStart()
      }
    };
    let inputEvent = (evt) => {
      evt.preventDefault()
      doStart()
    };
    window.addEventListener('click', this.game.startClickEvent);
    if (!this.game.device.desktop && this.game.device.android) {
      this.game.downEvent = () => {
        doStart();
      };
      document.addEventListener('textInput', this.game.downEvent);
    } else {
      document.addEventListener('input', inputEvent);
      document.getElementById('input').focus();
    }
    let inpelm = document.getElementById('input');
    let onInputBlur = () => {
        setTimeout(() => {
          inpelm.focus();
        }, 500);
    };
    inpelm.addEventListener('blur', onInputBlur, false);
    let audioToggle = document.querySelector('.audio-toggle')
    let speechToggle = document.querySelector('.speech-toggle')
    document.querySelector('.tl-btn-group').style.display = '';
    let updateAudioToggles = () => {
      audioToggle.classList[this.have_audio ? 'remove' : 'add']('disabled');
      speechToggle.classList[this.have_audio && this.have_speech_assistive ? 'remove' : 'add']('disabled');
    }
    let onSoundToggle = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.have_audio = !this.have_audio;
      updateAudioToggles();
    };
    let onSpeechToggle = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.have_speech_assistive = !this.have_speech_assistive;
      updateAudioToggles()
    };
    updateAudioToggles();
    audioToggle.addEventListener('click', onSoundToggle, true);
    speechToggle.addEventListener('click', onSpeechToggle, true);
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
