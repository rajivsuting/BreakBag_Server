const mongoose = require("mongoose");
const Counter = require("../models/Counter"); // Adjust path if necessary

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `MongoDB Connected: ${connection.connection.host} ${connection.connection.name}`
    );

    // Initialize the Counter model for tripId
    const sequenceName = "tripIdCounter";
    const counterExists = await Counter.findOne({ sequenceName });

    if (!counterExists) {
      await Counter.create({ sequenceName, sequenceValue: 0 });
      console.log(`Counter "${sequenceName}" initialized.`);
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
