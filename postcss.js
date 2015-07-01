#!/usr/bin/env node
'use strict';

var watch = require('node-watch');
var postcss = require('postcss');
var fs = require('fs');

// postcss plugins
var postcssImport = require('postcss-import');
var postcssConditionals = require('postcss-conditionals');
var postcssFor = require('postcss-for');
var postcssSimpleVars = require('postcss-simple-vars');
var postcssEach = require('postcss-each');
// var postcssSprites = require('postcss-sprites');
var postcssQuantityQueries = require('postcss-quantity-queries');
var postcssCustomMedia = require('postcss-custom-media');
var autoprefixerCore = require('autoprefixer-core')({browsers: '>5%'});
// var cssnano = require('cssnano');
var postcssReporter = require('postcss-reporter');

// SETTINGS
var config = {
    plugins: [
        postcssImport
    //,   postcssConditionals
    //,   postcssFor
    ,   postcssSimpleVars
    //,   postcssEach
    //,   postcssQuantityQueries
    //,   postcssCustomMedia
    //,   autoprefixerCore
    ,   postcssReporter
    ]
,   watchFolder: "dev/_css/"
,   buildFolder: "build/css/"
};

 
// watch is recursive by default (looks in all subdirectories)
// We're going to watch all files in watchFolder, not just css files.
// This will recompile css when any file changes, which is useful for some of 
// the more ambitious postcss plugins.
watch([config.watchFolder], function(changedFile) {
    // log file change
    console.log("\n[POSTCSS] File changed: " + changedFile); 

    // get array of stylesheets in _css folder
    var stylesheets = getStylesheets(config.watchFolder);
    // log stylesheets that will be processed
    console.log("\n[POSTCSS] Processing CSS files: " + stylesheets + "\n");

    // for every item (file) in stylesheets array
    // look up array length only once for efficiency
    for(var i = 0, j = stylesheets.length; i < j; i++) {

        // paths relative to directory in which script is running
        var filename = stylesheets[i];
        var srcFilepath = config.watchFolder + filename;
        var buildFilepath = config.buildFolder + filename;

        // read css file into string
        // method reads file into string because encoding option is specified (else returns a Buffer object)
        var cssString = fs.readFileSync(srcFilepath, {encoding: "utf8"});

        // process css string
        process(cssString, srcFilepath, buildFilepath);
        // log reporter
        console.log(postcssReporter);
        postcssReporter();
        // log succcess
        console.log("\n[POSTCSS] " + filename + " processed successfully.\n");
    
    }
});

// get array of stylesheets in dir
function getStylesheets(dir) {
    // read given directory; returns array of files
    var files = fs.readdirSync(dir);
    // holds array of stylesheets
    var stylesheets = [];

    // iterate over stylesheets array 
    // look up the length of files[] only once for efficiency
    for(var i = 0, j = files.length; i < j; i++) {
        // test if file extension is .css
        var isStylesheet = /(?:\.css)$/.test(files[i]);
        // (?:x)  lets you define subexpressions for regular expression operators to work with
        // \ (backslash) preceding . (period) means to interpret the . literally
        // $ matches end of input

        // only add files with .css extension to the stylesheets array
        if (isStylesheet === true) {
            // adds file to stylesheets to array
            stylesheets.push(files[i]);
        }
    }

    return stylesheets;
}

// process css
function process(cssString, srcFilepath, buildFilepath) {
    // creates new postcss Processor instance with plugins in postcssPlugins[]
    var Processor = postcss(config.plugins);

    // do it
    Processor.process(cssString, { from: srcFilepath, to: buildFilepath })
        .then(function (result) {
            fs.writeFileSync(buildFilepath, result.css);
            // source map
            if(result.map) {
                fs.writeFileSync(buildFilepath + '.map', result.map);
            }
        }
    );
}