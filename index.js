// Re-export the existing JS Agent module as a Node-style package entry.
// (This is here so your existing structure remains untouched; Flutter app lives in /flutter_app)
module.exports = require('./src/Agent');
