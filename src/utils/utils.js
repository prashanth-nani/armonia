const {dialog} = require('electron').remote;

export let get_music_dirs = (callback) => {
    "use strict";
    dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']}, callback);
}