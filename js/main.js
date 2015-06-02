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

    this.listNotesElem.on('click', '.delete-note', function(evt) {
        var noteElem = $(this).parent();
        self.deleteNote(noteElem);
    });

    this.listNotesElem.on('focus', '.content', function(evt) {
        console.log(evt)
    });

    this.listNotesElem.on('blur', '.content', function(evt) {
        console.log(evt)
    });

    //load and populate the notes to the list
    this.loadNotes();
};

RSApp.List.prototype = {
    /* @return the content element of the note */
    addNoteElemToList: function(content) {
        var newNoteElem = RSApp.HBUtil.handleIt(RSApp.TEMPLATES.NOTE, {
            content: content || ''
        }, this.listNotesElem);
        return newNoteElem
            .children('.content')
            .attr('contentEditable', 'true');
    },
    onAddnewNote: function() {
        if (this.emptyMsgElem.is(':visible')) {
            this.emptyMsgElem.hide();
        }
        var contentElem = this.addNoteElemToList();

        setTimeout(function() {
            contentElem.focus();
        }, 500);
    },
    /* save on:
     * notes changed (edit, delete, add, moved)
     */
    saveNotes: function() {
        var buffer = [];
        this.listNotesElem.find('.note > .content').each(function() {
            buffer.push($(this).html());
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
        $.each(lsData, function() {
            self.addNoteElemToList(this);
        });
    },
    clearNotes: function() {
        localStorage.removeItem(this.id);
        $('#' + this.id + ' .note').remove();
        this.emptyMsgElem.show();
    },
    deleteNote: function(elemToRemove) {
        if (this.getNotesCount() == 1) {
            this.clearNotes();
        } else {
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
        //localStorage.setObject(listId, ['test', 'test2', 'test3']);
        RSApp.allLists[listId] = new RSApp.List(listId);
    });
});