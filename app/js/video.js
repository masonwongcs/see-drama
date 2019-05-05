const firebase = require("./firebase");

const init = () => {
  window.videoPlayerClose = function(uuid) {
    // const uuid = "!{uuid}";
    let percentage = 100;
    firebase.getVideoTime(uuid, function(time) {
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

  window.videoPlayer = async function(video, uuid) {
    // console.log(video, uuid);
    if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
      $("#player source").attr("src", video[1].url);
    } else {
      const player = new Plyr("#player");
      var playedTime = 0;

      let time = await firebase.getVideoTime(uuid, function(time) {
        console.log(time);
        if (time) {
          playedTime = time.currentTime;
          console.log(time);
          // player.currentTime = playedTime;
        }

        player.source = {
          type: "video",
          title: "Example title",
          currentTime: 200,
          sources: [
            {
              src: video[0].url,
              type: "video/mp4",
              size: 360
            },
            {
              src: video[1].url,
              type: "video/mp4",
              size: 720
            }
          ]
        };

        // player.on('loadedmetadata', function () {
        //     player.currentTime(100);
        // });
        var getTime = false;

        player.on("ready", function() {
          console.log("currentTime:", player.currentTime);
          var forwardInterval = setInterval(function() {
            if (player.currentTime !== playedTime) {
              player.currentTime = playedTime;
            } else {
              clearInterval(forwardInterval);
              getTime = true;
            }
          }, 200);
          console.log("forward currentTime:", player.currentTime);
        });

        setTimeout(function() {
          player.play();
        }, 1000);

        player.on("play", function() {
          setTimeout(function() {
            setInterval(function() {
              if (getTime) {
                var currentTime = player.currentTime;
                var duration = player.duration;
                // console.log(currentTime, duration)
                var episodeObj = {
                  currentTime: currentTime,
                  percentage: (currentTime / duration) * 100
                };
                firebase.setVideoData(uuid, episodeObj);
              }
            }, 1000);
          }, 2000);
        });

        var timer;
        var hidding = false;
        $(function() {
          $(".plyr").mousemove(function() {
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
            timer = setTimeout(function() {
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
