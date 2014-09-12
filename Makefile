cleandocs: 
	rm -rf docs
docs: cleandocs
	jsdoc -c jsdoc.json
