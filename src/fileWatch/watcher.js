module.exports.processChanges = function (watchPath) {
    'use strict';

    const chokidar = require('chokidar');
    const path = require('path');
    const fs = require('fs');

    let changeFilePath = path.join(__dirname, "..", "..", "changes.json");
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


    let changesObj = {added: [], removed: [], changed: []};
    let changeFileLocked = false;

    let watcher = chokidar.watch(watchPath, {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    var log = console.log.bind(console);
    let handle;
    let timerOn = false;
    let changedList = [];
    let removedList = [];
    let addedList = [];

    function writeChangesToFile() {
        console.log("Writing to file");
        fs.exists(changeFilePath, (exists)=> {
            if (exists) {
                console.log("File exists!!");
                fs.readFileSync(changeFilePath, (err, data)=> {
                    if (err) throw err;
                    changesObj = JSON.parse(data);
                });
            } else {
                console.log("File doesn't exist");
                changesObj = {added: [], removed: [], changed: []};
            }
            console.log(changesObj);
            changesObj.added = changesObj.added.concat(addedList);
            changesObj.removed = changesObj.removed.concat(removedList);
            changesObj.changed = changesObj.changed.concat(changedList);

            fs.writeFile(changeFilePath, JSON.stringify(changesObj), 'utf8', err=> {
                if (err) throw err;
            });
            clearInterval(handle);
            timerOn = false;
            console.log("timer cleared after writing");
        });
    }

    let addFile = function (path) {
        if (timerOn) {
            clearInterval(handle);
            timerOn = false;
            console.log("timer cleared");
        }
        handle = setInterval(writeChangesToFile, 5000);
        console.log("Interval set");
        timerOn = true;
        addedList.push(path);
        log(`File ${path} has been added`);
        // log(`List is ${addedList}`);
    };

    let changeFile = function (path) {
        console.log("file changed");
    };

    let deleteFile = function (path) {
        console.log("File removed");
    };

    let addDir = function (path) {
        log(`Dir ${path} has been added`)
    };

    let removeDir = function (path) {
        log(`Directory ${path} has been removed`)
    };

    watcher
        .on('add', addFile)
        .on('change', changeFile)
        .on('unlink', deleteFile);

// More possible events.
    watcher
        .on('addDir', addDir)
        .on('unlinkDir', removeDir)
        .on('error', error => log(`Watcher error: ${error}`))
        .on('ready', () => log('Initial scan complete. Ready for changes'))
        .on('raw', (event, path, details) => {
            log('Raw event info:', event, path, details);
        });

    //Getting stats when available
    watcher.on('change', (path, stats) => {
        if (stats) console.log(`File ${path} changed size to ${stats.size}`);
    });
}