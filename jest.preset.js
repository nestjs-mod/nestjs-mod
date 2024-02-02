const nxPreset = require('@nx/jest/preset').default;

module.exports = { ...nxPreset, testTimeout: 15000 };
