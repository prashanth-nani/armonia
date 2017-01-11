'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getAlbumArtPathById = exports.getMusicDirs = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dialog = require('electron').remote.dialog;

// import * as renderer from '../../ui_renderer/js/home_renderer';
var renderer = require(_path2.default.join(__dirname, "..", "..", "ui_renderer", "js", "home_renderer"));

var getMusicDirs = exports.getMusicDirs = function getMusicDirs(callback) {
    "use strict";

    dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] }, callback);
};

var getAlbumArtPathById = exports.getAlbumArtPathById = function getAlbumArtPathById(albumArtDir, album_id) {
    "use strict";

    var pathWithoutExt = _path2.default.join(albumArtDir, album_id);
    _glob2.default.glob(pathWithoutExt + '.*', function (err, files) {
        if (err) console.error(err);else {
            console.log(files);
            renderer.setAlbumArt(undefined, files[0]);
        }
    });
};