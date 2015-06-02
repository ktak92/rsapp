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
    self.elem = $('#' + id);
    self.listNotesElem = self.elem.find('.list-notes');
    self.addNoteBtn = self.elem.find('.add-post');
    self.emptyMsgElem = self.elem.find('.empty');
    self.noteFocused = null;
    //hook up the events
    self.addNoteBtn.on('click', function(e) {
        if (!self.noteFocused || (self.noteFocused && self.noteFocused.html().trim())) {
            //if new note isn't empty
        }
        self.onAddNewNote();
    });

    self.listNotesElem.on('click', '.delete-note', function(evt) {
        var noteElem = $(this).parent();
        self.deleteNote(noteElem);
    });

    self.listNotesElem.on('focus', '.content', function(evt) {
        var noteElem = $(this).parent();
        noteElem.addClass('active');
        this.noteFocused = noteElem;
    });

    self.listNotesElem.on('blur', '.content', function(evt) {
        this.noteFocused = null;
        var contentElem = $(this);
        var noteElem = contentElem.parent();
        noteElem.removeClass('active');
        if (!contentElem.html().trim()) {
            self.deleteNote(noteElem);
        } else {
            self.saveNotes();
        }
    });

    //load and populate the notes to the list
    self.loadNotes();
};

RSApp.List.prototype = {
    /* 
     * Creates a note dom with the provided content and adds to the list
     * @return the newly added .content element
     */
    addNoteElemToList: function(content) {
        var newNoteElem = RSApp.HBUtil.handleIt(RSApp.TEMPLATES.NOTE, {
            content: content || ''
        }, this.listNotesElem);
        newNoteElem.fadeIn('slow');
        return newNoteElem
            .children('.content')
            .attr('contentEditable', 'true');
    },
    onAddNewNote: function() {
        if (this.emptyMsgElem.is(':visible')) {
            this.emptyMsgElem.hide();
        }
        var contentElem = this.addNoteElemToList();
        var noteElem = contentElem.parent();
        noteElem.fadeIn('slow', function() {
            contentElem.focus();
        });
    },
    /* 
     * Saves the content of the note into localStorage as an object string
     */
    saveNotes: function() {
        var buffer = [];
        this.listNotesElem.find('.note > .content').each(function() {
            var saveVal = $(this).html();
            buffer.unshift(saveVal);
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
    /* 
     * Loads notes from localStorage and creates and adds a new note elem
     */
    loadNotes: function() {
        var lsData = localStorage.getObject(this.id) || [];
        var self = this;
        if (lsData.length > 0) {
            this.emptyMsgElem.hide();
        }
        $.each(lsData, function(index, value) {
            self.addNoteElemToList(value);
        });
    },
    clearNotes: function() {
        var self = this;
        localStorage.removeItem(this.id);
        var notesElems = $('#' + this.id + ' .note');
        notesElems.fadeOut('slow', function() {
            notesElems.remove();
            self.emptyMsgElem.show();
        });
    },
    deleteNote: function(elemToRemove) {
        var self = this;
        if (this.getNotesCount() == 1) {
            this.clearNotes();
        } else {
            elemToRemove.fadeOut('slow', function() {
                elemToRemove.remove();
                self.saveNotes();
            });
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
    var today = (new Date()).toString().split(' ').splice(1, 3).join(' ');
    var headerTemplateCtx = {
        boardTitle: 'Team 007 Retrospect Meeting',
        boardDate: today
    };
    RSApp.HBUtil.handleIt(RSApp.TEMPLATES.HEADER, headerTemplateCtx, $('#title-section'));
    $('#list-container .list').each(function() {
        var listId = this.id;
        RSApp.allLists[listId] = new RSApp.List(listId);
    });
});