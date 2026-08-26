const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({

    name: String,

    email: String,

    phone: String,

    password: String,

    city: {
        type: String,
        default: ""
    },

    address: {
        type: String,
        default: ""
    },

    profileImage: {
        type: String,
        default: ""
    },

    // Customer current location
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

customerSchema.index({
    location: "2dsphere"
});

module.exports = mongoose.model(
    "Customer",
    customerSchema
);