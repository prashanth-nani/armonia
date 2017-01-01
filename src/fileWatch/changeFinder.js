'use strict';

const path = require('path');
const fs = require('fs');
const mm = require('musicmetadata');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join("..", "..", "armonia.db"));

let presentList=[];
let newList = [];
let removed = [], added = [];

function getFiles(dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            if (name.endsWith(".mp3"))
                files_.push(name);
        }
    }
    return files_;
}

function deleteFromDB(removed) {
    removed.forEach(function (file) {
        db.run("DELETE from song WHERE location=(?)", file);
    });
}

function addToDB(added) {
    var album_stmt = db.prepare("INSERT OR IGNORE INTO album (album_name, album_artist, year, total, album_art) VALUES (?, ?, ?, ?, ?)");
    var song_stmt = db.prepare("INSERT INTO song(title, artist, genre, location, track, album_id) VALUES (?, ?, ?, ?, ?, ?)");
    added.forEach(function (file){
        if(file.endsWith('.mp3')) {
            var readableStream = fs.createReadStream(file);
            mm(readableStream, function (err, metadata) {
                if (err) throw err;
                readableStream.close();
                album_stmt.run(metadata.album, metadata.albumartist[0], metadata.year, metadata.track.of, "art loc dude!!");
                song_stmt.run(metadata.title, metadata.artist[0], metadata.genre[0], file, metadata.track.no, 1);
            });
        }
    });
}

function applyChangesToDB() {
    removed = presentList.filter(x => newList.indexOf(x) < 0);
    deleteFromDB(removed);
    console.log("Removed :\n"+removed);
    added = newList.filter(x => presentList.indexOf(x) < 0);
    addToDB(added);
    console.log("Added :\n"+added);
}

function refreshDB() {
    let path = "/media/prashanth/body/Music";
    newList = getFiles(path);
    db.each("SELECT location FROM song", function(err, row) {
        presentList.push(row.location);
    }, applyChangesToDB);
}

db.serialize(refreshDB);