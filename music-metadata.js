/**
 * Created by prashanth on 16/12/16.
 */
var fs = require('fs');
var mm = require('musicmetadata');

// create a new parser from a node ReadStream
var parser = mm(fs.createReadStream('Kala.mp3'), { duration: true }, function (err, metadata) {
    if (err) throw err;
    console.log(metadata);
    console.log(new Buffer(metadata.picture[0].data).toString('base64'))
    fs.writeFile("kala.jpg", metadata.picture[0].data, function (err){ if(err) throw err;})
});