const _ = Npm.require('lodash');

VelocityInternals.frameworkConfigs = {};

Meteor.startup(function onStart() {
  _resetAll();
});

Object.assign(Velocity, {
  /**
   * Registers a testing framework plugin.
   *
   * @method registerTestingFramework
   * @param {String} name The name of the testing framework.
   * @param {Object} [options] Options for the testing framework.
   *   @param {String} [options.regex] The regular expression for test files
   *                    that should be assigned to the testing framework.
   *                    The path relative to the tests folder is matched
   *                    against it. Default: 'name/.+\.js$' (name is
   *                    the testing framework name).
   *   @param {String} [options.disableAutoReset]   Velocity's reset cycle
   *                    will skip reports and logs for this framework.
   *                    It is up to the framework to clean up its ****!
   *   @param {Function} [options.sampleTestGenerator] sampleTestGenerator
   *                    returns an array of fileObjects with the following
   *                    fields:
   *                      path - String - relative path to place test files
   *                                      (from PROJECT/tests)
   *                      contents - String - contents to put in the test file
   *                                          at the corresponding path
   */
  registerTestingFramework: function (name, options) {VelocityInternals.frameworkConfigs[name] = VelocityInternals.parseTestingFrameworkOptions(name, options);
    // make sure the appropriate aggregate records are added
    Velocity.Collections.AggregateReports.insert({
      name: name,
      result: 'pending'
    });
  },

  /**
   * Unregister a testing framework.  Mostly used for internal testing
   * of core Velocity functions.
   *
   * @method unregisterTestingFramework
   * @param {String} name Name of framework to unregister
   */
  unregisterTestingFramework: function (name) {
    Velocity.Collections.TestReports.remove({framework: name});
    Velocity.Collections.AggregateReports.remove({name: name});

    delete VelocityInternals.frameworkConfigs[name];
  }
});

/**
 * If any one test has failed, mark the aggregate test result as failed.
 *
 * @method VelocityInternals.updateAggregateReports
 */
VelocityInternals.updateAggregateReports = function  () {
  var aggregateResult,
    completedFrameworksCount,
    allFrameworks = _getTestFrameworkNames();

  Velocity.Collections.AggregateReports.upsert({name: 'aggregateResult'},
    {$set: {result: 'pending'}});
  Velocity.Collections.AggregateReports.upsert({name: 'aggregateComplete'},
    {$set: {result: 'pending'}});

  // if all of our test reports have valid results
  if (!Velocity.Collections.TestReports.findOne({result: ''})) {

    // pessimistically set passed state, ensuring all other states
    // take precedence in order below
    aggregateResult =
      Velocity.Collections.TestReports.findOne({result: 'failed'}) ||
      Velocity.Collections.TestReports.findOne({result: 'undefined'}) ||
      Velocity.Collections.TestReports.findOne({result: 'skipped'}) ||
      Velocity.Collections.TestReports.findOne({result: 'pending'}) ||
      Velocity.Collections.TestReports.findOne({result: 'passed'}) ||
      {result: 'pending'};

    // update the global status
    Velocity.Collections.AggregateReports.update({name: 'aggregateResult'},
      {$set: {result: aggregateResult.result}});
  }


  // Check if all test frameworks have completed successfully
  completedFrameworksCount = Velocity.Collections.AggregateReports.find({
    name: {$in: allFrameworks},
    result: 'completed'
  }).count();

  if (allFrameworks.length === completedFrameworksCount) {
    Velocity.Collections.AggregateReports.update({name: 'aggregateComplete'},
      {$set: {'result': 'completed'}});
  }
};

/**
 * Clear all test reports, aggregate reports, and logs.
 *
 * @method _resetAll
 * @param {Object} config See {{#crossLink 'Velocity/registerTestingFramework:method'}}{{/crossLink}}
 * @private
 */
function _resetAll () {
  var allFrameworks,
    frameworksToIgnore;

  allFrameworks = _getTestFrameworkNames();

  // ignore frameworks that have opted-out
  frameworksToIgnore = _(VelocityInternals.frameworkConfigs)
    .where({disableAutoReset: true})
    .pluck('name')
    .value();

  Velocity.Collections.AggregateReports.remove({});
  Velocity.Collections.TestReports.remove({framework: {$nin: frameworksToIgnore}});

  allFrameworks.forEach(function (testFramework) {
    Velocity.Collections.AggregateReports.insert({
      name: testFramework,
      result: 'pending'
    });
  });
}

function _getTestFrameworkNames () {
  return _.pluck(VelocityInternals.frameworkConfigs, 'name');
}
