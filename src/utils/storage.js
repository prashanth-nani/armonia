var app = require('electron').app;
var fs = require('fs');
var path = require('path');
var data = null;
var dataFilePath = path.join(app.getPath('userData'), 'user-prefs.json');

function load() {
    console.log(app.getPath('userData'));
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

export let set = function(key, value) {
    load();
    data[key] = value;
    save();
};

export let get = function(key) {
    load();
    var value = null;
    if (key in data) {
        value = data[key];
    }
    return value;
};

export let unset = function(key) {
    load();
    if (key in data) {
        delete data[key];
        save();
    }
};