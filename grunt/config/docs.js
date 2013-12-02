module.exports = {
	all: {
		options: {
			tasks: [
				'bower',
				'clean:docs',
				'build',
				'copy:docs',
				'styleguide:dist',
				'jsdoc:dist'
			]
		}
	},
	javascript: {
		options: {
			tasks: [
				'clean:docs',
				'build',
				'copy:docs',
				'jsdoc:dist'
			]
		}
	}
};