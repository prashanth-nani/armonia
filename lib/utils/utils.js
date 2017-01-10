'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var dialog = require('electron').remote.dialog;

var get_music_dirs = exports.get_music_dirs = function get_music_dirs(callback) {
    "use strict";

    dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] }, callback);
};