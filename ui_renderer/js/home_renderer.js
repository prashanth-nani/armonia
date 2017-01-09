window.$ = window.jQuery = require("../../src/js/jquery");

var player;
var playing = false;

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('armonia.db');

let $songlist = $("#content-list ul");
db.each("SELECT id AS id, title, artist, genre, location FROM song ORDER BY title", function (err, row) {
    $songlist.append(`<li data-loc="${row.location}">${row.title}</li>`);
});

$(function () {
    $songlist.on("click", "li", function () {
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
