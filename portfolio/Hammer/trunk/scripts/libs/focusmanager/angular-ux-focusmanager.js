/*
 * angular-ux-focusmanager v.0.1.3
 * (c) 2014, WebUX
 * https://github.com/webux/angular-ux-focusmanager
 * License: MIT.
 */
(function(){
    var ux;

    try {
        ux = angular.module("ux");
    } catch (e) {
        ux = angular.module("ux", []);
    }

    var focusElementId = "fm-id";

    var focusGroupId = "fm-group";

    var focusParentId = "fm-parent";

    var focusParentGroupId = "fm-parent-group";

    var tabIndex = "tabindex";

    var focusGroup = "focus-group";

    var focusGroupIndex = "focus-group-index";

    var focusGroupHead = "focus-group-head";

    var focusGroupTail = "focus-group-tail";

    var focusElement = "focus-element";

    var focusEnabled = "focus-enabled";

    var focusIndex = "focus-index";

    var selectable = "A,SELECT,BUTTON,INPUT,TEXTAREA,*[focus-index]";

    var utils = {};

    utils.addEvent = function(object, type, callback) {
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
            return;
        }
        object.attachEvent("on" + type, callback);
    };

    utils.removeEvent = function(object, type, callback) {
        if (object.removeEventListener) {
            object.removeEventListener(type, callback, false);
            return;
        }
        object.detachEvent("on" + type, callback);
    };

    utils.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            }, wait);
            if (immediate && !timeout) {
                func.apply(context, args);
            }
        };
    };

    utils.throttle = function(func, threshhold, scope) {
        threshhold = threshhold || 250;
        var last, deferTimer;
        return function() {
            var context = scope || this;
            var now = +new Date(), args = arguments;
            if (last && now < last + threshhold) {
                clearTimeout(deferTimer);
                deferTimer = setTimeout(function() {
                    last = now;
                    func.apply(context, args);
                }, threshhold);
            } else {
                last = now;
                func.apply(context, args);
            }
        };
    };

    angular.module("ux").directive("focusElement", [ "focusManager", "focusQuery", function(focusManager, focusQuery) {
        return {
            link: function(scope, element, attr) {
                var el = element[0];
                if (focusQuery.isAutofocus(el)) {
                    var off = scope.$watch(utils.debounce(function() {
                        off();
                        focusManager.focus(el);
                    }, 100));
                }
            }
        };
    } ]);

    angular.module("ux").directive("focusGroup", [ "focusManager", "focusQuery", "focusDispatcher", function(focusManager, focusQuery, focusDispatcher) {
        var groupId = 1, elementId = 1, dispatcher = focusDispatcher(), delay = 100;
        function compile(groupName, el) {
            var els, i, len, elementName;
            els = focusQuery.getElementsWithoutParents(el);
            len = els.length;
            i = 0;
            while (i < len) {
                elementName = elementId;
                focusQuery.setParentId(els[i], groupName);
                focusQuery.setElementId(els[i], elementName);
                var tabIndex = focusQuery.getTabIndex(els[i]);
                if (tabIndex === undefined || tabIndex === null) {
                    focusQuery.setTabIndex(els[i], -1);
                }
                elementId += 1;
                i += 1;
            }
            els = focusQuery.getGroupsWithoutParentGroup(el);
            len = els.length;
            i = 0;
            while (i < len) {
                focusQuery.setParentGroupId(els[i], groupName);
                i += 1;
            }
        }
        function linker(scope, element, attr) {
            var el = element[0];
            var groupName = groupId++;
            var bound = false;
            var cacheHtml = "";
            var newCacheHtml = "";
            function init() {
                scope.$on("focus::" + groupName, function() {
                    compile(groupName, el);
                    createBrowserEntryPoints();
                });
                if (!focusQuery.getParentGroupId(el)) {
                    cacheHtml = el.innerHTML;
                    scope.$watch(utils.debounce(function() {
                        newCacheHtml = el.innerHTML;
                        if (cacheHtml !== newCacheHtml) {
                            var els = el.querySelectorAll("[" + focusGroup + "]");
                            var i = els.length, groupId;
                            while (i) {
                                i -= 1;
                                groupId = els[i].getAttribute(focusGroupId);
                                scope.$broadcast("focus::" + groupId);
                            }
                            cacheHtml = newCacheHtml;
                        }
                        compile(groupName, el);
                        createBrowserEntryPoints();
                    }, delay));
                    dispatcher.on("focusin", utils.debounce(function(evt) {
                        if (focusQuery.contains(el, evt.newTarget)) {
                            if (bound === false) {
                                bound = true;
                                scope.$broadcast("bindKeys", groupName);
                            }
                        } else {
                            if (bound === true) {
                                bound = false;
                                scope.$broadcast("unbindKeys");
                            }
                        }
                    }, delay));
                }
            }
            function createBrowserEntryPoints() {
                focusManager.callback = function(el) {
                    focusQuery.setTabIndex(el, 0);
                };
                focusManager.findPrevChildGroup(groupName);
                focusManager.findNextElement(groupName);
                focusManager.callback = null;
            }
            function onFocus() {
                focusManager.enable();
            }
            el.addEventListener("focus", onFocus, true);
            setTimeout(init, delay);
            focusQuery.setGroupId(el, groupName);
            compile(groupName, el);
        }
        return {
            link: linker
        };
    } ]);

    angular.module("ux").directive("focusHighlight", [ "focusManager", function(focusManager) {
        function getOffsetRect(elem) {
            var box = elem.getBoundingClientRect();
            var body = document.body;
            var docElem = document.documentElement;
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var top = box.top + scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;
            return {
                top: Math.round(top),
                left: Math.round(left),
                width: box.width,
                height: box.height
            };
        }
        function updateDisplay(el, activeElement) {
            if (focusManager.canReceiveFocus(activeElement)) {
                var rect = getOffsetRect(activeElement);
                el.style.left = rect.left + "px";
                el.style.top = rect.top + "px";
                el.style.width = rect.width + "px";
                el.style.height = rect.height + "px";
            }
        }
        return {
            scope: true,
            replace: true,
            link: function(scope, element, attrs) {
                var el = element[0];
                document.addEventListener("focus", function(evt) {
                    updateDisplay(el, evt.target);
                }, true);
            },
            template: '<div class="focus-highlight"></div>'
        };
    } ]);

    angular.module("ux").directive("focusShortcut", [ "focusManager", function(focusManager) {
        return {
            link: function(scope, element, attrs) {
                var bound = false;
                function onBindKeys() {
                    if (!bound) {
                        bound = true;
                        Mousetrap.bind(attrs.focusKeyboard.split(","), function(evt) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            focusManager.focus(element[0]);
                            return false;
                        });
                    }
                }
                function onUnbindKeys() {
                    if (bound) {
                        bound = false;
                        Mousetrap.unbind(attrs.focusKeyboard.split(","));
                    }
                }
                if (attrs.focusKeyboard) {
                    scope.$on("bindKeys", onBindKeys);
                    scope.$on("unbindKeys", onUnbindKeys);
                }
            }
        };
    } ]);

    angular.module("ux").directive("focusStack", [ "focusManager", "focusQuery", function(focusManager, focusQuery) {
        var stack = [];
        return {
            link: function(scope, element, attrs) {
                stack.push(focusQuery.getElementId(focusManager.activeElement));
                scope.$on("$destroy", function() {
                    if (stack.length) {
                        var elementId = stack.pop();
                        var el = focusQuery.getElement(elementId);
                        if (el) {
                            focusManager.focus(el);
                        }
                    }
                });
            }
        };
    } ]);

    String.prototype.supplant = function(o) {
        return this.replace(/{([^{}]*)}/g, function(a, b) {
            var r = o[b];
            return typeof r === "string" || typeof r === "number" ? r : a;
        });
    };

    angular.module("ux").factory("focusDispatcher", function() {
        var dispatchers = {};
        function EventDispatcher() {
            this.events = {};
        }
        EventDispatcher.prototype.events = {};
        EventDispatcher.prototype.on = function(key, func) {
            if (!this.events.hasOwnProperty(key)) {
                this.events[key] = [];
            }
            this.events[key].push(func);
        };
        EventDispatcher.prototype.off = function(key, func) {
            if (this.events.hasOwnProperty(key)) {
                for (var i in this.events[key]) {
                    if (this.events[key][i] === func) {
                        this.events[key].splice(i, 1);
                    }
                }
            }
        };
        EventDispatcher.prototype.trigger = function(key, dataObj) {
            if (this.events.hasOwnProperty(key)) {
                dataObj = dataObj || {};
                dataObj.currentTarget = this;
                for (var i in this.events[key]) {
                    this.events[key][i](dataObj);
                }
            }
        };
        function dispatcher(name) {
            name = name || "fm";
            if (!dispatchers[name]) {
                dispatchers[name] = new EventDispatcher();
            }
            return dispatchers[name];
        }
        return dispatcher;
    });

    angular.module("ux").service("focusKeyboard", [ "focusManager", function(focusManager) {
        var tabKeysEnabled = false, arrowKeysEnabled = false;
        function enableTabKeys() {
            if (!tabKeysEnabled) {
                tabKeysEnabled = true;
            }
        }
        function disableTabKeys() {
            if (tabKeysEnabled) {
                tabKeysEnabled = false;
            }
        }
        function enableArrowKeys() {
            if (!arrowKeysEnabled) {
                arrowKeysEnabled = true;
            }
        }
        function disableArrowKeys() {
            if (arrowKeysEnabled) {
                arrowKeysEnabled = false;
            }
        }
        function toggleTabArrowKeys() {
            if (tabKeysEnabled) {
                disableTabKeys();
                enableArrowKeys();
            } else {
                enableTabKeys();
                disableArrowKeys();
            }
        }
        function triggerClick(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            var activeElement = evt.target;
            fireEvent(activeElement, "mousedown");
            fireEvent(activeElement, "mouseup");
            fireEvent(activeElement, "click");
        }
        function onFocusNext(evt) {
            if (focusManager.enabled) {
                focusManager.next();
            }
            if (!focusManager.enabled) {
                return;
            }
            evt.preventDefault();
            evt.stopPropagation();
            return false;
        }
        function onFocusPrev(evt) {
            if (focusManager.enabled) {
                focusManager.prev();
            }
            if (!focusManager.enabled) {
                return;
            }
            evt.preventDefault();
            evt.stopPropagation();
            return false;
        }
        function fireEvent(node, eventName) {
            var doc, event;
            if (node.ownerDocument) {
                doc = node.ownerDocument;
            } else if (node.nodeType === 9) {
                doc = node;
            }
            if (node.dispatchEvent) {
                var eventClass = "";
                switch (eventName) {
                    case "click":
                    case "mousedown":
                    case "mouseup":
                        eventClass = "MouseEvents";
                        break;
                }
                event = doc.createEvent(eventClass);
                var bubbles = eventName === "change" ? false : true;
                event.initEvent(eventName, bubbles, true);
                event.synthetic = true;
                node.dispatchEvent(event, true);
            } else if (node.fireEvent) {
                event = doc.createEventObject();
                event.synthetic = true;
                node.fireEvent("on" + eventName, event);
            }
        }
        function enable() {
            utils.addEvent(document, "keydown", onKeyDown);
        }
        function disable() {
            utils.removeEvent(document, "keydown", onKeyDown);
        }
        function onKeyDown(evt) {
            if (tabKeysEnabled) {
                if (evt.keyCode === 9) {
                    if (evt.shiftKey) {
                        onFocusPrev(evt);
                    } else {
                        onFocusNext(evt);
                    }
                }
            }
            if (arrowKeysEnabled) {
                if (!(evt.shiftKey || evt.altKey || evt.ctrlKey)) {
                    if (evt.keyCode === 37) {
                        onFocusPrev(evt);
                    } else if (evt.keyCode === 38) {
                        onFocusPrev(evt);
                    } else if (evt.keyCode === 39) {
                        onFocusNext(evt);
                    } else if (evt.keyCode === 40) {
                        onFocusNext(evt);
                    }
                }
            }
            if (!(evt.shiftKey || evt.altKey || evt.ctrlKey)) {
                if (evt.keyCode === 13) {
                    triggerClick(evt);
                }
            }
        }
        this.enable = enable;
        this.disable = disable;
        this.enableTabKeys = enableTabKeys;
        this.disableTabKeys = disableTabKeys;
        this.enableArrowKeys = enableArrowKeys;
        this.disableArrowKeys = disableArrowKeys;
        this.toggleTabArrowKeys = toggleTabArrowKeys;
        this.triggerClick = triggerClick;
    } ]).run([ "focusKeyboard", function(focusKeyboard) {
        focusKeyboard.enable();
        focusKeyboard.enableTabKeys();
    } ]);

    angular.module("ux").service("focusManager", [ "focusQuery", "focusDispatcher", function(focusQuery, focusDispatcher) {
        var scope = this, dispatcher = focusDispatcher();
        function focus(el) {
            if (typeof el === "undefined") {
                return scope.activeElement;
            }
            if (scope.activeElement !== el) {
                var eventObj = {
                    oldTarget: scope.activeElement,
                    newTarget: el
                };
                dispatcher.trigger("focusout", eventObj);
                scope.activeElement = el;
                el.focus();
                dispatcher.trigger("focusin", eventObj);
            }
        }
        function canReceiveFocus(el) {
            return focusQuery.canReceiveFocus(el);
        }
        function next() {
            var groupId, elementId;
            if (scope.activeElement) {
                groupId = focusQuery.getParentId(scope.activeElement);
                elementId = focusQuery.getElementId(scope.activeElement);
                findNextElement(groupId, elementId);
            } else {
                findNextElement();
            }
        }
        function prev() {
            var groupId, elementId;
            if (scope.activeElement) {
                groupId = focusQuery.getParentId(scope.activeElement);
                elementId = focusQuery.getElementId(scope.activeElement);
                findPrevElement(groupId, elementId);
            } else {
                findPrevElement();
            }
        }
        function getElementIndex(list, item) {
            var i = 0, len = list.length;
            while (i < len) {
                if (list[i] === item) {
                    return i;
                }
                i += 1;
            }
            return -1;
        }
        function getPrevElement(elements, elementId) {
            var element, index;
            if (elements && elements.length) {
                if (elementId) {
                    element = focusQuery.getElement(elementId);
                    index = getElementIndex(elements, element);
                    if (index > 0) {
                        return elements[index - 1];
                    }
                } else {
                    return elements[elements.length - 1];
                }
            }
        }
        function getPrevGroup(groups, groupId) {
            var group, index;
            if (groups && groups.length) {
                if (groupId) {
                    group = focusQuery.getGroup(groupId);
                    index = getElementIndex(groups, group);
                    if (index > 0) {
                        return groups[index - 1];
                    }
                } else {
                    return groups[0];
                }
            }
        }
        function getNextElement(elements, elementId) {
            var element, index;
            if (elements && elements.length) {
                if (elementId) {
                    element = focusQuery.getElement(elementId);
                    index = getElementIndex(elements, element);
                    if (index !== -1 && index + 1 < elements.length) {
                        return elements[index + 1];
                    }
                } else {
                    return elements[0];
                }
            }
        }
        function getNextGroup(groups, groupId) {
            var group, index;
            if (groups) {
                group = focusQuery.getGroup(groupId);
                index = getElementIndex(groups, group);
                if (index !== -1 && index + 1 < groups.length) {
                    return groups[index + 1];
                }
            }
        }
        function findNextGroup(ParentGroupId, groupId) {
            var group, groups, nextGroup, nextGroupId, parentParentGroup, parentParentGroupId, hasTail;
            group = focusQuery.getGroup(groupId);
            hasTail = focusQuery.hasGroupTail(group);
            if (hasTail || !ParentGroupId) {
                findNextStep(groupId);
            } else {
                ParentGroupId = focusQuery.getParentGroupId(group);
                groups = focusQuery.getChildGroups(ParentGroupId);
                nextGroup = getNextGroup(groups, groupId);
                if (nextGroup) {
                    nextGroupId = focusQuery.getGroupId(nextGroup);
                    return findNextElement(nextGroupId);
                } else {
                    parentParentGroup = focusQuery.getGroup(ParentGroupId);
                    parentParentGroupId = focusQuery.getParentGroupId(parentParentGroup);
                    return findNextGroup(parentParentGroupId, ParentGroupId);
                }
            }
        }
        function findNextStep(groupId) {
            var group, tail;
            group = focusQuery.getGroup(groupId);
            tail = focusQuery.getGroupTail(group);
            if (groupId) {
                if (tail === "stop") {
                    return;
                }
                if (!tail) {
                    disable();
                    return;
                }
            } else {
                groupId = focusQuery.getFirstGroupId();
            }
            findNextElement(groupId);
        }
        function findNextChildGroup(groupId) {
            var groups, group, nextGroupId, ParentGroupId;
            groups = focusQuery.getChildGroups(groupId);
            if (groups.length) {
                nextGroupId = focusQuery.getGroupId(groups[0]);
                findNextElement(nextGroupId);
            } else {
                group = focusQuery.getGroup(groupId);
                ParentGroupId = focusQuery.getParentGroupId(group);
                findNextGroup(ParentGroupId, groupId);
            }
        }
        function findNextElement(groupId, elementId) {
            var els, nextElement;
            if (groupId) {
                els = focusQuery.getGroupElements(groupId);
                nextElement = getNextElement(els, elementId);
                if (nextElement) {
                    if (scope.callback) {
                        scope.callback(nextElement);
                    } else {
                        focus(nextElement);
                    }
                } else {
                    findNextChildGroup(groupId);
                }
            } else {
                findNextGroup();
            }
        }
        function findPrevGroup(ParentGroupId, groupId) {
            var groups, prevGroup, prevGroupId, parentParentGroup, parentParentGroupId;
            if (ParentGroupId) {
                groups = focusQuery.getChildGroups(ParentGroupId);
                prevGroup = getPrevGroup(groups, groupId);
                if (prevGroup) {
                    prevGroupId = focusQuery.getGroupId(prevGroup);
                    findPrevChildGroup(prevGroupId);
                } else {
                    findPrevElement(ParentGroupId);
                }
            } else {
                groupId = focusQuery.getLastGroupId();
                findPrevChildGroup(groupId);
            }
        }
        function findPrevChildGroup(groupId) {
            var groups, childGroupId;
            if (groupId) {
                groups = focusQuery.getChildGroups(groupId);
                if (groups.length) {
                    childGroupId = focusQuery.getGroupId(groups[groups.length - 1]);
                    findPrevChildGroup(childGroupId);
                } else {
                    findPrevElement(groupId);
                }
            } else {
                findPrevGroup();
            }
        }
        function findPrevElement(groupId, elementId) {
            var els, prevEl, group, hasHead;
            if (groupId) {
                els = focusQuery.getGroupElements(groupId);
                prevEl = getPrevElement(els, elementId);
                if (prevEl) {
                    if (scope.callback) {
                        scope.callback(prevEl);
                    } else {
                        focus(prevEl);
                    }
                } else {
                    findPrevStep(groupId);
                }
            } else {
                findPrevChildGroup();
            }
        }
        function findPrevStep(groupId) {
            var ParentGroupId, group, hasHead;
            group = focusQuery.getGroup(groupId);
            hasHead = focusQuery.hasGroupHead(group);
            ParentGroupId = focusQuery.getParentGroupId(group);
            if (hasHead || !ParentGroupId) {
                var head = focusQuery.getGroupHead(group);
                if (head === "loop") {
                    findPrevChildGroup(groupId);
                } else if (!head) {
                    disable();
                }
            } else {
                findPrevGroup(ParentGroupId, groupId);
            }
        }
        function on() {
            scope.active = true;
        }
        function off() {
            scope.active = false;
        }
        function enable() {
            if (!scope.enabled && scope.active) {
                scope.enabled = true;
                scope.activeElement = document.activeElement;
                dispatcher.trigger("enabled");
            }
        }
        function disable() {
            if (scope.enabled) {
                scope.enabled = false;
                dispatcher.trigger("disabled");
            }
        }
        this.active = true;
        this.enabled = false;
        this.activeElement = null;
        this.focus = focus;
        this.prev = prev;
        this.next = next;
        this.findPrevChildGroup = findPrevChildGroup;
        this.findNextElement = findNextElement;
        this.canReceiveFocus = canReceiveFocus;
        this.on = on;
        this.off = off;
        this.enable = enable;
        this.disable = disable;
    } ]);

    angular.module("ux").service("focusMouse", [ "focusManager", "focusQuery", function(focusManager, focusQuery) {
        var scope = this;
        function enable() {
            scope.enabled = false;
            utils.addEvent(document, "mousedown", onMouseDown);
        }
        function disable() {
            scope.enabled = false;
            utils.removeEvent(document, "mousedown", onMouseDown);
        }
        function onMouseDown(evt) {
            if (focusManager.canReceiveFocus(evt.target)) {
                focusManager.focus(evt.target);
                var parentId = focusQuery.getParentId(evt.target);
                if (parentId) {
                    focusManager.enable();
                } else {
                    focusManager.disable();
                }
            }
        }
        this.enabled = false;
        this.enable = enable;
        this.disable = disable;
    } ]).run([ "focusMouse", function(focusMouse) {
        focusMouse.enable();
    } ]);

    angular.module("ux").service("focusQuery", function() {
        function canReceiveFocus(el) {
            if (!el) {
                return false;
            }
            var isSelectable = new RegExp(el.nodeName.toUpperCase()).test(selectable);
            if (!isSelectable) {
                isSelectable = el.hasAttribute(focusIndex);
            }
            if (!isSelectable) {
                isSelectable = el.hasAttribute(tabIndex) && el.getAttribute(tabIndex) > -1;
            }
            if (isSelectable) {
                isSelectable = !el.hasAttribute("disabled");
            }
            if (isSelectable) {
                isSelectable = isVisible(el);
            }
            return isSelectable;
        }
        function getFirstGroupId() {
            var q = "[{focusGroup}]:not([{focusParentGroupId}])".supplant({
                focusGroup: focusGroup,
                focusParentGroupId: focusParentGroupId
            });
            var groupEl = document.querySelector(q);
            return getGroupId(groupEl);
        }
        function getLastGroupId() {
            var q = "[{focusGroup}]:not([{focusParentGroupId}])".supplant({
                focusGroup: focusGroup,
                focusParentGroupId: focusParentGroupId
            });
            var groupEls = document.querySelectorAll(q);
            return getGroupId(groupEls[groupEls.length - 1]);
        }
        function getChildGroups(groupId) {
            var els = document.querySelectorAll('[{focusParentGroupId}="{groupId}"]'.supplant({
                focusParentGroupId: focusParentGroupId,
                groupId: groupId
            }));
            var returnVal = [];
            var i = 0, len = els.length;
            while (i < len) {
                returnVal.push(els[i]);
                i += 1;
            }
            returnVal = sort(returnVal, sortByGroupIndex);
            return returnVal;
        }
        function getElementsWithoutParents(el) {
            if (el) {
                var query = "A:not({focusParentId})," + "SELECT:not({focusParentId})," + "BUTTON:not({focusParentId})," + "INPUT:not({focusParentId})," + "TEXTAREA:not({focusParentId})," + "*[focus-index]:not({focusParentId})";
                query = query.supplant({
                    focusParentId: "[" + focusParentId + "]"
                });
                return el.querySelectorAll(query);
            }
            return [];
        }
        function getGroupsWithoutParentGroup(el) {
            if (!el) {
                return [];
            }
            var q = "[" + focusGroupId + "]:not([" + focusParentGroupId + "])";
            return el.querySelectorAll(q);
        }
        function getGroupElements(groupId) {
            var q, isStrict, els, returnVal, i, len;
            isStrict = isGroupStrict(groupId);
            if (isStrict) {
                q = '[{focusParentId}="{groupId}"][focus-index]:not([disabled]):not(.disabled)'.supplant({
                    focusParentId: focusParentId,
                    groupId: groupId
                });
            } else {
                q = '[{focusParentId}="{groupId}"]:not([disabled]):not(.disabled)'.supplant({
                    focusParentId: focusParentId,
                    groupId: groupId
                });
            }
            els = document.querySelectorAll(q);
            returnVal = [];
            i = 0;
            len = els.length;
            while (i < len) {
                if (!isVisible(els[i])) {
                    i += 1;
                    continue;
                }
                returnVal.push(els[i]);
                i += 1;
            }
            returnVal = sort(returnVal, sortByTabIndex);
            return returnVal;
        }
        function isVisible(el) {
            if (!el) {
                return false;
            }
            if (el.parentNode.nodeType === 9) {
                return true;
            }
            if (el.offsetWidth === 0 || el.offsetHeight === 0) {
                return false;
            }
            if (el.style.display === "none") {
                return false;
            }
            if (el.style.visibility === "hidden") {
                return false;
            }
            if (el.style.opacity === 0 || el.style.opacity === "0") {
                return false;
            }
            return true;
        }
        function isAutofocus(el) {
            if (el) {
                return el.getAttribute(focusElement) === "autofocus";
            }
            return false;
        }
        function isEnabled(el) {
            if (el) {
                return el.getAttribute(focusEnabled) !== "false";
            }
            return false;
        }
        function hasGroupHead(el) {
            if (el) {
                return el.hasAttribute(focusGroupHead);
            }
            return false;
        }
        function getGroupHead(el) {
            if (el) {
                return el.getAttribute(focusGroupHead);
            }
        }
        function hasGroupTail(el) {
            if (el) {
                return el.hasAttribute(focusGroupTail);
            }
            return false;
        }
        function getGroupTail(el) {
            if (el) {
                return el.getAttribute(focusGroupTail);
            }
        }
        function getElement(elementId) {
            if (elementId) {
                var q = '[{focusElementId}="{elementId}"]'.supplant({
                    focusElementId: focusElementId,
                    elementId: elementId
                });
                return document.querySelector(q);
            }
        }
        function getGroup(groupId) {
            if (groupId) {
                return document.querySelector("[" + focusGroupId + '="' + groupId + '"]');
            }
        }
        function isGroupStrict(groupId) {
            var group = getGroup(groupId);
            if (group) {
                return group.getAttribute(focusGroup) === "strict";
            }
            return false;
        }
        function getElementId(el) {
            if (el) {
                return el.getAttribute(focusElementId);
            }
        }
        function setElementId(el, id) {
            el.setAttribute(focusElementId, id);
        }
        function getGroupId(el) {
            if (el) {
                return el.getAttribute(focusGroupId);
            }
        }
        function setGroupId(el, id) {
            el.setAttribute(focusGroupId, id);
        }
        function getParentId(el) {
            if (el) {
                return el.getAttribute(focusParentId);
            }
        }
        function setParentId(el, id) {
            el.setAttribute(focusParentId, id);
        }
        function getParentGroupId(el) {
            if (el) {
                return el.getAttribute(focusParentGroupId);
            }
        }
        function setParentGroupId(el, id) {
            el.setAttribute(focusParentGroupId, id);
        }
        function getTabIndex(el) {
            if (el) {
                return el.getAttribute(tabIndex);
            }
        }
        function setTabIndex(el, index) {
            if (el) {
                if (index === null) {
                    el.removeAttribute(tabIndex);
                } else {
                    el.setAttribute(tabIndex, index);
                }
            }
        }
        function contains(ParentGroup, el) {
            if (el) {
                var parent = el.parentNode;
                if (parent) {
                    while (parent) {
                        if (parent.nodeType === 9) {
                            break;
                        }
                        if (parent === ParentGroup) {
                            return true;
                        }
                        parent = parent.parentNode;
                    }
                }
            }
            return false;
        }
        function sort(list, compareFn) {
            var i = 0, len = list.length - 1, holder;
            if (!compareFn) {
                compareFn = function(a, b) {
                    return a > b ? 1 : a < b ? -1 : 0;
                };
            }
            while (i < len) {
                if (compareFn(list[i], list[i + 1]) > 0) {
                    holder = list[i + 1];
                    list[i + 1] = list[i];
                    list[i] = holder;
                }
                i = i + 1;
            }
            return list;
        }
        function sortByTabIndex(a, b) {
            var aTabIndex = a.getAttribute(focusIndex) || Number.POSITIVE_INFINITY;
            var bTabIndex = b.getAttribute(focusIndex) || Number.POSITIVE_INFINITY;
            if (aTabIndex < bTabIndex) {
                return -1;
            }
            if (aTabIndex > bTabIndex) {
                return 1;
            }
            return 0;
        }
        function sortByGroupIndex(a, b) {
            var aGroupIndex = a.getAttribute(focusGroupIndex) || Number.POSITIVE_INFINITY;
            var bGroupIndex = b.getAttribute(focusGroupIndex) || Number.POSITIVE_INFINITY;
            if (aGroupIndex < bGroupIndex) {
                return -1;
            }
            if (aGroupIndex > bGroupIndex) {
                return 1;
            }
            return 0;
        }
        this.getElement = getElement;
        this.getElementId = getElementId;
        this.setElementId = setElementId;
        this.getGroupId = getGroupId;
        this.setGroupId = setGroupId;
        this.getParentId = getParentId;
        this.setParentId = setParentId;
        this.getParentGroupId = getParentGroupId;
        this.setParentGroupId = setParentGroupId;
        this.getGroup = getGroup;
        this.getFirstGroupId = getFirstGroupId;
        this.getLastGroupId = getLastGroupId;
        this.getTabIndex = getTabIndex;
        this.setTabIndex = setTabIndex;
        this.getElementsWithoutParents = getElementsWithoutParents;
        this.getGroupsWithoutParentGroup = getGroupsWithoutParentGroup;
        this.isAutofocus = isAutofocus;
        this.hasGroupHead = hasGroupHead;
        this.hasGroupTail = hasGroupTail;
        this.getGroupHead = getGroupHead;
        this.getGroupTail = getGroupTail;
        this.isEnabled = isEnabled;
        this.getGroupElements = getGroupElements;
        this.getChildGroups = getChildGroups;
        this.contains = contains;
        this.canReceiveFocus = canReceiveFocus;
    });

    (function(J, r, f) {
        function s(a, b, d) {
            a.addEventListener ? a.addEventListener(b, d, !1) : a.attachEvent("on" + b, d);
        }
        function A(a) {
            if ("keypress" == a.type) {
                var b = String.fromCharCode(a.which);
                a.shiftKey || (b = b.toLowerCase());
                return b;
            }
            return h[a.which] ? h[a.which] : B[a.which] ? B[a.which] : String.fromCharCode(a.which).toLowerCase();
        }
        function t(a) {
            a = a || {};
            var b = !1, d;
            for (d in n) a[d] ? b = !0 : n[d] = 0;
            b || (u = !1);
        }
        function C(a, b, d, c, e, v) {
            var g, k, f = [], h = d.type;
            if (!l[a]) return [];
            "keyup" == h && w(a) && (b = [ a ]);
            for (g = 0; g < l[a].length; ++g) if (k = l[a][g], !(!c && k.seq && n[k.seq] != k.level || h != k.action || ("keypress" != h || d.metaKey || d.ctrlKey) && b.sort().join(",") !== k.modifiers.sort().join(","))) {
                var m = c && k.seq == c && k.level == v;
                (!c && k.combo == e || m) && l[a].splice(g, 1);
                f.push(k);
            }
            return f;
        }
        function K(a) {
            var b = [];
            a.shiftKey && b.push("shift");
            a.altKey && b.push("alt");
            a.ctrlKey && b.push("ctrl");
            a.metaKey && b.push("meta");
            return b;
        }
        function x(a, b, d, c) {
            m.stopCallback(b, b.target || b.srcElement, d, c) || !1 !== a(b, d) || (b.preventDefault ? b.preventDefault() : b.returnValue = !1,
                b.stopPropagation ? b.stopPropagation() : b.cancelBubble = !0);
        }
        function y(a) {
            "number" !== typeof a.which && (a.which = a.keyCode);
            var b = A(a);
            b && ("keyup" == a.type && z === b ? z = !1 : m.handleKey(b, K(a), a));
        }
        function w(a) {
            return "shift" == a || "ctrl" == a || "alt" == a || "meta" == a;
        }
        function L(a, b, d, c) {
            function e(b) {
                return function() {
                    u = b;
                    ++n[a];
                    clearTimeout(D);
                    D = setTimeout(t, 1e3);
                };
            }
            function v(b) {
                x(d, b, a);
                "keyup" !== c && (z = A(b));
                setTimeout(t, 10);
            }
            for (var g = n[a] = 0; g < b.length; ++g) {
                var f = g + 1 === b.length ? v : e(c || E(b[g + 1]).action);
                F(b[g], f, c, a, g);
            }
        }
        function E(a, b) {
            var d, c, e, f = [];
            d = "+" === a ? [ "+" ] : a.split("+");
            for (e = 0; e < d.length; ++e) c = d[e], G[c] && (c = G[c]), b && "keypress" != b && H[c] && (c = H[c],
                f.push("shift")), w(c) && f.push(c);
            d = c;
            e = b;
            if (!e) {
                if (!p) {
                    p = {};
                    for (var g in h) 95 < g && 112 > g || h.hasOwnProperty(g) && (p[h[g]] = g);
                }
                e = p[d] ? "keydown" : "keypress";
            }
            "keypress" == e && f.length && (e = "keydown");
            return {
                key: c,
                modifiers: f,
                action: e
            };
        }
        function F(a, b, d, c, e) {
            q[a + ":" + d] = b;
            a = a.replace(/\s+/g, " ");
            var f = a.split(" ");
            1 < f.length ? L(a, f, b, d) : (d = E(a, d), l[d.key] = l[d.key] || [], C(d.key, d.modifiers, {
                type: d.action
            }, c, a, e), l[d.key][c ? "unshift" : "push"]({
                callback: b,
                modifiers: d.modifiers,
                action: d.action,
                seq: c,
                level: e,
                combo: a
            }));
        }
        var h = {
            8: "backspace",
            9: "tab",
            13: "enter",
            16: "shift",
            17: "ctrl",
            18: "alt",
            20: "capslock",
            27: "esc",
            32: "space",
            33: "pageup",
            34: "pagedown",
            35: "end",
            36: "home",
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            45: "ins",
            46: "del",
            91: "meta",
            93: "meta",
            224: "meta"
        }, B = {
            106: "*",
            107: "+",
            109: "-",
            110: ".",
            111: "/",
            186: ";",
            187: "=",
            188: ",",
            189: "-",
            190: ".",
            191: "/",
            192: "`",
            219: "[",
            220: "\\",
            221: "]",
            222: "'"
        }, H = {
            "~": "`",
            "!": "1",
            "@": "2",
            "#": "3",
            $: "4",
            "%": "5",
            "^": "6",
            "&": "7",
            "*": "8",
            "(": "9",
            ")": "0",
            _: "-",
            "+": "=",
            ":": ";",
            '"': "'",
            "<": ",",
            ">": ".",
            "?": "/",
            "|": "\\"
        }, G = {
            option: "alt",
            command: "meta",
            "return": "enter",
            escape: "esc",
            mod: /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "meta" : "ctrl"
        }, p, l = {}, q = {}, n = {}, D, z = !1, I = !1, u = !1;
        for (f = 1; 20 > f; ++f) h[111 + f] = "f" + f;
        for (f = 0; 9 >= f; ++f) h[f + 96] = f;
        s(r, "keypress", y);
        s(r, "keydown", y);
        s(r, "keyup", y);
        var m = {
            bind: function(a, b, d) {
                a = a instanceof Array ? a : [ a ];
                for (var c = 0; c < a.length; ++c) F(a[c], b, d);
                return this;
            },
            unbind: function(a, b) {
                return m.bind(a, function() {}, b);
            },
            trigger: function(a, b) {
                if (q[a + ":" + b]) q[a + ":" + b]({}, a);
                return this;
            },
            reset: function() {
                l = {};
                q = {};
                return this;
            },
            stopCallback: function(a, b) {
                return -1 < (" " + b.className + " ").indexOf(" mousetrap ") ? !1 : "INPUT" == b.tagName || "SELECT" == b.tagName || "TEXTAREA" == b.tagName || b.isContentEditable;
            },
            handleKey: function(a, b, d) {
                var c = C(a, b, d), e;
                b = {};
                var f = 0, g = !1;
                for (e = 0; e < c.length; ++e) c[e].seq && (f = Math.max(f, c[e].level));
                for (e = 0; e < c.length; ++e) c[e].seq ? c[e].level == f && (g = !0, b[c[e].seq] = 1,
                    x(c[e].callback, d, c[e].combo, c[e].seq)) : g || x(c[e].callback, d, c[e].combo);
                c = "keypress" == d.type && I;
                d.type != u || w(a) || c || t(b);
                I = g && "keydown" == d.type;
            }
        };
        J.Mousetrap = m;
        "function" === typeof define && define.amd && define(m);
    })(window, document);
}());
