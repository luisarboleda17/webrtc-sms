
const Mongoose = require('mongoose');

const modelOptions = {
  id: true,
  minimize: true,
  strict: true,
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
};

module.exports = {
  meeting: require('./meeting')(Mongoose, modelOptions),
  group: require('./group')(Mongoose, modelOptions)
};