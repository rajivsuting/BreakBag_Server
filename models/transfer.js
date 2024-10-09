const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transferSchema = new Schema({
  description: {
    type: [String],
    required: true,
  },
  destination: {
    type: Schema.Types.ObjectId,
    ref: "Destination",
  },
});

module.exports = mongoose.model("Transfer", transferSchema);
