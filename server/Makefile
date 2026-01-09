.PHONY: format check-format type-check test install-dev

# Format code with black
format:
	black app/ tests/

# Check formatting without making changes
check-format:
	black --check app/ tests/

# Run type checking with mypy
type-check:
	mypy app/ --config-file mypy.ini

# Run tests
test:
	pytest

# Run tests with verbose output
test-verbose:
	pytest -v

# Install development dependencies
install-dev:
	pip install -r requirements.txt

# Run all checks (formatting, type checking, tests)
check-all: check-format type-check test

