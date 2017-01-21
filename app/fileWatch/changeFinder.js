'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.startRefresh = exports.refreshDB = exports.updateModifiedFiles = exports.applyChangesToDB = exports.createCover = exports.addToDB = exports.deleteFromDB = exports.getMultipleFolders = exports.getFiles = undefined;

var _dbutils = require('../database/dbutils');

var myDb = _interopRequireWildcard(_dbutils);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _musicmetadata = require('musicmetadata');

var _musicmetadata2 = _interopRequireDefault(_musicmetadata);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var ui = require(_path2.default.join(__dirname, "..", "renderer/home_renderer"));

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(_path2.default.join(__dirname, "..", "..", "armonia.db"));

var presentList = [];
var newList = [];
var album_art_dir = _path2.default.join("..", "..", "resources", "album_arts");

var getFiles = exports.getFiles = function getFiles(dir, files_) {
    files_ = files_ || [];
    if (_fs2.default.existsSync(dir)) {
        var files = _fs2.default.readdirSync(dir);
        for (var i in files) {
            var name = _path2.default.join(dir, files[i]);
            if (_fs2.default.statSync(name).isDirectory()) {
                getFiles(name, files_);
            } else {
                if (name.endsWith(".mp3")) files_.push(name);
            }
        }
    }
    return files_;
};

var getMultipleFolders = exports.getMultipleFolders = function getMultipleFolders(paths) {
    var allFiles = [];
    paths.forEach(function (path) {
        allFiles = allFiles.concat(getFiles(path));
    });
    return allFiles;
};

var deleteFromDB = exports.deleteFromDB = function deleteFromDB(removed) {
    removed.forEach(function (file) {
        db.run("DELETE from song WHERE location=(?)", file);
    });
};

var addToDB = exports.addToDB = function addToDB(added, callback) {
    var album_stmt = db.prepare("INSERT OR IGNORE INTO album (album_name, album_artist, year, total) VALUES (?, ?, ?, ?)");
    var song_stmt = db.prepare("INSERT INTO song(title, artist, genre, location, track, album_id, last_modified) VALUES (?, ?, ?, ?, ?, ?, ?)");
    added.forEach(function (file) {
        if (file.endsWith('.mp3')) {
            var readableStream;

            (function () {
                var last_modified = _fs2.default.statSync(file).mtime.getTime();
                readableStream = _fs2.default.createReadStream(file);

                (0, _musicmetadata2.default)(readableStream, function (err, metadata) {
                    if (err) console.error("File: " + file + "\n" + err);else {
                        (function () {
                            readableStream.close();

                            var album_id = -1;
                            var year = metadata.year;
                            var album = metadata.album;
                            var album_artist = metadata.albumartist[0];
                            var title = metadata.title;
                            var artist = metadata.artist[0];
                            var genre = metadata.genre[0];

                            if (year != "" || year != null) year = year.substr(0, 4);else year = "Unknown";
                            if (album == "" || album == null) album = "Unknown";
                            if (album_artist == "" || album_artist == null) album_artist = "Unknown";
                            if (title == "" || title == null) title = "Unknown";
                            if (artist == "" || artist == null) artist = "Unknown";
                            if (genre == "" || genre == null) genre = "Unknown";

                            album_stmt.run(album, album_artist, year, metadata.track.of, function () {
                                db.each("select id as id from album where album_name=? and album_artist=? and year=?", [album, album_artist, year], function (err, row) {
                                    if (err) console.error(err);else {
                                        album_id = row.id;
                                        createCover(metadata, album_id);
                                        song_stmt.run(title, artist, genre, file, metadata.track.no, album_id, last_modified);
                                    }
                                }, function () {
                                    typeof callback === 'function' && callback();
                                });
                            });
                        })();
                    }
                });
            })();
        }
    });
};

var createCover = exports.createCover = function createCover(metadata, album_id) {
    if (metadata.picture[0]) {
        (function () {
            var album_art_name = album_id + "." + metadata.picture[0].format;
            var filePath = _path2.default.join(album_art_dir, album_art_name);
            _fs2.default.stat(filePath, function (err, stat) {
                if (err != null) {
                    if (err.code == 'ENOENT') {
                        _fs2.default.writeFile(_path2.default.join(__dirname, "..", "..", "resources", "album_arts", album_art_name), metadata.picture[0].data, function (error) {
                            if (error) console.error(error);
                        });
                    } else {
                        console.log('Some other error: ', err.code);
                    }
                }
            });
        })();
    }
};

var applyChangesToDB = exports.applyChangesToDB = function applyChangesToDB() {
    var removed = presentList.filter(function (x) {
        return newList.indexOf(x) < 0;
    });
    deleteFromDB(removed);
    console.log("Removed :\n" + removed);
    var added = newList.filter(function (x) {
        return presentList.indexOf(x) < 0;
    });
    addToDB(added, ui.refreshList);
    console.log("Added :\n" + added);
    updateModifiedFiles();
};

var updateModifiedFiles = exports.updateModifiedFiles = function updateModifiedFiles() {
    console.log("Updating modified files");
    presentList.forEach(function (file) {
        if (_fs2.default.existsSync(file)) {
            var last_modified = _fs2.default.statSync(file).mtime.getTime();
            db.each("SELECT last_modified FROM song WHERE location=? and last_modified!=?", [file, last_modified], function (err, row) {
                console.log("Modified : " + file);
                deleteFromDB([file]);
                addToDB([file]);
            });
        }
    });
};

var refreshDB = exports.refreshDB = function refreshDB(musicDir) {
    myDb.createTables(db);
    newList = getMultipleFolders(musicDir);
    db.each("SELECT location FROM song", function (err, row) {
        if (err) throw err;
        presentList.push(row.location);
    }, applyChangesToDB);
};

var startRefresh = exports.startRefresh = function startRefresh(musicDir) {
    db.serialize(function () {
        refreshDB(musicDir);
    });
};