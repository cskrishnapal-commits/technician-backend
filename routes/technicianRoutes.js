const express = require("express");

const router = express.Router();

const {
    registerTechnician,
    loginTechnician,
    getTechnicianProfile,
    updateTechnicianProfile
} = require("../controllers/technicianController");

router.post(
    "/register",
    registerTechnician
);

router.post(
    "/login",
    loginTechnician
);

router.get(
    "/profile/:id",
    getTechnicianProfile
);

router.put(
    "/profile/:id",
    updateTechnicianProfile
);

module.exports = router;