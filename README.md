QR Code Image Merger
====================

Merges a QR code with a background image.
Only modifies the source image where necessary.

Makes this:

![Sample](http://markusfisch.github.io/qrim/sample.png)

Decodes with any QR scanner. Just try.

Make your own [here](http://qrim.markusfisch.de).

Drop a picture to set a new background.
If you want to keep the merged image, just save it from your browser
(this seems to work only in Firefox, unfortunately).

Dependencies
============

Generation of the QR code is done with
[node-qrcode](https://github.com/soldair/node-qrcode).

QR code detection (for verifying) is done with
[jsqrcode](https://github.com/LazarSoft/jsqrcode).

License
=======

qrim.js is public domain.
Sample images are from my photo stream.
