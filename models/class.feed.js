var Entry = require("./class.entry.js");

Feed.create = function(id) {
    return new Feed(id);
}

function Feed(id) {
    this._id = id;
    this._title = "";
    this._url = "";
    this._count = 0;
    this._entries = [ ];
}

Feed.prototype.id = function(id) {
    if (id === undefined) {
        return this._id;
    }
    this._id = id;
}

Feed.prototype.title = function(title) {
    if (title === undefined) {
        return this._title;
    }
    this._title = title;
}

Feed.prototype.url = function(url) {
    if (url === undefined) {
        return this._url;
    }
    this._url = url;
}

Feed.prototype.count = function(count) {
    if (count === undefined) {
        return this._count;
    }
    this._count = count;
}

Feed.all = function() {
    return Feed.allUnreadSubscriptionFeeds();
}

Feed.allUnreadSubscriptionFeeds = function() {
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

Feed.allUnreadUserFeeds = function() {

}

Feed.get = function(id) {
    var result = Feed.create("Feed 1", "/view/feed/1");
    result.entries = [
        Entry.create("Entry 1", "/view/entry/1"),
        Entry.create("Entry 2", "/view/entry/2"),
        Entry.create("Entry 3", "/view/entry/3"),
    ];
    return result;
}

Feed.prototype.getEntries = function() {
    return this.entries;
};

module.exports = Feed;
