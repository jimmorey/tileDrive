# TileDrive (td) 
This is a developing project that hopes to create a introductory environment to play with shapes, patterns, and eventually coding. This is the first version-controlled tile environment. The previous environments 
TileLand and PolygonR&D (early 2000's) were vi or emacs maintained :).

Jump into tiling
* [TileDrive](./TileDrive.html) is the main link to the main application.
* An [Introduction](./TDIntro.html) to the world of tiledriving is presented with many other linked documents that address some of the details and subtleties of this tiling world.

## Description
The Introduction is the best place to see what this project is about. 
The main difference between the previous work is that there is focus on a tree structure that will hopefully allow for easier immediate editting of patterns.  This new direction may lead to better preprocessing languages as well as fascilitate more natural embellishment of existing patterns. 

This version will promote simple code trees (non-looping non-conditional code) that can be cut and pasted. Simple text promoted in this new version with single character tokens. 
* [tileland](https://jimmorey.com/tl/tileland.html)
* [PolygonR&D](https://jimmorey.com/legacy/legacy.html)

## Getting Started

* future directions:
    * adding condition behaviour to the preprocessor language
        * ?{colour\|#}{True:[blah]\|A}{False:[blah]\|A}
    * adding TileManager interface that has an interface that focuses on preprocessor language with help with reversable/ partial execution tools

* bugs:
    * a current unsolved issue relates to chunking tiles in Unwind that I only have one problem case.  This is a low priority currently.

## Authors
Jim Morey 

## Version History
* 1.0 - works