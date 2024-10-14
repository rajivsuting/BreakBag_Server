const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otherInformationSchema = new Schema({
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

otherInformationSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("OtherInformation", otherInformationSchema);
