# Mutable.ai CLI

V1 of this CLI client is mostly for syncing changes made on the webapp (app.mutable.ai) to your local development environment.

## Prerequisites

-   To run the CLI, you need to have Node.js installed
-   Optional: if you are planning to build from source, you need to install Webpack
-   You need to have `git` CLI setup

## Installation guide

### Step 1. Build the script locally.

`$ npm install`

`$ npm run build`

The minified script will be generated in the `cli/build/cli.js`

### Step 2. Setup environment

`$ touch ~/.mutableai`

Setup `~/.mutableai`

```
USER_EMAIL=<account you used to sign in>
USER_KEY=<key you generated in the webapp>
```

Installing from NPM is coming soon.
