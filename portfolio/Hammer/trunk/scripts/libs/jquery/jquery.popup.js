(function ($) {
    var popupId;
    var popups;
    var popupOptions;
    var aliases;
    var stack = [];
    var popupPrefix = '__popup';
    var popupFindPattern = new RegExp('(' + popupPrefix + '\\d+)');

    function hasPopups(target) {
        for (var i in target) {
            return true;
        }
        return false;
    }

    function getIdFromAlias(id) {
        if (aliases && aliases[id]) {
            id = aliases[id];
        }
        return id;
    }

    function getAliasFromId(id) {
        for(var i in aliases) {
            if(aliases[i] === id) {
                return i;
            }
        }
        return null;
    }

    /**
     *
     * @private getTargetPos
     * @param target
     * @param direction
     */
    var getTargetPos = function (container, target, direction, el) {
        var pos = {};
        var toff = target.offset();
        var str = direction.toLowerCase();
        pos.left = toff.left;
        pos.top = toff.top;
        if (container) {
            var co = container.offset();
            pos.left -= co.left;
            pos.top -= co.top;
            toff.left -= co.left;
            toff.top -= co.top;
        }
        if (str.indexOf('right') !== -1) {
            pos.left = toff.left + target.width();
        }
        else if (str.indexOf('left') !== -1) {
            pos.left = toff.left - el.width();
        }
        else if (str.indexOf('center') !== -1) {
            pos.left = toff.left + target.width() * 0.5 - el.width() * 0.5;
        }

        if (str.indexOf('top') !== -1) {
            pos.top = toff.top - el.height();
        }
        else if (str.indexOf('bottom') !== -1) {
            pos.top = toff.top + target.height();
        }
        else if (str.indexOf('middle') !== -1) {
            pos.top = toff.top + target.height() * 0.5 - el.height() * 0.5;
        }
        return pos;
    };

    $.fn.extend({
        popup: function (options) {

            var defaults = {
                id: null,
                appendTo: 'body',
                autoResize: true,
                autoPosition: true,
                zIndex: 1000,
                close: null,
                escClose: true,
                overlayClose: true,
                group: 'none',
                groupDepth: -1, // if anything other than -1 it will replace it. If it is -1 then it will just append it.
                groupClose: false,
                position: null,
                modal: true,
                modalClass: null,// an optional class to add to this modal div only. handy for having an invisible modal where all others are not invisible.
                onOpen: null,
                onClose: null,
                modalAutoClose: true // this allows transitions to call their callback on modal click, and then call $.popup.close() manually after their transition.
            };

            options = $.extend(defaults, options);

            var o = options;
            var self = this;

            this.open = function () {
                if (popups && o.group in popups && o.appendTo in popups[o.group] && o.groupDepth > -1) {// if they have an index specified. it removes all items higher than that index.
                    var index = o.groupDepth;
                    var g = popups[o.group];
                    var i = 0, limit = 100;
                    while (i++ < limit && o.appendTo in g && g[o.appendTo].length > index) {
                        $.popup.close(g[o.appendTo][g[o.appendTo].length - 1]);
                    }
                }

                if (!popupId) {
                    popupId = 1;
                }
                if (!popups) {
                    popups = {};
                }
                if (!popupOptions) {
                    popupOptions = {};
                    aliases = {};
                }
                var id = popupPrefix + popupId;

                if (!popups[o.group]) {
                    popups[o.group] = {};
                }
                if (!popups[o.group][o.appendTo]) {
                    popups[o.group][o.appendTo] = [];
                }

                if (popups[o.group][o.appendTo].indexOf(id) === -1) {
                    var el = $(this);
                    el.detach();
                    popups[o.group][o.appendTo].push(id);
                    popupOptions[id] = o;
                    if (options.id) {
                        aliases[options.id] = id;
                    }

                    $(window).unbind('resize', $.popup.resize);
                    if (o.autoResize) {
                        $(window).resize($.popup.resize);
                    }

                    var container = $(o.appendTo);

                    if (o.modal) {// one modal for each popup.
                        var modal = $('<div class="popup-modal ' + popupPrefix + popupId + '" style="position:absolute;top:0px;left:0px;width:100%;height:100%;z-index:' + o.zIndex + '"></div>');// popup container
                        if (o.modalClass) {
                            modal.addClass(o.modalClass);
                        }
                        if (o.overlayClose) {
                            modal.bind('click', function (evt) {
                                if (o.modalAutoClose) {
                                    self.close(id);
                                } else {
                                    var oc = 'onClose';
                                    var f = o[oc];
                                    if (f) {
                                        delete o[oc];// remove function so it cannot be called again.
                                        f($('[popupid=' + id + ']'));// call the function after it has been removed.
                                    }
                                }
                            });
                        }
                        container.append(modal);
                    }

                    this.attr('popupid', id);

                    var css = {
                        position: 'absolute',
                        zIndex: o.zIndex
                    };
                    this.css(css);
                    stack.push(popupPrefix + popupId);

                    popupId += 1;
                    container.append(this);
                    this.updatePos();
                    if (o.onOpen) {
                        o.onOpen(self);
                    }
                } else {
                    throw new Error("Popup is already open");
                }
            };

            this.open();
            return this;
        },
        updatePos: function () {
            var el = this;
            var pos = {};
            var id = el.attr('popupid');
            var o = popupOptions[id];
            var container;
            if (o.position && 'target' in o.position) {
                var target = o.position.target;
                var direction = o.position.direction;
                container = this.parent();
                pos = getTargetPos(container, target, direction, this);
                // keep in bounds.
//                if (direction === 'right' && pos.left + el.width() > container.width()) {
//                    pos = getTargetPos(container, target, 'left', this);
//                } else if (direction === 'left' && pos.left - el.width() < 0) {
//                    pos = getTargetPos(container, target, 'right', this);
//                } else if (direction === 'rightcenter' && pos.left + el.width() > container.width()) {
//                    pos = getTargetPos(container, target, 'leftcenter', this);
//                } else if (direction === 'leftcenter' && pos.left - el.width() < 0) {
//                    pos = getTargetPos(container, target, 'rightcenter', this);
//                } else if (direction === 'top' && pos.top - el.height() < 0) {
//                    pos = getTargetPos(container, target, 'bottom', this);
//                } else if (direction === 'bottom' && pos.top + el.height() > container.height()) {
//                    pos = getTargetPos(container, target, 'top', this);
//                } else if (direction === 'topcenter' && pos.top - el.height() < 0) {
//                    pos = getTargetPos(container, target, 'bottomcenter', this);
//                } else if (direction === 'bottomcenter' && pos.top + el.height() > container.height()) {
//                    pos = getTargetPos(container, target, 'topcenter', this);
//                }
            } else if (o.position) {
                container = $(o.appendTo);
                pos = o.position;// let this be what they specify.
            } else if (o.autoPosition) {// center it.
                pos = {top: '0px', left: '0px', right: '0px', bottom: '0px', margin: 'auto'};
            }
            this.keepInBounds(pos, el, container);
            el.css(pos);
        },
        close: function (closeGroup) {
            var el = this;
            var id = el.attr('popupid');
            var o = popupOptions && popupOptions.hasOwnProperty(id) ? popupOptions[id] : null;
            if (o) { // if not o. then it is already closed.
                if (closeGroup) {
                    var g = popups[o.group];
                    while (g[o.appendTo] && g[o.appendTo].length) {
                        $.popup.close(g[o.appendTo][g[o.appendTo].length - 1]);
                    }
                } else {
                    $.popup.close(popups[o.group][o.appendTo][popups[o.group][o.appendTo].length - 1]);
                }
            }
        },
        keepInBounds: function (pos, el, container) {
            if (!(pos && el && container)) {
                return;
            }
            if (pos.left + el.width() > container.width()) {
                pos.left = container.width() - el.width();
            } else if (pos.left < 0) {
                pos.left = 0;
            }
            if (pos.top + el.height() > container.height()) {
                pos.top = container.height() - el.height();
            } else if (pos.top < 0) {
                pos.top = 0;
            }
        }
    });

    $.popup = $.fn.popup;
    $.popup.getElement = function (id) {
        id = getIdFromAlias(id);
        return $('[popupid=' + id + ']');
    };
    $.popup.closeByDepth = function (group, appendTo, depth) {
//        console.log('closeByDepth', depth);
        var g = this.getGroup(group);
        var i = 0, limit = 100;
        while (i++ < limit && appendTo in g && g[appendTo].length > depth) {
            $.popup.close(g[appendTo][g[appendTo].length - 1]);
        }
    };
    $.popup.close = function (id) {
        if (popupOptions) {
            id = getIdFromAlias(id);
            if (!id && stack.length) {
                $.popup.close(stack[stack.length - 1]);
                return;
            }
            if (popupOptions.hasOwnProperty(id)) {
                var o = popupOptions[id];

                if (o.onClose) {// if they still have an onClose. Call that.
                    var f = o.onClose;
                    delete o.onClose;// remove function so it cannot be called again.
                    var el = $('[popupid=' + id + ']');
                    var waitForRecall = f(el);// call the function after it has been removed.
                    if (waitForRecall) {
                        return;
                    }
                }

                if (popupOptions && popupOptions.hasOwnProperty(id)) {
                    delete popupOptions[id];
                    stack.splice(stack.indexOf(id), 1);
                    delete aliases[getAliasFromId(id)];

                    var g = popups[o.group];

                    var i = g[o.appendTo].indexOf(id);
                    g[o.appendTo].splice(i, 1);

                    var el = $.popup.getElement(id);
                    el.removeAttr('popupid');
                    var modal = el.parent().children('.popup-modal.' + id);
                    el.remove();
                    if (modal.length) {
                        modal.remove();
                    }
                    if (!g[o.appendTo].length) {
                        delete g[o.appendTo];
                    }
                    if (!hasPopups(popups[o.group])) {
                        delete popups[o.group];
                    }
                }
            }
        }

        if (popups && !hasPopups(popups)) {
            popups = undefined;
            popupOptions = undefined;
            popupId = undefined;
        }
    };
    $.popup.closeOthers = function (id) {
        if (popupOptions) {
            if (popupOptions.hasOwnProperty(id)) {
                for (var i in popupOptions) {
                    if (i !== id && popupOptions.hasOwnProperty(i)) {
                        $.popup.close(i);
                    }
                }
            }
        }
    };
    $.popup.closeOtherGroups = function (groupId) {
        if (popups && groupId in popups) {
            var g = popups[groupId];
            for (var i in g) {
                if (g.hasOwnProperty(i) && i !== groupId) {
                    while (g[i] && g[i].length) {
                        $.popup.close(g[i][g[i].length - 1]);
                    }
                }
            }
        }
    };
    $.popup.getGroup = function (groupId) {
        return popups && popups[groupId];
    };
    $.popup.closeGroup = function (groupId) {
        if (popups && popups.hasOwnProperty(groupId)) {
            var g = popups[groupId];
            for (var i in g) {
                while (g[i] && g[i].length) {
                    $.popup.close(g[i][g[i].length - 1]);
                }
            }
        }
    };
    $.popup.closeAllGroups = function () {
        if (popups) {
            for (var i in popups) {
                $.popup.closeGroup(i);
            }
        }
    };
    $.popup.hitTest = function (x, y) {
        if (popups) {
            for (var i in popups) {
                var g = popups[i];
                for (var j in g) {
                    for (var k = 0, len = g[j].length; k < len; ++k) {
                        var el = $.popup.getElement(g[j][k]);
                        var offset = el.offset();
                        if (x > offset.left && x < offset.left + el.width() && y > offset.top && y < offset.top + el.height()) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };
    $.popup.resize = function () {
        if (popups) {
            for (var i in popups) {
                var g = popups[i];
                for (var j in g) {
                    for (var k = 0, len = g[j].length; k < len; ++k) {
                        var el = $.popup.getElement(g[j][k]);
                        el.updatePos();
                    }
                }
            }
        }
        return false;
    };
})(jQuery);