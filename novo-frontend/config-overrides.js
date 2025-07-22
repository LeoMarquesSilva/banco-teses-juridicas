// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config, env) {
  // Adicionar fallbacks para módulos do Node.js
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "process/browser": require.resolve("process/browser"),
    "process": require.resolve("process/browser"),
  };

  // Adicionar plugins para fornecer process global
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  );

  return config;
}
