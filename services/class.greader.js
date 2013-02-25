var request = require('request'),
    assert = require('assert'),
    async = require('async'),
    Feed = require('../models/class.feed.js'),
    Entry = require('../models/class.entry.js');

var CLIENT_LOGIN = "https://www.google.com/accounts/ClientLogin",
    TOKEN_URL = 'https://www.google.com/reader/api/0/token',
    SERVICE = "reader",
    SOURCE = "greader4kindle";

function GReader() {

}

GReader.authenticate = function(username, password, cb) {
    request.post({
        uri: CLIENT_LOGIN,
        form: {
            Email: username,
            Passwd: password,
            service: SERVICE,
            source: SOURCE,
        }
    }, function(err, res, body) {
        assert.equal(err, null);
        var tokens = getAuthenticationTokens(body);
        cb(tokens);
    });
}

function getAuthenticationTokens(body) {
    var result = {
        SID: "",
        LSID: "",
        Auth: "",
    }       

    var tokens = body.split("\n");
    var i = 0;
    for (var token in result) {
        var parts = tokens[i++].split("=");
        if (parts.length) {
            result[token] = parts[1];
        }
    }
    return result;
}

GReader.getSessionToken = function(auth, cb) {
    request({
        url: TOKEN_URL,
        headers: { 'Authorization': 'GoogleLogin auth=' + auth }
    }, function(err, res, body) {
        assert.equal(err, null);
        cb(body);
    });
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
                console.log("hashAllFeeds");
                var url = 'https://www.google.com/reader/api/0/subscription/list?output=json&token=' + GReader.sessionToken;
                console.log("url: " + url);
                console.log("auth=" + GReader.authToken);
                request({
                    url: url,
                    headers: { 'Authorization': 'GoogleLogin auth=' + GReader.authToken }
                }, function(err, res, body) {
                    assert.equal(err, null);
                    allFeeds = hashAllFeeds(body);
                    callback();
                });
            },
            function(callback) {
                console.log("getUnreadFeed");
                var url = 'https://www.google.com/reader/api/0/unread-count?output=json&all=true&token=' + GReader.sessionToken;
                console.log("url: " + url);
                console.log("auth=" + GReader.authToken);
                request({
                    url: url,
                    headers: { 'Authorization': 'GoogleLogin auth=' + GReader.authToken }
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
    // console.log(body);
    body = JSON.parse(body);
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

GReader.getFeed = function(id, cb) {
    var url = 'https://www.google.com/reader/api/0/stream/contents/' + id + '?r=n&n=20&token=' + GReader.sessionToken;
    request({
        url: url,
        headers: { 'Authorization': 'GoogleLogin auth=' + GReader.authToken }
    }, function(err, res, body) {
        assert.equal(err, null);
        cb(getFeedDetails(body));
    });
}

function getFeedDetails(body) {
    var feed = JSON.parse(body);
    var result = Feed.create(feed.id)
            .title(feed.title)
            .description(feed.description)
            .url(feed.alternate[0] ? feed.alternate[0].href : "");

    var entries = [];
    feed.items.forEach(function(item) {
        entries.push(Entry.create(item));
    });
    result.entries(entries);

    return result;
}

GReader.getEntry = function (id, cb) {
    var url = 'https://www.google.com/reader/api/0/stream/items/contents?i=' + id + '&token=' + GReader.sessionToken;
    request({
        url: url,
        headers: { 'Authorization': 'GoogleLogin auth=' + GReader.authToken }
    }, function(err, res, body) {
        assert.equal(err, null);
        var gEntry = JSON.parse(body);
        var entry = Entry.create(gEntry);
        entry.summary(getContent(gEntry.items[0]));
        cb(entry);
    });

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
