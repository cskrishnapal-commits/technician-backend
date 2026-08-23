const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const customerRoutes = require("./routes/customerRoutes");
const technicianRoutes = require("./routes/technicianRoutes");
const servicePriceRoutes = require("./routes/ServicePriceRoute");

const app = express();

connectDB();

app.use(cors());

app.use(express.json());

app.use("/api/customers", customerRoutes);

app.use("/api/technicians", technicianRoutes);

app.use("/api/service-prices", servicePriceRoutes);

app.get("/", (req, res) => {

    res.send("Technician Backend Running...");

});

const PORT = process.env.PORT ;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});