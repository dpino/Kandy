var dateFormat = require('dateformat');

Entry.create = function(gEntry) {
    return new Entry(gEntry);
}

function Entry(gEntry) {
    this._id = gEntry.id;
    this._title = gEntry.title;
    this._url = getUrlFor(gEntry);
    this._tstamp = gEntry.updated;
    this._summary = gEntry.summary ? gEntry.summary.content : "";
    this._isFresh = getIsFresh(gEntry);
}

function getUrlFor(gEntry) {
    if (gEntry.items && gEntry.items.length > 0) {
        var alternate = gEntry.items[0].alternate;
        if (alternate) return alternate[0].href;
    }
    return "";
}

/**
 * FIXME:
 * Supposedly when an item is fresh it has a tag 'fresh' on its categories, but it's not correct
 * Still trying to figure out how to know if an item is fresh so temporarily leave it 'fresh' always
 */
function getIsFresh(gEntry) {
    /*
    if (gEntry.categories) {
        gEntry.categories.forEach(function(category) {
            if (category.match(/fresh$/)) return true;
        });
    }
    return false;
    */
    return true;
}

Entry.get = function(id, cb) {
    return Entry.GReader().getEntry(id, cb);
}

Entry.GReader = function() {
    return require('../services/class.greader.js');
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

Entry.prototype.shortTitle = function() {
    return this._title && this._title.length > 34 ? 
        this._title.substr(0, 31) + "..." : this._title;
};

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
