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

class IntroState {

  constructor(game) {
    this.hasStarted = false;
    this.letterScoreDict = {};
    this.game = game;
  }

  init(params) {
    this.letterScoreDict = params;
  }

  create() {
    this.playVideo();
    this.createShapes();
  }

  playVideo() {
    const video = this.game.add.video('intro');
    video.mute = true;
    video.addToWorld(
      window.innerWidth * 0.5, // x => centre x coord
      window.innerHeight * 0.5, // y => centre y coord
      0.5, // xAnchor => centre
      0.5, // yAnchor => centre
      0.5, // 0.5 x scale
      0.5 // 0.5 y scale
    );
    
    video.unlock();
    video.play();

    const videoOnComplete = new Phaser.Signal();
    video.onComplete = videoOnComplete;
    videoOnComplete.add(() => {
      this.skipTextGroup.visible = false;
      this.skipVideoButton.width = video.width;
      this.skipVideoButton.height = video.height;
      this.skipVideoButtonGroup.width = video.width;
      this.skipVideoButtonGroup.height = video.height;

      if (this.game.state.getCurrentState().key === 'intro') {
        document.addEventListener('keydown', () => {
          if (!this.hasStarted) {
            this.start();
            this.hasStarted = true;
          }
        }, { once: true });
      }
    });
  }

  createShapes() {
    let rect = this.game.add.graphics(0, 0);
    rect.beginFill(0xef4136, 1);
    rect.drawRect(0, 0, this.game.world.width, this.game.world.height, 5000);
    rect.endFill();

    this.rectGroup = this.game.add.group();
    this.rectGroup.add(rect);
    this.game.world.sendToBack(this.rectGroup);

    let skipText = this.game.add.text(this.game.world.width - 80, 60, 'Skip', {
      align: 'center'
    });
    skipText.fill = '#000000';
    skipText.fontSize = 35;
    skipText.alpha = 0.4;
    skipText.anchor.setTo(0.5);
    skipText.font = config.typography.font;

    this.skipTextGroup = this.game.add.group();
    this.skipTextGroup.add(skipText);
    this.game.world.bringToTop(this.skipTextGroup);

    // About button instance
    this.skipVideoButton = this.game.add.button(this.game.world.width - 70, skipText.position.y, '', () => {
      this.start();
    });
    this.skipVideoButton.width = skipText.width + 60;
    this.skipVideoButton.height = skipText.height + 60;
    this.skipVideoButton.anchor.setTo(0.5);
    this.skipVideoButton.alpha = 0;

    // Move button above all things
    this.skipVideoButtonGroup = this.game.add.group();
    this.skipVideoButtonGroup.add(this.skipVideoButton);
    this.game.world.bringToTop(this.skipVideoButtonGroup);
  }

  start() {
    this.hasStarted = true;
    this.game.state.start('game', true, false, this.letterScoreDict);
    document.removeEventListener('textInput', () => {
      this.start();
    });
  }
}

module.exports.IntroState = IntroState;
