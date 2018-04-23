

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    // Project config.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                sourceMap: true
            },
            build: {
                src: 'static/app.js',
                dest: 'static/dist.min.js'
            }
        },
        browserify: {
            dist: {
                options: {
                    browserifyOptions: {
                        debug: true
                    },
                    debug: true,
                    transform: [['babelify', {presets: ['env', 'react']}]]
                },
                src: ['static/js/app.js'],
                dest: 'static/app.js'
            }
        }
    });

    grunt.registerTask('default', ['browserify', 'uglify']);
};
