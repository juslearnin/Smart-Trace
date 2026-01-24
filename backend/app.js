const express = require("express");
const dotenv = require("dotenv");

const aggregationRoutes = require("./routes/aggregationRoutes");


// Load environment variables
dotenv.config();

// Import DB connection
const connectDB = require("./utils/database");

const app = express();

// --------------------
// Middleware
// --------------------
app.use(express.json());
app.use("/api/hierarchy", aggregationRoutes);

// --------------------
// Connect to MongoDB
// --------------------
connectDB();

// --------------------
// Routes
// --------------------
const serialRoutes = require("./routes/serialRoutes");
app.use("/api/serials", serialRoutes);
const verificationRoutes = require("./routes/verificationRoutes");
app.use("/api/verify", verificationRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("SmartTrace Backend Running");
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
