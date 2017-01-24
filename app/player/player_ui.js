'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var path = require('path');
var remote = require('electron').remote;
var app = remote.app;
var utils = require('../utils/utils');
window.$ = window.jQuery = require('../js/jquery');

var $playPauseBtn = $('#play-pause-btn i');
var albumArtDir = path.join(app.getPath('userData'), "resources", "album_arts");

var showPauseBtn = exports.showPauseBtn = function showPauseBtn() {
    $playPauseBtn.removeClass('fa-play').addClass('fa-pause');
};

var showPlayBtn = exports.showPlayBtn = function showPlayBtn() {
    $playPauseBtn.removeClass('fa-pause').addClass('fa-play');
};

var setAlbumArt = exports.setAlbumArt = function setAlbumArt(album_id, albumArtPath) {
    if (albumArtPath == undefined) {
        utils.getAlbumArtPathById(albumArtDir, album_id);
    } else if (album_id == undefined) $("#album-art img").attr("src", albumArtPath);
};

var setDurationOnBar = exports.setDurationOnBar = function setDurationOnBar(duration) {
    "use strict";

    $('#total-time').text(utils.getMinutes(duration));
};

var setSongInfo = exports.setSongInfo = function setSongInfo(title, artist) {
    $('#info-title span').text(title);
    $('#info-artist span').text(artist);
};

var setProgressValue = exports.setProgressValue = function setProgressValue(completedPercentage) {
    "use strict";

    $('progress').val(completedPercentage);
};
var updateBar = exports.updateBar = function updateBar(current, duration) {
    var currentTime = current;
    $('progress').val(currentTime * 100 / duration);
    $('#current-time').text(utils.getMinutes(currentTime));
};