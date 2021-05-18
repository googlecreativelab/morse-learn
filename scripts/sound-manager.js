class SoundManager {
  constructor() {
    this.sounds = {};
  }

  createSound(name, path, audioFormat = "audio/mp3") {
    const newSound = document.createElement("audio");
    var newSoundSource = document.createElement("source");
    newSoundSource.setAttribute("src", path);
    newSoundSource.setAttribute("type", audioFormat);
    newSound.id = name;
    newSound.style.position = "absolute";
    newSound.style.visibility = "hidden";
    newSound.appendChild(newSoundSource);
    document.body.appendChild(newSound);

    this.sounds[name] = newSound;
  }

  playSound(name) {
    this.sounds[name].currentTime = 0;
    this.sounds[name].play();
  }

  soundDuration(name) {
    const duration = this.sounds[name].duration;
    return duration;
  }

  stopSound(name) {
    this.sounds[name].pause();
  }
}

module.exports.SoundManager = SoundManager;
