#!/bin/sh

# Fetch the latest registry of available tools.
#/home/user/emsdk_portable/emsdk update

# Download and install the latest SDK tools.
#/home/user/emsdk_portable/emsdk install latest

# Make the "latest" SDK "active"
#/home/user/emsdk_portable/emsdk activate latest

source /home/user/emsdk_portable/emsdk_env.sh
emcc --closure 0 --minify 0 -s "EXPORT_NAME='Module'" --memory-init-file 0 -s NO_EXIT_RUNTIME=1 -s "EXPORTED_FUNCTIONS=['_addFile','_getEntries','_malloc','UTF8ToString']" helper.c --pre-js prefix.js --post-js postfix.js -o helper.js  -s "ASSERTIONS=1" -s "RESERVED_FUNCTION_POINTERS=1"
emcc --closure 0 --minify 0 -s "EXPORT_NAME='Module'" --memory-init-file 0 -s NO_EXIT_RUNTIME=1 -s "EXPORTED_FUNCTIONS=['_addFile','_getEntries','_malloc','UTF8ToString']" emcc.c --pre-js prefix.js --post-js postfix.js -o emcc.js  -s "ASSERTIONS=1" -s "RESERVED_FUNCTION_POINTERS=1"
rm output.js worker.js
cat extern/jquery-1.11.3.js extern/b64.js extern/jquery.history.js extern/iscroll-5.1.3.js extern/picup-2.1.2.js extern/jquery.animate.enhanced-1.11.js helper.js main.js >> output.js
cat emcc.js workermain.js >> worker.js
java -jar compiler.jar worker.js >worker.min.js
java -jar compiler.jar output.js >output.min.js
gzip output.min.js
gzip worker.min.js



#inkscape -z -e apple-touch-icon-114x114-precomposed.png -w 114 -h 114 icon.svg
#inkscape -z -e apple-touch-icon-120x120-precomposed.png -w 120 -h 120 icon.svg
#inkscape -z -e apple-touch-icon-144x144-precomposed.png -w 144 -h 144 icon.svg
#inkscape -z -e apple-touch-icon-152x152-precomposed.png -w 152 -h 152 icon.svg
#inkscape -z -e apple-touch-icon-180x180-precomposed.png -w 180 -h 180 icon.svg
#inkscape -z -e apple-touch-icon-72x72-precomposed.png -w 72 -h 72 icon.svg
#inkscape -z -e apple-touch-icon-76x76-precomposed.png -w 76 -h 76 icon.svg
#inkscape -z -e apple-touch-icon-precomposed.png -w 57 -h 57 icon.svg
#inkscape -z -e touch-icon-192x192.png -w 192 -h 192 icon.svg
