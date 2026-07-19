
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://admin:admin@ac-ulg7mtt-shard-00-00.grz3mpe.mongodb.net:27017,ac-ulg7mtt-shard-00-01.grz3mpe.mongodb.net:27017,ac-ulg7mtt-shard-00-02.grz3mpe.mongodb.net:27017/technicianDB?ssl=true&replicaSet=atlas-zayhks-shard-0&authSource=admin&appName=Cluster0");

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;