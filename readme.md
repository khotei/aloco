# Final Message 

```shell
docker run --name fm-postgres -p 5432:5432 -e POSTGRES_PASSWORD=test -e POSTGRES_USER=test -e POSTGRES_DB=test -d postgres
```

```shell
docker run --name fm-redis -p 6379:6379 -d redis
```

```shell
npm run dev
```