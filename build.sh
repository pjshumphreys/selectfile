#!/bin/sh

# Fetch the latest registry of available tools.
#/home/user/Downloads/emsdk_portable/emsdk update

# Download and install the latest SDK tools.
#/home/user/Downloads/emsdk_portable/emsdk install latest

# Make the "latest" SDK "active"
#/home/user/Downloads/emsdk_portable/emsdk activate latest

source /home/user/Downloads/emsdk_portable/emsdk_env.sh
emcc --closure 0 --minify 0 -s "EXPORT_NAME='Module'" --memory-init-file 0 -s NO_EXIT_RUNTIME=1 -s "EXPORTED_FUNCTIONS=['_addFile','_getEntries','_malloc','UTF8ToString']" emcc.c --pre-js prefix.js --post-js postfix.js -o emcc.js  -s "ASSERTIONS=1" -s "RESERVED_FUNCTION_POINTERS=1"
rm output.js
cat extern/jquery-1.11.3.js extern/b64.js extern/jquery.history.js extern/iscroll-5.1.3.js extern/picup-2.1.2.js extern/jquery.animate.enhanced-1.11.js emcc.js main.js >> output.js
java -jar compiler.jar output.js >output.min.js
gzip output.min.js
