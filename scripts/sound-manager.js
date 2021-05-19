const { Howl } = require('howler');

class SoundManager {
  constructor() {
    this.sounds = {};
  }

  createSound(name, path) {
    const newSound = new Howl({
      src: [path]
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
