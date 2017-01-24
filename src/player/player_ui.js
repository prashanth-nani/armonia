const path = require('path');
const remote = require('electron').remote;
const app = remote.app;
const utils = require('../utils/utils');
window.$ = window.jQuery = require('../js/jquery');

let $playPauseBtn = $('#play-pause-btn i');
let albumArtDir = path.join(app.getPath('userData'), "resources", "album_arts");

export let showPauseBtn = () => {
    $playPauseBtn.removeClass('fa-play').addClass('fa-pause');
};

export let showPlayBtn = () => {
    $playPauseBtn.removeClass('fa-pause').addClass('fa-play');
};

export let setAlbumArt = (album_id, albumArtPath) => {
    if (albumArtPath == undefined) {
        utils.getAlbumArtPathById(albumArtDir, album_id);
    } else if (album_id == undefined)
        $("#album-art img").attr("src", albumArtPath);
};

export let setDurationOnBar = (duration) => {
    "use strict";
    $('#total-time').text(utils.getMinutes(duration));
}

export let setSongInfo = (title, artist) => {
    $('#info-title span').text(title);
    $('#info-artist span').text(artist);
};

export let setProgressValue = (completedPercentage) => {
    "use strict";
    $('progress').val(completedPercentage);
}
export let updateBar = (current, duration) => {
    let currentTime = current;
    $('progress').val(currentTime * 100 / duration);
    $('#current-time').text(utils.getMinutes(currentTime));
};