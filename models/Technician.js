const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema({

    name: String,

    email: String,

    phone: String,

    password: String,

    service: String,

    experience: String,

    age: {
        type: Number,
        default: null
    },

    city: String,

    address: String,

    // Technician current/service location
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },

        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    }

});

// Required for nearby location searching
technicianSchema.index({
    location: "2dsphere"
});

module.exports = mongoose.model(
    "Technician",
    technicianSchema
);