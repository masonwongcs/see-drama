const loginWithPopup = selector => {
  firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(function() {
      // Existing and future Auth states are now persisted in the current
      // session only. Closing the window would clear any existing state even
      // if a user forgets to sign out.
      // ...
      // New sign-in will be persisted with session persistence.
      const provider = new firebase.auth.GoogleAuthProvider();
      return firebase
        .auth()
        .signInWithPopup(provider)
        .then(function(result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;

          console.log(user);

          selector
            .css("background-image", `url(${user.photoURL})`)
            .addClass("login");
          // ...
        })
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        });
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
    });
};

const checkLogin = selector => {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      console.log(user);
      selector
        .css("background-image", `url(${user.photoURL})`)
        .parents(".login-wrapper")
        .addClass("login");
    } else {
      // No user is signed in.
    }
  });
};

const logout = selector => {
  firebase
    .auth()
    .signOut()
    .then(
      function() {
        // Sign-out successful.
        selector
          .css("background-image", "")
          .parents(".login-wrapper")
          .removeClass("login");
      },
      function(error) {
        // An error happened.
        console.log(error);
      }
    );
};

const setVideoData = (uuid, episodeObj) => {
  // Get a reference to the database service
  firebase.auth().onAuthStateChanged(function(user) {
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
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var userId = user.uid;
      var database = firebase.database();

      var users = database.ref("users/" + userId + "/" + uuid);
      users.once("value", function(snapshot) {
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
