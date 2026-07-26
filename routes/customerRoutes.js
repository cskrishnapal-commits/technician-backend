const express = require("express");

const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  getAllTechnicians
} = require("../controllers/customerController");

router.post("/register", registerCustomer);

router.post("/login", loginCustomer);
router.get(
    "/technicians",
    getAllTechnicians
);

module.exports = router;