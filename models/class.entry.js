Entry.create = function(name, url) {
    return new Entry(name, url);
}

function Entry(name, url) {
    this.name = name;
    this.url = url;
}

Entry.get = function(id) {
    return Entry.create("Entry 1", "/view/entry/1");
}

Entry.prototype.isRead = function() {
    return false;
}

Entry.prototype.summary = function() {
    return "Lorem ipsum dolor sit amet";
};

Entry.prototype.date = function() {
    return "5th Feb, 2013";
};

module.exports = Entry;
