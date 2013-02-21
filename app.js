
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , feed = require('./routes/feed')
  , entry = require('./routes/entry')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', index.login);
app.get('/view/feeds', feed.list);
app.get('/view/feed', feed.get);
app.get('/view/entry', entry.get);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
