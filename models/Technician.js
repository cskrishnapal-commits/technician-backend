const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    service: String,
    experience: String,
    city: String,
    address:String
});

module.exports = mongoose.model(
    "Technician",
    technicianSchema
);