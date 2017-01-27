'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getMinutes = exports.getAlbumArtPathById = exports.chooseMusicDirs = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var dialog = require('electron').remote.dialog;

var storage = require('../utils/storage');
var player_ui = require('../player/player_ui');
var renderer = require('../renderer/home_renderer');
var changeFinder = require('../fileWatch/changeFinder');

var chooseMusicDirs = exports.chooseMusicDirs = function chooseMusicDirs() {
    "use strict";

    dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] }, updateMusicDirs);
};

var updateMusicDirs = function updateMusicDirs(musicDir) {
    var _presentDirs;

    var presentDirs = storage.get("musicDirs");
    if (presentDirs != null) (_presentDirs = presentDirs).push.apply(_presentDirs, _toConsumableArray(musicDir));else presentDirs = musicDir;
    if (presentDirs) presentDirs = Array.from(new Set(presentDirs));
    storage.set("musicDirs", presentDirs);
    changeFinder.startRefresh();
};

var getAlbumArtPathById = exports.getAlbumArtPathById = function getAlbumArtPathById(albumArtDir, album_id) {
    var pathWithoutExt = _path2.default.join(albumArtDir, album_id);
    _glob2.default.glob(pathWithoutExt + '.*', function (err, files) {
        if (err) console.error(err);else {
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