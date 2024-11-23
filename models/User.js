const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  role: {
    type: String,
    enum: ["Admin", "Agent", "Team Lead"],
    required: true,
  },
  teamLead: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  otp: String,
  otpExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

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
