/*global module:false*/
var cheerio = require('cheerio');
var _ = require('underscore');
var fs = require('fs');
var child = require('child_process');

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-wget');

    var matchFiles = function(re) {

        var scripts = [];
        var $ = cheerio.load(fs.readFileSync('./www/index.html'));
        $('script').each(function(index, el) {
            var src = $(el).attr('src');
            var concat = $(el).attr('concat');

            if (concat && concat.match('true')) {
                scripts.push('./www/' + src);
            }
        });
        if (grunt.option("verbose")) {
            grunt.log.writeln('Scipts To Be Concatinated' + JSON.stringify(scripts));
        }
        return scripts;
    };
    var adviseModels = function(name, models, done) {
        var $ = cheerio.load(fs.readFileSync(name + '/www/index.html'));
        var html = $.root().html();
        fs.writeFileSync(name + '/www/index.html', html);

        child.exec('cd ' + name + ' && zip -r ../' + name + '.zip .', function(error, stdout, stderr) {
            if (grunt.option("verbose")) {
                grunt.log.writeln("advise models error : " + error);
            }
            done(error);
        });
    };

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        concat: {
            dist: {
                src: ['<banner>'].concat(matchFiles(/^(?!lib\/)|(mobiscroll)/)),
                dest: 'dist-dev/www/main.js'
            },
            lib: {
                src: ['<banner>'].concat(matchFiles(/^lib\//)),
                dest: './dist-dev/www/lib.js'
            }
        },
        copy: {
            dist: {
                files: [{
                    dest: 'dist/www/main.js',
                    src: ['dist-dev/www/main.js']
                }, {
                    dest: 'dist/',
                    src: ['www/feedhenry.js']
                }, {
                    dest: 'dist/',
                    src: ['www/fhconfig.json']
                }, {
                    dest: 'dist/',
                    src: ['www/config.json']
                }, {
                    dest: 'dist/',
                    src: ['www/templates/*']
                }, {
                    dest: 'dist/',
                    src: ['www/css/*']
                }, {
                    dest: 'dist/',
                    src: ['www/img/*']
                }]
            },
            backbone: {
                files: [{
                    dest: './www/lib/appFormjs-backbone.js',
                    src: '../fh-js-sdk/dist/appForms-backbone.js'
                }]
            },
            toApp: {
                files: [{
                    dest: '/Users/ndonnelly/testApp/Test-Form-Niall-Project-Delete-Now-Test-Form-Niall-Project-Delete-Now-Client-App/www/lib.min.js',
                    src: './dist-dev/www/lib.js'
                }, {
                    dest: '/Users/ndonnelly/testApp/Test-Form-Niall-Project-Delete-Now-Test-Form-Niall-Project-Delete-Now-Client-App/www/main.js',
                    src: './dist-dev/www/main.js'
                }, {
                    dest: '/Users/ndonnelly/testApp/Test-Form-Niall-Project-Delete-Now-Test-Form-Niall-Project-Delete-Now-Client-App/www/templates/templates.html',
                    src: './www/templates/templates.html'
                }]
            }
        },
        uglify: {
            lib: {
                src: ['./dist-dev/www/lib.js'],
                dest: './dist/www/lib.min.js',
                mangle: false
            }
        },
        jshint: {
            options: {
                predef: [
                    'Backbone'
                ],
                eqeqeq: false,
                eqnull: true,
                sub: true,
                devel: false,
                browser: true,
                smarttabs: false,
                laxbreak: true,
                laxcomma: true,
                jquery: true,
                loopfunc: true
            },
            files: ['./www/js/**/*.js']
        },
        wget: {
            backboneJSSDK: {
                files: {
                    './www/lib/appFormjs-backbone.js': 'https://raw.githubusercontent.com/feedhenry/fh-js-sdk/feedhenry3-dist/appForms-backbone.js'
                },
                options: {
                    overwrite: true
                }
            }
        }
    });

    grunt.registerTask('clean', 'Clean up files/folders', function() {
        var wrench = require('wrench');
        var fs = require('fs');

        wrench.rmdirSyncRecursive('./dist', true);
        wrench.rmdirSyncRecursive('./dist-dev', true);
        try {
            fs.unlinkSync('./dist.zip');
        } catch (e) {
            console.error("did not delete dist.zip");
        }
        try {
            fs.unlinkSync('./max.zip');
        } catch (e) {
            console.error("did not delete max.zip");
        }
    });

    grunt.registerTask('index', 'Copy and modify index.html file for use with dist stuff', function() {
        var done = this.async();
        var cheerio = require('cheerio');
        var fs = require('fs');

        var $ = cheerio.load(fs.readFileSync('./www/index.html'));

        // remove script tags with a src
        $('script').each(function(index, el) {
            var concat = $(el).attr('concat');
            if (concat) {
                $(el).remove();
            }
        });


        // add the tags and make a dev copy of the html
        $('body').append('<script src="lib.js"></script>\n');
        $('body').append('<script src="main.js"></script>\n');
        require('child_process').exec(' git rev-parse --short  --verify HEAD', function(error, stdout, stderr) {
            if (grunt.option("verbose")) {
                grunt.log.writeln('stdout: ' + stdout);
                grunt.log.writeln('stderr: ' + stderr);
            }
            var sha = stdout.trim();

            var htmlDev = $.root().html();

            // insert the minified files for prod
            $('script[src="lib.js"]').attr('src', 'lib.min.js');
            var htmlProd = $.html();

            // write index files
            fs.writeFileSync('./dist-dev/www/index.html', htmlDev);
            fs.writeFileSync('./dist/www/index.html', htmlProd);
            grunt.log.writeln('index copied and modified');
            done();

        });

    });

    grunt.registerTask('mkdirs', 'Make dirs used for dist stuff', function() {
        var wrench = require('wrench');

        // create dist dirs
        ['./dist-dev/', './dist/'].forEach(function(dir) {
            wrench.mkdirSyncRecursive(dir + 'www', '0777');
        });
        grunt.log.writeln('dist dirs created');
    });

    grunt.registerTask('rearchive', 'Rearchive dist folder contents into zip file', function() {
        var done = this.async();

        require('wrench').rmdirSyncRecursive('./dist-dev', true);
        var tasks = [];
        tasks.push(function(done) {
            require('child_process').exec('cd dist;zip -r ../dist.zip .;cd ..', function(error, stdout, stderr) {
                grunt.log.writeln('stdout: ' + stdout);
                grunt.log.writeln('stderr: ' + stderr);
                if (error !== null) {
                    grunt.log.writeln('exec error: ' + error);
                }
                done(error);
            });
        });

        if (grunt.option("am")) {
            tasks.push(function(done) {
                adviseModels('dist', grunt.option("am"), done);
            });
        }
        require("async").series(tasks, function(err) {
            done(err);
        });

    });

    // Default task.
    grunt.registerTask('default', ['clean', 'jshint', 'mkdirs', 'concat', 'copy:dist', 'uglify:lib', 'index']);

};
