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
import { Course } from './course';
import { SoundManager } from './sound-manager';

class App {

  constructor() {
    this.game = null;
    this.downEvent = null;
    this.modalShow = false;

    this.course = new Course(config.courses[config.course]);

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
  // TODO Figure out why this needs to return a promise even though there is no async code
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
          // document.getElementById('button').style.display = 'block';
          document.getElementById('overlay').style.display = 'block';
        }
      });
    } else {
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    }
  }

  create() {
    GameApp.enableLoadingModal(false)

    this.game.stage.backgroundColor = config.app.backgroundColor;
    this.game.stage.smoothed = config.app.smoothed;
    GameApp.determineScale();

    // Show about button
    document.getElementById('button').style.display = 'block';

    this.game.state.add('title', new TitleState(this.game, GameApp.course));
    this.game.state.add('intro', new IntroState(this.game));
    this.game.state.add('game', new GameState(this.game, GameApp.course));
    this.game.state.start('title');
  }

  preload() {
    GameApp.enableLoadingModal()

    // Images
    this.game.load.image('a', 'assets/images/final/A.png');
    this.game.load.image('b', 'assets/images/final/B.png');
    this.game.load.image('c', 'assets/images/final/C.png');
    this.game.load.image('d', 'assets/images/final/D.png');
    this.game.load.image('e', 'assets/images/final/E.png');
    this.game.load.image('f', 'assets/images/final/F.png');
    this.game.load.image('g', 'assets/images/final/G.png');
    this.game.load.image('h', 'assets/images/final/H.png');
    this.game.load.image('i', 'assets/images/final/I.png');
    this.game.load.image('j', 'assets/images/final/J.png');
    this.game.load.image('k', 'assets/images/final/K.png');
    this.game.load.image('l', 'assets/images/final/L.png');
    this.game.load.image('m', 'assets/images/final/M.png');
    this.game.load.image('n', 'assets/images/final/N.png');
    this.game.load.image('o', 'assets/images/final/O.png');
    this.game.load.image('p', 'assets/images/final/P.png');
    this.game.load.image('q', 'assets/images/final/Q.png');
    this.game.load.image('r', 'assets/images/final/R.png');
    this.game.load.image('s', 'assets/images/final/S.png');
    this.game.load.image('t', 'assets/images/final/T.png');
    this.game.load.image('u', 'assets/images/final/U.png');
    this.game.load.image('v', 'assets/images/final/V.png');
    this.game.load.image('w', 'assets/images/final/W.png');
    this.game.load.image('x', 'assets/images/final/X.png');
    this.game.load.image('y', 'assets/images/final/Y.png');
    this.game.load.image('z', 'assets/images/final/Z.png');


    this.game.load.image('close', 'assets/images/close.svg');
    this.game.load.image('badge', 'assets/images/badge.svg');

    // Video
    this.game.load.video('intro', 'assets/videos/intro.mp4');

    // Audio
    this.game.customSoundManager = new SoundManager()
    this.game.customSoundManager.createSound('period', '/assets/sounds/period')
    this.game.customSoundManager.createSound('dash', '/assets/sounds/dash')
    this.game.customSoundManager.createSound('dot', '/assets/sounds/dot')


    // letters + soundalike list
    let path = '/assets' + GameApp.course.assets;
    for (let letter of GameApp.course.letters) {
      this.game.load.image(letter, path + 'images/nohint.png');
      this.game.customSoundManager.createSound('letter-' + letter, path + 'sounds/' + letter)
      this.game.customSoundManager.createSound('soundalike-letter-' + letter, path + 'sounds/soundalikes-mw/' + letter)
    }
    // correct, wrong
    this.game.customSoundManager.createSound('correct', '/assets/sounds/correct');
    this.game.customSoundManager.createSound('wrong', '/assets/sounds/wrong');
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

  // show loading modal
  enableLoadingModal(show = true) {
    const modalId = 'loading-overlay'
    if (show) {
      document.getElementById(modalId).classList.add('open')
    } else {
      document.getElementById(modalId).classList.remove('open')
    }
  }
}

// Start App
const GameApp = new App();
GameApp.determineOrientation().then(() => {
  GameApp.startGameApp();
});
