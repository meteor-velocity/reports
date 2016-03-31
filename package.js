'use strict';

Package.describe({
  name: 'velocity:reports',
  summary: 'Test reporting functionality that can be reused by any testing framework',
  version: '1.0.0',
  git: 'https://github.com/meteor-velocity/velocity-reports.git',
  testOnly: true
});

Npm.depends({
  'lodash': '2.4.1'
});

Package.on_use(function (api) {

  var SERVER = 'server',
      CLIENT = 'client',
      BOTH = [CLIENT, SERVER];

  api.versionsFrom('1.3');
  api.use('ecmascript');
  api.use('webapp');
  api.use('mongo');
  api.use('check');
  api.use('random');

  api.export('Velocity', BOTH);
  api.export('VelocityTestReports', BOTH);
  api.export('VelocityAggregateReports', BOTH);

  api.addFiles('src/globals.js', BOTH);
  api.addFiles('src/collections.js', BOTH);

  // Methods
  api.addFiles('src/methods/reports/reports_completed.js', SERVER);
  api.addFiles('src/methods/reports/reports_reset.js', SERVER);
  api.addFiles('src/methods/reports/reports_submit.js', SERVER);
  api.addFiles('src/methods.js', BOTH);

  api.addFiles('src/core.js', SERVER);
});
