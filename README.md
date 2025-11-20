# Deploy to Fly.io

Copy the `.github/workflows` folder and `infra` folder to your own repository. Push these changes up.

Login to your fly.io account.

In the fly.io Dashboard, click "Launch an App"
![launch](docs/launch.png)

Click `Select repository`

## Postgres

At a bare minimum, Postgres requires a `POSTGRES_PASSWORD` environment variable which has your superuser password.  
Because this is sensitive, this needs to be created as a secret in fly.io
`fly secrets set POSTGRES_PASSWORD=verysecret -c infra/fly-pg.toml`

For any non-sensitive environment variables, those can be safely set under the `[env]` section in `fly-pg.toml`  
e.g.

```toml
[env]
  POSTGRES_USER = "admin"
  POSTGRES_DB = "my-database"
```

Postgres also needs a static ipv4 for us, it costs $2 per month but that's ok.  
Provision a static ipv4 with `fly ips allocate-v4 -c infra/fly-pg.toml`

## Automating the deploy
