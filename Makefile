.PHONY: help install lint test validate smoke check vendor icons zip shortcuts shortcuts-compile

# Cherri compiles the iPhone Shortcut (ios/*.cherri). Built from source at this tag, because
# its Go module path prevents `go run …@v2`. Renovate updates it (see renovate.json).
CHERRI_VERSION := v2.3.0
CHERRI := .cache/cherri-$(CHERRI_VERSION)/cherri

help: ## Show available targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "  %-18s %s\n", $$1, $$2}'

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

shortcuts: shortcuts-compile ## Build and sign the iPhone Shortcut ios/Später.shortcut (macOS only)
	shortcuts sign --mode anyone --input "build/Später_unsigned.shortcut" --output build/signed.shortcut
	# `shortcuts sign` stores "ä" decomposed (NFD); copying creates the composed name git expects.
	rm -f "ios/Später.shortcut"
	cp build/signed.shortcut "ios/Später.shortcut"
	node scripts/shortcut-lock.mjs --write

shortcuts-compile: $(CHERRI) ## Compile the iPhone Shortcut unsigned into build/ (any OS)
	npm run --silent shortcut-rules
	mkdir -p build
	$(CHERRI) ios/spaeter.cherri --skip-sign --no-ansi
	mv "ios/Später_unsigned.shortcut" "build/Später_unsigned.shortcut"

# --skip-sign above: without it, Cherri falls back to uploading the Shortcut to a
# third-party signing service whenever macOS signing fails. We sign with `shortcuts` instead.
$(CHERRI):
	rm -rf .cache/cherri-src
	git clone --quiet --depth 1 --branch $(CHERRI_VERSION) https://github.com/electrikmilk/cherri.git .cache/cherri-src
	cd .cache/cherri-src && go build -o ../cherri-$(CHERRI_VERSION)/cherri .
	rm -rf .cache/cherri-src
