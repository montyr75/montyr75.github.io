/**
 * Author: Robert Taylor
 * Date: 2/19/13
 */
    // define custom functions - amd
define(['utils/cache'], function (cache) {
    'use strict';

    cache('functions').set('subtract', function (x, y) {
        return x - y;
    });

    cache('functions').set('isChecked', function (val) {
        return val === 'yes' || val === 'unknown';
    });

    cache('functions').set('myTooltipText', function () {
        return 'Hello from the outside!';
    });

});