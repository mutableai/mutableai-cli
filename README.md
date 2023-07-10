# Mutable.ai CLI

V1 of this CLI client is mostly for syncing changes made on the webapp (app.mutable.ai) to your local development environment.

## Prerequisites

-   To run the CLI, you need to have Node.js installed
-   You need to have `git` CLI setup

## Installation guide

### Step 1. Build the script locally.
```sh
$ npm install -g mutableai-cli
```

### Step 2. Setup environment

`$ touch ~/.mutableai.config`

Setup `~/.mutableai.config`

```
USER_EMAIL=<account you used to sign in>
USER_KEY=<key you generated in the webapp>
```

### Step 3. Connect to the webapp
Follow the instruction on the webapp. An example command is:

`$ mutable.ai sync <session id>`
