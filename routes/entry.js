var Entry = require('../models/class.entry.js');

exports.get = function(req, res) {
    var id = req.query["id"];

    res.render('entry/index', { entry: Entry.get(id) });
}
