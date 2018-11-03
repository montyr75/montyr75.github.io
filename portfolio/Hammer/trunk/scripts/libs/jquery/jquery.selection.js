/**
 * Cursor Functions
 *
 * Used for setting and getting text cursor position within an input
 * and textarea field. Also used to get and set selection range.
 *
 * @author Branden Cash
 * @email brandencash@crutzdesigns.com
 *
 * http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
 */
/* global jQuery */
(function (jQuery) {
    jQuery.fn.getCursorPosition = function () {
        if (this.length === 0) {
            return -1;
        }
        return jQuery(this).getSelectionStart();
    };

    jQuery.fn.setCursorPosition = function (position) {
        if (this.length === 0) {
            return this;
        }
        return jQuery(this).setSelection(position, position);
    };

    jQuery.fn.getSelection = function () {
        if (this.length === 0) {
            return -1;
        }
        var s = jQuery(this).getSelectionStart();
        var e = jQuery(this).getSelectionEnd();
        return this[0].value.substring(s, e);
    };

    jQuery.fn.getSelectionStart = function () {
        if (this.length === 0) {
            return -1;
        }
        var input = this[0];

        var pos = input.value.length;

        if (input.createTextRange) {
            var r = document.selection.createRange().duplicate();
            r.moveEnd('character', input.value.length);
            if (r.text === '') {
                pos = input.value.length;
            }
            pos = input.value.lastIndexOf(r.text);
        } else if (typeof(input.selectionStart) !== "undefined") {
            pos = input.selectionStart;
        }

        return pos;
    };

    jQuery.fn.getSelectionEnd = function () {
        if (this.length === 0) {
            return -1;
        }
        var input = this[0];

        var pos = input.value.length;

        if (input.createTextRange) {
            var r = document.selection.createRange().duplicate();
            r.moveStart('character', -input.value.length);
            if (r.text === '') {
                pos = input.value.length;
            }
            pos = input.value.lastIndexOf(r.text);
        } else if (typeof(input.selectionEnd) !== "undefined") {

        }

        return pos;
    };

    jQuery.fn.setSelection = function (selectionStart, selectionEnd) {
        if (this.length === 0) {
            return this;
        }
        var input = this[0];

        if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        } else if (input.setSelectionRange) {
//            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        }

        return this;
    };

    jQuery.fn.setSelectionRange = function (range) {
        var element = jQuery(this);
        switch (range) {
            case 'start':
                element.setSelection(0, 0);
                break;
            case 'end':
                element.setSelection(element.val().length, element.val().length);
                break;
            case true:
            case 'all':
                element.setSelection(0, element.val().length);
                break;
        }
    };
})(jQuery);