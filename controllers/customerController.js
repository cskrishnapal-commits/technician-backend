const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ServicePrice = require("../models/ServicePrice");

// Register Customer

const registerCustomer = async (req, res) => {

  try {

    const { name, email, phone, password } = req.body;

    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {

      return res.status(400).json({
        message: "Email already registered"
      });

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      name,
      email,
      phone,
      password: hashedPassword
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

// Login Customer

const loginCustomer = async (req, res) => {

  try {

    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });

    if (!customer) {

      return res.status(400).json({
        message: "Customer not found"
      });

    }

    const isMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isMatch) {

      return res.status(400).json({
        message: "Invalid Password"
      });

    }

    const token = jwt.sign(
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

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
// Get All Technicians

const getAllTechnicians = async (req, res) => {

  try {

    const { appliance, problem } = req.query;

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

    const technicians = await Technician.find({

      service: serviceName

    }).select("-password -__v");

    const result = [];

    for (const tech of technicians) {

      const servicePrice = await ServicePrice.findOne({

        technicianId: tech._id,

        appliance,

        problem

      });

      result.push({

        _id: tech._id,

        name: tech.name,

        email: tech.email,

        phone: tech.phone,

        city: tech.city,

        experience: tech.experience,

        service: tech.service,

        address: tech.address,

        price: servicePrice
          ? servicePrice.price
          : "Not Available"

      });

    }

    res.status(200).json(result);

  }

  catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};

module.exports = {
  registerCustomer,
  loginCustomer,
  getAllTechnicians
};