.PHONY: help install dev build start test clean lint format media-test git-init commit push

# Default target - show help
help:
	@echo "🎉 Wedding Gallery - Makefile Commands"
	@echo ""
	@echo "🚀 Development:"
	@echo "  make dev              - Start development server (http://localhost:3000)"
	@echo "  make build            - Build for production"
	@echo "  make start            - Run production server"
	@echo ""
	@echo "📦 Setup & Dependencies:"
	@echo "  make install          - Install npm dependencies"
	@echo "  make clean            - Remove node_modules and build artifacts"
	@echo "  make clean-cache      - Clear Next.js cache"
	@echo ""
	@echo "🎬 Local Media:"
	@echo "  make media-create     - Create test media files in public/media/"
	@echo "  make media-test       - Test local media API (requires running server)"
	@echo ""
	@echo "💻 Code Quality:"
	@echo "  make lint             - Run TypeScript type checking"
	@echo "  make format           - Format code with Prettier (if available)"
	@echo ""
	@echo "🔧 Git & Commits:"
	@echo "  make git-init         - Initialize git repo (if not already done)"
	@echo "  make commit msg=MSG   - Add all changes and commit (e.g., make commit msg='Add feature')"
	@echo "  make log              - Show git commit history"
	@echo "  make status           - Show git status"
	@echo ""
	@echo "🛑 Controls:"
	@echo "  make kill             - Stop all Node.js servers"
	@echo "  make restart          - Kill and restart dev server"
	@echo ""
	@echo "ℹ️  Examples:"
	@echo "  make dev              - Start coding!"
	@echo "  make build            - Prepare for deployment"
	@echo "  make clean            - Fresh start"

# Development
dev:
	npm run dev

build:
	npm run build

start:
	npm start

test:
	@echo "No tests configured yet"

# Setup
install:
	npm install

clean:
	rm -rf node_modules .next build dist *.log
	@echo "✓ Cleaned up node_modules and build artifacts"

clean-cache:
	rm -rf .next/cache
	@echo "✓ Cleared Next.js cache"

# Media
media-create:
	node scripts/create-test-media.js

media-test:
	node scripts/test-local-media.js

# Code Quality
lint:
	npx tsc --noEmit
	@echo "✓ TypeScript type checking passed"

format:
	@command -v prettier >/dev/null 2>&1 && prettier --write . || echo "Prettier not installed. Run: npm install -D prettier"

# Git
git-init:
	@if [ ! -d .git ]; then \
		git init && \
		git config user.name "Nicolas Renard" && \
		git config user.email "nicolas@wedding-gallery.local" && \
		echo "✓ Git initialized"; \
	else \
		echo "✓ Git already initialized"; \
	fi

commit:
	@if [ -z "$(msg)" ]; then \
		echo "❌ Error: Please provide a message with 'msg=' parameter"; \
		echo "   Example: make commit msg='Add feature'"; \
		exit 1; \
	fi
	git add -A
	git commit -m "$(msg)"
	@echo "✓ Committed: $(msg)"

log:
	git log --oneline -10

status:
	git status

# Controls
kill:
	@echo "🛑 Stopping servers..."
	@ps aux | grep -E 'node|npm|next' | grep -v grep | awk '{print $$2}' | xargs kill -9 2>/dev/null || true
	@lsof -i :3000 -i :3001 2>/dev/null | grep LISTEN | awk '{print $$2}' | xargs kill -9 2>/dev/null || true
	@echo "✓ All Node.js/npm servers stopped"

restart: kill dev

# Production Build & Deploy
verify:
	@echo "🔍 Running pre-deployment checks..."
	npm run build
	@echo "✓ All checks passed!"

# Show version info
info:
	@echo "📋 Project Information:"
	@echo "  Node: $$(node --version)"
	@echo "  npm: $$(npm --version)"
	@echo "  Next.js: $$(grep '\"next\"' package.json | head -1)"
	@echo "  Git: $$(git --version || echo 'Not initialized')"

# Development shortcuts
dev-fresh: clean install dev

build-fresh: clean install build

# Port check
port-check:
	@echo "🔍 Checking ports..."
	@lsof -i :3000 >/dev/null 2>&1 && echo "✓ Port 3000 is in use" || echo "Port 3000 is free"
	@lsof -i :3001 >/dev/null 2>&1 && echo "✓ Port 3001 is in use" || echo "Port 3001 is free"
