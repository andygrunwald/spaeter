.PHONY: help install lint test validate smoke check vendor icons zip

help: ## Show available targets
	@grep -E '^[a-z]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "  %-10s %s\n", $$1, $$2}'

install: ## Install dev dependencies (incl. Chrome for Testing)
	npm ci

lint: ## Lint JavaScript (ESLint) and Markdown (markdownlint)
	npm run lint

test: ## Run unit tests and the iOS guide consistency tests
	npm test

validate: ## Validate the extension and check the vendored md5 is current
	npm run validate
	npm run vendor
	git diff --exit-code -- extension/vendor

smoke: ## Load the extension in headless Chrome and check both UI languages
	npm run smoke

check: lint test validate smoke ## Run all checks (run before every commit)

vendor: ## Copy blueimp-md5 from node_modules into the extension
	npm run vendor

icons: ## Render the extension icons from assets/
	npm run icons

zip: ## Package the extension as dist/spaeter.zip
	mkdir -p dist
	rm -f dist/spaeter.zip
	cd extension && zip -qr ../dist/spaeter.zip .
