const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// // Set some defaults
// db.defaults({ posts: [], user: {} })
//     .write()
//
// // Add a post
// db.get('posts')
//     .push({ id: 1, title: 'lowdb is awesome'})
//     .write()

// recently
// hk-drama
// hk-variety
// movies

module.exports.init = async function() {
  // Set some defaults (required if your JSON file is empty)
  db.defaults({
    drama: [],
    recently: [],
    "hk-drama": [],
    "hk-variety": [],
    movies: []
  }).write();
};

module.exports.set = async function(key, value) {
  // Set a user using Lodash shorthand syntax
  await db.set(key, value).write();
  return key + " saved to DB";
};

module.exports.update = async function(key, value) {
  // Set a user using Lodash shorthand syntax
  // Add a post
  await db
    .get("content")
    .push({ [key]: value })
    .write();
  return key + " udpated to DB";

  //
  // db.get('posts')
  //     .push({ id: 1, title: 'lowdb is awesome'})
  //     .write()
};

module.exports.get = async function(key, size) {
  // Set a user using Lodash shorthand syntax
  // db.get("drama").value();
  let value;
  if (size) {
    value = db
      .get(key)
      .take(size)
      .value();
  } else {
    value = db.get(key).value();
  }

  return value;
};
