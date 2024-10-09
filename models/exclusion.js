const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exclusionSchema = new Schema({
  description: {
    type: [String],
    required: true,
  },
  destination: {
    type: Schema.Types.ObjectId,
    ref: "Destination",
  },
});

module.exports = mongoose.model("Exclusion", exclusionSchema);
