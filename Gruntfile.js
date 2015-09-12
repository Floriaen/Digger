module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			scripts: {
				files: ['src/**/*.js', 'src/assets/sprite.png', 'src/index.html'],
				tasks: ['uglify:development', 'htmlmin:development', 'copy']
			}
		},
		jsbeautifier : {
			files : ["src/**/*.js"],
			options : {
				js: {
					indentWithTabs: true
				}
			}
		},
		jscrush: {
		    options: {},
		    files: {
		      'build/<%= pkg.name %>.js': ['build/<%= pkg.name %>.js'],
		    },
		  },
		uglify: {
			development: {
				options: {
					beautify: true,
					compress: false,
					mangle: false,
				},
				files: {
					'build/<%= pkg.name %>.js': ['src/**/*.js']
				},
			},
			compressed: {
				options: {
					mangle: true,
					compress: {
						//TODO: Optimize using compressor options (https://github.com/mishoo/UglifyJS2#compressor-options)
					}
				},
				files: {
					'build/<%= pkg.name %>.js': ['src/**/*.js']
				},
			}
		},
		htmlmin: {
			development: {
				options: {
					removeComments: false,
					collapseWhitespace: false,
				},
				files: {
					'build/index.html': 'src/*.html'
				}
			},
			compressed: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
				},
				files: {
					'build/index.html': 'src/*.html'
				}
			}
		},
		compress: {
			main: {
				options: {
					archive: 'build/<%= pkg.name %>.zip',
					mode: 'zip'
				},
				files: [{
					expand: true,
					flatten: true,
					cwd: './',
					src: ['build/*.css', 'build/*.js', 'build/*.html', 'build/*.png'],
					dest: './'
				}]
			}
		},
		copy: {
			main: {
				files: [
					{expand: true, cwd: 'src/assets/', src: ['sprite.png'], dest: 'build/'}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks("grunt-jsbeautifier");
	grunt.loadNpmTasks('grunt-jscrush');

	var fs = require('fs');
	grunt.registerTask('sizecheck', function() {
		var done = this.async();
		fs.stat('build/' + grunt.config.data.pkg.name + '.zip', function(err, zip) {
			if (zip.size > 13312) {
				//If size in bytes greater than 13kb
				grunt.log.error("Zipped file greater than 13kb \x07 \n");
				grunt.log.error("Zip is " + zip.size + " bytes when js13k max is 13,312 bytes");
			}
			done();
		});
	});

	grunt.registerTask('beautifier', ['jsbeautifier']);
	grunt.registerTask('default', ['watch']);
	grunt.registerTask('build', ['uglify:development', 'htmlmin:development', 'copy']);
	grunt.registerTask('build-compress', ['uglify:compressed', 'less:compressed', 'htmlmin:compressed', 'copy', 'compress:main', 'sizecheck']);

};
