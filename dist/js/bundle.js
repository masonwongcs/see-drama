(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const loginWithPopup = selector => {
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function () {
    // Existing and future Auth states are now persisted in the current
    // session only. Closing the window would clear any existing state even
    // if a user forgets to sign out.
    // ...
    // New sign-in will be persisted with session persistence.
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken; // The signed-in user info.

      var user = result.user;
      console.log(user);
      selector.css("background-image", `url(${user.photoURL})`).addClass("login"); // ...
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message; // The email of the user's account used.

      var email = error.email; // The firebase.auth.AuthCredential type that was used.

      var credential = error.credential; // ...
    });
  }).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
  });
};

const checkLogin = selector => {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      console.log(user);
      selector.css("background-image", `url(${user.photoURL})`).parents(".login-wrapper").addClass("login");
    } else {// No user is signed in.
    }
  });
};

const logout = selector => {
  firebase.auth().signOut().then(function () {
    // Sign-out successful.
    selector.css("background-image", "").parents(".login-wrapper").removeClass("login");
  }, function (error) {
    // An error happened.
    console.log(error);
  });
};

const setVideoData = (uuid, episodeObj) => {
  // Get a reference to the database service
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      var userId = user.uid;
      var database = firebase.database();
      database.ref("users/" + userId).update({
        [uuid]: episodeObj
      });
    } else {
      // No user is signed in.
      Lockr.set(uuid, episodeObj);
    }
  });
};

const getVideoTime = (uuid, callback) => {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      var userId = user.uid;
      var database = firebase.database();
      var users = database.ref("users/" + userId + "/" + uuid);
      users.once("value", function (snapshot) {
        // console.log(snapshot.val());
        if (callback) {
          callback(snapshot.val());
        }
      });
    } else {
      // No user is signed in.
      if (callback) {
        callback(Lockr.get(uuid));
      }
    }
  });
};

module.exports = {
  loginWithPopup: loginWithPopup,
  checkLogin: checkLogin,
  logout: logout,
  setVideoData: setVideoData,
  getVideoTime: getVideoTime
};

},{}],2:[function(require,module,exports){
const axios = require("axios");

const firebase = require("./firebase");

const videoPlayer = require("./video");

let carousel;
videoPlayer.init();

loadDramaSeries = async () => {
  let resAll = await axios.get("/api/list/all");

  if (resAll.status === 200) {
    if (resAll.data.length !== 0) {
      // let dramaListWrapper = $(`<div class="drama-list-wrapper"></div>`);
      let dramaListWrapper = $(".drama-list-wrapper");
      let totalIndex = resAll.data.length;
      resAll.data.forEach(async (value, index) => {
        console.log(value);
        let currentTitle = value.title; // let res = await axios.get("/api/drama/?" + value.url + "&size=20");

        let dramaTypeList = Object.values(value)[1];
        let firstImage = Object.values(value)[1][0].image;

        if (index === 0) {
          dramaListWrapper.prepend($(`<div class="bg-image" style="background-image: url(${firstImage.split("?")[1].replace("src=", "").replace("&w=200&h=300", "")})"></div>`));
        } // if (res.status === 200) {
        //   console.log(dramaTypeList);


        let dramaList = $(`<div class="drama-list"></div>`);
        let dramaListItem = $(`<div class="drama-list-item"></div>`);
        dramaTypeList.forEach(function (value, index) {
          let dramaItemTitle = value.title.trim().split("-");
          let dramaTitleEN = dramaItemTitle[0];
          let dramaTitleCN = dramaItemTitle[1];
          let dramaItem = `
            <a
              href="/episode?${value.url}"
              data-url="/api/episode?${value.url}"
              data-img="${value.image}"
              data-title-en="${dramaTitleEN ? dramaTitleEN : ""}"
              data-title-cn="${dramaTitleCN ? dramaTitleCN : ""}"
              style="background-image: url(${value.image})"
              class="drama-item carousel-cell"
            >
              <h3 class="title">
                ${dramaTitleEN ? dramaTitleEN : ""}${dramaTitleCN ? `<br />` : ""}${dramaTitleCN ? dramaTitleCN : ""}
              </h3>
            </a>
          `;
          dramaList.append(dramaItem);
        });
        dramaListItem.append($(`
              <h1 class="drama-title">
                ${currentTitle}<a
                  class="see-more"
                  href="${"/drama?" + value.url}"
                >See more&nbsp;<i class="fas fa-chevron-right right-icon"></i></a>
              </h1>
            `));
        dramaListItem.append(dramaList);
        dramaListItem.append($(`<div class="episode-wrapper"></div>`));
        dramaListWrapper.append(dramaListItem); // }
        // });
        // $("body")
        //   .append(dramaListWrapper)
        //   .ready(function() {
        //     console.log("ready");
        //     // carousel.on('dragStart.flickity', () => carousel.find('.slide').css('pointer-events', 'none'));
        //     // carousel.on('dragEnd.flickity', () => carousel.find('.slide').css('pointer-events', 'all'));
        //   });

        console.log(index, totalIndex);

        if (index === totalIndex - 1) {
          let carousel = $(".drama-list").flickity({
            // options
            contain: true,
            // freeScroll: true,
            wrapAround: true,
            pageDots: false
          });
          $(".placeholder").addClass("ready");
          setTimeout(function () {
            $(".placeholder").remove();
          }, 900);
        }
      });
    } else {
      let res = await axios.get("/api/list");

      if (res.status === 200) {
        let dramaListWrapper = $(`<div class="drama-list-wrapper"></div>`);
        let totalIndex = res.data.length;
        res.data.forEach(async (value, index) => {
          let currentTitle = value.title;
          let res = await axios.get("/api/drama/?" + value.url + "&size=20");

          if (index === 0) {
            $("body").prepend($(`<div class="bg-image" style="background-image: url(${res.data[0].image.split("?")[1].replace("src=", "").replace("&w=200&h=300", "")})"></div>`));
          }

          if (res.status === 200) {
            console.log(res.data);
            let dramaList = $(`<div class="drama-list"></div>`);
            res.data.forEach(function (value, index) {
              let dramaItemTitle = value.title.trim().split("-");
              let dramaTitleEN = dramaItemTitle[0];
              let dramaTitleCN = dramaItemTitle[1];
              let dramaItem = `
            <a
              href="/episode?${value.url}"
              data-url="/api/episode?${value.url}"
              data-img="${value.image}"
              data-title-en="${dramaTitleEN ? dramaTitleEN : ""}"
              data-title-cn="${dramaTitleCN ? dramaTitleCN : ""}"
              style="background-image: url(${value.image})"
              class="drama-item carousel-cell"
            >
              <h3 class="title">
                ${dramaTitleEN ? dramaTitleEN : ""}${dramaTitleCN ? `<br />` : ""}${dramaTitleCN ? dramaTitleCN : ""}
              </h3>
            </a>
          `;
              dramaList.append(dramaItem);
            });
            dramaListWrapper.append($(`
              <h1 class="drama-title">
                ${currentTitle}<a
                  class="see-more"
                  href="${"/drama?" + value.url}"
                >See more</a>
              </h1>
            `));
            dramaListWrapper.append(dramaList);
            dramaListWrapper.append($(`<div class="episode-wrapper"></div>`));
          } // });


          $("body").append(dramaListWrapper).ready(function () {
            console.log("ready"); // carousel.on('dragStart.flickity', () => carousel.find('.slide').css('pointer-events', 'none'));
            // carousel.on('dragEnd.flickity', () => carousel.find('.slide').css('pointer-events', 'all'));
          });
          console.log(index, totalIndex); // if (index === totalIndex - 1) {

          carousel = $(".drama-list").flickity({
            // options
            contain: true,
            // freeScroll: true,
            wrapAround: true,
            pageDots: false
          });
          $(".placeholder").addClass("ready");
          setTimeout(function () {
            $(".placeholder").remove();
          }, 900); // }
        });
      }
    }
  }
};

loadEpisodes = async url => {
  let res = await axios.get(url);
  return res.data;
}; // getEpisode = async () => {
//   const currDrama = $(this).data("url");
//   let episodes = await loadEpisodes(currDrama);
//   let episodeList = $(`<div class="episode-list"></div>`);
//   episodes.forEach(function(value, index) {
//     let episodeItem = $(
//       `<a href="/video?${value.url}" class="episode-item"></a>`
//     );
//     episodeItem.text(index + 1);
//     episodeList.append(episodeItem);
//   });
//   $(".episode-wrapper")
//     .append(episodeList)
//     .slideDown();
// };


let isFetching = false;
$(document).ready(function () {
  if (location.pathname === "/" || location.pathname === "/drama" || location.pathname === "/search") {
    if (location.pathname === "/") {
      loadDramaSeries();
    }

    if ($(".video-player").length !== 0) {// videoPlayer.init();
    }

    console.log(firebase.checkLogin($(".login-btn")));
    $(".login-btn").click(function (e) {
      e.preventDefault();
      var that = $(this);
      firebase.loginWithPopup(that);
    });
    $(".login-wrapper .logout").click(function (e) {
      e.preventDefault();
      firebase.logout($(".login-btn"));
    });
    $(document).on("click", ".drama-item", async function (e) {
      e.preventDefault();

      if (!isFetching) {
        $(this).addClass("active");
        $(".drama-item").not($(this)).removeClass("active");
        isFetching = true;
        $(".drama-list").removeClass("active");
        $(".drama-list-item").removeClass("active");
        setTimeout(function () {
          $(".episode-wrapper").empty();
        }, 400); //Slide down the episode container
        // if (location.pathname === "/") {
        //   $(this)
        //     .closest(".drama-list")
        //     .addClass("active")
        //     .next(".episode-wrapper")
        //     .slideDown();
        // } else {
        //   $(this)
        //     .closest(".drama-list")
        //     .addClass("active")
        //     .next(".episode-wrapper")
        //     .fadeIn();
        // }

        const currDrama = $(this).data("url");
        const currDramaBgStyle = $(this).data("img").split("?")[1].replace("src=", "").replace("&w=200&h=300", "");
        const dramaTitleCN = $(this).data("title-cn");
        const dramaTitleEN = $(this).data("title-en");
        let episodeContainer = $(`<div class="episode-container"></div>`);
        let episodes = await loadEpisodes(currDrama);
        let episodePoster = $(`<div class="episode-poster" style="background-image: url(${currDramaBgStyle})"></div>`);
        let episodeList = $(`<div class="episode-list"></div>`);
        episodes.forEach(function (value, index) {
          let uuid = value.url;
          let percentage = 0;
          firebase.getVideoTime(uuid, function (time) {
            if (time) {
              percentage = time.percentage;
            }

            let episodeItem = $(`
              <a
                href="/video?${value.url}"
                class="episode-item"
                data-video="/video?${value.url}"
                data-uuid="${uuid}"
                ></a>
            `); // episodeItem.text(index + 1);

            episodeItem.text(value.title);
            episodeItem.append($(`<div class="data-percentage" style="width: ${percentage}%"></div>`));
            episodeList.append(episodeItem);
          });
        });
        episodeContainer.append($(` <h3 class="title">
                ${dramaTitleEN ? dramaTitleEN : ""}${dramaTitleCN ? `<br />` : ""}${dramaTitleCN ? dramaTitleCN : ""}
              </h3>`));
        episodeContainer.append(episodeList);
        episodeContainer.append(episodePoster);
        episodeContainer.append($(`<a class="close" href="#!"><i class="fas fa-times"></i></a>`));
        $(".drama-item").not($(this)).removeClass("active");

        if (location.pathname === "/") {
          $(this).closest(".drama-list-item").addClass("active");
          $(this).closest(".drama-list").addClass("active").next(".episode-wrapper").append(episodeContainer); // .slideDown();
        } else {
          $(this).closest(".drama-list").addClass("active").next(".episode-wrapper").append(episodeContainer);
          $("body").addClass("fixed"); // .fadeIn();
        }

        $(document).on("click", ".episode-wrapper .close", function (e) {
          e.preventDefault();
          $(".drama-list").removeClass("active");
          $(".drama-list-item").removeClass("active");
          setTimeout(function () {
            if (location.pathname === "/") {
              $(".episode-wrapper") // .slideUp()
              .empty();
            } else {
              $(".episode-wrapper") // .fadeOut()
              .empty();
              $("body").removeClass("fixed");
            }
          }, 400);
          $(".drama-item").removeClass("active");
        });
        isFetching = false;
      }
    });
    $(document).on("click", ".episode-item", function (e) {
      e.preventDefault();
      $(".videoLoader").attr("src", $(this).data("video")).fadeIn();
    });
  }

  window.addEventListener("message", function (e) {
    console.log(e);
    var jsonData = JSON.parse(e.data);
    var uuid = jsonData.uuid;
    var percentage = jsonData.percentage;

    if (jsonData.action === "close") {
      $(".videoLoader").removeAttr("src").fadeOut();
    }

    if (jsonData.percentage) {
      $('[data-uuid="' + uuid + '"] .data-percentage').css("width", percentage + "%");
    }
  });
  $(window).on("scroll", function (e) {
    let top = $("header").offset().top;

    if (location.pathname !== "/") {
      $(".episode-wrapper").css("top", $("header").offset().top + "px");
    } else {
      if (top > 30) {
        $("header").addClass("visible");
      } else {
        $("header").removeClass("visible");
      }
    }
  });
});

},{"./firebase":1,"./video":3,"axios":4}],3:[function(require,module,exports){
const firebase = require("./firebase");

const init = () => {
  window.videoPlayerClose = function (uuid) {
    // const uuid = "!{uuid}";
    let percentage = 100;
    firebase.getVideoTime(uuid, function (time) {
      if (time) {
        percentage = time.percentage;
      }

      var episodeItemObj = {
        action: "close",
        uuid: uuid,
        percentage: percentage
      };
      window.top.postMessage(JSON.stringify(episodeItemObj), "*");
    });
  };

  window.videoPlayer = async function (video, uuid) {
    // console.log(video, uuid);
    if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
      $("#player source").attr("src", video[1].url);
    } else {
      const player = new Plyr("#player");
      var playedTime = 0;
      let time = await firebase.getVideoTime(uuid, function (time) {
        console.log(time);

        if (time) {
          playedTime = time.currentTime;
          console.log(time); // player.currentTime = playedTime;
        }

        player.source = {
          type: "video",
          title: "Example title",
          currentTime: 200,
          sources: [{
            src: video[0].url,
            type: "video/mp4",
            size: 360
          }, {
            src: video[1].url,
            type: "video/mp4",
            size: 720
          }]
        }; // player.on('loadedmetadata', function () {
        //     player.currentTime(100);
        // });

        var getTime = false;
        player.on("ready", function () {
          console.log("currentTime:", player.currentTime);
          var forwardInterval = setInterval(function () {
            if (player.currentTime !== playedTime) {
              player.currentTime = playedTime;
            } else {
              clearInterval(forwardInterval);
              getTime = true;
            }
          }, 200);
          console.log("forward currentTime:", player.currentTime);
        });
        setTimeout(function () {
          player.play();
        }, 1000);
        player.on("play", function () {
          setTimeout(function () {
            setInterval(function () {
              if (getTime) {
                var currentTime = player.currentTime;
                var duration = player.duration; // console.log(currentTime, duration)

                var episodeObj = {
                  currentTime: currentTime,
                  percentage: currentTime / duration * 100
                };
                firebase.setVideoData(uuid, episodeObj);
              }
            }, 1000);
          }, 2000);
        });
        var timer;
        var hidding = false;
        $(function () {
          $(".plyr").mousemove(function () {
            if (hidding) {
              hidding = false;
              return;
            }

            if (timer) {
              clearTimeout(timer);
              timer = 0;
            }

            $(".plyr__video-wrapper").css({
              cursor: "pointer"
            });
            $(".close-wrapper").removeClass("hide");
            timer = setTimeout(function () {
              hidding = true;
              $(".plyr__video-wrapper").css({
                cursor: "none"
              });
              $(".close-wrapper").addClass("hide");
            }, 2000);
          });
        });
      });
    }
  };
};

module.exports = {
  init: init
};

},{"./firebase":1}],4:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":6}],5:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || require('./../helpers/btoa');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/axios/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = require('./../helpers/cookies');

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

}).call(this,require('_process'))

},{"../core/createError":12,"./../core/settle":15,"./../helpers/btoa":19,"./../helpers/buildURL":20,"./../helpers/cookies":22,"./../helpers/isURLSameOrigin":24,"./../helpers/parseHeaders":26,"./../utils":28,"_process":30}],6:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":7,"./cancel/CancelToken":8,"./cancel/isCancel":9,"./core/Axios":10,"./defaults":17,"./helpers/bind":18,"./helpers/spread":27,"./utils":28}],7:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],8:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":7}],9:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],10:[function(require,module,exports){
'use strict';

var defaults = require('./../defaults');
var utils = require('./../utils');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, {method: 'get'}, this.defaults, config);
  config.method = config.method.toLowerCase();

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"./../defaults":17,"./../utils":28,"./InterceptorManager":11,"./dispatchRequest":13}],11:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":28}],12:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":14}],13:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":9,"../defaults":17,"./../helpers/combineURLs":21,"./../helpers/isAbsoluteURL":23,"./../utils":28,"./transformData":16}],14:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};

},{}],15:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":12}],16:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":28}],17:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this,require('_process'))

},{"./adapters/http":5,"./adapters/xhr":5,"./helpers/normalizeHeaderName":25,"./utils":28,"_process":30}],18:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],19:[function(require,module,exports){
'use strict';

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;

},{}],20:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":28}],21:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],22:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

},{"./../utils":28}],23:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],24:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

},{"./../utils":28}],25:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":28}],26:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

},{"./../utils":28}],27:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],28:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');
var isBuffer = require('is-buffer');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

},{"./helpers/bind":18,"is-buffer":29}],29:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],30:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvZmlyZWJhc2UuanMiLCJhcHAvanMvbWFpbi5qcyIsImFwcC9qcy92aWRlby5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnRvYS5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLE1BQU0sY0FBYyxHQUFHLFFBQVEsSUFBSTtBQUNqQyxFQUFBLFFBQVEsQ0FDTCxJQURILEdBRUcsY0FGSCxDQUVrQixRQUFRLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBbUIsV0FBbkIsQ0FBK0IsS0FGakQsRUFHRyxJQUhILENBR1EsWUFBVztBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFULENBQWMsa0JBQWxCLEVBQWpCO0FBQ0EsV0FBTyxRQUFRLENBQ1osSUFESSxHQUVKLGVBRkksQ0FFWSxRQUZaLEVBR0osSUFISSxDQUdDLFVBQVMsTUFBVCxFQUFpQjtBQUNyQjtBQUNBLFVBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFQLENBQWtCLFdBQTlCLENBRnFCLENBR3JCOztBQUNBLFVBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFsQjtBQUVBLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFaO0FBRUEsTUFBQSxRQUFRLENBQ0wsR0FESCxDQUNPLGtCQURQLEVBQzRCLE9BQU0sSUFB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGxvZ2luV2l0aFBvcHVwID0gc2VsZWN0b3IgPT4ge1xuICBmaXJlYmFzZVxuICAgIC5hdXRoKClcbiAgICAuc2V0UGVyc2lzdGVuY2UoZmlyZWJhc2UuYXV0aC5BdXRoLlBlcnNpc3RlbmNlLkxPQ0FMKVxuICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgLy8gRXhpc3RpbmcgYW5kIGZ1dHVyZSBBdXRoIHN0YXRlcyBhcmUgbm93IHBlcnNpc3RlZCBpbiB0aGUgY3VycmVudFxuICAgICAgLy8gc2Vzc2lvbiBvbmx5LiBDbG9zaW5nIHRoZSB3aW5kb3cgd291bGQgY2xlYXIgYW55IGV4aXN0aW5nIHN0YXRlIGV2ZW5cbiAgICAgIC8vIGlmIGEgdXNlciBmb3JnZXRzIHRvIHNpZ24gb3V0LlxuICAgICAgLy8gLi4uXG4gICAgICAvLyBOZXcgc2lnbi1pbiB3aWxsIGJlIHBlcnNpc3RlZCB3aXRoIHNlc3Npb24gcGVyc2lzdGVuY2UuXG4gICAgICBjb25zdCBwcm92aWRlciA9IG5ldyBmaXJlYmFzZS5hdXRoLkdvb2dsZUF1dGhQcm92aWRlcigpO1xuICAgICAgcmV0dXJuIGZpcmViYXNlXG4gICAgICAgIC5hdXRoKClcbiAgICAgICAgLnNpZ25JbldpdGhQb3B1cChwcm92aWRlcilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgLy8gVGhpcyBnaXZlcyB5b3UgYSBHb29nbGUgQWNjZXNzIFRva2VuLiBZb3UgY2FuIHVzZSBpdCB0byBhY2Nlc3MgdGhlIEdvb2dsZSBBUEkuXG4gICAgICAgICAgdmFyIHRva2VuID0gcmVzdWx0LmNyZWRlbnRpYWwuYWNjZXNzVG9rZW47XG4gICAgICAgICAgLy8gVGhlIHNpZ25lZC1pbiB1c2VyIGluZm8uXG4gICAgICAgICAgdmFyIHVzZXIgPSByZXN1bHQudXNlcjtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKHVzZXIpO1xuXG4gICAgICAgICAgc2VsZWN0b3JcbiAgICAgICAgICAgIC5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIGB1cmwoJHt1c2VyLnBob3RvVVJMfSlgKVxuICAgICAgICAgICAgLmFkZENsYXNzKFwibG9naW5cIik7XG4gICAgICAgICAgLy8gLi4uXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIC8vIEhhbmRsZSBFcnJvcnMgaGVyZS5cbiAgICAgICAgICB2YXIgZXJyb3JDb2RlID0gZXJyb3IuY29kZTtcbiAgICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAvLyBUaGUgZW1haWwgb2YgdGhlIHVzZXIncyBhY2NvdW50IHVzZWQuXG4gICAgICAgICAgdmFyIGVtYWlsID0gZXJyb3IuZW1haWw7XG4gICAgICAgICAgLy8gVGhlIGZpcmViYXNlLmF1dGguQXV0aENyZWRlbnRpYWwgdHlwZSB0aGF0IHdhcyB1c2VkLlxuICAgICAgICAgIHZhciBjcmVkZW50aWFsID0gZXJyb3IuY3JlZGVudGlhbDtcbiAgICAgICAgICAvLyAuLi5cbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgIC8vIEhhbmRsZSBFcnJvcnMgaGVyZS5cbiAgICAgIHZhciBlcnJvckNvZGUgPSBlcnJvci5jb2RlO1xuICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG4gICAgfSk7XG59O1xuXG5jb25zdCBjaGVja0xvZ2luID0gc2VsZWN0b3IgPT4ge1xuICBmaXJlYmFzZS5hdXRoKCkub25BdXRoU3RhdGVDaGFuZ2VkKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICBpZiAodXNlcikge1xuICAgICAgLy8gVXNlciBpcyBzaWduZWQgaW4uXG4gICAgICBjb25zb2xlLmxvZyh1c2VyKTtcbiAgICAgIHNlbGVjdG9yXG4gICAgICAgIC5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIGB1cmwoJHt1c2VyLnBob3RvVVJMfSlgKVxuICAgICAgICAucGFyZW50cyhcIi5sb2dpbi13cmFwcGVyXCIpXG4gICAgICAgIC5hZGRDbGFzcyhcImxvZ2luXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBObyB1c2VyIGlzIHNpZ25lZCBpbi5cbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgbG9nb3V0ID0gc2VsZWN0b3IgPT4ge1xuICBmaXJlYmFzZVxuICAgIC5hdXRoKClcbiAgICAuc2lnbk91dCgpXG4gICAgLnRoZW4oXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gU2lnbi1vdXQgc3VjY2Vzc2Z1bC5cbiAgICAgICAgc2VsZWN0b3JcbiAgICAgICAgICAuY3NzKFwiYmFja2dyb3VuZC1pbWFnZVwiLCBcIlwiKVxuICAgICAgICAgIC5wYXJlbnRzKFwiLmxvZ2luLXdyYXBwZXJcIilcbiAgICAgICAgICAucmVtb3ZlQ2xhc3MoXCJsb2dpblwiKTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAvLyBBbiBlcnJvciBoYXBwZW5lZC5cbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgfVxuICAgICk7XG59O1xuXG5jb25zdCBzZXRWaWRlb0RhdGEgPSAodXVpZCwgZXBpc29kZU9iaikgPT4ge1xuICAvLyBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIGRhdGFiYXNlIHNlcnZpY2VcbiAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbih1c2VyKSB7XG4gICAgaWYgKHVzZXIpIHtcbiAgICAgIC8vIFVzZXIgaXMgc2lnbmVkIGluLlxuICAgICAgdmFyIHVzZXJJZCA9IHVzZXIudWlkO1xuICAgICAgdmFyIGRhdGFiYXNlID0gZmlyZWJhc2UuZGF0YWJhc2UoKTtcblxuICAgICAgZGF0YWJhc2UucmVmKFwidXNlcnMvXCIgKyB1c2VySWQpLnVwZGF0ZSh7XG4gICAgICAgIFt1dWlkXTogZXBpc29kZU9ialxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vIHVzZXIgaXMgc2lnbmVkIGluLlxuICAgICAgTG9ja3Iuc2V0KHV1aWQsIGVwaXNvZGVPYmopO1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBnZXRWaWRlb1RpbWUgPSAodXVpZCwgY2FsbGJhY2spID0+IHtcbiAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbih1c2VyKSB7XG4gICAgaWYgKHVzZXIpIHtcbiAgICAgIC8vIFVzZXIgaXMgc2lnbmVkIGluLlxuICAgICAgdmFyIHVzZXJJZCA9IHVzZXIudWlkO1xuICAgICAgdmFyIGRhdGFiYXNlID0gZmlyZWJhc2UuZGF0YWJhc2UoKTtcblxuICAgICAgdmFyIHVzZXJzID0gZGF0YWJhc2UucmVmKFwidXNlcnMvXCIgKyB1c2VySWQgKyBcIi9cIiArIHV1aWQpO1xuICAgICAgdXNlcnMub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHNuYXBzaG90LnZhbCgpKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2soc25hcHNob3QudmFsKCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm8gdXNlciBpcyBzaWduZWQgaW4uXG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2soTG9ja3IuZ2V0KHV1aWQpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2dpbldpdGhQb3B1cDogbG9naW5XaXRoUG9wdXAsXG4gIGNoZWNrTG9naW46IGNoZWNrTG9naW4sXG4gIGxvZ291dDogbG9nb3V0LFxuICBzZXRWaWRlb0RhdGE6IHNldFZpZGVvRGF0YSxcbiAgZ2V0VmlkZW9UaW1lOiBnZXRWaWRlb1RpbWVcbn07XG4iLCJjb25zdCBheGlvcyA9IHJlcXVpcmUoXCJheGlvc1wiKTtcbmNvbnN0IGZpcmViYXNlID0gcmVxdWlyZShcIi4vZmlyZWJhc2VcIik7XG5jb25zdCB2aWRlb1BsYXllciA9IHJlcXVpcmUoXCIuL3ZpZGVvXCIpO1xuXG5sZXQgY2Fyb3VzZWw7XG5cbnZpZGVvUGxheWVyLmluaXQoKTtcblxubG9hZERyYW1hU2VyaWVzID0gYXN5bmMgKCkgPT4ge1xuICBsZXQgcmVzQWxsID0gYXdhaXQgYXhpb3MuZ2V0KFwiL2FwaS9saXN0L2FsbFwiKTtcblxuICBpZiAocmVzQWxsLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgaWYgKHJlc0FsbC5kYXRhLmxlbmd0aCAhPT0gMCkge1xuICAgICAgLy8gbGV0IGRyYW1hTGlzdFdyYXBwZXIgPSAkKGA8ZGl2IGNsYXNzPVwiZHJhbWEtbGlzdC13cmFwcGVyXCI+PC9kaXY+YCk7XG4gICAgICBsZXQgZHJhbWFMaXN0V3JhcHBlciA9ICQoXCIuZHJhbWEtbGlzdC13cmFwcGVyXCIpO1xuICAgICAgbGV0IHRvdGFsSW5kZXggPSByZXNBbGwuZGF0YS5sZW5ndGg7XG4gICAgICByZXNBbGwuZGF0YS5mb3JFYWNoKGFzeW5jICh2YWx1ZSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2codmFsdWUpO1xuICAgICAgICBsZXQgY3VycmVudFRpdGxlID0gdmFsdWUudGl0bGU7XG4gICAgICAgIC8vIGxldCByZXMgPSBhd2FpdCBheGlvcy5nZXQoXCIvYXBpL2RyYW1hLz9cIiArIHZhbHVlLnVybCArIFwiJnNpemU9MjBcIik7XG4gICAgICAgIGxldCBkcmFtYVR5cGVMaXN0ID0gT2JqZWN0LnZhbHVlcyh2YWx1ZSlbMV07XG4gICAgICAgIGxldCBmaXJzdEltYWdlID0gT2JqZWN0LnZhbHVlcyh2YWx1ZSlbMV1bMF0uaW1hZ2U7XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgZHJhbWFMaXN0V3JhcHBlci5wcmVwZW5kKFxuICAgICAgICAgICAgJChcbiAgICAgICAgICAgICAgYDxkaXYgY2xhc3M9XCJiZy1pbWFnZVwiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCR7Zmlyc3RJbWFnZVxuICAgICAgICAgICAgICAgIC5zcGxpdChcIj9cIilbMV1cbiAgICAgICAgICAgICAgICAucmVwbGFjZShcInNyYz1cIiwgXCJcIilcbiAgICAgICAgICAgICAgICAucmVwbGFjZShcIiZ3PTIwMCZoPTMwMFwiLCBcIlwiKX0pXCI+PC9kaXY+YFxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coZHJhbWFUeXBlTGlzdCk7XG5cbiAgICAgICAgbGV0IGRyYW1hTGlzdCA9ICQoYDxkaXYgY2xhc3M9XCJkcmFtYS1saXN0XCI+PC9kaXY+YCk7XG4gICAgICAgIGxldCBkcmFtYUxpc3RJdGVtID0gJChgPGRpdiBjbGFzcz1cImRyYW1hLWxpc3QtaXRlbVwiPjwvZGl2PmApO1xuICAgICAgICBkcmFtYVR5cGVMaXN0LmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgbGV0IGRyYW1hSXRlbVRpdGxlID0gdmFsdWUudGl0bGUudHJpbSgpLnNwbGl0KFwiLVwiKTtcbiAgICAgICAgICBsZXQgZHJhbWFUaXRsZUVOID0gZHJhbWFJdGVtVGl0bGVbMF07XG4gICAgICAgICAgbGV0IGRyYW1hVGl0bGVDTiA9IGRyYW1hSXRlbVRpdGxlWzFdO1xuICAgICAgICAgIGxldCBkcmFtYUl0ZW0gPSBgXG4gICAgICAgICAgICA8YVxuICAgICAgICAgICAgICBocmVmPVwiL2VwaXNvZGU/JHt2YWx1ZS51cmx9XCJcbiAgICAgICAgICAgICAgZGF0YS11cmw9XCIvYXBpL2VwaXNvZGU/JHt2YWx1ZS51cmx9XCJcbiAgICAgICAgICAgICAgZGF0YS1pbWc9XCIke3ZhbHVlLmltYWdlfVwiXG4gICAgICAgICAgICAgIGRhdGEtdGl0bGUtZW49XCIke2RyYW1hVGl0bGVFTiA/IGRyYW1hVGl0bGVFTiA6IFwiXCJ9XCJcbiAgICAgICAgICAgICAgZGF0YS10aXRsZS1jbj1cIiR7ZHJhbWFUaXRsZUNOID8gZHJhbWFUaXRsZUNOIDogXCJcIn1cIlxuICAgICAgICAgICAgICBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgke3ZhbHVlLmltYWdlfSlcIlxuICAgICAgICAgICAgICBjbGFzcz1cImRyYW1hLWl0ZW0gY2Fyb3VzZWwtY2VsbFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxoMyBjbGFzcz1cInRpdGxlXCI+XG4gICAgICAgICAgICAgICAgJHtkcmFtYVRpdGxlRU4gPyBkcmFtYVRpdGxlRU4gOiBcIlwifSR7XG4gICAgICAgICAgICBkcmFtYVRpdGxlQ04gPyBgPGJyIC8+YCA6IFwiXCJcbiAgICAgICAgICB9JHtkcmFtYVRpdGxlQ04gPyBkcmFtYVRpdGxlQ04gOiBcIlwifVxuICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgPC9hPlxuICAgICAgICAgIGA7XG4gICAgICAgICAgZHJhbWFMaXN0LmFwcGVuZChkcmFtYUl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZHJhbWFMaXN0SXRlbS5hcHBlbmQoXG4gICAgICAgICAgJChcbiAgICAgICAgICAgIGBcbiAgICAgICAgICAgICAgPGgxIGNsYXNzPVwiZHJhbWEtdGl0bGVcIj5cbiAgICAgICAgICAgICAgICAke2N1cnJlbnRUaXRsZX08YVxuICAgICAgICAgICAgICAgICAgY2xhc3M9XCJzZWUtbW9yZVwiXG4gICAgICAgICAgICAgICAgICBocmVmPVwiJHtcIi9kcmFtYT9cIiArIHZhbHVlLnVybH1cIlxuICAgICAgICAgICAgICAgID5TZWUgbW9yZSZuYnNwOzxpIGNsYXNzPVwiZmFzIGZhLWNoZXZyb24tcmlnaHQgcmlnaHQtaWNvblwiPjwvaT48L2E+XG4gICAgICAgICAgICAgIDwvaDE+XG4gICAgICAgICAgICBgXG4gICAgICAgICAgKVxuICAgICAgICApO1xuXG4gICAgICAgIGRyYW1hTGlzdEl0ZW0uYXBwZW5kKGRyYW1hTGlzdCk7XG4gICAgICAgIGRyYW1hTGlzdEl0ZW0uYXBwZW5kKCQoYDxkaXYgY2xhc3M9XCJlcGlzb2RlLXdyYXBwZXJcIj48L2Rpdj5gKSk7XG4gICAgICAgIGRyYW1hTGlzdFdyYXBwZXIuYXBwZW5kKGRyYW1hTGlzdEl0ZW0pO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vICQoXCJib2R5XCIpXG4gICAgICAgIC8vICAgLmFwcGVuZChkcmFtYUxpc3RXcmFwcGVyKVxuICAgICAgICAvLyAgIC5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwicmVhZHlcIik7XG4gICAgICAgIC8vICAgICAvLyBjYXJvdXNlbC5vbignZHJhZ1N0YXJ0LmZsaWNraXR5JywgKCkgPT4gY2Fyb3VzZWwuZmluZCgnLnNsaWRlJykuY3NzKCdwb2ludGVyLWV2ZW50cycsICdub25lJykpO1xuICAgICAgICAvLyAgICAgLy8gY2Fyb3VzZWwub24oJ2RyYWdFbmQuZmxpY2tpdHknLCAoKSA9PiBjYXJvdXNlbC5maW5kKCcuc2xpZGUnKS5jc3MoJ3BvaW50ZXItZXZlbnRzJywgJ2FsbCcpKTtcbiAgICAgICAgLy8gICB9KTtcblxuICAgICAgICBjb25zb2xlLmxvZyhpbmRleCwgdG90YWxJbmRleCk7XG4gICAgICAgIGlmIChpbmRleCA9PT0gdG90YWxJbmRleCAtIDEpIHtcbiAgICAgICAgICBsZXQgY2Fyb3VzZWwgPSAkKFwiLmRyYW1hLWxpc3RcIikuZmxpY2tpdHkoe1xuICAgICAgICAgICAgLy8gb3B0aW9uc1xuICAgICAgICAgICAgY29udGFpbjogdHJ1ZSxcbiAgICAgICAgICAgIC8vIGZyZWVTY3JvbGw6IHRydWUsXG4gICAgICAgICAgICB3cmFwQXJvdW5kOiB0cnVlLFxuICAgICAgICAgICAgcGFnZURvdHM6IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgJChcIi5wbGFjZWhvbGRlclwiKS5hZGRDbGFzcyhcInJlYWR5XCIpO1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKFwiLnBsYWNlaG9sZGVyXCIpLnJlbW92ZSgpO1xuICAgICAgICAgIH0sIDkwMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVzID0gYXdhaXQgYXhpb3MuZ2V0KFwiL2FwaS9saXN0XCIpO1xuXG4gICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIGxldCBkcmFtYUxpc3RXcmFwcGVyID0gJChgPGRpdiBjbGFzcz1cImRyYW1hLWxpc3Qtd3JhcHBlclwiPjwvZGl2PmApO1xuICAgICAgICBsZXQgdG90YWxJbmRleCA9IHJlcy5kYXRhLmxlbmd0aDtcbiAgICAgICAgcmVzLmRhdGEuZm9yRWFjaChhc3luYyAodmFsdWUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgbGV0IGN1cnJlbnRUaXRsZSA9IHZhbHVlLnRpdGxlO1xuICAgICAgICAgIGxldCByZXMgPSBhd2FpdCBheGlvcy5nZXQoXCIvYXBpL2RyYW1hLz9cIiArIHZhbHVlLnVybCArIFwiJnNpemU9MjBcIik7XG5cbiAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICQoXCJib2R5XCIpLnByZXBlbmQoXG4gICAgICAgICAgICAgICQoXG4gICAgICAgICAgICAgICAgYDxkaXYgY2xhc3M9XCJiZy1pbWFnZVwiIHN0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCR7cmVzLmRhdGFbMF0uaW1hZ2VcbiAgICAgICAgICAgICAgICAgIC5zcGxpdChcIj9cIilbMV1cbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKFwic3JjPVwiLCBcIlwiKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoXCImdz0yMDAmaD0zMDBcIiwgXCJcIil9KVwiPjwvZGl2PmBcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XG5cbiAgICAgICAgICAgIGxldCBkcmFtYUxpc3QgPSAkKGA8ZGl2IGNsYXNzPVwiZHJhbWEtbGlzdFwiPjwvZGl2PmApO1xuICAgICAgICAgICAgcmVzLmRhdGEuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgbGV0IGRyYW1hSXRlbVRpdGxlID0gdmFsdWUudGl0bGUudHJpbSgpLnNwbGl0KFwiLVwiKTtcbiAgICAgICAgICAgICAgbGV0IGRyYW1hVGl0bGVFTiA9IGRyYW1hSXRlbVRpdGxlWzBdO1xuICAgICAgICAgICAgICBsZXQgZHJhbWFUaXRsZUNOID0gZHJhbWFJdGVtVGl0bGVbMV07XG4gICAgICAgICAgICAgIGxldCBkcmFtYUl0ZW0gPSBgXG4gICAgICAgICAgICA8YVxuICAgICAgICAgICAgICBocmVmPVwiL2VwaXNvZGU/JHt2YWx1ZS51cmx9XCJcbiAgICAgICAgICAgICAgZGF0YS11cmw9XCIvYXBpL2VwaXNvZGU/JHt2YWx1ZS51cmx9XCJcbiAgICAgICAgICAgICAgZGF0YS1pbWc9XCIke3ZhbHVlLmltYWdlfVwiXG4gICAgICAgICAgICAgIGRhdGEtdGl0bGUtZW49XCIke2RyYW1hVGl0bGVFTiA/IGRyYW1hVGl0bGVFTiA6IFwiXCJ9XCJcbiAgICAgICAgICAgICAgZGF0YS10aXRsZS1jbj1cIiR7ZHJhbWFUaXRsZUNOID8gZHJhbWFUaXRsZUNOIDogXCJcIn1cIlxuICAgICAgICAgICAgICBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgke3ZhbHVlLmltYWdlfSlcIlxuICAgICAgICAgICAgICBjbGFzcz1cImRyYW1hLWl0ZW0gY2Fyb3VzZWwtY2VsbFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxoMyBjbGFzcz1cInRpdGxlXCI+XG4gICAgICAgICAgICAgICAgJHtkcmFtYVRpdGxlRU4gPyBkcmFtYVRpdGxlRU4gOiBcIlwifSR7XG4gICAgICAgICAgICAgICAgZHJhbWFUaXRsZUNOID8gYDxiciAvPmAgOiBcIlwiXG4gICAgICAgICAgICAgIH0ke2RyYW1hVGl0bGVDTiA/IGRyYW1hVGl0bGVDTiA6IFwiXCJ9XG4gICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgYDtcbiAgICAgICAgICAgICAgZHJhbWFMaXN0LmFwcGVuZChkcmFtYUl0ZW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkcmFtYUxpc3RXcmFwcGVyLmFwcGVuZChcbiAgICAgICAgICAgICAgJChcbiAgICAgICAgICAgICAgICBgXG4gICAgICAgICAgICAgIDxoMSBjbGFzcz1cImRyYW1hLXRpdGxlXCI+XG4gICAgICAgICAgICAgICAgJHtjdXJyZW50VGl0bGV9PGFcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwic2VlLW1vcmVcIlxuICAgICAgICAgICAgICAgICAgaHJlZj1cIiR7XCIvZHJhbWE/XCIgKyB2YWx1ZS51cmx9XCJcbiAgICAgICAgICAgICAgICA+U2VlIG1vcmU8L2E+XG4gICAgICAgICAgICAgIDwvaDE+XG4gICAgICAgICAgICBgXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBkcmFtYUxpc3RXcmFwcGVyLmFwcGVuZChkcmFtYUxpc3QpO1xuICAgICAgICAgICAgZHJhbWFMaXN0V3JhcHBlci5hcHBlbmQoJChgPGRpdiBjbGFzcz1cImVwaXNvZGUtd3JhcHBlclwiPjwvZGl2PmApKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgJChcImJvZHlcIilcbiAgICAgICAgICAgIC5hcHBlbmQoZHJhbWFMaXN0V3JhcHBlcilcbiAgICAgICAgICAgIC5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWFkeVwiKTtcbiAgICAgICAgICAgICAgLy8gY2Fyb3VzZWwub24oJ2RyYWdTdGFydC5mbGlja2l0eScsICgpID0+IGNhcm91c2VsLmZpbmQoJy5zbGlkZScpLmNzcygncG9pbnRlci1ldmVudHMnLCAnbm9uZScpKTtcbiAgICAgICAgICAgICAgLy8gY2Fyb3VzZWwub24oJ2RyYWdFbmQuZmxpY2tpdHknLCAoKSA9PiBjYXJvdXNlbC5maW5kKCcuc2xpZGUnKS5jc3MoJ3BvaW50ZXItZXZlbnRzJywgJ2FsbCcpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY29uc29sZS5sb2coaW5kZXgsIHRvdGFsSW5kZXgpO1xuICAgICAgICAgIC8vIGlmIChpbmRleCA9PT0gdG90YWxJbmRleCAtIDEpIHtcbiAgICAgICAgICBjYXJvdXNlbCA9ICQoXCIuZHJhbWEtbGlzdFwiKS5mbGlja2l0eSh7XG4gICAgICAgICAgICAvLyBvcHRpb25zXG4gICAgICAgICAgICBjb250YWluOiB0cnVlLFxuICAgICAgICAgICAgLy8gZnJlZVNjcm9sbDogdHJ1ZSxcbiAgICAgICAgICAgIHdyYXBBcm91bmQ6IHRydWUsXG4gICAgICAgICAgICBwYWdlRG90czogZmFsc2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAkKFwiLnBsYWNlaG9sZGVyXCIpLmFkZENsYXNzKFwicmVhZHlcIik7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoXCIucGxhY2Vob2xkZXJcIikucmVtb3ZlKCk7XG4gICAgICAgICAgfSwgOTAwKTtcbiAgICAgICAgICAvLyB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxubG9hZEVwaXNvZGVzID0gYXN5bmMgdXJsID0+IHtcbiAgbGV0IHJlcyA9IGF3YWl0IGF4aW9zLmdldCh1cmwpO1xuICByZXR1cm4gcmVzLmRhdGE7XG59O1xuXG4vLyBnZXRFcGlzb2RlID0gYXN5bmMgKCkgPT4ge1xuLy8gICBjb25zdCBjdXJyRHJhbWEgPSAkKHRoaXMpLmRhdGEoXCJ1cmxcIik7XG4vLyAgIGxldCBlcGlzb2RlcyA9IGF3YWl0IGxvYWRFcGlzb2RlcyhjdXJyRHJhbWEpO1xuLy8gICBsZXQgZXBpc29kZUxpc3QgPSAkKGA8ZGl2IGNsYXNzPVwiZXBpc29kZS1saXN0XCI+PC9kaXY+YCk7XG4vLyAgIGVwaXNvZGVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4vLyAgICAgbGV0IGVwaXNvZGVJdGVtID0gJChcbi8vICAgICAgIGA8YSBocmVmPVwiL3ZpZGVvPyR7dmFsdWUudXJsfVwiIGNsYXNzPVwiZXBpc29kZS1pdGVtXCI+PC9hPmBcbi8vICAgICApO1xuLy8gICAgIGVwaXNvZGVJdGVtLnRleHQoaW5kZXggKyAxKTtcbi8vICAgICBlcGlzb2RlTGlzdC5hcHBlbmQoZXBpc29kZUl0ZW0pO1xuLy8gICB9KTtcbi8vICAgJChcIi5lcGlzb2RlLXdyYXBwZXJcIilcbi8vICAgICAuYXBwZW5kKGVwaXNvZGVMaXN0KVxuLy8gICAgIC5zbGlkZURvd24oKTtcbi8vIH07XG5cbmxldCBpc0ZldGNoaW5nID0gZmFsc2U7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBpZiAoXG4gICAgbG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL1wiIHx8XG4gICAgbG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2RyYW1hXCIgfHxcbiAgICBsb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvc2VhcmNoXCJcbiAgKSB7XG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9cIikge1xuICAgICAgbG9hZERyYW1hU2VyaWVzKCk7XG4gICAgfVxuXG4gICAgaWYgKCQoXCIudmlkZW8tcGxheWVyXCIpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgLy8gdmlkZW9QbGF5ZXIuaW5pdCgpO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGZpcmViYXNlLmNoZWNrTG9naW4oJChcIi5sb2dpbi1idG5cIikpKTtcblxuICAgICQoXCIubG9naW4tYnRuXCIpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciB0aGF0ID0gJCh0aGlzKTtcblxuICAgICAgZmlyZWJhc2UubG9naW5XaXRoUG9wdXAodGhhdCk7XG4gICAgfSk7XG5cbiAgICAkKFwiLmxvZ2luLXdyYXBwZXIgLmxvZ291dFwiKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBmaXJlYmFzZS5sb2dvdXQoJChcIi5sb2dpbi1idG5cIikpO1xuICAgIH0pO1xuXG4gICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5kcmFtYS1pdGVtXCIsIGFzeW5jIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmICghaXNGZXRjaGluZykge1xuICAgICAgICAkKHRoaXMpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAkKFwiLmRyYW1hLWl0ZW1cIilcbiAgICAgICAgICAubm90KCQodGhpcykpXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICBpc0ZldGNoaW5nID0gdHJ1ZTtcbiAgICAgICAgJChcIi5kcmFtYS1saXN0XCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAkKFwiLmRyYW1hLWxpc3QtaXRlbVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAkKFwiLmVwaXNvZGUtd3JhcHBlclwiKS5lbXB0eSgpO1xuICAgICAgICB9LCA0MDApO1xuXG4gICAgICAgIC8vU2xpZGUgZG93biB0aGUgZXBpc29kZSBjb250YWluZXJcbiAgICAgICAgLy8gaWYgKGxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9cIikge1xuICAgICAgICAvLyAgICQodGhpcylcbiAgICAgICAgLy8gICAgIC5jbG9zZXN0KFwiLmRyYW1hLWxpc3RcIilcbiAgICAgICAgLy8gICAgIC5hZGRDbGFzcyhcImFjdGl2ZVwiKVxuICAgICAgICAvLyAgICAgLm5leHQoXCIuZXBpc29kZS13cmFwcGVyXCIpXG4gICAgICAgIC8vICAgICAuc2xpZGVEb3duKCk7XG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vICAgJCh0aGlzKVxuICAgICAgICAvLyAgICAgLmNsb3Nlc3QoXCIuZHJhbWEtbGlzdFwiKVxuICAgICAgICAvLyAgICAgLmFkZENsYXNzKFwiYWN0aXZlXCIpXG4gICAgICAgIC8vICAgICAubmV4dChcIi5lcGlzb2RlLXdyYXBwZXJcIilcbiAgICAgICAgLy8gICAgIC5mYWRlSW4oKTtcbiAgICAgICAgLy8gfVxuICAgICAgICBjb25zdCBjdXJyRHJhbWEgPSAkKHRoaXMpLmRhdGEoXCJ1cmxcIik7XG4gICAgICAgIGNvbnN0IGN1cnJEcmFtYUJnU3R5bGUgPSAkKHRoaXMpXG4gICAgICAgICAgLmRhdGEoXCJpbWdcIilcbiAgICAgICAgICAuc3BsaXQoXCI/XCIpWzFdXG4gICAgICAgICAgLnJlcGxhY2UoXCJzcmM9XCIsIFwiXCIpXG4gICAgICAgICAgLnJlcGxhY2UoXCImdz0yMDAmaD0zMDBcIiwgXCJcIik7XG4gICAgICAgIGNvbnN0IGRyYW1hVGl0bGVDTiA9ICQodGhpcykuZGF0YShcInRpdGxlLWNuXCIpO1xuICAgICAgICBjb25zdCBkcmFtYVRpdGxlRU4gPSAkKHRoaXMpLmRhdGEoXCJ0aXRsZS1lblwiKTtcbiAgICAgICAgbGV0IGVwaXNvZGVDb250YWluZXIgPSAkKGA8ZGl2IGNsYXNzPVwiZXBpc29kZS1jb250YWluZXJcIj48L2Rpdj5gKTtcbiAgICAgICAgbGV0IGVwaXNvZGVzID0gYXdhaXQgbG9hZEVwaXNvZGVzKGN1cnJEcmFtYSk7XG4gICAgICAgIGxldCBlcGlzb2RlUG9zdGVyID0gJChcbiAgICAgICAgICBgPGRpdiBjbGFzcz1cImVwaXNvZGUtcG9zdGVyXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtjdXJyRHJhbWFCZ1N0eWxlfSlcIj48L2Rpdj5gXG4gICAgICAgICk7XG4gICAgICAgIGxldCBlcGlzb2RlTGlzdCA9ICQoYDxkaXYgY2xhc3M9XCJlcGlzb2RlLWxpc3RcIj48L2Rpdj5gKTtcbiAgICAgICAgZXBpc29kZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICBsZXQgdXVpZCA9IHZhbHVlLnVybDtcbiAgICAgICAgICBsZXQgcGVyY2VudGFnZSA9IDA7XG5cbiAgICAgICAgICBmaXJlYmFzZS5nZXRWaWRlb1RpbWUodXVpZCwgZnVuY3Rpb24odGltZSkge1xuICAgICAgICAgICAgaWYgKHRpbWUpIHtcbiAgICAgICAgICAgICAgcGVyY2VudGFnZSA9IHRpbWUucGVyY2VudGFnZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGVwaXNvZGVJdGVtID0gJChcbiAgICAgICAgICAgICAgYFxuICAgICAgICAgICAgICA8YVxuICAgICAgICAgICAgICAgIGhyZWY9XCIvdmlkZW8/JHt2YWx1ZS51cmx9XCJcbiAgICAgICAgICAgICAgICBjbGFzcz1cImVwaXNvZGUtaXRlbVwiXG4gICAgICAgICAgICAgICAgZGF0YS12aWRlbz1cIi92aWRlbz8ke3ZhbHVlLnVybH1cIlxuICAgICAgICAgICAgICAgIGRhdGEtdXVpZD1cIiR7dXVpZH1cIlxuICAgICAgICAgICAgICAgID48L2E+XG4gICAgICAgICAgICBgXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgLy8gZXBpc29kZUl0ZW0udGV4dChpbmRleCArIDEpO1xuXG4gICAgICAgICAgICBlcGlzb2RlSXRlbS50ZXh0KHZhbHVlLnRpdGxlKTtcbiAgICAgICAgICAgIGVwaXNvZGVJdGVtLmFwcGVuZChcbiAgICAgICAgICAgICAgJChcbiAgICAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cImRhdGEtcGVyY2VudGFnZVwiIHN0eWxlPVwid2lkdGg6ICR7cGVyY2VudGFnZX0lXCI+PC9kaXY+YFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgZXBpc29kZUxpc3QuYXBwZW5kKGVwaXNvZGVJdGVtKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGVwaXNvZGVDb250YWluZXIuYXBwZW5kKFxuICAgICAgICAgICQoYCA8aDMgY2xhc3M9XCJ0aXRsZVwiPlxuICAgICAgICAgICAgICAgICR7ZHJhbWFUaXRsZUVOID8gZHJhbWFUaXRsZUVOIDogXCJcIn0ke1xuICAgICAgICAgICAgZHJhbWFUaXRsZUNOID8gYDxiciAvPmAgOiBcIlwiXG4gICAgICAgICAgfSR7ZHJhbWFUaXRsZUNOID8gZHJhbWFUaXRsZUNOIDogXCJcIn1cbiAgICAgICAgICAgICAgPC9oMz5gKVxuICAgICAgICApO1xuICAgICAgICBlcGlzb2RlQ29udGFpbmVyLmFwcGVuZChlcGlzb2RlTGlzdCk7XG4gICAgICAgIGVwaXNvZGVDb250YWluZXIuYXBwZW5kKGVwaXNvZGVQb3N0ZXIpO1xuICAgICAgICBlcGlzb2RlQ29udGFpbmVyLmFwcGVuZChcbiAgICAgICAgICAkKGA8YSBjbGFzcz1cImNsb3NlXCIgaHJlZj1cIiMhXCI+PGkgY2xhc3M9XCJmYXMgZmEtdGltZXNcIj48L2k+PC9hPmApXG4gICAgICAgICk7XG5cbiAgICAgICAgJChcIi5kcmFtYS1pdGVtXCIpXG4gICAgICAgICAgLm5vdCgkKHRoaXMpKVxuICAgICAgICAgIC5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9cIikge1xuICAgICAgICAgICQodGhpcylcbiAgICAgICAgICAgIC5jbG9zZXN0KFwiLmRyYW1hLWxpc3QtaXRlbVwiKVxuICAgICAgICAgICAgLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICQodGhpcylcbiAgICAgICAgICAgIC5jbG9zZXN0KFwiLmRyYW1hLWxpc3RcIilcbiAgICAgICAgICAgIC5hZGRDbGFzcyhcImFjdGl2ZVwiKVxuICAgICAgICAgICAgLm5leHQoXCIuZXBpc29kZS13cmFwcGVyXCIpXG4gICAgICAgICAgICAuYXBwZW5kKGVwaXNvZGVDb250YWluZXIpO1xuICAgICAgICAgIC8vIC5zbGlkZURvd24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKHRoaXMpXG4gICAgICAgICAgICAuY2xvc2VzdChcIi5kcmFtYS1saXN0XCIpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoXCJhY3RpdmVcIilcbiAgICAgICAgICAgIC5uZXh0KFwiLmVwaXNvZGUtd3JhcHBlclwiKVxuICAgICAgICAgICAgLmFwcGVuZChlcGlzb2RlQ29udGFpbmVyKTtcbiAgICAgICAgICAkKFwiYm9keVwiKS5hZGRDbGFzcyhcImZpeGVkXCIpO1xuICAgICAgICAgIC8vIC5mYWRlSW4oKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuZXBpc29kZS13cmFwcGVyIC5jbG9zZVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICQoXCIuZHJhbWEtbGlzdFwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAkKFwiLmRyYW1hLWxpc3QtaXRlbVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9cIikge1xuICAgICAgICAgICAgICAkKFwiLmVwaXNvZGUtd3JhcHBlclwiKVxuICAgICAgICAgICAgICAgIC8vIC5zbGlkZVVwKClcbiAgICAgICAgICAgICAgICAuZW1wdHkoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICQoXCIuZXBpc29kZS13cmFwcGVyXCIpXG4gICAgICAgICAgICAgICAgLy8gLmZhZGVPdXQoKVxuICAgICAgICAgICAgICAgIC5lbXB0eSgpO1xuICAgICAgICAgICAgICAkKFwiYm9keVwiKS5yZW1vdmVDbGFzcyhcImZpeGVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIDQwMCk7XG5cbiAgICAgICAgICAkKFwiLmRyYW1hLWl0ZW1cIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgIH0pO1xuICAgICAgICBpc0ZldGNoaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiLmVwaXNvZGUtaXRlbVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkKFwiLnZpZGVvTG9hZGVyXCIpXG4gICAgICAgIC5hdHRyKFwic3JjXCIsICQodGhpcykuZGF0YShcInZpZGVvXCIpKVxuICAgICAgICAuZmFkZUluKCk7XG4gICAgfSk7XG4gIH1cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZSkge1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIHZhciBqc29uRGF0YSA9IEpTT04ucGFyc2UoZS5kYXRhKTtcbiAgICB2YXIgdXVpZCA9IGpzb25EYXRhLnV1aWQ7XG4gICAgdmFyIHBlcmNlbnRhZ2UgPSBqc29uRGF0YS5wZXJjZW50YWdlO1xuICAgIGlmIChqc29uRGF0YS5hY3Rpb24gPT09IFwiY2xvc2VcIikge1xuICAgICAgJChcIi52aWRlb0xvYWRlclwiKVxuICAgICAgICAucmVtb3ZlQXR0cihcInNyY1wiKVxuICAgICAgICAuZmFkZU91dCgpO1xuICAgIH1cbiAgICBpZiAoanNvbkRhdGEucGVyY2VudGFnZSkge1xuICAgICAgJCgnW2RhdGEtdXVpZD1cIicgKyB1dWlkICsgJ1wiXSAuZGF0YS1wZXJjZW50YWdlJykuY3NzKFxuICAgICAgICBcIndpZHRoXCIsXG4gICAgICAgIHBlcmNlbnRhZ2UgKyBcIiVcIlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gICQod2luZG93KS5vbihcInNjcm9sbFwiLCBmdW5jdGlvbihlKSB7XG4gICAgbGV0IHRvcCA9ICQoXCJoZWFkZXJcIikub2Zmc2V0KCkudG9wO1xuICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZSAhPT0gXCIvXCIpIHtcbiAgICAgICQoXCIuZXBpc29kZS13cmFwcGVyXCIpLmNzcyhcInRvcFwiLCAkKFwiaGVhZGVyXCIpLm9mZnNldCgpLnRvcCArIFwicHhcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0b3AgPiAzMCkge1xuICAgICAgICAkKFwiaGVhZGVyXCIpLmFkZENsYXNzKFwidmlzaWJsZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQoXCJoZWFkZXJcIikucmVtb3ZlQ2xhc3MoXCJ2aXNpYmxlXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KTtcbiIsImNvbnN0IGZpcmViYXNlID0gcmVxdWlyZShcIi4vZmlyZWJhc2VcIik7XG5cbmNvbnN0IGluaXQgPSAoKSA9PiB7XG4gIHdpbmRvdy52aWRlb1BsYXllckNsb3NlID0gZnVuY3Rpb24odXVpZCkge1xuICAgIC8vIGNvbnN0IHV1aWQgPSBcIiF7dXVpZH1cIjtcbiAgICBsZXQgcGVyY2VudGFnZSA9IDEwMDtcbiAgICBmaXJlYmFzZS5nZXRWaWRlb1RpbWUodXVpZCwgZnVuY3Rpb24odGltZSkge1xuICAgICAgaWYgKHRpbWUpIHtcbiAgICAgICAgcGVyY2VudGFnZSA9IHRpbWUucGVyY2VudGFnZTtcbiAgICAgIH1cbiAgICAgIHZhciBlcGlzb2RlSXRlbU9iaiA9IHtcbiAgICAgICAgYWN0aW9uOiBcImNsb3NlXCIsXG4gICAgICAgIHV1aWQ6IHV1aWQsXG4gICAgICAgIHBlcmNlbnRhZ2U6IHBlcmNlbnRhZ2VcbiAgICAgIH07XG4gICAgICB3aW5kb3cudG9wLnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KGVwaXNvZGVJdGVtT2JqKSwgXCIqXCIpO1xuICAgIH0pO1xuICB9O1xuXG4gIHdpbmRvdy52aWRlb1BsYXllciA9IGFzeW5jIGZ1bmN0aW9uKHZpZGVvLCB1dWlkKSB7XG4gICAgLy8gY29uc29sZS5sb2codmlkZW8sIHV1aWQpO1xuICAgIGlmICghIW5hdmlnYXRvci5wbGF0Zm9ybSAmJiAvaVBhZHxpUGhvbmV8aVBvZC8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pKSB7XG4gICAgICAkKFwiI3BsYXllciBzb3VyY2VcIikuYXR0cihcInNyY1wiLCB2aWRlb1sxXS51cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwbGF5ZXIgPSBuZXcgUGx5cihcIiNwbGF5ZXJcIik7XG4gICAgICB2YXIgcGxheWVkVGltZSA9IDA7XG5cbiAgICAgIGxldCB0aW1lID0gYXdhaXQgZmlyZWJhc2UuZ2V0VmlkZW9UaW1lKHV1aWQsIGZ1bmN0aW9uKHRpbWUpIHtcbiAgICAgICAgY29uc29sZS5sb2codGltZSk7XG4gICAgICAgIGlmICh0aW1lKSB7XG4gICAgICAgICAgcGxheWVkVGltZSA9IHRpbWUuY3VycmVudFRpbWU7XG4gICAgICAgICAgY29uc29sZS5sb2codGltZSk7XG4gICAgICAgICAgLy8gcGxheWVyLmN1cnJlbnRUaW1lID0gcGxheWVkVGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBsYXllci5zb3VyY2UgPSB7XG4gICAgICAgICAgdHlwZTogXCJ2aWRlb1wiLFxuICAgICAgICAgIHRpdGxlOiBcIkV4YW1wbGUgdGl0bGVcIixcbiAgICAgICAgICBjdXJyZW50VGltZTogMjAwLFxuICAgICAgICAgIHNvdXJjZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3JjOiB2aWRlb1swXS51cmwsXG4gICAgICAgICAgICAgIHR5cGU6IFwidmlkZW8vbXA0XCIsXG4gICAgICAgICAgICAgIHNpemU6IDM2MFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3JjOiB2aWRlb1sxXS51cmwsXG4gICAgICAgICAgICAgIHR5cGU6IFwidmlkZW8vbXA0XCIsXG4gICAgICAgICAgICAgIHNpemU6IDcyMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBwbGF5ZXIub24oJ2xvYWRlZG1ldGFkYXRhJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgcGxheWVyLmN1cnJlbnRUaW1lKDEwMCk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICB2YXIgZ2V0VGltZSA9IGZhbHNlO1xuXG4gICAgICAgIHBsYXllci5vbihcInJlYWR5XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiY3VycmVudFRpbWU6XCIsIHBsYXllci5jdXJyZW50VGltZSk7XG4gICAgICAgICAgdmFyIGZvcndhcmRJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHBsYXllci5jdXJyZW50VGltZSAhPT0gcGxheWVkVGltZSkge1xuICAgICAgICAgICAgICBwbGF5ZXIuY3VycmVudFRpbWUgPSBwbGF5ZWRUaW1lO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChmb3J3YXJkSW50ZXJ2YWwpO1xuICAgICAgICAgICAgICBnZXRUaW1lID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm9yd2FyZCBjdXJyZW50VGltZTpcIiwgcGxheWVyLmN1cnJlbnRUaW1lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBwbGF5ZXIucGxheSgpO1xuICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICBwbGF5ZXIub24oXCJwbGF5XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKGdldFRpbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudFRpbWUgPSBwbGF5ZXIuY3VycmVudFRpbWU7XG4gICAgICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gcGxheWVyLmR1cmF0aW9uO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGN1cnJlbnRUaW1lLCBkdXJhdGlvbilcbiAgICAgICAgICAgICAgICB2YXIgZXBpc29kZU9iaiA9IHtcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRUaW1lOiBjdXJyZW50VGltZSxcbiAgICAgICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IChjdXJyZW50VGltZSAvIGR1cmF0aW9uKSAqIDEwMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZmlyZWJhc2Uuc2V0VmlkZW9EYXRhKHV1aWQsIGVwaXNvZGVPYmopO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHRpbWVyO1xuICAgICAgICB2YXIgaGlkZGluZyA9IGZhbHNlO1xuICAgICAgICAkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQoXCIucGx5clwiKS5tb3VzZW1vdmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaGlkZGluZykge1xuICAgICAgICAgICAgICBoaWRkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aW1lcikge1xuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICB0aW1lciA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkKFwiLnBseXJfX3ZpZGVvLXdyYXBwZXJcIikuY3NzKHtcbiAgICAgICAgICAgICAgY3Vyc29yOiBcInBvaW50ZXJcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkKFwiLmNsb3NlLXdyYXBwZXJcIikucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpO1xuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBoaWRkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgJChcIi5wbHlyX192aWRlby13cmFwcGVyXCIpLmNzcyh7XG4gICAgICAgICAgICAgICAgY3Vyc29yOiBcIm5vbmVcIlxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgJChcIi5jbG9zZS13cmFwcGVyXCIpLmFkZENsYXNzKFwiaGlkZVwiKTtcbiAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBpbml0XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG52YXIgYnRvYSA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuYnRvYSAmJiB3aW5kb3cuYnRvYS5iaW5kKHdpbmRvdykpIHx8IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idG9hJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgdmFyIGxvYWRFdmVudCA9ICdvbnJlYWR5c3RhdGVjaGFuZ2UnO1xuICAgIHZhciB4RG9tYWluID0gZmFsc2U7XG5cbiAgICAvLyBGb3IgSUUgOC85IENPUlMgc3VwcG9ydFxuICAgIC8vIE9ubHkgc3VwcG9ydHMgUE9TVCBhbmQgR0VUIGNhbGxzIGFuZCBkb2Vzbid0IHJldHVybnMgdGhlIHJlc3BvbnNlIGhlYWRlcnMuXG4gICAgLy8gRE9OJ1QgZG8gdGhpcyBmb3IgdGVzdGluZyBiL2MgWE1MSHR0cFJlcXVlc3QgaXMgbW9ja2VkLCBub3QgWERvbWFpblJlcXVlc3QuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAndGVzdCcgJiZcbiAgICAgICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgd2luZG93LlhEb21haW5SZXF1ZXN0ICYmICEoJ3dpdGhDcmVkZW50aWFscycgaW4gcmVxdWVzdCkgJiZcbiAgICAgICAgIWlzVVJMU2FtZU9yaWdpbihjb25maWcudXJsKSkge1xuICAgICAgcmVxdWVzdCA9IG5ldyB3aW5kb3cuWERvbWFpblJlcXVlc3QoKTtcbiAgICAgIGxvYWRFdmVudCA9ICdvbmxvYWQnO1xuICAgICAgeERvbWFpbiA9IHRydWU7XG4gICAgICByZXF1ZXN0Lm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbiBoYW5kbGVQcm9ncmVzcygpIHt9O1xuICAgICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge307XG4gICAgfVxuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCB8fCAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlXG4gICAgcmVxdWVzdFtsb2FkRXZlbnRdID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCB8fCAocmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0ICYmICF4RG9tYWluKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFjb25maWcucmVzcG9uc2VUeXBlIHx8IGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/IHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICAvLyBJRSBzZW5kcyAxMjIzIGluc3RlYWQgb2YgMjA0IChodHRwczovL2dpdGh1Yi5jb20vYXhpb3MvYXhpb3MvaXNzdWVzLzIwMSlcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyA9PT0gMTIyMyA/IDIwNCA6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1cyA9PT0gMTIyMyA/ICdObyBDb250ZW50JyA6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgdmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xuXG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oY29uZmlnLnVybCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLndpdGhDcmVkZW50aWFscykge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBFeHBlY3RlZCBET01FeGNlcHRpb24gdGhyb3duIGJ5IGJyb3dzZXJzIG5vdCBjb21wYXRpYmxlIFhNTEh0dHBSZXF1ZXN0IExldmVsIDIuXG4gICAgICAgIC8vIEJ1dCwgdGhpcyBjYW4gYmUgc3VwcHJlc3NlZCBmb3IgJ2pzb24nIHR5cGUgYXMgaXQgY2FuIGJlIHBhcnNlZCBieSBkZWZhdWx0ICd0cmFuc2Zvcm1SZXNwb25zZScgZnVuY3Rpb24uXG4gICAgICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHJlcXVlc3REYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UodXRpbHMubWVyZ2UoZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gdXRpbHMubWVyZ2Uoe1xuICAgICAgdXJsOiBhcmd1bWVudHNbMF1cbiAgICB9LCBhcmd1bWVudHNbMV0pO1xuICB9XG5cbiAgY29uZmlnID0gdXRpbHMubWVyZ2UoZGVmYXVsdHMsIHttZXRob2Q6ICdnZXQnfSwgdGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QodXRpbHMubWVyZ2UoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KHV0aWxzLm1lcmdlKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWRcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gU3VwcG9ydCBiYXNlVVJMIGNvbmZpZ1xuICBpZiAoY29uZmlnLmJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwoY29uZmlnLnVybCkpIHtcbiAgICBjb25maWcudXJsID0gY29tYmluZVVSTHMoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICB9XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVycyB8fCB7fVxuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICAvLyBOb3RlOiBzdGF0dXMgaXMgbm90IGV4cG9zZWQgYnkgWERvbWFpblJlcXVlc3RcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGJ0b2EgcG9seWZpbGwgZm9yIElFPDEwIGNvdXJ0ZXN5IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGNoYW1iZXJzL0Jhc2U2NC5qc1xuXG52YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuXG5mdW5jdGlvbiBFKCkge1xuICB0aGlzLm1lc3NhZ2UgPSAnU3RyaW5nIGNvbnRhaW5zIGFuIGludmFsaWQgY2hhcmFjdGVyJztcbn1cbkUucHJvdG90eXBlID0gbmV3IEVycm9yO1xuRS5wcm90b3R5cGUuY29kZSA9IDU7XG5FLnByb3RvdHlwZS5uYW1lID0gJ0ludmFsaWRDaGFyYWN0ZXJFcnJvcic7XG5cbmZ1bmN0aW9uIGJ0b2EoaW5wdXQpIHtcbiAgdmFyIHN0ciA9IFN0cmluZyhpbnB1dCk7XG4gIHZhciBvdXRwdXQgPSAnJztcbiAgZm9yIChcbiAgICAvLyBpbml0aWFsaXplIHJlc3VsdCBhbmQgY291bnRlclxuICAgIHZhciBibG9jaywgY2hhckNvZGUsIGlkeCA9IDAsIG1hcCA9IGNoYXJzO1xuICAgIC8vIGlmIHRoZSBuZXh0IHN0ciBpbmRleCBkb2VzIG5vdCBleGlzdDpcbiAgICAvLyAgIGNoYW5nZSB0aGUgbWFwcGluZyB0YWJsZSB0byBcIj1cIlxuICAgIC8vICAgY2hlY2sgaWYgZCBoYXMgbm8gZnJhY3Rpb25hbCBkaWdpdHNcbiAgICBzdHIuY2hhckF0KGlkeCB8IDApIHx8IChtYXAgPSAnPScsIGlkeCAlIDEpO1xuICAgIC8vIFwiOCAtIGlkeCAlIDEgKiA4XCIgZ2VuZXJhdGVzIHRoZSBzZXF1ZW5jZSAyLCA0LCA2LCA4XG4gICAgb3V0cHV0ICs9IG1hcC5jaGFyQXQoNjMgJiBibG9jayA+PiA4IC0gaWR4ICUgMSAqIDgpXG4gICkge1xuICAgIGNoYXJDb2RlID0gc3RyLmNoYXJDb2RlQXQoaWR4ICs9IDMgLyA0KTtcbiAgICBpZiAoY2hhckNvZGUgPiAweEZGKSB7XG4gICAgICB0aHJvdyBuZXcgRSgpO1xuICAgIH1cbiAgICBibG9jayA9IGJsb2NrIDw8IDggfCBjaGFyQ29kZTtcbiAgfVxuICByZXR1cm4gb3V0cHV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJ0b2E7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTQwL2dpLCAnQCcpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICB9LFxuXG4gICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgIH0sXG5cbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgfTtcbiAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgIH1cblxuICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgfTtcbiAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBpc0J1ZmZlciA9IHJlcXVpcmUoJ2lzLWJ1ZmZlcicpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBVUkxTZWFyY2hQYXJhbXMgIT09ICd1bmRlZmluZWQnICYmIHZhbCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpLnJlcGxhY2UoL1xccyokLywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0eXBlb2YgcmVzdWx0W2tleV0gPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltXG59O1xuIiwiLyohXG4gKiBEZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgQnVmZmVyXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGh0dHBzOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG4vLyBUaGUgX2lzQnVmZmVyIGNoZWNrIGlzIGZvciBTYWZhcmkgNS03IHN1cHBvcnQsIGJlY2F1c2UgaXQncyBtaXNzaW5nXG4vLyBPYmplY3QucHJvdG90eXBlLmNvbnN0cnVjdG9yLiBSZW1vdmUgdGhpcyBldmVudHVhbGx5XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPSBudWxsICYmIChpc0J1ZmZlcihvYmopIHx8IGlzU2xvd0J1ZmZlcihvYmopIHx8ICEhb2JqLl9pc0J1ZmZlcilcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKG9iaikge1xuICByZXR1cm4gISFvYmouY29uc3RydWN0b3IgJiYgdHlwZW9mIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIob2JqKVxufVxuXG4vLyBGb3IgTm9kZSB2MC4xMCBzdXBwb3J0LiBSZW1vdmUgdGhpcyBldmVudHVhbGx5LlxuZnVuY3Rpb24gaXNTbG93QnVmZmVyIChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmoucmVhZEZsb2F0TEUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIG9iai5zbGljZSA9PT0gJ2Z1bmN0aW9uJyAmJiBpc0J1ZmZlcihvYmouc2xpY2UoMCwgMCkpXG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIl19
