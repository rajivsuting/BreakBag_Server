const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const item = new Schema({
//   title: {
//     required: true,
//     type: String,
//     trim: true,
//   },

//   description: {
//     type: [String],
//     required: true,
//   },
// });

const inclusionSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: [String],
    required: true,
  },
});

inclusionSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Inclusion", inclusionSchema);
