const express = require("express");

const router = express.Router();

const {

    registerTechnician,
    loginTechnician,
    getTechnicianProfile,
    updateTechnicianProfile,
    changeTechnicianPassword

} = require("../controllers/technicianController");


// ======================================================
// REGISTER
// ======================================================

router.post(
    "/register",
    registerTechnician
);


// ======================================================
// LOGIN
// ======================================================

router.post(
    "/login",
    loginTechnician
);


// ======================================================
// GET PROFILE
// ======================================================

router.get(
    "/profile/:id",
    getTechnicianProfile
);


// ======================================================
// UPDATE PROFILE
// ======================================================

router.put(
    "/profile/:id",
    updateTechnicianProfile
);


// ======================================================
// CHANGE PASSWORD
// ======================================================

router.put(
    "/profile/:id/password",
    changeTechnicianPassword
);


module.exports = router;