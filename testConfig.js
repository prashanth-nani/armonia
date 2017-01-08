/**
 * Created by prashanth on 6/1/17.
 */
const config = require('electron-json-storage');
const electron = require('electron');

config.get('foobar', function(error, data) {
    if (error) throw error;
    console.log(data);
});