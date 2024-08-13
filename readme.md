# Manifest

This repository holding code which author intent to put to production-ready state.


run db
```shell
docker run --name manifest -p 5432:5432 -e POSTGRES_PASSWORD=test -e POSTGRES_USER=test -e POSTGRES_DB=test -d postgres
```