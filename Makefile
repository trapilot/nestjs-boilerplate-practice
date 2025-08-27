.PHONY: env build rebuild recreate

env:
	@read -p "Are you sure you want to clone .env.staging? (y/n) " confirm; \
	if [ "$$confirm" = "y" ]; then \
		cp -f .env.staging .env; \
	fi

pull:
	git pull origin

build:
	docker build ./deploy -t api-img:1.0.0 --no-cache

rebuild:
	docker build ./deploy -t api-img:1.0.0

recreate:
	docker compose ./deploy --compatibility up -d --force-recreate
