var request = require('request'),
    assert = require('assert'),
    async = require('async'),
    Feed = require('../models/class.feed.js'),
    Entry = require('../models/class.entry.js');

var SERVICE = "reader",
    SOURCE = "greader4kindle";

function GReader() {

}

GReader.setSessionToken = function(token) {
    this.sessionToken = token;
}

GReader.setAuthToken = function(token) {
    this.authToken = token;
}

GReader.getFeeds = function(cb) {
    getAllUnreadSubscriptionFeeds(cb);
}

function getAllUnreadSubscriptionFeeds(cb) {
    var allFeeds, unreadFeeds;

    async.series([
            function(callback) {
                request({
                    url: getSubscriptionListURI()
                }, function(err, res, body) {
                    assert.equal(err, null);
                    allFeeds = hashAllFeeds(body);
                    callback();
                });
            },
            function(callback) {
                request({
                    url: getUnreadCountURI()
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

function getSubscriptionListURI() {
    return 'https://www.google.com/reader/api/0/subscription/list?output=json&access_token=' + GReader.authToken;
}

function getUnreadCountURI() {
    return 'https://www.google.com/reader/api/0/unread-count?output=json&all=true&access_token=' + GReader.authToken;
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

GReader.getFeed = function(feed_id, cb) {
    request({
        url: getFeedContentsURI(feed_id)
    }, function(err, res, body) {
        assert.equal(err, null);
        cb(getFeedDetails(body));
    });
}

function getFeedContentsURI(feed_id) {
    return 'https://www.google.com/reader/api/0/stream/contents/' + 
                feed_id + '?r=n&n=20&access_token=' + GReader.accessToken;
}

function getFeedDetails(body) {
    var gFeed = JSON.parse(body);
    return Feed.createFromGoogle(gFeed);
}

GReader.getEntry = function (item_id, cb) {
    request({
        url: getItemContentsURI(item_id)
    }, function(err, res, body) {
        assert.equal(err, null);
        cb(getEntry(JSON.parse(body)));
    });

    function getEntry(gFeed) {
        var result = {};
        if (gFeed.items && gFeed.items.length > 0) {
            result = Entry.create(gFeed.items[0]);
        }
        return result;
    }

}

function getItemContentsURI(item_id) {
    return 'https://www.google.com/reader/api/0/stream/items/contents?i=' + 
                item_id + '&access_token=' + GReader.accessToken;
}

module.exports = GReader;
