# FeedHenry Drag & Drop Apps Template App v3

## Overview
This Template App is intended to work with the Drag & Drop Apps feature in the Red Hat Mobile Application Platform.

This Template App builds the [appforms-project-client](https://github.com/feedhenry/appforms-project-client) Template App.

It is based on Backbone and uses the $fh.forms.backbone SDK to render forms into the app.

To build:

    grunt

Produces a *dist* folder and *dist-dev* folder.

 - The *dist* folder contains the minified version of the template app.

## Development Guide

This Client App makes use of [Feedhenry JS SDK](https://github.com/feedhenry/fh-js-sdk). Specifically

 - The [Backbone Forms SDK](https://github.com/feedhenry/fh-js-sdk/blob/master/dist/appForms-backbone.js).
 - The [Core Forms SDK](https://github.com/feedhenry/fh-js-sdk/blob/master/dist/feedhenry-forms.js).


### Running Client App Locally

The Client App can be run locally using the following commands in the Client App directory:

1. `npm install`.
2. `grunt serve`.

### Developing With The Core SDK

When you want to change either the Backbone or Core forms SDK, it is easier to symlink the [Backbone Forms SDK](https://github.com/feedhenry/fh-js-sdk/blob/master/dist/appForms-backbone.js) and [Core Forms SDK](https://github.com/feedhenry/fh-js-sdk/blob/master/dist/feedhenry-forms.js) directly into you local directory.

1. Clone the source code for the Client App. (Fork This Repo)
2. Clone the [Feedhenry JS SDK](https://github.com/feedhenry/fh-js-sdk) locally.
3. Run `grunt build` on the *fh-js-sdk* to build the required SDK files.
4. Symlink `dist/feedhenry-forms.js` to `www/feedhenry.js`.
5. Symlink `dist/appForms-backbone.js` to `www/lib/appform-backbone.js`.
6. Run your app locally. When ever a change is made to the js-sdk, run `grunt build` again to update the symlinks and refresh the app. The symlinks will allow the changes to be reflected immediately.

### Running Cloud App Locally

It is possible to run the [Hello World Cloud App](https://github.com/feedhenry-templates/helloworld-cloud) locally and have the locally running Cloud App get forms/make submissions from the relevant mbaas.

1. Create a Hello World Cloud App in the Studio.
2. Deploy the Cloud App to an environment.
3. Once successful, the following environment variables are required. These can be found in the *Environment Variables* section of the Cloud App:
  4. FH_APPNAME
  5. FH_DOMAIN
  6. FH_ENV
  7. FH_INSTANCE
  8. FH_MBAAS_ENV_ACCESS_KEY
  9. FH_MBAAS_HOST
  10. FH_MBAAS_PROTOCOL
  11. FH_WIDGET
  12. FH_APP_API_KEY
13. Place the Environment Variables in the `Gruntfile.js` file of your local Cloud App in the `env.local` section of the config.
14. In the local Cloud App, run `grunt serve:local` to initialise the Cloud App.

### Running Client App In The RHMAP Studio

This client app already has the correct structure to be imported directly into the RHMAP Studio. Simply follow the [App Import Guide](http://docs.feedhenry.com/v3/guides/app_import.html).
