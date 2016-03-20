/* global
 VelocityTestReports: true,
 VelocityAggregateReports: true
 */

var collectionOptions = {};

if (Meteor.isServer) {
  var velocityMongoUrl = process.env.VELOCITY_MONGO_URL;
  if (velocityMongoUrl) {
    collectionOptions._driver = new MongoInternals.RemoteCollectionDriver(velocityMongoUrl);
  }
}

/**
 * TODO: Needs description and example records
 *
 * @property Velocity.Collections.TestReports
 * @type Mongo.Collection
 */
Velocity.Collections.TestReports = new Mongo.Collection('velocityTestReports', collectionOptions);
/**
 * @property VelocityTestReports
 * @type Mongo.Collection
 * @deprecated Use `Velocity.Collections.TestReports`
 */
VelocityTestReports = Velocity.Collections.TestReports;


/**
 * TODO: Needs description and example records
 *
 * @property Velocity.Collections.AggregateReports
 * @type Mongo.Collection
 */
Velocity.Collections.AggregateReports = new Mongo.Collection('velocityAggregateReports', collectionOptions);
/**
 * TODO: Needs description and example records
 *
 * @property VelocityAggregateReports
 * @type Mongo.Collection
 * @deprecated Use `Velocity.Collections.AggregateReports`
 */
VelocityAggregateReports = Velocity.Collections.AggregateReports;

(function () {
  'use strict';

  if (Meteor.isServer) {
    Meteor.publish('VelocityTestReports', function () {
      return Velocity.Collections.TestReports.find({});
    });
    Meteor.publish('VelocityAggregateReports', function () {
      return VelocityAggregateReports.find({});
    });
  }

  if (Meteor.isClient) {
    Meteor.subscribe('VelocityTestReports');
    Meteor.subscribe('VelocityAggregateReports');
  }
})();
