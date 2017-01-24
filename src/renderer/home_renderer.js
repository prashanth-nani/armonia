const remote = require('electron').remote;
const app = remote.app;
const path = require('path');
const utils = require('../utils/utils');
const changeFinder = require('../fileWatch/changeFinder');
const player = require('../player/player');
window.$ = window.jQuery = require('../js/jquery');

var sqlite3 = require('sqlite3').verbose();
let db_path = path.join(app.getPath('userData'), "armonia.db");
let $contentlist = $('#content-list');
let $songtable = $('#content-list table > tbody');
let $choosefolderdiv = $('#select-music-dir');
let $choosefolderbtn = $('#select-music-dir a');

var db = new sqlite3.Database(db_path);

$(function() {
    createList("title");
    handleEvents();
});

function createList(sortElement) {
    console.log("Refreshing list");
    $songtable.find('tr:gt(0)').remove();
    db.each(`SELECT song.id as id, title, artist, location, year, album_id, album_name FROM song, album WHERE song.album_id = album.id ORDER BY ${sortElement}`, function(err, row) {
        if (err)
            console.error(err);
        else {
            $songtable.append(`<tr id="song-${row.id}" data-loc="${row.location}" data-album-id="${row.album_id}"><td class="title">${row.title}</td><td class="artist">${row.artist}</td><td class="album">${row.album_name}</td><td class="year">${row.year}</td></tr>`);
        }
    }, function() {
        // manageFiles();
        showMusic();
    });
}

function insertSongRow() {
    let sortElement = "title";
    db.each(`SELECT song.id as id, title, artist, location, year, album_id, album_name FROM song, album WHERE song.album_id = album.id ORDER BY ${sortElement}`, function(err, row) {
        if (err)
            console.error(err);
        else {
            if ($(`#content-list table >tbody>tr[data-loc="${row.location}"]`).length == 0)
                $songtable.append(`<tr id="song-${row.id}" data-loc="${row.location}" data-album-id="${row.album_id}"><td class="title">${row.title}</td><td class="artist">${row.artist}</td><td class="album">${row.album_name}</td><td class="year">${row.year}</td></tr>`);
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

function handleEvents() {
    $songtable.on("dblclick", "tr", function() {
        let $playingrow = $('#content-list table >tbody>tr.selected');
        $playingrow.removeClass("selected");
        $(this).addClass("selected");

        let title = $($(this).children()[0]).text();
        let artist = $($(this).children()[1]).text();
        let path = $(this).attr("data-loc");
        let album_id = $(this).attr("data-album-id");

        player.playSong(path, title, artist, album_id);
    });

    $("#play-pause-btn").click(function() {
        if (player.playing){
            player.pauseSong();
          }
        else {
            player.playSong();
        }
    });

    // $("#dur").click(() => console.log(player.duration));
    // $("#cur").click(() => console.log(player.currentTime));

    $choosefolderbtn.click(() => {
        "use strict";
        manageFiles();
    });

    $('#progress-outer').bind('click', function(ev) {
        var $div = $(ev.target);
        var offset = $div.offset();
        var progressWidth = ev.clientX - offset.left;

        let totalBarWidth = $div.width();
        let completedPercentage = (100 * progressWidth) / totalBarWidth;
        player.setCurrentTime(completedPercentage);
    });
}

function manageFiles() {
    utils.getMusicDirs(changeFinder.startRefresh);
}

module.exports.refreshList = insertSongRow;
