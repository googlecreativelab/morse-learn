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
import 'babel-polyfill';
import { TitleState } from './title-state';
import { IntroState } from './intro-state';
import { GameState } from './game-state';
import * as config from './config';
import { getClientHeight } from './util'

class App {

  constructor() {
    this.game = null;
    this.downEvent = null;
    this.modalShow = false;

    // Handle clicking of modal
    document.getElementById('button').addEventListener('click', () => {
      this.modalShow = this.modalShow ? false : true;
      this.showModal();
    }, false);

    // Deeplinking to /#about
    if (window.location.hash === '#about') {
      this.modalShow = true;
      this.showModal();
    }
  }

  startGameApp() {
    this.game = new Phaser.Game('100%', config.GLOBALS.appHeight, Phaser.CANVAS, '', {
      resolution: config.GLOBALS.devicePixelRatio,
      preload: this.preload,
      create: this.create
    });
  }

  // Determines starting device orientation
  determineOrientation() {
    let bodyHeight = getClientHeight();

    return new Promise((resolve) => {
      if (config.GLOBALS.isLandscape && screen.width <= 768) {
        if (screen.width < 768) {
          bodyHeight = document.body.clientWidth * 1.5;
        } else if (config.GLOBALS.devicePixelRatio > 3) {
          bodyHeight = document.body.clientWidth * 2;
        } else {
          bodyHeight = document.body.clientWidth;
        }
      }

      config.GLOBALS.appHeight = bodyHeight;
      resolve();
    });
  }

  // Resize scaling, based on device, force orientation
  determineScale() {
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;

    // Only if mobile
    if (!this.game.device.desktop) {
      this.game.scale.forceOrientation(false, true);

      // Landscape orientation
      this.game.scale.enterIncorrectOrientation.add(() => {
        this.game.world.alpha = 0;
        document.getElementById('landscape').style.display = 'block';

        if (this.game.state.current === 'title') {
          document.getElementById('button').style.display = 'none';
          document.getElementById('overlay').style.display = 'none';
        }
      });

      // Portrait orientation
      this.game.scale.leaveIncorrectOrientation.add(() => {
        this.game.world.alpha = 1;
        document.getElementById('landscape').style.display = 'none';

        if (this.game.state.current === 'title') {
          document.getElementById('button').style.display = 'block';
          document.getElementById('overlay').style.display = 'block';
        }
      });
    } else {
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    }
  }

  create() {
    this.game.stage.backgroundColor = config.app.backgroundColor;
    this.game.stage.smoothed = config.app.smoothed;
    GameApp.determineScale();

    // Show about button
    document.getElementById('button').style.display = 'block';

    this.game.state.add('title', new TitleState(this.game));
    this.game.state.add('intro', new IntroState(this.game));
    this.game.state.add('game', new GameState(this.game));
    this.game.state.start('title');
  }

  preload() {
    // Images
    this.game.load.image('a', 'assets/images/png/Archery.png');
    this.game.load.image('b', 'assets/images/png/Banjo.png');
    this.game.load.image('c', 'assets/images/png/Candy.png');
    this.game.load.image('d', 'assets/images/png/Dog.png');
    this.game.load.image('e', 'assets/images/png/Eye.png');
    this.game.load.image('f', 'assets/images/png/Firetruck.png');
    this.game.load.image('g', 'assets/images/png/Giraffe.png');
    this.game.load.image('h', 'assets/images/png/Hippo.png');
    this.game.load.image('i', 'assets/images/png/Insect.png');
    this.game.load.image('j', 'assets/images/png/Jet.png');
    this.game.load.image('k', 'assets/images/png/Kite.png');
    this.game.load.image('l', 'assets/images/png/Laboratory.png');
    this.game.load.image('m', 'assets/images/png/Mustache.png');
    this.game.load.image('n', 'assets/images/png/Net.png');
    this.game.load.image('o', 'assets/images/png/Orchestra.png');
    this.game.load.image('p', 'assets/images/png/Paddle.png');
    this.game.load.image('q', 'assets/images/png/Quarterback.png');
    this.game.load.image('r', 'assets/images/png/Robot.png');
    this.game.load.image('s', 'assets/images/png/Submarine.png');
    this.game.load.image('t', 'assets/images/png/Tape.png');
    this.game.load.image('u', 'assets/images/png/Unicorn.png');
    this.game.load.image('v', 'assets/images/png/Vacuum.png');
    this.game.load.image('w', 'assets/images/png/Wand.png');
    this.game.load.image('x', 'assets/images/png/X-ray.png');
    this.game.load.image('y', 'assets/images/png/Yard.png');
    this.game.load.image('z', 'assets/images/png/Zebra.png');
    this.game.load.image('close', 'assets/images/close.svg');
    this.game.load.image('badge', 'assets/images/badge.svg');

    // Video
    this.game.load.video('intro', 'assets/videos/intro.mp4');

    // Audio
    this.game.load.audio('period', 'assets/sounds/period.mp3');
    this.game.load.audio('dash', 'assets/sounds/dash.mp3');

    // letters + soundalike list
    for (let letter of config.letters) {
      this.game.load.audio('letter-' + letter, 'assets/sounds/' + letter + '.mp3');
      this.game.load.audio('soundalike-letter-' + letter, 'assets/sounds/soundalikes-mw/' + letter + '.mp3');
    }
    // correct, wrong
    this.game.load.audio('correct', 'assets/sounds/correct.mp3');
    this.game.load.audio('wrong', 'assets/sounds/wrong.mp3');
  }

  // Show about modal
  showModal() {
    if (this.modalShow) {
      window.location.hash = '#about';
      document.getElementById('button').innerHTML = '<img src="assets/images/close.svg">';
      document.getElementById('overlay').classList.add('open');
    } else {
      window.location.hash = '';
      document.getElementById('button').innerHTML = '?';
      document.getElementById('overlay').classList.remove('open');
    }
  }
}

// Start App
const GameApp = new App();
GameApp.determineOrientation().then(() => {
  GameApp.startGameApp();
});
