'use strict';


module.exports = (grunt) => {

    grunt.initConfig({
        jshint: {
            files: [
                'gruntfile.js',
                'src/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        rollup: {
            options: {
                format: 'cjs'
            },
            files: {
                src: 'src/Cuddle.js',
                dest: 'index.js'
            }
        },


        watch: {
          rollup: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'rollup'],
            options: {
                spawn: false
            }
          }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-rollup');

    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('test-watch', ['jshint', 'watch']);
    grunt.registerTask('build', ['rollup']);
    grunt.registerTask('default', ['jshint', 'rollup', 'watch']);

};