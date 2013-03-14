var request = require('request'),
    assert = require('assert'),
    async = require('async'),
    Feed = require('../models/class.feed.js'),
    Entry = require('../models/class.entry.js'),
    Tag = require('./class.tag.js');

function GReader(session) {
    this.accessToken = session.accessToken;
    this.refreshToken = session.refreshToken;  
}

GReader.prototype.getFeeds = function(cb) {
    this.getAllUnreadSubscriptionFeeds(cb);
}

GReader.prototype.getAllUnreadSubscriptionFeeds = function(cb) {
    var allFeeds, unreadFeeds;

    var subscriptionListURI = this.getSubscriptionListURI();
    var getUnreadCountURI = this.getUnreadCountURI();

    async.series([
            function(callback) {
                request({
                    url: subscriptionListURI
                }, function(err, res, body) {
                    assert.equal(err, null);
                    allFeeds = hashAllFeeds(body);
                    callback();
                });
            },
            function(callback) {
                request({
                    url: getUnreadCountURI
                }, function(err, res, body) {
                    assert.equal(err, null);
                    unreadFeeds = getUnreadFeeds(body);
                    callback();
                });
            }
    ], function (err, result) {
        var toBeRemoved = [], i = 0;
        unreadFeeds.forEach(function(unreadFeed, i) {
            var feed = allFeeds[unreadFeed.id()];
            if (feed != null) {
                unreadFeed.title(feed.title);
                unreadFeed.url(feed.url);
            } else {
                toBeRemoved.push(i);
            }
        });
        removeElements(unreadFeeds, toBeRemoved);
        cb(sortFeedsByTitle(unreadFeeds));
    });

}

// Moves elements to be removed to the beginning of the array 
// and splice it from 0 until the number of elements moved
function removeElements(array, positions) {
    var pos = 0;
    positions.forEach(function(i) {
        array[i] = array[pos++];
    });
    array.splice(0, pos);
}

GReader.prototype.getSubscriptionListURI = function() {
    return 'https://www.google.com/reader/api/0/subscription/list?output=json&access_token=' + this.accessToken;
}

GReader.prototype.getUnreadCountURI = function() {
    return 'https://www.google.com/reader/api/0/unread-count?output=json&all=true&access_token=' + this.accessToken;
}

function hashAllFeeds(body) {
    var result = [];

    if (body.length == 0) return result;
    body = JSON.parse(body);
    for (var i = 0; i < body.subscriptions.length; i++) {
        var feed = body.subscriptions[i];
        result[feed.id] = {
            id: feed.id,
            title: feed.title,
            url: feed.htmlUrl
        }
    }
    return result;
}

function getUnreadFeeds(body) {
    var result = [];

    if (body.length == 0) return result;
    body = JSON.parse(body);
    if (body.unreadcounts == undefined) return result;
    for (var i = 0; i < body.unreadcounts.length; i += 1) {
        var feed = body.unreadcounts[i];
        var newFeed = Feed.create(feed.id)
        newFeed.count(feed.count);
        result.push(newFeed);
    }
    return result;
}

function sortFeedsByTitle(feeds) {
    var hash = toHashIndexedByTitle(feeds);
    var keys = sortArray(getHashKeys(hash));
    return inArrayOrder(hash, keys);
}

function sortArray(array) {
    return array.sort(function(str1, str2) {
        return ((str1 == str2) ? 0 : (( str1 > str2 ) ? 1 : -1 ));
    });
}

function getHashKeys(hash) {
    var result = [];
    for (key in hash) { 
        result.push(key); 
    }
    return result;
}

function inArrayOrder(hash, array) {
    var result = [];
    for (var i = 0; i < array.length; i += 1) {
        result.push(hash[array[i]]);
    }
    return result;
}

function toHashIndexedByTitle(array) {
    var result = {};
    for (var i = 0; i < array.length; i += 1) {
        var feed = array[i];
        result[feed.title()] = feed;
    }
    return result;
}

GReader.prototype.getFeed = function(feed_id, cb) {
    request({
        url: this.getFeedContentsURI(feed_id)
    }, function(err, res, body) {
        assert.equal(err, null);
        var gFeed = JSON.parse(body);
        cb(getFeedDetails(gFeed));
    });
}

GReader.prototype.getFeedContentsURI = function(feed_id) {
    return 'https://www.google.com/reader/api/0/stream/contents/' + 
                feed_id + '?r=n&n=20&access_token=' + this.accessToken;
}

function getFeedDetails(gFeed) {
    return Feed.createFromGoogle(gFeed);
}

GReader.prototype.getEntry = function (item_id, cb) {
    request({
        url: this.getItemContentsURI(item_id)
    }, function(err, res, body) {
        assert.equal(err, null);
        cb(getEntry(JSON.parse(body)));
    });

    function getEntry(gFeed) {
        var result = {};
        if (gFeed.items && gFeed.items.length > 0) {
            result = Entry.create(gFeed.id, gFeed.items[0]);
        }
        return result;
    }

}

GReader.prototype.getItemContentsURI = function(entryId)  {
    return 'https://www.google.com/reader/api/0/stream/items/contents?i=' + 
                entryId + '&access_token=' + GReader.accessToken;
}

GReader.prototype.markAsRead = function(feedId, entryId, req, cb) {
    this.addState(Tag.states.READ, feedId, entryId, req, cb);
}

GReader.prototype.addState = function(state, feedId, entryId, req, cb) {
    var greader = this;

    var accessToken = greader.accessToken || req.session.accessToken;
    var actionToken = greader.actionToken || req.session.actionToken;

    async.series([
            function(callback) {
                if (actionToken == undefined) {
                    getActionToken(accessToken, callback);
                }
            },
    ], function (err, results) {
        var actionToken = results[0];
        saveActionToken(actionToken);

        greader.changeState(
            buildAddTagParams(state, feedId, entryId, accessToken, actionToken), cb);
    });

    function buildAddTagParams(state, feedId, entryId, accessToken, actionToken) {
        var tag = Tag.create(state, feedId, entryId, accessToken, actionToken);
        return tag.getAddParams();
    }

    function saveActionToken(actionToken) {
        req.session.actionToken = actionToken;
        greader.actionToken = actionToken;
    }
}

GReader.prototype.changeState = function(params, cb) {
    var accessToken = this.accessToken;

    request.post({
        url: getEditTagUri(accessToken),
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': params.length,
        },
        body: params
    }, function(err, res, body) {
        if (cb) cb(body);
    });

    function getEditTagUri(accessToken) {
        return 'http://www.google.com/reader/api/0/edit-tag?access_token=' + accessToken;
    }
}

GReader.prototype.removeFreshTag = function(feedId, entryId, req, cb) {
    this.removeState(Tag.states.FRESH, feedId, entryId, req, cb);
}

GReader.prototype.removeState = function(state, feedId, entryId, req, cb) {
    var greader = this;

    var accessToken = greader.accessToken || req.session.accessToken;
    var actionToken = greader.actionToken || req.session.actionToken;

    async.series([
            function(callback) {
                if (actionToken == undefined) {
                    getActionToken(accessToken, callback);
                } else {
                    callback(null, actionToken);
                }
            },
    ], function (err, results) {
        var actionToken = results[0];
        saveActionToken(actionToken);

        var params = buildRemoveTagParams(state, feedId, entryId, accessToken, actionToken);
        greader.changeState(params, cb);
    });

    function buildRemoveTagParams(state, feedId, entryId, accessToken, actionToken) {
        var tag = Tag.create(state, feedId, entryId, accessToken, actionToken);
        return tag.getRemoveParams();
    }

    function saveActionToken(actionToken) {
        req.session.actionToken = actionToken;
        greader.actionToken = actionToken;
    }
}

function getActionToken(accessToken, callback) {
    request({
        url: actionTokenUrl(accessToken)
    }, function(err, res, body) {
        callback(null, body);
    });

    function actionTokenUrl(accessToken) {
        return 'https://www.google.com/reader/api/0/token?access_token=' + accessToken;
    }
}

module.exports = GReader;
