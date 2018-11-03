define('config', function () {
    'use strict';
    return {
        // sets exam up for production mode
        "productionMode":false,
        // the question you want to load by default if none is specified
        "defaultQuestion":"question1",
        // add your development environment to the whitelist to have full access
        // host - the domain you are running from
        // secure - whether or not to require an access key code when viewing exam
        // local - use to determine if LMS is enabled
        // edit - enables edit mode features
        "whitelist":[
            {"host": "localhost", "secure": false, "local": true, "edit": false},
            {"host": "googledrive.com", "secure": false, "local": true, "edit": false},
            {"host": "www.googledrive.com", "secure": false, "local": true, "edit": false}
        ],
        // this determines if the native context menu will be displayed
        "enableContextMenu":false,
        // preloads these binary resources (i.e. images) before initialization
        "resources":"assets/resources.xml",
        // strings used by many questions of an exam
        "strings":"strings/global.xml",
        // additional resources used by exam (css, html, js)
        "dependencies":[
            "assets/css/style.css",
            "assets/css/gmail/css3-gmail-style.css",
            "assets/js/functions.js",
            "assets/js/formatters.js",
            "assets/js/actions.js",
            "assets/widgets.html"
        ],
        // RTL mode determines affects how menus and tooltips display on screen
        "rtl":false,
        // reference to Hammer SDK
        //"sdkPath":"../Hammer/branches/hammer-build/hammer/scripts/",
//        "sdkPath":"../../../Hammer/builds/2.1.2/scripts/",
        "sdkPath":"../Hammer/2.0.2/hammer/scripts/",
        // reference to this directory
        "examPath":location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1),
        // (optional properties used to change default paths)
        "questionsPath":"questions",
        "stringsPath":"strings",
        "viewsPath":"views",
        "imagesPath":"assets/images"
    };
});



