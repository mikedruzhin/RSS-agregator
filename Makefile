# Makefile
install: # устанавливает модули руководстувуясь локфайлом
	npm ci
publish: # выполняет отладку публикации пакета
	npm publish --dry-run
lint: # запускает eslint
	npx eslint .
develop:
	npx webpack serve
build:
	NODE_ENV=production npx webpack
deleteOld:
	rm -rf dist