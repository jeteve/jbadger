## JBadger

A Chrome plugin that will show Jira issue and ticket plain text as badges in webpages of your choice.

Available from the Chrome extension store. 

Make sure to configure your Jira instance url in the options page after installing. 
You can find the settings by clicking on the extensions icon and selecting options !

You can also add new domains by clicking on the extension icon or in the option menu. 

### Features
- Turns Jira keys (like XX-1234) into rich badges.

# Development

## In devcontainer

Open this with VScode and build the devcontainer

### Building/Running local version

```sh
npm install
npx webpack-cli build --mode development
```

Or if you want to continuously rebuild:

```sh
npx webpack-cli watch --mode development
```

Then install your local version of the plugin following this guide https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world

### Building for release/production

This will be much slower.

```sh
npx webpack-cli build --mode production
```


# Acknowledgments

This software package originates and is substantially inspired from https://github.com/helmus/Jira-Hot-Linker.
