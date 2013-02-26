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
        for (var i = 0; i < unreadFeeds.length; i += 1) {
            var unreadFeed = unreadFeeds[i];
            if (unreadFeed === undefined) {
                continue;
            }
            var feed = allFeeds[unreadFeed.id()];
            if (feed === undefined) {
                continue;
            }
            unreadFeed.title(feed.title);
            unreadFeed.url(feed.url);

            unreadFeeds[i] = unreadFeed;
        }
        cb(sortFeedsByTitle(unreadFeeds));
    });

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
        var gEntry = JSON.parse(body);
        var entry = Entry.create(gEntry);
        entry.summary(getContent(gEntry.items[0]));
        cb(entry);
    });

}

function getItemContentsURI(item_id) {
    return 'https://www.google.com/reader/api/0/stream/items/contents?i=' + 
                item_id + '&access_token=' + GReader.accessToken;
}

function getContent(item) {
    if (item.summary) {
        return item.summary.content;
    }
    if (item.content) {
        return item.content.content;
    }
}

module.exports = GReader;
