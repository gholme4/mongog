module.exports = function(grunt) {
	
	// Load grunt plugins
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	
	grunt.initConfig({
		//grunt tasks go here
		concat: {
				
			scripts: {
				
				options: {
					separator: ';\r\n', //separates scripts
					stripBanners: true
				},
				src: [
					'public/foundation/js/vendor/custom.modernizr.js',
					'public/js/jquery.js',
					'public/js/jquery-ui/jquery-ui.min.js',
					'public/js/jquery.ui.touch-punch.min.js',
					'public/foundation/js/foundation.min.js',
					'public/js/jquery.validate.min.js',
					'public/js/mongo-g.js'
						
				], 
				dest: 'public/js/script.js' //where to output the script
			},
			styles: {
				src: [
					'public/css/fonts/*/*/*/*.css',
					'public/foundation/css/foundation.css',
					'public/js/jquery-ui/jquery-ui.min.css',
					'public/css/ico-style.css',
					'public/css/mongo-g-style.css'
						
				], 
				dest: 'public/css/style.css' //where to output the script
				
			}
		},
		uglify: {
			js: {
				files: {
					'public/js/script.js': ['public/js/script.js'] //save over the newly created script
				}
			}
			
		},
		cssmin: {
			combine: {
				files: {
					'public/css/style.css': ['public/css/style.css']
				}
			}	
		},
		watch: {
			scripts: {
				files: ['public/js/mongo-g.js', 'public/css/mongo-g-style.css'],
				tasks: ['concat'/*, 'uglify', 'cssmin'*/],
				options: {
					spawn: false,
				}
			}
		}
		
	});
	
	// Register grunt tasks    
	grunt.registerTask('default', ['concat'/*, 'uglify', 'cssmin' */, 'watch']);
    
};