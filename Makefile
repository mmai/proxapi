VERSION = $(shell node -e 'console.log(require("./package.json").version)')

browser:
	browserify proxapi.js --standalone ProxAPI > dist/proxapi.js
dist: browser
	cp dist/proxapi.js dist/proxapi-$(VERSION).js
	uglifyjs dist/proxapi.js > dist/proxapi-$(VERSION).min.js
makedoc: dist
	rsync -av dist/ doc/dist/; \
	jsdoc --configure jsdoc.json
doc: makedoc
	cd doc; \
	git add --ignore-errors *; \
	git commit -am"update doc";\
	git push
bump:
	node tools/bump-version.js $$VERSION_BUMP
bump-feature:
	VERSION_BUMP=FEATURE $(MAKE) bump
bump-major:
	VERSION_BUMP=MAJOR $(MAKE) bump
publish:
	npm publish .

.PHONY: doc dist
