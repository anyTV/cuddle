'use strict';


module.exports = (grunt) => {

    grunt.initConfig({
        eslint: {
            src: [
                'gruntfile.js',
                'src/**/*.js',
                'test/**/*.js'
            ],
            options: {
                configFile: '.eslintrc'
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
            files: ['<%= eslint.src %>'],
            tasks: ['eslint', 'rollup'],
            options: {
                spawn: false
            }
          }
        }
    });

    grunt.loadNpmTasks('gruntify-eslint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-rollup');

    grunt.registerTask('test', ['eslint']);
    grunt.registerTask('test-watch', ['eslint', 'watch']);
    grunt.registerTask('build', ['eslint', 'rollup']);
    grunt.registerTask('default', ['eslint', 'rollup', 'watch']);

};
