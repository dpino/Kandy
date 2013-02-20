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
    return [Feed.create("Feed 1", "http://www.google.com")];
}

Feed.get = function(id) {
    var result = Feed.create("Feed 1", "http://www.google.com");
    result.entries = [
        Entry.create("Entry 1", "http://www.entry1.com"),
        Entry.create("Entry 2", "http://www.entry2.com"),
        Entry.create("Entry 3", "http://www.entry3.com"),
    ];
    return result;
}

Feed.prototype.getEntries = function() {
    return this.entries;
};

module.exports = Feed;
