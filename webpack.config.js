const Encore = require("@symfony/webpack-encore");
const path = require("path");

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || "dev");
}

Encore
  // directory where compiled assets will be stored
  .setOutputPath("public/build/")
  // public path used by the web server to access the output path
  .setPublicPath("/build")
  // only needed for CDN's or sub-directory deploy
  //.setManifestKeyPrefix('build/')

  /*
   * ENTRY CONFIG
   *
   * Each entry will result in one JavaScript file (e.g. app.js)
   * and one CSS file (e.g. app.css) if your JavaScript imports CSS.
   */
  .addEntry("app", "./assets/app.js")

  // enables the Symfony UX Stimulus bridge (used in assets/bootstrap.js)
  //.enableStimulusBridge("./assets/controllers.json")

  // When enabled, Webpack "splits" your files into smaller pieces for greater optimization.
  .splitEntryChunks()

  // will require an extra script tag for runtime.js
  // but, you probably want this, unless you're building a single-page app
  .enableSingleRuntimeChunk()

  /*
   * FEATURE CONFIG
   *
   * Enable & configure other features below. For a full
   * list of features, see:
   * https://symfony.com/doc/current/frontend.html#adding-more-features
   */
  .cleanupOutputBeforeBuild()
  .enableBuildNotifications()
  .enableSourceMaps(!Encore.isProduction())
  // enables hashed filenames (e.g. app.abc123.css)
  .enableVersioning(Encore.isProduction())

  .configureBabel((config) => {
    config.plugins.push("@babel/plugin-proposal-class-properties");
  })

  // enables @babel/preset-env polyfills
  .configureBabelPresetEnv((config) => {
    config.useBuiltIns = "usage";
    config.corejs = 3;
  })

  // enables Sass/SCSS support
  .enableSassLoader()

  .enablePostCssLoader()

  .enablePreactPreset({
    preactCompat: true,
  })

  .configureBabel((config) => {
    // Find the "@babel/plugin-transform-react-jsx" plugin among babel plugins
    const transformReactJsxPlugin = config.plugins.find(
      (p) =>
        p instanceof Array && p.includes("@babel/plugin-transform-react-jsx")
    );

    // Add option to this plugins
    transformReactJsxPlugin.push({
      pragma: "h",
      pragmaFrag: "Fragment",
    });

    // Add another plugin to auto import "h" in .jsx files
    config.plugins.push([
      "babel-plugin-jsx-pragmatic",
      {
        module: "preact",
        import: "h, Fragment",
        export: "h, Fragment",
      },
    ]);
  });

// .configureDevServerOptions((options) => {
//   options.https = {
//     pfx: path.join(process.env.HOME, ".symfony/certs/default.p12"),
//   };
// });

// uncomment if you use TypeScript
//.enableTypeScriptLoader()

// uncomment if you use React
//.enableReactPreset()

// uncomment to get integrity="..." attributes on your script & link tags
// requires WebpackEncoreBundle 1.4 or higher
//.enableIntegrityHashes(Encore.isProduction())

// uncomment if you're having problems with a jQuery plugin
//.autoProvidejQuery()

module.exports = Encore.getWebpackConfig();
