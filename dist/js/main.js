"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var axios = require("axios");

$(document).ready(function () {
  var _this = this;

  loadDramaSeries();

  loadDramaSeries = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var res, dramaListWrapper;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              res = axios.get({
                url: "/api/list"
              });


              if (res.status === 200) {
                dramaListWrapper = $("<div class=\"drama-list-wrapper\"></div>");

                res.data.forEach(function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(value, index) {
                    var res, dramaList;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.next = 2;
                            return axios.get({
                              url: "/api/drama/?" + value.url + "&size=10"
                            });

                          case 2:
                            res = _context.sent;


                            if (res.status === 200) {
                              console.log(res.data);

                              dramaList = $("<div class=\"drama-list\"></div>");

                              res.data.forEach(function (value, index) {
                                var dramaItem = "\n              <a href=\"/episode?" + value.url + "\" class=\"drama-item carousel-cell\">\n                <img src=\"" + value.image + "\" />\n                <h3>" + value.title + "</h3>\n              </a>\n            ";
                                dramaList.append(dramaItem);
                              });

                              dramaListWrapper.append(dramaList);
                            }
                            // });
                            $("body").append(dramaListWrapper).ready(function () {
                              console.log("ready");
                              $(".drama-list").flickity({
                                // options
                                contain: true
                              });
                            });

                          case 5:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, _this);
                  }));

                  return function (_x, _x2) {
                    return _ref2.apply(this, arguments);
                  };
                }());
              }

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function loadDramaSeries() {
      return _ref.apply(this, arguments);
    };
  }();
});