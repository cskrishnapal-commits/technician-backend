const Technician = require("../models/Technician");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");


// ======================================================
// HELPER: EXTRACT INDIAN PIN CODE FROM ADDRESS
// ======================================================

const extractPincode = (address) => {

    if (!address) {
        return null;
    }

    // Indian PIN code = 6 digits
    // First digit cannot be 0
    const match =
        address.match(/\b[1-9][0-9]{5}\b/);

    return match
        ? match[0]
        : null;

};


// ======================================================
// HELPER: FORWARD GEOCODING
// ADDRESS -> LATITUDE / LONGITUDE
// ======================================================

const geocodeAddress = async (address, city) => {

    if (!address || !address.trim()) {

        throw new Error(
            "Please provide a service address."
        );

    }


    const cleanAddress =
        address.trim();

    const cleanCity =
        city?.trim() || "";


    // ==================================================
    // EXTRACT PIN CODE
    // ==================================================

    const pincode =
        extractPincode(cleanAddress);


    console.log(
        "Address:",
        cleanAddress
    );

    console.log(
        "Extracted PIN:",
        pincode
    );


    // ==================================================
    // STEP 1: SEARCH USING PIN CODE
    // ==================================================

    if (pincode) {

        const pincodeQueries = [

            // PIN + City
            cleanCity
                ? `${pincode}, ${cleanCity}, Maharashtra, India`
                : `${pincode}, Maharashtra, India`,

            // PIN only
            `${pincode}, India`

        ];


        for (
            const searchAddress
            of pincodeQueries
        ) {

            try {

                console.log(
                    "PIN Geocoding:",
                    searchAddress
                );


                const response =
                    await axios.get(

                        "https://nominatim.openstreetmap.org/search",

                        {

                            params: {

                                q:
                                    searchAddress,

                                format:
                                    "jsonv2",

                                addressdetails:
                                    1,

                                limit:
                                    5,

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
                    response.data &&
                    response.data.length > 0
                ) {

                    for (
                        const result
                        of response.data
                    ) {

                        const latitude =
                            Number(result.lat);

                        const longitude =
                            Number(result.lon);


                        if (

                            Number.isFinite(
                                latitude
                            ) &&

                            Number.isFinite(
                                longitude
                            )

                        ) {

                            console.log(
                                "PIN location found:",
                                latitude,
                                longitude
                            );


                            return {

                                latitude,

                                longitude

                            };

                        }

                    }

                }

            }

            catch (error) {

                console.log(
                    "PIN geocoding failed:",
                    error.message
                );

            }

        }

    }


    // ==================================================
    // STEP 2: FULL ADDRESS SEARCH
    // ==================================================

    const searchQueries = [

        cleanCity
            ? `${cleanAddress}, ${cleanCity}, Maharashtra, India`
            : `${cleanAddress}, Maharashtra, India`,

        cleanCity
            ? `${cleanAddress}, ${cleanCity}, India`
            : `${cleanAddress}, India`,

        `${cleanAddress}, India`

    ];


    for (
        const searchAddress
        of searchQueries
    ) {

        try {

            console.log(
                "Full Address Geocoding:",
                searchAddress
            );


            const response =
                await axios.get(

                    "https://nominatim.openstreetmap.org/search",

                    {

                        params: {

                            q:
                                searchAddress,

                            format:
                                "jsonv2",

                            addressdetails:
                                1,

                            limit:
                                5,

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
                response.data &&
                response.data.length > 0
            ) {

                for (
                    const result
                    of response.data
                ) {

                    const latitude =
                        Number(result.lat);

                    const longitude =
                        Number(result.lon);


                    if (

                        Number.isFinite(
                            latitude
                        ) &&

                        Number.isFinite(
                            longitude
                        )

                    ) {

                        console.log(
                            "Full address location found:",
                            latitude,
                            longitude
                        );


                        return {

                            latitude,

                            longitude

                        };

                    }

                }

            }

        }

        catch (error) {

            console.log(
                "Full address geocoding failed:",
                error.message
            );

        }

    }


    // ==================================================
    // NOTHING FOUND
    // ==================================================

    throw new Error(

        pincode

            ? `Unable to find location for PIN code ${pincode}. Please check the PIN code.`
            
            : "Address location could not be found. Please enter a valid address with a 6-digit PIN code."

    );

};


// ======================================================
// REGISTER TECHNICIAN
// ======================================================

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


        // ==================================================
        // REQUIRED FIELDS
        // ==================================================

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


        // ==================================================
        // CHECK EXISTING EMAIL
        // ==================================================

        const existingTechnician =
            await Technician.findOne({
                email
            });


        if (existingTechnician) {

            return res.status(400).json({

                message:
                    "Email already registered"

            });

        }


        // ==================================================
        // HASH PASSWORD
        // ==================================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ==================================================
        // LOCATION
        // ==================================================

        const lat =
            Number(latitude);

        const lng =
            Number(longitude);


        const validGPSLocation =

            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat !== 0 &&
            lng !== 0;


        let finalLatitude;
        let finalLongitude;


        // ==================================================
        // CASE 1: GPS LOCATION
        // ==================================================

        if (validGPSLocation) {

            finalLatitude =
                lat;

            finalLongitude =
                lng;

        }


        // ==================================================
        // CASE 2: MANUAL ADDRESS
        // ==================================================

        else {

            try {

                const coordinates =
                    await geocodeAddress(
                        address,
                        city
                    );


                finalLatitude =
                    coordinates.latitude;

                finalLongitude =
                    coordinates.longitude;

            }

            catch (error) {

                return res.status(400).json({

                    message:
                        error.message

                });

            }

        }


        // ==================================================
        // CREATE TECHNICIAN
        // ==================================================

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


        // ==================================================
        // REMOVE PASSWORD
        // ==================================================

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


// ======================================================
// LOGIN TECHNICIAN
// ======================================================

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


// ======================================================
// GET TECHNICIAN PROFILE
// ======================================================

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


        // ==================================================
        // UPDATE BASIC INFORMATION
        // ==================================================

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


        // ==================================================
        // LOCATION
        // ==================================================

        const lat =
            Number(latitude);

        const lng =
            Number(longitude);


        const validGPSLocation =

            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat !== 0 &&
            lng !== 0;


        // ==================================================
        // CASE 1: GPS LOCATION
        // ==================================================

        if (validGPSLocation) {

            console.log(
                "Using GPS coordinates:",
                lat,
                lng
            );


            technician.location = {

                type:
                    "Point",

                coordinates: [

                    lng,
                    lat

                ]

            };

        }


        // ==================================================
        // CASE 2: MANUAL ADDRESS
        // ==================================================

        else {

            try {

                console.log(
                    "Manual address detected."
                );


                const coordinates =
                    await geocodeAddress(
                        address,
                        city
                    );


                technician.location = {

                    type:
                        "Point",

                    coordinates: [

                        coordinates.longitude,

                        coordinates.latitude

                    ]

                };


                console.log(
                    "Manual address coordinates:",
                    coordinates
                );

            }

            catch (error) {

                return res.status(400).json({

                    message:
                        error.message

                });

            }

        }


        // ==================================================
        // SAVE
        // ==================================================

        await technician.save();


        // ==================================================
        // RETURN UPDATED TECHNICIAN
        // ==================================================

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


        // ==================================================
        // VALIDATION
        // ==================================================

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


        // ==================================================
        // FIND TECHNICIAN
        // ==================================================

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


        // ==================================================
        // CHECK PASSWORD EXISTS
        // ==================================================

        if (!technician.password) {

            return res.status(500).json({

                message:
                    "Technician password is not available."

            });

        }


        // ==================================================
        // CHECK CURRENT PASSWORD
        // ==================================================

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


        // ==================================================
        // HASH NEW PASSWORD
        // ==================================================

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