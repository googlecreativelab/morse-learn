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

const config = require("./config");
import { morseToEnglish } from "./morse-dictionary";

/**
 * Localstorage stores booleans as strings so we
 * cast them to real bools here 
 */
const getBoolFromLocalStore = (key) => {
  const result = localStorage.getItem(key)
  if(result === null) return null
  if(result === 'true') return true
  return false
}

class TitleState {
  constructor(game, course) {
    this.course = course;
    this.lettersToLearn = course.lettersToLearn;
    this.letterScoreDict = {};
    this.hasStarted = false;
    this.game = game;

    // This code is pretty flakey, there is probably a cleaner way to do this in phaser
    const canvas = document.querySelector("canvas");

    // If any of the settings are undefined then we default them to true
    if(getBoolFromLocalStore('have_speech_assistive') === null) {
      localStorage.setItem('have_speech_assistive', true)
    }

    if(getBoolFromLocalStore('have_audio') === null) {
      localStorage.setItem('have_audio', true)
    }

    if(getBoolFromLocalStore('have_visual_cues') === null) {
      localStorage.setItem('have_visual_cues', true)
    }

    // Set the initial values to whatever is in local storage
    const initialVisualCues = getBoolFromLocalStore('have_visual_cues')
    const initialAudio = getBoolFromLocalStore('have_audio')
    const initialSpeechAssistive = getBoolFromLocalStore('have_speech_assistive') 
    this.game.have_visual_cues = initialVisualCues
    this.game.have_audio = initialAudio
    this.game.have_speech_assistive = initialSpeechAssistive
    this.have_audio = initialAudio;
    this.have_speech_assistive = initialSpeechAssistive;
    this.have_visual_cues = initialVisualCues;

    let audioToggle = document.querySelector(".audio-toggle");
    let speechToggle = document.querySelector(".speech-toggle");
    let visualToggle = document.querySelector(".visual-toggle");

    // Make the display match the initial state
    audioToggle.classList.add(initialAudio ? 'noop' : 'disabled')
    speechToggle.classList.add(initialSpeechAssistive ? 'noop' : 'disabled')
    visualToggle.classList.add(initialVisualCues ? 'noop' : 'disabled')

    const startListener = () => doStart();

    function clearEventHandlers() {
      document.removeEventListener("keydown", startListener);
      canvas.removeEventListener("click", startListener);
    }
    let doStart = () => {
      clearEventHandlers();
      document.querySelector(".tl-btn-group").classList.add('gamemode');
      this.game.have_audio = this.have_audio;
      this.game.have_speech_assistive = this.have_speech_assistive;
      this.game.have_visual_cues = this.have_visual_cues;
      this.start();
      this.hasStarted = true;
    };

    document.addEventListener("keydown", startListener);

    canvas.addEventListener("click", startListener);

    document.querySelector(".tl-btn-group").style.opacity = 1;
    let updateAudioToggles = () => {
      audioToggle.classList[this.have_audio ? "remove" : "add"]("disabled");
      speechToggle.classList[
        this.have_audio && this.have_speech_assistive ? "remove" : "add"
      ]("disabled");

      // If we turn sound off we should also turn speech have_speech_assistive off
      if(!this.game.have_audio) {
        this.game.have_speech_assistive = false
        localStorage.setItem('have_speech_assistive', this.have_speech_assistive)
      }
    };
    let onSoundToggle = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.have_audio = !this.have_audio;
      this.game.have_audio = this.have_audio
      localStorage.setItem('have_audio', this.have_audio)
      updateAudioToggles();
    };
    let onSpeechToggle = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.have_speech_assistive = !this.have_speech_assistive;
      this.game.have_speech_assistive = this.have_speech_assistive;
      localStorage.setItem('have_speech_assistive', this.have_speech_assistive)

      updateAudioToggles();
    };
    updateAudioToggles();
    audioToggle.addEventListener("click", onSoundToggle, true);
    speechToggle.addEventListener("click", onSpeechToggle, true);

    // This toggle allows the user to enable or disable visual cues.
    const onVisualToggle = (e) => {
      // TODO: If we use a <span> instead of a <a> for the toggle, we don't
      // need to call these two methods.
      e.preventDefault();
      e.stopPropagation();
      this.have_visual_cues = !this.have_visual_cues;
      this.game.have_visual_cues = this.have_visual_cues;
      const action = this.have_visual_cues ? "remove" : "add";
      localStorage.setItem('have_visual_cues', this.have_visual_cues)
      visualToggle.classList[action]("disabled");
    };
    visualToggle.addEventListener("click", onVisualToggle, true);

    const resetButton = document.querySelector(".reset-button");
    const onReset = (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.clearProgress();
    }

    resetButton.addEventListener('click', onReset, true)
  }

    // Clear the current progress
    clearProgress() {
      if (typeof(Storage) !== 'undefined') {
        const confirm = window.confirm('Are you sure you want to clear your progress? This will restart your current game.');
        if (confirm) {
          localStorage.removeItem(this.course.storageKey);
          localStorage.removeItem('intro');
          window.location.reload();
        }
      }
    }

  init(params) {
    // Check if game should restart if resetting progress
    if (params && params.reset) {
      this.hasStarted = false;
      document.getElementById("button").style.display = "block";
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
      if (typeof Storage !== "undefined") {
        if (localStorage[this.course.storageKey]) {
          const saved = JSON.parse(
            localStorage.getItem(this.course.storageKey)
          );
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
    circle.drawCircle(
      0,
      0,
      !this.game.device.desktop
        ? config.title.mainFontSize * 3.5
        : config.title.mainFontSize * 2.5
    );
    circle.alpha = 0.4;
    circle.anchor.set(0.5, 0.5);
    circle.position.x = this.game.world.centerX;
    circle.position.y =
      this.game.world.centerY +
      (!this.game.device.desktop
        ? config.title.titleOffset
        : config.title.titleOffset * 0.7);
    circle.scale.x = 0;
    circle.scale.y = 0;
    circle.endFill();

    // Intro animation for circle
    this.game.add
      .tween(circle.scale)
      .to({ x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true, 300);
  }

  // Draws all the titles
  createTitles() {
    const titleText = "Morse\nTyping\nTrainer";
    let title = this.game.add.text(
      this.game.world.centerX,
      this.game.world.centerY +
        (!this.game.device.desktop
          ? config.title.titleOffset
          : config.title.titleOffset * 0.7),
      titleText,
      {
        align: "center",
      }
    );
    title.lineSpacing = -40;
    title.fill = "#F1E4D4";
    title.fontSize = !this.game.device.desktop
      ? config.title.mainFontSize
      : config.title.mainFontSize * 0.7;
    title.anchor.setTo(0.5);
    title.font = config.typography.font;

    const startText = config.GLOBALS.isTouch
      ? "Tap to Start"
      : "Press any button to Start";
    let startButton = this.game.add.text(
      this.game.world.centerX,
      this.game.world.centerY + config.title.startButtonOffset,
      startText,
      {
        align: "center",
      }
    );
    startButton.fontSize = config.title.startButtonSize;
    startButton.fill = "#F1E4D4";
    startButton.anchor.setTo(0.5);
    startButton.font = config.typography.font;
    // Reating animation for start button
    const startButtonTween = this.game.add
      .tween(startButton)
      .to({ alpha: 0.4 }, 600, "Linear", true, 0, -1);
    startButtonTween.yoyo(true, 0);
  }

  // Check if intro has been watched, if so, skip
  checkWatchedIntro() {
    return new Promise((resolve) => {
      if (typeof Storage !== "undefined") {
        if (localStorage.intro) {
          const saved = localStorage.getItem("intro");
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
        document.getElementById("button").style.display = "none";
        this.game.state.start(
          intro || this.game.device.iOS ? "game" : "intro",
          true,
          false,
          this.letterScoreDict
        );
      });
    }
  }
}

module.exports.TitleState = TitleState;
