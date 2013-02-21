var dateFormat = require('dateformat');

Entry.create = function(gEntry) {
    return new Entry(gEntry);
}

function Entry(gEntry) {
    this._id = gEntry.id;
    this._title = gEntry.title;
    this._url = gEntry.origin ? gEntry.origin.htmlUrl : "";
    this._tstamp = gEntry.updated;
    this._summary = gEntry.summary ? gEntry.summary.content : "";
    this._isFresh = getIsFresh(gEntry.categories);
}

function getIsFresh(categories) {
    if (categories === undefined) return false;
    for (var i = 0; i < categories.length; i++) {
        if (categories[i].match(/fresh$/)) { return true; }
    }
    return false;
}

Entry.prototype.id = function(id) {
    if (id === undefined) {
        return this._id;
    }
    this._id = id;
}

Entry.prototype.title = function(title) {
    if (title === undefined) {
        return this._title;
    }
    this._title = title;
}

Entry.prototype.url = function(url) {
    if (url === undefined) {
        return this._url;
    }
    this._url = url;
}

Entry.prototype.tstamp = function(tstamp) {
    if (tstamp === undefined) {
        return this._tstamp;
    }
    this._tstamp = tstamp;
}

Entry.prototype.summary = function(summary) {
    if (summary === undefined) {
        return this._summary;
    }
    this._summary = summary;
}

Entry.prototype.isFresh = function(isFresh) {
    if (isFresh === undefined) {
        return this._isFresh;
    }
    this._isFresh = isFresh;
}

Entry.prototype.date = function() {
    return dateFormat(this._tstamp * 1000, "dd mmm, yyyy");
};

module.exports = Entry;
