var Feed = require('../models/class.feed.js');

/*
 * GET feeds listing.
 */

exports.list = function(req, res) {
    res.render('feed/list', { feeds: Feed.all() });
}

exports.get = function(req, res) {
    var id = req.query["id"];

    res.render('feed/index', { feed: Feed.get(id)});
}
