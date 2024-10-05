const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const quoteSchema = new Schema({
  travellers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Traveller",
    },
  ],

  destination: {
    type: Schema.Types.ObjectId,
    ref: "Destination",
  },

  numberOfTravellers: {
    type: Number,
    required: true,
    min: 1,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  duration: {
    type: Number,
    required: true,
    min: 1,
  },

  tripId: {
    type: String,
    unique: true, //TRIP-0001
  },

  status: {
    type: String,
    enum: [
      "Active",
      "Quoted",
      "Follow Up",
      "Confirmed",
      "Cancelled",
      "CNP",
      "Groups",
    ],
    default: "Active",
    required: true,
  },
});

quoteSchema.pre("save", async function (next) {
  if (!this.tripId) {
    const count = await mongoose.model("Quote").countDocuments();

    // Generate the tripId with leading zeros (e.g., TRIP-0001, TRIP-0002)
    const tripNumber = (count + 1).toString().padStart(4, "0");
    this.tripId = `TRIP-${tripNumber}`;
  }
  next();
});

module.exports = mongoose.model("Quote", quoteSchema);
