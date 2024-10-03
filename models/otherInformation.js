const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const item = new Schema({
  title: {
    required: true,
    type: String,
    trim: true,
  },

  description: {
    type: [String],
    required: true,
  },
});

const otherInformationSchema = new Schema({
  itemList: {
    type: [item],
    required: true,
  },
});

module.exports = mongoose.model("OtherInformation", otherInformationSchema);
