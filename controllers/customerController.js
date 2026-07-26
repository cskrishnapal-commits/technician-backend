const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

const Technician = require("../models/Technician");

const getAllTechnicians = async (req, res) => {

    try {

        const technicians = await Technician.find(
            {},
            "-password -_id -__v"
        );

        res.status(200).json(technicians);

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