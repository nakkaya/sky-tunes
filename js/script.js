function hex_encode(data) {
    b16_digits = '0123456789abcdef';
    b16_map = [];
    result  = [];

    for (var i=0; i<256; i++)
        b16_map[i] = b16_digits.charAt(i >> 4) + b16_digits.charAt(i & 15);

    for (var i=0; i<data.length; i++)
        result[i] = b16_map[data.charCodeAt(i)];

    return result.join('');
}

var SubsonicClient = function(base_url, username, password) {
    if (arguments.callee._singletonInstance)
        return arguments.callee._singletonInstance;
    arguments.callee._singletonInstance = this;

    this.api = new SubsonicRPCInterface(base_url, username, password);
    this.ui  = new SubsonicClientUI();

    return this;
}

var SubsonicRPCInterface = function(base_url, username, password) {
    this.respond_with = 'xml';
    this.base_url     = base_url;
    this.username     = username;
    this.password     = 'enc:' + password;
    this.client_id    = 'skyTunes';
    this.version      = '1.7.0';
}

SubsonicRPCInterface.prototype.get_music_folders = function(on_success) {
    this.make_request('rest/getMusicFolders.view', {}, function(result) {

        folders = {}
        $(result).find('musicFolders').find('musicFolder').each(function() {
            folders[$(this).attr('id')] = $(this).attr('name');
        });

        on_success(folders);
    });
}

SubsonicRPCInterface.prototype.ping = function(on_success) {
    this.make_request('rest/ping.view', {}, on_success);
}

SubsonicRPCInterface.prototype.make_request = function(path, params, on_success) {
    params = {};
    params['c'] = this.client_id;
    params['f'] = this.respond_with;
    params['p'] = this.password;
    params['u'] = this.username;
    params['v'] = this.version;

    url = this.base_url + '/' + path + '?';
    for (param in params)
        url += param + '=' + params[param] + '&';

    $.ajax(url, {'success': on_success});
}

var SubsonicClientUI = function() {
    $('#subsonic-client').append('<section id="subsonic-player"></section>')
                         .append('<section id="subsonic-main"></section>');
    $('#subsonic-main').append('<section id="subsonic-sidebar"></section>')
                       .append('<section id="subsonic-browser"></section>');

    this.draw_player();
    this.draw_sidebar();
    this.draw_browser();

    this.draw_activities();
    this.draw_folders();
    this.draw_status();

    this.resize_main_frame()
    $(window).resize(this.resize_main_frame);

    this.is_loading(false);
}

SubsonicClientUI.prototype.draw_activities = function() {
    $('#subsonic-activities').html(
        '<ul>'
      +     '<li>Idle</li>'
      + '</ul>'
    );
}

SubsonicClientUI.prototype.draw_browser = function() {
    $('#subsonic-browser').html(
        '<section id="subsonic-browser-genre" class="subsonic-browser-control">'
      +     '<h1>Genre</h1>'
      +     '<ul></ul>'
      + '</section>'
      + '<section id="subsonic-browser-artist" class="subsonic-browser-control">'
      +     '<h1>Artist</h1>'
      +     '<ul></ul>'
      + '</section>'
      + '<section id="subsonic-browser-album" class="subsonic-browser-control">'
      +     '<h1>Album</h1>'
      +     '<ul></ul>'
      + '</section>'
    );
}

SubsonicClientUI.prototype.draw_folders = function() {
    $('#subsonic-folders').html(
        '<li class="disabled">None</li>'
    );

    SubsonicClient().api.get_music_folders(function(folders) {
        view = $('#subsonic-folders');

        if ($(folders).length > 0)
            view.html('');

        $.each(folders, function(idx, value) {
            view.append('<li id="subsonic-folder-"' + idx + '>' + value + '</li>');
        });
    });
}

SubsonicClientUI.prototype.draw_player = function() {
    $('#subsonic-player').html(
        '<ul id="subsonic-playback-controls">'
      +     '<li><a href="#" id="previous"><img src="img/previous.png"></a></li>'
      +     '<li><a href="#" id="play"><img src="img/play.png"></a></li>'
      +     '<li><a href="#" id="next"><img src="img/next.png"></a></li>'
      + '</ul>'
      + '<section id="subsonic-activities"></section>'
    );
}

SubsonicClientUI.prototype.draw_sidebar = function() {
    $('#subsonic-sidebar').html(
        '<h1>Folders</h1>'
      + '<ul id="subsonic-folders"></ul>'
      + '<h1>Server status</h1>'
      + '<p id="subsonic-status">Unknown</p>'
    );
}

SubsonicClientUI.prototype.draw_status = function() {
    SubsonicClient().api.ping(function(status) {
        if (status)
            $('#subsonic-status').html('Online');
        else
            $('#subsonic-status').html('Offline');
    });
}

SubsonicClientUI.prototype.is_loading = function(is_loading) {
    if (is_loading)
        $('#loading-overlay').show();
    else
        $('#loading-overlay').hide();
}

SubsonicClientUI.prototype.resize_main_frame = function() {
    height = $(window).height() - ($('#subsonic-player').height() + 24) + 'px';
    $('#subsonic-main').css({
        'height': height,
        'min-height': height
    });

    width = $(window).width() - ($('#subsonic-sidebar').width() + 1) + 'px';
    $('#subsonic-browser').css({
        'width': width,
        'min-width': width
    });

    lo = $('#subsonic-browser').width() - ($('.subsonic-browser-control').width() * 3)
    if (lo > 0) {
        $('#subsonic-browser-album').css({
            'width': $('#subsonic-browser-artist').width() + lo + 'px'
        });
    }
}
