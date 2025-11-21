# Install the flyctl cli tool

https://fly.io/docs/flyctl/install/

# Deploy to Fly.io

Login to your fly.io account.  
Download the `flyctl` cli tool: https://fly.io/docs/flyctl/install/  
Run `fly auth login`

Let's launch a simple app in your team's organization to start.  
I'll be using team jahc's org, but you should change this to whichever org/team you're on.  
`fly launch -o seng-401-team-jahc`

> [!TIP]
> To find your org name, click on Account > Organizations in the top right of the fly.io dashboard.

When asked to tweak settings, say yes. This will open a browser window for you to enter custom values.

Let's give our app a unique name. I would suggest starting with deploying your postgres server, so you can call it something appropriate for that.  
Set the port to `5432`  
Give the minimum memory amount (256mb).  
Make sure to select `none` for Managed Postgres, we do NOT want this.  
Ignore the rest of the settings and click confirm.  
This will generate a new fly.toml file with your new app name.

Override all settings with the contents in `fly-pg.toml` except for the app name. Next, we'll configure this file specifically for your setup and deploy Postgres.  
Also copy over the `Dockerfile-pg` file into the same directory as your `fly-pg.toml` file.

## Postgres

Now that we have an initial app created, let's customize it.

For any non-sensitive environment variables, those can be safely set under the `[env]` section in `fly-pg.toml`  
e.g.

```toml
[env]
  POSTGRES_USER = "admin"
  POSTGRES_DB = "my-database"
```

Now launch your brand new Postgres app  
`fly deploy -c fly-pg.toml`

Fly likes to give you 2 machines by default, this is overkill, let's scale it back to 1.  
`fly scale count 1 -c fly-pg.toml`

Postgres requires some sort of persistent data storage. We'll use fly.io volumes to do that, these will mount directly into your container.
Create a volume: `fly volumes create pgdata -c fly-pg.toml`

Postgres will probably fail on first launch, that's because it still needs 1 required secret.  
At a bare minimum, Postgres requires a `POSTGRES_PASSWORD` environment variable which has your superuser password.  
Because this is sensitive, this needs to be created as a secret in fly.io.  
`fly secrets set POSTGRES_PASSWORD=verysecret -c fly-pg.toml`

## Automating the deploy

Copy the `.github/workflows` folder into the root of your repo. This contains a `deploy-pg.yml` file that will be able to automatically redeploy the postgres database whenever there are changes pushed or PR'd into main.

In your Postgres app, find the `Tokens` menu item
![tokens](docs/tokens.png)

Create a new token, and copy this to your clipboard.

Then go into your Github repo settings, find the `Secrets and variables` section, and click on `Actions`  
![action secrets](docs/actions.png)

Click `new repository secret`  
Give your new secret a name of `FLY_API_TOKEN_PG` (this is what deploy-pg.yml is looking at, you can call it anything as long as they're the same). Paste your fly.io token in there and click `Add secret`

## Server + Web Client

Most of the above steps can be repeated for the server and the web client.
First launch an app under your org with the `fly launch...` command. Then customize the `fly-***.toml` and Dockerfiles.  
You probably don't need a persistent volume for any of them.

The `fly-server.toml` file in this repository is a good starter for your server, but you'll want to customize the environment variables to your liking.

This file will be pointing at `Dockerfile-server` to build, so you can either change this to point to your server's existing Dockerfile, or rename your server's Dockerfile to this.

Take an inventory of what kind of environment variables and secrets you need for your server/web client.  
For any secrets, you can run the `fly secrets...` command like we did above for Postgres.

For automatic deployment for the web, you will also need to add your own `deploy-web.yml` file, I have deploy yml files already for the database and the server as scaffolding.

## How are these networking together?

Fly allows for internal dns access to other applications.  
The example server in this repo connects to Postgres via it's fly app name with `.internal` appended. E.g. `pgtest-whatever-inc.internal`

This is currently set in the `fly-server.toml` file, yours will be different as you will have a unique app name. The hostname will follow the pattern of `<appname>.internal`

The server and the web will be exposed via HTTPS automatically by fly.io. This is what the `[http_service]` section is doing in each of those toml files, so we immediately get a public domain name to connect them.  
Your web layer will need to reference whatever domain is assigned to your server. Generally it will be in the form of `https://<appname>.fly.dev`

For this example server, it is `https://flytest-server-whatever-inc.fly.dev`
