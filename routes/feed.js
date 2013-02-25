var Feed = require('../models/class.feed.js');

/*
 * GET feeds listing.
 */

exports.list = function(req, res) {
    Feed.all(function(feeds) {
        res.render('feed/list', { feeds: feeds });
    });
}

exports.get = function(req, res) {
    var id = req.query["id"];

    res.render('feed/index', { feed: Feed.get(id)});
}
