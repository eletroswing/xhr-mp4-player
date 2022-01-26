# NTX-PLAYER

[![CodeFactor](https://www.codefactor.io/repository/github/eletroswing/xhr-mp4-player/badge)](https://www.codefactor.io/repository/github/eletroswing/xhr-mp4-player)

The goal is to make a player like streaming services, but to stream common files, such as mp4 (trying as much as possible to make it faster than the simple <video /> tag)

### Current
Still slow in lower network connections.
It's very broken and in a lot of trouble right now (can you help?)

### How is it working at the moment

A server in express streams the video file via Readablestream, with response 206 (partial-content). //is configured to send 0.5mb responses

The index.html makes the request through an XHR adapter and then adds to a MediaSource SourceBuffer. //is configured to only start the player when 2 seconds are loaded into the buffer, then keep 50 second chunks;

### How to setup the player

<video /> tag with the id "player"

The base Script is loaded at the bottom of the page.

The video Src is set inside the XHR adapter
