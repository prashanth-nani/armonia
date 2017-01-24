'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getMinutes = exports.getAlbumArtPathById = exports.getMusicDirs = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dialog = require('electron').remote.dialog;

var player_ui = require('../player/player_ui');
var renderer = require('../renderer/home_renderer');

var getMusicDirs = exports.getMusicDirs = function getMusicDirs(callback) {
    "use strict";

    dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] }, callback);
};

var getAlbumArtPathById = exports.getAlbumArtPathById = function getAlbumArtPathById(albumArtDir, album_id) {
    var pathWithoutExt = _path2.default.join(albumArtDir, album_id);
    _glob2.default.glob(pathWithoutExt + '.*', function (err, files) {
        if (err) console.error(err);else {
            console.log(files);
            player_ui.setAlbumArt(undefined, files[0]);
        }
    });
};

var getMinutes = exports.getMinutes = function getMinutes(seconds) {
    var hr = void 0;
    var min = Math.floor(seconds / 60);
    var sec = Math.floor(seconds % 60);
    if (min >= 60) {
        hr = Math.floor(min / 60);
        min = Math.floor(min % 60);
    }
    sec = pad(sec, 2);
    if (hr != 0 && hr != undefined) {
        min = pad(min, 2);
        return hr + ':' + min + ':' + sec;
    }
    return min + ':' + sec;
};

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}