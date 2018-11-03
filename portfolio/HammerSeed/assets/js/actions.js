define(['angular', 'utils/cache'], function (angular, cache) {
    'use strict';

    cache('actions').set('windowAlert', function (scope, action) {
        window.alert(action.message);
    });

});