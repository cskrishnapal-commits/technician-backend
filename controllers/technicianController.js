const Technician = require("../models/Technician");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ==========================================
// REGISTER TECHNICIAN
// ==========================================

const registerTechnician = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password,
            service,
            experience,
            age,
            city,
            address,
            latitude,
            longitude
        } = req.body;


        // Check existing technician
        const existingTechnician =
            await Technician.findOne({ email });


        if (existingTechnician) {

            return res.status(400).json({
                message: "Email already registered"
            });

        }


        // Check location
        if (
            latitude === undefined ||
            longitude === undefined ||
            isNaN(Number(latitude)) ||
            isNaN(Number(longitude))
        ) {

            return res.status(400).json({
                message:
                    "Please provide a valid location"
            });

        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create technician
        const technician =
            await Technician.create({

                name,

                email,

                phone,

                password: hashedPassword,

                service,

                experience,

                age,

                city,

                address,

                location: {

                    type: "Point",

                    coordinates: [

                        Number(longitude),

                        Number(latitude)

                    ]

                }

            });


        res.status(201).json({

            message:
                "Registration Successful",

            technician

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                error.message

        });

    }

};


// ==========================================
// LOGIN TECHNICIAN
// ==========================================

const loginTechnician = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        const technician =
            await Technician.findOne({
                email
            });


        if (!technician) {

            return res.status(400).json({

                message:
                    "Technician not found"

            });

        }


        const isMatch =
            await bcrypt.compare(

                password,

                technician.password

            );


        if (!isMatch) {

            return res.status(400).json({

                message:
                    "Invalid Password"

            });

        }


        const token =
            jwt.sign(

                {
                    id:
                        technician._id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "7d"
                }

            );


        res.status(200).json({

            message:
                "Login Successful",

            token,

            technician

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                error.message

        });

    }

};


// ==========================================
// GET TECHNICIAN PROFILE
// ==========================================

const getTechnicianProfile = async (req, res) => {

    try {

        const technician =
            await Technician.findById(
                req.params.id
            ).select("-password");


        if (!technician) {

            return res.status(404).json({

                message:
                    "Technician not found"

            });

        }


        res.status(200).json(
            technician
        );

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                error.message

        });

    }

};


// ==========================================
// UPDATE TECHNICIAN PROFILE
// ==========================================

const updateTechnicianProfile = async (req, res) => {

    try {

        const {
            name,
            phone,
            city,
            experience,
            service,
            address,
            age,
            latitude,
            longitude
        } = req.body;


        // Check location
        if (
            latitude === undefined ||
            longitude === undefined ||
            isNaN(Number(latitude)) ||
            isNaN(Number(longitude))
        ) {

            return res.status(400).json({

                message:
                    "Please provide a valid location"

            });

        }


        const updatedTechnician =
            await Technician.findByIdAndUpdate(

                req.params.id,

                {

                    name,

                    phone,

                    city,

                    experience,

                    service,

                    address,

                    age,


                    // Save updated location
                    location: {

                        type: "Point",

                        coordinates: [

                            Number(longitude),

                            Number(latitude)

                        ]

                    }

                },

                {

                    new: true,

                    runValidators: true

                }

            ).select("-password");


        if (!updatedTechnician) {

            return res.status(404).json({

                message:
                    "Technician not found"

            });

        }


        res.status(200).json({

            message:
                "Profile Updated Successfully",

            technician:
                updatedTechnician

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                error.message

        });

    }

};


module.exports = {

    registerTechnician,

    loginTechnician,

    getTechnicianProfile,

    updateTechnicianProfile

};