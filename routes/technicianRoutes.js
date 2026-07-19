const express = require("express");

const router = express.Router();

const {
    registerTechnician,
    loginTechnician
} = require("../controllers/technicianController");

router.post(
    "/register",
    registerTechnician
);

router.post(
    "/login",
    loginTechnician
);

module.exports = router;