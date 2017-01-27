'use strict';

// const path = require('path');
const renderer = require('../renderer/home_renderer');
const player_ui = require('./player_ui');

export var playerObj;
let barInterval;
export var playing = false;

export let playSong = (path, title, artist, album_id) => {
    player_ui.showPauseBtn();
    player_ui.setSongInfo(title, artist);
    if(album_id)
        player_ui.setAlbumArt(album_id, undefined);

    if (playing) {
        playerObj.pause();
        playing = false;
        console.log("Stopped");
    }

    if (path) {
        playerObj = new Audio(path);
        playerObj.addEventListener('loadedmetadata', function() {
            player_ui.setDurationOnBar(playerObj.duration);
        });
    }
    playerObj.play();
    playerObj.addEventListener('ended', function () {
        player_ui.showPlayBtn();
        clearInterval(barInterval);
        renderer.playNextSong();
    });

    barInterval = setInterval(function(){player_ui.updateBar(playerObj.currentTime, playerObj.duration)}, 20);
    playing = true;
};

export let pauseSong = () => {
    playerObj.pause();
    playing = false;
    player_ui.showPlayBtn();
    clearInterval(barInterval);
};

export let setCurrentTime = (completedPercentage) => {
    playerObj.currentTime = playerObj.duration * completedPercentage / 100;
    player_ui.setProgressValue(completedPercentage);
};