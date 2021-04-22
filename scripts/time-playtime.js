// Browser Support stuff
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") {
  // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

const TIMEKEY = "timePlayedGame";

// There is some potential for error with this approach.
// Everytime we close the tab we could lose 4.9s of playtime.
// But we dont need this data to be super accurate
const timePlaytime = () => {
  // Warn if the browser doesn't support addEventListener or the Page Visibility API
  if (
    typeof document.addEventListener === "undefined" ||
    hidden === undefined
  ) {
    console.warn("Cannot celloct metrics in this browser");
    return;
  }

  const UPDATE_INTERVAL = 5000;
  const intervalFunction = () => {
    const currentPlaytime = localStorage.getItem(TIMEKEY) || 0;
    const newPlaytime = parseInt(currentPlaytime) + UPDATE_INTERVAL;
    localStorage.setItem(TIMEKEY, newPlaytime);
    console.log('Updated playtime of: ', newPlaytime);
  };
  let interval = setInterval(intervalFunction, UPDATE_INTERVAL);

  // If the page is hidden, pause the video;
  // if the page is shown, play the video
  const handleVisibilityChange = () => {
    if (document[hidden]) {
      // Page is hidden
      clearInterval(interval);
      console.log('Hidden Page')
    } else {
      // Page is active
      console.log('Active Page')
      interval = setInterval(intervalFunction, UPDATE_INTERVAL);
    }
  };

  // Handle page visibility change
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
};

module.exports = { timePlaytime, TIMEKEY };
