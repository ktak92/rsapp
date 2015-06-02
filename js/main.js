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
    HEADER: '#header-template',
    LIST: '#list-template'
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
        var prepend = true;
        var newNoteElem = RSApp.HBUtil.handleIt(RSApp.TEMPLATES.NOTE, {
            content: content || ''
        }, this.listNotesElem, prepend);
        newNoteElem.fadeIn(250);
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
        noteElem.fadeIn(250, function() {
            contentElem.focus();
        });
    },
    /* 
     * Saves the content of the note into RSApp.storage as an object string
     */
    saveNotes: function() {
        var buffer = [];
        this.listNotesElem.find('.note > .content').each(function() {
            var saveVal = $(this).html();
            buffer.unshift(saveVal);
        })
        if (buffer.length > 0) {
            RSApp.storage.setObject(this.id, buffer);
        } else {
            this.clearNotes();
        }
    },
    getNotesCount: function() {
        return this.listNotesElem.find('.note > .content').length;
    },
    /* 
     * Loads notes from RSApp.storage and creates and adds a new note elem
     */
    loadNotes: function() {
        var lsData = RSApp.storage.getObject(this.id) || [];
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
        RSApp.storage.removeItem(this.id);
        var notesElems = $('#' + this.id + ' .note');
        notesElems.fadeOut(250, function() {
            notesElems.remove();
            self.emptyMsgElem.show();
        });
    },
    deleteNote: function(elemToRemove) {
        var self = this;
        if (this.getNotesCount() == 1) {
            this.clearNotes();
        } else {
            elemToRemove.fadeOut(250, function() {
                elemToRemove.remove();
                self.saveNotes();
            });
        }
    }
};

/**
 * Helper for handling handlebars related tasks
 **/
RSApp.HBUtil = {
    handleIt: function(tplSrcId, tplCtx, attachToElem, prepend) {
        try {
            var templateSrc = $(tplSrcId).html();
            var template = Handlebars.compile(templateSrc);
            var context = tplCtx || {};
            var templateElem = $(template(context));
            if (prepend) {
                $(attachToElem).prepend(templateElem);
            } else {
                $(attachToElem).append(templateElem);
            }
            return templateElem;
        } catch (e) {
            throw 'Failed on handling template: ' + tplSrcId;
        }
    }
};

/* spinner indicate when RSApp.storage accessed */
RSApp.Spinner = {
    active: false,
    flash: function() {
        var self = this;
        if (self.active) {
            return;
        }
        var spinnerElem = $('#spinner');
        self.active = true;
        spinnerElem.fadeIn(1000, function() {
            spinnerElem.fadeOut(1000);
            self.active = false
        });
    }
}

/**
 * wrapper for custom localStorage
 **/
RSApp.storage = {
    getObject: function(key) {
        this.showSpinner();
        var value = localStorage.getItem(key);
        return value && JSON.parse(value);
    },
    setObject: function(key, value) {
        this.showSpinner();
        localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: function(key) {
        this.showSpinner();
        localStorage.removeItem(key);
    },
    showSpinner: function() {
        if (RSApp.Spinner) {
            RSApp.Spinner.flash();
        }
    }
};

/**
 * Start it up 
 **/
$(document).ready(function() {
    //create the header section
    var today = (new Date()).toString().split(' ').splice(1, 3).join(' ');
    var headerTemplateCtx = {
        boardTitle: 'Team 007 Retrospect Meeting',
        boardDate: today
    };
    RSApp.HBUtil.handleIt(RSApp.TEMPLATES.HEADER, headerTemplateCtx, $('#title-section'));

    //create the lists section
    var lists = [{
        id: 'goods',
        name: 'The Goods'
    }, {
        id: 'bads',
        name: 'The Bads'
    }, {
        id: 'changes',
        name: 'Changes Needed'
    }];
    $.each(lists, function(index, listCtx){
        RSApp.HBUtil.handleIt(RSApp.TEMPLATES.LIST, listCtx, $('#list-container'));
        var listId = listCtx.id;
        RSApp.allLists[listId] = new RSApp.List(listId);
    });
});