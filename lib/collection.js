
var EventEmitter = require('events').EventEmitter;

var Collection = function (monk, name) {

  var self = this;

  self.monk = monk;
  self.name = name;

  self.connected = false;
  self._colInstance = null;

  self.monk._db(function (db) {
    self._colInstance = db.collection(self.name);
    self.connected = true;
    self.emit('connected');
  });

}

Collection.prototype = Object.create(EventEmitter.prototype);

Collection.prototype._col = function (cb) {

  var self = this;

  if (self.connected) {
    cb(self._colInstance);
  } else {
    self.once('connected', function () {
      cb(self._colInstance);
    });
  }

};

Collection.prototype._cb = function (cb) {
  var self = this;

  return cb || function (err) {
    if (err) { self.emit('error', err); }
  };
};

Collection.prototype.id = function (hexString) {
  return this.monk.id(hexString);
}

Collection.prototype.findById = function (id, cb) {
  this.findOne({ _id: this.id(id) }, cb);
}

Collection.prototype.findOne = function (query, options, cb) {

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  cb = this._cb(cb);
  options.limit = 1;

  this.find(query, options, function (err, docs) {
    cb(err, ((docs || []).length > 0 ? docs[0] : null));
  });

}

Collection.prototype.find = function (query, options, cb) {

  var self = this;

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  cb = self._cb(cb);

  self._col(function (col) {
    col.find(query, options).toArray(cb);
  });

};

Collection.prototype.insert = function (obj, cb) {

  var self = this;

  cb = self._cb(cb);

  self._col(function (col) {
    col.insert(obj, { safe: true }, function (err, docs) {
      if (err) {
        cb(err);
      } else {
        if (Array.isArray(obj)) {
          cb(null, docs);
        } else {
          cb(null, docs[0] || null);
        }
      }
    });
  });

};

module.exports = exports = Collection;
