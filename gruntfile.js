module.exports = function(grunt) {

    // Project config.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'static/app.js',
                dest: 'static/dist.min.js'
            }
        },
        browserify: {
            client: {
                src: ['static/js/app.js'],
                dest: 'static/app.js',
                options: {}
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // Load the plugin for browserifying the modules.
    grunt.loadNpmTasks('grunt-browserify');
    // Default tasks.
    grunt.registerTask('default', ['browserify', 'uglify']);
};
