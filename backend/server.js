const express = require('express');
const dotenv = require('dotenv');
const candidateRoutes = require('./routes/candidateRoutes');
const app = express();
const connectDB = require('./config/db');
const cors = require('cors'); 

dotenv.config();
connectDB();


const PORT = process.env.PORT
app.use(cors()); 
app.use(express.json());
app.use('/api/candidates', candidateRoutes);

// Listen on port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
