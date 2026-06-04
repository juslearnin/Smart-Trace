const mongoose = require("mongoose");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { isDbConnected };
