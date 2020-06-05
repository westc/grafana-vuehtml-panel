module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-es6-module-transpiler');

    grunt.initConfig({

        clean: ["dist"],

        copy: {
            src_to_dist: {
                cwd: 'src',
                expand: true,
                src: ['**/*', '!**/*.js', '!**/*.scss'],
                dest: 'dist'
            },
            img_to_dist: {
                cwd: 'src',
                expand: true,
                src: ['img/*'],
                dest: 'dist/'
            },
            pluginDef: {
                expand: true,
                src: [ 'plugin.json', 'README.md' ],
                dest: 'dist',
            },
            external: {
                cwd: 'src',
                expand: true,
                src: ['**/external/**/*', '**/css/*'],
                dest: 'dist'
            }
        },

        watch: {
            rebuild_all: {
                files: ['src/**/*', 'plugin.json'],
                tasks: ['default'],
                options: {spawn: false}
            },
        },

        babel: {
            options: {
                sourceMap: true,
                presets:  ["@babel/preset-env"],
            },
            dist: {
                files: [{
                    cwd: 'src',
                    expand: true,
                    src: ['*.js'],
                    dest: 'dist',
                    ext:'.js'
                }]
            },
        },

    });

    grunt.registerTask('default', ['clean', 'copy:src_to_dist', 'copy:img_to_dist', 'copy:pluginDef', 'copy:external', 'babel']);
};