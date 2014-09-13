VERSION = $(shell node -e 'console.log(require("./package.json").version)')

clean:
	rm -rf dist/*
doc: 
	jsdoc --configure jsdoc.json
browser:
	browserify proxapi.js > dist/proxapi.js
dist: browser
	cp dist/proxapi.js dist/proxapi-$(VERSION).js
	uglifyjs dist/proxapi.js > dist/proxapi-$(VERSION).min.js

bump:
	node tools/bump-version.js $$VERSION_BUMP
bump-feature:
	VERSION_BUMP=FEATURE $(MAKE) bump
bump-major:
	VERSION_BUMP=MAJOR $(MAKE) bump

.PHONY: doc dist
