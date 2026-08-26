const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ServicePrice = require("../models/ServicePrice");
const Technician = require("../models/Technician");


// ======================================================
// REGISTER CUSTOMER
// ======================================================

const registerCustomer = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;


        const existingCustomer =
            await Customer.findOne({ email });


        if (existingCustomer) {

            return res.status(400).json({

                message: "Email already registered"

            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const customer = await Customer.create({

            name,
            email,
            phone,
            password: hashedPassword

        });


        res.status(201).json({

            message: "Registration Successful"

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};


// ======================================================
// LOGIN CUSTOMER
// ======================================================

const loginCustomer = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        const customer =
            await Customer.findOne({ email });


        if (!customer) {

            return res.status(400).json({

                message: "Customer not found"

            });

        }


        const isMatch =
            await bcrypt.compare(
                password,
                customer.password
            );


        if (!isMatch) {

            return res.status(400).json({

                message: "Invalid Password"

            });

        }


        const token =
            jwt.sign(

                {
                    id: customer._id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


        res.status(200).json({

            message: "Login Successful",

            token,

            customer

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};


// ======================================================
// GET NEARBY TECHNICIANS
// ======================================================

const getAllTechnicians = async (req, res) => {

    try {

        const {
            appliance,
            problem,
            latitude,
            longitude,
            maxDistance
        } = req.query;


        // ==================================================
        // LOCATION REQUIRED
        // ==================================================

        if (
            latitude === undefined ||
            longitude === undefined ||
            latitude === "" ||
            longitude === ""
        ) {

            return res.status(400).json({

                message:
                    "Customer location is required"

            });

        }


        const userLatitude =
            Number(latitude);

        const userLongitude =
            Number(longitude);


        if (
            Number.isNaN(userLatitude) ||
            Number.isNaN(userLongitude)
        ) {

            return res.status(400).json({

                message:
                    "Invalid location coordinates"

            });

        }


        // ==================================================
        // DEFAULT SEARCH DISTANCE
        // 20 KM
        // ==================================================

        const distance =
            Number(maxDistance) || 20000;


        // ==================================================
        // APPLIANCE → TECHNICIAN SERVICE
        // ==================================================

        let serviceName = "";


        switch (appliance) {

            case "AC":
                serviceName = "AC Repair";
                break;

            case "Refrigerator":
                serviceName = "Refrigerator Repair";
                break;

            case "Washing Machine":
                serviceName = "Washing Machine Repair";
                break;

            case "Cooler":
                serviceName = "Cooler Repair";
                break;

            case "TV Repair":
                serviceName = "TV Repair";
                break;

            case "Electrician":
                serviceName = "Electrician";
                break;

            default:
                serviceName = appliance;

        }


        // ==================================================
        // NEARBY TECHNICIAN QUERY
        // ==================================================

        const query = {

            location: {

                $near: {

                    $geometry: {

                        type: "Point",

                        coordinates: [

                            userLongitude,
                            userLatitude

                        ]

                    },

                    $maxDistance: distance

                }

            }

        };


        // Only selected appliance/service
        if (serviceName) {

            query.service = serviceName;

        }


        const technicians =
            await Technician.find(query)
                .select("-password -__v");


        const result = [];


        // ==================================================
        // PROCESS TECHNICIANS
        // ==================================================

        for (const tech of technicians) {


            // Get ALL prices of this technician
            const servicePrices =
                await ServicePrice.find({

                    technicianId: tech._id

                });


            // ==================================================
            // PROBLEM SELECTED
            // ==================================================

            if (
                problem &&
                problem.trim() !== ""
            ) {

                const matchingPrice =
                    servicePrices.find(

                        (item) =>

                            item.appliance === appliance &&
                            item.problem === problem

                    );


                // Technician has not set
                // price for selected problem
                if (!matchingPrice) {

                    continue;

                }


                result.push({

                    _id: tech._id,

                    name: tech.name,

                    email: tech.email,

                    phone: tech.phone,

                    age: tech.age,

                    city: tech.city,

                    experience:
                        tech.experience,

                    service:
                        tech.service,

                    address:
                        tech.address,

                    // Selected problem price
                    price:
                        matchingPrice.price,

                    // Keep price list available
                    // for profile
                    servicePrices:
                        servicePrices,

                    location:
                        tech.location

                });

            }


            // ==================================================
            // NO PROBLEM SELECTED
            // ==================================================

            else {

                result.push({

                    _id: tech._id,

                    name: tech.name,

                    email: tech.email,

                    phone: tech.phone,

                    age: tech.age,

                    city: tech.city,

                    experience:
                        tech.experience,

                    service:
                        tech.service,

                    address:
                        tech.address,

                    price: null,

                    // All technician prices
                    servicePrices:
                        servicePrices,

                    location:
                        tech.location

                });

            }

        }


        // ==================================================
        // RESPONSE
        // ==================================================

        res.status(200).json({

            count: result.length,

            technicians: result

        });

    }


    catch (error) {

        console.log(
            "Nearby Technician Error:",
            error
        );


        res.status(500).json({

            message:
                error.message

        });

    }

};

// ======================================================
// GET CUSTOMER PROFILE
// ======================================================

const getCustomerProfile = async (req, res) => {

    try {

        const customer =
            await Customer.findById(
                req.params.id
            ).select("-password");


        if (!customer) {

            return res.status(404).json({

                message:
                    "Customer not found"

            });

        }


        res.status(200).json(customer);

    }

    catch (error) {

        res.status(500).json({

            message:
                error.message

        });

    }

};


// ======================================================
// UPDATE CUSTOMER PROFILE
// ======================================================

const updateCustomerProfile = async (req, res) => {

    try {

        const {
            name,
            phone,
            city,
            address,
            latitude,
            longitude
        } = req.body;


        const customer =
            await Customer.findById(
                req.params.id
            );


        if (!customer) {

            return res.status(404).json({

                message:
                    "Customer not found"

            });

        }


        customer.name =
            name;

        customer.phone =
            phone;

        customer.city =
            city;

        customer.address =
            address;


        // ==================================================
        // SAVE CUSTOMER LOCATION
        // MongoDB GeoJSON format:
        // [longitude, latitude]
        // ==================================================

        if (
            latitude !== undefined &&
            longitude !== undefined &&
            !Number.isNaN(Number(latitude)) &&
            !Number.isNaN(Number(longitude))
        ) {

            customer.location = {

                type: "Point",

                coordinates: [

                    Number(longitude),

                    Number(latitude)

                ]

            };

        }


        await customer.save();


        // Return updated customer

        const updatedCustomer =
            await Customer.findById(
                customer._id
            ).select("-password");


        res.status(200).json({

            message:
                "Profile Updated Successfully",

            customer:
                updatedCustomer

        });

    }

    catch (error) {

        console.log(
            "Customer Profile Update Error:",
            error
        );


        res.status(500).json({

            message:
                error.message

        });

    }

};

// ======================================================
// EXPORT
// ======================================================

module.exports = {

    registerCustomer,

    loginCustomer,

    getAllTechnicians,

    getCustomerProfile,

    updateCustomerProfile

};