'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var app;
try {
    app = require('electron').remote.app;
} catch (err) {
    app = require('electron').app;
}

// console.log(require('electron').remote.app);
var fs = require('fs');
var path = require('path');
var data;
var dataFilePath = path.join(app.getPath('userData'), 'config.json');

function load() {
    if (!fs.existsSync(dataFilePath)) {
        // console.log("File not exists");
        data = {};
        return;
    }
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    // console.log("After load\n");
    // console.log(data);
}

function save() {
    fs.writeFileSync(dataFilePath, JSON.stringify(data));
}

var set = exports.set = function set(key, value) {
    // console.log("Setting key "+key+" in config file");
    load();
    data[key] = value;
    save();
    // console.log("After setting\n");
    // console.log(data);
};

var get = exports.get = function get(key) {
    // console.log("Getting "+key+" from config");
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