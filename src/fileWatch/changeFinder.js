'use strict';

import * as myDb from '../database/dbutils';
import path from 'path';
import fs from 'fs';
import mm from 'musicmetadata';
const remote = require('electron').remote;
const mkdirp = require('mkdirp');
const app = remote.app;
const ui = require(path.join(__dirname, "..", "renderer/home_renderer"));
const storage = require('../utils/storage');


const sqlite3 = require('sqlite3').verbose();
let db_path = path.join(app.getPath('userData'), "armonia.db");
let presentList = [];
let newList = [];
let album_art_dir = path.join(app.getPath('userData'), "resources", "album_arts");
var db = new sqlite3.Database(db_path);


export let getFiles = (dir, files_) => {
    files_ = files_ || [];
    if (fs.existsSync(dir)) {
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
    }
    return files_;
}

export let getMultipleFolders = (paths) => {
    let allFiles = [];
    paths.forEach(function (path) {
        allFiles = allFiles.concat(getFiles(path));
    });
    return allFiles;
}

export let deleteFromDB = (removed) => {
    removed.forEach(function (file) {
        db.run("DELETE from song WHERE location=(?)", [file], ui.createList);
    });
}

export let addToDB = (added, callback) => {
    var album_stmt = db.prepare("INSERT OR IGNORE INTO album (album_name, album_artist, year, total) VALUES (?, ?, ?, ?)");
    var song_stmt = db.prepare("INSERT INTO song(title, artist, genre, location, track, album_id, last_modified) VALUES (?, ?, ?, ?, ?, ?, ?)");
    added.forEach(function (file) {
        if (file.endsWith('.mp3')) {
            let last_modified = fs.statSync(file).mtime.getTime();
            var readableStream = fs.createReadStream(file);
            mm(readableStream, function (err, metadata) {
                if (err) console.error("File: " + file + "\n" + err);
                else {
                    readableStream.close();

                    let album_id = -1;
                    let year = metadata.year;
                    let album = metadata.album;
                    let album_artist = metadata.albumartist[0];
                    let title = metadata.title;
                    let artist = metadata.artist[0];
                    let genre = metadata.genre[0];

                    if (year != "" || year != null)
                        year = year.substr(0, 4);
                    else
                        year = "Unknown";
                    if (album == "" || album == null)
                        album = "Unknown album";
                    if (album_artist == "" || album_artist == null)
                        album_artist = "Unknown artist";
                    if(title == "" || title == null)
                      title = "Unknown"
                    if(artist == "" || artist == null)
                        artist = "Unknown artist"
                    if(genre == "" || genre == null)
                        genre = "Unknown"


                    album_stmt.run(album, album_artist, year, metadata.track.of, function () {
                        db.each("select id as id from album where album_name=? and album_artist=? and year=?", [album, album_artist, year], function (err, row) {
                            if (err) console.error(err);
                            else {
                                album_id = row.id;
                                createCover(metadata, album_id);
                                song_stmt.run(title, artist, genre, file, metadata.track.no, album_id, last_modified);
                            }
                        }, function () {
                            typeof callback === 'function' && callback();
                        });
                    });
                }
            });
        }
    });
}

export let createCover = (metadata, album_id) => {
    if (metadata.picture[0]) {
        let album_art_name = album_id + "." + metadata.picture[0].format;
        let filePath = path.join(album_art_dir, album_art_name);
        fs.stat(filePath, function (err, stat) {
            if (err != null) {
                if (err.code == 'ENOENT') {
                    fs.writeFile(path.join(album_art_dir, album_art_name), metadata.picture[0].data, function (error) {
                        if (error)
                            console.error(error);
                    });
                } else {
                    console.log('Some other error: ', err.code);
                }
            }
        });
    }
}

export let applyChangesToDB = () => {
    let removed = presentList.filter(x => newList.indexOf(x) < 0);
    deleteFromDB(removed);
    console.log("Removed :\n" + removed);
    let added = newList.filter(x => presentList.indexOf(x) < 0);
    addToDB(added, ui.refreshList);
    console.log("Added :\n" + added);
    updateModifiedFiles();
}


export let updateModifiedFiles = () => {
    console.log("Updating modified files");
    presentList.forEach(function (file) {
        if (fs.existsSync(file)) {
            let last_modified = fs.statSync(file).mtime.getTime();
            db.each("SELECT last_modified FROM song WHERE location=? and last_modified!=?", [file, last_modified], function (err, row) {
                console.log("Modified : " + file);
                deleteFromDB([file]);
                addToDB([file]);
            });
        }
    });
}

export let refreshDB = (musicDir) => {
    myDb.createTables(db);
    newList = getMultipleFolders(musicDir);
    db.each("SELECT location FROM song", function (err, row) {
        if (err) throw err;
        presentList.push(row.location);
    }, applyChangesToDB);
}

export let startRefresh = () => {
    var dir = album_art_dir;
    if (!fs.existsSync(dir)){
        mkdirp.sync(album_art_dir);
    }

    db.serialize(()=>{
        let musicDir = storage.get("musicDirs");
        if(musicDir)
            refreshDB(musicDir);
    });
};
