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
        try {
            var templateSrc = $(tplSrcId).html();
            var template = Handlebars.compile(templateSrc);
            var context = tplCtx || {};
            var templateElem = $(template(context));
            $(attachToElem).prepend(templateElem);
            return templateElem;
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
    var self = this;
    this.id = id;
    //elements of the list
    this.elem = $('#' + id);
    this.listNotesElem = this.elem.find('.list-notes');
    this.addNoteBtn = this.elem.find('.add-post');
    this.emptyMsgElem = this.elem.find('.empty');

    //hook up the events
    this.addNoteBtn.on('click', function(e) {
        self.onAddnewNote();
    });

    //load and populate the notes to the list
    this.loadNotes();
};

RSApp.List.prototype = {
    addNoteElemToList: function(content) {
        return RSApp.HBUtil.handleIt(RSApp.TEMPLATES.NOTE, {
            content: content || ''
        }, this.listNotesElem);
    },
    onAddnewNote: function() {
        if (this.emptyMsgElem.is(':visible')) {
            this.emptyMsgElem.hide();
        }
        var newNoteElem = this.addNoteElemToList();
        var contentElem = newNoteElem.children('.content');
        contentElem.attr('contentEditable', 'true');
        setTimeout(function() {
            contentElem.focus();
        }, 500);
    },
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
    getNotesCount: function() {
        return this.listNotesElem.find('.note > .content').length;
    },
    loadNotes: function() {
        var lsData = localStorage.getObject(this.id) || [];
        var self = this;
        if (lsData.length > 0) {
            this.emptyMsgElem.hide();
        }
        $.each(lsData, function(index, content) {
            self.addNoteElemToList(content);
        });
    },
    clearNotes: function() {
        localStorage.removeItem(this.id);
        this.listNotesElem.remove('.note');
        this.emptyMsgElem.show();
    },
    deleteNote: function(elemToRemove) {
        if (this.getNotesCount() == 1) {
            this.clearNotes();
        } else {
            var elem = event.target;
            elemToRemove.remove();
            this.saveNotes();
        }
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
    $('#list-container .list').each(function() {
        var listId = this.id;
        localStorage.setObject(listId, ['test', 'test2', 'test3']);
        RSApp.allLists[listId] = new RSApp.List(listId);
    });
});