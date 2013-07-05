module.exports = function(grunt) {
  var browsers = [{
    browserName: "internet explorer",
    version: "8"
  },{
    browserName: "internet explorer",
    version: "9"
  },{
    browserName: "internet explorer",
    version: "10"
  },{
    browserName:"android",
    version: "4.0"
  },{
    browserName:"iphone"
  },{
    browserName: "chrome",
    platform: "linux"
  },{
    browserName: "chrome",
    platform: "Windows 7"
  },{
    browserName: "googlechrome",
    platform: "Windows XP"
  },{
    browserName: "firefox",
    version: "21"
  },{
    browserName: "firefox",
    version: "20"
  },{
    browserName: "firefox",
    version: "19"
  },{
    browserName: "firefox",
    version: "18"
  },{
    browserName:"safari",
    version: "6"
  },{
    browserName:"safari",
    version: "5"
  }];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> - <%= pkg.description %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      all: {
        src: ['src/<%= pkg.name %>.js']
      }
    },
    docco: {
      all: {
        src: ['src/*.js'],
        options: {
          output: 'docs/'
        }
      }
    },
    watch: {
      all: {
        files: ['src/*.js'],
        tasks: ['default']
      }
    },
    'saucelabs-qunit': {
      all: {
        options: {
          urls: ["http://127.0.0.1:9999/test/index.html"],
          tunnelTimeout: 5,
          build: (new Date()).getTime(),
          concurrency: 1,
          browsers: browsers,
          testname: "Qajax tests",
          testReadyTimeout: 30000,
          tags: ["master"]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.registerTask('mock-server', 'Start a mock server to test Qajax.', function() {

    function delay (callback, timeout) {
      setTimeout(callback, timeout);
    }

    var connect = require('connect'), URL = require('url');
    grunt.log.writeln('Starting server...');
    connect().use(function (req, res, next) {
      var url = URL.parse(req.url, true);
      var handle = (function () {
        var status = ("status" in url.query) ? parseInt(url.query.status) : 200;
        if (url.pathname == "/ECHO") {
          return function () {
            res.writeHead(status);
            req.pipe(res);
          };
        }
        if (url.pathname.indexOf("/test/dataset/")===0) {
          req.method = "GET"; // next layer will behave like a GET so return the dataset content as a result.
          return function () {
            if (status != 200) {
              res.statusCode = status; // next layer will have this default statusCode for the response.
            }
            return next();
          };
        }
        return next;
      }());
      if ("latency" in url.query)
        delay(handle, parseInt(url.query.latency));
      else
        handle();
    })
    .use(connect.static(__dirname))
    .listen(9999);
  });

  grunt.registerTask('default', ['jshint', 'uglify', 'docco']);
  grunt.registerTask('test-local', ['mock-server', "watch"]);
  grunt.registerTask('test', ['mock-server', "saucelabs-qunit"]);

};
