# Retrospeck: a note taking utility for scrum retrospectives
## Author: Keishi Takashima
## ktak@outlook.com

## Usage
Open index.html

## Quick backstory
In our weekly team retrospective meetings we use post-it notes to jot down our thoughts and organize them to three categories: the Good, the Bad, and Changes. I thought this exercise was a good opportunity to implement a retrospective board.

## Features
* Mobile first responsive, 2 break pts.
* Uses html5 contentEditable for the post-it notes.
** notes saves when you click out (blur) of the edit mode
* Uses handlebars for dynamic parts.
* Using basic jQ animations for action feedbacks.
* Persists notes on local storage.
** Using 3 keys, one for each list of the board. All the notes for that list are stored in the value portion.

## Frameworks used
* sass
* compass
* jQuery
* handlebars
* borrowed a lightweight grid system, resets, and some button styles [from Motherplate]
