const Technician = require("../models/Technician");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");


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


        // ==========================================
        // CHECK REQUIRED FIELDS
        // ==========================================

        if (
            !name ||
            !email ||
            !phone ||
            !password ||
            !service ||
            !address
        ) {

            return res.status(400).json({

                message:
                    "Please fill all required fields."

            });

        }


        // ==========================================
        // CHECK EXISTING TECHNICIAN
        // ==========================================

        const existingTechnician =
            await Technician.findOne({ email });


        if (existingTechnician) {

            return res.status(400).json({

                message:
                    "Email already registered"

            });

        }


        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // ==========================================
        // LOCATION
        // ==========================================

        let finalLatitude = null;
        let finalLongitude = null;


        const lat =
            Number(latitude);

        const lng =
            Number(longitude);


        const validGPSLocation =
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat !== 0 &&
            lng !== 0;


        // ==========================================
        // CASE 1: GPS LOCATION PROVIDED
        // ==========================================

        if (validGPSLocation) {

            finalLatitude =
                lat;

            finalLongitude =
                lng;

        }


        // ==========================================
        // CASE 2: MANUAL ADDRESS
        // FORWARD GEOCODING
        // ==========================================

        else {

            try {

                const searchAddress =
                    city && city.trim() !== ""
                        ? `${address}, ${city}, India`
                        : `${address}, India`;


                const response =
                    await axios.get(

                        "https://nominatim.openstreetmap.org/search",

                        {

                            params: {

                                q:
                                    searchAddress,

                                format:
                                    "json",

                                limit:
                                    1,

                                countrycodes:
                                    "in"

                            },

                            headers: {

                                "User-Agent":
                                    "TechnicianWebApp/1.0"

                            },

                            timeout:
                                10000

                        }

                    );


                if (
                    !response.data ||
                    response.data.length === 0
                ) {

                    return res.status(400).json({

                        message:
                            "Unable to find this address. Please enter a more complete address."

                    });

                }


                finalLatitude =
                    Number(
                        response.data[0].lat
                    );


                finalLongitude =
                    Number(
                        response.data[0].lon
                    );


                if (
                    !Number.isFinite(
                        finalLatitude
                    ) ||
                    !Number.isFinite(
                        finalLongitude
                    )
                ) {

                    return res.status(400).json({

                        message:
                            "Unable to get coordinates for this address."

                    });

                }

            }

            catch (geocodeError) {

                console.log(
                    "Registration Forward Geocoding Error:",
                    geocodeError.message
                );


                return res.status(500).json({

                    message:
                        "Unable to convert address into location."

                });

            }

        }


        // ==========================================
        // CREATE TECHNICIAN
        // ==========================================

        const technician =
            await Technician.create({

                name,

                email,

                phone,

                password:
                    hashedPassword,

                service,

                experience,

                age,

                city,

                address,

                location: {

                    type:
                        "Point",

                    coordinates: [

                        finalLongitude,
                        finalLatitude

                    ]

                }

            });


        // ==========================================
        // REMOVE PASSWORD FROM RESPONSE
        // ==========================================

        const technicianResponse =
            await Technician.findById(
                technician._id
            ).select("-password");


        res.status(201).json({

            message:
                "Registration Successful",

            technician:
                technicianResponse

        });

    }

    catch (error) {

        console.log(
            "Register Technician Error:",
            error
        );


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


        // Don't send password

        const technicianResponse =
            await Technician.findById(
                technician._id
            ).select("-password");


        res.status(200).json({

            message:
                "Login Successful",

            token,

            technician:
                technicianResponse

        });

    }

    catch (error) {

        console.log(
            "Login Technician Error:",
            error
        );


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

        console.log(
            "Get Technician Profile Error:",
            error
        );


        res.status(500).json({

            message:
                error.message

        });

    }

};



// ======================================================
// UPDATE TECHNICIAN PROFILE
// ======================================================

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


        const technician =
            await Technician.findById(
                req.params.id
            );


        if (!technician) {

            return res.status(404).json({

                message:
                    "Technician not found"

            });

        }


        // ==========================================
        // UPDATE PROFILE INFORMATION
        // ==========================================

        technician.name =
            name;

        technician.phone =
            phone;

        technician.city =
            city;

        technician.experience =
            experience;

        technician.service =
            service;

        technician.address =
            address;

        technician.age =
            age;


        // ==========================================
        // LOCATION HANDLING
        // ==========================================

        const lat =
            Number(latitude);

        const lng =
            Number(longitude);


        const validGPSLocation =
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat !== 0 &&
            lng !== 0;


        // ==========================================
        // CASE 1: GPS LOCATION
        // ==========================================

        if (validGPSLocation) {

            technician.location = {

                type:
                    "Point",

                coordinates: [

                    lng,
                    lat

                ]

            };

        }


        // ==========================================
        // CASE 2: MANUAL ADDRESS
        // FORWARD GEOCODING
        // ==========================================

        else {

            if (
                !address ||
                address.trim() === ""
            ) {

                return res.status(400).json({

                    message:
                        "Please provide a service address."

                });

            }


            try {

                const searchAddress =
                    city && city.trim() !== ""
                        ? `${address}, ${city}, India`
                        : `${address}, India`;


                const response =
                    await axios.get(

                        "https://nominatim.openstreetmap.org/search",

                        {

                            params: {

                                q:
                                    searchAddress,

                                format:
                                    "json",

                                limit:
                                    1,

                                countrycodes:
                                    "in"

                            },

                            headers: {

                                "User-Agent":
                                    "TechnicianWebApp/1.0"

                            },

                            timeout:
                                10000

                        }

                    );


                // ==========================================
                // ADDRESS NOT FOUND
                // ==========================================

                if (
                    !response.data ||
                    response.data.length === 0
                ) {

                    return res.status(400).json({

                        message:
                            "Unable to find this address. Please enter a more complete address."

                    });

                }


                const geocodedLatitude =
                    Number(
                        response.data[0].lat
                    );


                const geocodedLongitude =
                    Number(
                        response.data[0].lon
                    );


                if (
                    !Number.isFinite(
                        geocodedLatitude
                    ) ||
                    !Number.isFinite(
                        geocodedLongitude
                    )
                ) {

                    return res.status(400).json({

                        message:
                            "Unable to get coordinates for this address."

                    });

                }


                // ==========================================
                // SAVE FORWARD GEOCODED LOCATION
                // ==========================================

                technician.location = {

                    type:
                        "Point",

                    coordinates: [

                        geocodedLongitude,
                        geocodedLatitude

                    ]

                };

            }

            catch (geocodeError) {

                console.log(

                    "Forward Geocoding Error:",

                    geocodeError.message

                );


                return res.status(500).json({

                    message:
                        "Unable to convert address into location."

                });

            }

        }


        // ==========================================
        // SAVE TECHNICIAN
        // ==========================================

        await technician.save();


        // ==========================================
        // RETURN UPDATED TECHNICIAN
        // WITHOUT PASSWORD
        // ==========================================

        const updatedTechnician =
            await Technician.findById(
                technician._id
            ).select("-password");


        res.status(200).json({

            message:
                "Profile Updated Successfully",

            technician:
                updatedTechnician

        });

    }

    catch (error) {

        console.log(

            "Technician Profile Update Error:",

            error

        );


        res.status(500).json({

            message:
                error.message

        });

    }

};



// ======================================================
// CHANGE TECHNICIAN PASSWORD
// ======================================================

const changeTechnicianPassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.status(400).json({

                message:
                    "All password fields are required."

            });

        }


        if (
            newPassword !==
            confirmPassword
        ) {

            return res.status(400).json({

                message:
                    "New password and confirm password do not match."

            });

        }


        if (
            newPassword.length < 6
        ) {

            return res.status(400).json({

                message:
                    "New password must be at least 6 characters."

            });

        }


        // ==========================================
        // FIND TECHNICIAN
        // ==========================================

        const technician =
            await Technician.findById(
                req.params.id
            );


        if (!technician) {

            return res.status(404).json({

                message:
                    "Technician not found."

            });

        }


        // ==========================================
        // CHECK CURRENT PASSWORD
        // ==========================================

        const passwordMatch =
            await bcrypt.compare(

                currentPassword,

                technician.password

            );


        if (!passwordMatch) {

            return res.status(400).json({

                message:
                    "Current password is incorrect."

            });

        }


        // ==========================================
        // HASH NEW PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(

                newPassword,

                10

            );


        technician.password =
            hashedPassword;


        await technician.save();


        res.status(200).json({

            message:
                "Password changed successfully."

        });

    }

    catch (error) {

        console.log(

            "Change Technician Password Error:",

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

    registerTechnician,

    loginTechnician,

    getTechnicianProfile,

    updateTechnicianProfile,

    changeTechnicianPassword

};