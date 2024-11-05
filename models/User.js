const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true }, // Adding name for user identification
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true }, // Add phone for OTP verification
  role: {
    type: String,
    enum: ["Admin", "Agent", "Team Lead"],
    required: true,
  },
  teamLead: {
    // Will be populated if the user is an Agent and assigned a Team Lead
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  otp: String,
  otpExpiry: Date, // Field for storing OTP expiration time
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp for when the user is created
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Timestamp for tracking last update
  },
});

// Middleware to automatically update 'updatedAt' on save
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", userSchema);

/*destination- search by title
travellers-  search by name
agents - pagination + search by name
transfer - correct search
*/
