var dateFormat = require('dateformat');

Entry.create = function(feedId, gEntry) {
    return new Entry(feedId, gEntry);
}

function Entry(feedId, gEntry) {
    this._id = gEntry.id;

    this._author = getAuthor(gEntry.author);
    this._feedId = feedId;
    this._isFresh = getIsFresh(gEntry);
    this._content = getContent(gEntry);
    this._summary = getSummary(gEntry);
    this._title = gEntry.title ? gEntry.title : "";
    this._tstamp = gEntry.updated;
    this._url = getUrlFor(gEntry);
}

function getUrlFor(gEntry) {
    return gEntry.alternate ? gEntry.alternate[0].href : "";
}

function getAuthor(author) {
    author = trim(author);
    return trim(author.replace(/^by/i, ""));
}

function trim(str) {
    return str.replace(/^\s+|\s+$/, "");
}

function getContent(gEntry) {
    return gEntry.content ? gEntry.content.content : 
        gEntry.summary ? gEntry.summary.content : "";
}

function getSummary(gEntry) {
    function stripHtmlTags(text) {
        return text.replace(/<.*?>/g, '');
    }
    return stripHtmlTags(gEntry.summary ? gEntry.summary.content : "");
}

function getIsFresh(gEntry) {
    if (gEntry.categories) {
        for (var i = 0; i < gEntry.categories.length; i++) {
            var category = gEntry.categories[i];
            if (category.match("fresh$")) {
                return true;   
            }
        }
    }
    return false;
}

Entry.get = function(entryId, session, cb) {
    return Entry.GReader(session).getEntry(entryId, cb);
}

Entry.GReader = function(session) {
    var GReader = require('../services/class.greader.js');
    return new GReader(session);
}

Entry.markAsRead = function(req, cb) {
    var feedId = req.params.feedId;
    var entryId = req.params.entryId;

    return Entry.GReader(req.session).markAsRead(feedId, entryId, req, cb);
}

Entry.prototype.id = function(id) {
    if (id === undefined) {
        return this._id;
    }
    this._id = id;
}

Entry.prototype.feedId = function() {
    return this._feedId;
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

Entry.prototype.content = function(content) {
    if (content === undefined) {
        return this._content;
    }
    this._content = content;
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
