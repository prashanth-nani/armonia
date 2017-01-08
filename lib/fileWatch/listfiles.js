/**
 * Created by prashanth on 17/12/16.
 */
'use strict';

var fs = require('fs');

function getFiles(dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            if (name.endsWith(".mp3")) files_.push(name);
        }
    }
    return files_;
}

function writeListToFile(list, filePath) {
    fs.exists(filePath, function (exits) {
        if (exits) {
            fs.writeFileSync(filePath, list.join("\t"), 'utf8');
        } else console.log(filePath + ' not found');
    });
}

function readListFromFile(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8').split("\t");
    }
}

var oldList = readListFromFile("./files.txt");
var newList = getFiles('/media/prashanth/body/Music');

var removedList = oldList.filter(function (x) {
    return newList.indexOf(x) < 0;
});
var addedList = newList.filter(function (x) {
    return oldList.indexOf(x) < 0;
});

console.log("Deleted " + removedList);
console.log("Added " + addedList);
console.log(newList.indexOf);