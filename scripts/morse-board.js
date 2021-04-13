import { morseToEnglish } from "./morse-dictionary";

class MorseBoard {
  constructor(options) {
    this.timeout = null;
    this.morseDictionary = morseToEnglish;
    this.config = this.mergeSettings(options);
    this.game = options.game;
    this.create();
  }

  mergeSettings(options) {
    var settings = {
      autoCommit: true,
      debounce: 1e3,
      dashKeyMap: [
        189, // -
        173, // -
        75, // k
        191, // /
      ],
      dashSoundPath: "../assets/sounds/dash.mp3",
      dotKeyMap: [
        190, // .
        74 // j
      ],
      dotSoundPath: "../assets/sounds/dot.mp3",
      height: "25vh",
      notification: true,
      notificationDuration: 1e3,
      notificationStyle: "overlay",
      output: true,
      sounds: true,
      onCommit: function onCommit() {},
    };
    var userSttings = options;
    for (var attrname in userSttings) {
      settings[attrname] = userSttings[attrname];
    }
    return settings;
  }

  create() {
    this.background = document.getElementById("morseboard");
    this.background.style.display = "flex";
    this.background.style.height = this.config.height;

    this.output = document.getElementById("output");
    this.output.style.bottom = this.config.height;
    this.output.style.visibility = this.config.output ? "visible" : "hidden";
    this.output.style.pointerEvents = this.config.output ? "auto" : "none";
    this.output.setAttribute("readonly", "true");
    this.output.setAttribute("tabindex", "-1");

    this.buttonBox = document.getElementById("button-box");

    this.dotButton = document.getElementById("dot");
    this.dotButton.setAttribute("tabindex", "0");

    this.dashButton = document.getElementById("dash");
    this.dashButton.setAttribute("tabindex", "0");

    if (this.config.sounds && !this.detectIE()) {
      this.dotAudio = document.createElement("audio");
      var dotSource = document.createElement("source");
      dotSource.setAttribute("src", this.config.dotSoundPath);
      dotSource.setAttribute("type", "audio/mp3");
      this.dotAudio.id = "dotSound";
      this.dotAudio.style.position = "absolute";
      this.dotAudio.style.visibility = "hidden";
      this.dotAudio.appendChild(dotSource);
      document.body.appendChild(this.dotAudio);
      this.dashAudio = document.createElement("audio");
      var dashSource = document.createElement("source");
      dashSource.setAttribute("src", this.config.dashSoundPath);
      dashSource.setAttribute("type", "audio/mp3");
      this.dashAudio.id = "dashSound";
      this.dashAudio.style.position = "absolute";
      this.dashAudio.style.visibility = "hidden";
      this.dashAudio.appendChild(dashSource);
      document.body.appendChild(this.dashAudio);
    }

    window.addEventListener("keydown", this.onKeydown.bind(this), false);

    this.dotButton.addEventListener("click", this.onClick.bind(this), false);
    this.dashButton.addEventListener("click", this.onClick.bind(this), false);

    this.output.addEventListener("commit", this.commit.bind(this), false);
  }

  onKeydown(e) {
    var code = e.keyCode;
    if (
      this.config.dotKeyMap.indexOf(code) > -1 &&
      code !== 13 &&
      code !== 32
    ) {
      this.dotButton.click();
    } else if (
      this.config.dashKeyMap.indexOf(code) > -1 &&
      code !== 13 &&
      code !== 32
    ) {
      this.dashButton.click();
    }
    if (code === 13 && !this.config.autoCommit) {
      if (this.output.value && this.output.value !== null) {
        this.output.dispatchEvent(
          new CustomEvent("commit", {
            detail: {
              symbol: this.output.value,
              letter: this.morseDictionary[this.output.value],
            },
          })
        );
      } else {
        this.showNotification(null, true);
      }
    }
  }

  onClick(e) {
    if (this.config.sounds && !this.detectIE()) {
      this.dotAudio.currentTime = 0;
      this.dashAudio.currentTime = 0;
      this.dotAudio.pause();
      this.dashAudio.pause();
    }
    if (this.config.notificationStyle === "output") {
      if (this.outputStyleTimeout) {
        this.output.style.color = "#231F20";
        clearTimeout(this.outputStyleTimeout);
        clearTimeout(this.outputStyleHideTimeout);
        this.outputStyleHideTimeout = null;
        this.outputStyleTimeout = null;
        this.output.value = "";
      }
    }
    var button = e.target.id;
    if (button === "dot") {
      this.output.value += ".";
      if (this.config.sounds && !this.detectIE() && this.game.have_audio) {
        this.dotAudio.play();
      }
    } else if (button === "dash") {
      this.output.value += "-";
      if (this.config.sounds && !this.detectIE() && this.game.have_audio) {
        this.dashAudio.play();
      }
    }
    if (e && e.target) {
      e.target.style.boxShadow = "0px 2px 0px #A1A2A2";
      e.target.style.background = "#F7F7F7";
    }
    setTimeout(function () {
      if (e && e.target) {
        e.target.style.boxShadow = "0px 4px 0px #A1A2A2";
        e.target.style.background = "#FFFFFF";
      }
    }, 100);
    this.debounce();
  }

  debounce() {
    var _this = this;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(function () {
      if (_this.output.value && _this.output.value !== null) {
        var eventDetail = {
          symbol: _this.output.value,
          letter: _this.morseDictionary[_this.output.value],
        };
        if (_this.config.autoCommit) {
          if (typeof window.CustomEvent !== "function") {
            var _CustomEvent = function _CustomEvent(event, params) {
              params = params || {
                bubbles: false,
                cancelable: false,
                detail: undefined,
              };
              var evt = document.createEvent("CustomEvent");
              evt.initCustomEvent(
                event,
                params.bubbles,
                params.cancelable,
                params.detail
              );
              return evt;
            };
            _CustomEvent.prototype = window.Event.prototype;
            window.CustomEvent = _CustomEvent;
          }
          _this.output.dispatchEvent(
            new CustomEvent("commit", {
              detail: eventDetail,
            })
          );
        }
      }
      clearTimeout(_this.timeout);
    }, this.config.debounce);
  }

  commit(e) {
    var letter = e.detail.letter;
    if (this.config.notification) {
      if (letter) {
        this.showNotification(letter);
      } else {
        this.showNotification(null, true);
      }
    }
    this.output.value = "";
    this.config.onCommit.call(this, e.detail);
  }

  mute() {
    if (this.config.sounds && !this.detectIE()) {
      this.dotAudio.muted = true;
      this.dashAudio.muted = true;
    }
  }

  unmute() {
    if (this.config.sounds && !this.detectIE()) {
      this.dotAudio.muted = false;
      this.dashAudio.muted = false;
    }
  }

  showNotification(letter, wrong) {
    var _this2 = this;
    if (this.config.notificationStyle === "output") {
      this.outputStyleTimeout = setTimeout(function () {
        _this2.output.style.color = wrong
          ? "rgba(255, 65, 54, 0.8)"
          : "#231F20";
        _this2.output.value = wrong ? "∅" : letter;
        _this2.outputStyleHideTimeout = setTimeout(function () {
          _this2.output.value = "";
        }, _this2.config.debounce - 300);
      }, 0);
    } else {
      this.el = document.getElementById("notification");
      this.el.innerHTML =
        '<span style="display: inline-block; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); vertical-align: middle;">' +
        (wrong ? "&empty;" : letter) +
        "</span>";
      this.el.style.background = wrong
        ? "rgba(255, 65, 54, 0.8)"
        : "rgba(0, 0, 0, 0.7)";
      clearTimeout(this.fadeTimeout);
      var fadeOut = function fadeOut() {
        var el = _this2.el;
        el.style.opacity = 1;
        if (_this2.fadeTimeout) {
          (function fade() {
            if ((el.style.opacity -= 0.1) < 0) {
              el.style.display = "none";
            } else {
              requestAnimationFrame(fade);
            }
          })();
        }
      };
      var fadeIn = function fadeIn() {
        var el = _this2.el;
        el.style.opacity = 0;
        el.style.display = "inline-block";
        (function fade() {
          var val = parseFloat(el.style.opacity);
          if (!((val += 0.1) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
          }
        })();
      };
      fadeIn();
      this.fadeTimeout = setTimeout(fadeOut, this.config.notificationDuration);
    }
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeydown);
    this.dotButton.removeEventListener("click", this.onClick);
    this.dashButton.removeEventListener("click", this.onClick);
    this.output.removeEventListener("commit", this.commit);
    if (this.config.notification && this.el) {
      document.body.removeChild(this.el);
      if (this.fadeTimeout) {
        clearTimeout(this.fadeTimeout);
      }
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.dotAudio && this.dashAudio) {
      document.body.removeChild(this.dotAudio);
      document.body.removeChild(this.dashAudio);
    }
    if (this.buttonBox) {
      this.buttonBox.removeChild(this.dotButton);
      this.buttonBox.removeChild(this.dashButton);
    }
    if (this.output && this.background) {
      this.background.removeChild(this.output);
    }
    document.body.removeChild(this.background);
  }

  detectIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var trident = ua.indexOf("Trident/");
    var edge = ua.indexOf("Edge/");
    if (msie > 0 || trident > 0 || edge > 0) {
      return true;
    }
    return false;
  }
}

module.exports.MorseBoard = MorseBoard;
