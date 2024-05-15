require("dotenv").config(); // load .env variables
const mongoose = require("mongoose"); // import fresh mongoose object
const { log } = require("mercedlogger"); // import merced logger

// destructure env variables
const { DATABASE_URL } = process.env;

// define connectDB function
const connectDB = async () => {
  try {
    await mongoose.connect(DATABASE_URL);
    log.green("DATABASE STATE", "Connection Open");
  } catch (error) {
    log.red("DATABASE STATE", error);
    throw error;
  }

  mongoose.connection.on("close", () => log.magenta("DATABASE STATE", "Connection Closed"));
};

// export the connectDB function
module.exports = connectDB;