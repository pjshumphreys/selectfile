emscripten_worker_respond


//any time a file is opened for writing, it's name is added to a list

//on exit this list is used to get the contents of the named file (using emscripten functions) which is posted back to the main thread. the main thread will put each of the messages recieved into the indexed db



//any time a file is opened with fopen a message is sent to the main thread asking for its contents. the main thread sends a message back with the contents and the worker writes this into its memfs filesystem.

var codeflow


jmp_buf env2;

//event handler
eventHandler() {
  jmp_buf env;
  int i = 0;

  //store a point here so we can temporary jump out of the regular program flow to handle messages
  i = setjmp(env);

  switch(i) {
    //startup. call main. something further down the stack may return the resonse to this message
    case 0: { 
      main();
    } break;

    //a file was fopened. read the message recieved, perform the appropriate action then jump back into the regular program flow
    case 1: {
      longjmp(env2, 1);
    } break;
  }

  //respond with a final message informing the main thread of which files were altered and their new contents
}


fopen() {
  int i;
  
  //store where to come back to for later, then send a request back to the main thread
  if((i = setjmp(env2)) == 0) {
    emscripten_worker_respond(0, 0);
  }

  //we will at some point in the future exit the warp jump here, with the file contents pointed to by a javascript string. put them into the specified file, then fopen it for real
  printf("hello");
}
