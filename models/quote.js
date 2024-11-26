const mongoose = require("mongoose");
const Counter = require("./Counter");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const quoteSchema = new Schema(
  {
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
      unique: true, // Example format: TRIP-0001
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
    comments: [commentSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    itenerary: {
      type: Object,
    },

    numberChildTravellers: {
      type: Number,
      required: true,
      min: 0,
    },
    numberOfAdultTravellers: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

quoteSchema.pre("save", async function (next) {
  if (!this.tripId) {
    const sequenceName = "tripIdCounter";

    // Find and increment the counter atomically
    const counter = await Counter.findOneAndUpdate(
      { sequenceName },
      { $inc: { sequenceValue: 1 } },
      { new: true }
    );

    if (!counter) {
      throw new Error(`Counter for "${sequenceName}" not found.`);
    }

    // Generate the tripId with leading zeros (e.g., TRIP-0001, TRIP-0002)
    const tripNumber = counter.sequenceValue.toString().padStart(4, "0");
    this.tripId = `TRIP-${tripNumber}`;
  }
  next();
});

module.exports = mongoose.model("Quote", quoteSchema);
