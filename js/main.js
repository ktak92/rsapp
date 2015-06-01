/** @namespace RSApp
 * Author: Keishi Takashima
 */
var RSApp = {};

/**
 * Holds the list objs
 */
RSApp.allLists = {};

/**
 * enum for holding template names used by HB
 **/
RSApp.TEMPLATES = {
    NOTE: '#note-template',
    HEADER: '#header-template'
};

/**
 * Helper for handling handlebars related tasks
 **/
RSApp.HBUtil = {
    handleIt: function(tplSrcId, tplCtx, attachToElem) {
        debugger;
        try {
            var templateSrc = $(tplSrcId).html();
            var template = Handlebars.compile(templateSrc);
            var context = tplCtx || {};
            var templateHtml = template(context);
            attachToElem.append(templateHtml);
        } catch (e) {
            throw 'Failed on handling template: ' + tplSrcId;
        }
    }
};

/**
 * @class RSApp.List
 * 
 * This class represents a list (goods, bads, changes).
 * It also includes the functions for managing note's persistance
 *
 **/
RSApp.List = function(id) {
    this.id = id;
    this.elem = $(id);
    this.listNotesElem = this.elem.find('.list-notes')[0];
    this.loadNotes();
};

RSApp.List.prototype = {
    /* save on:
     * notes changed (edit, delete, add, moved)
     */
    saveNotes: function() {
        var buffer = [];
        this.listNotesElem.find('.note > .content').each(function(contentElem) {
            buffer.push(contentElem.html());
        })
        if (buffer.length > 0) {
            localStorage.setObject(this.id, buffer);
        } else {
            this.clearNotes();
        }
    },
    loadNotes: function() {
        debugger;
        /*todo: this.listNotesElem scope issue
        * note is being 0, instead of content
        */
        var lsData = localStorage.getObject(this.id);
        $.each($(lsData), function(note) {
            RSApp.HBUtil.handleIt(RSApp.TEMPLATES.NOTE, {
                content: note
            }, this.listNotesElem);
        });
    },
    clearNotes: function() {
        localStorage.removeItem(this.id);
    }
};

/**
 * Extend Storage class to be able to handle json
 **/
Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

/**
 * Start it up 
 **/
$(document).ready(function() {
    var headerTemplateCtx = {
        boardTitle: 'Team 007 Retrospect Meeting',
        boardDate: 'May 26, 2015'
    };
    RSApp.HBUtil.handleIt(RSApp.TEMPLATES.HEADER, headerTemplateCtx, $('#title-section'));
    $('#list-container .list').each(function(list) {
        var listId = list.id;
        localStorage.setObject(listId, ['test', 'test2', 'test3']);
        RSApp.allLists[listId] = new RSApp.List(listId);
    });
});