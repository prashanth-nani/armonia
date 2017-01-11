const {dialog} = require('electron').remote;
import path from 'path';
import glob from 'glob';

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
        return files[0];
    })
};