var fs = require('fs');
fs.createReadStream('test/signal.spec.in.js').pipe(fs.createWriteStream('test/signal.spec.js'));
