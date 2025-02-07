
# Developing

## Building

This project uses `npm` to run build scripts and other tasks. The scripts are a combination of JavaScript, Bash, and Python scripts. Webpack is used as a module bundler.

**`npm run build`**: Main build script cleans previous build directory, gets available imagery metadata via the [GIBS `GetCapabilities` API](https://wiki.earthdata.nasa.gov/display/GIBS/GIBS+API+for+Developers), adds the build configuration (options), and builds the Webpack bundle in Development mode. Generates the build in `build/`. If you have a custom configuration subdirectory, pass it to the command with `npm run build -- subdirectory_name`.

To build the app with an incomplete configuration, prefix the command like this:
`IGNORE_ERRORS=true npm run build`.

**`npm run build:dev`**: Builds the JavaScript and CSS bundles for the app in Development mode and writes them to `web/build/wv.js` and `web/build/wv.css`, respectively.

**`npm run build:prod`**: Builds the JavaScript and CSS bundles for the app in Production mode. This mode includes build optimizations for deployment performance.

**`npm run build:config`**: Builds the configuration (options) for the app in `build/options/`.

**`npm run build:tests`**: Builds a JavaScript bundle in `web/build/wv-test-bundle.js` for running tests.

**`npm run clean`**: Remove all files generated by the build.

**`npm run distclean`**: Remove all temporary files returning the repository to a pristine state.

**`npm run dist`**: Create a distribution tarball of the application in `dist/worldview.tar.gz` that can be unpacked on a web server.

**`npm run dist:dev`**: Create a development version of the distribution tarball.

## Development Tools

**`npm run analyze`**: Runs Webpack Bundle Analyzer to visualize size of output files with an interactive zoomable treemap. Default analyze interface is served at [http://127.0.0.1:8888/](http://127.0.0.1:8888/).

**`npm run watch`**: Builds and serves local Development mode Webpack bundle in watch mode using Webpack Dev Server (*Note: It is necessary to wait for the initial build to finish before being able to develop*). JS and CSS bundles are updated automatically when source files change. You must run `npm run build` or `npm run build:config` first to make a request to the GIBS `GetCapabilities` API and build the configuration files.
**`npm run watch:debug:logger`**: This will activate `redux-logger` which logs the before and after state of each action.
**`npm run watch:debug:devtools`**: This will activate `redux-devtools` which allows using a browser extension to debug Redux state.

## Starting

**`npm start`**: Starts the app for local development. Express serves the contents of the `web/` directory. Open [http://localhost:3000](http://localhost:3000) to view in the browser. For advanced usage, edit `tasks/start.js` to serve the `build/site-worldview/` directory instead, which includes string placeholder replacements.
