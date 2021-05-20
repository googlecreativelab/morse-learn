const { Howl } = require('howler');

class SoundManager {
  constructor() {
    this.sounds = {};
  }

  createSound(name, path) {
    const newSound = new Howl({
      src: [`${path}.mp3`]
      // src: [ `${path}.m4a`,`${path}.mp3` ]
    });

    this.sounds[name] = newSound;
  }

  playSound(name) {
    this.sounds[name].play();
  }

  soundDuration(name) {
    const duration = this.sounds[name].duration();
    return duration;
  }

  stopSound(name) {
    this.sounds[name].stop();
  }
}

module.exports.SoundManager = SoundManager;
