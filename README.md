# Deploy to Fly.io

## Postgres

`fly launch`

Edit the `fly.toml` with whats in

Postgres also needs a static ipv4, it costs $2 per month but that's ok.  
Provision a static ipv4 with `fly ips allocate-v4`

Now, we actually need a persistent volume, or else our data will just be lost next time we redeploy this.

`fly volumes create pgdata`

Then add this at the end of your `fly.toml` to bind the volume

```toml
[mounts]
  source = "pgdata"
  destination = "/var/lib/postgresql"
```

Now redeploy to activate this new configuration  
`fly deploy`

## Automating the deploy
