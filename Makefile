VERSION = $(shell node -e 'console.log(require("./package.json").version)')

clean:
	rm -rf dist/*
doc: 
	jsdoc --configure jsdoc.json
dist:
	uglifyjs proxapi.js > dist/proxapi-$(VERSION).min.js
	cp proxapi.js dist/proxapi-$(VERSION).js

bump:
	node tools/bump-version.js $$VERSION_BUMP
bump-feature:
	VERSION_BUMP=FEATURE $(MAKE) bump
bump-major:
	VERSION_BUMP=MAJOR $(MAKE) bump

.PHONY: docs, dist
