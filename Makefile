.PHONY: docker docker-dev docker-run-dev

docker:
	docker build --no-cache -t proycon/flat .

docker-dev:
	docker build --no-cache -t proycon/flat:dev .

docker-run-dev:
	docker run -t -i -p 8080:80 --env FLAT_DEBUG=1 proycon/flat:dev
