'use strict';

var shell = require('shelljs');

module.exports = function (grunt, options) {
  grunt.registerTask('wix-install', function () {
    shell.exec('npm install; bower install; bundle install', {silent : true});
  });

  var preBuildTasks = [
    'jsstyleIfEnabled',
    'scssstyleIfEnabled',
    'typescriptIfEnabled',
    'traceurIfEnabled',
    'mkdirTmpStyles',
    'newer:webfontIfEnabled',
    'hamlIfEnabled',
    'compass:dist',
    'replaceOrVelocity',
    'newer:copy:styles',
    'newer:jsonAngularTranslate',
    'newer:ngtemplates:single',
    'newer:petriExperiments',
    'autoprefixerIfEnabled',
    'styleInlineServeIfEnabled',
    'newer:copy:vm'
  ];

  if (options.useNodeSass) {
    preBuildTasks.splice(preBuildTasks.indexOf('compass:dist'), 0, 'sass:dist');
  }
  grunt.registerTask('pre-build', preBuildTasks);

  grunt.registerTask('pre-build:clean', [
    'clean:dist',
    'newer-clean',
    'pre-build'
  ]);

  grunt.registerTask('package', function () {
    grunt.task.run([
      // 'imagemin',
      'copy:images',
      'copy:dist',
      'manifestPackager',
      'useminPrepare',
      'styleInlineDistIfEnabled',
      'ngtemplates',
      'concat',
      'cssmin',
      'ngAnnotate',
      'uglify',
      'cdnify',
      'usemin',
      'processTags',
      'concat:dts',
      'replace:dts'
    ]);
  });

  grunt.registerTask('serve:verbose', [
    'serve'
  ]);

  grunt.registerTask('serve', [
    'ignore-code-style-checks',
    'karma:unit',
    'clean:ts',
    'pre-build',
    'livereloadServer',
    'connect:livereload',
    'force:karma:unit:run',
    'watch'
  ]);

  grunt.registerTask('serve:dist', [
    'ignore-code-style-checks',
    'connect:dist:keepalive'
  ]);

  grunt.registerTask('serve:clean', [
    'clean:server',
    'newer-clean',
    'serve'
  ]);

  grunt.registerTask('serve:coverage', [
    'enableCoverage',
    'serve'
  ]);

  grunt.registerTask('test', [
    'pre-build:clean',
    'karma:single'
  ]);

  grunt.registerTask('test:e2e', function (type) {
    if (type === 'noshard') {
      grunt.modifyTask('protractor', {normal : {options : {'capabilities.shardTestFiles' : 0}}});
    }
    grunt.task.run('connect:localTest');
    grunt.task.run('webdriver');
    grunt.task.run('protractor:normal');
  });

  grunt.registerTask('test:ci', [
    'e2eIfEnabled:teamcity'
  ]);

  require('../grunt-sections/verify-npm')(grunt);

  grunt.registerTask('build', [
    'verify-npm',
    'pre-build:clean',
    'karma:single',
    'package',
    'e2eIfEnabled:normal'
  ]);

  grunt.registerTask('build:ci', [
    'pre-build:clean',
    'karma:teamcity',
    'package',
    'copy:sadignore'
  ]);

  grunt.registerTask('publish', [
    'concat:dts',
    'replace:dts',
    'release'
  ]);

  grunt.registerTask('default', function () {
    grunt.task.run(['build']);
  });
};
