module.exports = function(grunt) {

    // configurable paths
    var paths = {
        src: 'src',
        dist: 'build'
    };

    grunt.initConfig({
        paths : paths,
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                jshintrc: '<%= paths.src %>/js/.jshintrc'
            },
            files: ['Gruntfile.js', '<%= paths.src %>/js/**/*.js']
        },
        sass: {
            options: {
                style: 'compressed'
            },
            build: {
                files: {
                    '<%= paths.dist %>/css/<%= pkg.name %>.css': '<%= paths.src %>/scss/imports.scss'
                }
            }
        },
        watch: {
            dev : {
                files: ['<%= paths.src %>/**/*','<%= paths.src %>/js/*.js'],
                tasks: ['copy:main','sass'],
            }
        },
        useminPrepare: {
            html: '<%= paths.src %>/index.html',
            options: {
                dest: '<%= paths.dist %>'
            }
        },
        usemin: {
            html: ['<%= paths.dist %>/{,*/}*.html'],
            options: {
                dirs: ['<%= paths.dist %>']
            }
        },
        copy: {
            main: {
                files: [
                    {
                        src: ['<%= paths.src %>/index.html'],
                        dest: '<%= paths.dist %>/index.html',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: '<%= paths.src %>/fonts/',
                        src: '**',
                        dest: '<%= paths.dist %>/fonts/',
                        flatten: false,
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: '<%= paths.src %>/views/',
                        src: '**',
                        dest: '<%= paths.dist %>/views/',
                        flatten: false,
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: '<%= paths.src %>/img/',
                        src: '**',
                        dest: '<%= paths.dist %>/img/',
                        flatten: false,
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: '<%= paths.src %>/js/',
                        src: '**',
                        dest: '<%= paths.dist %>/js/',
                        flatten: false,
                        filter: 'isFile'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-usemin');

    grunt.registerTask('default', ['copy:main','sass']);
    grunt.registerTask('build', ['sass']);
};