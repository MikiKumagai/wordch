module.exports = {
  resolve: {
    fallback: {
      "net": false,
      "tls": false,
      "fs": false,
      "util": require.resolve("util/"),
      "path": require.resolve("path-browserify"),
    }
  }
};