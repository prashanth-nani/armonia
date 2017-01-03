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
        var name = path.join(dir, files[i]);
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
    var song_stmt = db.prepare("INSERT INTO song(title, artist, genre, location, track, album_id, last_modified) VALUES (?, ?, ?, ?, ?, ?, ?)");
    added.forEach(function (file){
        if(file.endsWith('.mp3')) {
            let last_modified = fs.statSync(file).mtime.getTime();
            var readableStream = fs.createReadStream(file);
            mm(readableStream, function (err, metadata) {
                if (err) throw err;
                readableStream.close();

                let album_id = -1;
                let year = metadata.year;
                let album = metadata.album;
                let album_artist = metadata.albumartist[0];

                if(year != "" || year != null)
                    year = year.substr(0, 4);
                else
                    year = "Unknown";
                if(album == "" || album == null)
                    album = "Unknown";
                if(album_artist == "" || album_artist == null)
                    album_artist = "Unknown";


                album_stmt.run(album, album_artist, year, metadata.track.of, "art loc dude!!", function () {
                    db.each("select id as id from album where album_name=? and album_artist=? and year=?", [album, album_artist, year], function (err, row) {
                        if(err) throw err;
                        album_id = row.id;
                        song_stmt.run(metadata.title, metadata.artist[0], metadata.genre[0], file, metadata.track.no, album_id, last_modified);
                    });
                });
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
    updateModifiedFiles();
}


function updateModifiedFiles() {
    presentList.forEach(function (file) {
        if(fs.existsSync(file)){
            let last_modified = fs.statSync(file).mtime.getTime();
            db.each("SELECT last_modified FROM song WHERE location=? and last_modified!=?", [file, last_modified], function (err, row) {
                console.log("Modified : "+ file);
                deleteFromDB([file]);
                addToDB([file]);
            });
        }
    });
}

function refreshDB() {
    db.run("CREATE TABLE if not exists album (id INTEGER PRIMARY KEY NOT NULL, album_name TEXT NOT NULL DEFAULT '', album_artist TEXT DEFAULT 'HELLO' NOT NULL, year INTEGER NOT NULL DEFAULT -1, total INTEGER, album_art TEXT, UNIQUE(album_name, album_artist, year, album_art))");
    db.run("CREATE TABLE if not exists song (id INTEGER PRIMARY KEY NOT NULL, title TEXT, artist TEXT, genre TEXT, location TEXT, track INTEGER, album_id INTEGER, last_modified INTEGER, FOREIGN KEY(album_id) REFERENCES album(id))");
    let path = "/media/prashanth/body/Music";
    newList = getFiles(path);
    db.each("SELECT location FROM song", function(err, row) {
        if(err) throw err;
        presentList.push(row.location);
    }, applyChangesToDB);
}

db.serialize(refreshDB);