'use strict';

/**
 * Dependencies
 */
var redis = require('redis');

/**
 * Shakti
 */
var Shakti = function () {
  this.subs = {};
};

module.exports = Shakti;

/**
 * Connect to redis
 *
 * @param {Number} db
 * @param {String} host
 * @param {Number} port
 * @param {Object} options
 * @return {Shakti}
 */
Shakti.prototype.connect = function (db, host, port, options) {
  db = db || 0;
  host = host || '127.0.0.1';
  port = port || 6379;

  this.pubRedis = redis.createClient(port, host, options);
  this.pubRedis.select(db);

  this.subRedis = redis.createClient(port, host, options);
  this.subRedis.select(db);
  this.subRedis.on('pmessage', function (ns, e, message) {
    var subs = this.subs[ns];
    var sub;

    if (! subs || ! subs.length) {
      return;
    }

    for (var i = 0, len = subs.length; i < len; i += 1) {
      sub = subs[i];

      sub.callback.call(sub.context, e, JSON.parse(message));
    }
  }.bind(this));

  return this;
};

/**
 * Subscribe
 *
 * @param {String} ns
 * @param {Function} callback
 * @param {mixed} context
 * @return {Shakti}
 */
Shakti.prototype.subscribe = function (ns, callback, context) {
  var subs = this.subs[ns] = this.subs[ns] || [];

  if (! subs.length) {
    this.subRedis.psubscribe(ns);
  }

  subs.push({
    'callback': callback,
    'context': context
  });

  return this;
};

/**
 * Unsubscribe
 *
 * @param {String} ns
 * @param {Function} callback
 * @return {Shakti}
 */
Shakti.prototype.unsubscribe = function (ns, callback) {
  var subs = this.subs[ns];

  if (! subs || ! subs.length) {
    return this;
  }

  if (! callback) {
    this.subs = [];
  }

  for (var i = 0, len = subs.length; i < len; i += 1) {
    if (subs[i].callback === callback) {
      subs.splice(i, 1);
      len -= 1;

      // NOTE we don't want to unsubscribe only one subscription
      break;
    }
  }

  if (! subs.length) {
    this.subRedis.punsubscribe(ns);
  }

  return this;
};

/**
 * Publish
 *
 * @param {String} ns
 * @param {mixed} data
 * @return {Shakti}
 */
Shakti.prototype.publish = function (ns, data) {
  this.pubRedis.publish(ns, JSON.stringify(data));

  return this;
};
