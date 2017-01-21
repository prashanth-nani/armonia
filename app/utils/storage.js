'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var app = require('electron').app;
var fs = require('fs');
var path = require('path');
var data = null;
var dataFilePath = path.join(app.getPath('userData'), 'user-prefs.json');

function load() {
    if (data !== null) {
        return;
    }
    if (!fs.existsSync(dataFilePath)) {
        data = {};
        return;
    }
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
}

function save() {
    fs.writeFileSync(dataFilePath, JSON.stringify(data));
}

var set = exports.set = function set(key, value) {
    load();
    data[key] = value;
    save();
};

var get = exports.get = function get(key) {
    load();
    var value = null;
    if (key in data) {
        value = data[key];
    }
    return value;
};

var unset = exports.unset = function unset(key) {
    load();
    if (key in data) {
        delete data[key];
        save();
    }
};