const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.get('/register', (req, res) => {
    if (res.locals.currentUser) return res.redirect('/');
    res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match.');
            return res.redirect('/register');
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            req.flash('error', 'Username or email already taken.');
            return res.redirect('/register');
        }

        const user = new User({ username, email, password });
        await user.save();

        req.flash('success', 'Account created! Please log in.');
        res.redirect('/login');
    } catch (err) {
        console.error('❌ Register error:', err.message, err.code || '');
        let message;
        if (err.errors) {
            // Mongoose validation error
            message = Object.values(err.errors).map(e => e.message).join(', ');
        } else if (err.code === 11000) {
            // MongoDB duplicate key (race condition or index mismatch)
            const field = Object.keys(err.keyPattern || {})[0] || 'field';
            message = `That ${field} is already registered. Please use a different one.`;
        } else {
            message = err.message || 'Registration failed. Please try again.';
        }
        req.flash('error', message);
        res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    if (res.locals.currentUser) return res.redirect('/');
    res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        req.flash('success', `Welcome back, ${user.username}!`);
        res.redirect('/');
    } catch (err) {
        req.flash('error', 'Login failed. Please try again.');
        res.redirect('/login');
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    req.flash('success', 'Logged out successfully.');
    res.redirect('/login');
});

module.exports = router;
