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
  destination: {
    type: Schema.Types.ObjectId,
    ref: "Destination",
  },
});

module.exports = mongoose.model("OtherInformation", otherInformationSchema);
