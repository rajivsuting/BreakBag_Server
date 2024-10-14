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

// Create a compound text index on both title and description
travelSummarySchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("TravelSummary", travelSummarySchema);
