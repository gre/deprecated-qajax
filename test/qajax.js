
function resetDefaults () {
    Qajax.defaults.logs = true;
    Qajax.defaults.timeout = 1000;
    Qajax.defaults.ie = true;
    Qajax.defaults.method = "GET";
    Qajax.defaults.headers = {};
    Qajax.defaults.base = "";
}

var sample01url = "/test/dataset/sample01.json";
var sample01json = [
  { "name": "Jerome", "age": 20 },
  { "name": "Gerard", "age": 30 },
  { "name": "Martine", "age": 43 }
];

var emptyUrl = "/test/dataset/empty";

function urlWithOptions (url, options) {
  return url+"?"+Qajax.serialize(options);
}

function log (o) {
    if (window.console) console.log(o);
}

function checkNotSuccess (res) { log(res); throw "The result should never be successful!"; }
function checkNotError (err) { log(err); throw "An error has been reached. "+err; }

test("check the API needed for the test engine", function() {
  resetDefaults();
  ok(typeof Qajax=="function", "Qajax exists");
  ok(typeof Qajax.filterStatus=="function", "filterStatus exists");
  ok(typeof Qajax.filterSuccess=="function", "filterSuccess exists");
  ok(typeof Qajax.getJSON=="function", "getJSON exists");
  equal(Qajax.serialize({ foo: 123, bar: "toto" }), "foo=123&bar=toto", "serialize works");
});

asyncTest("Qajax.getJSON successful", 1, function() {
  resetDefaults();
  function checkResult (res) {
    deepEqual(res, sample01json, "sample01.json successfully retrieved.");
  }
  Qajax.getJSON(sample01url)
     .then(checkResult, checkNotError)
     .fin(start);
});

asyncTest("Qajax successful", 1, function() {
  resetDefaults();
  function checkResult (res) {
    deepEqual(res, sample01json, "sample01.json successfully retrieved.");
  }
  Qajax(sample01url)
     .then(Qajax.filterSuccess)
     .then(Qajax.toJSON)
     .then(checkResult, checkNotError)
     .fin(start);
});

asyncTest("Qajax failure when 404 Not Found", 2, function() {
  resetDefaults();
  function checkError (e) {
    ok(true, "has error.");
    equal(e.status, 404, "e is a XHR which has a 404 status.");
  }
  Qajax(urlWithOptions(emptyUrl, { status: 404 }))
     .then(Qajax.filterSuccess)
     .then(Qajax.toJSON)
     .then(checkNotSuccess, checkError)
     .fin(start);
});



asyncTest("data can be sent", function() {
  resetDefaults();
  var data = "1234567890\nazerty\nuiopqsdfghjklm\nwxcvbn\n";
  function checkData (xhr) {
    ok(xhr.responseText, "has responseText");
    equal(xhr.responseText, data, "is exactly the same data");
  }
  Qajax({
    method: "POST",
    url: "/ECHO",
    data: data
  })
    .then(Qajax.filterSuccess)
    .then(checkData, checkNotError)
    .fin(start);
});

asyncTest("json data can be sent", function() {
  resetDefaults();
  var data = { foo: 123, bar: { value: 42 }, arr: [1, 2, 3] };
  function checkData (json) {
    deepEqual(json, data, "json is exactly the same data");
  }
  Qajax({
    method: "POST",
    url: "/ECHO",
    data: data
  })
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(checkData, checkNotError)
    .fin(start);
});

asyncTest("Qajax filter only 200 will make a 201 an error", 2, function() {
  function checkError (e) {
    ok(true, "has error.");
    equal(e.status, 201, "status is 201");
  }
  resetDefaults();
  Qajax({ url: urlWithOptions(emptyUrl, { status: 201 }) })
     .then(Qajax.filterStatus(200))
     .then(checkNotSuccess, checkError)
     .fin(start);
});

asyncTest("Qajax failure with 500", 2, function() {
  function checkError (e) {
    ok(true, "has error.");
    equal(e.status, 500, "e is a XHR which has a 500 status.");
  }
  resetDefaults();
  Qajax({
    method: "POST",
    url: urlWithOptions(emptyUrl, { status: 500 })
  })
     .then(Qajax.filterSuccess)
     .then(Qajax.toJSON)
     .then(checkNotSuccess, checkError)
     .fin(start);
});

asyncTest("an external XHR can be used and abort() manually", function() {
  function checkError (e) {
    ok(true, "has error.");
    equal(e.readyState, 0, "readyState is 0 (the request has been abort)");
    notEqual(e.status, 200, "status is not 200");
  }
  resetDefaults();
  var xhr = new XMLHttpRequest();
  Qajax({ xhr: xhr, url: urlWithOptions(emptyUrl, { latency: 400 }) })
     .then(Qajax.filterSuccess)
     .then(Qajax.toJSON)
     .then(checkNotSuccess, checkError)
     .fin(start);
  setTimeout(function(){
    xhr.abort();
  }, 100);
});

asyncTest("Qajax default timeout works", function() {
  function checkError (e) {
    ok(true, "has error.");
    equal(e.readyState, 0, "readyState is 0 (the request was never finished)");
    notEqual(e.status, 200, "status is not 200");
  }
  resetDefaults();
  Qajax.defaults.timeout = 200;
  Qajax({
    method: "DELETE",
    url: urlWithOptions(sample01url, { latency: 500 })
  })
    .then(checkNotSuccess, checkError)
    .fin(start);
});

asyncTest("Qajax timeout can be overrided", function() {
  function checkSuccess (e) {
    ok(true, "request has finished.");
    equal(e.status, 200, "status is 200");
  }
  resetDefaults();
  Qajax({
    method: "POST",
    url: urlWithOptions(sample01url, { latency: 300 }),
    timeout: 2000
  })
    .then(checkSuccess, checkNotError)
    .fin(start);
});

asyncTest("Qajax timeout can be disabled", function() {
  function checkSuccess (e) {
    ok(true, "request has finished.");
    equal(e.status, 200, "status is 200");
  }
  resetDefaults();
  Qajax.defaults.timeout = 200;
  Qajax({
    method: "DELETE",
    url: urlWithOptions(sample01url, { latency: 500 }),
    timeout: 0
  })
    .then(checkSuccess, checkNotError)
    .fin(start);
});

asyncTest("Qajax headers can be sent", function() {
  resetDefaults();
  Qajax({
    headers: { "X-Hello": "world" },
    method: "GET",
    url: "/ECHO_HEADERS"
  })
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(function (json) {
        log(json);
        equal(json["x-hello"], "world", "The custom X-Hello header has been successfully sent");
    })
    .fail(checkNotError)
    .fin(start);
});

asyncTest("Qajax base url", function() {
  resetDefaults();
  Qajax("sample01.json", {
      base: "/test/dataset/"
  })
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(function (json) {
        deepEqual(json, sample01json, "base url works");
    })
    .fail(checkNotError)
    .fin(start);
});


