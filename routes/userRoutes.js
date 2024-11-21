const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Test = require('../models/Test');

// Registration
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.redirect('/user/login');
    } catch (err) {
        res.status(400).send('Error creating user');
    }
});

// Login
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        req.session.user = user;
        res.redirect('/user/dashboard');
    } else {
        res.status(400).send('Invalid credentials');
    }
});

// Dashboard
router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }
    res.render('dashboard', { user: req.session.user });
});

// Logout Route
router.get('/logout', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        // Redirect to the login page or homepage after successful logout
        res.redirect('/user/login');
    });
});


module.exports = router;
