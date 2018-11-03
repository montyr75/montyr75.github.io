// define custom functions - amd
define(['utils/cache'], function (cache) {
    'use strict';

    var fn = cache('functions');

    fn.set('subtract', function (x, y) {
        return x - y;
    });

    fn.set('isChecked', function (val) {
        return val === 'yes' || val === 'unknown';
    });

    fn.set('myTooltipText', function () {
        return 'Hello from the outside!';
    });

    fn.set('uppercase', function (val) {
        return (val + '').toUpperCase();
    });

});