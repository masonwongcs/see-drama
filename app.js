const express = require("express");
const axios = require("axios");
const Feed = require("rss-to-json");
let Parser = require("rss-parser");
let parser = new Parser();
const queryString = require("query-string");
const request = require("request");
const btoa = require("btoa");
const atob = require("atob");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const dramaUrl = "http://allrss.se" + "/dramas";
const regex = /<img.*?src='(.*?)'/;

app.set("view engine", "pug");
app.use("/dist", express.static(path.join(path.resolve(__dirname), "dist")));

getDramaList = async () => {
  let feed = await parser.parseURL(dramaUrl);
  let dramaList = [];

  feed.items
    .filter(
      item =>
        !(
          item.title === "All Channel" ||
          item.title.includes("Anime") ||
          item.title.includes("US TV Series") ||
          item.title.includes("Korean") ||
          item.title.includes("Janpanese") ||
          item.title.includes("Chinese") ||
          item.title.includes("Taiwan") ||
          item.title.includes("English Subtitles")
        )
    )
    .map((value, index) => {
      let enclosure = value.enclosure;
      let image = regex.exec(value.content)[1];
      let dramaContent = {
        title: value.title,
        image: image,
        url: enclosure.url.split("?")[1]
      };
      dramaList.push(dramaContent);
    });

  return dramaList;
};

getContent = async (query, size) => {
  let feed = await parser.parseURL(dramaUrl + query);
  let contentList = [];

  feed.items.map((value, index) => {
    if (size) {
      if (index >= size) return;
    }
    let enclosure = value.enclosure;
    let image = regex.exec(value.content)[1];
    let dramaContent = {
      title: value.title,
      // image: image.replace("http://allrss.se/dramas/timthumb.php?src=", "").replace("&w=150&h=84", ""),
      image: image.replace("&w=150&h=84", "&w=200&h=300"),
      url: enclosure.url.split("?")[1]
    };
    contentList.push(dramaContent);
  });

  return contentList;
};

getEpisode = async query => {
  let feed = await parser.parseURL(dramaUrl + query);
  let contentList = [];

  feed.items.map((value, index) => {
    let enclosure = value.enclosure;
    let image = regex.exec(value.content)[1];
    let dramaContent = {
      title: value.title,
      image: image,
      url: btoa(enclosure.url) + "g"
    };
    contentList.push(dramaContent);
  });

  return contentList;
};

getVideo = async query => {
  let episodeList = [];

  let res = await axios.get(query, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57 RSSPlayer/2.9",
      IPADDRESS: "101.127.59.140"
    }
  });

  if (res.status === 200) {
    let feed = await parser.parseString(res.data);

    feed.items.map((value, index) => {
      let enclosure = value.enclosure;
      let dramaContent = {
        title: value.title,
        image: value.content,
        url: enclosure.url
      };
      episodeList.push(dramaContent);
    });
  }
  return episodeList;
};

app.get("/", async (req, res) => {
  const dramaList = await getDramaList();
  // res.send(dramaList)
  res.render("index", { content: dramaList });
});

app.get("/api/list", async (req, res) => {
  const dramaList = await getDramaList();
  // res.send(dramaList)
  res.send(dramaList);
});

app.get("/drama", async (req, res) => {
  const title = req.query.channel;
  console.log(title)
  const contentList = await getContent(req._parsedUrl.search);
  res.render("drama", { title: title, content: contentList });
});

app.get("/api/drama", async (req, res) => {
  const size = req.query.size;
  console.log(size);
  const contentList = await getContent(req._parsedUrl.search, size);
  res.send(contentList);
});

app.get("/episode", async (req, res) => {
  const contentList = await getEpisode(req._parsedUrl.search);
  res.render("episode", { content: contentList });
});

app.get("/api/episode", async (req, res) => {
  const contentList = await getEpisode(req._parsedUrl.search);
  res.send(contentList);
});

app.get("/video", async (req, res) => {
  const query = req._parsedUrl.query;
  await getVideo(atob(query.slice(0, -1))).then(response => {
    res.render("video", { content: JSON.stringify(response) });
  });
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
