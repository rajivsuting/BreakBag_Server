const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activitySchema = new Schema({
  title: {
    required: true,
    type: String,
    trim: true,
  },
  description: {
    type: [String],
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  destination: {
    type: Schema.Types.ObjectId,
    ref: "Destination",
  },
});

module.exports = mongoose.model("Activity", activitySchema);
