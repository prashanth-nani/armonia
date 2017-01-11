const {dialog} = require('electron').remote;
import path from 'path';
import glob from 'glob';
// import * as renderer from '../../ui_renderer/js/home_renderer';
const renderer = require(path.join(__dirname, "..", "..", "ui_renderer", "js", "home_renderer"));

export let getMusicDirs = (callback) => {
    "use strict";
    dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']}, callback);
};

export let getAlbumArtPathById = (albumArtDir, album_id)=>{
    "use strict";
    let pathWithoutExt = path.join(albumArtDir, album_id);
    glob.glob(`${pathWithoutExt}.*`,function (err, files) {
        if(err)
            console.error(err);
        else {
            console.log(files);
            renderer.setAlbumArt(undefined, files[0]);
        }
    })
};
