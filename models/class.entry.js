var dateFormat = require('dateformat');

Entry.create = function(gEntry) {
    return new Entry(gEntry);
}

function Entry(gEntry) {
    this._id = gEntry.id;

    console.log("gEntry");
    console.log(gEntry);
    this._author = gEntry.author;
    this._isFresh = getIsFresh(gEntry);
    this._summary = getContent(gEntry);
    this._title = gEntry.title ? gEntry.title : "";
    this._tstamp = gEntry.updated;
    this._url = getUrlFor(gEntry);
}

function getUrlFor(gEntry) {
    return gEntry.alternate ? gEntry.alternate[0].href : "";
}

function getContent(gEntry) {
    return gEntry.summary ? gEntry.summary.content :
        gEntry.content ? gEntry.content.content : "";
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

Entry.prototype.author = function(author) {
    if (author === undefined) {
        return this._author;
    }
    this._author = author;
}

Entry.prototype.title = function(title) {
    if (title === undefined) {
        return this._title;
    }
    this._title = title;
}

Entry.prototype.strTitle = function() {
    var MAX_CHAR_TITLE = 34;

    if (this._title && this._title.length > MAX_CHAR_TITLE) {
        return this._title.substr(0, MAX_CHAR_TITLE - 3) + "...";
    }
    return this._title ? this._title : "<i>No title</i>";
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
