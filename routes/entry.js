var Entry = require('../models/class.entry.js');

exports.get = function(req, res) {
    var entryId = encodeURIComponent(req.query['id']);

    Entry.get(entryId, req.session, function(entry) {
        res.render('entry/index', { 
            entry: entry,
            accessToken: req.session.accessToken
        });
    });
}

exports.markAsRead = function(req, res) {
    Entry.markAsRead(req, function() {
        console.log('marked as read');
    });
}
