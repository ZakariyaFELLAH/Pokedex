.PHONY: start,stop,build,restart,logs,ps

start:
	docker compose up -d

stop:
	docker compose down

build:
	docker compose build

restart: stop start

reset:
	docker compose down -v
	docker compose up -d

logs:
	docker compose logs -f

ps:
	docker compose ps