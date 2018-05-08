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

const isTouch = 'ontouchstart' in document.documentElement;
const isLandscape = window.innerWidth > window.innerHeight;

// Keyboard height needs to be taken into account so we have magic numbers here
const keyboardHeight = () => {
  let height;
  if (screen.width >= 768) {
    height = (!isLandscape ? document.body.clientHeight * 0.35 : document.body.clientWidth * 0.4);
  } else {
    height = (!isLandscape ? document.body.clientHeight * 0.5 : document.body.clientWidth * 0.27);
  }
  return height;
};

const config = {
  GLOBALS: {
    isTouch: isTouch,
    isLandscape: isLandscape,
    appWidth: document.body.clientWidth,
    appHeight: document.body.clientHeight,
    devicePixelRatio: window.devicePixelRatio,
    worldBottom: (!isLandscape ? document.body.clientHeight : document.body.clientWidth) - keyboardHeight(),
    worldCenter: ((!isLandscape ? document.body.clientHeight : document.body.clientWidth) - keyboardHeight()) * 0.55,
    worldTop: ((!isLandscape ? document.body.clientHeight : document.body.clientWidth) - keyboardHeight()) * 0.35
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
    ctaFontSize: 40,
    startButtonSize: 60,
    titleOffset: -200,
    ctaOffset: 150,
    startButtonOffset: 350
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
  }
};

module.exports = config;
