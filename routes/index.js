var OAuth =     require('../services/GoogleOAuth');

var GOOGLE_READER_API_URL = "http://www.google.com/reader/api/";

exports.welcome = function(req, res) {
    if (req.session.access_token) {
        return res.redirect('/view/feeds');
    } else {
        res.render('welcome');
    }
}

exports.oauth2callback = function(req, res) {
    var oauth = newOAuth();

    oauth.getGoogleAccessToken(req.query, function(err, accessToken, refreshToken) {
        if (err) return res.send(500, err);
        req.session.accessToken = accessToken;
        req.session.refreshToken = refreshToken;
        return res.redirect('/view/feeds');
    });
}

exports.authentication = function(req, res) {
    var oauth = newOAuth();

    if (!req.query.code) {
	    oauth.getGoogleAuthorizeTokenURL([GOOGLE_READER_API_URL], function(err, redirectUrl) {
            return (err) ? res.send(500, err) : res.redirect(redirectUrl);
  	    });
	} else {
	    oauth.getGoogleAccessToken(req.query, function(err, accessToken, refreshToken) {
            if (err) return res.send(500, err);
            req.session.accessToken = accessToken;
            req.session.refreshToken = refreshToken;
            return res.redirect('/view/feeds');
  	    });
	}
}

function newOAuth() {
    var client_key = process.env.CLIENT_KEY;
    var client_secret = process.env.CLIENT_SECRET;
    var redirect_uri = process.env.REDIRECT_URI;

    return new OAuth.OAuth2(client_key, client_secret, redirect_uri);
}
