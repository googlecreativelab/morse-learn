
import { morseToEnglish } from './morse-dictionary';

class MorseBoard {
  constructor(options) {
    this.timeout = null;
    this.morseDictionary = morseToEnglish;
    this.config = this.mergeSettings(options);
    this.create();
  }

  mergeSettings(options) {
    var settings = {
      autoCommit: true,
      debounce: 1e3,
      dashKeyMap: [189, 173, 16, 191],
      dashSoundPath: "../assets/dash.mp3",
      dotKeyMap: [190],
      dotSoundPath: "../assets/dot.mp3",
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
    this.background = document.createElement("div");
    this.background.id = "morseboard";
    this.background.style.alignItems = "stretch";
    this.background.style.background = "#E6E7E8";
    this.background.style.bottom = "0";
    this.background.style.display = "flex";
    this.background.style.flexDirection = "column";
    this.background.style.height = this.config.height;
    this.background.style.left = "0";
    this.background.style.position = "fixed";
    this.background.style.width = "100%";
    document.body.appendChild(this.background);
    this.output = document.createElement("input");
    this.output.id = "output";
    this.output.style.appearance = "none";
    this.output.style.background = "#E6E7E8";
    this.output.style.border = "none";
    this.output.style.bottom = this.config.height;
    this.output.style.color = "#231F20";
    this.output.style.fontSize = "4vh";
    this.output.style.fontWeight = "700";
    this.output.style.padding = "5px 0 0";
    this.output.style.textAlign = "center";
    this.output.style.textTransform = "uppercase";
    this.output.style.width = "100%";
    this.output.style.visibility = this.config.output ? "visible" : "hidden";
    this.output.style.verticalAlign = "middle";
    this.output.style.pointerEvents = this.config.output ? "auto" : "none";
    this.output.setAttribute("readonly", "true");
    this.output.setAttribute("tabindex", "-1");
    this.background.appendChild(this.output);
    this.buttonBox = document.createElement("div");
    this.buttonBox.id = "button-box";
    this.buttonBox.style.background = "#E6E7E8";
    this.buttonBox.style.alignItems = "flex-end";
    this.buttonBox.style.justifyContent = "center";
    this.buttonBox.style.display = "flex";
    this.buttonBox.style.height = "100%";
    this.buttonBox.style.padding = "15px 20px 25px 20px";
    this.buttonBox.style.width = "calc(100% - 40px)";
    this.background.appendChild(this.buttonBox);
    this.dotButton = document.createElement("button");
    this.dashButton = document.createElement("button");
    this.dotButton.id = "dot";
    this.dotButton.innerHTML =
      '<span style="display: block; width: 36px; height: 36px; background: #231F20; border-radius: 50%; pointer-events: none;"></span>';
    this.dotButton.style.appearance = "none";
    this.dotButton.style.alignItems = "center";
    this.dotButton.style.background = "#fff";
    this.dotButton.style.border = "none";
    this.dotButton.style.borderRadius = "10px";
    this.dotButton.style.boxShadow = "0px 4px 0px #A1A2A2";
    this.dotButton.style.display = "flex";
    this.dotButton.style.justifyContent = "center";
    this.dotButton.style.height = "100%";
    this.dotButton.style.fontSize = "7vh";
    this.dotButton.style.outline = "none";
    this.dotButton.style.marginRight = "10px";
    this.dotButton.style.maxWidth = "100%";
    this.dotButton.style.width = "250px";
    this.dotButton.setAttribute("tabindex", "0");
    this.dashButton.id = "dash";
    this.dashButton.innerHTML =
      '<span style="display: block; width: 55px; height: 23px; background: #231F20; pointer-events: none;"></span>';
    this.dashButton.style.appearance = "none";
    this.dashButton.style.background = "#fff";
    this.dashButton.style.border = "none";
    this.dashButton.style.borderRadius = "10px";
    this.dashButton.style.boxShadow = "0px 4px 0px #A1A2A2";
    this.dashButton.style.alignItems = "center";
    this.dashButton.style.display = "flex";
    this.dashButton.style.justifyContent = "center";
    this.dashButton.style.height = "100%";
    this.dashButton.style.fontSize = "7vh";
    this.dashButton.style.marginLeft = "10px";
    this.dashButton.style.maxWidth = "100%";
    this.dashButton.style.outline = "none";
    this.dashButton.style.width = "250px";
    this.dashButton.setAttribute("tabindex", "0");
    this.buttonBox.appendChild(this.dotButton);
    this.buttonBox.appendChild(this.dashButton);
    if (
      this.config.notification &&
      this.config.notificationStyle === "overlay"
    ) {
      var notification = document.createElement("div");
      notification.id = "notification";
      notification.style.background = "rgba(0, 0, 0, 0.7)";
      notification.style.borderRadius = "10px";
      notification.style.color = "rgba(255, 255, 255, 1)";
      notification.style.height = !this.detectIE() ? "13vh" : "120px";
      notification.style.display = "none";
      notification.style.fontFamily =
        "Helvetica Neue, Helvetica, Arial, sans-serif";
      notification.style.fontWeight = "700";
      notification.style.fontSize = !this.detectIE() ? "10vh" : "75px";
      notification.style.lineHeight = "normal";
      notification.style.maxHeight = "150px";
      notification.style.maxWidth = "150px";
      notification.style.minHeight = "50px";
      notification.style.minWidth = "50px";
      notification.style.padding = "25px";
      notification.style.position = "absolute";
      notification.style.transform = "translate3d(-50%, -60%, 0)";
      notification.style.left = "50%";
      notification.style.textAlign = "center";
      notification.style.textTransform = "uppercase";
      notification.style.top = "60%";
      notification.style.verticalAlign = "middle";
      notification.style.width = !this.detectIE() ? "13vh" : "120px";
      document.body.appendChild(notification);
    }
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
      this.dotAudio.pause();
      this.dotAudio.currentTime = 0;
      this.dashAudio.pause();
      this.dashAudio.currentTime = 0;
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
      this.output.value += "•";
      if (this.config.sounds && !this.detectIE()) {
        this.dotAudio.play();
      }
    } else if (button === "dash") {
      this.output.value += "-";
      if (this.config.sounds && !this.detectIE()) {
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
      if (
        letter &&
        (typeof letter === "undefined" ? "undefined" : _typeof(letter)) !==
          undefined
      ) {
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

module.exports.MorseBoard = MorseBoard