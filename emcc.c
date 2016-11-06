/* temporary 'program' with which to test whether the webworker to host page
output interface is working correctly*/

#include <stdio.h>

/*the real entry point for the html5 version of querycsv. we can't use main as I believe it's treated specially on emcripten and so can only be called once */
int realmain(int argc, char **argv) {
  int i;

  printf("Hello world!\nProgram arguments:\n");

  for(i = 0; i < argc; i++) {
    printf("%s\n", argv[i]);
  }

  //I believe this type coercion is valid in emscripten.
  //It should always print 0
  printf("%d\n", (int)argv[argc]);
  
  return 0;
}
