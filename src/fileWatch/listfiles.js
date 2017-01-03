/**
 * Created by prashanth on 17/12/16.
 */
'use strict';
const fs = require('fs');

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

function writeListToFile(list, filePath) {
    fs.exists(filePath, exits=> {
        if (exits) {
            fs.writeFileSync(filePath, list.join("\t"), 'utf8');
        } else
            console.log(`${filePath} not found`);
    });
}

function readListFromFile(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8').split("\t");
    }
}

let oldList = readListFromFile("./files.txt");
let newList = getFiles('/media/prashanth/body/Music');

let removedList = oldList.filter(x => newList.indexOf(x) < 0);
let addedList = newList.filter(x => oldList.indexOf(x) < 0);

console.log("Deleted " + removedList);
console.log("Added " + addedList);
console.log(newList.indexOf)