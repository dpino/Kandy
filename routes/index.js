var GReader = require('../services/class.greader.js');

exports.login = function(req, res) {
    if (req.query['loginError'] == "true") {
        res.render('login', {loginError: "Authentication failed. Try again"});
    }
    res.render('login', {loginError: ""});
}

exports.authenticate = function(req, res) {
    var username = req.query["username"];
    var password = req.query["password"];

    GReader.authenticate(username, password, function(tokens) {
        if (tokens != null) {
            GReader.getSessionToken(tokens.Auth, function(token) {
                if (token != null) {
                    console.log("authToken: " + tokens.Auth);
                    console.log("sessionToken: " + token);
                    GReader.setAuthToken(tokens.Auth);
                    GReader.setSessionToken(token);
                    req.session.token = token;
                    res.redirect('/view/feeds');
                } else {
                    res.redirect('/?loginError=true');
                }
            });
        } else {
            res.redirect('/?loginError=true');
        }
    });
}
