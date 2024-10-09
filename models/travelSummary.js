const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const travelSummary = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },

  destination: {
    type: Schema.Types.ObjectId,
    ref: "Destination",
  },
});

module.exports = mongoose.model("TravelSummary", travelSummary);
