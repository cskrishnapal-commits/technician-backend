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
    }

});

module.exports = mongoose.model("Customer", customerSchema);