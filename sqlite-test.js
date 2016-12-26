/**
 * Created by prashanth on 16/12/16.
 */
var fs = require('fs')
var mm = require('musicmetadata')

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('armonia.db');

function getFiles (dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

function getMetaData(file, stmt) {
    var parser = mm(fs.createReadStream(file), function (err, metadata) {
        if (err){
            console.log(file);
            throw err;
        }
        console.log(file);
        stmt.run(metadata.title, file);
    });
}

db.serialize(function() {
    db.run("CREATE TABLE if not exists album (id INTEGER PRIMARY KEY NOT NULL, album_name TEXT NOT NULL DEFAULT '', album_artist TEXT DEFAULT 'HELLO' NOT NULL, year INTEGER NOT NULL DEFAULT -1, total INTEGER, album_art TEXT, UNIQUE(album_name, album_artist, year, album_art))");
    // db.run("ALTER TABLE album ADD ");
    db.run("CREATE TABLE if not exists song (id INTEGER PRIMARY KEY NOT NULL, title TEXT, artist TEXT, genre TEXT, location TEXT, track INTEGER, album_id INTEGER)");
    var files = getFiles("/media/prashanth/body/Music");
    var album_stmt = db.prepare("INSERT OR IGNORE INTO album (album_name, album_artist, year, total, album_art) VALUES (?, ?, ?, ?, ?)");
    var song_stmt = db.prepare("INSERT INTO song(title, artist, genre, location, track, album_id) VALUES (?, ?, ?, ?, ?, ?)");
    files.forEach(function (file){
        if(file.endsWith('.mp3')) {
            var readableStream = fs.createReadStream(file);
            mm(readableStream, function (err, metadata) {
                if (err) throw err;
                console.log(file + " "+metadata.year);
                // console.log();
                readableStream.close();
                album_stmt.run(metadata.album, metadata.albumartist[0], metadata.year, metadata.track.of, "art loc dude!!");
                song_stmt.run(metadata.title, metadata.artist[0], metadata.genre[0], file, metadata.track.no, 1);
            });
            // console.log(file);
            // stmt.run(file, file);
        }
    });
    // stmt.finalize();
    //
    // db.each("SELECT id AS id, title FROM song", function(err, row) {
    //     console.log(row.id + ": " + row.title);
    // });
});
// db.close();