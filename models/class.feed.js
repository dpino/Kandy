var Entry = require("./class.entry.js");

Feed.create = function(name, url) {
    return new Feed(name, url);
}

function Feed(name, url) {
    this.name = name;
    this.url = url;
    this.entries = [ ];
}

Feed.all = function() {
    return [Feed.create("Feed 1", "/view/feed/1")];
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
