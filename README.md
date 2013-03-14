What is Kandy?
==============

Kandy is an unofficial Google Reader app for Kindle.

It uses the unofficial Google Reader API to present contents in the Kindle browser in a more suitable manner. So far, it has been tested only on Kindle DX (third generation), but it should work in other models too.

How to install it?
==================

Kandy is developed in node.js

Kandy depends on many node.js modules. To install them run:

$ npm install

Kandy relies on the Google Reader API.  In order to have access to the 'reader' service, it's necessary to obtain a CLIENT_KEY and a CLIENT_SECRET keys from Google as well as properly register your application.

To obtain the keys, access to Google API Console (https://code.google.com/apis/console/), click on API Access and create a new Client ID. My setting look as follow:

    * Client ID: <client-id-set-by-google>
    * Email address: <email-address-set-by-google>
    * Client secret: <client-secret-set-by-google>
    * Redirect URIs: http://localhost:5000/oauth2callback
    * JavaScript origins: http://localhost:5000

I run Kindle on my localhost port 5000. If you're thinking of trying running Kandy locally, then your Redirect URIs and Javascript origins fields should look the same.

Once you got your CLIENT_KEY and CLI_SECRET, you should create a file .env under kandy/ with the following format:

    * SESSION_STORE_SECRET=<random-pass>
    * CLIENT_KEY=<your-google-Client-ID>
    * CLIENT_SECRET=<your-google-Client-Secret>
    * REDIRECT_URI=http://localhost:5000/oauth2callback

Set SESSION_STORE_SECRET to whatever value. This value is used by node.js for setting up sessions.

Now try to run the app with:

$ foreman start -f Procfile.dev

You should something like this:

20:53:07 web.1  | started with pid 23045
20:53:07 web.1  | DEBUG: Running node-supervisor with
20:53:07 web.1  | DEBUG:   program 'app.js'
20:53:07 web.1  | DEBUG:   --watch '.'
20:53:07 web.1  | DEBUG:   --ignore 'undefined'
20:53:07 web.1  | DEBUG:   --extensions 'node|js'
20:53:07 web.1  | DEBUG:   --exec 'node'
20:53:07 web.1  | DEBUG: Starting child process with 'node app.js'
20:53:07 web.1  | DEBUG: Watching directory '/var/www/kandy' for changes.
20:53:07 web.1  | Express server listening on port 5000

Open a browser and type localhost:5000. You are in :)

About the Google Reader API
===========================

Google never released an official Google Reader API but the API was fully documented by reverse engineering. There's plenty of documentation about the API in the web, but these are some of the best docs I found:

    * Unofficial Google Reader API: http://undoc.in/googlereader.html
    * Friends of the Unofficial Google Reader API: https://groups.google.com/forum/?fromgroups=#!forum/fougrapi
    * Google Reader API: http://code.google.com/p/google-reader-api/

Authentication
==============

Kandy uses OAuth2 for authentication. This is the preferred way for authenticating against Google services. Before, Google used CLIENT_LOGIN and OAuth1. Although these methods are still supported, and you may find a lot of examples using these two mechanisms, they are now deprecated and very likely support will be dropped in the future.

With OAuth2 it's not necessary to enter your Google credentials for using a third app.

Known bugs
==========

    * Sometimes the values stored in the session (access_token) are gone.
    * When the tokens (access_token and action_token) expire the application crashes. In this case it's necessary to return to the main screen and access again.

Future
======

As Google is closing Google Reader I don't think I'll invest more time in adding new features or fixing bugs. Enjoy it while you can ;-)

Author
======

Diego Pino <dpino@igalia.com>
