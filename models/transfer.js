const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transferSchema = new Schema({
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

transferSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Transfer", transferSchema);
