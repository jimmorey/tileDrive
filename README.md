# TileDrive (td) 
This is the first version controlled tile environment.
It comes from my work with TileLand and PolygonR&D

## Description
Its main difference is the focus on a tree structure that will hopefully allow for easier immediate editting of patterns.  This new direction may lead to better preprocessing languages as well as fascilitate more natural embellishment of existing patterns. 

This version will promote simple code trees (non-looping non-conditional code) that can be cut and pasted. Text is the 
* [tileland](https://jimmorey.com/tl/tileland.html)
* [PolygonR&D](https://jimmorey.com/legacy/legacy.html)

## Getting Started


* bugs:
    * flower in bank?? bank loading (probably not great to load these without fixing code??)
    * canvas has transparent polygons??

## Authors
Jim Morey 

## Version History
* 0.9 fixed some layout issues and editted some of the supporting html documents. Add a bit of code styling in the adv...
* 0.81 add a method to merge tiles for getting the outline of chunks??
* 0.8 Gallery loading...
    * "uu" to upload home to Gallery comments become title 
    * "uc" dump all of the Gallery and do a uu
    * add "raw banks"--dump all as "q blah xA blah xB"  and change "examine raw" to "raw"
    * s / show will super-impose polygons 
* 0.78 Anonymous banks
    * +#{[blah]|A} , m{[blah]|A}{[blah]|A}, f{[blah]|A}{[blah]|A}
    * potentially ?{colour|#}{True:[blah]|A}{False:[blah]|A}
* 0.75 zipper code
    * need a new feature to handle making loops easier....
    * the command mAB 
    * the : to glue polygons together so that the zipper can be more specific
* 0.5 grade 3 art friendly??
    * 44{b}4 has no blue squares...but 44{b} does???
    * need to link annimate with code (color the code so that it also animates)....
    * cursor clicking on the code to changing the cursor position
    * tlCodeEl...??... need to trim it down. There seems to be a lot of duplication...
    * annimate (first draft works)
    * want to add branches last in interactive (works...)
    * d has a problem fixed. (w,and e left/right)
    * fixed visible cursor.
    * need some work on keyboard cut and past (fixed...)
    * need a hide text area button / mode (should be default) ok
    * fixed cursor at zero issue.
* 0.2 jquery-free version
    * did update.
* 0.1
    * jquery version sort've works
