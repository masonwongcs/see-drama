const axios = require("axios");

loadDramaSeries = async () => {
  let res = await axios.get("/api/list");

  if (res.status === 200) {
    let dramaListWrapper = $(`<div class="drama-list-wrapper"></div>`);
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
          }, 1000);

          // carousel.on('dragStart.flickity', () => carousel.find('.slide').css('pointer-events', 'none'));
          // carousel.on('dragEnd.flickity', () => carousel.find('.slide').css('pointer-events', 'all'));
        });
    });
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
    $(document).on("click", ".drama-item", async function(e) {
      e.preventDefault();
      if (!isFetching) {
        $(this).addClass("active");
        isFetching = true;
        $(".episode-wrapper")
          .slideUp()
          .empty();
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
          let episodeItem = $(
            `<a href="/video?${
              value.url
            }" class="episode-item" data-video="/video?${value.url}"></a>`
          );
          // episodeItem.text(index + 1);

          episodeItem.text(value.title);
          episodeList.append(episodeItem);
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
        episodeContainer.append($(`<a class="close" href="#!"><i class="fas fa-times"></i></a>`));

        $(".drama-item")
          .not($(this))
          .removeClass("active");
        if (location.pathname === "/") {
          $(this)
            .closest(".drama-list")
            .addClass("active")
            .next(".episode-wrapper")
            .append(episodeContainer)
            .slideDown();
        } else {
          $(this)
            .closest(".drama-list")
            .addClass("active")
            .next(".episode-wrapper")
            .append(episodeContainer)
            .fadeIn();
        }

        $(document).on("click", ".episode-wrapper .close", function(e) {
          e.preventDefault();
          if (location.pathname === "/") {
            $(".episode-wrapper")
              .slideUp()
              .empty();
          } else {
            $(".episode-wrapper")
              .fadeOut()
              .empty();
          }

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
    if (e.data === "close") {
      $(".videoLoader")
        .removeAttr("src")
        .fadeOut();
    }
  });

  $(window).on("scroll", function(e) {
    let top = $("header").offset().top;
    if (top > 30) {
      $("header").addClass("visible");
    } else {
      $("header").removeClass("visible");
    }
  });
});
