const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "buffer": require.resolve("buffer/"),
          "crypto": require.resolve("crypto-browserify"),
          "stream": require.resolve("stream-browserify"),
          "path": require.resolve("path-browserify"),
          "util": require.resolve("util/"),
          "http": require.resolve("stream-http"),
          "url": require.resolve("url/"),
          "https": require.resolve("https-browserify"),
          "zlib": require.resolve("browserify-zlib"),
          "assert": require.resolve("assert/"),
          "fs": false,
          "process": require.resolve("process/browser.js")
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer']
        })
      ]
    }
  }
};
