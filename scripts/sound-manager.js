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
    this.sounds[name].play();
  }
}

module.exports.SoundManager = SoundManager;
