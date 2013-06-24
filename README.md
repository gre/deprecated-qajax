Qajax
===
A simple Promise ajax library based on [Q](https://github.com/kriskowal/q).

**Qajax** is a simple and pure `XMLHttpRequest` wrapper.

Supported browsers
---

All browsers are supported including IE.

Tests
---

The library is stress-tested with `qunit` and a python server *(this will be rewrote in the future with a node server)* and test different edge-cases like different HTTP code, method, server lag,...

Usages and explanations
---

Qajax does not involve magic but do the strict minimum to work with **ajax** on all browsers (IE is supported!).

Qajax has been though with **Promise** and split up into simpler & composable parts (with `.then`).

```javascript
var promiseOfXHR = Qajax("/all.json");
// short version of: Qajax({ url: "/all.json", method: "GET" });
```

The `Qajax` function is **pure** in the sense that it returns a successful **Promise of XHR** when the server has returned a result and whatever the `status` code is.

If you want to filter only on success status, use the `Qajax.filterSuccess` function:

```javascript
var promiseOfSuccessfulXHR = 
  Qajax("/all.json").then(Qajax.filterSuccess);
```

You can also provide you own filter logic:
```javascript
var promiseOf200XHR = 
  Qajax("/all.json")
  .then(Qajax.filterStatus(function (code) {
    return code == 200; /* only support 200 */ 
  }));
```

You can then map it to a JSON:

```javascript
var promiseOfJson = 
  Qajax("/all.json")
  .then(Qajax.filterSuccess)
  .then(Qajax.toJSON);
```

Or use the shortcut JSON getter:

```javascript
var promiseOfJson = Qajax.getJSON("/all.json");
```

POST & submit data
---

Of-course, you can do POST with Qajax:

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

**Qajax.serialize**:

```javascript
var lastYearYoungPeople = 
  Qajax.getJSON("/people.json?"+Qajax.serialize({ from: "2012-01-01", to: "2013-01-01", "age$lt": 18 }));
  // will get from: "/people.json?from=2012-01-01&to=2013-01-01&age%24lt=18"
```

More advanced features
---

* Qajax have a **timeout**:

```javascript
var p = Qajax.ajax({ url: "/", timeout: 5000 });
// p will be rejected if the server is not responding in 5 seconds.
```

The default timeout is `Qajax.TIMEOUT` and can be overrided.

* You can set XHR headers by giving the header options.

* You can give your own XMLHttpRequest object to use!

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

