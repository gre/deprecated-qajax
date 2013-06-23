module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      all: {
        options: {
          banner: '/*! <%= pkg.name %> <%= pkg.version %> - <%= pkg.description %> */\n'
        },
        build: {
          src: 'src/<%= pkg.name %>.js',
          dest: 'build/<%= pkg.name %>.min.js'
        }
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-docco');

  grunt.registerTask('default', ['jshint', 'uglify', 'docco']);

};
