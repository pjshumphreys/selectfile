  function ___syscall220(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // SYS_getdents64
      var stream = SYSCALLS.getStreamFromFD(), dirp = SYSCALLS.get(), count = SYSCALLS.get();
      if (!stream.getdents) {
        stream.getdents = FS.readdir(stream.path);
      }
      var pos = 0;
      while (stream.getdents.length > 0 && pos + 268 < count) {
        var id;
        var type;
        var name = stream.getdents.pop();
        var utf8Name = new Int8Array(256);
        assert(name.length < 256); // limit of dirent struct
        stringToUTF8Array(name, utf8Name, 0, 256);
        if (name[0] === '.') {
          id = 1;
          type = 4; // DT_DIR
        } else {
          var child = FS.lookupNode(stream.node, name);
          id = child.id;
          type = FS.isChrdev(child.mode) ? 2 :  // DT_CHR, character device.
                 FS.isDir(child.mode) ? 4 :     // DT_DIR, directory.
                 FS.isLink(child.mode) ? 10 :   // DT_LNK, symbolic link.
                 8;                             // DT_REG, regular file.
        }
        HEAP32[((dirp + pos)>>2)]=id;
        HEAP32[(((dirp + pos)+(4))>>2)]=stream.position;
        HEAP16[(((dirp + pos)+(8))>>1)]=268;
        HEAP8[(((dirp + pos)+(10))>>0)]=type;
        for (var i = 0; i < utf8Name.length; i++) {
          HEAP8[(((dirp + pos)+(11 + i))>>0)]=utf8Name[i];
          if(utf8Name[i] ===0) break;
        }
        pos += 268;
      }
      return pos;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }
Module["FS"]=FS;
return Module})(window,document)
