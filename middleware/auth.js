const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            req.flash('error', 'User not found. Please login again.');
            return res.redirect('/login');
        }

        req.user = user;
        res.locals.currentUser = user;
        next();
    } catch (err) {
        req.flash('error', 'Session expired. Please login again.');
        res.clearCookie('token');
        return res.redirect('/login');
    }
};
const setCurrentUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            req.user = user;
            res.locals.currentUser = user;
        } else {
            res.locals.currentUser = null;
        }
    } catch (err) {
        res.locals.currentUser = null;
    }
    next();
};

module.exports = { isLoggedIn, setCurrentUser };
