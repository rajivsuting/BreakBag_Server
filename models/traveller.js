const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const travellerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email address",
    ],
  },
  phone: {
    type: String,
    match: [/^\+?\d{10,15}$/, "Please provide a valid phone number"],
  },
  address: {
    type: String,
    required: true,
  },

  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value < new Date();
      },
      message: "Date of birth must be a past date",
    },
  },

  userType: {
    type: String,
    enum: ["Adult", "Child"],
    required: true,
  },

  agentAssigned: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

module.exports = mongoose.model("Traveller", travellerSchema);
