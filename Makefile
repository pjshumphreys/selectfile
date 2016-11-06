# Fetch the latest registry of available tools.
#~/emsdk_portable/emsdk update

# Download and install the latest SDK tools.
#~/emsdk_portable/emsdk install latest

# Make the "latest" SDK "active"
#~/emsdk_portable/emsdk activate latest

all: output.min.js.gz worker.min.js.gz apple-touch-icon-114x114-precomposed.png apple-touch-icon-120x120-precomposed.png apple-touch-icon-144x144-precomposed.png apple-touch-icon-152x152-precomposed.png apple-touch-icon-180x180-precomposed.png apple-touch-icon-72x72-precomposed.png apple-touch-icon-76x76-precomposed.png apple-touch-icon-precomposed.png touch-icon-192x192.png

output.min.js.gz: output.min.js
	gzip -9 < output.min.js > output.min.js.gz

worker.min.js.gz: worker.min.js
	gzip -9 < worker.min.js > worker.min.js.gz

output.min.js: output.js
	java -jar compiler.jar output.js > output.min.js

worker.min.js: worker.js
	java -jar compiler.jar worker.js > worker.min.js

output.js: extern/jquery-1.11.3.js extern/b64.js extern/jquery.history.js extern/iscroll-5.1.3.js extern/picup-2.1.2.js extern/jquery.animate.enhanced-1.11.js helper.js msgs.js stringifyAndPostFactory.js main.js
	rm -f output.js
	cat extern/jquery-1.11.3.js extern/b64.js extern/jquery.history.js extern/iscroll-5.1.3.js extern/picup-2.1.2.js extern/jquery.animate.enhanced-1.11.js helper.js msgs.js stringifyAndPostFactory.js main.js >> output.js

worker.js: emcc.js workermain.js msgs.js stringifyAndPostFactory.js 
	rm -f worker.js
	cat emcc.js  msgs.js stringifyAndPostFactory.js workermain.js >> worker.js

helper.js: prefix.js helper.c postfix.js
	source ~/emsdk_portable/emsdk_env.sh; emcc --closure 0 --minify 0 -s "EXPORT_NAME='Module'" --memory-init-file 0 -s "NO_EXIT_RUNTIME=1" -s "ASSERTIONS=1" -s "RESERVED_FUNCTION_POINTERS=1" -s "EXPORTED_FUNCTIONS=['_addFile','_getEntries','_malloc','UTF8ToString']" helper.c --pre-js prefix.js --post-js postfix.js -o helper.js 

emcc.js: prefix.js emcc.c postfix.js
	source ~/emsdk_portable/emsdk_env.sh; emcc --closure 0 --minify 0 -s "EXPORT_NAME='Module'" --memory-init-file 0 -s NO_EXIT_RUNTIME=1 -s "ASSERTIONS=1" -s FORCE_FILESYSTEM=1 -s "EXPORTED_FUNCTIONS=['_realmain','_malloc','UTF8ToString']" emcc.c --pre-js prefix.js --post-js postfix.js -o emcc.js

apple-touch-icon-114x114-precomposed.png: icon.svg
	inkscape -z -e apple-touch-icon-114x114-precomposed.png -w 114 -h 114 icon.svg

apple-touch-icon-120x120-precomposed.png: icon.svg
	inkscape -z -e apple-touch-icon-120x120-precomposed.png -w 120 -h 120 icon.svg

apple-touch-icon-144x144-precomposed.png: icon.svg
	inkscape -z -e apple-touch-icon-144x144-precomposed.png -w 144 -h 144 icon.svg

apple-touch-icon-152x152-precomposed.png: icon.svg
	inkscape -z -e apple-touch-icon-152x152-precomposed.png -w 152 -h 152 icon.svg

apple-touch-icon-180x180-precomposed.png: icon.svg
	inkscape -z -e apple-touch-icon-180x180-precomposed.png -w 180 -h 180 icon.svg

apple-touch-icon-72x72-precomposed.png: icon.svg
	inkscape -z -e apple-touch-icon-72x72-precomposed.png -w 72 -h 72 icon.svg

apple-touch-icon-76x76-precomposed.png: icon.svg
	inkscape -z -e apple-touch-icon-76x76-precomposed.png -w 76 -h 76 icon.svg

apple-touch-icon-precomposed.png: icon.svg
	inkscape -z -e apple-touch-icon-precomposed.png -w 57 -h 57 icon.svg

touch-icon-192x192.png: icon.svg
	inkscape -z -e touch-icon-192x192.png -w 192 -h 192 icon.svg

.PHONY: all
.PHONY: clean
.PHONY: cleancode


clean:
	rm -rf output.min.js.gz worker.min.js.gz output.min.js worker.min.js output.js worker.js helper.js emcc.js apple-touch-icon-114x114-precomposed.png apple-touch-icon-120x120-precomposed.png apple-touch-icon-144x144-precomposed.png apple-touch-icon-152x152-precomposed.png apple-touch-icon-180x180-precomposed.png apple-touch-icon-72x72-precomposed.png apple-touch-icon-76x76-precomposed.png apple-touch-icon-precomposed.png touch-icon-192x192.png

cleancode:
	rm -rf output.min.js.gz worker.min.js.gz output.min.js worker.min.js output.js worker.js helper.js emcc.js
