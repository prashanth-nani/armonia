'use strict';

module.exports.processChanges = function (watchPath) {
    'use strict';

    var chokidar = require('chokidar');
    var path = require('path');
    var fs = require('fs');

    var changeFilePath = path.join(__dirname, "..", "..", "changes.json");
    // fs.exists(changeFilePath, function (exists) {
    //     if (exists) {
    //         console.log("Change recording file already exists");
    //     } else {
    //         fs.writeFile(changeFilePath, JSON.stringify({added: [], removed: [], changed: []}), err => {
    //             if (err) throw err;
    //         });
    //         console.log("Change recording file created");
    //     }
    // });


    var changesObj = { added: [], removed: [], changed: [] };
    var changeFileLocked = false;

    var watcher = chokidar.watch(watchPath, {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    var log = console.log.bind(console);
    var handle = void 0;
    var timerOn = false;
    var changedList = [];
    var removedList = [];
    var addedList = [];

    function writeChangesToFile() {
        console.log("Writing to file");
        fs.exists(changeFilePath, function (exists) {
            if (exists) {
                console.log("File exists!!");
                fs.readFileSync(changeFilePath, function (err, data) {
                    if (err) throw err;
                    changesObj = JSON.parse(data);
                });
            } else {
                console.log("File doesn't exist");
                changesObj = { added: [], removed: [], changed: [] };
            }
            console.log(changesObj);
            changesObj.added = changesObj.added.concat(addedList);
            changesObj.removed = changesObj.removed.concat(removedList);
            changesObj.changed = changesObj.changed.concat(changedList);

            fs.writeFile(changeFilePath, JSON.stringify(changesObj), 'utf8', function (err) {
                if (err) throw err;
            });
            clearInterval(handle);
            timerOn = false;
            console.log("timer cleared after writing");
        });
    }

    var addFile = function addFile(path) {
        if (timerOn) {
            clearInterval(handle);
            timerOn = false;
            console.log("timer cleared");
        }
        handle = setInterval(writeChangesToFile, 5000);
        console.log("Interval set");
        timerOn = true;
        addedList.push(path);
        log('File ' + path + ' has been added');
        // log(`List is ${addedList}`);
    };

    var changeFile = function changeFile(path) {
        console.log("file changed");
    };

    var deleteFile = function deleteFile(path) {
        console.log("File removed");
    };

    var addDir = function addDir(path) {
        log('Dir ' + path + ' has been added');
    };

    var removeDir = function removeDir(path) {
        log('Directory ' + path + ' has been removed');
    };

    watcher.on('add', addFile).on('change', changeFile).on('unlink', deleteFile);

    // More possible events.
    watcher.on('addDir', addDir).on('unlinkDir', removeDir).on('error', function (error) {
        return log('Watcher error: ' + error);
    }).on('ready', function () {
        return log('Initial scan complete. Ready for changes');
    }).on('raw', function (event, path, details) {
        log('Raw event info:', event, path, details);
    });

    //Getting stats when available
    watcher.on('change', function (path, stats) {
        if (stats) console.log('File ' + path + ' changed size to ' + stats.size);
    });
};