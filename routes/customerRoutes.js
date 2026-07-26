const express = require("express");

const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  getAllTechnicians,
  getCustomerProfile,
  updateCustomerProfile
} = require("../controllers/customerController");

router.post("/register", registerCustomer);

router.post("/login", loginCustomer);

router.get("/technicians", getAllTechnicians);

router.get("/profile/:id",getCustomerProfile);

router.put("/profile/:id",updateCustomerProfile);

module.exports = router;