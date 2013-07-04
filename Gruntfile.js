module.exports = function(grunt) {
  var browsers = [{
    browserName: "chrome",
    platform: "linux"
  },{
    browserName: "chrome",
    platform: "Windows 7"
  },{
    browserName: "googlechrome",
    platform: "Windows XP"
  },{
    browserName: "internet explorer",
    platform: "Windows 8",
    version: "10"
  },{
    browserName: "firefox",
    platform: "Windows 8",
    version: "21"
  },{
    browserName: "firefox",
    platform: "Windows 8",
    version: "20"
  },{
    browserName: "firefox",
    platform: "Windows 8",
    version: "19"
  },{
    browserName: "firefox",
    platform: "Windows 8",
    version: "18"
  },{
    browserName: "firefox",
    platform: "Windows 8",
    version: "17"
  },{
    browserName: "firefox",
    platform: "Windows 8",
    version: "16"
  },{
    browserName:"iphone",
    platform: "OS X 10.8",
    version: "6"
  },{
    browserName:"iphone",
    platform: "OS X 10.8",
    version: "5.1"
  },{
    browserName:"iphone",
    platform: "OS X 10.6",
    version: "5.0"
  },{
    browserName:"safari",
    platform: "OS X 10.8",
    version: "6"
  },{
    browserName:"safari",
    platform: "OS X 10.6",
    version: "5"
  },{
    browserName:"android",
    platform: "Linux",
    version: "4.0"
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
          concurrency: 3,
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

  grunt.registerTask('default', ['jshint', 'uglify', 'docco']);
  grunt.registerTask('test', ['connect', "saucelabs-qunit"]);

};
