all: snapshots

node_modules/%:
	npm install --no-save --no-package-lock $*

snapshots:
	scripts/atom-exec scripts/update-scopes.js \
	--files=`(ls tests/*.es5 | xargs -L1 printf ':%s' | sed -e 's/^://')`

.PHONY: snapshots
