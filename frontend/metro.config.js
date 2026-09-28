const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

try {
  config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    buffer: require.resolve('buffer'),
  };
} catch (e) {}

module.exports = config;
