'use strict';

// const path = require('path');

Object.defineProperty(exports, "__esModule", {
    value: true
});
var player_ui = require('./player_ui');

var playerObj = exports.playerObj = undefined;
var barInterval = void 0;
var playing = exports.playing = false;

var playSong = exports.playSong = function playSong(path, title, artist, album_id) {
    player_ui.showPauseBtn();
    player_ui.setSongInfo(title, artist);
    if (album_id) player_ui.setAlbumArt(album_id, undefined);

    if (playing) {
        playerObj.pause();
        exports.playing = playing = false;
        console.log("Stopped");
    }

    if (path) {
        exports.playerObj = playerObj = new Audio(path);
        playerObj.addEventListener('loadedmetadata', function () {
            player_ui.setDurationOnBar(playerObj.duration);
        });
    }
    playerObj.play();
    playerObj.addEventListener('ended', function () {
        player_ui.showPlayBtn();
        clearInterval(barInterval);
    });

    barInterval = setInterval(function () {
        player_ui.updateBar(playerObj.currentTime, playerObj.duration);
    }, 20);
    exports.playing = playing = true;
};

var pauseSong = exports.pauseSong = function pauseSong() {
    playerObj.pause();
    exports.playing = playing = false;
    player_ui.showPlayBtn();
    clearInterval(barInterval);
};

var setCurrentTime = exports.setCurrentTime = function setCurrentTime(completedPercentage) {
    playerObj.currentTime = playerObj.duration * completedPercentage / 100;
    player_ui.setProgressValue(completedPercentage);
};