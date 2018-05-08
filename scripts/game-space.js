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

import { Word } from './word';
let _ = require('lodash');
const words = require('./words');
const config = require('./config');

class GameSpace {

  constructor(game) {
    this.parent = null;
    this.currentLettersInPlay = [];
    this.currentWords = [];
    this.currentWordIndex = 0;
    this.hasMistake = false;
    this.mistakeCount = 0;
    this.consecutiveCorrect = 0;
    this.inputReady = false;
    this.game = game;
    this.gameSpaceGroup = this.game.add.group();

    this.allBgColors = [
      0xef4136,
      0xf7941e,
      0x662d91,
      0x00a651
    ];
    this.allBgColorsString = [
      '#ef4136',
      '#f7941e',
      '#662d91',
      '#00a651'
    ];
  }

  findAWord() {
    const shuffled = _.shuffle(words);
    const newestLetter = this.currentLettersInPlay[this.currentLettersInPlay.length - 1];
    let myWord;

    // Check if letters in play has some added already
    if (this.currentLettersInPlay.length < 3) {
      this.currentLettersInPlay = this.parent.lettersToLearn.slice(0, 3);
    }

    for (let s = 0; s < shuffled.length; s++) {
      let onlyTheseLetters = true;

      // Exclude all letters that arent in the current pool
      for (let l = 0; l < shuffled[s].length; l++) {
        if (_.indexOf(this.currentLettersInPlay, shuffled[s][l]) === -1) {
          onlyTheseLetters = false;
        }
      }

      if (onlyTheseLetters) {
        // Check to see if newest letter hasn't been learned, then only use
        if (this.letterScoreDict[newestLetter] < config.app.LEARNED_THRESHOLD) {
          if (_.indexOf(shuffled[s], newestLetter) > -1) {
            myWord = shuffled[s];
            break;
          }
        } else {
          myWord = shuffled[s];
          break;
        }
      }
    }

    return myWord;
  }

  create() {
    this.letterScoreDict = this.parent.letterScoreDict;
    this.newLetterArray = this.parent.lettersToLearn.slice(0);
    this.newLetterArray.sort();
    this.loadLetters();

    document.removeEventListener('textInput', this.game.downEvent);

    this.game.downEvent = function(e) {
      if (this.inputReady) {
        this.checkMatch(e);
      }
    };

    document.addEventListener('textInput', this.game.downEvent.bind(this));

    setTimeout(() => {
      for (let i = 0; i < config.app.howManyWordsToStart; i++) {
        this.makeWordObject(i);
      }

      for (let i = 0; i < this.currentWords.length; i++) {
        if (i > 0) {
          const myStartX = this.currentWords[i - 1].myStartX + (this.currentWords[i - 1].letterObjects.length * config.app.wordBrickSize) + config.app.spaceBetweenWords;
          this.currentWords[i].setPosition(myStartX);
        } else {
          this.currentWords[i].setPosition(config.app.wordBrickSize);

          // Animate stuff immediately when first starting
          this.game.add.tween(this.currentWords[i].pills[0].scale).to({ x: 1, y: 1 }, 250, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_START_DELAY);
          this.game.add.tween(this.currentWords[i].pills[0]).to({ y: config.GLOBALS.worldTop }, 400, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_END_DELAY + 200);
          this.game.add.tween(this.currentWords[i].letterObjects[0]).to({ y: config.GLOBALS.worldTop }, 400, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_END_DELAY + 200);
          this.currentWords[i].letterObjects[0].addColor('#F1E4D4', 0);
          this.currentWords[i].letterObjects[0].alpha = 1;

          setTimeout(() => {
            this.inputReady = true;
          }, config.animations.SLIDE_END_DELAY + 800);
        }
      }

      this.currentWords[0].setStyle(0);
      this.currentWords[0].updateHint();
    }, 0);
  }

  // Set current pool to saved learned letters
  // Update progress lights
  loadLetters() {
    // Grab saved letters from previous states
    Object.keys(this.letterScoreDict).forEach((key) => {
      if (this.letterScoreDict[key] >= config.app.LEARNED_THRESHOLD) {
        this.currentLettersInPlay.push(key);
      }
    });

    setTimeout(() => {
      this.parent.header.updateProgressLights(this.letterScoreDict);
    }, 0);
  }

  checkAddLetters() {
    let lastLetter;
    let newArray = [];

    // Need to wait for promise for letterScoreDict
    setTimeout(() => {
      const arrayIntersection = _.intersection(this.currentLettersInPlay, this.parent.lettersToLearn);

      for (let i = 0; i < arrayIntersection.length; i++) {
        if (this.letterScoreDict[arrayIntersection[i]] >= config.app.LEARNED_THRESHOLD) {
          newArray.push(true);
        } else {
          newArray.push(false);
        }
      }

      // Get only the last 3 letters in play not including most recent new letter
      lastLetter = newArray[newArray.length - 1];

      // Check if last letter in play is true and got 3 or more in a row
      if (lastLetter && this.consecutiveCorrect >= config.app.CONSECUTIVE_CORRECT) {
        let oldLength = this.currentLettersInPlay.length;
        let newLength = oldLength + 1;
        this.consecutiveCorrect = 0;

        if (newLength > this.parent.lettersToLearn.length) {
          while (newLength > this.parent.lettersToLearn.length) {
            newLength--;
          }
        }

        this.currentLettersInPlay = this.parent.lettersToLearn.slice(0, newLength);
      }
    }, 200);
  }

  makeWordObject() {
    let myWord = this.findAWord();
    let length = myWord.length;
    let word = new Word(this.game);
    word.myLength = length;
    word.myColor = this.allBgColors[this.currentWords.length % this.allBgColors.length];
    word.myColorString = this.allBgColorsString[this.currentWords.length % this.allBgColorsString.length]
    word.row = 0;
    word.parent = this;
    word.gameParent = this.parent;
    word.create(true, myWord);

    this.checkAddLetters();
    this.currentWords.push(word);
  }

  addAWord() {
    this.makeWordObject();
    let priorIndex = this.currentWords.length - 2;
    let myStartX = this.currentWords[priorIndex].letterObjects[0].position.x + (this.currentWords[priorIndex].myLength * config.app.wordBrickSize) + config.app.spaceBetweenWords;

    this.currentWords[this.currentWords.length - 1].setPosition(myStartX);
  }

  checkMatch(e) {
    const data = e.data;
    let word = this.currentWords[this.currentWordIndex];
    let letter = word.myLetters[word.currentLetterIndex];
    let typedLetter;

    this.inputReady = false;

    if (data === ' ') {
      typedLetter = document.getElementById('input').value;
      typedLetter = typedLetter.trim();
      typedLetter = typedLetter[typedLetter.length - 1];
    } else {
      typedLetter = data;
    }

    typedLetter = typedLetter.toLowerCase();

    if (typeof typedLetter !== 'undefined') {
      if (typedLetter === letter) {
        this.mistakeCount = 0;
        this.consecutiveCorrect++;

        this.game.add.tween(word.pills[word.currentLetterIndex].scale).to({ x: 0, y: 0 }, 500, Phaser.Easing.Back.In, true);

        word.pushDown(word.currentLetterIndex);
        word.currentLetterIndex++;
        this.letterScoreDict[letter] += 1;

        if (this.letterScoreDict[letter] > config.app.LEARNED_THRESHOLD + 2) {
          this.letterScoreDict[letter] = config.app.LEARNED_THRESHOLD + 2
        }

        if (word.currentLetterIndex >= word.myLetters.length) {
          this.currentWordIndex++;
          word.currentLetterIndex = 0;

          if (this.currentWordIndex > this.currentWords.length - 2) {
            this.addAWord();
          }
        }

        word = this.currentWords[this.currentWordIndex];
        letter = word.myLetters[word.currentLetterIndex];
        let theLetterIndex = this.newLetterArray.indexOf(typedLetter);

        if (this.letterScoreDict[letter] < config.app.LEARNED_THRESHOLD) {
          this.game.add.tween(word.pills[word.currentLetterIndex].scale).to({ x: 0, y: 0 }, 500, Phaser.Easing.Back.In, true);
          word.updateHint();
          word.applyHint(word.currentLetterIndex);
        }
        this.slideLetters();
        this.parent.header.updateProgressLights(this.letterScoreDict, theLetterIndex);
      } else {
        this.mistakeCount++;
        this.consecutiveCorrect = 0;

        let letterMistake = word.letterObjects[word.currentLetterIndex].hasMistake;
        this.letterScoreDict[letter] -= 1;
        word.shake(word.currentLetterIndex);
        // console.log('not a match: ' + typedLetter + ' ' + letter);

        this.parent.header.updateProgressLights(this.letterScoreDict, letter);

        if (this.letterScoreDict[letter] < -config.app.LEARNED_THRESHOLD - 2) {
          this.letterScoreDict[letter] = -config.app.LEARNED_THRESHOLD - 2;
        }

        if (!letterMistake) {
          letterMistake = true;

          if (this.mistakeCount === 3) {
            word.updateHint(true);
          }

          if (this.mistakeCount === 4) {
            word.updateHint();
            word.applyHint(word.currentLetterIndex);
          }
        }

        setTimeout(() => {
          this.inputReady = true;
        }, 600);
      }
    }
  }

  setWatchedVideo() {
    if (typeof(Storage) !== 'undefined') {
      localStorage.setItem('intro', true);
    }
  }

  slideLetters() {
    const word = this.currentWords[this.currentWordIndex];
    const letterObject = word.letterObjects[word.currentLetterIndex];
    const target = config.app.wordBrickSize;
    const distBetweenTargetAndNextLetter = letterObject.position.x - target;

    for (let w = 0; w < this.currentWords.length; w++) {
      const bg = this.currentWords[w].background;
      const bgX = bg.position.x;

      for (let l = 0; l < this.currentWords[w].letterObjects.length; l++) {
        const letter = this.currentWords[w].letterObjects[l];
        const letterX = letter.position.x;
        const hint = this.currentWords[w].hints[l];
        const hintX = hint.text.x;
        const pill = this.currentWords[w].pills[l];
        const pillX = pill.position.x;

        this.game.add.tween(letter).to({ x: letterX - distBetweenTargetAndNextLetter }, config.animations.SLIDE_TRANSITION, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_END_DELAY);
        this.game.add.tween(hint).to({ x: hintX - distBetweenTargetAndNextLetter }, config.animations.SLIDE_TRANSITION, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_END_DELAY);
        this.game.add.tween(pill).to({ x: pillX - distBetweenTargetAndNextLetter }, config.animations.SLIDE_TRANSITION, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_END_DELAY);
      }

      this.game.add.tween(bg).to({ x: bgX - distBetweenTargetAndNextLetter }, config.animations.SLIDE_TRANSITION, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_END_DELAY);
    }

    // Set video as watched if user passes first word
    if (this.currentWordIndex > 0) {
      this.setWatchedVideo();
    }

    this.game.add.tween(word.pills[word.currentLetterIndex].scale).to({ x: 1, y: 1 }, 250, Phaser.Easing.Exponential.Out, true, config.animations.SLIDE_END_DELAY + 200);

    setTimeout(() => {
      this.inputReady = true;
    }, config.animations.SLIDE_END_DELAY + 450);

    word.setStyle(word.currentLetterIndex);
  }
}

module.exports.GameSpace = GameSpace;
