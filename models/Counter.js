const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  sequenceName: {
    type: String,
    required: true,
    unique: true,
  },
  sequenceValue: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Prevent overwriting the model if it's already compiled
const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

module.exports = Counter;
