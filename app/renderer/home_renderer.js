'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var remote = require('electron').remote;
var app = remote.app;
var path = require('path');
var utils = require('../utils/utils');
var storage = require('../utils/storage');
var changeFinder = require('../fileWatch/changeFinder');
var player = require('../player/player');
window.$ = window.jQuery = require('../js/jquery');

var sqlite3 = require('sqlite3').verbose();
var db_path = path.join(app.getPath('userData'), "armonia.db");
var $contentlist = $('#content-list');
var $songtable = $('#content-list table > tbody');
var $choosefolderdiv = $('#select-music-dir');
var $choosefolderbtn = $('#select-music-dir a');
var nextElement = void 0;
var prevElement = void 0;
var playingRowIdBeforeSort = void 0;

var db = new sqlite3.Database(db_path);

$(function () {
    changeFinder.startRefresh();
    createSongList();
    handleEvents();
});

var createSongList = exports.createSongList = function createSongList() {
    console.log("Refreshing list");
    var sortElement = storage.get("songsSortBy");
    var order = "";
    var reversed = false;
    if (!sortElement) sortElement = "title";
    if (reversed) {
        order = "DESC";
    }
    $("#select-sort-by").val(sortElement);
    $songtable.find('tr:gt(0)').remove();
    db.each('SELECT song.id as id, title, artist, location, year, album_id, album_name FROM song, album WHERE song.album_id = album.id ORDER BY ' + sortElement + ' ' + order, function (err, row) {
        if (err) console.error(err);else {
            $songtable.append('<tr id="song-' + row.id + '" class="song-table-row" data-loc="' + row.location + '" data-album-id="' + row.album_id + '"><td class="title">' + row.title + '</td><td class="artist">' + row.artist + '</td><td class="album">' + row.album_name + '</td><td class="year">' + row.year + '</td></tr>');
        }
    }, function () {
        showMusic();
        restorePlaylistState();
    });
};

function insertSongRow() {
    var sortElement = "title";
    db.each('SELECT song.id as id, title, artist, location, year, album_id, album_name FROM song, album WHERE song.album_id = album.id ORDER BY ' + sortElement, function (err, row) {
        if (err) console.error(err);else {
            if ($('#content-list table >tbody>tr[data-loc="' + row.location + '"]').length == 0) $songtable.append('<tr id="song-' + row.id + '" class="song-table-row" data-loc="' + row.location + '" data-album-id="' + row.album_id + '"><td class="title">' + row.title + '</td><td class="artist">' + row.artist + '</td><td class="album">' + row.album_name + '</td><td class="year">' + row.year + '</td></tr>');
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

var playFromTag = function playFromTag(rowElem) {
    "use strict";

    var $playingrow = $('#content-list table >tbody>tr.selected');
    $playingrow.removeClass("selected");
    $(rowElem).addClass("selected");

    var title = $($(rowElem).children()[0]).text();
    var artist = $($(rowElem).children()[1]).text();
    var path = $(rowElem).attr("data-loc");
    var album_id = $(rowElem).attr("data-album-id");

    //
    // if(!$(rowElem).is(':nth-child(2)'))
    //     prevElement = $(rowElem).prev();
    // else {
    //     prevElement = undefined;
    // }
    //
    // if(!$(rowElem).is(':last-child'))
    //     nextElement = $(rowElem).next();
    // else
    //     nextElement = undefined;

    setPrevAndNextElem($(rowElem));

    player.playSong(path, title, artist, album_id);
};

var setPrevAndNextElem = function setPrevAndNextElem(playingElem) {
    "use strict";

    if (!playingElem.is(':nth-child(2)')) prevElement = playingElem.prev();else {
        prevElement = undefined;
    }

    if (!playingElem.is(':last-child')) nextElement = playingElem.next();else nextElement = undefined;
};

var playNextSong = exports.playNextSong = function playNextSong() {
    "use strict";

    if (nextElement != undefined) playFromTag(nextElement);
};

var playPreviousSong = exports.playPreviousSong = function playPreviousSong() {
    "use strict";

    if (prevElement != undefined) playFromTag(prevElement);
};

var savePlaylistState = function savePlaylistState() {
    "use strict";

    playingRowIdBeforeSort = $('#content-list table >tbody>tr.selected').attr('id');
};

var restorePlaylistState = function restorePlaylistState() {
    "use strict";

    var $playingElem = $('#' + playingRowIdBeforeSort);
    $('#content-list table >tbody>tr.selected').removeClass("selected");
    $playingElem.addClass("selected");

    setPrevAndNextElem($playingElem);
    // if(!$playingElem.is(':nth-child(2)'))
    //     prevElement = $playingElem.prev();
    // else {
    //     prevElement = undefined;
    // }
    //
    // if(!$playingElem.is(':last-child'))
    //     nextElement = $playingElem.next();
    // else
    //     nextElement = undefined;
};

$.fn.randomize = function (selector) {
    var $elems = selector ? $(this).find(selector) : $(this).children();
    for (var i = $elems.length; i >= 0; i--) {
        $(this).append($elems[Math.random() * i | 0]);
    }
    restorePlaylistState();
    return this;
};

function handleEvents() {
    $songtable.on("dblclick", "tr", function () {
        playFromTag(this);
    });

    $("#play-pause-btn").click(function () {
        if (player.playing) {
            player.pauseSong();
        } else {
            player.playSong();
        }
    });

    $("#previous-btn").click(function () {
        playPreviousSong();
    });

    $("#next-btn").click(function () {
        playNextSong();
    });

    $('#shuffle-btn').click(function () {
        savePlaylistState();
        $songtable.randomize('.song-table-row');
    });

    $choosefolderbtn.click(function () {
        "use strict";

        utils.chooseMusicDirs();
    });

    $('#progress-outer').bind('click', function (ev) {
        var $div = $(ev.target);
        var offset = $div.offset();
        var progressWidth = ev.clientX - offset.left;

        var totalBarWidth = $div.width();
        var completedPercentage = 100 * progressWidth / totalBarWidth;
        player.setCurrentTime(completedPercentage);
    });

    $("#select-sort-by").change(function () {
        var sortByValue = $("#select-sort-by").val();
        storage.set("songsSortBy", sortByValue);
        savePlaylistState();
        createSongList();
    });
}

module.exports.refreshList = insertSongRow;