/* global define */
define('config', function () {
    'use strict';
    return {
        // this determines if the browser's native context menu can be displayed
        // NOTE: These should be false in production
        enableNativeMouseSupport: true,
        enableNativeKeyboardSupport: true,

        defaults: {
            question: "question1",
            command: "commands/app::default"
        },

        // add your development environment to the whitelist for access to debug features
        // host - the domain you are running from
        // port* - required when accessing localhost
        // secure - whether or not to require an access code to debug exam items
        // local - when true, Hammer will not attempt to engage a delivery system (such as LMS)
        // edit - if true, shows the edit button
        whitelist: [
            {host: "localhost", secure: false, local: true, edit: true},
            {host: "montyr75.github.io", secure: false, local: true, debug: true, edit: true},
            {host: "github.io", secure: false, local: true, debug: true, edit: true}
        ],

        // additional resources used by exam (CSS, HTML, JS)
        dependencies: [
            "assets/css/style.css",
            "assets/js/functions.js",
            "assets/js/formatters.js",
            "assets/js/actions.js",
            "assets/widgets.html"
        ],

        paths: {
            sdk: "../Hammer/trunk/scripts/",
            exam: location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1),
            questions: 'questions/',
            strings: ["strings/global"],
            resources: ["assets/resources"]
        }
    };
});



