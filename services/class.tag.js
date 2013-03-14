function Tag(state, feedId, entryId, accessToken, actionToken) {
    this.state = state;
    this.feedId = feedId;
    this.entryId = entryId;
    this.accessToken = accessToken;
    this.actionToken = actionToken;
}

Tag.states = {
    READ: 'user/-/state/com.google/read',
    FRESH: 'user/-/state/com.google/fresh'
}

Tag.create = function(state, feedId, entryId, accessToken, actionToken) {
    return new Tag(state, feedId, entryId, accessToken, actionToken);
}

Tag.prototype.accessToken = function(value) {
    if (value === undefined) {
        return this.accessToken;
    }
    this.accessToken = value;
}

Tag.prototype.actionToken = function(value) {
    if (value === undefined) {
        return this.actionToken;
    }
    this.actionToken = value;
}

Tag.prototype.getAddParams = function() {
    var params = {
        a: this.state,
        s: this.feedId,
        i: this.entryId,
        async: "true",
        T: this.actionToken,
    }
    return this.encodeParams(params);
}

Tag.prototype.getRemoveParams = function() {
    var params = {
        r: this.state,
        s: this.feedId,
        i: this.entryId,
        async: "true",
        T: this.actionToken,
    }
    return this.encodeParams(params);
}

Tag.prototype.encodeParams = function(params) {
    var result = [];
    for (var key in params) {
        result.push(key + '=' + params[key]);
    }
    return result.join('&');
}

Tag.prototype.editTagUri = function() {
    return 'http://www.google.com/reader/api/0/edit-tag?access_token=' + this.accessToken;
}

module.exports = Tag;
