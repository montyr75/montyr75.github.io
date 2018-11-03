define(['utils/cache'], function (cache) {
    'use strict';

    cache('formatters').set('currency', {
        focus:function (text) {
            return (text + '').split('$ ').join('');
        },
        blur:function (text) {
            text = (text + '').split('$ ').join('');
            return '$ ' + text;
        }
    });

});