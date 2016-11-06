+function (JSON, MSGS) {
  'use strict';

  var global,
  JSON,
  MSGS,
  currentMessageId = 0,
  usingFakeIDB,
  stringifyAndPostFactory,
  stringifyAndPost,
  xxx;

  function messageHandler(e) { //set up the onmessage global function handler
    e = JSON.parse(e);

    switch(e.messageType) {
      case MSGS.TEST_FOR_IDB: {   //report whether IndexedDB is available in a web worker
        stringifyAndPost(MSGS.IDB_STATUS, usingFakeIDB);
      } break;
            
      case MSGS.UPDATE_FAKE_IDB: {   //update the fake indexedDB in the web worker with changes that have happened on the main thread
        updateFakeIndexedDB(false, e.data.version, e.data.files);
      } break;
      
      case MSGS.RUN_COMMAND: {   //run the specified command line, may post back changed file contents if IndexedDB doesn't work in a web worker
        runCommand(e.data.commandLine);
      }
    }
  }

function main(a, b, c) {
    global = a;
    JSON = global.JSON;
    MSGS = b;
    stringifyAndPostFactory = c;
    stringifyAndPost;

    usingFakeIDB = !(global.indexedDB = global.indexedDB || global.mozIndexedDB || global.webkitIndexedDB || global.msIndexedDB),

    stringifyAndPost = stringifyAndPostFactory(global, JSON);
    global.onmessage = messageHandler;

    Module.FS.mkdir('/Documents');
    Module.FS.mount(Module.FS.filesystems.MEMFS, {}, '/Documents');
  
    // sync from persisted state into memory and then
    // refresh the folder view
    //Module.FS.syncfs(true, refreshFolder);
  }

  ready();
}(global.JSON);
