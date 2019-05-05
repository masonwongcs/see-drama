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
        let currentTitle = value.title;
        // let res = await axios.get("/api/drama/?" + value.url + "&size=20");
        let dramaTypeList = Object.values(value)[1];
        let firstImage = Object.values(value)[1][0].image;

        if (index === 0) {
          dramaListWrapper.prepend(
            $(
              `<div class="bg-image" style="background-image: url(${firstImage
                .split("?")[1]
                .replace("src=", "")
                .replace("&w=200&h=300", "")})"></div>`
            )
          );
        }

        // if (res.status === 200) {
        //   console.log(dramaTypeList);

        let dramaList = $(`<div class="drama-list"></div>`);
        let dramaListItem = $(`<div class="drama-list-item"></div>`);
        dramaTypeList.forEach(function(value, index) {
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
                ${dramaTitleEN ? dramaTitleEN : ""}${
            dramaTitleCN ? `<br />` : ""
          }${dramaTitleCN ? dramaTitleCN : ""}
              </h3>
            </a>
          `;
          dramaList.append(dramaItem);
        });
        dramaListItem.append(
          $(
            `
              <h1 class="drama-title">
                ${currentTitle}<a
                  class="see-more"
                  href="${"/drama?" + value.url}"
                >See more&nbsp;<i class="fas fa-chevron-right right-icon"></i></a>
              </h1>
            `
          )
        );

        dramaListItem.append(dramaList);
        dramaListItem.append($(`<div class="episode-wrapper"></div>`));
        dramaListWrapper.append(dramaListItem);
        // }
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
          setTimeout(function() {
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
            $("body").prepend(
              $(
                `<div class="bg-image" style="background-image: url(${res.data[0].image
                  .split("?")[1]
                  .replace("src=", "")
                  .replace("&w=200&h=300", "")})"></div>`
              )
            );
          }

          if (res.status === 200) {
            console.log(res.data);

            let dramaList = $(`<div class="drama-list"></div>`);
            res.data.forEach(function(value, index) {
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
                ${dramaTitleEN ? dramaTitleEN : ""}${
                dramaTitleCN ? `<br />` : ""
              }${dramaTitleCN ? dramaTitleCN : ""}
              </h3>
            </a>
          `;
              dramaList.append(dramaItem);
            });
            dramaListWrapper.append(
              $(
                `
              <h1 class="drama-title">
                ${currentTitle}<a
                  class="see-more"
                  href="${"/drama?" + value.url}"
                >See more</a>
              </h1>
            `
              )
            );
            dramaListWrapper.append(dramaList);
            dramaListWrapper.append($(`<div class="episode-wrapper"></div>`));
          }
          // });
          $("body")
            .append(dramaListWrapper)
            .ready(function() {
              console.log("ready");
              // carousel.on('dragStart.flickity', () => carousel.find('.slide').css('pointer-events', 'none'));
              // carousel.on('dragEnd.flickity', () => carousel.find('.slide').css('pointer-events', 'all'));
            });

          console.log(index, totalIndex);
          // if (index === totalIndex - 1) {
          carousel = $(".drama-list").flickity({
            // options
            contain: true,
            // freeScroll: true,
            wrapAround: true,
            pageDots: false
          });
          $(".placeholder").addClass("ready");
          setTimeout(function() {
            $(".placeholder").remove();
          }, 900);
          // }
        });
      }
    }
  }
};

loadEpisodes = async url => {
  let res = await axios.get(url);
  return res.data;
};

// getEpisode = async () => {
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

$(document).ready(function() {
  if (
    location.pathname === "/" ||
    location.pathname === "/drama" ||
    location.pathname === "/search"
  ) {
    if (location.pathname === "/") {
      loadDramaSeries();
    }

    if ($(".video-player").length !== 0) {
      // videoPlayer.init();
    }

    console.log(firebase.checkLogin($(".login-btn")));

    $(".login-btn").click(function(e) {
      e.preventDefault();
      var that = $(this);

      firebase.loginWithPopup(that);
    });

    $(".login-wrapper .logout").click(function(e) {
      e.preventDefault();
      firebase.logout($(".login-btn"));
    });

    $(document).on("click", ".drama-item", async function(e) {
      e.preventDefault();
      if (!isFetching) {
        $(this).addClass("active");
        $(".drama-item")
          .not($(this))
          .removeClass("active");
        isFetching = true;
        $(".drama-list").removeClass("active");
        $(".drama-list-item").removeClass("active");
        setTimeout(function() {
          $(".episode-wrapper").empty();
        }, 400);

        //Slide down the episode container
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
        const currDramaBgStyle = $(this)
          .data("img")
          .split("?")[1]
          .replace("src=", "")
          .replace("&w=200&h=300", "");
        const dramaTitleCN = $(this).data("title-cn");
        const dramaTitleEN = $(this).data("title-en");
        let episodeContainer = $(`<div class="episode-container"></div>`);
        let episodes = await loadEpisodes(currDrama);
        let episodePoster = $(
          `<div class="episode-poster" style="background-image: url(${currDramaBgStyle})"></div>`
        );
        let episodeList = $(`<div class="episode-list"></div>`);
        episodes.forEach(function(value, index) {
          let uuid = value.url;
          let percentage = 0;

          firebase.getVideoTime(uuid, function(time) {
            if (time) {
              percentage = time.percentage;
            }

            let episodeItem = $(
              `
              <a
                href="/video?${value.url}"
                class="episode-item"
                data-video="/video?${value.url}"
                data-uuid="${uuid}"
                ></a>
            `
            );
            // episodeItem.text(index + 1);

            episodeItem.text(value.title);
            episodeItem.append(
              $(
                `<div class="data-percentage" style="width: ${percentage}%"></div>`
              )
            );
            episodeList.append(episodeItem);
          });
        });
        episodeContainer.append(
          $(` <h3 class="title">
                ${dramaTitleEN ? dramaTitleEN : ""}${
            dramaTitleCN ? `<br />` : ""
          }${dramaTitleCN ? dramaTitleCN : ""}
              </h3>`)
        );
        episodeContainer.append(episodeList);
        episodeContainer.append(episodePoster);
        episodeContainer.append(
          $(`<a class="close" href="#!"><i class="fas fa-times"></i></a>`)
        );

        $(".drama-item")
          .not($(this))
          .removeClass("active");
        if (location.pathname === "/") {
          $(this)
            .closest(".drama-list-item")
            .addClass("active");
          $(this)
            .closest(".drama-list")
            .addClass("active")
            .next(".episode-wrapper")
            .append(episodeContainer);
          // .slideDown();
        } else {
          $(this)
            .closest(".drama-list")
            .addClass("active")
            .next(".episode-wrapper")
            .append(episodeContainer);
          $("body").addClass("fixed");
          // .fadeIn();
        }

        $(document).on("click", ".episode-wrapper .close", function(e) {
          e.preventDefault();
          $(".drama-list").removeClass("active");
          $(".drama-list-item").removeClass("active");
          setTimeout(function() {
            if (location.pathname === "/") {
              $(".episode-wrapper")
                // .slideUp()
                .empty();
            } else {
              $(".episode-wrapper")
                // .fadeOut()
                .empty();
              $("body").removeClass("fixed");
            }
          }, 400);

          $(".drama-item").removeClass("active");
        });
        isFetching = false;
      }
    });

    $(document).on("click", ".episode-item", function(e) {
      e.preventDefault();
      $(".videoLoader")
        .attr("src", $(this).data("video"))
        .fadeIn();
    });
  }

  window.addEventListener("message", function(e) {
    console.log(e);
    var jsonData = JSON.parse(e.data);
    var uuid = jsonData.uuid;
    var percentage = jsonData.percentage;
    if (jsonData.action === "close") {
      $(".videoLoader")
        .removeAttr("src")
        .fadeOut();
    }
    if (jsonData.percentage) {
      $('[data-uuid="' + uuid + '"] .data-percentage').css(
        "width",
        percentage + "%"
      );
    }
  });

  $(window).on("scroll", function(e) {
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
