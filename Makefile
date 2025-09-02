.PHONY: env build rebuild recreate

env:
	@if [ ! -f .env.$(STAGE) ]; then \
		echo "❌ File .env.$(STAGE) does not exist!"; \
		exit 1; \
	fi; \
	cp -f .env.$(STAGE) .env; \
	echo "✅ Copied .env.$(STAGE) → .env"

pull:
	git pull origin

build:
	docker build -f ./ci/Dockerfile -t api-img:1.0.0 --no-cache .

rebuild:
	docker build -f ./ci/Dockerfile -t api-img:1.0.0 .

recreate:
	docker compose -f docker-compose.yml --compatibility up -d --force-recreate

