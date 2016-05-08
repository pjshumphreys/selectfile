+function (d) {
  'use strict';

  var
    oldclass,
    newclass,
    depth = 1,
    stateQueue = [],
    inactive = !0,
    wrapper,
    currentState,
    currentClass,
    currentFolderUl,
    currentPath = "/Documents/",
    currentName,
    editorScroll,
    editorWrapper,
    editorScroller,
    editorTextarea,
    editorSpan,
    saveDialog,
    cancelButton,
    targetElem,
    doTap = false,
    selectMode = false,
    fileModified = false,
    myScroll,
    myScroll3,
    myScroll2,
    myScroll5,
    addFileText,
    addFolderText,
    displayPathName,

    startTap = function(e) {
      e.preventDefault();

      $('.pushed').removeClass('pushed');
      targetElem = $(e.target).closest('button');

      doTap = true;

      if(selectMode == false) {
        targetElem.addClass('longTapping');
      }
      else {
        targetElem.addClass('pushed');
      }
    },

    stopTap = function() {
      targetElem.removeClass('longTapping').removeClass('pushed');
      doTap = false;
    },
    
    longTap = function(e) {
      var a = targetElem;
      if(doTap == true && selectMode == false) {
        doTap = false;
        selectMode = true;

        History.pushState({
              type: "selection",
              path: currentPath,
              depth: 2
            },
            d.title,
            "/Select"
          );

        toggleButtonSelection(e);
        navigator.vibrate([58]);
      }
    },

    updateSelection = function() {
      var b = $('.selected').length;

      if(b === 0) {
        selectMode = false;
        if(currentState === 'selection') {
          History.back();
        }
        $('#alt').fadeOut(100);
      }
      else {
        $('#selectionCount').text(b);
        if(b > 1) {
          $('#renameButton').fadeOut(100);
        }
        else {
          $('#renameButton').fadeIn(100);
        }
        
        $('#alt').fadeIn(100);
      }
    },

    toggleButtonSelection = function(e) {
      var a = $(e.target).closest('button').toggleClass('selected');

      e.stopPropagation();
      updateSelection();
      
      $('.pushed').removeClass('pushed');
      a.removeClass('longTapping');
    },

    gotoSettings = function() {
      if(inactive) {
        History.pushState({
            type: "settings"
          },
          "Settings",
          "/Settings"
        );
      }
    },

    kbGotoActions = function(e) {
      if((e.keyCode || e.which) == 13) { //Enter keycode
        doTap = true;
        gotoActions(e);
      }
    },

    gotoActions = function(e) {
      if(doTap == true) {
        doTap = false;

        if(selectMode == true) {
          toggleButtonSelection(e);
        }
        else if(inactive) {
          var btn = $(e.target).closest('button');

          if(btn.hasClass('folder')) {
            History.pushState({
                type: "folder",
                path: btn.attr('data-filepath'),
                depth: 2
              },
              d.title,
              "/Documents/folder1"
            );
          }
          else {
            History.pushState({
                type: "open",
                path: btn.attr('data-filepath'),
                name: btn.find('.filename').text()
              },
              "Actions",
              "/Actions"
            );
          }

          btn.removeClass("longTapping");
        }
      }
    },
    
    gotoEditor = function() {
      if(inactive) {
        History.pushState({
            type: "editor"
          },
          "Editor",
          "/Editor"
        );
      }
    },
    
    gotoConsole = function() {
      if(inactive) {
        History.pushState({
            type: "console"
          },
          "Console",
          "/Console"
        );
      }
    },

    goBack = function() {
      if(inactive) {
        History.back();
      }
    },
    
    goForward = function() {
      if(inactive) {
        History.forward();
      }
    },

    stateChange = function() {
      var state = {
          newState: History.getState(),
          currentState: currentState
      };

      if(stateQueue.length === 0) {
        stateQueue.push(state);
        
        currentState = state.newState.data.type;

        serviceStateQueue();
      }
      else {
        stateQueue.push(state);

        currentState = state.newState.data.type;
      }
    },
    
    serviceStateQueue = function() {
      if(inactive) {
        inactive = !1;

        var a = stateQueue.shift();

        if($(".pt-page-open").hasClass('changed') && (a.newState.data.type != 'open' && a.newState.data.type != 'editor')) {
          $(".pt-page-open").removeClass('changed');
          saveDialog.fadeOut(200);
          cancelButton.fadeOut(200);
        }

        switch(a.newState.data.type) {
          case "folder":
            currentPath = a.newState.data.path;

            if(a.currentState === 'selection') {
              $('.selected').removeClass('selected');
              updateSelection();
              inactive = !0;
            }
            else if(a.currentState === 'folder') {
              $('.selected').removeClass('selected');
              updateSelection();
              
              if(a.newState.data.path.length > currentPath.length) {
                folderFromRight(true);
              }
              else {
                folderFromLeft(false);
              }
            }
            else {
              pageFromLeft('folder', false);
            }
          break;
          
          case "selection":
            if(a.currentState !== 'folder') {
              pageFromLeft('folder', false);
            }
            else {
              inactive = !0;
            }
            
          break;

          case "settings":
            pageFromRight('settings', true);
          break;

          case "open":
            currentPath = a.newState.data.path;
            currentName = a.newState.data.name;
            displayPathName.text(currentPath);

            if(a.currentState === "editor" || a.currentState === "console") {
              if($(".pt-page-open").hasClass('changed')) {
                navigator.vibrate([58]);
              }
              else {
                updateDownloadLink();
              }
              pageFromLeft('open', false);
            }
            else {
              updateDownloadLink();
              pageFromRight('open', true);
            }
          break;

          case "editor":
            editorTextarea.val(Module.FS.readFile(currentPath, {encoding:'utf8'}));
            pageFromRight('editor', true);
          break;
          
          case "console":
            pageFromRight('console', true);
          break;
        }
      }
    },

    updateDownloadLink = function() {
      $('#downloadButton').
          attr(
            'href',
            "data:application/octet-stream;base64,"+
            base64js.
                fromByteArray(
                  Module.FS.readFile(
                    currentPath,
                    {
                      encoding: 'binary'
                    }
                  )
                )
          ).
          attr('download', currentName);
    },

    pageFromLeft = function(cssClass, onTop) {
      oldclass = "pt-page-moveToRight";
      newclass = "pt-page-moveFromLeft";
      currentClass = "pt-page-current";
      $('.pt-page-current').addClass('pt-page-old pt-page-moveToRight' + ((!!onTop)? ' pt-page-ontop':''));
      $('.pt-page-'+cssClass).addClass('pt-page-new pt-page-current pt-page-moveFromLeft' + ((!onTop)? ' pt-page-ontop':''));
    },

    pageFromRight = function(cssClass, onTop) {
      oldclass = "pt-page-moveToLeft";
      newclass = "pt-page-moveFromRight";
      currentClass = "pt-page-current";
      $('.pt-page-current').addClass('pt-page-old pt-page-moveToLeft' + ((!!onTop)? ' pt-page-ontop':''));
      $('.pt-page-'+cssClass).addClass('pt-page-new pt-page-current pt-page-moveFromRight' + ((!onTop)? ' pt-page-ontop':''));
    },

    folderFromLeft = function(onTop) {
      oldclass = "pt-page-moveToRight";
      newclass = "pt-page-moveFromLeft";
      currentClass = "currentFolder";
      $('.currentFolder').addClass('pt-page-old pt-page-moveToRight' + ((!!onTop)? ' pt-page-ontop':''));
      $('.fileList').not('.currentFolder').addClass('pt-page-new currentFolder pt-page-moveFromLeft' + ((!onTop)? ' pt-page-ontop':''));
    },

    folderFromRight = function(onTop) {
      oldclass = "pt-page-moveToLeft";
      newclass = "pt-page-moveFromRight";
      currentClass = "currentFolder";
      $('.currentFolder').addClass('pt-page-old pt-page-moveToLeft' + ((!!onTop)? ' pt-page-ontop':''));
      $('.fileList').not('.currentFolder').addClass('pt-page-new currentFolder pt-page-moveFromRight' + ((!onTop)? ' pt-page-ontop':''));
    },

    animEnd = function() {
      var a = $('.pt-page-old');

      if(a.length === 1) {
        inactive = !0;

        a
          .removeClass('pt-page-old')
          .removeClass(currentClass)
          .removeClass(oldclass)
          .removeClass('pt-page-ontop');

        $('.pt-page-new')
          .removeClass('pt-page-new')
          .removeClass(newclass)
          .removeClass('pt-page-ontop');

        switch(currentState) {
          case "folder":
            refreshFolder();
          break;

          case "settings":
          break;

          case "open":
          break;

          case "editor":
            editorRefresh();
          break;
          
          case "console":
            myScroll5.refresh();
          break;
        }
      }

      if(inactive && stateQueue.length) {
        setTimeout(serviceStateQueue, 1);
      }
    },

    editorInit = function () {
      editorScroll = new IScroll('#editor', {
          bounce : false,
          deceleration : 0.0001,
          mouseWheel : true,
          scrollX: true,
          freeScroll: true,
          tap:true
        });

      editorWrapper = $('#editor');
      editorScroller = editorWrapper.find('.scroller');
      editorTextarea = editorScroller.find('textarea');
      editorSpan = editorScroller.find('span');

      editorSpan.text(editorTextarea.val());
      editorTextarea.width(editorSpan[0].scrollWidth+20).height(editorSpan[0].scrollHeight+18).scrollTop(0);
      editorTextarea.scrollLeft(0);

      editorScroller.css({
          'min-height': editorTextarea.height()+20,
          'min-width': editorTextarea.width()+20
        });

      editorScroll.scrollTo(0, 0, 0);

      editorScroll.refresh();

      editorScroller.on('tap', editorFocus);

      editorTextarea.on({
          input: editorInput,
          keyup: editorKeyUp
        });

      editorWrapper.on('scroll', editorWrapperScroll);
    },

    editorInput = function() {
      editorRefresh();

      $(".pt-page-open").addClass('changed');
      saveDialog.show();
      cancelButton.show();
    }, 

    editorRefresh = function() {
      var
          x = editorScroll.x,
          y = editorScroll.y,
          doX = editorWrapper[0].scrollWidth == editorWrapper.width(),
          doY = editorWrapper[0].scrollHeight == editorWrapper.height();

      editorSpan.text(editorTextarea.val());
      editorTextarea.width(editorSpan[0].scrollWidth+20).height(editorSpan[0].scrollHeight+18).scrollTop(0);
      editorTextarea.scrollLeft(0);

      editorScroller.css({
          'min-height': editorTextarea.height()+20,
          'min-width': editorTextarea.width()+20
        });

      if(doX) {
        x = editorWrapper.width()-(editorTextarea.width()+20);
      }
      if(doY) {
        y = editorWrapper.height()-(editorTextarea.height()+20);
      }

      editorScroll.scrollTo(x, y, 0);
      editorScroll.refresh();
    },

    editorWrapperScroll = function() {
      var scrollTop = editorWrapper.scrollTop(); 
      var scrollLeft = editorWrapper.scrollLeft();

      if(scrollTop != 0) {
        editorWrapper.scrollTop(0);
        editorScroll.scrollBy(0, -scrollTop, 0);
      }

      if(scrollLeft != 0) {
        editorWrapper.scrollLeft(0);
        editorScroll.scrollBy(-scrollLeft, 0, 0);
      }
    },
    
    editorFocus = function() {
      editorTextarea.focus();
    },
    
    editorKeyUp = function(e) {
      if ((e.keyCode ? e.keyCode : e.which) == 13) {
        editorScroll.scrollTo(0, editorScroll.y, 0);
      }
    },
    doNothing = function(){},
    saveClick = function(){
      Module.FS.writeFile(currentPath, editorTextarea.val(), {encoding:'utf8'});
      Module.FS.syncfs(false, doNothing);
      saveDialog.hide();
      cancelButton.hide();
      $(".pt-page-open").removeClass('changed');
    },

    closeSaveDialog = function(e) {
      if($(e.target).closest('button').is('#yes')) {
        Module.FS.writeFile(currentPath, editorTextarea.val(), {encoding:'utf8'});
        Module.FS.syncfs(false, closeSaveDialog2);
      }
      else {
        closeSaveDialog2();
      }
    },
    
    closeSaveDialog2 = function(){
      updateDownloadLink();
      $(".pt-page-open").removeClass('changed');
      saveDialog.fadeOut(200);
      cancelButton.fadeOut(200);
    },
        
    toggleCheckbox = function() {
      var a = $(this).nextAll('span').first();

      a.html(a.attr(this.checked?'data-on':'data-off'));      
    },

    addFile = function() {
      var e, fileName = prompt(addFileText, '');

      if(fileName !== null) {
        if(fileName !== "" && fileName.indexOf('/') === -1) {
          try {
            e = Module.ccall(
              'addFile',
              'number',
              ['string'],
              [currentPath+fileName]
            );
            
            if (e) {
              throw new Module.FS.ErrnoError(e);
            }
          }
          catch(e) {
            alert(e.message);
          }
          Module.FS.syncfs(false, refreshFolder);        
        }
        else {
          alert("failed");
        }
      }
    },

    addFolder = function() {
      var e,folderName = prompt(addFolderText, '');

      if(folderName !== null) {
        if(folderName != "" && folderName.indexOf('/') === -1) {
          try {
            Module.FS.mkdir(currentPath+folderName);
          }
          catch(e) {
            alert(e.message);
          }
          Module.FS.syncfs(false, refreshFolder);
        }
        else {
          alert("failed");
        }
      }
    },

    uploadFile = function(e) {
      var fileReader = new FileReader();
      fileReader.origFileName = this.files[0].name;
      fileReader.readAsArrayBuffer(this.files[0]);
      fileReader.onloadend = fileReaderOnLoadEnd;
    },

    fileReaderOnLoadEnd = function(fileLoadedEvent) {
      Module.FS.writeFile(
          currentPath+this.origFileName,
          new Int8Array(fileLoadedEvent.target.result),
          {
            encoding:'binary'
          }
        );

      wrapper.html('&#xe902;<span><input type="file" title="Upload file"/></span>');

      Module.FS.syncfs(false, refreshFolder);      
    },
    
    selectAllClick = function() {
      $('.currentFolder button').addClass('selected');
      updateSelection();
    },

    deleteEntry = function() {
      var a = $('.selected:first');
      if(a.hasClass('folder')) {
        Module.FS.rmdir(currentPath+a.find('.filename').text());
      }
      else {
        Module.FS.unlink(currentPath+a.find('.filename').text());
      }

      $('.selected').removeClass('selected');
      updateSelection();
      
      Module.FS.syncfs(false, refreshFolder);
    },
    
    refreshFolder = function(err){
      currentFolderUl = $('.currentFolder .scroller ul');
      currentFolderUl.empty();
      Module.ccall(
        'getEntries',
        'number',
        [
          'string',
          'number',
          'number',
          'number'
        ],
        [
          currentPath,
          1,
          1,
          addListEntry
        ]
      );

      myScroll.refresh();
      myScroll3.refresh();
      myScroll2.refresh();
    },

    round = function(value, exp) {
      if (typeof exp === 'undefined' || +exp === 0)
        return Math.round(value);

      value = +value;
      exp = +exp;

      if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
        return NaN;

      // Shift
      value = value.toString().split('e');
      value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

      // Shift back
      value = value.toString().split('e');
      return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
    },

    formatFileSize = function(bytes) {
      var size = ['bytes','kB','MB','GB','TB','PB','EB','ZB','YB'];
      var factor = Math.floor(((""+bytes).length - 1) / 3);
      
      return ""+round(bytes / Math.pow(1000, factor), 1) + " " + size[factor];
    },

    addListEntry = Module.Runtime.addFunction(function(name, type, modified, size) { 
      var a, b;
      name = Module.Pointer_stringify(name);

      if(type === 1) {
        $('<li><button type="button" class="folder" data-filepath="'+currentPath+name+'">'+
          '<span class="icon">&#xe911;</span>'+
          '<span class="filename">'+name+'</span><br>'+
          '<span class="hidden">.</span><span class="size">Folder</span>'+
          '</button></li>').appendTo(currentFolderUl);
      }
      else {
        a = new Date(modified*1000);
        b = a.getHours();
        $('<li><button type="button" data-filepath="'+currentPath+name+'">'+
          '<span class="icon">&#xe910;</span>'+
          '<span class="filename">'+name+'</span><br>'+
          '<span class="hidden">.</span><span class="date">'+
          a.getFullYear()+
          "-"+
          ("0"+(a.getMonth()+1)).slice(-2)+
          "-"+
          ("0"+a.getDate()).slice(-2)+
          '<span class="hidden">.</span> '+
          (b%12||12)+
          ":"+
          ("0"+a.getMinutes()).slice(-2)+
          (b<12?"am":"pm")+
          '<span class="hidden">.</span></span> '+
          '<span class="size">'+formatFileSize(size)+'</span>'+
          '</button></li>').appendTo(currentFolderUl);
      }
    }),
    
    ready = function() {
      //alert(!!(window.File && window.FileReader && window.FileList && window.Blob));

      History.replaceState({
          type: "folder",
          path: "/Documents/",
          depth: 1
        },
        d.title,
        "/Documents"
      );

      currentState = "folder";

      $(window).on('statechange', stateChange);

      //get what the width of the horizontal folder tab scroller should be
      var width = 0;

      $('#scroller2 ul li').each(function() {
        width += $(this).outerWidth(!0);
      });

      $('#scroller2').width(width);

      //Set up the IScroll objects
      myScroll = new IScroll('#folder1', {
        bounce : false,
        deceleration : 0.0001,
        mouseWheel : true,
        tap: true
      }),
      
      myScroll3 = new IScroll('#folder2', {
        bounce : false,
        deceleration : 0.0001,
        mouseWheel : true,
        tap: true
      }),

      myScroll2 = new IScroll('#wrapper2', {
          bounce : false,
          deceleration : 0.0001,
          scrollX : true,
          scrollY : false,
          click:true
        }),

      myScroll5 = new IScroll('#console', {
          bounce : false,
          deceleration : 0.0001,
          mouseWheel : true,
          click: true,
          scrollX: true,
          freeScroll: true
        });

      //start of event handlers

      $('.pt-perspective').on('animationend', animEnd);

      myScroll.on('scrollCancel', stopTap);
      myScroll.on('scrollStart', stopTap);
      myScroll3.on('scrollCancel', stopTap);
      myScroll3.on('scrollStart', stopTap);

      $('.fileList').
        on('mousedown touchstart', 'button', startTap).
        on('animationend', 'button', longTap).
        on('tap', 'button', gotoActions).
        on('keyup', 'button', kbGotoActions);

      addFileText = $("#addFile").on('click', addFile).attr('data-text');
      addFolderText = $("#addFolder").on('click', addFolder).attr('data-text');
      $("#delete").on('click', deleteEntry);
      $('#selectAllButton').on('click', selectAllClick);

      wrapper = $("#uploadFile");
      wrapper.on("change", "input", uploadFile);

      $('.swith').on('click', gotoSettings);
      $("input[type='checkbox']").on('change', toggleCheckbox);

      $('.backButton').on('click', goBack);

      saveDialog = $('.saveDialog');
      cancelButton = $('#cancelButton');
      cancelButton.on('click', goForward);
      displayPathName = $('#showPathName');

      $('#edit').on('click', gotoEditor);
      $('#console').on('click', gotoConsole);
      $('#yes,#no').on('click', closeSaveDialog);
      $('#saveButton').on('click', saveClick);

      editorInit();

      //end of event handlers

      Module.FS.mkdir('/Documents');
      Module.FS.mount(Module.FS.filesystems.IDBFS, {}, '/Documents');
    
      // sync from persisted state into memory and then
      // refresh the folder view
      Module.FS.syncfs(true, refreshFolder);
    },

    xxx;

  $(d).ready(ready);
}(document);
