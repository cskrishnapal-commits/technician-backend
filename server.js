const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const customerRoutes = require("./routes/customerRoutes");
const technicianRoutes = require("./routes/technicianRoutes");

const app = express();

connectDB();

app.use(cors({
  origin:"*"
}));
app.use(express.json());

app.use("/api/customers", customerRoutes);
app.use("/api/technicians", technicianRoutes);

app.get("/", (req, res) => {
  res.send("Technician Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});