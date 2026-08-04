# ── Apostilas build system ───────────────────────────────────────────────────
# Usage:
#   make              — compile all apostilas
#   make all          — same as above
#   make com          — compile a single apostila
#   make clean        — remove generated output/
#   make slides       — generate slides for all apostilas
#   make slides com   — generate slides for one apostila
#   make html-to-pdf  — convert HTML to PDF (all apostilas)
#   make pdf com      — convert HTML to PDF (one apostila)
#   make test         — run tests
#   make lint         — syntax check compile.py

SHELL := /bin/bash
PYTHON := python3
SCRIPTS := $(abspath scripts)

# Apostilas known by directory name
APOSTILAS := com concurso eletromag emc

# ── Default: compile everything ──────────────────────────────────────────────
.PHONY: all
all: $(APOSTILAS)

# ── Compile a single apostila ────────────────────────────────────────────────
define COMPILE_APOSTILA
.PHONY: $(1)
$(1):
	@echo "=== Compiling $(1) ===" && \
	$(PYTHON) $(SCRIPTS)/compile_apostila.py $(1)
endef

$(foreach apostila,$(APOSTILAS),$(eval $(call COMPILE_APOSTILA,$(apostila))))

# ── Compile slides for an apostila ───────────────────────────────────────────
define SLIDES_APOSTILA
.PHONY: slides-$(1)
slides-$(1):
	@echo "=== Slides $(1) ===" && \
	$(PYTHON) $(SCRIPTS)/slides_apostila.py $(1)
endef

$(foreach apostila,$(APOSTILAS),$(eval $(call SLIDES_APOSTILA,$(apostila))))

.PHONY: slides
slides: $(patsubst %,slides-%,$(APOSTILAS))

# ── HTML to PDF ──────────────────────────────────────────────────────────────
.PHONY: html-to-pdf
html-to-pdf: $(patsubst %,pdf-%,$(APOSTILAS))

define PDF_APOSTILA
.PHONY: pdf-$(1)
pdf-$(1):
	@echo "=== PDF $(1) ===" && \
	if [ -f $(1)/output/index.html ]; then \
		$(PYTHON) $(abspath shared/html-to-pdf.js) $(1)/output/index.html $(1)/output/$(1).pdf; \
		echo "  ✓ $(1)/output/$(1).pdf"; \
	else \
		echo "  $(1)/output/index.html not found. Run 'make $(1)' first."; \
		exit 1; \
	fi
endef

$(foreach apostila,$(APOSTILAS),$(eval $(call PDF_APOSTILA,$(apostila))))

# ── Clean ────────────────────────────────────────────────────────────────────
.PHONY: clean
clean:
	@echo "=== Cleaning ==="
	@for dir in $(APOSTILAS); do \
		if [ -d "$$dir/output" ]; then \
			rm -rf "$$dir/output"; \
			echo "  Removed $$dir/output/"; \
		fi; \
		if [ -d "$$dir/slides" ]; then \
			rm -rf "$$dir/slides"; \
			echo "  Removed $$dir/slides/"; \
		fi; \
	done
	@find . -name '*.pyc' -delete 2>/dev/null
	@find . -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "  ✓ Cleaned"

# ── Tests ────────────────────────────────────────────────────────────────────
.PHONY: test
test:
	@echo "=== Running tests ==="
	$(PYTHON) -m pytest shared/tests/ -v 2>/dev/null || \
	$(PYTHON) shared/tests/test_compile_headings.py
	@echo "  ✓ Tests passed"

# ── Lint / syntax check ─────────────────────────────────────────────────────
.PHONY: lint
lint:
	@echo "=== Lint compile.py ==="
	$(PYTHON) -m py_compile shared/compile.py
	$(PYTHON) -m py_compile shared/md2slide.py
	$(PYTHON) -m py_compile scripts/compile_apostila.py
	$(PYTHON) -m py_compile scripts/slides_apostila.py
	@echo "  ✓ Syntax OK"
