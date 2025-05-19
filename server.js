const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
require('dotenv').config();

const app = express();

// Security middleware - order matters!
app.use(express.json()); // Parse JSON bodies first
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors({
    origin: '*', // In production, replace with your actual domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginEmbedderPolicy: false // Disable COEP for development
}));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// MongoDB connection with detailed logging
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume-generator', {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    family: 4 // Use IPv4, skip trying IPv6
})
.then(() => {
    console.log('Successfully connected to MongoDB.');
    console.log('Connection URI:', process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume-generator');
})
.catch(err => {
    console.error('MongoDB connection error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: err.stack
    });
    process.exit(1); // Exit if we can't connect to the database
});

// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    resumes: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        lastModified: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });
        
        if (!user) {
            throw new Error();
        }
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate.' });
    }
};

// Serve static files from root directory
app.use(express.static(__dirname));

// Move API routes after static file serving
app.post('/api/register', async (req, res) => {
    console.log('Register request received:', req.body);
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        if (!validator.isEmail(email)) {
            console.log('Invalid email format:', email);
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        if (password.length < 8) {
            console.log('Password too short');
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({
            email,
            password: hashedPassword
        });
        
        await user.save();
        console.log('User created successfully:', email);
        
        // Generate token
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        
        res.status(201).json({ user: { email: user.email }, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    console.log('Login request received:', req.body);
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        console.log('Login successful for user:', email);
        // Generate token
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        
        res.json({ user: { email: user.email }, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Protected routes
app.get('/api/resumes', auth, async (req, res) => {
    try {
        console.log('Fetching resumes for user:', req.user.email);
        // Ensure we're sending the full resume objects with their IDs
        const resumes = req.user.resumes.map(resume => ({
            _id: resume._id,
            name: resume.name,
            content: resume.content,
            lastModified: resume.lastModified
        }));
        res.json({ resumes });
    } catch (error) {
        console.error('Error fetching resumes:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/resumes/:id', auth, async (req, res) => {
    try {
        console.log('Fetching resume:', req.params.id, 'for user:', req.user.email);
        
        // Use findOne to search in the resumes array
        const resume = req.user.resumes.find(r => r._id.toString() === req.params.id);
        
        if (!resume) {
            console.log('Resume not found:', req.params.id);
            return res.status(404).json({ error: 'Resume not found' });
        }
        
        res.json(resume);
    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/resumes', auth, async (req, res) => {
    try {
        const { name, content } = req.body;
        console.log('Saving resume:', name, 'for user:', req.user.email);
        
        if (!name || !content) {
            console.log('Missing name or content');
            return res.status(400).json({ error: 'Name and content are required' });
        }
        
        // Create a new resume with explicit _id
        const resume = {
            _id: new mongoose.Types.ObjectId(),
            name,
            content,
            lastModified: new Date()
        };
        
        req.user.resumes.push(resume);
        await req.user.save();
        console.log('Resume saved successfully with ID:', resume._id);
        
        res.status(201).json({ message: 'Resume saved successfully', resume });
    } catch (error) {
        console.error('Error saving resume:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/resumes/:id', auth, async (req, res) => {
    try {
        console.log('Deleting resume:', req.params.id, 'for user:', req.user.email);
        
        // Find the index of the resume in the array
        const resumeIndex = req.user.resumes.findIndex(r => r._id.toString() === req.params.id);
        
        if (resumeIndex === -1) {
            console.log('Resume not found:', req.params.id);
            return res.status(404).json({ error: 'Resume not found' });
        }
        
        // Remove the resume from the array
        req.user.resumes.splice(resumeIndex, 1);
        await req.user.save();
        console.log('Resume deleted successfully');
        
        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 