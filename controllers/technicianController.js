const Technician = require("../models/Technician");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Technician

const registerTechnician = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password,
            service,
            experience,
            city
        } = req.body;

        const existingTechnician =
            await Technician.findOne({ email });

        if (existingTechnician) {

            return res.status(400).json({
                message: "Email already registered"
            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        await Technician.create({
            name,
            email,
            phone,
            password: hashedPassword,
            service,
            experience,
            city
        });

        res.status(201).json({
            message: "Registration Successful"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// Login Technician

const loginTechnician = async (req, res) => {

    try {

        const { email, password } = req.body;

        const technician =
            await Technician.findOne({ email });

        if (!technician) {

            return res.status(400).json({
                message: "Technician not found"
            });

        }

        const isMatch =
            await bcrypt.compare(
                password,
                technician.password
            );

        if (!isMatch) {

            return res.status(400).json({
                message: "Invalid Password"
            });

        }

        const token = jwt.sign(
            {
                id: technician._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            message: "Login Successful",
            token,
            technician
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
// Get Technician Profile

const getTechnicianProfile = async (req, res) => {

    try {

        const technician = await Technician.findById(
            req.params.id
        );

        if (!technician) {

            return res.status(404).json({
                message: "Technician not found"
            });

        }

        res.status(200).json(technician);

    }

    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
// Update Technician Profile

const updateTechnicianProfile = async (req, res) => {

    try {

        const {
            name,
            phone,
            city,
            experience,
            service,
            address
        } = req.body;

        const updatedTechnician =
            await Technician.findByIdAndUpdate(

                req.params.id,

                {
                    name,
                    phone,
                    city,
                    experience,
                    service,
                    address
                },

                {
                    new: true
                }

            );

        if (!updatedTechnician) {

            return res.status(404).json({

                message: "Technician not found"

            });

        }

        res.status(200).json({

            message: "Profile Updated Successfully",

            technician: updatedTechnician

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

module.exports = {
    registerTechnician,
    loginTechnician,
    getTechnicianProfile,
    updateTechnicianProfile
};