window.$ = window.jQuery = require("../../src/js/jquery");

var player;
var playing = false;

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('armonia.db');

let $songtable = $('#content-list table >tbody');
createList("album_name");

function createList(sortElement){
  $songtable.find('tr:gt(0)').remove();
  db.each(`SELECT song.id as id, title, artist, location, year, album_id, album_name FROM song, album WHERE song.album_id = album.id ORDER BY ${sortElement}`, function (err, row) {
      $songtable.append(`<tr data-loc="${row.location}" data-album-id="${row.album_id}"><td class="title">${row.title}</td><td class="artist">${row.artist}</td><td class="album">${row.album_name}</td><td class="year">${row.year}</td></tr>`);
  });
}

$(function () {
    $songtable.on("click", "tr", function () {
        if (playing) {
            player.pause();
            playing = false;
            console.log("Stopped");
        }
        let path = $(this).attr("data-loc");
        player = new Audio(path);
        player.play();
        console.log("playing " + path);
        playing = true;
    });
    $("#stop").click(function () {
        player.pause();
        playing = false;
    });
    $("#dur").click(()=>console.log(player.duration));
    $("#cur").click(()=>console.log(player.currentTime));
});
