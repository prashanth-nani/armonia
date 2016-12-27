'use strict';

class MusicWatch {

    constructor(fol) {
        this.fol = fol;
        var chokidar = require('chokidar');

        this.watcher = chokidar.watch(fol, {
            ignored: /(^|[\/\\])\../,
            persistent: true
        });

        var log = console.log.bind(console);

        this.watcher
            .on('add', path => log(`File ${path} has been added`))
            .on('change', path => log(`File ${path} has been changed`))
            .on('unlink', path => log(`File ${path} has been removed`));

// More possible events.
        this.watcher
            .on('addDir', path => log(`Directory ${path} has been added`))
            .on('unlinkDir', path => log(`Directory ${path} has been removed`))
            .on('error', error => log(`Watcher error: ${error}`))
            .on('ready', () => log('Initial scan complete. Ready for changes'))
            .on('raw', (event, path, details) => {
                log('Raw event info:', event, path, details);
            });

// 'add', 'addDir' and 'change' events also receive stat() results as second
// argument when available: http://nodejs.org/api/fs.html#fs_class_fs_stats
        this.watcher.on('change', (path, stats) => {
            if (stats) console.log(`File ${path} changed size to ${stats.size}`);
        });

        setInterval(this.getList, 1000);
    }

    getList(){

    }

}

var watch = new MusicWatch("/home/prashanth/Desktop/test");