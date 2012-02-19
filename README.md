SkyTunes
========

SkyTunes was borne out of frustration with the Subsonic user interface, its use
of Flash and general experience when using it with limited screen real estate.
It's an open source client for the application, written in HTML, CSS and
JavaScript. It's far from complete, but changing rapidly.

Installation
------------

Create a config.js file in the the same directory as this readme. It should
contain the following, with your credentials in place of the example data:

    subsonic = {
        'base_url': 'http://myname.subsonic.org',
        'username': 'username',
        'password': hex_encode('password'),
        'root'    : '#subsonic-client'
    };

Now fire up index.html in your browser, and check that the status indicator on
the left of the interface says online. If it doesn't, read the below section on
configuring Subsonic for access control.

Access control errors
---------------------

To see if Subsonic's access control configuration needs changing, just open your
browser's JavaScript console (usually Ctrl-Shift-J does this; Cmd-Shift-J on a
Mac) and check the logs for the following:

    XMLHttpRequest cannot load <somewhere>. Origin <somewhere> is not allowed by
    Access-Control-Allow-Origin.

This is because of some new-fangled security policies being phased in online.
Unfortunately, Subsonic has yet to be updated to deal with them. To work around
this, we need to tweak our setup so that the client application is granted access
to Subsonic's API.

How you'll do this on your end is based on your configuration, but you'll need to
send the following HTTP header in Subsonic's responses:

    Access-Control-Allow-Origin: *
