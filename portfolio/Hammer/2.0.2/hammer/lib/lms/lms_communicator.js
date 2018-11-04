'use strict';

// !!!!  this file relies on the presence of APIWrapper.js and json2.js (or native JSON) when running remotely


// *********************
// a few utility functions
// *********************
/*function getUrlVars() {
    var vars = {};

    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });

    return vars;
}*/

function getQueryStringParam(param, default_) {
	if (default_ == null)
		default_ = "";

	param += "=";

	var url = unescape(window.location.href.replace(/\+/g, " "));
	var paramIndex = url.indexOf(param);

	if (paramIndex == -1)
		return default_;

	var newStr = url.substring(paramIndex + param.length, url.length);
	var end = newStr.indexOf("&");

	return decodeURIComponent(newStr.substring(0, end));
}

function strToBool(str) {
    return str == "true" ? true : false;
}

// ***********************
// LMS Communicator Class
//************************

/**
 *  Constructor
 */
function LMSCommunicator(localMode) {
    this.lmsInitialized = false;

    // assume we're not running locally
    this.localMode = false;

	// create cmi.comments mirror object
    this.lmsComments = new Object();
    this.lmsComments.items = new Array();

    // create LMS preferences mirror object
    this.preferences = {};

    // if "http" or "https" is found in the URL, we have a host domain and might be running remotely
    if (window.location.href.search(/https*:/) != -1)
        this.hostDomain = window.location.href.split("//")[1].split("/")[0];
    else
        this.hostDomain = null;

    // if there is no host domain, or if hostDomain is local, set localMode
//    if (!this.hostDomain || this.hostDomain.search(/localhost/) != -1  || this.hostDomain.search(/127.0.0.1/) != -1)
        this.localMode = true;
}

/**
 *  Public functions
 */

LMSCommunicator.prototype.lmsInit = function(navCallback, unpauseTimer) {
    // if navCallback is provided here, it will be automatically registered with the LMS

    // if the script is running locally, don't attempt to initialize the LMS, because it isn't there
    if (this.localMode)
        return false;

    this.lmsInitialized = strToBool(doLMSInitialize());

    if (this.lmsInitialized) {
        // get LMS Comments from the LMS and store them locally
        var lmsCommentsStr = this._getLMSValue("cmi.comments");
        try {
            this.lmsComments = JSON.parse(lmsCommentsStr);
        }
        catch (e) {
            this._clearLMSComments();
            //alert("Invalid JSON in cmi.comments: Clearing LMS Comments\n\ncmi.comments: " + lmsCommentsStr);
        }

        // get preferences from the LMS and store them locally
        var prefStr = this._getLMSValue("cmi.student_preference.text");
        try {
            this.preferences = JSON.parse(prefStr);
        }
        catch (e) {
            this._clearLMSPreferences();
        }

        // register navigation callback with the LMS
        if (navCallback)
            this.registerLMSNavCallback(navCallback);

        // if the timer is paused, unpause it
        if (unpauseTimer && this.isLMSTimerPaused())
            this.unpauseLMSTimer();
    }
    else
        alert("Error encountered initializing LMS.");

    return this.lmsInitialized;
};

LMSCommunicator.prototype.lmsFinish = function() {
    if (!this.lmsInitialized)
        return false;

    this._setLMSComments();
    this._setLMSPreferences();
    this._lmsCommit();

    return strToBool(doLMSFinish());
};

LMSCommunicator.prototype.registerLMSNavCallback = function(func) {
    setLMSNavigateCallback(func);
};

LMSCommunicator.prototype.navPrev = function() {
    return this._setLMSValue("adl.nav.request", "previous");
};

LMSCommunicator.prototype.navNext = function() {
    return this._setLMSValue("adl.nav.request", "continue");
};

LMSCommunicator.prototype.navExit = function() {
    return this._setLMSValue("adl.nav.request", "exit");
};

LMSCommunicator.prototype.navClear = function() {
    return this._setLMSValue("adl.nav.request", "");
};

LMSCommunicator.prototype.getLMSLessonStatus = function() {
    return this._getLMSValue("cmi.core.lesson_status");
};

LMSCommunicator.prototype.setLMSLessonStatus = function(status) {
    this._setLMSValue("cmi.core.lesson_status", status);
    var newstatus = status == "passed" ? "correct" : "incorrect";
    return this._setLMSValue("cmi.interactions.0.result", newstatus);
};

LMSCommunicator.prototype.getLMSRawScore = function() {
    return this._getLMSValue("cmi.interactions.0.objectives.0.score.raw");
};

LMSCommunicator.prototype.setLMSRawScore = function(score) {
    this._setLMSValue("cmi.core.score.raw", score);
    return this._setLMSValue("cmi.interactions.0.objectives.0.score.raw", score);
};

LMSCommunicator.prototype.getLMSResponseData = function() {
    return this._getCommentsVariable("lms_ans");
};

LMSCommunicator.prototype.setLMSResponseData = function(data) {
    return this._setCommentsVariable("lms_ans", data);
};

LMSCommunicator.prototype.setLMSCorrectResponseData = function(data) {
    return this._setCommentsVariable("lms_cor", data);
};

LMSCommunicator.prototype.isLMSTimerPaused = function() {
    if (!this.lmsInitialized)
        return false;

    return strToBool(isLMSPaused());
};

LMSCommunicator.prototype.pauseLMSTimer = function() {
    if (!this.lmsInitialized)
        return;

    if (!this.isLMSTimerPaused())
        doLMSPause();
};

LMSCommunicator.prototype.unpauseLMSTimer = function() {
    if (!this.lmsInitialized || !this.isLMSTimerPaused())
        return;

    if (this.isLMSTimerPaused())
        doLMSUnpause();
};

LMSCommunicator.prototype.getSecureDataURL = function(file) {
    /*if (this.hostDomain && !this.localMode) {
	    // get the course ID from the content path URL param
	    this.contentPath = getQueryStringParam("contentPath").split("/")[0];

	    return "https://" + this.hostDomain + "/testcache/loadfile.aspx?cid=" + this.contentPath + "&file=" + file;
   }
    else*/
        return file;
};

/**
 *  Private utility functions
 */

LMSCommunicator.prototype._getLMSValue = function(whatToGet) {
    if (!this.lmsInitialized)
        return "";

    return doLMSGetValue(whatToGet);
};

LMSCommunicator.prototype._setLMSValue = function(whatToSet, valToSet) {
    if (!this.lmsInitialized)
        return false;

    return strToBool(doLMSSetValueDirect(whatToSet, valToSet));
};

LMSCommunicator.prototype._setLMSComments = function() {
    var JSONstr;

    try {
        JSONstr = JSON.stringify(this.lmsComments);
    }
    catch (exc) {
        alert("Failed to stringify LMS Comments JSON.");
    }

    return this._setLMSValue("cmi.comments", JSONstr);
};

LMSCommunicator.prototype._clearLMSComments = function() {
    return this._setLMSValue("cmi.comments", "");
};

LMSCommunicator.prototype._setCommentsVariable = function(attrName, value) {
    var o = {"AttrName": attrName, "Value": value};

    // if this variable exists in the local data structure already, just update it and get outta here
    var i = 0;
    for (i = 0; i < this.lmsComments.items.length; i++) {
        if (this.lmsComments.items[i].AttrName == attrName) {
            this.lmsComments.items[i] = o;
            return this._setLMSComments();
        }
    }

    // if the variable didn't already exist, add it
    this.lmsComments.items.push(o);

    // indicate success
    return this._setLMSComments();
};

LMSCommunicator.prototype._getCommentsVariable = function(attrName) {
    // if this variable exists in the data structure, return it
    var i = 0;
    for (i = 0; i < this.lmsComments.items.length; i++) {
        if (this.lmsComments.items[i].AttrName == attrName)
            return this.lmsComments.items[i].Value;
    }

    // if we don't find that variable, return nothing
    return null;
};

LMSCommunicator.prototype._setLMSPreferences = function() {
    var JSONstr;

    try {
        JSONstr = JSON.stringify(this.preferences);
    }
    catch (exc) {
        alert("Failed to stringify LMS Preferences JSON.");
    }

    return this._setLMSValue("cmi.student_preference.text", JSONstr);
};

LMSCommunicator.prototype._clearLMSPreferences = function() {
    return this._setLMSValue("cmi.student_preference.text", "");
};

LMSCommunicator.prototype._setPreferencesVariable = function(attrName, value) {
	// add/overwrite preferences value
	this.preferences[attrName] = value;

    // indicate success
    return this._setLMSPreferences();
};

LMSCommunicator.prototype._getPreferencesVariable = function(attrName) {
    // if this variable exists in the data structure, return it
	if (this.preferences[attrName] != undefined)
		return this.preferences[attrName];
	else
        return null;
};

LMSCommunicator.prototype._lmsCommit = function() {
    return strToBool(doLMSCommit());
};