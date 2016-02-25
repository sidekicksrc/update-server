# Update server

Updates server is a simple node app that the app talks to when it wants to find out if there's a new version about.

The updates are hosted via nginx on a digital ocean box.

updates.sidekickjs.com = update server
releases.sidekickjs.com = release hosting

updates.sidekickjs.com/releases/latest?current_version=x.y.z
releases.sidekickjs.com/releases/x.y.z.zip


## Releasing a new version

```sh
VERSION=x.y.z LATEST_VERSION=1 scripts/release-version
```

this will release a version. set LATEST_VERSION to anything to make it the latest version.

## update server

### Config

Use heroku config variables.

### Deploy

`git push heorku master`

## release server

1. create a ubuntu box
2. run scripts/provision-release-server




