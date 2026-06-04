const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");


// Load environment variables
dotenv.config();

// Import DB connection
const connectDB = require("./utils/database");
const { isDbConnected } = require("./utils/dbState");

const app = express();

// --------------------
// Middleware
// --------------------
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
// --------------------
// Connect to MongoDB
// --------------------
connectDB();

// --------------------
// Routes
// --------------------
const aggregationRoutes = require("./routes/aggregationRoutes");
app.use("/api", aggregationRoutes);
const serialRoutes = require("./routes/serialRoutes");
app.use("/api", serialRoutes);
const verificationRoutes = require("./routes/verificationRoutes");
app.use("/api", verificationRoutes);
   // <-- ADD THIS


// Test route
app.get("/", (req, res) => {
  res.send("SmartTrace Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    storage: isDbConnected() ? "mongodb" : "memory"
  });
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
