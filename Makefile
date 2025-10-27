.PHONY: run build clean install help

# Variables
BINARY_NAME=iraven-admin
BUILD_DIR=bin
MAIN_PATH=cmd/admin/main.go

## help: Display this help message
help:
	@echo "Available commands:"
	@echo "  make run        - Run the application in development mode"
	@echo "  make build      - Build the production binary"
	@echo "  make clean      - Remove build artifacts"
	@echo "  make install    - Install Go dependencies"
	@echo "  make test       - Run tests"
	@echo "  make dev        - Run with hot reload (requires air)"

## run: Run the application
run:
	go run $(MAIN_PATH)

## build: Build the production binary
build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "Build complete: $(BUILD_DIR)/$(BINARY_NAME)"

## clean: Remove build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR)
	@echo "Clean complete"

## install: Install Go dependencies
install:
	@echo "Installing dependencies..."
	go mod download
	go mod tidy
	@echo "Dependencies installed"

## test: Run tests
test:
	go test -v ./...

## dev: Run with hot reload (requires air)
dev:
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "Air is not installed. Install it with: go install github.com/cosmtrek/air@latest"; \
		echo "Or run 'make run' for normal development mode."; \
	fi
