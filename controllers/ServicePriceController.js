const ServicePrice = require("../models/ServicePrice.js");

// ----------------------
// Add New Service Price
// ----------------------

const addServicePrice = async (req, res) => {

    try {

        const service = await ServicePrice.create(req.body);

        res.status(201).json({
            message: "Service Price Added Successfully",
            service
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ----------------------
// Get All Service Prices
// ----------------------

const getServicePrices = async (req, res) => {

    try {

        const services = await ServicePrice.find({
            technicianId: req.params.technicianId
        });

        res.status(200).json(services);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ----------------------
// Delete Service Price
// ----------------------

const deleteServicePrice = async (req, res) => {

    try {

        await ServicePrice.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Service Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ----------------------
// Update Service Price
// ----------------------

const updateServicePrice = async (req, res) => {

    try {

        const updatedService =
            await ServicePrice.findByIdAndUpdate(

                req.params.id,

                req.body,

                {
                    new: true
                }

            );

        res.status(200).json({
            message: "Service Updated Successfully",
            updatedService
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {

    addServicePrice,

    getServicePrices,

    deleteServicePrice,

    updateServicePrice

};