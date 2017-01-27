const remote = require('electron').remote;
const app = remote.app;
const path = require('path');
const utils = require('../utils/utils');
const storage = require('../utils/storage');
const changeFinder = require('../fileWatch/changeFinder');
const player = require('../player/player');
window.$ = window.jQuery = require('../js/jquery');

var sqlite3 = require('sqlite3').verbose();
let db_path = path.join(app.getPath('userData'), "armonia.db");
let $contentlist = $('#content-list');
let $songtable = $('#content-list table > tbody');
let $choosefolderdiv = $('#select-music-dir');
let $choosefolderbtn = $('#select-music-dir a');
let nextElement;
let prevElement;
let playingRowIdBeforeSort;

var db = new sqlite3.Database(db_path);

$(function() {
    changeFinder.startRefresh();
    createSongList();
    handleEvents();
});

export let createSongList = () => {
    console.log("Refreshing list");
    let sortElement = storage.get("songsSortBy");
    let order = "";
    let reversed = false;
    if(!sortElement)
        sortElement = "title";
    if(reversed)
    {
        order = "DESC";
    }
    $("#select-sort-by").val(sortElement);
    $songtable.find('tr:gt(0)').remove();
    db.each(`SELECT song.id as id, title, artist, location, year, album_id, album_name FROM song, album WHERE song.album_id = album.id ORDER BY ${sortElement} ${order}`, function(err, row) {
        if (err)
            console.error(err);
        else {
            $songtable.append(`<tr id="song-${row.id}" class="song-table-row" data-loc="${row.location}" data-album-id="${row.album_id}"><td class="title">${row.title}</td><td class="artist">${row.artist}</td><td class="album">${row.album_name}</td><td class="year">${row.year}</td></tr>`);
        }
    }, function() {
        showMusic();
        restorePlaylistState();
    });
};

function insertSongRow() {
    let sortElement = "title";
    db.each(`SELECT song.id as id, title, artist, location, year, album_id, album_name FROM song, album WHERE song.album_id = album.id ORDER BY ${sortElement}`, function(err, row) {
        if (err)
            console.error(err);
        else {
            if ($(`#content-list table >tbody>tr[data-loc="${row.location}"]`).length == 0)
                $songtable.append(`<tr id="song-${row.id}" class="song-table-row" data-loc="${row.location}" data-album-id="${row.album_id}"><td class="title">${row.title}</td><td class="artist">${row.artist}</td><td class="album">${row.album_name}</td><td class="year">${row.year}</td></tr>`);
        }
    }, showMusic);
}

function showMusic() {
    let $songtablerows = $('#content-list table >tbody>tr');
    if ($songtablerows.length > 1) {
        $contentlist.show();
        $choosefolderdiv.hide();
    } else {
        $choosefolderdiv.show();
        $contentlist.hide();
    }
}

let playFromTag = (rowElem) => {
    "use strict";
    let $playingrow = $('#content-list table >tbody>tr.selected');
    $playingrow.removeClass("selected");
    $(rowElem).addClass("selected");

    let title = $($(rowElem).children()[0]).text();
    let artist = $($(rowElem).children()[1]).text();
    let path = $(rowElem).attr("data-loc");
    let album_id = $(rowElem).attr("data-album-id");

    setPrevAndNextElem($(rowElem));

    player.playSong(path, title, artist, album_id);
};

let setPrevAndNextElem = (playingElem)=>{
    "use strict";
    if(!playingElem.is(':nth-child(2)'))
        prevElement = playingElem.prev();
    else {
        prevElement = undefined;
    }

    if(!playingElem.is(':last-child'))
        nextElement = playingElem.next();
    else
        nextElement = undefined;
};

export let playNextSong = () => {
    "use strict";
    if (nextElement != undefined)
        playFromTag(nextElement);
};

export let playPreviousSong = () => {
    "use strict";
    if (prevElement != undefined)
        playFromTag(prevElement);
};

let savePlaylistState = () => {
    "use strict";
    playingRowIdBeforeSort = $('#content-list table >tbody>tr.selected').attr('id');
};

let restorePlaylistState = () => {
    "use strict";
    let $playingElem = $(`#${playingRowIdBeforeSort}`);
    $('#content-list table >tbody>tr.selected').removeClass("selected");
    $playingElem.addClass("selected");

    setPrevAndNextElem($playingElem);
};

$.fn.randomize = function(selector){
    var $elems = selector ? $(this).find(selector) : $(this).children();
    for (var i = $elems.length; i >= 0; i--) {
        $(this).append($elems[Math.random() * i | 0]);
    }
    restorePlaylistState();
    return this;
};

function handleEvents() {
    $songtable.on("dblclick", "tr", function() {
        playFromTag(this);
    });

    $("#play-pause-btn").click(function() {
        if (player.playing){
            player.pauseSong();
          }
        else {
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

    $choosefolderbtn.click(() => {
        "use strict";
        utils.chooseMusicDirs();
    });

    $('#progress-outer').bind('click', function(ev) {
        var $div = $(ev.target);
        var offset = $div.offset();
        var progressWidth = ev.clientX - offset.left;

        let totalBarWidth = $div.width();
        let completedPercentage = (100 * progressWidth) / totalBarWidth;
        player.setCurrentTime(completedPercentage);
    });


    $("#select-sort-by").change(function() {
        let sortByValue = $("#select-sort-by").val();
        storage.set("songsSortBy", sortByValue);
        savePlaylistState();
        createSongList();
    });
}

module.exports.refreshList = insertSongRow;
