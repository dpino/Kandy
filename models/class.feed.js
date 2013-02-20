Feed.create = function(name, url) {
    return new Feed(name, url);
}

function Feed(name, url) {
    this.name = name;
    this.url = url;
}

Feed.all = function() {
    return [Feed.create("Feed 1", "http://www.google.com")];
}

module.exports = Feed;
