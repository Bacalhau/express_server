var fs = require('fs');

// async
fs.readFile('data.txt', 'utf8', function(oErr, sText) {
    console.log(sText);
        console.log('times');

});