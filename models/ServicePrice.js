const mongoose = require("mongoose");

const servicePriceSchema = new mongoose.Schema({

    technicianId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Technician",

        required: true

    },

    appliance: {

        type: String,

        required: true

    },

    problem: {

        type: String,

        required: true

    },

    price: {

        type: Number,

        required: true

    }

}, {

    timestamps: true

});

module.exports = mongoose.model(
    "ServicePrice",
    servicePriceSchema
);