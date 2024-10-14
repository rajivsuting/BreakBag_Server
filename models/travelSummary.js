const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const travelSummarySchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Creating a text index on both title and description
travelSummarySchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("TravelSummary", travelSummarySchema);
