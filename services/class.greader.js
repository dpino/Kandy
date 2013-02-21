var request = require('request'),
    assert = require('assert'),
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

GReader.getFeeds = function() {
    return getAllUnreadSubscriptionFeeds();
}

function getAllUnreadSubscriptionFeeds() {
    var allFeeds = hashAllFeeds();

    var unreadFeeds = getUnreadFeeds();
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
    return sortFeedsByTitle(unreadFeeds);
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

function hashAllFeeds() {
    var result = [];

    var allFeeds = require('./all-subscriptions.json');
    var subscriptions = allFeeds.subscriptions;
    for (var i = 0; i < subscriptions.length; i += 1) {
        var feed = subscriptions[i];
        result[feed.id] = {
            id: feed.id,
            title: feed.title,
            url: feed.htmlUrl
        }
    }
    return result;
}

function getUnreadFeeds() {
    var result = [];

    var feeds = require('./unread-subscriptions.json');
    var unreadFeeds = feeds.unreadcounts;
    for (var i = 0; i < unreadFeeds.length; i += 1) {
        var feed = unreadFeeds[i];
        var newFeed = Feed.create(feed.id)
        newFeed.count(feed.count);
        result.push(newFeed);
    }
    return result;
}

GReader.getFeed = function(id) {
    return getFeedDetails(id);    
}

function getFeedDetails(id) {
    var feed = require('./feed-entries.json');

    var result = Feed.create(feed.id).
        title(feed.title).
        description(feed.description).
        url(feed.alternate[0].href);

    var entries = [];
    feed.items.forEach(function(item) {
        entries.push(Entry.create(item));
    });
    result.entries(entries);

    return result;
}

GReader.getEntry = function (id) {
    var gEntry = require('./single-entry.json');
    var result = Entry.create(gEntry);
    result.summary(gEntry.items[0].summary.content);
    return result;
}

module.exports = GReader;
