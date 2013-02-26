var GReader =   require('../services/class.greader.js'),
    OAuth =     require('../services/GoogleOAuth');

var GOOGLE_READER_API_URL = "http://www.google.com/reader/api/";

exports.login = function(req, res) {
    if (req.query['loginError'] == "true") {
        res.render('login', {loginError: "Authentication failed. Try again"});
    }
    res.render('login', {loginError: ""});
}

exports.oauth2callback = function(req, res) {
    var oauth = newOAuth();

    oauth.getGoogleAccessToken(req.query, function(err, access_token, refresh_token) {
        if (err) return res.send(500, err);
        
        req.session.access_token = access_token;
        req.session.refresh_token = refresh_token;
        GReader.setAuthToken(access_token);
        GReader.setSessionToken(refresh_token);
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
	    oauth.getGoogleAccessToken(req.query, function(err, access_token, refresh_token) {
            if (err) return res.send(500, err);
            
            req.session.access_token = access_token;
            req.session.refresh_token = refresh_token;
            GReader.setAuthToken(access_token);
            GReader.setSessionToken(refresh_token);
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
