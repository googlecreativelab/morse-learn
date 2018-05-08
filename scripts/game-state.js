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

import { HeaderSpace } from './header-space';
import { GameSpace } from './game-space';
import { englishToMorse } from './morse-dictionary';

class GameState {

  constructor(game) {
    this.lettersToLearn = ['e', 't', 'a', 'i', 'm', 's', 'o', 'h', 'n', 'c', 'r', 'd', 'u', 'k', 'l', 'f', 'b', 'p', 'g', 'j', 'v', 'q', 'w', 'x', 'y', 'z'];
    this.letterScoreDict = {};
    this.morseDictionary = englishToMorse;
    this.header = null;
    this.gameSpace = null;
    this.game = game;
    // Setup sounds
    this.sounds = {
      period: this.game.add.audio('period'),
      dash: this.game.add.audio('dash')
    }
  }

  init(params) {
    this.letterScoreDict = params;
  }

  create() {
    this.gameSpace = new GameSpace(this.game);
    this.gameSpace.parent = this;
    this.gameSpace.create();

    // Keep gamespace under header space
    this.game.world.sendToBack(this.gameSpace.gameSpaceGroup);

    this.header = new HeaderSpace(this.game);
    this.header.parent = this;
    this.header.create();

    // Keep header space on top
    this.game.world.bringToTop(this.header.headerGroup);
  }
}

module.exports.GameState = GameState;
