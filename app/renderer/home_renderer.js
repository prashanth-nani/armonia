'use strict';

var remote = require('electron').remote;
var app = remote.app;
var path = require('path');
var utils = require(path.join(__dirname, "..", "..", "app/utils/utils"));
var changeFinder = require(path.join(__dirname, "..", "..", "app/fileWatch/changeFinder"));
window.$ = window.jQuery = require(path.join(__dirname, "../..", "app/js/jquery"));

var sqlite3 = require('sqlite3').verbose();
var db_path = path.join(app.getPath('userData'), "armonia.db");
var albumArtDir = path.join(app.getPath('userData'), "resources", "album_arts");
var $contentlist = $('#content-list');
var $songtable = $('#content-list table > tbody');
var $choosefolderdiv = $('#select-music-dir');
var $choosefolderbtn = $('#select-music-dir a');
var $playPauseBtn = $('#play-pause-btn i');
var db = new sqlite3.Database(db_path);

var player;
var playing = false;

$(function () {
    createList("title");
    handleEvents();
});

function createList(sortElement) {
    console.log("Refreshing list");
    $songtable.find('tr:gt(0)').remove();
    db.each('SELECT song.id as id, title, artist, location, year, album_id, album_name FROM song, album WHERE song.album_id = album.id ORDER BY ' + sortElement, function (err, row) {
        if (err) console.error(err);else {
            $songtable.append('<tr id="song-' + row.id + '" data-loc="' + row.location + '" data-album-id="' + row.album_id + '"><td class="title">' + row.title + '</td><td class="artist">' + row.artist + '</td><td class="album">' + row.album_name + '</td><td class="year">' + row.year + '</td></tr>');
        }
    }, function () {
        // manageFiles();
        showMusic();
    });
}

function insertSongRow() {
    var sortElement = "title";
    db.each('SELECT song.id as id, title, artist, location, year, album_id, album_name FROM song, album WHERE song.album_id = album.id ORDER BY ' + sortElement, function (err, row) {
        if (err) console.error(err);else {
            if ($('#content-list table >tbody>tr[data-loc="' + row.location + '"]').length == 0) $songtable.append('<tr id="song-' + row.id + '" data-loc="' + row.location + '" data-album-id="' + row.album_id + '"><td class="title">' + row.title + '</td><td class="artist">' + row.artist + '</td><td class="album">' + row.album_name + '</td><td class="year">' + row.year + '</td></tr>');
        }
    }, showMusic);
}

function showMusic() {
    var $songtablerows = $('#content-list table >tbody>tr');
    if ($songtablerows.length > 1) {
        $contentlist.show();
        $choosefolderdiv.hide();
    } else {
        $choosefolderdiv.show();
        $contentlist.hide();
    }
}

function handleEvents() {
    $songtable.on("dblclick", "tr", function () {
        var $playingrow = $('#content-list table >tbody>tr.selected');
        $playingrow.removeClass("selected");
        $(this).addClass("selected");

        var title = $($(this).children()[0]).text();
        var artist = $($(this).children()[1]).text();
        var path = $(this).attr("data-loc");
        var album_id = $(this).attr("data-album-id");

        setSongInfo(title, artist);
        setAlbumArt(album_id, undefined);
        playSong(path);
    });

    $("#play-pause-btn").click(function () {
        if (playing) {
            pauseSong();
            showPlayBtn();
        } else {
            playSong();
            showPauseBtn();
        }
    });

    $("#dur").click(function () {
        return console.log(player.duration);
    });
    $("#cur").click(function () {
        return console.log(player.currentTime);
    });

    $choosefolderbtn.click(function () {
        "use strict";

        manageFiles();
    });

    $('#progress-outer').bind('click', function (ev) {
        var $div = $(ev.target);
        var offset = $div.offset();
        var progressWidth = ev.clientX - offset.left;

        var totalBarWidth = $div.width();
        var completedPercentage = 100 * progressWidth / totalBarWidth;
        $('progress').val(completedPercentage);
        player.currentTime = player.duration * completedPercentage / 100;
    });
}

function playSong(path) {
    showPauseBtn();

    if (playing) {
        player.pause();
        playing = false;
        console.log("Stopped");
    }

    if (path) {
        player = new Audio(path);
        player.addEventListener('loadedmetadata', function () {
            $('#total-time').text(getMinutes(player.duration));
        });
    }
    player.play();
    player.addEventListener('ended', function () {
        showPlayBtn();
    });

    setInterval(updateBar, 20);
    console.log("playing " + path);
    playing = true;
}

function pauseSong() {
    player.pause();
    playing = false;
}

function showPauseBtn() {
    $playPauseBtn.removeClass('fa-play').addClass('fa-pause');
}

function showPlayBtn() {
    $playPauseBtn.removeClass('fa-pause').addClass('fa-play');
}

function setAlbumArt(album_id, albumArtPath) {
    console.log("here");
    if (albumArtPath == undefined) {
        console.log("love");
        utils.getAlbumArtPathById(albumArtDir, album_id);
    } else if (album_id == undefined) $("#album-art img").attr("src", albumArtPath);
}

function updateBar() {
    var currentTime = player.currentTime;
    $('progress').val(currentTime * 100 / player.duration);
    $('#current-time').text(getMinutes(currentTime));
}

function getMinutes(seconds) {
    var hr = void 0;
    var min = Math.floor(seconds / 60);
    var sec = Math.floor(seconds % 60);
    if (min >= 60) {
        hr = Math.floor(min / 60);
        min = Math.floor(min % 60);
    }
    sec = pad(sec, 2);
    if (hr != 0 && hr != undefined) {
        min = pad(min, 2);
        return hr + ':' + min + ':' + sec;
    }
    return min + ':' + sec;
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function setSongInfo(title, artist) {
    $('#info-title span').text(title);
    $('#info-artist span').text(artist);
}

function manageFiles() {
    utils.getMusicDirs(changeFinder.refreshDB);
}

module.exports.refreshList = insertSongRow;
module.exports.setAlbumArt = setAlbumArt;