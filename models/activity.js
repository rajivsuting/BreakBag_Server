const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activitySchema = new Schema({
  title: {
    required: true,
    type: String,
    trim: true,
  },
  description: {
    required: true,
    type: String,
    trim: true,
  },
  images: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model("Activity", activitySchema);
