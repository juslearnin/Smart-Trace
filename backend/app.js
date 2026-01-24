require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./util/database');

const app = express();

// 1. View Engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// 2. Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Added for JSON API support
app.use(express.static(path.join(__dirname, 'public')));

// 3. Routes (Importing the files we created)
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// 4. Start Server
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SmartTrace Server running on http://localhost:${PORT}`);
  });
});