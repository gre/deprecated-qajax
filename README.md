Qajax
===
A simple Promise-based ajax library based on [Q](https://github.com/kriskowal/q).

**Qajax** is a simple and pure `XMLHttpRequest` wrapper.

Supported browsers
---

All browsers are supported (including IE).

[![SauceLabs Status](https://saucelabs.com/browser-matrix/qajax.svg)](https://saucelabs.com/u/qajax)

Installation
---

```sh
bower install qajax
```

Also available on [NPM](https://npmjs.org/package/qajax).

Links
---

[Checkout the Annotated Source Code](http://greweb.me/qajax/docs/qajax.html)

Usages and explanations
---

**Qajax** does not involve magic but does the strict minimum to work with **ajax** on all browsers (IE is supported!).

**Qajax** has been designed using **Promise** and split up into pure functions composable with `.then`.

The `Qajax` function **just** returns a successful **Promise of XHR** when the server has returned a result - whatever the `status` code is.


There are 3 possible signatures:

```javascript
Qajax(url: String) => Promise[XHR]
Qajax(options: Object) => Promise[XHR]
Qajax(url: String, options: Object) => Promise[XHR]
```

Simple usage:

```javascript
var promiseOfXHR = Qajax("/all.json");
// short version of: Qajax({ url: "/all.json", method: "GET" });
```

At this time, the promise is only rejected if the server has failed to reply to the client (network problem or timeout reached).

If you want to **filter only on success statuses**, then you need the `Qajax.filterSuccess` function:

```javascript
var promiseOfSuccessfulXHR = 
  Qajax("/all.json").then(Qajax.filterSuccess);
```

But you can also **provide you own filter logic**:

```javascript
var promiseOf200XHR = 
  Qajax("/all.json")
  .then(Qajax.filterStatus(function (code) {
    return code == 200; /* only support 200 */ 
  }));
```

And at the end you can **map it to a JSON**:

```javascript
var promiseOfJson = 
  Qajax("/all.json")
  .then(Qajax.filterSuccess)
  .then(Qajax.toJSON);
```

Or you can use the getJSON shortcut for this specific use-case:

```javascript
var promiseOfJson = Qajax.getJSON("/all.json");
```

POST & submit data
---

Of-course, you can use other HTTP Verbs like POST with **Qajax**:

```javascript
Qajax({ url: "/entry", method: "POST" })
  .then(Qajax.filterSuccess)
  .get("responseText") // using a cool Q feature here
  .then(function (txt) {
    console.log("server returned: "+txt);
  }, function (err) {
    console.log("xhr failure: ", err);
  });
```

You can also submit some data as JSON:

```javascript
Qajax({ url: "/people", method: "POST", data: { name: "Gaetan", age: 23 } })
  .then(Qajax.filterSuccess)
  .then(doYourSuccessStuff, displayAnError)
  .done();
```

Helpers
---

**Qajax.serialize** helps you to deal with query string parameters:

```javascript
var lastYearYoungPeople = 
  Qajax.getJSON("/people.json?"+Qajax.serialize({ from: "2012-01-01", to: "2013-01-01", "age$lt": 18 }));
  // will get from: "/people.json?from=2012-01-01&to=2013-01-01&age%24lt=18"
```

More advanced features
---

* Qajax has a **timeout**:

```javascript
var p = Qajax("/", { timeout: 5000 });
// p will be rejected if the server is not responding in 5 seconds.
```

The default timeout is `Qajax.TIMEOUT` and can be overriden.

* You can set XHR headers by giving the `header` options.

* You can give your own `XMLHttpRequest` object to use!

Here is a typical use case:

```javascript
var xhr = null;
function getResults (query) {
  if (xhr) {
    xhr.abort();
  }
  xhr = new XMLHttpRequest();
  return Qajax({
    url: "/search?"+Qajax.serialize({ q: query }),
    xhr: xhr
  })
  .then(Qajax.filterSuccess)
  .then(Qajax.toJSON);
}
/*
 * getResults can be called typically for a typeahead,
 * it ensures it never creates 2 requests at the same time,
 * the previous xhr is aborted if still running so it let the latest query have the priority.
 */
```

Tests
---

The library is stress-tested with `qunit` and a mock node.js server which test different edge-cases like different HTTP code, method, server lag,...

[![SauceLabs Status](https://saucelabs.com/browser-matrix/qajax.svg)](https://saucelabs.com/u/qajax)

Test locally: `grunt test-local` and go to `http://localhost:9999/test/`.

Development
---

Install dev deps with ```npm install```.
Then run ```grunt```.

Release Note
---

0.1.4

* AMD module compatibility

0.1.3

* Add new signature `Qajax(url, settings)` + validation

0.1.2

* Using require('q') properly

0.1.1

* Fix CommonJS compatibility

0.1.0

* Initial release with Qajax, filterStatus, filterSuccess, toJSON, getJSON, serialize
