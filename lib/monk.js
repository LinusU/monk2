
var EventEmitter = require('events').EventEmitter;

var Collection = require('./collection');

var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;
var MongoClient = mongodb.MongoClient;

var Monk = function (uri) {

  EventEmitter.call(this);

  var self = this;

  self._dbInstance = null;
  self.connected = false;

  MongoClient.connect(uri, function (err, db) {
    if (err) {
      self.emit('error', err);
    } else {
      self._dbInstance = db;
      self.connected = true;
      self.emit('connected');
    }
  });

};

Monk.prototype = Object.create(EventEmitter.prototype);

Monk.prototype._db = function (cb) {
  var self = this;

  if (self.connected) {
    cb(self._dbInstance);
  } else {
    self.once('connected', function () {
      cb(self._dbInstance);
    });
  }

};

Monk.prototype.id = function (hexString) {
  if (hexString instanceof ObjectID) {
    return hexString;
  } else {
    return new ObjectID(hexString);
  }
};

Monk.prototype.get = function (collection) {
  return new Collection(this, collection);
};

module.exports = exports = function (uri) {
  return new Monk(uri);
};

exports.ObjectID = ObjectID;
