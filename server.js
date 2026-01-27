const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 
const Worker = require('./models/Worker'); 

// 1. Initialize App
const app = express();

// 2. Connect DB
connectDB();

// 3. Middleware
app.use(cors()); 
app.use(express.json()); 

// --- ROUTES ---

// GET: Read all workers
app.get('/api/workers', async (req, res) => {
    try {
        const workers = await Worker.find(); 
        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Create a new worker
app.post('/api/workers', async (req, res) => {
    // --- FIX START ---
    // We extract the data sent by React
    const { name, skill, dailyRate, phone, location } = req.body;
    
    // Check if data is missing
    if (!name || !skill || !dailyRate || !phone) {
        return res.status(400).json({ message: "Please fill all fields" });
    }

    try {
        const worker = new Worker({ 
            name, 
            skill, 
            rate: dailyRate, // MAP Frontend 'dailyRate' to Database 'rate'
            phone,
            // Handle location safely (if location exists, use its city, else Unknown)
            location: { city: location?.city || "Unknown" } 
        });
        
        const createdWorker = await worker.save();
        res.status(201).json(createdWorker);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
    // --- FIX END ---
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});