var GReader = require('../services/class.greader.js'),
    Entry = require("./class.entry.js");

Feed.create = function(id) {
    return new Feed(id);
}

function Feed(id) {
    this._id = id;
    this._count = 0;
    this._description = "";
    this._title = "";
    this._url = "";
    this._entries = [];
}

Feed.prototype.id = function(id) {
    if (id === undefined) {
        return this._id;
    }
    this._id = id;
    return this;
}

Feed.prototype.count = function(count) {
    if (count === undefined) {
        return this._count;
    }
    this._count = count;
    return this;
}

Feed.prototype.description = function(description) {
    if (description === undefined) {
        return this._description;
    }
    this._description = description;
    return this;
}

Feed.prototype.title = function(title) {
    if (title === undefined) {
        return this._title;
    }
    this._title = title;
    return this;
}

Feed.prototype.entries = function(entries) {
    if (entries === undefined) {
        return this._entries;
    }
    this._entries = entries;
    return this;
}

Feed.prototype.url = function(url) {
    if (url === undefined) {
        return this._url;
    }
    this._url = url;
    return this;
}

Feed.all = function(cb) {
    var GReader = require('../services/class.greader.js');
    GReader.getFeeds(cb);
}

Feed.allUnreadUserFeeds = function() {

}

Feed.get = function(id) {
    return GReader.getFeed(id);
}

module.exports = Feed;
