var Entry = require('../models/class.entry.js');

exports.get = function(req, res) {
    var id = encodeURIComponent(req.query['id']);

    Entry.get(id, function(entry) {
        res.render('entry/index', { entry: entry });
    });
}
