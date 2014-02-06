'use strict';
var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 9001;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'
// templateFramework: 'lodash'

module.exports = function (grunt) {
    // configurable paths
    var yeomanConfig = {
        app: 'debug',
        dist: 'release'
    };
    var patternLabConfig = {
        source: 'debug/pattern-lab/source',
        compiled: 'debug/pattern-lab/public'
    };
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);
    grunt.task.loadTasks('./debug/pattern-lab/builder/');

    grunt.initConfig({
        yeoman: yeomanConfig,
        patternLab: patternLabConfig,
        watch: {
            options: {
                nospawn: true,
                livereload: true
            },
            compass: {
                files: '<%= yeoman.app %>/debug/styles/sass/**/*.scss',
                tasks: ['compass:dev', 'compass:dist']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                    '<%= yeoman.app %>/scripts/templates/*.{ejs,mustache,hbs}'
                ]
            },
            mustache: {
                files: ['<%= patternLab.source %>/_patterns/**/*.mustache'],
                tasks: ['default']
            },
            data: {
                files: ['<%= patternLab.source %>/_patterns/**/*.json', '<%= patternLab.source %>/_data/*.json'],
                tasks: ['default']
            }
        },
        connect: {
            options: {
                port: SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: ['.tmp', '<%= yeoman.dist %>/*'],
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%= yeoman.app %>/scripts/vendor/*'
            ]
        },
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    baseUrl: '<%= yeoman.app %>/scripts',
                    optimize: 'none',
                    paths: {
                        'templates': '../../.tmp/scripts/templates',
                        'jquery': '../../debug/bower_components/jquery/jquery',
                        'underscore': '../../debug/bower_components/underscore/underscore',
                        'backbone': '../../debug/bower_components/backbone/backbone'
                    },
                    // TODO: Figure out how to make sourcemaps work with grunt-usemin
                    // https://github.com/yeoman/grunt-usemin/issues/30
                    //generateSourceMaps: true,
                    // required to support SourceMaps
                    // http://requirejs.org/docs/errors.html#sourcemapcomments
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true
                    //uglify2: {} // https://github.com/mishoo/UglifyJS2
                }
            }
        },
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/main.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= yeoman.app %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: ['*.{ico,txt}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif}',
                        'styles/fonts/{,*/}*.*']
                },
                    { expand: true, cwd: './<%= patternLab.source %>/js/', src: '*', dest: './<%= patternLab.compiled %>/js/'},
                    { expand: true, cwd: './<%= patternLab.source %>/css/', src: 'style.css', dest: './<%= patternLab.compiled %>/css/' },
                    { expand: true, cwd: './<%= patternLab.source %>/images/', src: ['*.png', '*.jpg', '*.gif', '*.jpeg'], dest: './<%= patternLab.compiled %>/images/' },
                    { expand: true, cwd: './<%= patternLab.source %>/images/sample/', src: ['*.png', '*.jpg', '*.gif', '*.jpeg'], dest: './<%= patternLab.compiled %>/images/sample/'},
                    { expand: true, cwd: './<%= patternLab.source %>/fonts/', src: '*', dest: './<%= patternLab.compiled %>/fonts/'},
                    { expand: true, cwd: './<%= patternLab.source %>/_data/', src: 'annotations.js', dest: './<%= patternLab.compiled %>/data/' }
                ]
            }
        },
        bower: {
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/main.js'
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '/styles/fonts/{,*/}*.*',
                    ]
                }
            }
        },
        //compass tasks
        compass: {
            dist: {
                options: {
                    sassDir: '<%= yeoman.app %>/debug/styles/sass',
                    imageDir: '<%= yeoman.dist %>/release/images',
                    cssDir: '<%= yeoman.dist %>/styles',
                    outputStyle: 'compressed',
                    fontsDir: '<%= yeoman.dist %>/release/fonts',
                    //relativeAssets: true,
                    noLineComments: true
                }
            },
            dev: {
                options: {
                    sassDir: '<%= yeoman.app %>/debug/styles/sass',
                    imagesDir: '<%= yeoman.app %>/debug/images',
                    cssDir: '<%= yeoman.app %>/styles',
                    fontsDir: '<%= yeoman.app %>/debug/fonts'
                }
            }
        }
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open:server', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'connect:livereload',
            'open:server',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'compass',
        'useminPrepare',
        'requirejs',
        'imagemin',
        'htmlmin',
        'concat',
        'cssmin',
        'uglify',
        'copy',
        'rev',
        'patternlab',
        'usemin'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'build'
    ]);
};
