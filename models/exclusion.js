const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exclusionSchema = new Schema({
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

exclusionSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Exclusion", exclusionSchema);
