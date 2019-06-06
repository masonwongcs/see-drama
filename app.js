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
var compression = require("compression");

const db = require("./db");

const app = express();
const port = process.env.PORT || 3000;
const dramaUrl = "http://allrss.se" + "/dramas";
const regex = /<img.*?src='(.*?)'/;

app.set("view engine", "pug");
app.use("/dist", express.static(path.join(path.resolve(__dirname), "dist")));

// compress all responses
app.use(compression());

setDramaList = async dramaList => {
  await db.set("drama", dramaList);
};

getDramaList = async () => {
  let feed = await parser.parseURL(dramaUrl);
  let dramaList = [];

  let dramaDB = await db.get("drama");

  if (dramaDB) {
    dramaList = dramaDB;
  } else {
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
    // If first time get drama list then save to db
    await setDramaList(dramaList);
  }
  return dramaList;
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

getAllDramaList = async size => {
  const listSize = size;
  let dramaList = [];

  let dramaDB = await db.get("drama");

  await asyncForEach(dramaDB, async value => {
    const channel = queryString.parse(value.url).channel;
    let dramaTypeList = await db.get(channel);
    let dramaType = [];
    let count = 0;
    await asyncForEach(dramaTypeList, async value => {
      count++;
      if (listSize < count) {
        return;
      }
      dramaType.push(value);
    });
    let dramaListObj = {
      title: value.title,
      [channel]: dramaType,
      url: value.url
    };
    await dramaList.push(dramaListObj);
  });
  return dramaList;
};

setContent = async (key, content) => {
  await db.set([key], content);
};

updateContent = async (key, value) => {
  await db.update(key, value);
};

getContent = async (query, size) => {
  let feed = await parser.parseURL(dramaUrl + query);
  let contentList = [];
  let dramaDB = await db.get(queryString.parse(query).channel, size);
  if (dramaDB && dramaDB.length !== 0) {
    contentList = dramaDB;
  } else {
    feed.items
      .filter(item => !item.title.includes("Page"))
      .map((value, index) => {
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
  }
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

getVideo = async (query, setHeader) => {
  let episodeList = [];

  let res = await axios.get(
    query,
    setHeader
      ? {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57 RSSPlayer/2.9",
            IPADDRESS: "101.127.59.140"
          }
        }
      : {}
  );

  if (res.status === 200) {
    let feed = await parser.parseString(res.data);

    feed.items.map((value, index) => {
      let enclosure = value.enclosure;
      let dramaContent = {
        title: value.title,
        image: value.content,
        url: value.title.includes("Mirror")
          ? btoa(enclosure.url) + "a"
          : enclosure.url
      };
      episodeList.push(dramaContent);
    });
  }
  return episodeList;
};

getVideoLanguage = async (query, setHeader) => {
  let episodeList = [];

  let res = await axios.get(
    query,
    setHeader
      ? {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57 RSSPlayer/2.9",
            IPADDRESS: "101.127.59.140"
          }
        }
      : {}
  );

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

app.get("/api/list/all", async (req, res) => {
  const size = 20;
  const dramaList = await getAllDramaList(size);
  res.send(dramaList);
});

app.get("/drama", async (req, res) => {
  const title = req.query.channel;
  console.log(title);
  const contentList = await getContent(req._parsedUrl.search);
  res.render("drama", { title: title, content: contentList });
});

app.get("/api/drama", async (req, res) => {
  const size = req.query.size;
  console.log(size);
  const contentList = await getContent(req._parsedUrl.search, size);
  res.send(contentList);
});

// recently
// hk-drama
// hk-variety
// movies

updateDramaAPI = async (type, page) => {
  let feed = await parser.parseURL(
    `${dramaUrl}?channel=${type}&nocache=1${page !== 1 ? `&page=${page}` : ""}`
  );
  let contentList = [];
  feed.items
    .filter(item => !item.title.includes("Page"))
    .map((value, index) => {
      // if (size) {
      //   if (index >= size) return;
      // }
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

updateDrama = async (req, res) => {
  // await
  // await db.init();
  const dramaType = ["recently", "hk-drama", "hk-variety", "movies"];
  await dramaType.forEach(async (value, index) => {
    const channel = value;
    let dramaList = [];
    const pageSize = 50;

    for (let i = 1; i <= pageSize; i++) {
      let contentList = await updateDramaAPI(channel, i);
      console.log(contentList.length);
      if (contentList.length === 0) {
        break;
      }
      Array.prototype.push.apply(dramaList, contentList);
    }

    await setContent(channel, dramaList);
  });

  res.send("Update complete");
};

findContent = async (key, content) => {
  let result = await db.find(key, content);
  return result;
};

getFavourite = async (key, content) => {
  let result = await db.getFavourite(key, content);
  return result;
};

app.get("/update/drama", async (req, res) => {
  await updateDrama();
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
  const uuid = query;
  const queryStingDecoded = queryString.parse(atob(query.slice(0, -1)));
  let title = "";
  if (queryStingDecoded.title) {
    title = queryStingDecoded.title;
  } else {
    title = Object.values(queryStingDecoded)[1];
  }

  await getVideo(atob(query.slice(0, -1)), true).then(response => {
    if (
      response[0].title.includes("Mirror") ||
      response[0].title.includes("Openload") ||
      response[0].title.includes("Embed")
    ) {
      res.render("video", {
        channel: true,
        title: title,
        uuid: uuid,
        content: response
      });
    } else {
      res.render("video", {
        channel: false,
        title: title,
        uuid: uuid,
        content: JSON.stringify(response)
      });
    }
  });
});

app.get("/search", async (req, res) => {
  console.log(req.query.q);
  const dramaType = ["recently", "hk-drama", "hk-variety", "movies"];
  const query = req.query.q.toLowerCase();
  let result = [];
  await dramaType.forEach(async (value, index) => {
    const contentList = await findContent(value, query);
    Array.prototype.push.apply(result, contentList);
    // console.log(result)
    if (index === dramaType.length - 1) {
      // res.send(result);
      res.render("drama", { title: "search", content: result });
    }
  });
});

app.get("/api/search", async (req, res) => {
  const dramaType = ["recently", "hk-drama", "hk-variety", "movies"];
  const query = req.query.search;
  let result = [];
  await dramaType.forEach(async (value, index) => {
    const contentList = await findContent(value, query);
    Array.prototype.push.apply(result, contentList);
    // console.log(result)
    if (index === dramaType.length - 1) {
      res.send(result);
    }
  });
});

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.post("/api/favourite", async (req, res) => {
  const dramaType = ["recently", "hk-drama", "hk-variety", "movies"];
  const query = req.body.data;
  let result = [];

  await asyncForEach(Object.entries(query), async (value, index) => {
    let favouriteUrl = value[0];

    await asyncForEach(dramaType, async (value, index) => {
      const contentList = await getFavourite(value, favouriteUrl);
      Array.prototype.push.apply(result, contentList);
    });
  });
  let unique = [...new Set(result)];

  function getUnique(arr, comp) {
    const unique = arr
      .map(e => e[comp])

      // store the keys of the unique objects
      .map((e, i, final) => final.indexOf(e) === i && i)

      // eliminate the dead keys & store unique objects
      .filter(e => arr[e])
      .map(e => arr[e]);

    return unique;
  }

  res.send(getUnique(result, "url"));
});

const timeoutDuration = 15 * 60 * 1000;
console.log(`Start check drama every ${timeoutDuration / 1000} seconds.`);
setInterval(() => {
  updateDrama();
}, timeoutDuration);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
