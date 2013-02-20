var Feed = require('../models/class.feed.js');

/*
 * GET feeds listing.
 */

exports.list = function(req, res) {
    var feeds = Feed.all();
    var feed = feeds[0];
    console.log(feed);
    res.render('feed/list', { feeds: feeds });
}

exports.get = function(req, res) {
    var id = req.params.id;

    res.render('feed/index', { feed: Feed.get(id)});
}
