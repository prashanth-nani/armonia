'use strict';

Object.defineProperty(exports, "__esModule", {
        value: true
});
var createTables = exports.createTables = function createTables(db) {
        db.run("CREATE TABLE if not exists album (id INTEGER PRIMARY KEY NOT NULL, album_name TEXT NOT NULL, album_artist TEXT NOT NULL, year INTEGER NOT NULL DEFAULT -1, total INTEGER, UNIQUE(album_name, album_artist, year))");
        db.run("CREATE TABLE if not exists song (id INTEGER PRIMARY KEY NOT NULL, title TEXT, artist TEXT, genre TEXT, location TEXT, track INTEGER, album_id INTEGER, last_modified INTEGER, FOREIGN KEY(album_id) REFERENCES album(id))");
};