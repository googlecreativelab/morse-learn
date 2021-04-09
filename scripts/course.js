class Course {

  constructor(config) {
    this.useArray = Array.isArray(config.letters);
    this.name = config.name;
    this.assets = (config.assets || '') + '/';
    this.storageKey = config.storageKey;
    this.headerSpacing = config.headerSpacing;
    this.letters = this.useArray ? config.letters : Object.values(config.letters);
    this.lettersToLearn = this.useArray ? config.letters : Object.keys(config.letters);
    this.letterNames = config.letters;
    this.words = config.words;
  }

  getLetterName(letter) {
    if (!this.useArray) {
      return this.letterNames[letter];
    }
    return letter;
  }

}

module.exports.Course = Course;
