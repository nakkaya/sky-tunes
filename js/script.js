var SubsonicClient = function(){
    if (arguments.callee._singletonInstance)
        return arguments.callee._singletonInstance;
    arguments.callee._singletonInstance = this;

    this.api = new SubsonicRPCInterface();
    this.ui  = new SubsonicClientUI();
}

var SubsonicRPCInterface = function() {
    this.respond_with = 'xml';
    this.base_url     = '';
    this.username     = '';
    this.password     = 'enc:' + this.hex_encode('');
    this.client_id    = 'skyTunes';
    this.version      = '1.7.0';
}

SubsonicRPCInterface.prototype.hex_encode = function(data) {
    b16_digits = '0123456789abcdef';
    b16_map = [];
    result  = [];

    for (var i=0; i<256; i++)
        b16_map[i] = b16_digits.charAt(i >> 4) + b16_digits.charAt(i & 15);

    for (var i=0; i<data.length; i++)
        result[i] = b16_map[data.charCodeAt(i)];
    
    return result.join('');
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
    this.draw_status();
    this.draw_browser();

    this.resize_main_frame()
    $(window).resize(this.resize_main_frame);

    this.is_loading(false);
}

SubsonicClientUI.prototype.draw_browser = function() {
    $('#subsonic-browser').html(
        ''
    );
}

SubsonicClientUI.prototype.draw_player = function() {
    $('#subsonic-player').html(
        '<ul>'
      +     '<li><a href="#" id="previous"><img src="img/previous.png"></a></li>'
      +     '<li><a href="#" id="play"><img src="img/play.png"></a></li>'
      +     '<li><a href="#" id="next"><img src="img/next.png"></a></li>'
      + '</ul>'
    );
}

SubsonicClientUI.prototype.draw_sidebar = function() {
    $('#subsonic-sidebar').html(
        '<h1>Server status</h1>'
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
    height = $(window).height() - ($('#subsonic-player').height() + 2);
    $('#subsonic-main').css({
        'height': height,
        'min-height': height
    });
}

$('document').ready(function() { new SubsonicClient() });
