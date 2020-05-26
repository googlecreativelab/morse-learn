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

const words = require('./words');
import { getClientHeight } from './util'

const isTouch = 'ontouchstart' in document.documentElement;
const isLandscape = window.innerWidth > window.innerHeight;

// Keyboard height needs to be taken into account so we have magic numbers here
const keyboardHeight = () => {
  let height;
  if (screen.width >= 768) {
    height = (!isLandscape ? getClientHeight() * 0.35 : document.body.clientWidth * 0.4);
  } else {
    height = (!isLandscape ? getClientHeight() * 0.5 : document.body.clientWidth * 0.27);
  }
  return height;
};

const config = {
  GLOBALS: {
    isTouch: isTouch,
    isLandscape: isLandscape,
    appWidth: document.body.clientWidth,
    appHeight: getClientHeight(),
    devicePixelRatio: window.devicePixelRatio,
    worldBottom: (!isLandscape ? getClientHeight() : document.body.clientWidth) - keyboardHeight(),
    worldCenter: ((!isLandscape ? getClientHeight() : document.body.clientWidth) - keyboardHeight()) * 0.55,
    worldTop: ((!isLandscape ? getClientHeight() : document.body.clientWidth) - keyboardHeight()) * 0.35
  },
  app: {
    LEARNED_THRESHOLD: 2,
    CONSECUTIVE_CORRECT: 3,
    howManyWordsToStart: 2,
    wordBrickSize: 300,
    wordLetterSize: 150,
    spaceBetweenWords: 300,
    backgroundColor: '#ef4136',
    smoothed: true,
  },
  typography: {
    font: 'Poppins, Helvetica, Arial, sans-serif',
  },
  header: {
    letterSize: 42,
    topPosition: 30,
  },
  title: {
    mainFontSize: 170,
    startButtonSize: 60,
    titleOffset: -200,
    startButtonOffset: 100
  },
  hints: {
    hintOffset: 120,
    hintSize: 0.50,
    hintTextSize: 39,
  },
  animations: {
    SLIDE_START_DELAY: 400,
    SLIDE_END_DELAY: 600,
    SLIDE_TRANSITION: 600,
  },
  emulator: {
    keysMap: {
      period: [ '.', 'j', '13', '74' ],
      dash: [ '-', 'k','32', '75' ],
    },
    finalizeTimeout: 1500,
  },
  courses: {
    alphabet: {
      name: 'Alphabet',
      headerSpacing: -10,
      storageKey: 'savedLetters',
      letters: ['e', 't', 'a', 'i', 'm', 's', 'o', 'h', 'n', 'c', 'r', 'd', 'u', 'k', 'l', 'f', 'b', 'p', 'g', 'j', 'v', 'q', 'w', 'x', 'y', 'z'],
      words: words
    },
    keyboard: {
      name: 'Keyboard Keys',
      headerSpacing: 5,
      storageKey: 'savedKeyboardLetters',
      letters: {'⎋':'esc','⌦':'del','↦':'tab'},
      words: ['⎋⎋↦', '⎋↦⎋', '⌦⌦⌦'],
      assets: 'keyboard'
    }
  },
  course: 'alphabet'
};

module.exports = config;
