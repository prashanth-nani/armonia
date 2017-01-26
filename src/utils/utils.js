const {dialog} = require('electron').remote;
import path from 'path';
import glob from 'glob';
const storage = require('../utils/storage');
const player_ui = require('../player/player_ui');
const renderer = require('../renderer/home_renderer');
const changeFinder = require('../fileWatch/changeFinder');

export let chooseMusicDirs = () => {
    "use strict";
    dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']}, updateMusicDirs);
};

let updateMusicDirs = (musicDir) => {
    let presentDirs = storage.get("musicDirs");
    if(presentDirs != null)
        presentDirs.push(...musicDir);
    else
        presentDirs = musicDir;
    if(presentDirs)
        presentDirs = Array.from(new Set(presentDirs));
    storage.set("musicDirs", presentDirs);
    changeFinder.startRefresh();
};

export let getAlbumArtPathById = (albumArtDir, album_id)=>{
    let pathWithoutExt = path.join(albumArtDir, album_id);
    glob.glob(`${pathWithoutExt}.*`,function (err, files) {
        if(err)
            console.error(err);
        else {
            console.log(files);
            player_ui.setAlbumArt(undefined, files[0]);
        }
    })
};

export let getMinutes = (seconds) => {
    let hr;
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    if (min >= 60) {
        hr = Math.floor(min / 60);
        min = Math.floor(min % 60);
    }
    sec = pad(sec, 2);
    if (hr != 0 && hr != undefined) {
        min = pad(min, 2);
        return `${hr}:${min}:${sec}`;
    }
    return `${min}:${sec}`;
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
