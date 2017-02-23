const replace = require('replace-in-file');
const options = {

    //Single file
    files: 'test/signal.spec.js',

    //Multiple replacements with different strings (replaced sequentially)
    from: [/(?:[^a-zA-z])const(?:[ \t\n])/g, /(?:[^a-zA-z])signal(?:[ \t\n])/g],
    to: ['let  ', 'const '],

    //Specify if empty/invalid file paths are allowed (defaults to false)
    //If set to true these paths will fail silently and no error will be thrown.
    allowEmptyPaths: false,

    //Character encoding for reading/writing files (defaults to utf-8)
    encoding: 'utf8',
};


try {
    var changedFiles = replace.sync(options);
    console.log('Modified files:', changedFiles.join(', '));
}
catch (error) {
    console.error('Error occurred:', error);
}
